"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Package, History, FileText, Settings, BarChart } from "lucide-react"

interface SidebarProps {
  className?: string
}

export default function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname()

  const routes = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: BarChart,
    },
    {
      name: "Products",
      href: "/products",
      icon: Package,
    },
    {
      name: "Price History",
      href: "/price-history",
      icon: History,
    },
    {
      name: "API Logs",
      href: "/api-logs",
      icon: FileText,
    },
    {
      name: "Settings",
      href: "/settings",
      icon: Settings,
    },
  ]

  return (
    <div className={cn("pb-12 w-64 border-r min-h-screen", className)}>
      <div className="space-y-4 py-4">
        <div className="px-4 py-2">
          <h2 className="mb-2 px-2 text-lg font-semibold tracking-tight">Main Menu</h2>
          <div className="space-y-1">
            {routes.map((route) => {
              const Icon = route.icon
              const isActive = pathname === route.href

              return (
                <Link
                  key={route.href}
                  href={route.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all hover:text-primary",
                    isActive ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {route.name}
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

