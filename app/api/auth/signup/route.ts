import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export async function POST(request: Request) {
  if (!supabaseUrl || !serviceRoleKey || !anonKey) {
    return NextResponse.json(
      { error: 'Supabase credentials are missing. Please configure NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, and SUPABASE_SERVICE_ROLE_KEY.' },
      { status: 500 }
    )
  }

  try {
    const body = await request.json().catch(() => null)

    const email = body?.email
    const password = body?.password

    if (typeof email !== 'string' || typeof password !== 'string') {
      return NextResponse.json(
        { error: 'Email and password are required.' },
        { status: 400 }
      )
    }

    const adminClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false
      }
    })

    const { data, error } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true
    })

    if (error || !data.user) {
      return NextResponse.json(
        { error: error?.message || 'Failed to create account.' },
        { status: 400 }
      )
    }

    const supabase = createClient(supabaseUrl, anonKey)
    const { data: sessionData, error: sessionError } = await supabase.auth.signInWithPassword({ email, password })

    if (sessionError) {
      return NextResponse.json(
        { error: sessionError.message || 'User created but auto-login failed.' },
        { status: 500 }
      )
    }

    return NextResponse.json({ user: data.user, session: sessionData.session })
  } catch (error) {
    console.error('Failed to create user via service role client:', error)
    return NextResponse.json(
      { error: 'Failed to create account.' },
      { status: 500 }
    )
  }
}
