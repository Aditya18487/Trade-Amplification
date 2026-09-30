/* Corevix Technology Enterprise Express.js REST API Server | Supabase Database Integration */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const { createClient } = require('@supabase/supabase-js');
const nodemailer = require('nodemailer');

const app = express();
const PORT = process.env.PORT || 5000;
const ADMIN_SECRET = process.env.ADMIN_SECRET || 'trade2026admin';

// Initialize Supabase Client (prefers service role key for backend operations)
const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_KEY || '';
let supabase = null;

if (SUPABASE_URL && SUPABASE_KEY && SUPABASE_URL.startsWith('http')) {
    try {
        supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
        console.log('⚡ [SUPABASE DATABASE ENGINE INITIALIZED SUCCESSFULLY]');
    } catch (e) {
        console.log('⚠️ Supabase init error:', e.message);
    }
}

// Data and uploads directories
const isVercel = process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME;
const dataDir = isVercel ? '/tmp' : path.join(__dirname, 'data');
const uploadsDir = isVercel ? '/tmp/uploads' : path.join(__dirname, 'uploads');

if (!fs.existsSync(dataDir)) {
    try { fs.mkdirSync(dataDir, { recursive: true }); } catch (e) {}
}
if (!fs.existsSync(uploadsDir)) {
    try { fs.mkdirSync(uploadsDir, { recursive: true }); } catch (e) {}
}

const contactsFile = path.join(dataDir, 'contacts.json');
const consultationsFile = path.join(dataDir, 'consultations.json');
const projectsFile = path.join(dataDir, 'projects.json');
const blogsFile = path.join(dataDir, 'blogs.json');

let defaultProjects = [];
try { defaultProjects = require('./data/projects.json'); } catch(e) {}

let defaultBlogs = [];
try { defaultBlogs = require('./data/blogs.json'); } catch(e) {}

// Initialize fallback files
if (!fs.existsSync(contactsFile)) try { fs.writeFileSync(contactsFile, JSON.stringify([])); } catch (e) {}
if (!fs.existsSync(consultationsFile)) try { fs.writeFileSync(consultationsFile, JSON.stringify([])); } catch (e) {}
if (!fs.existsSync(projectsFile)) try { fs.writeFileSync(projectsFile, JSON.stringify(defaultProjects, null, 2)); } catch (e) {}
if (!fs.existsSync(blogsFile)) try { fs.writeFileSync(blogsFile, JSON.stringify(defaultBlogs, null, 2)); } catch (e) {}

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use('/uploads', express.static(uploadsDir));

// Multer Storage Engine for File Uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadsDir),
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, file.fieldname + '-' + uniqueSuffix + ext);
    }
});
const upload = multer({ storage: storage });

// Helper functions for fallback JSON I/O
const readJSON = (filePath) => {
    try {
        if (!fs.existsSync(filePath)) return [];
        return JSON.parse(fs.readFileSync(filePath, 'utf8') || '[]');
    } catch (e) {
        return [];
    }
};

const writeJSON = (filePath, data) => {
    try {
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    } catch (e) {
        console.error('File write error:', e);
    }
};

// Nodemailer Transporter Helper
const sendNotificationEmail = async (subject, textContent) => {
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
            from: `"Corevix Technology" <${process.env.SMTP_USER}>`,
            to: process.env.NOTIFICATION_EMAIL || 'info@corevixtechnology.com',
            subject: subject,
            text: textContent
        });
        console.log(`✉️ [EMAIL NOTIFICATION SENT]: ${subject}`);
    } catch (err) {
        console.log('Email delivery skipped:', err.message);
    }
};

// ==========================================
// REST API ENDPOINTS
// ==========================================

// 1. Health Check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'online',
        company: 'Corevix Technology',
        tagline: 'Where Innovation Meets Technology.',
        database: supabase ? 'Supabase PostgreSQL (Active & Connected)' : 'Embedded JSON Engine (Fallback)',
        environment: isVercel ? 'Vercel Serverless' : 'Node.js Server',
        timestamp: new Date().toISOString()
    });
});


// 2. Contact Form Submission
app.post('/api/contact', async (req, res) => {
    const { name, email, phone, service, message } = req.body;

    if (!name || !email) {
        return res.status(400).json({ error: 'Name and Email are required.' });
    }

    const payload = {
        name,
        email,
        phone: phone || 'N/A',
        service: service || 'General Technical Consultation',
        message: message || '',
        created_at: new Date().toISOString()
    };

    if (supabase) {
        try {
            await supabase.from('contacts').insert([payload]);
        } catch (err) {
            console.error('Supabase insert error:', err.message);
        }
    } else {
        const contacts = readJSON(contactsFile);
        contacts.unshift({ id: Date.now(), ...payload });
        writeJSON(contactsFile, contacts);
    }

    console.log(`📩 [INQUIRY RECEIVED] ${name} (${email}) - ${service}`);
    sendNotificationEmail(
        `New Inquiry from ${name}`,
        `Name: ${name}\nEmail: ${email}\nPhone: ${phone}\nService: ${service}\nMessage: ${message}`
    );

    res.status(201).json({
        success: true,
        message: 'Inquiry received successfully. Our senior software architects will respond within 2 hours.',
        inquiry: payload
    });
});

