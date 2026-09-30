require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_KEY || '';
const supabase = (SUPABASE_URL && SUPABASE_KEY) ? createClient(SUPABASE_URL, SUPABASE_KEY) : null;

const projectsFile = path.join(__dirname, '..', 'data', 'projects.json');
const defaultLogo = 'assets/corevix-logo-icon.png';

const caseStudies = [
  {
    name: "Telegram Copier Algo Trading Bot",
    tagline: "Turns Telegram trading signals into instant, emotion-free MT5 execution.",
    industry: "Fintech / Algorithmic Trading",
    metric: "Zero Manual Delay — Signal-to-Execution Automation",
    desc: "The Telegram Copier Algo Trading Bot is a fully automated signal-to-execution system that connects Telegram-based trading signals directly to the MetaTrader 5 (MT5) platform. It was built to remove the two biggest problems in manual trading — execution delay and emotional decision-making — so every signal is placed with speed, accuracy, and consistency, whether for an individual trader or a professionally managed account.\n\nThe bot continuously monitors selected Telegram channels and groups through secure API integration. The moment a trading signal appears, it automatically extracts and validates the key trade parameters — symbol, buy/sell direction, entry logic, position sizing rules, and exit or target behavior — before mapping that signal logic to MT5 execution rules for broker-compatible, instant order placement. Built-in safeguards block duplicate trades, incorrect symbol execution, and misaligned orders, keeping every trade clean and reliable.\n\nOn top of execution, the bot runs a dedicated risk management engine: dynamic lot sizing based on account balance or a predefined risk percentage, trade count limits to prevent over-leveraging, synchronized take-profit and stop-loss placement, and fail-safe handling for connectivity issues or conflicting signals. The result is disciplined, reproducible trade execution with no human bias in the loop.",
    tech: "MQL5, MetaTrader 5 (MT5), Telegram Bot API, Algorithmic Trading Logic, Real-Time Signal Parsing, Risk-Based Position Sizing, Automated Order Management",
    url: "https://tradeamplification.com",
    logo: defaultLogo,
    shot1: "assets/case-studies/telegram-copier-algo-bot.jpeg",
    shot2: "",
    date: "Sep 24, 2026"
  },
  {
    name: "Lorentzian Classification Algo Trading Bot",
    tagline: "Probability-driven Forex & XAUUSD trading, built on Lorentzian Classification.",
    industry: "Fintech / Algorithmic Trading",
    metric: "Rule-Based Execution — No Emotional Overrides",
    desc: "This project converts a Lorentzian Classification machine learning model into a fully automated trading bot for Forex and XAUUSD on the 5-minute (M5) timeframe. Rather than chasing price movement the way discretionary trading often does, the system classifies current market conditions, compares them against historically similar conditions, and executes trades based on the resulting probability — all governed by strict risk and exit logic.\n\nThe system was designed as a client-driven project that combined deep domain understanding of the Lorentzian Classification approach with robust automation engineering, avoiding overfitting shortcuts in favor of genuinely disciplined, repeatable execution. There are no manual overrides in the loop — every trade decision comes directly from the model's classification output and the pre-set risk rules.",
    tech: "Lorentzian Classification, Machine Learning for Trading, MetaTrader 5 (MT5), Forex & XAUUSD Automation, Algorithmic Risk Management, Probability-Based Execution Logic",
    url: "",
    logo: defaultLogo,
    shot1: "assets/case-studies/lorentzian-classification-algo.jpeg",
    shot2: "",
    date: "Sep 24, 2026"
  },
  {
    name: "Elastic Grid Trading Dashboard (XAUUSD)",
    tagline: "A rule-driven grid trading dashboard for structured, scalable gold trading on MT5.",
    industry: "Fintech / Algorithmic Trading",
    metric: "Structured, Repeatable Grid Execution on XAUUSD",
    desc: "The Elastic Grid Trading Dashboard is a professional-grade XAUUSD grid trading system built for MetaTrader 5, developed to automate gold trading with structured risk control, precise execution, and scalable grid-based position accumulation. It was purpose-built for traders and financial businesses who want a rule-driven, repeatable trading system instead of discretionary, in-the-moment decision-making.\n\nThe dashboard gives traders a clean, centralized interface to manage trade direction, execution cycles, profit exits, and position accumulation — turning what is normally a manual, error-prone grid strategy into a controlled and automated workflow with clear parameters at every step.",
    tech: "MetaTrader 5 (MT5), Grid Trading Automation, XAUUSD Algorithmic Trading, Risk Control Systems, Trading Dashboard UI, Position Accumulation Logic",
    url: "",
    logo: defaultLogo,
    shot1: "assets/case-studies/elastic-grid-trading-dashboard.png",
    shot2: "",
    date: "Sep 24, 2026"
  },
  {
    name: "TradingView to MT5 Automation System",
    tagline: "Range Filter signals from TradingView, executed automatically in MT5 via webhook.",
    industry: "Fintech / Algorithmic Trading",
    metric: "Low-Latency, Multi-Symbol Automated Execution",
    desc: "This custom algorithmic trading system automates a modified Range Filter strategy end-to-end: trading signals generated on TradingView are transmitted through webhook integration and executed automatically in MetaTrader 5 by a custom-built Expert Advisor (EA). The project transformed what had been a manual Range Filter trading workflow into a structured, automated execution pipeline with real-time trade management and risk handling.\n\nCore functionality includes Range Filter signal generation on TradingView, webhook-based signal transmission, automated MT5 trade execution, dynamic trailing stop management, real-time risk monitoring, opposite-signal trade handling, and multi-symbol support across XAUUSD, Forex pairs, and Indices. The system was engineered specifically for fast execution, automation reliability, and scalable algorithmic trading infrastructure.",
    tech: "TradingView, Pine Script, MetaTrader 5 (MT5), Python, Webhooks, Algorithmic Trading Systems, Dynamic Trailing Stop Logic",
    url: "",
    logo: defaultLogo,
    shot1: "assets/case-studies/tradingview-to-mt5-automation.png",
    shot2: "",
    date: "Sep 24, 2026"
  },
  {
    name: "MT5 Expert Advisor — Automated Trend Following & Smart Trade Management",
    tagline: "A fully standalone MT5 Range Filter Expert Advisor for automated trend-following trading.",
    industry: "Fintech / Algorithmic Trading",
    metric: "Fully Self-Contained MT5 Architecture — No Third-Party Dependencies",
    desc: "This custom-built Range Filter Expert Advisor operates entirely within MetaTrader 5, removing the need for TradingView integrations, webhooks, or any third-party execution services. It was engineered to automate trend-following trade execution while providing advanced position management and risk-control capabilities natively inside the platform.\n\nCore features include native Range Filter signal processing inside MT5, automated buy and sell execution, intelligent retest entry management, a dynamic trend-based stop-loss system, fixed and adaptive risk controls, advanced position scaling (pyramiding), configurable trade modes, optional market-condition filters, and multi-symbol, multi-timeframe compatibility. The project successfully converted a previously external, signal-dependent workflow into a fully self-contained MT5 EA capable of generating signals, executing trades, and managing positions autonomously — with strong operational reliability and execution efficiency.",
    tech: "MQL5, MetaTrader 5 (MT5), Custom Trade Management Engine, Dynamic Stop Management Framework, Automated Risk Control System, Trend-Following Algorithms",
    url: "",
    logo: defaultLogo,
    shot1: "assets/case-studies/mt5-trend-following-ea.jpeg",
    shot2: "",
    date: "Sep 24, 2026"
  },
  {
    name: "Confederation",
    tagline: "Informational & Research Website",
    industry: "Policy, Research & International Relations",
    metric: "Established a professional digital presence, Improved accessibility of research & resources",
    desc: "A web-based content management platform for publishing and managing Confederation-related information, documents, references, and resources, with a user-facing website and secure admin panel.",
    tech: "HTML5, CSS3, JavaScript, Responsive Web Design, CMS",
    url: "https://www.confederation.site/",
    logo: defaultLogo,
    shot1: "assets/case-studies/confederation.jpeg",
    shot2: "",
    date: "Sep 24, 2026"
  },
  {
    name: "Botlok — MT5 Trade Evidence Tracing System",
    tagline: "Secure, verifiable audit trails for every MT5 trading signal — from receipt to execution.",
    industry: "Fintech / Trading Compliance & Auditing",
    metric: "Fully Verifiable, Traceable Signal-to-Execution Logs",
    desc: "Botlok is an evidence-tracing system built for MT5 trading events, designed to answer a critical accountability question: exactly what happened to a specific trading signal, from the moment the server received it through to its execution or suppression. The system was built and validated to give operators, auditors, or clients a secure, verifiable record of that entire journey.\n\nEvery signal is logged with controlled, tamper-evident evidence at each stage of the pipeline, making it possible to trace, verify, and defend trading decisions after the fact — valuable for managed trading accounts, compliance-sensitive operations, or any business that needs to prove exactly why a trade was (or wasn't) executed.",
    tech: "MetaTrader 5 (MT5), Evidence Tracing & Audit Logging, Signal Verification Systems, Secure Log Architecture, Trade Compliance Tooling",
    url: "",
    logo: defaultLogo,
    shot1: "assets/case-studies/botlok.png",
    shot2: "",
    date: "Sep 24, 2026"
  },
  {
    name: "Talipam Trade",
    tagline: "SaaS trading management platform with real-time MT5 integration and full account control.",
    industry: "Fintech / SaaS Trading Platforms",
    metric: "Real-Time MT5 Monitoring Across User & Admin Dashboards",
    desc: "Talipam Trade is a SaaS-based trading management platform built to give both traders and administrators complete control and visibility over their MT5 trading operations. The platform runs the Vortex EA on MetaTrader 5 and provides a centralized dashboard to monitor account performance, configure grid trading rules, and track exactly what the EA is doing in real time.\n\nThe platform is structured around separate User and Admin dashboards, secure authentication, subscription management, and automated trading controls, all backed by dedicated APIs for managing accounts, strategies, and day-to-day trading operations. This separation of roles allows business owners to manage subscribers and oversee platform-wide activity, while individual traders get a focused view of their own account and strategy performance.",
    tech: "SaaS Platform Architecture, MetaTrader 5 (MT5) Integration, Vortex EA, Secure Authentication, Subscription Management, Role-Based Dashboards, Backend REST APIs",
    url: "https://www.talipmtrade.com/",
    logo: defaultLogo,
    shot1: "assets/case-studies/talipam-trade.jpeg",
    shot2: "",
    date: "Sep 24, 2026"
  },
  {
    name: "Supermarket Inventory & POS Management System",
    tagline: "Connected billing and inventory platform that keeps every supermarket transaction in sync — automatically.",
    industry: "Retail & Supermarket (Retail Operations / Point of Sale)",
    metric: "100% Automatic Stock Sync on Every Sale",
    desc: "Corevix Technology designed and developed a complete Supermarket Inventory & POS Management System to solve a common retail problem: billing and inventory running as two disconnected systems. Before this solution, the supermarket relied on manual stock tracking, which created mismatches between actual shelf stock and recorded inventory, slowed down cashier checkout, and made it difficult for management to know which products needed replenishment.\n\nThe system was built around one core architectural principle — every transaction that affects stock should update inventory automatically, in real time. The platform connects POS billing, inventory management, and business reporting into a single workflow: a purchase updates stock, a sale reduces stock, a customer return restores stock (or routes it to a damage/quarantine bucket if unsellable), and a supplier return deducts stock — all without manual re-entry.\n\nKey modules include POS Billing (barcode scanning, product search including non-barcoded local products, cart management, discounts, multiple payment methods, instant receipt generation), Inventory Management (SKU and barcode management, real-time stock tracking, low-stock alerts, controlled stock adjustments, purchase tracking), a Returns & Exchange Engine (verifies original transactions, routes stock back to sellable or damage inventory, calculates price differences on exchanges, processes refunds), a Management Dashboard (today's sales, total bills, low/out-of-stock counts, payment breakdowns, top-selling products, recent inventory activity — all on one screen), and a full Reporting Suite (sales, stock, purchase, and return reports plus user/activity monitoring).\n\nThe result is a fully traceable inventory movement history — the business owner can always see why stock increased or decreased, giving supermarket management complete visibility and control with significantly less manual work.",
    tech: "POS System Architecture, Inventory Management, Barcode Scanning Integration, SKU Management, Real-Time Stock Sync, Retail Reporting & Analytics, Role-Based Access Control, Dashboard & Data Visualization",
    url: "",
    logo: defaultLogo,
    shot1: "assets/case-studies/supermarket-inventory-pos.jpeg",
    shot2: "",
    date: "Sep 24, 2026"
  },
  {
    name: "Workforce Operation TMS (Task Management System)",
    tagline: "SaaS task management with employee and admin portals for full workforce visibility.",
    industry: "SaaS / Enterprise Workforce Management",
    metric: "Complete Employee Lifecycle Tracking in One Platform",
    desc: "Workforce Operation TMS is a SaaS-based Task Management System built with two distinct experiences — an Employee Portal and an Admin Portal — designed to bring structure to everyday workforce operations. Rather than tracking tasks, attendance, and reviews across scattered tools, teams manage everything from task assignment and project tracking to Start-of-Day/End-of-Day (SOD/EOD) reporting, attendance, leave management, performance reviews, notifications, and analytics-driven reports in one connected system.\n\nOn the frontend, the platform is built with React/Next.js, TypeScript, and Tailwind CSS, delivering a responsive dashboard with charts and clean API integration. The backend runs on Node.js/TypeScript with REST APIs and a PostgreSQL/MySQL database, handling authentication, role-based access control, and all task, employee, attendance, and leave management logic. As a SaaS product, it supports secure login and session management for both user roles, cloud deployment, Git/GitHub-based version control, and basic Docker containerization for consistent deployment.",
    tech: "React, Next.js, TypeScript, Tailwind CSS, Node.js, REST APIs, PostgreSQL, MySQL, Role-Based Access Control, Docker, Git/GitHub, SaaS Architecture",
    url: "",
    logo: defaultLogo,
    shot1: "assets/case-studies/workforce-operation-tms.jpeg",
    shot2: "",
    date: "Sep 24, 2026"
  },
  {
    name: "AI Customer Support Agent",
    tagline: "An AI-powered support agent built for natural conversations and automated workflows.",
    industry: "AI / Customer Support SaaS",
    metric: "Scalable Foundation for Automated, Human-Backed Support",
    desc: "This AI-powered customer support agent was built to handle natural, conversational customer interactions while automating the surrounding support workflow. The project includes a responsive support interface along with a foundation for knowledge-base integration, automated ticket creation, human-agent escalation, external API connections, and backend action handling.\n\nThe system was designed to be extensible from the ground up — a starting foundation that can grow into a fully scalable AI support solution for agencies, SaaS platforms, and fintech businesses that need to handle high volumes of customer conversations without losing the option to hand off to a human agent when needed.",
    tech: "Conversational AI, Natural Language Processing, Knowledge Base Integration, Ticketing System Automation, API Integration, Human Escalation Workflows",
    url: "",
    logo: defaultLogo,
    shot1: "assets/case-studies/ai-customer-support-agent.png",
    shot2: "",
    date: "Sep 24, 2026"
  },
  {
    name: "Delta Exchange Options Trading Platform",
    tagline: "Full-stack automated options trading platform with signal-based execution and built-in risk controls.",
    industry: "Fintech / Options & Derivatives Trading",
    metric: "End-to-End Automated Options Execution with Real-Time Monitoring",
    desc: "This full-stack automated trading platform (frontend + backend) was built for options trading on Delta Exchange, covering everything from signal-based execution to options strategy automation and comprehensive risk management. The platform integrates directly with the Delta Exchange API for order execution and live market data, and runs a signal-based automated trade execution engine alongside a dedicated options strategy automation module.\n\nRisk is managed through a built-in system covering position sizing, stop-loss enforcement, and exposure limits, so trades stay within defined boundaries automatically. On the frontend, users get a dashboard (modeled on the 'ANT Meta BOTS' interface) for login, bot controls, and live monitoring, while the backend server handles authentication and user management to support multiple traders on the same platform.",
    tech: "Delta Exchange API, Options Strategy Automation, Signal-Based Execution Engine, Risk Management Systems, Full-Stack Web Development, Authentication & User Management",
    url: "",
    logo: defaultLogo,
    shot1: "assets/case-studies/delta-exchange-options.jpeg",
    shot2: "",
    date: "Sep 24, 2026"
  },
  {
    name: "Web3 NFT Marketplace with Staking & Rewards",
    tagline: "A secure, full-stack NFT marketplace where users mint, trade, stake, and earn token rewards.",
    industry: "Web3 / Blockchain & Digital Assets",
    metric: "Full NFT Lifecycle — Mint, Trade, Stake & Earn in One Platform",
    desc: "This full-stack Web3 NFT marketplace was built for secure, scalable digital asset trading, giving users the ability to mint, buy, sell, and stake NFTs while earning token rewards — all within one connected platform. The architecture combines smart contract development with a modern web frontend and backend to deliver a complete, production-ready marketplace experience.\n\nOn the smart contract side, the platform uses ERC-721 NFTs, EIP-712 signature-based minting for secure off-chain-to-on-chain minting flows, and ERC-2981 creator royalties so original creators earn automatically on secondary sales — all built with Solidity, Hardhat, and OpenZeppelin's audited contract standards. The frontend and backend, built with Next.js, React, Node.js, and MongoDB, handle wallet integration, marketplace transactions, staking, and on-chain event synchronization, with IPFS used for decentralized asset storage and Ethers.js/Wagmi powering wallet and blockchain interactions. The platform includes deployment support for Base and Base Sepolia networks.",
    tech: "Solidity, Next.js, React, Node.js, MongoDB, Hardhat, IPFS, Ethers.js, Wagmi, OpenZeppelin, ERC-721, EIP-712, ERC-2981, Base / Base Sepolia",
    url: "",
    logo: defaultLogo,
    shot1: "assets/case-studies/web3-nft-marketplace.jpeg",
    shot2: "",
    date: "Sep 24, 2026"
  }
];

