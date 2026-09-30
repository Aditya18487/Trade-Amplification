# 🤖 Corevix Technology WhatsApp AI Business Bot
### Connected Target Number: `+91 92432 38242`

This WhatsApp bot is custom engineered for **Corevix Technology** (formerly Trade Amplification) to automate customer support, explain technical service offerings, qualify inbound leads, and answer client queries 24/7.

---

## ⚡ Quick Start: Link WhatsApp in 1 Minute

### Method 1: Pairing Code (Recommended - No Camera Scanning Needed)
Connect the bot directly to the website phone number **`+91 92432 38242`**:

1. In your terminal, run:
   ```bash
   npm run bot:pairing
   ```
   *(or `npm run bot`)*
2. The terminal will request and display an **8-digit Pairing Code** (e.g., `ABCD-1234`).
3. Open WhatsApp on the phone with **`+91 92432 38242`**.
4. Tap **Settings** (or three dots at top-right) &rarr; **Linked Devices**.
5. Tap **Link a Device** &rarr; select **"Link with phone number instead"** at the bottom.
6. Enter the 8-digit code shown in the terminal.
7. **Done!** The bot is now linked as a companion device. You can still use WhatsApp on your mobile phone normally!

---

### Method 2: Scan Terminal QR Code
If you prefer scanning a QR code with your phone's camera:
1. Run:
   ```bash
   npm run bot:qr
   ```
2. Scan the ASCII QR code displayed in the terminal using WhatsApp &rarr; **Linked Devices** &rarr; **Link a Device**.

---

## 🌟 Bot Capabilities & Workflow

### 1. Interactive Service Menu
When a new customer messages (e.g., "Hi", "Hello", "Need help"), the bot automatically sends:
```
Hello! 👋 Welcome to Corevix Technology! 🚀
(Formerly Trade Amplification | corevixtechnology.com)

We engineer bespoke software, scalable SaaS platforms,
and enterprise AI workflows with 100% Source Code & IP Ownership.

How can we assist you today? Reply with a number:

1️⃣ Custom Software & Enterprise ERP/CRM
2️⃣ FinTech & SaaS Platforms (Payment Rails, Billing, APIs)
3️⃣ AI Workflow Automation & Autonomous Agents
4️⃣ Web & Mobile App Development (React, Flutter, Node)
5️⃣ 📅 Book a Free Technical Consultation
6️⃣ 👨‍💻 Speak with a Human Engineer / Representative
```

### 2. Conversational Generative AI
Customers can ask questions in **English, Hindi, or Hinglish** (e.g., *"Bhai SaaS platform banwana h kitna time lagega?"*, *"Do you provide full source code?"*, *"What are the charges?"*).
- Uses Google Gemini API (`GEMINI_API_KEY`) or the built-in Corevix knowledge base.
- Keeps replies concise, professional, and formatted specifically for WhatsApp.

### 3. Automated Lead Capture
When a client selects **5** or provides their project details:
- Captures **Name, Phone, Email, and Project Description**.
- Automatically inserts the lead into **Supabase** (`consultations` table).
- Backs up lead into `data/consultations.json`.
- Dispatches an instant email notification to `info@corevixtechnology.com`.

### 4. Human Specialist Handoff
When a client selects **6** or types *"agent" / "human" / "call me"*:
- Bot pauses auto-reply for that contact for 2 hours.
- Alerts the client that an engineer from `+91 92432 38242` will reply directly.
- The person holding the phone `+91 92432 38242` can continue chatting without bot interruptions.
- Client or owner can send `#bot` anytime to resume the bot.

---

## 📱 Owner Admin Commands (From Phone +91 92432 38242)

The owner of `+91 92432 38242` can send commands directly in WhatsApp:
- `!status` &rarr; Check bot uptime, memory, total messages processed, active contacts.
- `!leads` &rarr; View summary of the last 5 leads captured.
- `!pause <phone>` &rarr; Mute bot auto-replies for a specific contact.
- `!resume <phone>` &rarr; Unmute bot auto-replies for a specific contact.
- `!help` &rarr; View all commands.

---

## 🚀 Running 24/7 in Production (PM2)

To keep the bot running permanently in the background on your server:

```bash
# Install PM2 globally (if not already installed)
npm install -g pm2

# Start the WhatsApp bot
pm2 start whatsapp-bot/index.js --name "corevix-wa-bot"

# Start the Web Server
pm2 start server.js --name "corevix-web-server"

# Save configuration so it auto-restarts on reboot
pm2 save
pm2 startup
```

---

## 🌐 Official Meta WhatsApp Cloud API (Alternative)

If you have a Meta WhatsApp Business Cloud API account, you can also use the built-in webhook routes in `server.js`:
- Webhook URL: `https://your-domain.com/api/whatsapp/webhook`
- Verification Token: Configure `WHATSAPP_VERIFY_TOKEN` in `.env` (default: `corevix_token_2026`).
