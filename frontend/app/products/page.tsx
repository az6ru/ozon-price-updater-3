"use client"

import type React from "react"

import { useEffect, useState } from "react"
import DashboardLayout from "@/components/layout/dashboard-layout"
import { api, type Product } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Loader2, Search, MoreHorizontal, RefreshCw, CheckCircle, Info, ArrowUpDown, ExternalLink, History, Plus } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/components/ui/use-toast"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"
import Link from "next/link"
import { Progress } from "@/components/ui/progress"

type SortField = "name" | "price" | "mrpc" | "discount" | "sku" | "id"
type SortOrder = "asc" | "desc"

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [totalItems, setTotalItems] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [perPage, setPerPage] = useState(10)
  const [search, setSearch] = useState("")
  const [activeFilter, setActiveFilter] = useState<boolean | undefined>(undefined)
  const [stockFilter, setStockFilter] = useState<boolean | undefined>(undefined)
  const [refreshing, setRefreshing] = useState(false)
  const [selectedProducts, setSelectedProducts] = useState<string[]>([])
  const [sortField, setSortField] = useState<SortField>("name")
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc")
  const [isMrpcDialogOpen, setIsMrpcDialogOpen] = useState(false)
  const [mrpcData, setMrpcData] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [statusText, setStatusText] = useState("")

  useEffect(() => {
    fetchProducts()
  }, [currentPage, perPage, activeFilter, stockFilter])

  const fetchProducts = async (searchTerm = search) => {
    setLoading(true)
    try {
      const response = await api.getProducts({
        page: currentPage,
        per_page: perPage,
        active: activeFilter,
        available: stockFilter,
        search: searchTerm || undefined,
      })

      setProducts(response.items)
      setTotalItems(response.total)
      setTotalPages(response.pages)
      setLoading(false)
    } catch (error) {
      console.error("Error fetching products:", error)
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setCurrentPage(1)
    fetchProducts()
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    try {
      await api.fetchProducts()
      await fetchProducts()
      toast({
        title: "Products refreshed",
        description: "Product data has been updated from Ozone API",
      })
    } catch (error) {
      console.error("Error refreshing products:", error)
      toast({
        title: "Refresh failed",
        description: "Could not refresh products from Ozone API",
        variant: "destructive",
      })
    } finally {
      setRefreshing(false)
    }
  }

  const toggleProductActive = async (productId: string, currentActive: boolean) => {
    try {
      if (currentActive) {
        await api.deactivateProduct(productId)
        toast({
          title: "Product deactivated",
          description: "Product monitoring has been deactivated",
        })
      } else {
        await api.activateProduct(productId)
        toast({
          title: "Product activated",
          description: "Product monitoring has been activated",
        })
      }

      // Update the product in the local state
      setProducts(products.map((p) => (p.id === productId ? { ...p, active: !currentActive } : p)))
    } catch (error) {
      console.error("Error toggling product active state:", error)
      toast({
        title: "Action failed",
        description: "Could not update product status",
        variant: "destructive",
      })
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("ru-RU", {
      style: "currency",
      currency: "RUB",
      minimumFractionDigits: 0,
    }).format(price)
  }

  const toggleSelectProduct = (productId: string) => {
    setSelectedProducts((prev) => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    )
  }

  const selectAllProducts = () => {
    if (selectedProducts.length === products.length) {
      setSelectedProducts([])
    } else {
      setSelectedProducts(products.map(p => p.id))
    }
  }

  const hasMrpcDiscrepancy = (product: Product) => {
    return product.mrpc && product.price && Math.abs(product.mrpc - product.price) > 100
  }

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortOrder("asc")
    }
  }

  const sortProducts = (products: Product[]) => {
    return [...products].sort((a, b) => {
      const aValue = a[sortField]
      const bValue = b[sortField]
      
      if (aValue === null || aValue === undefined) return sortOrder === "asc" ? 1 : -1
      if (bValue === null || bValue === undefined) return sortOrder === "asc" ? -1 : 1
      
      if (typeof aValue === "string" && typeof bValue === "string") {
        return sortOrder === "asc" 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue)
      }
      
      return sortOrder === "asc" 
        ? Number(aValue) - Number(bValue)
        : Number(bValue) - Number(aValue)
    })
  }

  const handleMrpcSubmit = async () => {
    try {
      // Проверяем, что данные не пустые
      if (!mrpcData.trim()) {
        toast({
          title: "Ошибка",
          description: "Введите данные для обновления МРЦ",
          variant: "destructive",
        })
        return
      }

      // Разбираем введенные данные
      const rows = mrpcData.trim().split("\n")
      const updates = []
      const errors = []

      for (let i = 0; i < rows.length; i++) {
        const row = rows[i].trim()
        if (!row) continue

        const parts = row.split(/\s+/)
        if (parts.length !== 2) {
          errors.push(`Строка ${i + 1}: неверный формат данных`)
          continue
        }

        const [sku, priceStr] = parts
        const price = parseFloat(priceStr)

        if (!sku) {
          errors.push(`Строка ${i + 1}: отсутствует SKU`)
          continue
        }

        if (isNaN(price) || price <= 0) {
          errors.push(`Строка ${i + 1}: неверная цена`)
          continue
        }

        updates.push({ sku, mrpc: price })
      }

      // Если есть ошибки, показываем их
      if (errors.length > 0) {
        toast({
          title: "Ошибки в данных",
          description: errors.join("\n"),
          variant: "destructive",
        })
        return
      }

      // Если нет обновлений, показываем ошибку
      if (updates.length === 0) {
        toast({
          title: "Ошибка",
          description: "Нет данных для обновления",
          variant: "destructive",
        })
        return
      }

      console.log("Отправляем данные:", updates)

      // Отправляем данные на сервер
      await api.updateBulkMrpc(updates)

      toast({
        title: "МРЦ обновлены",
        description: `Успешно обновлено ${updates.length} товаров`,
      })

      setIsMrpcDialogOpen(false)
      setMrpcData("")
      fetchProducts() // Обновляем список товаров
    } catch (error) {
      console.error("Error updating MRPC:", error)
      toast({
        title: "Ошибка",
        description: error instanceof Error ? error.message : "Не удалось обновить МРЦ",
        variant: "destructive",
      })
    }
  }

  const fetchData = async () => {
    setIsLoading(true)
    setProgress(0)
    setStatusText("Получение данных о товарах...")
    
    try {
      // Получаем данные о товарах
      setProgress(20)
      await api.monitorProducts()
      
      // Получаем цены с витрины
      setProgress(60)
      setStatusText("Получение цен с витрины...")
      await api.fetchFrontPrices()
      
      // Обновляем список товаров
      setProgress(80)
      setStatusText("Обновление списка товаров...")
      await fetchProducts()
      
      setProgress(100)
      setStatusText("Данные успешно обновлены")
      
      toast({
        title: "Успех",
        description: "Данные о товарах успешно обновлены",
      })
    } catch (error) {
      console.error("Error fetching data:", error)
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Не удалось получить данные о товарах",
      })
    } finally {
      setIsLoading(false)
      // Сбрасываем статус через 3 секунды
      setTimeout(() => {
        setProgress(0)
        setStatusText("")
      }, 3000)
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Управление товарами</h1>
          <div className="flex space-x-2">
            {selectedProducts.length > 0 && (
              <Button variant="outline">
                Действия с выбранными ({selectedProducts.length})
              </Button>
            )}
          <Button onClick={fetchData} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Обновление...
              </>
            ) : (
              <>
                Получить/Обновить данные
              </>
            )}
          </Button>
            <Button onClick={() => setIsMrpcDialogOpen(true)} variant="outline">
              <Plus className="mr-2 h-4 w-4" />
              Массовое добавление МРЦ
            </Button>
          </div>
        </div>

        {(isLoading || statusText) && (
          <div className="mb-4 space-y-2">
            <Progress value={progress} />
            <p className="text-sm text-muted-foreground">{statusText}</p>
          </div>
        )}

        <div className="flex flex-col space-y-4 md:flex-row md:items-end md:justify-between md:space-y-0">
          <form onSubmit={handleSearch} className="flex w-full max-w-sm items-center space-x-2">
            <Input
              type="search"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Button type="submit">
              <Search className="h-4 w-4" />
            </Button>
          </form>

          <div className="flex flex-wrap gap-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="activeFilter"
                checked={activeFilter === true}
                onCheckedChange={(checked) => {
                  setActiveFilter(checked ? true : undefined)
                }}
              />
              <Label htmlFor="activeFilter">Active only</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="inactiveFilter"
                checked={activeFilter === false}
                onCheckedChange={(checked) => {
                  setActiveFilter(checked ? false : undefined)
                }}
              />
              <Label htmlFor="inactiveFilter">Inactive only</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="stockFilter"
                checked={stockFilter === true}
                onCheckedChange={(checked) => {
                  setStockFilter(checked ? true : undefined)
                }}
              />
              <Label htmlFor="stockFilter">Только в наличии</Label>
            </div>
          </div>
        </div>

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
                    <TableHead className="w-10">
                      <Checkbox 
                        checked={selectedProducts.length === products.length && products.length > 0} 
                        onCheckedChange={selectAllProducts}
                      />
                    </TableHead>
                    <TableHead>
                      <Button variant="ghost" className="flex items-center gap-1" onClick={() => toggleSort("name")}>
                        Название
                        <ArrowUpDown className="h-4 w-4" />
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button variant="ghost" className="flex items-center gap-1" onClick={() => toggleSort("id")}>
                        ID
                        <ArrowUpDown className="h-4 w-4" />
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button variant="ghost" className="flex items-center gap-1" onClick={() => toggleSort("sku")}>
                        SKU
                        <ArrowUpDown className="h-4 w-4" />
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button variant="ghost" className="flex items-center gap-1" onClick={() => toggleSort("price")}>
                        Цена
                        <ArrowUpDown className="h-4 w-4" />
                      </Button>
                    </TableHead>
                    <TableHead>Front Price</TableHead>
                    <TableHead>
                      <Button variant="ghost" className="flex items-center gap-1" onClick={() => toggleSort("mrpc")}>
                        MRPC
                        <ArrowUpDown className="h-4 w-4" />
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button variant="ghost" className="flex items-center gap-1" onClick={() => toggleSort("discount")}>
                        Скидка
                        <ArrowUpDown className="h-4 w-4" />
                      </Button>
                    </TableHead>
                    <TableHead>Статус</TableHead>
                    <TableHead>Наличие</TableHead>
                    <TableHead className="text-right">Действия</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.length > 0 ? (
                    sortProducts(products).map((product) => (
                      <TableRow 
                        key={product.id} 
                        className={hasMrpcDiscrepancy(product) ? "bg-red-50" : undefined}
                      >
                        <TableCell>
                          <Checkbox 
                            checked={selectedProducts.includes(product.id)} 
                            onCheckedChange={() => toggleSelectProduct(product.id)}
                          />
                        </TableCell>
                        <TableCell className="font-medium max-w-[300px] truncate">
                          {product.name}
                        </TableCell>
                        <TableCell>
                          <Link 
                            href={`/price-history/${product.id}`}
                            className="flex items-center gap-1 text-blue-500 hover:underline"
                          >
                            {product.product_id || "—"}
                            <History className="h-4 w-4" />
                          </Link>
                        </TableCell>
                        <TableCell>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <a 
                                  href={`https://www.ozon.ru/product/${product.sku}`}
                                  target="_blank" 
                                  rel="noopener noreferrer" 
                                  className="flex items-center gap-1 text-blue-500 hover:underline"
                                >
                                  {product.sku}
                                  <ExternalLink className="h-4 w-4" />
                                </a>
                              </TooltipTrigger>
                              <TooltipContent>
                                Открыть в Ozon
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </TableCell>
                        <TableCell>
                          <HoverCard>
                            <HoverCardTrigger>
                              <div className="flex items-center gap-1 cursor-help">
                            <span>{formatPrice(product.price)}</span>
                                <Info className="h-4 w-4 text-muted-foreground" />
                              </div>
                            </HoverCardTrigger>
                            <HoverCardContent className="w-60">
                              <div className="space-y-2">
                                <h4 className="text-sm font-semibold">Подробная информация о ценах</h4>
                                <div className="text-sm grid grid-cols-2 gap-1">
                                  <span className="text-muted-foreground">Текущая:</span>
                                  <span className="font-medium">{formatPrice(product.price)}</span>
                                  
                            {product.old_price && (
                                    <>
                                      <span className="text-muted-foreground">Старая:</span>
                                      <span className="line-through">{formatPrice(product.old_price)}</span>
                                    </>
                                  )}
                                  
                                  {product.marketing_price && (
                                    <>
                                      <span className="text-muted-foreground">Маркетинг:</span>
                                      <span className="text-blue-500">{formatPrice(product.marketing_price)}</span>
                                    </>
                                  )}
                                  
                                  {product.min_price && (
                                    <>
                                      <span className="text-muted-foreground">Мин. цена:</span>
                                      <span>{formatPrice(product.min_price)}</span>
                                    </>
                            )}
                          </div>
                              </div>
                            </HoverCardContent>
                          </HoverCard>
                        </TableCell>
                        <TableCell>{product.front_price ? formatPrice(product.front_price) : "—"}</TableCell>
                        <TableCell>
                          {hasMrpcDiscrepancy(product) ? (
                            <div className="flex items-center text-red-500">
                              {product.mrpc ? formatPrice(product.mrpc) : "—"}
                            </div>
                          ) : (
                            product.mrpc ? formatPrice(product.mrpc) : "—"
                          )}
                        </TableCell>
                        <TableCell>{product.discount ? `${product.discount}%` : "—"}</TableCell>
                        <TableCell>
                          <Badge variant={product.active ? "default" : "outline"}>
                            {product.active ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={product.available ? "default" : "destructive"}
                            className={product.available ? "bg-green-100 text-green-800" : ""}
                          >
                            {product.available ? "Да" : "Нет"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Действия</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => toggleProductActive(product.id, product.active)}>
                                {product.active ? "Деактивировать" : "Активировать"}
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <Link href={`/price-history/${product.id}`}>
                                  История цен
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => {
                                  toast({
                                    title: "Редактирование товара",
                                    description: "Функция редактирования будет добавлена позже",
                                  })
                                }}
                              >
                                Редактировать
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={11} className="h-24 text-center">
                        Товары не найдены.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Showing {products.length} of {totalItems} products
              </div>
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        setCurrentPage(Math.max(1, currentPage - 1));
                      }}
                      aria-disabled={currentPage === 1}
                    />
                  </PaginationItem>
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pageNumber = currentPage <= 3 ? i + 1 : currentPage + i - 2

                    if (pageNumber <= totalPages) {
                      return (
                        <PaginationItem key={pageNumber}>
                          <PaginationLink
                            isActive={currentPage === pageNumber}
                            onClick={(e) => {
                              e.preventDefault();
                              setCurrentPage(pageNumber);
                            }}
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
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        setCurrentPage(Math.min(totalPages, currentPage + 1));
                      }}
                      aria-disabled={currentPage === totalPages}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          </>
        )}

        <Dialog open={isMrpcDialogOpen} onOpenChange={setIsMrpcDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Массовое добавление МРЦ</DialogTitle>
              <DialogDescription>
                <p className="mb-2">
                  Введите данные в формате "SKU[Tab]PRICE", по одной записи на строку.
                  Скопируйте данные из Excel и вставьте их прямо в поле ниже.
                </p>
                <p className="mb-2">Требования к данным:</p>
                <ul className="list-disc list-inside mb-2 text-sm">
                  <li>SKU должен быть указан полностью</li>
                  <li>Цена должна быть положительным числом</li>
                  <li>Разделитель между SKU и ценой - знак табуляции</li>
                </ul>
                <p className="mb-2">Пример правильного формата:</p>
                <pre className="bg-muted p-2 rounded-md text-sm font-mono">
                  1772763094	1400{"\n"}
                  1667595684	1500{"\n"}
                  1666534105	1900{"\n"}
                  1666526740	1900
                </pre>
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <Textarea
                value={mrpcData}
                onChange={(e) => setMrpcData(e.target.value)}
                placeholder="Вставьте данные в формате SKU[Tab]PRICE..."
                className="font-mono min-h-[200px]"
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => {
                setMrpcData("")
                setIsMrpcDialogOpen(false)
              }}>
                Отмена
              </Button>
              <Button onClick={handleMrpcSubmit} disabled={!mrpcData.trim()}>
                Обновить МРЦ
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}

