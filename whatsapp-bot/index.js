/**
 * ==============================================================================
 * Corevix Technology WhatsApp Automated AI Business Bot
 * Target Phone Number: +91 92432 38242 (from website)
 * ==============================================================================
 * Supports:
 * 1. Direct WhatsApp Pairing Code (Recommended - type 8-digit code on phone)
 * 2. Terminal ASCII QR Code (Scan with WhatsApp -> Linked Devices)
 * 3. Interactive Service Menu & Smart Lead Qualification
 * 4. Generative AI Architectural Q&A (Google Gemini + Fallback Knowledge Engine)
 * 5. Direct Supabase Consultation Database Sync & Email Notifications
 * 6. Human Handoff (pauses bot so human on +91 92432 38242 can chat freely)
 * 7. Owner Remote Commands (!status, !leads, !pause, !resume)
 * ==============================================================================
 */

require('dotenv').config();
const path = require('path');
const fs = require('fs');
const pino = require('pino');
const qrcode = require('qrcode-terminal');
const {
    default: makeWASocket,
    useMultiFileAuthState,
    DisconnectReason,
    fetchLatestBaileysVersion,
    makeCacheableSignalKeyStore,
    Browsers
} = require('@whiskeysockets/baileys');

const { askAI } = require('./ai-assistant');
const { saveWhatsAppLead, getRecentLeads } = require('./lead-manager');

// Target Phone Number used across Corevix Technology website (+91 92432 38242)
const TARGET_PHONE_NUMBER = (process.env.WHATSAPP_BOT_PHONE_NUMBER || '919243238242').replace(/\D/g, '');
const SESSION_DIR = path.join(__dirname, 'session');

// Check CLI arguments for mode: --mode=pairing (default) or --mode=qr
const args = process.argv.slice(2);
const isQrModeExplicit = args.includes('--mode=qr');

// In-memory conversation state store
const userSessions = new Map();

// Bot runtime statistics
const botStats = {
    startTime: Date.now(),
    messagesReceived: 0,
    messagesSent: 0,
    leadsCaptured: 0,
    activeChats: new Set()
};

// Global socket reference
let currentSock = null;
let isConnecting = false;
let pairingCodeRequested = false;

// Create session directory if missing
if (!fs.existsSync(SESSION_DIR)) {
    try { fs.mkdirSync(SESSION_DIR, { recursive: true }); } catch (e) {}
}

/**
 * Interactive Service Menu Message
 */
function getWelcomeMenuMessage(pushName = '') {
    const greeting = pushName ? `Hello *${pushName}*!` : 'Hello!';
    return `${greeting} 👋 Welcome to *Corevix Technology*! 🚀\n` +
           `_(Formerly Trade Amplification | corevixtechnology.com)_\n\n` +
           `We engineer bespoke software, high-performance SaaS platforms, and enterprise AI workflows with *100% Source Code & IP Ownership*.\n\n` +
           `*How can we assist you today?* Reply with a number:\n\n` +
           `1️⃣ *Custom Software & Enterprise ERP/CRM*\n` +
           `2️⃣ *FinTech & SaaS Platforms (Payment Rails, Billing, APIs)*\n` +
           `3️⃣ *AI Workflow Automation & Autonomous Agents*\n` +
           `4️⃣ *Web & Mobile App Development (React, Flutter, Node)*\n` +
           `5️⃣ *📅 Book a Free Technical Consultation*\n` +
           `6️⃣ *👨‍💻 Speak with a Human Engineer / Representative*\n\n` +
           `_💡 Or type any question directly in English or Hindi!_`;
}

/**
 * Handle Owner / Admin Commands (from +91 92432 38242 or self)
 */
