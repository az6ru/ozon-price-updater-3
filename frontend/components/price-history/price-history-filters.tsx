"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { usePriceHistoryStore } from "@/lib/stores/price-history-store"
import { cn, formatDate } from "@/lib/utils"
import { CalendarIcon, Search, X } from "lucide-react"

export function PriceHistoryFilters() {
  const [productId, setProductId] = useState("")
  const { filters, setFilters } = usePriceHistoryStore()

  const handleSearch = () => {
    setFilters({ ...filters, product_id: productId || null })
  }

  const clearSearch = () => {
    setProductId("")
    setFilters({ ...filters, product_id: null })
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
          placeholder="Search by product ID or SKU..."
          value={productId}
          onChange={(e) => setProductId(e.target.value)}
          onKeyDown={handleKeyDown}
          className="pr-10"
        />
        {productId && (
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
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-[180px] justify-start text-left font-normal",
                !filters.start_date && "text-muted-foreground",
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {filters.start_date ? formatDate(filters.start_date) : <span>Start Date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={filters.start_date || undefined}
              onSelect={(date) => setFilters({ ...filters, start_date: date || null })}
              initialFocus
            />
          </PopoverContent>
        </Popover>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-[180px] justify-start text-left font-normal",
                !filters.end_date && "text-muted-foreground",
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {filters.end_date ? formatDate(filters.end_date) : <span>End Date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={filters.end_date || undefined}
              onSelect={(date) => setFilters({ ...filters, end_date: date || null })}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  )
}

