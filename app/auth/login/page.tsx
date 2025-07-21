"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import LoginForm from "@/components/login-form"
import { Card } from "@/components/ui/card"

export default function LoginPage() {
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (user) {
      router.push("/")
    }
  }, [user, router])

  if (user) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Redirecting...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4 shadow-md">
      <Card className="w-full max-w-md p-5">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
          <p className="text-gray-400">Sign in to your account</p>
        </div>
        <LoginForm />
      </Card>
    </div>
  )
}
