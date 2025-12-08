"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { createClient } from "@/lib/supabase"
import { User as SupabaseUser } from "@supabase/supabase-js"

interface User {
  id: string
  email: string
  name: string
  avatar: string
  username?: string
}

interface AuthContextType {
  user: User | null
  supabaseUser: SupabaseUser | null
  logout: () => Promise<void>
  isLoading: boolean
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  const fetchProfile = async (userId: string, email: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()
      
      if (data) {
        setUser({
          id: userId,
          email: email,
          name: data.full_name || email.split('@')[0],
          avatar: data.avatar_url || "/placeholder.svg?height=40&width=40",
          username: data.username
        })
      } else {
        // Fallback if profile doesn't exist yet (should be created by trigger, but just in case)
        setUser({
          id: userId,
          email: email,
          name: email.split('@')[0],
          avatar: "/placeholder.svg?height=40&width=40",
        })
      }
    } catch (error) {
      console.error("Error fetching profile:", error)
    }
  }

  useEffect(() => {
    const initializeAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session?.user) {
        setSupabaseUser(session.user)
        if (session.user.email) {
          await fetchProfile(session.user.id, session.user.email)
        }
      } else {
        setSupabaseUser(null)
        setUser(null)
      }
      
      setIsLoading(false)

      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
        if (session?.user) {
          setSupabaseUser(session.user)
          if (session.user.email) {
            await fetchProfile(session.user.id, session.user.email)
          }
        } else {
          setSupabaseUser(null)
          setUser(null)
        }
        setIsLoading(false)
      })

      return () => {
        subscription.unsubscribe()
      }
    }

    initializeAuth()
  }, [])

  const logout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setSupabaseUser(null)
  }

  const refreshProfile = async () => {
    if (supabaseUser?.email) {
      await fetchProfile(supabaseUser.id, supabaseUser.email)
    }
  }

  return (
    <AuthContext.Provider value={{ user, supabaseUser, logout, isLoading, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
