"use client"

import { useEffect, useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { useAuthStore } from "@/lib/stores/auth-store"
import { Loader2, RefreshCw } from "lucide-react"
import { getApiUrl } from "@/lib/utils"

const formSchema = z.object({
  ozon_client_id: z.string().min(1, "Ozon Client ID is required"),
  ozon_api_key: z.string().min(1, "Ozon API Key is required"),
  front_price_api_url: z.string().url("Must be a valid URL"),
  monitoring_interval: z.coerce.number().int().min(1, "Must be at least 1 minute"),
  price_update_interval: z.coerce.number().int().min(1, "Must be at least 1 minute"),
})

export function SettingsForm() {
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isGeneratingSecret, setIsGeneratingSecret] = useState(false)
  const [secretKey, setSecretKey] = useState("")
  const { toast } = useToast()
  const token = useAuthStore((state) => state.token)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      ozon_client_id: "",
      ozon_api_key: "",
      front_price_api_url: "",
      monitoring_interval: 15,
      price_update_interval: 60,
    },
  })

  useEffect(() => {
    fetchSettings()
  }, [token])

  const fetchSettings = async () => {
    if (!token) return

    setIsLoading(true)
    try {
      const response = await fetch(getApiUrl("/api/settings"), {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) throw new Error("Failed to fetch settings")

      const data = await response.json()

      form.reset({
        ozon_client_id: data.ozon_client_id,
        ozon_api_key: data.ozon_api_key,
        front_price_api_url: data.front_price_api_url,
        monitoring_interval: data.monitoring_interval,
        price_update_interval: data.price_update_interval,
      })

      setSecretKey(data.secret_key)
    } catch (error) {
      console.error("Error fetching settings:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch settings",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!token) return

    setIsSaving(true)
    try {
      const response = await fetch(getApiUrl("/api/settings"), {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      })

      if (!response.ok) throw new Error("Failed to update settings")

      toast({
        title: "Settings updated",
        description: "Your settings have been saved successfully",
      })
    } catch (error) {
      console.error("Error updating settings:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update settings",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleGenerateSecret = async () => {
    if (!token) return

    setIsGeneratingSecret(true)
    try {
      const response = await fetch(getApiUrl("/api/settings/generate-secret"), {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) throw new Error("Failed to generate secret key")

      const data = await response.json()
      setSecretKey(data.secret_key)

      toast({
        title: "Secret key generated",
        description: "A new secret key has been generated successfully",
      })
    } catch (error) {
      console.error("Error generating secret key:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to generate secret key",
      })
    } finally {
      setIsGeneratingSecret(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <Card>
            <CardHeader>
              <CardTitle>Ozon API Credentials</CardTitle>
              <CardDescription>Configure your Ozon API credentials for product data synchronization</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="ozon_client_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ozon Client ID</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your Ozon Client ID" {...field} />
                    </FormControl>
                    <FormDescription>Your Ozon Client ID from the Ozon Seller API</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="ozon_api_key"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ozon API Key</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Enter your Ozon API Key" {...field} />
                    </FormControl>
                    <FormDescription>Your Ozon API Key from the Ozon Seller API</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="front_price_api_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Front Price API URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://api.example.com/prices" {...field} />
                    </FormControl>
                    <FormDescription>The URL for the front price API endpoint</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Monitoring Settings</CardTitle>
              <CardDescription>Configure how often the application checks for price changes</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="monitoring_interval"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Monitoring Interval (minutes)</FormLabel>
                    <FormControl>
                      <Input type="number" min={1} {...field} />
                    </FormControl>
                    <FormDescription>How often the application checks for price changes on Ozon</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="price_update_interval"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price Update Interval (minutes)</FormLabel>
                    <FormControl>
                      <Input type="number" min={1} {...field} />
                    </FormControl>
                    <FormDescription>How often the application updates prices on Ozon</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>Manage your application security settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <FormLabel>Secret Key</FormLabel>
                <div className="flex gap-2">
                  <Input value={secretKey} readOnly className="font-mono text-sm" />
                  <Button type="button" variant="outline" onClick={handleGenerateSecret} disabled={isGeneratingSecret}>
                    {isGeneratingSecret ? (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      "Generate New"
                    )}
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">This secret key is used for securing API communications</p>
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Settings"
                )}
              </Button>
            </CardFooter>
          </Card>
        </form>
      </Form>
    </div>
  )
}