// 3. AI Chatbot Consultation Booking & Project Qualification (Cora AI Assistant)
const handleConsultation = async (req, res) => {
    const { name, company, email, phone, whatsapp, contact, preferredTime, service, projectType, handoffChoice, details } = req.body;

    if (!name || (!email && !phone && !whatsapp && !contact)) {
        return res.status(400).json({ error: 'Name and either an Email or Phone number are required.' });
    }

    const contactPhone = phone || whatsapp || (contact && !contact.includes('@') ? contact : 'N/A');
    const contactEmail = email || (contact && contact.includes('@') ? contact : `inquiry-${Date.now()}@corevixtechnology.com`);
    const selectedService = service || projectType || 'General Architecture Scoping';
    const clientCompany = company || 'Individual / Startup';
    const handoff = handoffChoice || 'AI Chatbot Qualification';

    const payload = {
        name,
        company: clientCompany,
        email: contactEmail,
        phone: contactPhone,
        service: selectedService,
        handoffChoice: handoff,
        preferredTime: preferredTime || 'Flexible',
        source: 'Cora AI Project Assistant',
        details: typeof details === 'object' ? JSON.stringify(details) : (details || ''),
        created_at: new Date().toISOString()
    };

    if (supabase) {
        try {
            const { error } = await supabase.from('consultations').insert([payload]);
            if (error) {
                // Fallback for strict Supabase table schema
                await supabase.from('consultations').insert([{
                    name,
                    email: contactEmail,
                    service: `${selectedService} | Co: ${clientCompany} | Phone: ${contactPhone} | Mode: ${handoff}`,
                    source: 'Cora AI Project Assistant',
                    created_at: payload.created_at
                }]);
            }
        } catch (err) {
            console.error('Supabase insert error:', err.message);
        }
    } else {
        const consultations = readJSON(consultationsFile);
        consultations.unshift({ id: Date.now(), ...payload });
        writeJSON(consultationsFile, consultations);
    }

    console.log(`🗓️ [CORA LEAD CAPTURED] ${name} (${clientCompany} - ${contactPhone} / ${contactEmail}) - ${selectedService} [${handoff}]`);
    sendNotificationEmail(
        `New Cora Lead (${handoff}): ${name} - ${clientCompany}`,
        `Name: ${name}\nCompany: ${clientCompany}\nContact: ${contactPhone} / ${contactEmail}\nPreferred Time: ${preferredTime || 'Flexible'}\nHandoff: ${handoff}\nService: ${selectedService}\nDetails:\n${typeof details === 'object' ? JSON.stringify(details, null, 2) : details}`
    );

    res.status(201).json({
        success: true,
        message: 'Lead received successfully by Corevix Technology team.',
        booking: payload
    });
};

app.post('/api/consultation', handleConsultation);
app.post('/api/consultations', handleConsultation);

// 4. Admin Passcode Login
app.post('/api/admin/login', (req, res) => {
    const { passcode } = req.body;

    if (passcode === ADMIN_SECRET) {
        res.json({
            success: true,
            message: 'Admin access granted.',
            token: 'ta_admin_authenticated_session'
        });
    } else {
        res.status(401).json({ error: 'Invalid admin passcode.' });
    }
});

// 5. Get All Published Software Projects
app.get('/api/projects', async (req, res) => {
    if (supabase) {
        try {
            const { data, error } = await supabase.from('projects').select('*').order('id', { ascending: true });
            if (!error && data && data.length > 0) return res.json(data);
        } catch (err) {
            console.error('Supabase select error:', err.message);
        }
    }
    const projects = readJSON(projectsFile);
    if (projects && projects.length > 0) return res.json(projects);
    res.json(defaultProjects);
});

// 5b. Get Single Published Software Project by ID
app.get('/api/projects/:id', async (req, res) => {
    const projectId = req.params.id;
    if (supabase) {
        try {
            const { data, error } = await supabase.from('projects').select('*').eq('id', projectId).single();
            if (!error && data) return res.json(data);
        } catch (err) {
            console.error('Supabase select by id error:', err.message);
        }
    }
    const projects = readJSON(projectsFile);
    let found = projects.find(p => String(p.id) === String(projectId));
    if (!found) {
        found = defaultProjects.find(p => String(p.id) === String(projectId));
    }
    if (found) return res.json(found);
    res.status(404).json({ error: 'Project profile not found' });
});

