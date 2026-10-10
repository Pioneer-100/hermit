import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })
dotenv.config({ path: '.env' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase URL or Anon Key')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testConnection() {
  console.log('Testing Supabase Connection...')
  console.log('URL:', supabaseUrl)
  
  const { data, error } = await supabase.from('articles').select('id').limit(1)
  
  if (error) {
    if (error.code === '42P01') {
      console.log('? Connection successful, but the "articles" table does not exist yet.')
      console.log('Please run the SQL migration script in supabase/migrations/001_initial_schema.sql in your Supabase SQL editor.')
    } else {
      console.error('? Connection failed or query error:', error)
    }
  } else {
    console.log('? Connection successful! Database is reachable and tables exist.')
  }
}

testConnection()
