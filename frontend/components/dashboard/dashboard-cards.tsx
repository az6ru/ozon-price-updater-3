"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuthStore } from "@/lib/stores/auth-store"
import { Package, PackageCheck, PackageX, Percent } from "lucide-react"
import { getApiUrl } from "@/lib/utils"

interface DashboardStats {
  totalProducts: number
  activeProducts: number
  inactiveProducts: number
  averageDiscount: number
}

export function DashboardCards() {
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    activeProducts: 0,
    inactiveProducts: 0,
    averageDiscount: 0,
  })
  const [isLoading, setIsLoading] = useState(true)
  const token = useAuthStore((state) => state.token)

  useEffect(() => {
    fetchStats()
  }, [token])

  const fetchStats = async () => {
    if (!token) return

    setIsLoading(true)
    try {
      // Fetch all products to calculate stats
      const response = await fetch(getApiUrl("/api/products?per_page=1000"), {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) throw new Error("Failed to fetch products")

      const data = await response.json()
      const products = data.items || []

      // Calculate stats
      const activeProducts = products.filter((p: any) => p.active).length
      const inactiveProducts = products.length - activeProducts

      // Calculate average discount
      let totalDiscount = 0
      let productsWithDiscount = 0

      products.forEach((product: any) => {
        if (product.discount !== null && product.discount > 0) {
          totalDiscount += product.discount
          productsWithDiscount++
        }
      })

      const averageDiscount =
        productsWithDiscount > 0 ? Math.round((totalDiscount / productsWithDiscount) * 10) / 10 : 0

      setStats({
        totalProducts: products.length,
        activeProducts,
        inactiveProducts,
        averageDiscount,
      })
    } catch (error) {
      console.error("Error fetching stats:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Products</CardTitle>
          <Package className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{isLoading ? "..." : stats.totalProducts}</div>
          <p className="text-xs text-muted-foreground">Total products in your catalog</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Products</CardTitle>
          <PackageCheck className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{isLoading ? "..." : stats.activeProducts}</div>
          <p className="text-xs text-muted-foreground">Products being actively monitored</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Inactive Products</CardTitle>
          <PackageX className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{isLoading ? "..." : stats.inactiveProducts}</div>
          <p className="text-xs text-muted-foreground">Products not being monitored</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Average Discount</CardTitle>
          <Percent className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{isLoading ? "..." : `${stats.averageDiscount}%`}</div>
          <p className="text-xs text-muted-foreground">Average discount across products</p>
        </CardContent>
      </Card>
    </div>
  )
}

