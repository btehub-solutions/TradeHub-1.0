/**
 * Database Fix Script
 * Run this with: node fix-database.js
 * This will automatically add missing columns to your Supabase database
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env.local')
  console.error('Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function fixDatabase() {
  console.log('🔧 Starting database migration...\n')

  const migrations = [
    {
      name: 'Add category column',
      sql: `ALTER TABLE listings ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'Other';`
    },
    {
      name: 'Add user_id column',
      sql: `ALTER TABLE listings ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);`
    },
    {
      name: 'Add status column',
      sql: `ALTER TABLE listings ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'available';`
    },
    {
      name: 'Add images column',
      sql: `ALTER TABLE listings ADD COLUMN IF NOT EXISTS images JSONB;`
    },
    {
      name: 'Update existing rows with defaults',
      sql: `
        UPDATE listings 
        SET category = 'Other' 
        WHERE category IS NULL;
        
        UPDATE listings 
        SET status = 'available' 
        WHERE status IS NULL;
      `
    },
    {
      name: 'Create indexes',
      sql: `
        CREATE INDEX IF NOT EXISTS idx_listings_user_id ON listings(user_id);
        CREATE INDEX IF NOT EXISTS idx_listings_status ON listings(status);
        CREATE INDEX IF NOT EXISTS idx_listings_category ON listings(category);
        CREATE INDEX IF NOT EXISTS idx_listings_created_at ON listings(created_at DESC);
      `
    }
  ]

  for (const migration of migrations) {
    try {
      console.log(`⏳ ${migration.name}...`)
      const { error } = await supabase.rpc('exec_sql', { sql: migration.sql })
      
      if (error) {
        console.log(`⚠️  ${migration.name}: ${error.message}`)
      } else {
        console.log(`✅ ${migration.name} - Success`)
      }
    } catch (err) {
      console.log(`⚠️  ${migration.name}: ${err.message}`)
    }
  }

  console.log('\n✨ Database migration completed!')
  console.log('📝 Note: If you see errors, you may need to run the SQL manually in Supabase SQL Editor')
  console.log('    The SQL file is available at: database-migration.sql')
}

fixDatabase().catch(console.error)
