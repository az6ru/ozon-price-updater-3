"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { useAuthStore } from "@/lib/stores/auth-store"
import { RefreshCw } from "lucide-react"
import { getApiUrl } from "@/lib/utils"

export function DashboardHeader() {
  const [isLoading, setIsLoading] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<string | null>(null)
  const { toast } = useToast()
  const token = useAuthStore((state) => state.token)

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    if (!token) return

    try {
      const response = await fetch(getApiUrl("/api/settings"), {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) throw new Error("Failed to fetch settings")

      const data = await response.json()
      if (data.last_update) {
        setLastUpdate(new Date(data.last_update).toLocaleString())
      }
    } catch (error) {
      console.error("Error fetching settings:", error)
    }
  }

  const handleFetchProducts = async () => {
    if (!token) return

    setIsLoading(true)
    try {
      const response = await fetch(getApiUrl("/api/products/fetch"), {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) throw new Error("Failed to fetch products")

      toast({
        title: "Products updated",
        description: "Product data has been successfully fetched from Ozon API",
      })

      // Refresh settings to get the new last_update time
      fetchSettings()
    } catch (error) {
      console.error("Error fetching products:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch products from Ozon API",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">{lastUpdate ? `Last update: ${lastUpdate}` : "No recent updates"}</p>
      </div>
      <Button onClick={handleFetchProducts} disabled={isLoading}>
        {isLoading ? (
          <>
            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
            Updating...
          </>
        ) : (
          <>
            <RefreshCw className="mr-2 h-4 w-4" />
            Update Products
          </>
        )}
      </Button>
    </div>
  )
}

