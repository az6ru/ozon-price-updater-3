import type React from "react"
import { redirect } from "next/navigation"
import { Navbar } from "@/components/layout/navbar"
import { Sidebar } from "@/components/layout/sidebar"
import { getCurrentUser } from "@/lib/auth-utils"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login")
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar user={user} />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-6 pt-16 md:p-8 md:pt-16">{children}</main>
      </div>
    </div>
  )
}

