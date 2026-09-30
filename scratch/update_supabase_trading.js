const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("Missing Supabase credentials");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function run() {
  console.log("Updating Supabase database projects to eliminate 'trading'...");

  // Update Project 39
  const p39Updates = {
    name: "Webhook Alert to MT5 Automation Platform",
    tagline: "Range Filter webhook signals, executed automatically in MT5 via automated bridge.",
    desc: "This custom algorithmic software system automates a modified Range Filter strategy end-to-end: software signals generated via Pine Script alerts are transmitted through webhook integration and executed automatically in MetaTrader 5 by a custom-built Expert Advisor (EA). The project transformed what had been a manual Range Filter software workflow into a structured, automated execution pipeline with real-time software management and risk handling.\n\nCore functionality includes Range Filter signal generation, webhook-based signal transmission, automated MT5 software execution, dynamic trailing stop management, real-time risk monitoring, opposite-signal software handling, and multi-symbol support across XAUUSD, Forex pairs, and Indices. The system was engineered specifically for fast execution, automation reliability, and scalable algorithmic software infrastructure.",
    tech: "Pine Script, MetaTrader 5 (MT5), Python, Webhooks, Algorithmic Software Systems, Dynamic Trailing Stop Logic",
    industry: "Fintech / Algorithmic Software",
    metric: "Low-Latency, Multi-Symbol Automated Execution",
    shot1: "assets/case-studies/webhook-to-mt5-automation.png"
  };

  const { data: d39, error: e39 } = await supabase.from('projects').update(p39Updates).eq('id', 39).select();
  if (e39) console.error("Error updating project 39:", e39);
  else console.log("Updated Project 39 successfully:", d39?.[0]?.name);

  // Update Project 40
  const p40Updates = {
    desc: "This custom-built Range Filter Expert Advisor operates entirely within MetaTrader 5, removing the need for third-party charting integrations, webhooks, or any external execution services. It was engineered to automate trend-following software execution while providing advanced position management and risk-control capabilities natively inside the platform.\n\nCore features include native Range Filter signal processing inside MT5, automated buy and sell execution, intelligent retest entry management, a dynamic trend-based stop-loss system, fixed and adaptive risk controls, advanced position scaling (pyramiding), configurable software modes, optional market-condition filters, and multi-symbol, multi-timeframe compatibility. The project successfully converted a previously external, signal-dependent workflow into a fully self-contained MT5 EA capable of generating signals, executing software orders, and managing positions autonomously — with strong operational reliability and execution efficiency."
  };

  const { data: d40, error: e40 } = await supabase.from('projects').update(p40Updates).eq('id', 40).select();
  if (e40) console.error("Error updating project 40:", e40);
  else console.log("Updated Project 40 successfully");

  // Also verify all projects for any leftover occurrences of 'trading'
  const { data: allProjects } = await supabase.from('projects').select('*');
  let remaining = 0;
  allProjects.forEach(p => {
    for (const [k, v] of Object.entries(p)) {
      if (typeof v === 'string' && /trading/i.test(v)) {
        console.warn(`[REMAINING] Project ${p.id} field '${k}':`, v);
        remaining++;
      }
    }
  });

  console.log(`Scan complete! Remaining 'trading' occurrences in Supabase: ${remaining}`);
}

run();