// Middleware to safely handle both JSON and multipart file uploads
const safeUploadFields = (req, res, next) => {
    const ctype = req.headers['content-type'] || '';
    if (ctype.includes('application/json')) {
        return next();
    }
    upload.fields([
        { name: 'logo', maxCount: 1 },
        { name: 'screenshot1', maxCount: 1 },
        { name: 'screenshot2', maxCount: 1 }
    ])(req, res, (err) => {
        if (err) console.warn('Multer project upload warning:', err.message);
        next();
    });
};

const safeUploadSingleBlog = (req, res, next) => {
    const ctype = req.headers['content-type'] || '';
    if (ctype.includes('application/json')) {
        return next();
    }
    upload.single('image')(req, res, (err) => {
        if (err) console.warn('Multer blog upload warning:', err.message);
        next();
    });
};

// 6. Admin Software Project Upload (Supports Custom Industry & Vercel Serverless)
app.post('/api/admin/projects', safeUploadFields, async (req, res) => {
    const { name, tagline, desc, tech, industry, customIndustry, metric, url, logoBase64, shot1Base64, shot2Base64 } = req.body;

    if (!name || !desc || !tech) {
        return res.status(400).json({ error: 'Project Name, Description, and Tech Stack are required.' });
    }

    const finalIndustry = (industry === 'Other' && customIndustry) ? customIndustry : (industry || 'Finance & Banking');

    let logoUrl = logoBase64 || '';
    let shot1Url = shot1Base64 || '';
    let shot2Url = shot2Base64 || '';

    // If files were uploaded via multipart/form-data and Base64 was not passed, read file buffer into permanent Data URL!
    if (req.files) {
        if (!logoUrl && req.files.logo && req.files.logo[0]) {
            try {
                const buf = fs.readFileSync(req.files.logo[0].path);
                logoUrl = `data:${req.files.logo[0].mimetype || 'image/png'};base64,${buf.toString('base64')}`;
            } catch (e) {
                console.warn('Logo file read error:', e.message);
            }
        }
        if (!shot1Url && req.files.screenshot1 && req.files.screenshot1[0]) {
            try {
                const buf = fs.readFileSync(req.files.screenshot1[0].path);
                shot1Url = `data:${req.files.screenshot1[0].mimetype || 'image/jpeg'};base64,${buf.toString('base64')}`;
            } catch (e) {
                console.warn('Screenshot1 file read error:', e.message);
            }
        }
    }

    // If user uploaded only one photo, use it for both logo and screenshot
    if (!logoUrl && shot1Url) logoUrl = shot1Url;
    if (!shot1Url && logoUrl) shot1Url = logoUrl;
    if (!logoUrl) logoUrl = 'assets/corevix-logo-icon.png';
    if (!shot1Url) shot1Url = 'data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22800%22%20height%3D%22450%22%20viewBox%3D%220%200%20800%20450%22%3E%3Cdefs%3E%3ClinearGradient%20id%3D%22g%22%20x1%3D%220%25%22%20y1%3D%220%25%22%20x2%3D%22100%25%22%20y2%3D%22100%25%22%3E%3Cstop%20offset%3D%220%25%22%20stop-color%3D%22%230d1324%22%2F%3E%3Cstop%20offset%3D%22100%25%22%20stop-color%3D%22%23050811%22%2F%3E%3C%2FlinearGradient%3E%3C%2Fdefs%3E%3Crect%20width%3D%22100%25%22%20height%3D%22100%25%22%20fill%3D%22url(%23g)%22%2F%3E%3Ctext%20x%3D%2250%25%22%20y%3D%2250%25%22%20fill%3D%22%2310B981%22%20font-family%3D%22sans-serif%22%20font-size%3D%2222%22%20font-weight%3D%22bold%22%20text-anchor%3D%22middle%22%20dy%3D%22.3em%22%3ECorevix%20Enterprise%20Software%3C%2Ftext%3E%3C%2Fsvg%3E';

    const payload = {
        name,
        tagline: tagline || '',
        desc,
        tech,
        industry: finalIndustry,
        metric: metric || '100% IP Ownership & High Throughput',
        url: url || 'https://tradeamplification.com',
        logo: logoUrl,
        shot1: shot1Url,
        shot2: shot2Url,
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    };

    let createdProject = null;
    if (supabase) {
        try {
            const { data, error } = await supabase.from('projects').insert([payload]).select();
            if (error) {
                console.error('Supabase insert error:', error.message);
            } else if (data && data.length > 0) {
                createdProject = data[0];
            }
        } catch (err) {
            console.error('Supabase insert exception:', err.message);
        }
    }

    // Always keep JSON fallback synced
    const projects = readJSON(projectsFile);
    const finalSaved = createdProject || { id: Date.now(), ...payload };
    projects.unshift(finalSaved);
    writeJSON(projectsFile, projects);

    console.log(`🚀 [PROJECT PUBLISHED] ${name} (${finalIndustry}) - ID: ${finalSaved.id}`);

    res.status(201).json({
        success: true,
        message: 'Software profile published successfully!',
        project: finalSaved
    });
});

