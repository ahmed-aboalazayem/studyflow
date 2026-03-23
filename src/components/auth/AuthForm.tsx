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
      className="w-full max-w-md p-10 rounded-[2.5rem] border border-white/10 bg-black/40 backdrop-blur-3xl shadow-[0_0_50px_rgba(0,0,0,0.5)] relative overflow-hidden group"
    >
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/10 rounded-full blur-[80px] group-hover:bg-primary/20 transition-colors duration-700" />
      <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-accent/10 rounded-full blur-[80px] group-hover:bg-accent/20 transition-colors duration-700" />
      <div className="text-center mb-8">
        <h1 className="text-4xl font-black text-white mb-3 tracking-tighter">
          {type === 'login' ? 'Welcome Back' : 'Get Started'}
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
            className="w-full h-14 px-5 rounded-2xl bg-white/5 border border-white/10 text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all font-medium"
            placeholder="Username"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-300 ml-1">Password</label>
          <input
            name="password"
            type="password"
            required
            className="w-full h-14 px-5 rounded-2xl bg-white/5 border border-white/10 text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all font-medium"
            placeholder="Password"
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
          className="w-full h-14 rounded-2xl bg-gradient-to-r from-primary to-accent hover:opacity-90 text-white font-black text-lg shadow-[0_0_20px_rgba(255,31,31,0.3)] transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : (type === 'login' ? 'Sign In' : 'Sign Up')}
        </button>
      </form>

      <div className="mt-8 text-center text-zinc-400">
        {type === 'login' ? (
          <p>
            Don't have an account?{' '}
            <Link href="/register" className="text-primary hover:text-accent font-bold transition-colors">
              Create one
            </Link>
          </p>
        ) : (
          <p>
            Already have an account?{' '}
            <Link href="/login" className="text-primary hover:text-accent font-bold transition-colors">
              Sign in
            </Link>
          </p>
        )}
      </div>
    </motion.div>
  )
}
