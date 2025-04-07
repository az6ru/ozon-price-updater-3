"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useAuthStore } from "@/lib/stores/auth-store"
import type { User } from "@/lib/types"
import { cn } from "@/lib/utils"
import { Menu, UserIcon, LogOut } from "lucide-react"

interface NavbarProps {
  user: User
}

export function Navbar({ user }: NavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false)
  const pathname = usePathname()
  const logout = useAuthStore((state) => state.logout)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <header
      className={cn(
        "fixed top-0 z-40 w-full border-b bg-background transition-all",
        isScrolled ? "border-border" : "border-transparent",
      )}
    >
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6 md:gap-8">
          <Link href="/dashboard" className="flex items-center space-x-2">
            <span className="text-xl font-bold">Ozone Price Updater</span>
          </Link>
          <nav className="hidden md:flex gap-6">
            <Link
              href="/dashboard"
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary",
                pathname === "/dashboard" ? "text-primary" : "text-muted-foreground",
              )}
            >
              Dashboard
            </Link>
            <Link
              href="/products"
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary",
                pathname === "/products" ? "text-primary" : "text-muted-foreground",
              )}
            >
              Products
            </Link>
            <Link
              href="/price-history"
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary",
                pathname === "/price-history" ? "text-primary" : "text-muted-foreground",
              )}
            >
              Price History
            </Link>
            <Link
              href="/api-logs"
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary",
                pathname === "/api-logs" ? "text-primary" : "text-muted-foreground",
              )}
            >
              API Logs
            </Link>
            <Link
              href="/settings"
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary",
                pathname === "/settings" ? "text-primary" : "text-muted-foreground",
              )}
            >
              Settings
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <UserIcon className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem disabled>
                <UserIcon className="mr-2 h-4 w-4" />
                <span>{user.username}</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => logout()}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden" aria-label="Open Menu">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left">
              <nav className="grid gap-6 text-lg font-medium">
                <Link
                  href="/dashboard"
                  className={cn(
                    "hover:text-primary",
                    pathname === "/dashboard" ? "text-primary" : "text-muted-foreground",
                  )}
                >
                  Dashboard
                </Link>
                <Link
                  href="/products"
                  className={cn(
                    "hover:text-primary",
                    pathname === "/products" ? "text-primary" : "text-muted-foreground",
                  )}
                >
                  Products
                </Link>
                <Link
                  href="/price-history"
                  className={cn(
                    "hover:text-primary",
                    pathname === "/price-history" ? "text-primary" : "text-muted-foreground",
                  )}
                >
                  Price History
                </Link>
                <Link
                  href="/api-logs"
                  className={cn(
                    "hover:text-primary",
                    pathname === "/api-logs" ? "text-primary" : "text-muted-foreground",
                  )}
                >
                  API Logs
                </Link>
                <Link
                  href="/settings"
                  className={cn(
                    "hover:text-primary",
                    pathname === "/settings" ? "text-primary" : "text-muted-foreground",
                  )}
                >
                  Settings
                </Link>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}

