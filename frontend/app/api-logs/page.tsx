"use client"

import { useEffect, useState } from "react"
import DashboardLayout from "@/components/layout/dashboard-layout"
import { api, type ApiLog } from "@/lib/api"
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
import { Badge } from "@/components/ui/badge"
import { Loader2, Clock } from "lucide-react"

export default function ApiLogsPage() {
  const [logs, setLogs] = useState<ApiLog[]>([])
  const [loading, setLoading] = useState(true)
  const [totalItems, setTotalItems] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [perPage, setPerPage] = useState(10)
  const [startDate, setStartDate] = useState<string>("")
  const [endDate, setEndDate] = useState<string>("")
  const [success, setSuccess] = useState<string>("all")

  useEffect(() => {
    fetchLogs()
  }, [currentPage, perPage])

  const fetchLogs = async () => {
    setLoading(true)
    try {
      const successFilter = success === "all" ? undefined : success === "success"

      const response = await api.getApiLogs({
        page: currentPage,
        per_page: perPage,
        start_date: startDate || undefined,
        end_date: endDate || undefined,
        success: successFilter,
      })

      setLogs(response.items)
      setTotalItems(response.total)
      setTotalPages(response.pages)
    } catch (error) {
      console.error("Error fetching API logs:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleFilter = () => {
    setCurrentPage(1)
    fetchLogs()
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">API Logs</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Filter API Logs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              <div className="space-y-2">
                <Label htmlFor="success">Status</Label>
                <Select value={success} onValueChange={(value) => setSuccess(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="success">Success</SelectItem>
                    <SelectItem value="error">Error</SelectItem>
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
                    <TableHead>Endpoint</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Status Code</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.length > 0 ? (
                    logs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell className="font-medium">{log.endpoint}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{log.method}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={log.success ? "success" : "destructive"}>
                            {log.success ? "Success" : "Error"}
                          </Badge>
                        </TableCell>
                        <TableCell>{log.status_code}</TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                            {formatDateTime(log.created_at)}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center">
                        No API logs found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Showing {logs.length} of {totalItems} logs
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

