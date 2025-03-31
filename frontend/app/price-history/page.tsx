"use client"

import { useEffect, useState } from "react"
import DashboardLayout from "@/components/layout/dashboard-layout"
import { api, type PriceHistory, type Product } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Calendar } from "lucide-react"

export default function PriceHistoryPage() {
  const [priceHistory, setPriceHistory] = useState<PriceHistory[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [totalItems, setTotalItems] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [perPage, setPerPage] = useState(10)
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null)
  const [startDate, setStartDate] = useState<string>("")
  const [endDate, setEndDate] = useState<string>("")

  useEffect(() => {
    fetchProducts()
    fetchPriceHistory()
  }, [currentPage, perPage])

  const fetchProducts = async () => {
    try {
      const response = await api.getProducts({ per_page: 100 })
      setProducts(response.items)
    } catch (error) {
      console.error("Error fetching products:", error)
    }
  }

  const fetchPriceHistory = async () => {
    setLoading(true)
    try {
      const response = await api.getPriceHistory({
        page: currentPage,
        per_page: perPage,
        product_id: selectedProduct || undefined,
        start_date: startDate || undefined,
        end_date: endDate || undefined,
      })

      setPriceHistory(response.items)
      setTotalItems(response.total)
      setTotalPages(response.pages)
    } catch (error) {
      console.error("Error fetching price history:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleFilter = () => {
    setCurrentPage(1)
    fetchPriceHistory()
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("ru-RU", {
      style: "currency",
      currency: "RUB",
      minimumFractionDigits: 0,
    }).format(price)
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  const getProductName = (productId: string) => {
    const product = products.find((p) => p.id === productId)
    return product ? product.name : productId
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Price History</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Filter Price History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              <div className="space-y-2">
                <Label htmlFor="product">Product</Label>
                <Select value={selectedProduct || ""} onValueChange={(value) => setSelectedProduct(value || null)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Products" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Products</SelectItem>
                    {products.map((product) => (
                      <SelectItem key={product.id} value={product.id}>
                        {product.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date</Label>
                <div className="flex">
                  <Input id="startDate" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">End Date</Label>
                <div className="flex">
                  <Input id="endDate" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                </div>
              </div>
              <div className="flex items-end">
                <Button onClick={handleFilter} className="w-full">
                  Apply Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {loading ? (
          <div className="flex h-96 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Old Price</TableHead>
                    <TableHead>Change</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {priceHistory.length > 0 ? (
                    priceHistory.map((history) => {
                      const priceChange = history.old_price
                        ? ((history.price - history.old_price) / history.old_price) * 100
                        : 0

                      return (
                        <TableRow key={history.id}>
                          <TableCell className="font-medium">{getProductName(history.product_id)}</TableCell>
                          <TableCell>{formatPrice(history.price)}</TableCell>
                          <TableCell>{history.old_price ? formatPrice(history.old_price) : "-"}</TableCell>
                          <TableCell>
                            {history.old_price ? (
                              <span className={priceChange >= 0 ? "text-green-600" : "text-red-600"}>
                                {priceChange >= 0 ? "+" : ""}
                                {priceChange.toFixed(2)}%
                              </span>
                            ) : (
                              "-"
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                              {formatDateTime(history.created_at)}
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center">
                        No price history found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Showing {priceHistory.length} of {totalItems} records
              </div>
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                    />
                  </PaginationItem>
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pageNumber = currentPage <= 3 ? i + 1 : currentPage + i - 2

                    if (pageNumber <= totalPages) {
                      return (
                        <PaginationItem key={pageNumber}>
                          <PaginationLink
                            isActive={currentPage === pageNumber}
                            onClick={() => setCurrentPage(pageNumber)}
                          >
                            {pageNumber}
                          </PaginationLink>
                        </PaginationItem>
                      )
                    }
                    return null
                  })}
                  <PaginationItem>
                    <PaginationNext
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  )
}

