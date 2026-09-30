/**
 * Corevix Technology WhatsApp AI Assistant & Knowledge Engine
 * Supports Gemini 1.5/2.0 Flash + Intelligent Built-in Fallback Knowledge Base
 */

require('dotenv').config();

const COREVIX_SYSTEM_PROMPT = `You are Cora, the Senior AI Software Architect & Assistant for Corevix Technology (corevixtechnology.com, formerly Trade Amplification).
You communicate with clients on WhatsApp via the official company number (+91 92432 38242).

Your goals:
1. Provide concise, expert, and actionable software & fintech engineering advice.
2. WhatsApp formatting: Use emojis, bold (*text*), bullet points (•), and keep replies compact (maximum 2-3 short paragraphs). Never write giant essays.
3. Language: Reply in the same language the customer uses (English, Hindi, or Hinglish).
4. Core Strengths:
   • Custom Software & Enterprise ERP/CRM (100% source code & IP ownership, no recurring seat fees)
   • FinTech & SaaS Product Engineering (Multi-tenant SaaS, Payment Gateway Integrations, Automated Billing, High-Throughput Financial APIs)
   • AI Workflow Automation & Autonomous Agents (LLM integration, Document OCR, private vector search)
   • Web & Mobile Apps (Next.js, React, Node.js, Python, Flutter, React Native)
5. Call-to-action:
   Always invite them to book a free technical consultation or talk to our lead engineer on this WhatsApp (+91 92432 38242).`;

const generateFallbackKnowledgeResponse = (userQuery = '') => {
    const q = userQuery.toLowerCase().trim();

    // Hindi greetings / general queries
    if (q.includes('namaste') || q.includes('kya hal') || q.includes('kaise ho') || q.includes('kya karte ho')) {
        return `*Corevix Technology me aapka swagat hai!* 🚀\n\n` +
               `Hum custom enterprise software, SaaS platforms, aur AI automations engineer karte hain.\n\n` +
               `Aap humse ye services le sakte hain:\n` +
               `• *Custom Software & ERP* (100% Source Code aapka)\n` +
               `• *FinTech & SaaS Platforms* (Payment Rails, Billing, APIs)\n` +
               `• *AI Agents & Workflow Automation*\n` +
               `• *Mobile & Web Apps*\n\n` +
               `Aapko kis tarah ka project banwana hai? Detail batayein ya 5 dabakar free call book karein!`;
    }

    if (q.includes('fintech') || q.includes('saas') || q.includes('payment') || q.includes('billing') || q.includes('gateway')) {
        return `💳 *Corevix FinTech & SaaS Product Engineering:*\n\n` +
               `Hum high-throughput financial software aur scalable SaaS platforms engineer karte hain:\n` +
               `• *Payment Gateway Integrations*: Stripe, Razorpay, Adyen, aur enterprise banking APIs.\n` +
               `• *Subscription Billing & Metering*: Multi-tenant SaaS billing engines with automated invoice generation.\n` +
               `• *Financial Dashboards*: Real-time analytics, reporting, aur automated ledger reconciliation.\n` +
               `• *High Security & Compliance*: PCI-DSS readiness, AES-256 encryption, and audit logs.\n\n` +
               `Kisme interested hain aap? Reply karein ya *5* bhejkar Lead Engineer se meeting book karein!`;
    }

    if (q.includes('price') || q.includes('cost') || q.includes('charge') || q.includes('kitna') || q.includes('rate') || q.includes('budget')) {
        return `💰 *Corevix Pricing & Project Models:*\n\n` +
               `Hum clean, transparent fixed-milestone pricing follow karte hain:\n\n` +
               `1️⃣ *Fixed-Price Milestones*: Project scope define hone ke baad fixed deadline aur fixed milestone payments.\n` +
               `2️⃣ *100% Source Code Ownership*: Saare GitHub repositories, database schemas, aur IP rights aapke naam transfer hote hain. Koi monthly license fees nahi.\n` +
               `3️⃣ *30-Day Free Warranty*: Live deployment ke baad 30 din complimentary support aur bug fixes free rehte hain.\n\n` +
               `Aapke requirement ke hisab se exact quote ke liye apna requirement share karein ya *5* reply karein.`;
    }

    if (q.includes('custom software') || q.includes('erp') || q.includes('crm') || q.includes('inventory') || q.includes('billing')) {
        return `💻 *Corevix Custom Software & ERP Solutions:*\n\n` +
               `• *Custom ERP/CRM Systems*: Tailored for your specific business workflow without bloated features.\n` +
               `• *Zero Per-Seat Fees*: Complete IP ownership with unlimited users on your own server.\n` +
               `• *Integrations*: Payment gateways, WhatsApp APIs, Tally, SMS, and cloud storage.\n` +
               `• *Security*: Bank-grade role-based access control and encrypted databases.\n\n` +
               `Apna requirement share karein ya *5* reply karke consultation schedule karein!`;
    }

    if (q.includes('ai') || q.includes('automation') || q.includes('agent') || q.includes('llm') || q.includes('gpt')) {
        return `🤖 *Corevix AI Automation & Intelligent Agents:*\n\n` +
               `• *Autonomous AI Workflow Agents*: Connect LLMs directly with company databases and ERP.\n` +
               `• *WhatsApp & Web AI Chatbots*: Like this bot, customized for your business 24/7 support.\n` +
               `• *Document & OCR Extraction*: Auto parse PDF invoices, contracts, and financial receipts.\n` +
               `• *Private Vector RAG*: Train AI on your company documentation with total data privacy.\n\n` +
               `Would you like to build an AI agent for your business? Reply *5* to book a scoping call!`;
    }

    if (q.includes('time') || q.includes('timeline') || q.includes('kitna time') || q.includes('duration') || q.includes('fast')) {
        return `⏱️ *Project Delivery Timelines:*\n\n` +
               `• *Fast SaaS MVP / Automation*: 1 to 2 weeks.\n` +
               `• *MVP / Core Web & Mobile App*: 2 to 4 weeks.\n` +
               `• *Full Enterprise ERP / FinTech Platform*: 6 to 12 weeks with weekly sprint demos.\n` +
               `• *Post-Launch Warranty*: 30 days hypercare included in every project.\n\n` +
               `Tell us your target deadline and we will plan the roadmap!`;
    }

    // Default professional answer
    return `⚡ *Corevix Technology - Engineering Your Vision*\n\n` +
           `We engineer bespoke software, scalable SaaS platforms, AI automations, and modern web/mobile applications with 100% source code ownership.\n\n` +
           `How can we help you today?\n` +
           `• Reply *1* for Custom Software / ERP\n` +
           `• Reply *2* for FinTech & SaaS Platforms\n` +
           `• Reply *3* for AI Automation\n` +
           `• Reply *4* for Web & Mobile Development\n` +
           `• Reply *5* to Book a Free Consultation\n` +
           `• Reply *6* to speak with our human engineer on this number (+91 92432 38242)!`;
};