// 7. Get All Published Blogs
app.get('/api/blogs', async (req, res) => {
    if (supabase) {
        try {
            const { data, error } = await supabase.from('blogs').select('*').order('id', { ascending: false });
            if (!error && data && data.length > 0) return res.json(data);
        } catch (err) {
            console.error('Supabase select error:', err.message);
        }
    }
    const blogs = readJSON(blogsFile);
    if (blogs && blogs.length > 0) return res.json(blogs);
    res.json(defaultBlogs);
});

// 7b. Get Single Blog Article by ID
app.get('/api/blogs/:id', async (req, res) => {
    const blogId = req.params.id;
    if (supabase) {
        try {
            const { data, error } = await supabase.from('blogs').select('*').eq('id', blogId).single();
            if (!error && data) return res.json(data);
        } catch (err) {
            console.error('Supabase select blog by id error:', err.message);
        }
    }
    const blogs = readJSON(blogsFile);
    let found = blogs.find(b => String(b.id) === String(blogId));
    if (!found) {
        found = defaultBlogs.find(b => String(b.id) === String(blogId));
    }
    if (found) return res.json(found);
    res.status(404).json({ error: 'Blog post not found' });
});

// 8. Admin Blog Article Upload
app.post('/api/admin/blogs', safeUploadSingleBlog, async (req, res) => {
    const { title, category, content, imageBase64 } = req.body;

    if (!title || !content) {
        return res.status(400).json({ error: 'Blog Title and Content are required.' });
    }

    let imageUrl = imageBase64 || '';
    if (!imageUrl && req.file) {
        try {
            const buf = fs.readFileSync(req.file.path);
            imageUrl = `data:${req.file.mimetype || 'image/jpeg'};base64,${buf.toString('base64')}`;
        } catch (e) {
            console.warn('Blog image file read error:', e.message);
        }
    }
    if (!imageUrl) imageUrl = 'assets/corevix-logo-full.png';

    const payload = {
        title,
        category: category || 'Engineering Insights',
        content,
        image: imageUrl,
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    };

    let createdBlog = null;
    if (supabase) {
        try {
            const { data, error } = await supabase.from('blogs').insert([payload]).select();
            if (error) {
                console.error('Supabase insert error:', error.message);
            } else if (data && data.length > 0) {
                createdBlog = data[0];
            }
        } catch (err) {
            console.error('Supabase insert exception:', err.message);
        }
    }

    const blogs = readJSON(blogsFile);
    const finalSavedBlog = createdBlog || { id: Date.now(), ...payload };
    blogs.unshift(finalSavedBlog);
    writeJSON(blogsFile, blogs);

    console.log(`📰 [BLOG PUBLISHED] ${title} - ID: ${finalSavedBlog.id}`);

    res.status(201).json({
        success: true,
        message: 'Blog article published successfully!',
        blog: finalSavedBlog
    });
});

// 9. Delete Software Project
app.delete('/api/admin/projects/:id', async (req, res) => {
    const projectId = req.params.id;

    if (supabase) {
        try {
            await supabase.from('projects').delete().eq('id', projectId);
        } catch (err) {
            console.error('Supabase delete project error:', err.message);
        }
    }

    let projects = readJSON(projectsFile);
    projects = projects.filter(p => String(p.id) !== String(projectId));
    writeJSON(projectsFile, projects);

    res.json({ success: true, message: 'Project deleted successfully.' });
});

// Update Software Project (e.g. Screenshot, Logo, or Text)
app.put('/api/admin/projects/:id', async (req, res) => {
    const projectId = req.params.id;
    const { name, tagline, industry, customIndustry, desc, tech, metric, url, logo, shot1, logoBase64, shot1Base64 } = req.body;
    const updateData = {};
    if (name) updateData.name = name;
    if (tagline !== undefined) updateData.tagline = tagline;
    const finalIndustry = (industry === 'Other' && customIndustry) ? customIndustry : industry;
    if (finalIndustry) updateData.industry = finalIndustry;
    if (desc) updateData.desc = desc;
    if (tech) updateData.tech = tech;
    if (metric) updateData.metric = metric;
    if (url !== undefined) updateData.url = url;
    const finalLogo = logo || logoBase64;
    if (finalLogo) updateData.logo = finalLogo;
    const finalShot = shot1 || shot1Base64;
    if (finalShot) updateData.shot1 = finalShot;

    if (supabase) {
        try {
            await supabase.from('projects').update(updateData).eq('id', projectId);
        } catch (err) {
            console.error('Supabase update project error:', err.message);
        }
    }

    let projects = readJSON(projectsFile);
    const idx = projects.findIndex(p => String(p.id) === String(projectId));
    if (idx !== -1) {
        projects[idx] = { ...projects[idx], ...updateData };
        writeJSON(projectsFile, projects);
    }

    res.json({ success: true, message: 'Project updated successfully.' });
});

