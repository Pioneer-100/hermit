const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

function loadEnv() {
    try {
        if (fs.existsSync('.env.local')) {
            const envContent = fs.readFileSync('.env.local', 'utf8');
            envContent.split(/\r?\n/).forEach(line => {
                const match = line.match(/^([^#\s]+)\s*=\s*(.*)$/);
                if (match) {
                    process.env[match[1]] = match[2];
                }
            });
        }
    } catch (e) {
        console.error('Error loading .env.local', e);
    }
}

loadEnv();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey || supabaseAnonKey.endsWith('...')) {
  console.error('Missing or invalid Supabase URL or Anon Key. URL:', supabaseUrl, 'Key starts with:', supabaseAnonKey ? supabaseAnonKey.substring(0, 10) : 'none');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
  console.log('Testing Supabase Connection...');
  console.log('URL:', supabaseUrl);
  
  const { data, error } = await supabase.from('articles').select('id').limit(1);
  
  if (error) {
    if (error.code === '42P01') {
      console.log('\n? Connection successful! Database is reachable.');
      console.log('?? WARNING: The "articles" table does not exist yet.');
      console.log('Please run the SQL migration script in supabase/migrations/001_initial_schema.sql in your Supabase SQL editor.');
    } else {
      console.error('\n? Connection failed or query error:');
      console.error(error);
    }
  } else {
    console.log('\n? Connection successful! Database is reachable and tables exist.');
    console.log('Sample data query succeeded.');
  }
}

testConnection();
