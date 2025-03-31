"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/components/ui/use-toast"
import { useApiLogsStore } from "@/lib/stores/api-logs-store"
import { useAuthStore } from "@/lib/stores/auth-store"
import { formatDateTime, getApiUrl } from "@/lib/utils"
import { Eye } from "lucide-react"

interface ApiLog {
  id: string
  endpoint: string
  method: string
  status_code: number
  success: boolean
  request_data: any
  response_data: any
  created_at: string
}

export function ApiLogsTable() {
  const [logs, setLogs] = useState<ApiLog[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedLog, setSelectedLog] = useState<ApiLog | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const { toast } = useToast()
  const token = useAuthStore((state) => state.token)
  const { filters } = useApiLogsStore()

  useEffect(() => {
    fetchApiLogs()
  }, [token, page, filters])

  const fetchApiLogs = async () => {
    if (!token) return

    setIsLoading(true)
    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        per_page: "10",
      })

      if (filters.success !== null) {
        queryParams.append("success", filters.success.toString())
      }

      if (filters.start_date) {
        queryParams.append("start_date", filters.start_date.toISOString().split("T")[0])
      }

      if (filters.end_date) {
        queryParams.append("end_date", filters.end_date.toISOString().split("T")[0])
      }

      const response = await fetch(getApiUrl(`/api/api-logs?${queryParams.toString()}`), {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) throw new Error("Failed to fetch API logs")

      const data = await response.json()
      setLogs(data.items || [])
      setTotal(data.total || 0)
      setTotalPages(data.pages || 1)
    } catch (error) {
      console.error("Error fetching API logs:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch API logs",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const viewLogDetails = (log: ApiLog) => {
    setSelectedLog(log)
    setIsDialogOpen(true)
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Endpoint</TableHead>
              <TableHead>Method</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Result</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : logs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  No API logs found
                </TableCell>
              </TableRow>
            ) : (
              logs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell>{formatDateTime(log.created_at)}</TableCell>
                  <TableCell className="font-medium">{log.endpoint}</TableCell>
                  <TableCell>{log.method}</TableCell>
                  <TableCell>{log.status_code}</TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        log.success ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                      }`}
                    >
                      {log.success ? "Success" : "Error"}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => viewLogDetails(log)}>
                      <Eye className="h-4 w-4" />
                      <span className="sr-only">View Details</span>
                    </Button>
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
          Showing {logs.length} of {total} logs
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

      {/* Log Details Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>API Log Details</DialogTitle>
            <DialogDescription>Detailed information about the API request and response</DialogDescription>
          </DialogHeader>
          {selectedLog && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold mb-2">Request Information</h3>
                  <div className="text-sm space-y-1">
                    <p>
                      <span className="font-medium">Endpoint:</span> {selectedLog.endpoint}
                    </p>
                    <p>
                      <span className="font-medium">Method:</span> {selectedLog.method}
                    </p>
                    <p>
                      <span className="font-medium">Date:</span> {formatDateTime(selectedLog.created_at)}
                    </p>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Response Information</h3>
                  <div className="text-sm space-y-1">
                    <p>
                      <span className="font-medium">Status Code:</span> {selectedLog.status_code}
                    </p>
                    <p>
                      <span className="font-medium">Success:</span> {selectedLog.success ? "Yes" : "No"}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Request Data</h3>
                <pre className="bg-muted p-4 rounded-md text-xs overflow-x-auto">
                  {JSON.stringify(selectedLog.request_data, null, 2)}
                </pre>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Response Data</h3>
                <pre className="bg-muted p-4 rounded-md text-xs overflow-x-auto">
                  {JSON.stringify(selectedLog.response_data, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