async function askAI(userQuery, conversationHistory = []) {
    const apiKey = process.env.GEMINI_API_KEY;

    if (apiKey && apiKey.trim().length > 10) {
        try {
            const contents = [];
            if (Array.isArray(conversationHistory)) {
                for (const item of conversationHistory.slice(-6)) {
                    contents.push({
                        role: item.role === 'user' ? 'user' : 'model',
                        parts: [{ text: item.text }]
                    });
                }
            }
            contents.push({ role: 'user', parts: [{ text: userQuery }] });

            const payload = {
                system_instruction: { parts: [{ text: COREVIX_SYSTEM_PROMPT }] },
                contents: contents,
                generationConfig: {
                    temperature: 0.6,
                    maxOutputTokens: 600
                }
            };

            const models = ['gemini-1.5-flash', 'gemini-2.0-flash', 'gemini-1.5-pro'];
            for (const model of models) {
                try {
                    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey.trim()}`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(payload)
                    });
                    const data = await res.json();
                    if (res.ok && data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
                        return data.candidates[0].content.parts[0].text.trim();
                    }
                } catch (e) {
                    // Try next model
                }
            }
        } catch (err) {
            console.error('[AI Engine Error]:', err.message);
        }
    }

    // Use intelligent fallback engine
    return generateFallbackKnowledgeResponse(userQuery);
}

module.exports = {
    askAI,
    generateFallbackKnowledgeResponse,
    COREVIX_SYSTEM_PROMPT
};
