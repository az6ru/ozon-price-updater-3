import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"

export function ProductsHeader() {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Products</h1>
        <p className="text-muted-foreground">Manage and monitor your Ozone products</p>
      </div>
      <div className="flex gap-2">
        <Button>
          <RefreshCw className="mr-2 h-4 w-4" />
          Update Prices
        </Button>
      </div>
    </div>
  )
}

