"use client"

import { useEffect, useState } from "react"
import DashboardLayout from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { api, type Product } from "@/lib/api"
import { Loader2, RefreshCw, Package, AlertTriangle, CheckCircle, Clock } from "lucide-react"
import Link from "next/link"

export default function DashboardPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    withStock: 0,
  })
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<string | null>(null)
  const [nextUpdate, setNextUpdate] = useState<string | null>(null)

  useEffect(() => {
    fetchData()
    fetchSettings()
  }, [])

  const fetchData = async () => {
    try {
      const response = await api.getProducts({ per_page: 5 })
      setProducts(response.items)

      // Calculate stats
      const totalProducts = response.total
      const activeProducts = response.items.filter((p) => p.active).length
      const withStockProducts = response.items.filter((p) => p.has_stock).length

      setStats({
        total: totalProducts,
        active: activeProducts,
        inactive: totalProducts - activeProducts,
        withStock: withStockProducts,
      })

      setLoading(false)
    } catch (error) {
      console.error("Error fetching products:", error)
      setLoading(false)
    }
  }

  const fetchSettings = async () => {
    try {
      const settings = await api.getSettings()
      setLastUpdate(settings.last_update || null)
      setNextUpdate(settings.next_update || null)
    } catch (error) {
      console.error("Error fetching settings:", error)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    try {
      await api.fetchProducts()
      await fetchData()
    } catch (error) {
      console.error("Error refreshing products:", error)
    } finally {
      setRefreshing(false)
    }
  }

  const formatDateTime = (dateString: string | null) => {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleString()
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex h-[calc(100vh-10rem)] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <Button onClick={handleRefresh} disabled={refreshing}>
            {refreshing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Refreshing...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh Products
              </>
            )}
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Products</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground">Products in your catalog</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Monitoring</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.active}</div>
              <p className="text-xs text-muted-foreground">Products being monitored</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Inactive Products</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.inactive}</div>
              <p className="text-xs text-muted-foreground">Products not being monitored</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">With Stock</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.withStock}</div>
              <p className="text-xs text-muted-foreground">Products with available stock</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Recent Products</CardTitle>
              <CardDescription>Your most recently updated products</CardDescription>
            </CardHeader>
            <CardContent>
              {products.length > 0 ? (
                <div className="space-y-4">
                  {products.map((product) => (
                    <div key={product.id} className="flex items-center justify-between border-b pb-2">
                      <div className="flex flex-col">
                        <span className="font-medium">{product.name}</span>
                        <span className="text-sm text-muted-foreground">SKU: {product.sku}</span>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="font-medium">{product.price} ₽</span>
                        {product.old_price && (
                          <span className="text-sm text-muted-foreground line-through">{product.old_price} ₽</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No products found</p>
              )}
              <div className="mt-4">
                <Button asChild variant="outline" className="w-full">
                  <Link href="/products">View All Products</Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>System Status</CardTitle>
              <CardDescription>Current system status and update schedule</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Last Update:</span>
                  <span className="flex items-center text-sm">
                    <Clock className="mr-1 h-4 w-4 text-muted-foreground" />
                    {formatDateTime(lastUpdate)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Next Update:</span>
                  <span className="flex items-center text-sm">
                    <Clock className="mr-1 h-4 w-4 text-muted-foreground" />
                    {formatDateTime(nextUpdate)}
                  </span>
                </div>
                <div className="pt-4">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={async () => {
                      try {
                        await api.updatePrices()
                        await fetchSettings()
                      } catch (error) {
                        console.error("Error updating prices:", error)
                      }
                    }}
                  >
                    Update Prices Now
                  </Button>
                </div>
                <div>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={async () => {
                      try {
                        await api.fetchFrontPrices()
                        await fetchSettings()
                      } catch (error) {
                        console.error("Error fetching front prices:", error)
                      }
                    }}
                  >
                    Fetch Front Prices
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}

