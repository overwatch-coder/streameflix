"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import RegisterForm from "@/components/register-form"
import { Card } from "@/components/ui/card"

export default function RegisterPage() {
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
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <Card className="w-full max-w-md p-5">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-2">Create Account</h1>
          <p className="text-gray-400">Join our streaming platform</p>
        </div>
        <RegisterForm />
      </Card>
    </div>
  )
}
