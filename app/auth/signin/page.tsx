'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { signIn, signInWithGoogle } from '@/lib/supabase'
import { Mail, Lock, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '@/lib/AuthProvider'

export default function SignInPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')

  useEffect(() => {
    if (!authLoading && user) {
      router.replace('/dashboard')
    }

    // Check for error in URL query params
    const searchParams = new URLSearchParams(window.location.search)
    const errorParam = searchParams.get('error')
    if (errorParam) {
      setError(decodeURIComponent(errorParam))
      // Clean up URL
      window.history.replaceState({}, '', '/auth/signin')
    }
  }, [authLoading, user, router])

  const handleGoogleSignIn = async () => {
    try {
      setError('')
      const { error } = await signInWithGoogle()
      if (error) {
        setError(error.message)
      }
      // User will be redirected to Google for authentication
    } catch (err: any) {
      setError(err.message || 'Failed to sign in with Google')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccessMessage('')
    setLoading(true)

    try {
      const { data, error } = await signIn(formData.email, formData.password)

      if (error) {
        setError(error.message)
      } else {
        if (!data.session) {
          setError('Failed to sign in. Please try again.')
        } else {
          setSuccessMessage('Signed in successfully. Redirecting...')
          router.replace('/dashboard')
          router.refresh()
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to sign in')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Welcome Back</h1>
          <p className="text-gray-600 dark:text-gray-300">Sign in to your TradeHub account</p>
        </div>

        <div className="bg-white dark:bg-slate-800/70 dark:border dark:border-slate-700/50 rounded-2xl shadow-xl backdrop-blur-sm p-6 sm:p-8">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 text-sm">
              {error}
            </div>
          )}
          {successMessage && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6 text-sm">
              {successMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-slate-600/50 dark:bg-slate-700/50 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition placeholder:text-gray-400 dark:placeholder:text-slate-400 backdrop-blur-sm"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 dark:border-slate-600/50 dark:bg-slate-700/50 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition placeholder:text-gray-400 dark:placeholder:text-slate-400 backdrop-blur-sm"
                  placeholder="Your password"
                  aria-label="Password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-lg font-semibold hover:shadow-lg hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300 dark:border-slate-600"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white dark:bg-slate-800/70 text-gray-500 dark:text-gray-400">
                Or continue with
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleGoogleSignIn}
            className="w-full flex items-center justify-center gap-3 bg-white dark:bg-slate-700/50 border border-gray-300 dark:border-slate-600/50 text-gray-700 dark:text-gray-200 py-3 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-slate-700 hover:shadow-md hover:scale-[1.02] active:scale-95 transition-all backdrop-blur-sm"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Sign in with Google
          </button>

          <div className="mt-6 text-center">
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              Don&apos;t have an account?{' '}
              <Link href="/auth/signup" className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-semibold">
                Sign Up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
