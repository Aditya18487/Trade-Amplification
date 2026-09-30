require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_KEY;

console.log('Connecting to Supabase at:', SUPABASE_URL);
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function testConnection() {
    try {
        const { data, error } = await supabase.from('projects').select('*').limit(1);
        if (error) {
            console.log('❌ Supabase Query Error (Table might not exist yet):', error.message);
            console.log('💡 Fix: Run the SQL table creation script in Supabase Dashboard -> SQL Editor.');
        } else {
            console.log('✅ SUPABASE DATABASE IS 100% CONNECTED & READY!');
            console.log('Fetched Projects sample:', data);
        }
    } catch (e) {
        console.log('❌ Connection error:', e.message);
    }
}

testConnection();
