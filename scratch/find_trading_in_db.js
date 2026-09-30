const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();
const key = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_KEY;
const supabase = createClient(process.env.SUPABASE_URL, key);

async function searchFields() {
  const { data, error } = await supabase.from('projects').select('*');
  if (error) { console.error(error); return; }
  let found = 0;
  data.forEach(p => {
    for (const [k, v] of Object.entries(p)) {
      if (typeof v === 'string' && /trading/i.test(v)) {
        found++;
        console.log(`[Project ${p.id} - ${p.name}] Field '${k}' has matches:`);
        const matches = v.match(/.{0,40}trading.{0,40}/gi);
        matches.forEach(m => console.log('   -> ' + m.trim()));
      }
    }
  });
  console.log(`Total fields with 'trading': ${found}`);
}

searchFields();