async function handleOwnerCommand(sock, senderJid, text) {
    const parts = text.trim().split(' ');
    const command = parts[0].toLowerCase();
    const arg = parts.slice(1).join(' ').trim();

    if (command === '!status') {
        const uptimeHours = ((Date.now() - botStats.startTime) / 3600000).toFixed(1);
        const reply = `🤖 *Corevix WhatsApp Bot Status*\n\n` +
                      `• Target Number: +${TARGET_PHONE_NUMBER}\n` +
                      `• Uptime: ${uptimeHours} hours\n` +
                      `• Active Contacts Handled: ${botStats.activeChats.size}\n` +
                      `• Messages Processed: ${botStats.messagesReceived}\n` +
                      `• Messages Sent: ${botStats.messagesSent}\n` +
                      `• Leads Captured: ${botStats.leadsCaptured}\n` +
                      `• Supabase DB: ${process.env.SUPABASE_URL ? 'Connected ✅' : 'Local JSON Mode ⚠️'}\n` +
                      `• AI Engine: ${process.env.GEMINI_API_KEY ? 'Gemini 1.5/2.0 Flash 🚀' : 'Corevix Fallback Engine 🛡️'}`;
        await sock.sendMessage(senderJid, { text: reply });
        return true;
    }

    if (command === '!leads') {
        const leads = getRecentLeads(5);
        if (!leads || leads.length === 0) {
            await sock.sendMessage(senderJid, { text: '📋 No leads recorded yet.' });
            return true;
        }
        let reply = `📋 *Last ${leads.length} Captured Leads:*\n\n`;
        leads.forEach((l, idx) => {
            reply += `${idx + 1}. *${l.name}* (+${l.phone})\n   • Service: ${l.service}\n   • Notes: ${l.details || 'N/A'}\n   • Time: ${new Date(l.created_at || Date.now()).toLocaleTimeString()}\n\n`;
        });
        await sock.sendMessage(senderJid, { text: reply });
        return true;
    }

    if (command === '!pause') {
        const targetClean = arg.replace(/\D/g, '');
        if (!targetClean) {
            await sock.sendMessage(senderJid, { text: '⚠️ Usage: !pause <phone_number> (e.g. !pause 9876543210)' });
            return true;
        }
        const targetJid = `${targetClean}@s.whatsapp.net`;
        const session = userSessions.get(targetJid) || { history: [] };
        session.pausedUntil = Date.now() + 4 * 3600000; // Pause for 4 hours
        userSessions.set(targetJid, session);
        await sock.sendMessage(senderJid, { text: `⏸️ Bot auto-reply paused for +${targetClean} for 4 hours.` });
        return true;
    }

    if (command === '!resume') {
        const targetClean = arg.replace(/\D/g, '');
        if (!targetClean) {
            await sock.sendMessage(senderJid, { text: '⚠️ Usage: !resume <phone_number>' });
            return true;
        }
        const targetJid = `${targetClean}@s.whatsapp.net`;
        const session = userSessions.get(targetJid) || { history: [] };
        session.pausedUntil = 0;
        session.stage = 'IDLE';
        userSessions.set(targetJid, session);
        await sock.sendMessage(senderJid, { text: `▶️ Bot auto-reply resumed for +${targetClean}.` });
        return true;
    }

    if (command === '!help') {
        const reply = `🛠️ *Corevix WhatsApp Bot Admin Commands*\n\n` +
                      `• *!status* - Check bot uptime, memory, and stats\n` +
                      `• *!leads* - View recent client inquiries\n` +
                      `• *!pause <number>* - Mute bot for a customer\n` +
                      `• *!resume <number>* - Unmute bot for a customer\n` +
                      `• *!help* - Show this menu`;
        await sock.sendMessage(senderJid, { text: reply });
        return true;
    }

    return false;
}

/**
 * Handle incoming client message
 */
