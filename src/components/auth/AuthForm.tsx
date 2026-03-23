'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { Loader2 } from 'lucide-react'
import Link from 'next/link'

interface AuthFormProps {
  type: 'login' | 'register'
  onSubmit: (formData: FormData) => Promise<{ error?: string; success?: boolean }>
}

export function AuthForm({ type, onSubmit }: AuthFormProps) {
  const [isPending, setIsPending] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsPending(true)
    setError(null)
    
    const formData = new FormData(e.currentTarget)
    const result = await onSubmit(formData)
    
    if (result.error) {
      setError(result.error)
      setIsPending(false)
    } else {
      // Success will cause a redirect from the action or middle-ware
      // or we can handle it here if needed.
      window.location.href = '/'
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-md p-8 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl"
    >
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">
          {type === 'login' ? 'Welcome Back' : 'Create Account'}
        </h1>
        <p className="text-zinc-400">
          {type === 'login' 
            ? 'Enter your credentials to access your courses' 
            : 'Join StudyFlow to organize your learning journey'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-300 ml-1">Username</label>
          <input
            name="username"
            type="text"
            required
            className="w-full h-12 px-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
            placeholder="johndoe"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-300 ml-1">Password</label>
          <input
            name="password"
            type="password"
            required
            className="w-full h-12 px-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
            placeholder="••••••••"
          />
        </div>

        {error && (
          <motion.p
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="text-red-400 text-sm font-medium bg-red-400/10 p-3 rounded-lg border border-red-400/20"
          >
            {error}
          </motion.p>
        )}

        <button
          disabled={isPending}
          className="w-full h-12 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold shadow-lg shadow-blue-600/20 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : (type === 'login' ? 'Sign In' : 'Sign Up')}
        </button>
      </form>

      <div className="mt-8 text-center text-zinc-400">
        {type === 'login' ? (
          <p>
            Don't have an account?{' '}
            <Link href="/register" className="text-blue-400 hover:text-blue-300 font-medium">
              Create one
            </Link>
          </p>
        ) : (
          <p>
            Already have an account?{' '}
            <Link href="/login" className="text-blue-400 hover:text-blue-300 font-medium">
              Sign in
            </Link>
          </p>
        )}
      </div>
    </motion.div>
  )
}