// Delete Blog Article
app.delete('/api/admin/blogs/:id', async (req, res) => {
    const blogId = req.params.id;

    if (supabase) {
        try {
            await supabase.from('blogs').delete().eq('id', blogId);
        } catch (err) {
            console.error('Supabase delete blog error:', err.message);
        }
    }

    let blogs = readJSON(blogsFile);
    blogs = blogs.filter(b => String(b.id) !== String(blogId));
    writeJSON(blogsFile, blogs);

    res.json({ success: true, message: 'Blog deleted successfully.' });
});

// ==========================================================================
// 🤖 GEMINI AI INTEGRATION FOR "CORA" AI CHATBOT (COREVIX TECHNOLOGY)
// ==========================================================================
const COREVIX_SYSTEM_INSTRUCTION = `You are Cora, the AI Project Assistant for Corevix Technology (corevixtechnology.com), a premier custom software engineering and digital transformation firm.

Your primary mission is to help visitors quickly explore and define what they want to build or improve, answer technical architectural questions with brevity, and guide them toward a human conversation with the Corevix engineering team.

Key Principles:
1. Keep answers short, natural, and conversational (2-3 concise paragraphs maximum). Do not write overwhelming walls of text.
2. Tone: Helpful, authoritative, modern engineering tone. Do not pretend to be human; you are Cora, the Corevix AI assistant.
3. Corevix Core Strengths:
   - Custom Software & ERP/CRM (100% IP & source code ownership, zero license fees).
   - Fintech Engineering (high throughput, payment rails, financial engines, ledger compliance).
   - Web & Mobile Applications (React, Next.js, Flutter, React Native, Node.js, Python, Go).
   - SaaS Product Engineering (multi-tenant, automated billing, rapid MVP launch in 4-8 weeks).
   - AI Automation (LLM workflows, agents, OCR document parsing, RPA pipelines).
4. Human Handoff:
   - Always invite the visitor to connect directly with the Corevix engineering team:
     • Talk on WhatsApp (+91 92432 38242)
     • Schedule a technical meeting
     • Request a call back.`;

// Check Gemini API Key Status
app.get('/api/chat/status', (req, res) => {
    const hasKey = !!(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim().length > 5);
    res.json({
        configured: hasKey,
        model: 'gemini-1.5-flash'
    });
});

