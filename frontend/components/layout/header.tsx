"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Menu, Package, History, FileText, Settings, LogOut, UserIcon } from "lucide-react"

export default function Header() {
  const { user, logout, isAuthenticated } = useAuth()
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: Package },
    { name: "Products", href: "/products", icon: Package },
    { name: "Price History", href: "/price-history", icon: History },
    { name: "API Logs", href: "/api-logs", icon: FileText },
    { name: "Settings", href: "/settings", icon: Settings },
  ]

  const userInitials = user?.username ? user.username.substring(0, 2).toUpperCase() : "U"

  const closeSheet = () => setOpen(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 flex">
          <Link href="/" className="flex items-center space-x-2">
            <span className="font-bold text-xl">Ozone Price Updater</span>
          </Link>
        </div>

        {/* Mobile menu */}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="outline" size="icon" className="mr-2">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left">
            <SheetHeader>
              <SheetTitle>Ozone Price Updater</SheetTitle>
            </SheetHeader>
            <nav className="flex flex-col gap-4 mt-4">
              {isAuthenticated &&
                navigation.map((item) => {
                  const Icon = item.icon
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={closeSheet}
                      className={`flex items-center gap-2 text-sm font-medium ${
                        pathname === item.href ? "text-primary" : "text-muted-foreground"
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      {item.name}
                    </Link>
                  )
                })}
              {!isAuthenticated && (
                <>
                  <Link href="/login" onClick={closeSheet} className="flex items-center gap-2 text-sm font-medium">
                    <UserIcon className="h-5 w-5" />
                    Login
                  </Link>
                  <Link href="/register" onClick={closeSheet} className="flex items-center gap-2 text-sm font-medium">
                    <UserIcon className="h-5 w-5" />
                    Register
                  </Link>
                </>
              )}
            </nav>
          </SheetContent>
        </Sheet>

        {/* Desktop navigation */}
        <nav className="hidden md:flex md:flex-1 md:items-center md:justify-between">
          <div className="flex items-center space-x-4">
            {isAuthenticated &&
              navigation.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-muted hover:text-primary"
                    }`}
                  >
                    {item.name}
                  </Link>
                )
              })}
          </div>
        </nav>

        <div className="flex flex-1 items-center justify-end">
          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>{userInitials}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile">
                    <UserIcon className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/settings">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="hidden md:flex md:items-center md:space-x-4">
              <Button asChild variant="ghost">
                <Link href="/login">Login</Link>
              </Button>
              <Button asChild>
                <Link href="/register">Register</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

