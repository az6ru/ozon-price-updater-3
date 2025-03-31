"use client"

import type React from "react"

import { useEffect, useState } from "react"
import DashboardLayout from "@/components/layout/dashboard-layout"
import { api, type Settings } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, RefreshCw } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [generating, setGenerating] = useState(false)

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    setLoading(true)
    try {
      const data = await api.getSettings()
      setSettings(data)
    } catch (error) {
      console.error("Error fetching settings:", error)
      toast({
        title: "Error",
        description: "Failed to load settings",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!settings) return

    setSaving(true)
    try {
      await api.updateSettings({
        monitoring_interval: settings.monitoring_interval,
        price_update_interval: settings.price_update_interval,
        ozon_client_id: settings.ozon_client_id,
        ozon_api_key: settings.ozon_api_key,
        front_price_api_url: settings.front_price_api_url,
      })

      toast({
        title: "Settings updated",
        description: "Your settings have been saved successfully",
      })

      // Refresh settings to get the latest data
      await fetchSettings()
    } catch (error) {
      console.error("Error saving settings:", error)
      toast({
        title: "Error",
        description: "Failed to save settings",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const generateSecretKey = async () => {
    setGenerating(true)
    try {
      await api.generateSecretKey()
      toast({
        title: "Secret key generated",
        description: "A new secret key has been generated",
      })

      // Refresh settings to get the new secret key
      await fetchSettings()
    } catch (error) {
      console.error("Error generating secret key:", error)
      toast({
        title: "Error",
        description: "Failed to generate secret key",
        variant: "destructive",
      })
    } finally {
      setGenerating(false)
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex h-[calc(100vh-10rem)] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Settings</h1>
          <Button onClick={fetchSettings} variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>

        {settings && (
          <form onSubmit={handleSubmit}>
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Monitoring Settings</CardTitle>
                  <CardDescription>Configure how often the system checks and updates prices</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="monitoring_interval">Monitoring Interval (minutes)</Label>
                    <Input
                      id="monitoring_interval"
                      type="number"
                      min="1"
                      value={settings.monitoring_interval}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          monitoring_interval: Number.parseInt(e.target.value),
                        })
                      }
                    />
                    <p className="text-sm text-muted-foreground">
                      How often the system checks for price changes on Ozone
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="price_update_interval">Price Update Interval (minutes)</Label>
                    <Input
                      id="price_update_interval"
                      type="number"
                      min="1"
                      value={settings.price_update_interval}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          price_update_interval: Number.parseInt(e.target.value),
                        })
                      }
                    />
                    <p className="text-sm text-muted-foreground">How often the system updates prices on Ozone</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Ozone API Settings</CardTitle>
                  <CardDescription>Configure your Ozone API credentials</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="ozon_client_id">Ozone Client ID</Label>
                    <Input
                      id="ozon_client_id"
                      value={settings.ozon_client_id}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          ozon_client_id: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ozon_api_key">Ozone API Key</Label>
                    <Input
                      id="ozon_api_key"
                      type="password"
                      value={settings.ozon_api_key}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          ozon_api_key: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="front_price_api_url">Front Price API URL</Label>
                    <Input
                      id="front_price_api_url"
                      value={settings.front_price_api_url}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          front_price_api_url: e.target.value,
                        })
                      }
                    />
                    <p className="text-sm text-muted-foreground">URL for fetching front-end prices from Ozone</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Security Settings</CardTitle>
                  <CardDescription>Manage security settings for the application</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="secret_key">Secret Key</Label>
                    <div className="flex space-x-2">
                      <Input id="secret_key" readOnly value={settings.secret_key} />
                      <Button type="button" onClick={generateSecretKey} disabled={generating}>
                        {generating ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Generating...
                          </>
                        ) : (
                          "Generate New"
                        )}
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Secret key used for encryption and security purposes
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>System Information</CardTitle>
                  <CardDescription>Current system status information</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium">Last Update:</p>
                      <p className="text-sm text-muted-foreground">
                        {settings.last_update ? new Date(settings.last_update).toLocaleString() : "Never"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Next Update:</p>
                      <p className="text-sm text-muted-foreground">
                        {settings.next_update ? new Date(settings.next_update).toLocaleString() : "Not scheduled"}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="mt-6">
              <Button type="submit" disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Settings"
                )}
              </Button>
            </div>
          </form>
        )}
      </div>
    </DashboardLayout>
  )
}

