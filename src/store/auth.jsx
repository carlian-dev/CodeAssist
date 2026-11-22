import { createContext, useContext, useEffect, useState } from 'react'
import { useStore } from './store'

const SESSION_KEY = 'codeassist:session:v1'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const { db } = useStore()
  const [userId, setUserId] = useState(() => {
    try {
      return localStorage.getItem(SESSION_KEY)
    } catch {
      return null
    }
  })

  const user = db.users.find((u) => u.id === userId) || null

  useEffect(() => {
    try {
      if (userId) localStorage.setItem(SESSION_KEY, userId)
      else localStorage.removeItem(SESSION_KEY)
    } catch {
      // ignore storage failures
    }
  }, [userId])

  const login = (id) => setUserId(id)
  const logout = () => setUserId(null)

  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
