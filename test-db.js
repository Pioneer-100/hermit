const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

function loadEnv() {
    try {
        let envContent = '';
        if (fs.existsSync('.env.local')) envContent += fs.readFileSync('.env.local', 'utf8') + '\n';
        if (fs.existsSync('.env')) envContent += fs.readFileSync('.env', 'utf8');
        
        envContent.split('\n').forEach(line => {
            const match = line.match(/^([^#\s]+)\s*=\s*(.*)$/);
            if (match) {
                process.env[match[1]] = match[2];
            }
        });
    } catch (e) {}
}

loadEnv();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase URL or Anon Key in env files.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
  console.log('Testing Supabase Connection...');
  console.log('URL:', supabaseUrl);
  
  const { data, error } = await supabase.from('articles').select('id').limit(1);
  
  if (error) {
    if (error.code === '42P01') {
      console.log('\n? Connection successful, but the "articles" table does not exist yet.');
      console.log('Please run the SQL migration script in supabase/migrations/001_initial_schema.sql in your Supabase SQL editor.');
    } else {
      console.error('\n? Connection failed or query error:', error);
    }
  } else {
    console.log('\n? Connection successful! Database is reachable and tables exist.');
  }
}

testConnection();
