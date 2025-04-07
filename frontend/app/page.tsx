import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Package, BarChart, Settings } from "lucide-react"

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="px-4 lg:px-6 h-14 flex items-center border-b">
        <Link href="/" className="flex items-center justify-center">
          <span className="font-bold text-xl">Ozone Price Updater</span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Link href="/login" className="text-sm font-medium hover:underline underline-offset-4">
            Login
          </Link>
          <Link href="/register" className="text-sm font-medium hover:underline underline-offset-4">
            Register
          </Link>
        </nav>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                    Optimize Your Ozone Product Pricing
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    Automatically monitor and update your Ozone product prices to stay competitive and maximize your
                    profits.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Button asChild size="lg">
                    <Link href="/register">
                      Get Started
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="lg">
                    <Link href="/login">Login</Link>
                  </Button>
                </div>
              </div>
              <div className="flex items-center justify-center">
                <div className="relative h-full w-full">
                  <div className="bg-muted rounded-lg p-8 h-full flex flex-col justify-center">
                    <div className="grid gap-6">
                      <div className="flex items-center gap-4 rounded-lg border p-4">
                        <Package className="h-8 w-8 text-primary" />
                        <div className="space-y-1">
                          <h3 className="font-semibold">Product Management</h3>
                          <p className="text-sm text-muted-foreground">
                            Easily manage all your Ozone products in one place
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 rounded-lg border p-4">
                        <BarChart className="h-8 w-8 text-primary" />
                        <div className="space-y-1">
                          <h3 className="font-semibold">Price Monitoring</h3>
                          <p className="text-sm text-muted-foreground">Track price changes and history over time</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 rounded-lg border p-4">
                        <Settings className="h-8 w-8 text-primary" />
                        <div className="space-y-1">
                          <h3 className="font-semibold">Automated Updates</h3>
                          <p className="text-sm text-muted-foreground">
                            Set rules and let the system update prices automatically
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full border-t px-4 md:px-6">
        <p className="text-xs text-muted-foreground">© 2025 Ozone Price Updater. All rights reserved.</p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link href="#" className="text-xs hover:underline underline-offset-4">
            Terms of Service
          </Link>
          <Link href="#" className="text-xs hover:underline underline-offset-4">
            Privacy
          </Link>
        </nav>
      </footer>
    </div>
  )
}

