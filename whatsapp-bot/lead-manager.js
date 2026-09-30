/**
 * Corevix Technology WhatsApp Lead & Consultation Manager
 * Synchronizes incoming WhatsApp inquiries with Supabase DB & Email Alerts
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
const nodemailer = require('nodemailer');

const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_KEY || '';
let supabase = null;

if (SUPABASE_URL && SUPABASE_KEY && SUPABASE_URL.startsWith('http')) {
    try {
        supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
    } catch (e) {
        console.warn('[WhatsApp LeadManager] Supabase init warning:', e.message);
    }
}

const dataDir = path.join(__dirname, '..', 'data');
const consultationsFile = path.join(dataDir, 'consultations.json');

if (!fs.existsSync(dataDir)) {
    try { fs.mkdirSync(dataDir, { recursive: true }); } catch (e) {}
}

const readConsultations = () => {
    try {
        if (!fs.existsSync(consultationsFile)) return [];
        return JSON.parse(fs.readFileSync(consultationsFile, 'utf8') || '[]');
    } catch (e) {
        return [];
    }
};

const writeConsultations = (data) => {
    try {
        fs.writeFileSync(consultationsFile, JSON.stringify(data, null, 2));
    } catch (e) {
        console.error('[WhatsApp LeadManager] Write error:', e);
    }
};

const sendEmailAlert = async (subject, textContent) => {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) return;
    try {
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || 'smtp.gmail.com',
            port: parseInt(process.env.SMTP_PORT) || 587,
            secure: false,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            }
        });

        await transporter.sendMail({
            from: `"Corevix WhatsApp Bot" <${process.env.SMTP_USER}>`,
            to: process.env.NOTIFICATION_EMAIL || 'info@corevixtechnology.com',
            subject: subject,
            text: textContent
        });
        console.log(`✉️ [WHATSAPP LEAD EMAIL NOTIFICATION SENT]: ${subject}`);
    } catch (err) {
        console.warn('[WhatsApp LeadManager] Email notice skipped:', err.message);
    }
};

/**
 * Save a new WhatsApp lead/consultation
 */
async function saveWhatsAppLead({ name, phone, email, service, details, senderJid }) {
    const cleanPhone = phone || senderJid?.replace('@s.whatsapp.net', '') || 'N/A';
    const cleanEmail = email || `wa-${cleanPhone}@corevixtechnology.com`;
    const cleanService = service || 'WhatsApp Inbound Inquiry';

    const payload = {
        name: name || `WhatsApp Contact (+${cleanPhone})`,
        company: 'Inbound via WhatsApp (+91 92432 38242)',
        email: cleanEmail,
        phone: cleanPhone,
        service: cleanService,
        handoffChoice: 'WhatsApp Automated Bot',
        preferredTime: 'Immediate WhatsApp follow-up',
        source: 'Corevix WhatsApp Bot (+91 92432 38242)',
        details: typeof details === 'object' ? JSON.stringify(details) : (details || ''),
        created_at: new Date().toISOString()
    };

    // 1. Supabase database insert
    if (supabase) {
        try {
            const { error } = await supabase.from('consultations').insert([payload]);
            if (error) {
                // Schema fallback
                await supabase.from('consultations').insert([{
                    name: payload.name,
                    email: payload.email,
                    service: `${payload.service} | WA: +${cleanPhone}`,
                    source: payload.source,
                    created_at: payload.created_at
                }]);
            }
            console.log(`⚡ [SUPABASE] WhatsApp lead saved for +${cleanPhone}`);
        } catch (err) {
            console.error('[WhatsApp LeadManager] Supabase error:', err.message);
        }
    }

    // 2. Local JSON file backup
    const list = readConsultations();
    list.unshift({ id: Date.now(), ...payload });
    writeConsultations(list);

    // 3. Email Alert to team
    sendEmailAlert(
        `🚨 New WhatsApp Lead from +${cleanPhone}: ${payload.name}`,
        `A new prospect reached out to Corevix Technology WhatsApp (+91 92432 38242):\n\n` +
        `• Name: ${payload.name}\n` +
        `• WhatsApp Number: +${cleanPhone}\n` +
        `• Email: ${cleanEmail}\n` +
        `• Service Interested: ${cleanService}\n` +
        `• Project Requirements:\n${payload.details}\n\n` +
        `Date/Time: ${new Date().toLocaleString()}`
    );

    return payload;
}

function getRecentLeads(limit = 5) {
    const list = readConsultations();
    return list.slice(0, limit);
}

module.exports = {
    saveWhatsAppLead,
    getRecentLeads
};
