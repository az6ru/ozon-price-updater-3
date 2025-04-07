"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useProductsStore } from "@/lib/stores/products-store"
import { Search, X } from "lucide-react"

export function ProductsFilters() {
  const [searchValue, setSearchValue] = useState("")
  const { filters, setFilters } = useProductsStore()

  const handleSearch = () => {
    setFilters({ ...filters, search: searchValue })
  }

  const clearSearch = () => {
    setSearchValue("")
    setFilters({ ...filters, search: null })
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch()
    }
  }

  return (
    <div className="flex flex-col gap-4 md:flex-row">
      <div className="relative flex-1">
        <Input
          placeholder="Search products..."
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          onKeyDown={handleKeyDown}
          className="pr-10"
        />
        {searchValue && (
          <Button variant="ghost" size="icon" className="absolute right-8 top-0 h-10 w-10" onClick={clearSearch}>
            <X className="h-4 w-4" />
            <span className="sr-only">Clear search</span>
          </Button>
        )}
        <Button variant="ghost" size="icon" className="absolute right-0 top-0 h-10 w-10" onClick={handleSearch}>
          <Search className="h-4 w-4" />
          <span className="sr-only">Search</span>
        </Button>
      </div>
      <div className="flex gap-2">
        <Select
          value={filters.active === null ? "all" : filters.active ? "active" : "inactive"}
          onValueChange={(value) => {
            setFilters({
              ...filters,
              active: value === "all" ? null : value === "active",
            })
          }}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={filters.has_stock === null ? "all" : filters.has_stock ? "in_stock" : "out_of_stock"}
          onValueChange={(value) => {
            setFilters({
              ...filters,
              has_stock: value === "all" ? null : value === "in_stock",
            })
          }}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Stock" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Stock</SelectItem>
            <SelectItem value="in_stock">In Stock</SelectItem>
            <SelectItem value="out_of_stock">Out of Stock</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}

