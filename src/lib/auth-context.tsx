"use client"

import * as React from "react"
import { loginAction, registerAction, logoutAction, getMe } from "@/app/actions"

interface User {
  id: number
  username: string
  displayName?: string | null
  imageUrl?: string | null
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (formData: FormData) => Promise<{ error?: string; success?: boolean }>
  register: (formData: FormData) => Promise<{ error?: string; success?: boolean }>
  logout: () => Promise<void>
  checkSession: () => Promise<void>
}

const AuthContext = React.createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<User | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)

  const checkSession = React.useCallback(async () => {
    setIsLoading(true)
    const currentUser = await getMe()
    setUser(currentUser)
    setIsLoading(false)
  }, [])

  React.useEffect(() => {
    checkSession()
  }, [checkSession])

  const login = async (formData: FormData) => {
    const result = await loginAction(formData)
    if (result.success) {
      await checkSession()
    }
    return result
  }

  const register = async (formData: FormData) => {
    const result = await registerAction(formData)
    if (result.success) {
      await checkSession()
    }
    return result
  }

  const logout = async () => {
    await logoutAction()
    setUser(null)
    window.location.href = '/login'
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout, checkSession }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = React.useContext(AuthContext)
  if (!context) throw new Error("useAuth must be used within AuthProvider")
  return context
}