async function run() {
  console.log(`Starting migration of ${caseStudies.length} Case Studies...`);

  let dbSaved = [];
  if (supabase) {
    console.log('Connecting to Supabase PostgreSQL database...');
    // Delete existing records to perform a clean refresh
    const { error: delErr } = await supabase.from('projects').delete().neq('id', 0);
    if (delErr) {
      console.warn('Delete warning:', delErr.message);
    } else {
      console.log('Cleared existing projects for clean insert.');
    }

    // Insert all 13 projects in sequence
    for (let i = 0; i < caseStudies.length; i++) {
      const p = caseStudies[i];
      const { data, error } = await supabase.from('projects').insert([p]).select();
      if (error) {
        console.error(`Error inserting project "${p.name}":`, error.message);
      } else if (data && data.length > 0) {
        dbSaved.push(data[0]);
        console.log(`✓ [DB INSERTED ${i+1}/${caseStudies.length}] ID: ${data[0].id} - ${data[0].name}`);
      }
    }
  } else {
    console.log('Supabase not configured, using JSON file.');
  }

  // Sync to data/projects.json
  const finalProjects = dbSaved.length > 0 
    ? dbSaved 
    : caseStudies.map((p, idx) => ({ id: idx + 1, created_at: new Date().toISOString(), ...p }));

  fs.writeFileSync(projectsFile, JSON.stringify(finalProjects, null, 2));
  console.log(`✓ Synced ${finalProjects.length} projects to ${projectsFile}`);

  console.log('\nAll 13 case studies successfully populated!');
}

run().catch(console.error);
