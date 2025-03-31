"use client"

import type { ReactNode } from "react"
import Header from "@/components/layout/header"
import { useAuth } from "@/lib/auth"
import { Loader2, WifiOff } from "lucide-react"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { isAuthenticated, loading, apiOffline } = useAuth()

  // Show loading state
  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated && !loading) {
    redirect("/login")
    return null
  }

  // Show API offline message
  if (apiOffline) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <WifiOff className="h-5 w-5" />
              API Connection Error
            </CardTitle>
            <CardDescription>We're having trouble connecting to the API server</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              The API server at <code>{process.env.API_URL || "http://localhost:8000"}</code> is currently unreachable.
              This could be due to:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>The API server is down or experiencing issues</li>
              <li>Network connectivity problems</li>
              <li>Incorrect API URL configuration</li>
            </ul>
            <Button onClick={() => window.location.reload()} className="w-full">
              Retry Connection
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <div className="flex flex-1">
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  )
}

