"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/components/ui/use-toast"
import { useAuthStore } from "@/lib/stores/auth-store"
import { useProductsStore } from "@/lib/stores/products-store"
import { formatCurrency, getApiUrl } from "@/lib/utils"
import { Edit, Power, PowerOff } from "lucide-react"

interface Product {
  id: string
  sku: string
  name: string
  price: number
  old_price: number | null
  discount: number | null
  mrpc: number | null
  active: boolean
  has_stock: boolean
}

export function ProductsTable() {
  const [products, setProducts] = useState<Product[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editValues, setEditValues] = useState({
    mrpc: "",
    discount: "",
  })

  const { toast } = useToast()
  const token = useAuthStore((state) => state.token)
  const { filters } = useProductsStore()

  useEffect(() => {
    fetchProducts()
  }, [token, page, filters])

  const fetchProducts = async () => {
    if (!token) return

    setIsLoading(true)
    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        per_page: "10",
      })

      if (filters.active !== null) {
        queryParams.append("active", filters.active.toString())
      }

      if (filters.has_stock !== null) {
        queryParams.append("has_stock", filters.has_stock.toString())
      }

      if (filters.search) {
        queryParams.append("search", filters.search)
      }

      const response = await fetch(getApiUrl(`/api/products?${queryParams.toString()}`), {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) throw new Error("Failed to fetch products")

      const data = await response.json()
      setProducts(data.items || [])
      setTotal(data.total || 0)
      setTotalPages(data.pages || 1)
    } catch (error) {
      console.error("Error fetching products:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch products",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleToggleActive = async (product: Product) => {
    if (!token) return

    try {
      const endpoint = product.active
        ? getApiUrl(`/api/products/${product.id}/deactivate`)
        : getApiUrl(`/api/products/${product.id}/activate`)

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) throw new Error("Failed to update product status")

      toast({
        title: "Product updated",
        description: `Product ${product.active ? "deactivated" : "activated"} successfully`,
      })

      // Refresh products
      fetchProducts()
    } catch (error) {
      console.error("Error updating product:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update product status",
      })
    }
  }

  const openEditDialog = (product: Product) => {
    setSelectedProduct(product)
    setEditValues({
      mrpc: product.mrpc?.toString() || "",
      discount: product.discount?.toString() || "",
    })
    setIsDialogOpen(true)
  }

  const handleSaveEdit = async () => {
    if (!token || !selectedProduct) return

    try {
      const mrpc = editValues.mrpc ? Number.parseFloat(editValues.mrpc) : null
      const discount = editValues.discount ? Number.parseFloat(editValues.discount) : null

      const response = await fetch(getApiUrl(`/api/products/${selectedProduct.id}`), {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          mrpc,
          discount,
        }),
      })

      if (!response.ok) throw new Error("Failed to update product")

      toast({
        title: "Product updated",
        description: "Product details updated successfully",
      })

      setIsDialogOpen(false)
      fetchProducts()
    } catch (error) {
      console.error("Error updating product:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update product",
      })
    }
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>SKU</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Old Price</TableHead>
              <TableHead>Discount</TableHead>
              <TableHead>MRPC</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={9} className="h-24 text-center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : products.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="h-24 text-center">
                  No products found
                </TableCell>
              </TableRow>
            ) : (
              products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="font-medium">{product.sku}</TableCell>
                  <TableCell>{product.name}</TableCell>
                  <TableCell>{formatCurrency(product.price)}</TableCell>
                  <TableCell>{product.old_price ? formatCurrency(product.old_price) : "-"}</TableCell>
                  <TableCell>{product.discount ? `${product.discount}%` : "-"}</TableCell>
                  <TableCell>{product.mrpc ? formatCurrency(product.mrpc) : "-"}</TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        product.active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                      }`}
                    >
                      {product.active ? "Active" : "Inactive"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        product.has_stock ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {product.has_stock ? "In Stock" : "Out of Stock"}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => openEditDialog(product)}>
                        <Edit className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleToggleActive(product)}>
                        {product.active ? <PowerOff className="h-4 w-4" /> : <Power className="h-4 w-4" />}
                        <span className="sr-only">{product.active ? "Deactivate" : "Activate"}</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Showing {products.length} of {total} products
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

      {/* Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
            <DialogDescription>Update the MRPC and discount for this product.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="mrpc" className="text-right">
                MRPC
              </label>
              <Input
                id="mrpc"
                type="number"
                step="0.01"
                min="0"
                value={editValues.mrpc}
                onChange={(e) => setEditValues({ ...editValues, mrpc: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="discount" className="text-right">
                Discount (%)
              </label>
              <Input
                id="discount"
                type="number"
                step="0.1"
                min="0"
                max="100"
                value={editValues.discount}
                onChange={(e) => setEditValues({ ...editValues, discount: e.target.value })}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit}>Save changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