// Set / Update Gemini API Key dynamically
app.post('/api/chat/set-key', async (req, res) => {
    const { apiKey } = req.body;
    if (!apiKey || typeof apiKey !== 'string' || apiKey.trim().length < 10) {
        return res.status(400).json({ success: false, error: 'Please provide a valid Gemini API key.' });
    }

    const cleanKey = apiKey.trim();

    // Verify key with Gemini test call
    try {
        const testUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${cleanKey}`;
        const response = await fetch(testUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ role: 'user', parts: [{ text: 'Hello, confirm you are working.' }] }]
            })
        });

        const testData = await response.json();
        if (!response.ok || testData.error) {
            const errDetail = testData.error?.message || `HTTP ${response.status}: ${response.statusText}`;
            return res.status(400).json({
                success: false,
                error: `Gemini API Key rejected: ${errDetail}`
            });
        }

        // Save to current process
        process.env.GEMINI_API_KEY = cleanKey;

        // Persist to .env file
        const envPath = path.join(__dirname, '.env');
        let envContent = '';
        if (fs.existsSync(envPath)) {
            envContent = fs.readFileSync(envPath, 'utf8');
        }

        if (envContent.includes('GEMINI_API_KEY=')) {
            envContent = envContent.replace(/GEMINI_API_KEY=.*(\r?\n|$)/, `GEMINI_API_KEY=${cleanKey}\n`);
        } else {
            envContent += `\nGEMINI_API_KEY=${cleanKey}\n`;
        }
        fs.writeFileSync(envPath, envContent.trim() + '\n', 'utf8');

        return res.json({
            success: true,
            message: 'Gemini API Key verified and activated successfully!'
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            error: `Connection error verifying Gemini API key: ${err.message}`
        });
    }
});

// Helper: Intelligent Fallback Knowledge & Reasoning Engine
const generateCorevixAIResponse = (userQuery) => {
    const q = (userQuery || '').toLowerCase();

    if (q.includes('fintech') || q.includes('payment') || q.includes('saas') || q.includes('wallet') || q.includes('ledger') || q.includes('pci')) {
        return `**Corevix Fintech Engineering Capabilities:**\n\n` +
               `We engineer mission-critical financial software with bank-grade security protocols and sub-millisecond execution:\n\n` +
               `• **PCI-DSS Compliant Payment Gateways**: Direct integration with Stripe, Razorpay, Adyen, and custom banking APIs.\n` +
               `• **Financial Software & Ledger Engines**: Double-entry accounting cores, high-throughput transaction routing, and real-time compliance checks.\n` +
               `• **Multi-Currency Digital Wallets**: Secure tokenization, KYC/AML verification workflows, and automated ledger balancing.\n` +
               `• **Security Architecture**: AES-256 encryption at rest, TLS 1.3 in transit, and immutable audit logging for all transactional records.\n\n` +
               `Would you like to review our [Fintech Services](/services/fintech-services.html) or [Schedule a Technical Consultation](/contact.html)?`;
    }

    if (q.includes('custom software') || q.includes('erp') || q.includes('crm') || q.includes('spreadsheet') || q.includes('inventory')) {
        return `**Corevix Custom Software Development:**\n\n` +
               `We design and build bespoke software engineered exclusively around your organization's unique operational workflows:\n\n` +
               `• **Tailored ERP & CRM Systems**: Complete replacement of fragmented spreadsheets with unified, multi-user relational platforms.\n` +
               `• **Automated Operational Hubs**: Inventory tracking, production scheduling, multi-warehouse logistics, and real-time analytics.\n` +
               `• **100% Source Code Ownership**: Zero per-seat monthly license fees. You own all intellectual property upon milestone payment.\n` +
               `• **Integration Ready**: Bidirectional synchronization with Tally, QuickBooks, SAP, and custom REST/GraphQL APIs.\n\n` +
               `Explore our in-depth [Custom Software Solutions](/services/custom-software.html) or [Schedule a Free Scoping Call](/contact.html).`;
    }

    if (q.includes('price') || q.includes('cost') || q.includes('budget') || q.includes('pricing') || q.includes('ip') || q.includes('ownership') || q.includes('code')) {
        return `**Corevix Pricing Models & Source Code Ownership:**\n\n` +
               `We believe in transparent engineering partnerships without hidden recurring vendor fees:\n\n` +
               `1. **Fixed-Price Milestone Contracts**: Best for projects with well-defined scopes. Clear milestone deliverables, fixed timelines, and fixed costs.\n` +
               `2. **Dedicated Engineering Squads**: Sprint-based monthly engagements where senior developers, architects, and QA act as your extended in-house team.\n` +
               `3. **Technical Advisory & Architecture**: On-demand architectural reviews, code audits, and modernization strategies.\n\n` +
               `🔒 **100% IP & Source Code Transfer**: Your organization owns all git repositories, database schemas, and documentation. No licensing lock-in.\n` +
               `🛡️ **30-Day Post-Launch Warranty**: Every production deployment includes 30 days of complimentary bug resolution and hypercare.\n\n` +
               `Ready to receive an estimated scope? You can [Schedule a Free Consultation](/contact.html) or scope directly in this chat!`;
    }

    if (q.includes('time') || q.includes('timeline') || q.includes('duration') || q.includes('how long') || q.includes('fast') || q.includes('deadline')) {
        return `**Corevix Project Delivery Timelines:**\n\n` +
               `We prioritize rapid, high-velocity sprint cycles without compromising enterprise stability:\n\n` +
               `• **Architecture & Scoping (Weeks 1 - 2)**: Requirement mapping, database schema design, UI wireframes, and technical architecture spec.\n` +
               `• **MVP / Core Prototype (Weeks 4 - 8)**: Fully functional, production-ready core application with essential workflows and auth.\n` +
               `• **Enterprise Production Platforms (2 - 4 Months)**: Comprehensive multi-module systems with third-party integrations, automated tests, and stress benchmarks.\n` +
               `• **Post-Launch Hypercare (30 Days)**: Included warranty for stabilization and continuous monitoring.\n\n` +
               `Would you like to fast-track your timeline? [Schedule a Consultation](/contact.html) or message our team directly.`;
    }

    if (q.includes('web') || q.includes('stack') || q.includes('technology') || q.includes('react') || q.includes('node') || q.includes('python')) {
        return `**Corevix Technology Stack & Web Engineering:**\n\n` +
               `We utilize proven, enterprise-grade frameworks built for high concurrent throughput and resilience:\n\n` +
               `• **Frontend**: React, Next.js, TypeScript, Tailwind CSS, Vue.js.\n` +
               `• **Backend & APIs**: Node.js (Express/NestJS), Python (FastAPI/Django), Go, REST & GraphQL.\n` +
               `• **Databases**: PostgreSQL, MySQL, MongoDB, Redis (caching), Supabase.\n` +
               `• **Cloud & DevOps**: AWS, Google Cloud, Docker, Kubernetes, Terraform, GitHub Actions CI/CD.\n\n` +
               `Check out our [Web Development Services](/services/web-development.html) for architectural breakdowns!`;
    }

    if (q.includes('mobile') || q.includes('app') || q.includes('ios') || q.includes('android') || q.includes('flutter')) {
        return `**Corevix Mobile Application Development:**\n\n` +
               `We engineer high-performance mobile apps for iOS and Android:\n\n` +
               `• **Cross-Platform**: Flutter and React Native with native bridge performance and shared business logic.\n` +
               `• **Native Development**: Swift for iOS and Kotlin for Android when maximum hardware capability is needed.\n` +
               `• **Features**: Biometric authentication, offline data sync, push notification pipelines, and end-to-end encryption.\n\n` +
               `Read more about our [Mobile Development Practice](/services/mobile-development.html) or tell us your app requirements!`;
    }

    if (q.includes('saas') || q.includes('multi-tenant') || q.includes('subscription')) {
        return `**Corevix SaaS Product Engineering:**\n\n` +
               `From initial commercial MVP to scalable multi-tenant architectures:\n\n` +
               `• **Multi-Tenant Schemas**: Secure database isolation (shared DB with schema isolation or dedicated DB per tenant).\n` +
               `• **Automated Billing Engines**: Tiered subscriptions, seat management, usage-based metering via Stripe or Razorpay.\n` +
               `• **Role-Based Access Control (RBAC)**: Granular organizational permissions, SSO (SAML/OAuth), and audit logs.\n\n` +
               `Explore our [SaaS Engineering Practice](/services/saas-development.html) to launch your product platform.`;
    }

    if (q.includes('ai') || q.includes('automation') || q.includes('llm') || q.includes('bot') || q.includes('agent')) {
        return `**Corevix AI & Workflow Automation Practice:**\n\n` +
               `We integrate intelligent automation pipelines into real business operations:\n\n` +
               `• **Autonomous AI Agents**: Multi-step reasoning agents connected to company databases and external APIs.\n` +
               `• **Document & Invoice OCR**: Automated extraction of unstructured invoices, receipts, and contracts into structured databases.\n` +
               `• **Custom LLM Solutions**: Domain-specific fine-tuning, RAG (Retrieval-Augmented Generation), and private vector search.\n\n` +
               `See details on our [AI & Automation Solutions](/services/ai-automation.html).`;
    }

    if (q.includes('hello') || q.includes('hi') || q.includes('hey') || q.includes('help')) {
        return `Hello! I'm the **Corevix AI Software Architect**.\n\n` +
               `We engineer custom B2B software, fintech platforms, web applications, mobile apps, SaaS products, and AI automations.\n\n` +
               `How can I help you today? You can ask about:\n` +
               `• **Our Practice Areas** (Custom Software, Fintech, Web, Mobile, SaaS, AI, Cloud)\n` +
               `• **Pricing & 100% IP Ownership**\n` +
               `• **Delivery Timelines & 30-Day Warranty**\n` +
               `• **Architecture Recommendations** for your project!`;
    }

    // Default authoritative response
    return `**Corevix Technology Architectural Advisory:**\n\n` +
           `Corevix engineers bespoke digital infrastructure tailored specifically to your organization's business model. We deliver:\n\n` +
           `• **Full-Cycle Engineering**: From architecture blueprints to live deployment and post-launch maintenance.\n` +
           `• **100% Source Code Ownership**: Complete IP handover on milestone sign-off.\n` +
           `• **Direct Senior Architect Access**: Work directly with senior software architects without account manager bureaucracy.\n\n` +
           `Would you like to [Schedule a Consultation](/contact.html) with our lead engineers, or discuss your specific system requirements?`;
};

// Conversational Chat with Gemini (and Seamless Fallback Engine)
app.post('/api/chat', async (req, res) => {
    const apiKey = process.env.GEMINI_API_KEY;
    const { message, history } = req.body;

    if (!message || typeof message !== 'string') {
        return res.status(400).json({ success: false, error: 'Message is required.' });
    }

    // If API key is present, attempt live Google Gemini generation
    if (apiKey && apiKey.trim().length > 10) {
        const contents = [];

        if (Array.isArray(history)) {
            const recentHistory = history.slice(-8);
            for (const item of recentHistory) {
                if (item.sender === 'user' && item.text) {
                    contents.push({ role: 'user', parts: [{ text: item.text }] });
                } else if (item.sender === 'bot' && item.text) {
                    contents.push({ role: 'model', parts: [{ text: item.text.replace(/<[^>]+>/g, '') }] });
                }
            }
        }

        contents.push({ role: 'user', parts: [{ text: message }] });

        const payload = {
            system_instruction: { parts: [{ text: COREVIX_SYSTEM_INSTRUCTION }] },
            contents: contents,
            generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 1024,
                topP: 0.95
            }
        };

        const modelsToTry = ['gemini-1.5-flash', 'gemini-2.0-flash', 'gemini-1.5-pro'];

        for (const model of modelsToTry) {
            try {
                const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey.trim()}`;
                const response = await fetch(url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                const data = await response.json();

                if (response.ok && data.candidates && data.candidates[0]?.content?.parts) {
                    const replyText = data.candidates[0].content.parts.map(p => p.text).join('\n');
                    return res.json({
                        success: true,
                        reply: replyText,
                        model: model
                    });
                }
            } catch (err) {
                // Fall through to fallback engine
            }
        }
    }

    // Seamless Fallback Knowledge Engine (Never asks user for key, answers authoritatively)
    const fallbackReply = generateCorevixAIResponse(message);
    return res.json({
        success: true,
        reply: fallbackReply,
        model: 'corevix-knowledge-v1'
    });
});

// ==========================================================================
// WhatsApp Business Bot & Webhook Engine (+91 92432 38242)
// ==========================================================================
const TARGET_WA_PHONE = process.env.WHATSAPP_BOT_PHONE_NUMBER || '+91 92432 38242';

// 1. Bot Health & Telemetry Status
app.get('/api/whatsapp/status', (req, res) => {
    let botModule = null;
    try {
        botModule = require('./whatsapp-bot/index.js');
    } catch (e) {}

    const sessionExists = fs.existsSync(path.join(__dirname, 'whatsapp-bot', 'session', 'creds.json'));
    const botStatus = botModule ? botModule.getBotStatus() : { connected: false };

    res.json({
        success: true,
        targetPhone: TARGET_WA_PHONE,
        sessionActive: sessionExists,
        connected: botStatus.connected,
        stats: botStatus.stats || {},
        instructions: {
            pairingCommand: 'npm run bot:pairing',
            qrCommand: 'npm run bot:qr'
        }
    });
});

// 2. Meta WhatsApp Official Cloud API Webhook Verification
app.get('/api/whatsapp/webhook', (req, res) => {
    const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN || 'corevix_token_2026';
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode && token === verifyToken) {
        console.log('✅ [META WHATSAPP WEBHOOK VERIFIED]');
        return res.status(200).send(challenge);
    }
    return res.status(403).send('Forbidden');
});

// 3. Meta WhatsApp Official Cloud API Incoming Message Handler
app.post('/api/whatsapp/webhook', async (req, res) => {
    try {
        const body = req.body;
        if (body.object === 'whatsapp_business_account') {
            const entry = body.entry?.[0];
            const changes = entry?.changes?.[0];
            const value = changes?.value;
            const message = value?.messages?.[0];

            if (message && message.type === 'text') {
                const from = message.from; // Sender phone number
                const text = message.text.body;
                console.log(`📩 [META WA MESSAGE] From: +${from} | Msg: ${text}`);

                // Process AI response or capture lead
                const replyText = generateCorevixAIResponse(text);

                // Send reply back if META_WHATSAPP_TOKEN & PHONE_NUMBER_ID are provided
                const metaToken = process.env.META_WHATSAPP_TOKEN;
                const phoneId = process.env.META_PHONE_NUMBER_ID;

                if (metaToken && phoneId) {
                    await fetch(`https://graph.facebook.com/v19.0/${phoneId}/messages`, {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${metaToken}`,
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            messaging_product: 'whatsapp',
                            to: from,
                            text: { body: replyText }
                        })
                    });
                }
            }
        }
        return res.status(200).send('EVENT_RECEIVED');
    } catch (err) {
        console.error('Meta webhook error:', err);
        return res.status(500).send('ERROR');
    }
});

// Clean URL routes matching vercel.json
const pageRoutes = [
    'index', 'services', 'technologies', 'industries-tech',
    'case-studies', 'case-study-detail', 'about', 'blog', 'blog-detail', 'faq', 'contact', 'admin', 'projects'
];
pageRoutes.forEach(route => {
    app.get(`/${route}`, (req, res) => {
        res.sendFile(path.join(__dirname, `${route}.html`));
    });
});

// Explicit service clean routes
const serviceRoutes = [
    'fintech-services', 'custom-software', 'web-development',
    'mobile-development', 'saas-development', 'ai-automation', 'cloud-solutions'
];
serviceRoutes.forEach(route => {
    app.get(`/services/${route}`, (req, res) => {
        res.sendFile(path.join(__dirname, 'services', `${route}.html`));
    });
});

// Root route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Serve static frontend files (CSS, JS, images, services subpages, etc.)
app.use(express.static(path.join(__dirname), { extensions: ['html'] }));

// Start Local Server if not running in Serverless Lambda
if (!isVercel) {
    app.listen(PORT, () => {
        console.log(`⚡ Corevix Technology Server Running on http://localhost:${PORT}`);
    });
}


// Export for Vercel Serverless Function
module.exports = app;
