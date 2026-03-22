"use client"

import * as React from "react"

interface User {
  id: number
  username: string
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (username: string, password: string) => Promise<void>
  register: (username: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = React.createContext<AuthContextType | undefined>(undefined)

const USER_KEY = 'studyflow_user'
const DEFAULT_USER = { id: 1, username: 'Local User' }

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<User | null>(DEFAULT_USER)
  const [isLoading, setIsLoading] = React.useState(false)

  React.useEffect(() => {
    const storedUser = localStorage.getItem(USER_KEY)
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    } else {
      localStorage.setItem(USER_KEY, JSON.stringify(DEFAULT_USER))
    }
    setIsLoading(false)
  }, [])

  const login = async (username: string, _password: string) => {
    const mockUser = { id: 1, username }
    setUser(mockUser)
    localStorage.setItem(USER_KEY, JSON.stringify(mockUser))
  }

  const register = async (username: string, _password: string) => {
    const mockUser = { id: 1, username }
    setUser(mockUser)
    localStorage.setItem(USER_KEY, JSON.stringify(mockUser))
  }

  const logout = () => {
    // No-op or reset to default
    setUser(DEFAULT_USER)
    localStorage.setItem(USER_KEY, JSON.stringify(DEFAULT_USER))
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = React.useContext(AuthContext)
  if (!context) throw new Error("useAuth must be used within AuthProvider")
  return context
}
