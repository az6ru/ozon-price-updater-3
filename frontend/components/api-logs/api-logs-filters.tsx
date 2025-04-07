"use client"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useApiLogsStore } from "@/lib/stores/api-logs-store"
import { cn, formatDate } from "@/lib/utils"
import { CalendarIcon } from "lucide-react"

export function ApiLogsFilters() {
  const { filters, setFilters } = useApiLogsStore()

  return (
    <div className="flex flex-col gap-4 md:flex-row">
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
      <div className="flex gap-2">
        <Select
          value={filters.success === null ? "all" : filters.success ? "success" : "error"}
          onValueChange={(value) => {
            setFilters({
              ...filters,
              success: value === "all" ? null : value === "success",
            })
          }}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="success">Success</SelectItem>
            <SelectItem value="error">Error</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}