async function handleClientMessage(sock, msg, senderJid, rawText) {
    const text = rawText.trim();
    const pushName = msg.pushName || '';
    const cleanPhone = senderJid.replace('@s.whatsapp.net', '');

    botStats.messagesReceived++;
    botStats.activeChats.add(senderJid);

    // Retrieve or initialize session state
    let session = userSessions.get(senderJid);
    if (!session) {
        session = {
            stage: 'IDLE',
            pausedUntil: 0,
            history: [],
            lastInteraction: Date.now(),
            leadData: {}
        };
        userSessions.set(senderJid, session);
    }
    session.lastInteraction = Date.now();

    // Check if bot is temporarily paused for human agent conversation
    if (session.pausedUntil && Date.now() < session.pausedUntil) {
        // Allow user to manually unpause by typing #bot or #menu
        if (text.toLowerCase() === '#bot' || text.toLowerCase() === '#menu' || text.toLowerCase() === 'menu') {
            session.pausedUntil = 0;
            session.stage = 'IDLE';
            await sock.sendMessage(senderJid, { text: '🤖 Bot auto-reply reactivated!' });
        } else {
            // Suppress bot so human can chat
            return;
        }
    }

    const lower = text.toLowerCase();

    // Option 6 / Human Request
    if (text === '6' || lower.includes('human') || lower.includes('specialist') || lower.includes('call me') || lower.includes('agent') || lower.includes('executive')) {
        session.pausedUntil = Date.now() + 2 * 3600000; // 2 hour human pause
        session.stage = 'HUMAN_PAUSED';

        const reply = `👨‍💻 *Connecting with our Lead Engineer...*\n\n` +
                      `We have notified our senior engineering team at *+91 92432 38242*.\n` +
                      `A representative will review this chat and message you directly here shortly!\n\n` +
                      `_ℹ️ (Automated bot responses are paused for this chat. Type *#bot* anytime to resume automated assistant.)_`;

        await sock.sendMessage(senderJid, { text: reply });
        botStats.messagesSent++;
        return;
    }

    // Greeting or initial menu trigger
    if (session.stage === 'IDLE' && (lower === 'hi' || lower === 'hello' || lower === 'hey' || lower === 'start' || lower === 'menu' || lower === 'help' || lower === 'namaste')) {
        session.stage = 'MENU_SENT';
        const welcome = getWelcomeMenuMessage(pushName);
        await sock.sendMessage(senderJid, { text: welcome });
        botStats.messagesSent++;
        return;
    }

    // Option 1: Custom Software & ERP
    if (text === '1' || lower === 'custom software' || lower === 'erp') {
        session.stage = 'AWAITING_PROJECT_DETAILS';
        session.selectedService = 'Custom Software & Enterprise ERP/CRM';

        const reply = `💻 *Corevix Custom Software & ERP Engineering:*\n\n` +
                      `• *Zero Per-Seat Fees*: Complete 100% intellectual property & source code handover.\n` +
                      `• *Custom Workflows*: Built around your exact business logic (Inventory, Billing, Production, HRMS).\n` +
                      `• *Modern Architecture*: Node.js/Go backend, React/Next.js frontend, PostgreSQL/Supabase database.\n` +
                      `• *Integrations*: Payment gateways (Razorpay, Stripe), Tally sync, SMS, and WhatsApp APIs.\n\n` +
                      `*What type of software or ERP are you looking to build?* Please share a brief outline, or reply *5* to book a free consultation call.`;

        await sock.sendMessage(senderJid, { text: reply });
        botStats.messagesSent++;
        return;
    }

    // Option 2: FinTech & SaaS Platforms
    if (text === '2' || lower === 'fintech' || lower === 'saas' || lower === 'software') {
        session.stage = 'AWAITING_PROJECT_DETAILS';
        session.selectedService = 'FinTech & SaaS Platforms';

        const reply = `💳 *Corevix FinTech & SaaS Platforms:*\n\n` +
                      `• *Payment Gateways & Rails*: Custom Stripe, Razorpay, and enterprise banking API integrations.\n` +
                      `• *Multi-Tenant SaaS Engines*: Scalable subscription billing, metering pipelines, and tenant isolation.\n` +
                      `• *High-Throughput Financial APIs*: Ledger synchronization, transaction reconciliation, and sub-millisecond data pipelines.\n` +
                      `• *Security & Compliance*: PCI-DSS readiness, end-to-end encryption, and role-based audit logging.\n\n` +
                      `*What type of SaaS or FinTech platform are you building?* Reply with details or *5* to book a scoping call.`;

        await sock.sendMessage(senderJid, { text: reply });
        botStats.messagesSent++;
        return;
    }

    // Option 3: AI Automation & Agents
    if (text === '3' || lower === 'ai' || lower === 'automation') {
        session.stage = 'AWAITING_PROJECT_DETAILS';
        session.selectedService = 'AI Automation & Autonomous Agents';

        const reply = `🤖 *Corevix AI Automation Practice:*\n\n` +
                      `• *Autonomous AI Agents*: Custom agents integrated with company CRM, databases, and APIs.\n` +
                      `• *Intelligent WhatsApp Bots*: 24/7 client qualifying & lead generation bots.\n` +
                      `• *Document & Invoice OCR*: Automated extraction of PDF invoices, receipts, and bank statements.\n` +
                      `• *Private RAG (Knowledge Retrieval)*: Train private AI on your internal knowledge base with zero data leakage.\n\n` +
                      `What repetitive process would you like to automate with AI? Reply with your workflow or *5* to schedule a demo.`;

        await sock.sendMessage(senderJid, { text: reply });
        botStats.messagesSent++;
        return;
    }

    // Option 4: Web & Mobile App Development
    if (text === '4' || lower === 'web' || lower === 'mobile' || lower === 'app') {
        session.stage = 'AWAITING_PROJECT_DETAILS';
        session.selectedService = 'Web & Mobile App Development';

        const reply = `📱 *Corevix Web & Mobile Engineering:*\n\n` +
                      `• *Web Applications*: High-speed, responsive applications built with Next.js, React, Tailwind CSS, Node.js.\n` +
                      `• *Mobile Apps*: Cross-platform iOS & Android applications using Flutter and React Native with native performance.\n` +
                      `• *SaaS Products*: Multi-tenant architecture, automated subscription billing, user role permissions.\n` +
                      `• *Rapid MVP*: Production-ready prototype launched in 2 to 4 weeks.\n\n` +
                      `Share your app idea or reply *5* to talk directly with our lead architect.`;

        await sock.sendMessage(senderJid, { text: reply });
        botStats.messagesSent++;
        return;
    }

    // Option 5: Book Consultation Flow Trigger
    if (text === '5' || lower.includes('consultation') || lower.includes('meeting') || lower.includes('call book')) {
        session.stage = 'AWAITING_CONSULTATION_INFO';
        const reply = `📅 *Schedule a Free Consultation with Corevix Engineering*\n\n` +
                      `Please reply in one message with:\n` +
                      `1. *Your Name*\n` +
                      `2. *Email Address* (for calendar invite)\n` +
                      `3. *Brief Project Description / Requirements*\n\n` +
                      `_Example:_\n` +
                      `*Vikram, vikram@gmail.com, Need a custom SaaS platform for invoicing and customer billing*`;

        await sock.sendMessage(senderJid, { text: reply });
        botStats.messagesSent++;
        return;
    }

    // If waiting for consultation information
    if (session.stage === 'AWAITING_CONSULTATION_INFO' || session.stage === 'AWAITING_PROJECT_DETAILS') {
        // Attempt to parse or capture inquiry details
        const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
        const detectedEmail = emailMatch ? emailMatch[0] : '';
        const detectedName = pushName || text.split(/,|\n/)[0].trim().substring(0, 40);

        try {
            await saveWhatsAppLead({
                name: detectedName,
                phone: cleanPhone,
                email: detectedEmail,
                service: session.selectedService || 'WhatsApp General Scoping',
                details: text,
                senderJid: senderJid
            });
            botStats.leadsCaptured++;

            const confirmation = `✅ *Thank you, ${detectedName}! Your request has been confirmed.* 🚀\n\n` +
                                 `• *WhatsApp*: +${cleanPhone}\n` +
                                 `• *Service*: ${session.selectedService || 'Technical Scoping'}\n` +
                                 `• *Lead Engineer*: Assigned from *+91 92432 38242*\n\n` +
                                 `Our engineering team is reviewing your project details. We will message or call you back within *2 to 4 business hours*.\n\n` +
                                 `_Need immediate assistance? Call us directly at +91 92432 38242 or email info@corevixtechnology.com._`;

            await sock.sendMessage(senderJid, { text: confirmation });
            botStats.messagesSent++;
            session.stage = 'IDLE';
            return;
        } catch (e) {
            console.error('Lead save error:', e.message);
        }
    }

    // Fallback to Conversational AI Assistant (Gemini / Knowledge Base)
    // Add user message to history
    session.history.push({ role: 'user', text: text });
    if (session.history.length > 8) session.history = session.history.slice(-8);

    try {
        const aiResponse = await askAI(text, session.history);
        session.history.push({ role: 'model', text: aiResponse });

        const formattedReply = `${aiResponse}\n\n` +
                               `───────────────\n` +
                               `_Reply *5* to book a free consultation or *6* to speak with our human engineer!_`;

        await sock.sendMessage(senderJid, { text: formattedReply });
        botStats.messagesSent++;
    } catch (err) {
        console.error('AI assistant processing error:', err.message);
        await sock.sendMessage(senderJid, {
            text: getWelcomeMenuMessage(pushName)
        });
        botStats.messagesSent++;
    }
}

