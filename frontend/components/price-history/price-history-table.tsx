"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/components/ui/use-toast"
import { useAuthStore } from "@/lib/stores/auth-store"
import { usePriceHistoryStore } from "@/lib/stores/price-history-store"
import { formatCurrency, formatDateTime, getApiUrl } from "@/lib/utils"

interface PriceHistory {
  id: string
  product_id: string
  product_name: string
  sku: string
  price: number
  old_price: number | null
  discount: number | null
  created_at: string
}

export function PriceHistoryTable() {
  const [history, setHistory] = useState<PriceHistory[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [isLoading, setIsLoading] = useState(true)

  const { toast } = useToast()
  const token = useAuthStore((state) => state.token)
  const { filters } = usePriceHistoryStore()

  useEffect(() => {
    fetchPriceHistory()
  }, [token, page, filters])

  const fetchPriceHistory = async () => {
    if (!token) return

    setIsLoading(true)
    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        per_page: "10",
      })

      if (filters.product_id) {
        queryParams.append("product_id", filters.product_id)
      }

      if (filters.start_date) {
        queryParams.append("start_date", filters.start_date.toISOString().split("T")[0])
      }

      if (filters.end_date) {
        queryParams.append("end_date", filters.end_date.toISOString().split("T")[0])
      }

      const response = await fetch(getApiUrl(`/api/price-history?${queryParams.toString()}`), {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) throw new Error("Failed to fetch price history")

      const data = await response.json()
      setHistory(data.items || [])
      setTotal(data.total || 0)
      setTotalPages(data.pages || 1)
    } catch (error) {
      console.error("Error fetching price history:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch price history",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead>Product Name</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Old Price</TableHead>
              <TableHead>Discount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : history.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  No price history found
                </TableCell>
              </TableRow>
            ) : (
              history.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{formatDateTime(item.created_at)}</TableCell>
                  <TableCell className="font-medium">{item.sku}</TableCell>
                  <TableCell>{item.product_name}</TableCell>
                  <TableCell>{formatCurrency(item.price)}</TableCell>
                  <TableCell>{item.old_price ? formatCurrency(item.old_price) : "-"}</TableCell>
                  <TableCell>{item.discount ? `${item.discount}%` : "-"}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Showing {history.length} of {total} records
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setPage(page - 1)} disabled={page === 1 || isLoading}>
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(page + 1)}
            disabled={page === totalPages || isLoading}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}