function clearSessionDir() {
    try {
        if (fs.existsSync(SESSION_DIR)) {
            const files = fs.readdirSync(SESSION_DIR);
            for (const file of files) {
                try { fs.unlinkSync(path.join(SESSION_DIR, file)); } catch (e) {}
            }
            console.log('🧹 Cleaned corrupted/old session files.');
        }
    } catch (e) {
        console.warn('Could not clean session directory:', e.message);
    }
}

/**
 * Initialize and start WhatsApp Bot connection
 */
async function startWhatsAppBot() {
    if (isConnecting) return;
    isConnecting = true;

    console.log('\n======================================================');
    console.log('⚡ [COREVIX WHATSAPP BOT] INITIALIZING CONNECTION ENGINE');
    console.log(`📱 TARGET WEBSITE PHONE NUMBER: +${TARGET_PHONE_NUMBER}`);
    console.log('======================================================\n');

    try {
        const { state, saveCreds } = await useMultiFileAuthState(SESSION_DIR);
        const { version, isLatest } = await fetchLatestBaileysVersion();

        console.log(`Using Baileys version: ${version.join('.')} (isLatest: ${isLatest})`);

        const sock = makeWASocket({
            version,
            logger: pino({ level: 'silent' }), // Suppress internal socket noise
            printQRInTerminal: isQrModeExplicit,
            auth: {
                creds: state.creds,
                keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'silent' }))
            },
            browser: Browsers.ubuntu('Chrome'),
            connectTimeoutMs: 60000,
            defaultQueryTimeoutMs: 0,
            keepAliveIntervalMs: 25000,
            emitOwnEvents: false,
            syncFullHistory: false,
            generateHighQualityLinkPreview: true
        });

        currentSock = sock;

        // Pairing Code Flow (Default if not registered and not in explicit QR mode)
        if (!sock.authState.creds.registered && !isQrModeExplicit && !pairingCodeRequested) {
            pairingCodeRequested = true;
            console.log(`⏳ Requesting WhatsApp Pairing Code for +${TARGET_PHONE_NUMBER}...`);

            setTimeout(async () => {
                try {
                    const pairingCode = await sock.requestPairingCode(TARGET_PHONE_NUMBER);
                    console.log('\n═══════════════════════════════════════════════════════════');
                    console.log(`  📱 WHATSAPP PAIRING CODE FOR +${TARGET_PHONE_NUMBER}:`);
                    console.log(`  👉  \x1b[1m\x1b[32m${pairingCode}\x1b[0m  👈`);
                    console.log('═══════════════════════════════════════════════════════════');
                    console.log('\nHOW TO CONNECT YOUR PHONE (+91 92432 38242):');
                    console.log('1. Open WhatsApp on the phone with number +91 92432 38242');
                    console.log('2. Tap Settings (or 3 dots at top-right) -> Linked Devices');
                    console.log('3. Tap "Link a Device"');
                    console.log('4. Tap "Link with phone number instead" at the bottom of screen');
                    console.log(`5. Enter the code above: ${pairingCode}`);
                    console.log('═══════════════════════════════════════════════════════════\n');
                } catch (codeErr) {
                    console.error('⚠️ Could not obtain pairing code automatically:', codeErr.message);
                    console.log('💡 Tip: You can also link instantly with QR Code: npm run bot:qr\n');
                }
            }, 4500);
        }

        // Connection Lifecycle Events
        sock.ev.on('connection.update', async (update) => {
            const { connection, lastDisconnect, qr } = update;

            if (qr && isQrModeExplicit) {
                console.log('\nScan this QR code in WhatsApp on +91 92432 38242 (Linked Devices):\n');
                qrcode.generate(qr, { small: true });
            }

            if (connection === 'close') {
                isConnecting = false;
                const statusCode = lastDisconnect?.error?.output?.statusCode;
                console.log(`⚠️ WhatsApp connection closed. Reason Code: ${statusCode}`);

                const isRegistered = sock.authState.creds.registered;

                if (!isRegistered) {
                    // Pre-registration disconnect (408 timeout or 401 unauth)
                    // Auto-wipe partial keys to prevent corrupted session loop
                    clearSessionDir();
                    pairingCodeRequested = false;
                    console.log('🔄 Session reset for fresh pairing. Reconnecting in 6 seconds...');
                    setTimeout(startWhatsAppBot, 6000);
                    return;
                }

                // If already registered and disconnected, auto-reconnect
                const shouldReconnect = statusCode !== DisconnectReason.loggedOut;
                if (shouldReconnect) {
                    console.log('🔄 Reconnecting in 5 seconds...');
                    setTimeout(startWhatsAppBot, 5000);
                } else {
                    console.log('🛑 Logged out from WhatsApp. Resetting session...');
                    clearSessionDir();
                }
            } else if (connection === 'open') {
                isConnecting = false;
                pairingCodeRequested = false;
                console.log('\n======================================================');
                console.log('✅ [COREVIX WHATSAPP BOT ONLINE & ACTIVE]');
                console.log(`📞 CONNECTED AS: +${TARGET_PHONE_NUMBER}`);
                console.log('💬 Auto-replies, AI Architect, and Lead Capture ready!');
                console.log('======================================================\n');
            }
        });

        // Persist session credentials
        sock.ev.on('creds.update', saveCreds);

        // Incoming Messages Handler
        sock.ev.on('messages.upsert', async ({ messages, type }) => {
            try {
                if (type !== 'notify' && type !== 'append') return;

                for (const msg of messages) {
                    if (!msg.message) continue;

                    const senderJid = msg.key.remoteJid;
                    if (!senderJid || senderJid === 'status@broadcast') continue;

                    // Extract text message content
                    const text = (
                        msg.message.conversation ||
                        msg.message.extendedTextMessage?.text ||
                        msg.message.buttonsResponseMessage?.selectedButtonId ||
                        msg.message.listResponseMessage?.singleSelectReply?.selectedRowId ||
                        ''
                    ).trim();

                    if (!text) continue;

                    const isFromMe = msg.key.fromMe;
                    const cleanSender = senderJid.replace('@s.whatsapp.net', '');
                    const isOwner = isFromMe || cleanSender === TARGET_PHONE_NUMBER;

                    // Check for Admin / Owner command
                    if (isOwner && text.startsWith('!')) {
                        await handleOwnerCommand(sock, senderJid, text);
                        continue;
                    }

                    // Skip outgoing bot messages
                    if (isFromMe) continue;

                    // Ignore groups for 1-on-1 customer service
                    if (senderJid.endsWith('@g.us')) continue;

                    // Process client inquiry
                    await handleClientMessage(sock, msg, senderJid, text);
                }
            } catch (err) {
                console.error('[WhatsApp Message Processing Error]:', err);
            }
        });

    } catch (err) {
        isConnecting = false;
        console.error('Fatal WhatsApp Bot Initialization Error:', err);
        setTimeout(startWhatsAppBot, 7000);
    }
}

// Controller API export for Express integration or script execution
module.exports = {
    startWhatsAppBot,
    getBotStatus: () => ({
        connected: !!currentSock?.user,
        targetPhone: TARGET_PHONE_NUMBER,
        stats: botStats
    }),
    TARGET_PHONE_NUMBER
};

// If run directly from terminal: node whatsapp-bot/index.js
if (require.main === module) {
    startWhatsAppBot();
}
