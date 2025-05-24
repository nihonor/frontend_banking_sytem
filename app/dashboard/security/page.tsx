"use client"

import { Bell, ChevronDown, Fingerprint, Lock, Shield, Smartphone } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"

export default function SecurityPage() {
  const securitySettings = [
    {
      id: "2fa",
      title: "Two-Factor Authentication",
      description: "Add an extra layer of security to your account",
      icon: Shield,
      enabled: true,
    },
    {
      id: "biometric",
      title: "Biometric Authentication",
      description: "Use fingerprint or face recognition to access your account",
      icon: Fingerprint,
      enabled: true,
    },
    {
      id: "login-alerts",
      title: "Login Alerts",
      description: "Get notified when someone logs into your account",
      icon: Bell,
      enabled: true,
    },
    {
      id: "transaction-limits",
      title: "Transaction Limits",
      description: "Set limits for different types of transactions",
      icon: Lock,
      enabled: false,
    },
    {
      id: "device-management",
      title: "Device Management",
      description: "Manage devices that have access to your account",
      icon: Smartphone,
      enabled: true,
    },
  ]

  const recentActivities = [
    { id: "1", activity: "Password changed", date: "May 20, 2025", time: "14:30", status: "success" },
    { id: "2", activity: "Login from new device", date: "May 18, 2025", time: "09:15", status: "warning" },
    { id: "3", activity: "Two-factor authentication enabled", date: "May 15, 2025", time: "16:45", status: "success" },
    { id: "4", activity: "Failed login attempt", date: "May 10, 2025", time: "22:10", status: "error" },
  ]

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <div className="flex min-h-screen flex-col bg-[#0a3977] text-white">
          <header className="flex h-16 items-center justify-between border-b border-blue-800 px-6">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold">BANK OF KIGALI</h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Button variant="ghost" size="icon" className="text-white">
                  <Bell className="h-5 w-5" />
                  <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-yellow-400 text-xs text-black">
                    3
                  </span>
                </Button>
              </div>
              <div className="flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 text-blue-900">
                  MA
                </div>
                <span className="text-sm font-medium">Mutoni Alice</span>
                <Button variant="ghost" size="icon" className="ml-1 h-5 w-5 text-white">
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </header>

          <main className="flex-1 p-6">
            <div className="mb-6">
              <h2 className="text-2xl font-semibold">Security Center</h2>
              <p className="text-blue-200">Manage your account security settings</p>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              <div className="md:col-span-2">
                <Card className="bg-blue-800/50 text-white">
                  <CardHeader>
                    <CardTitle>Security Settings</CardTitle>
                    <CardDescription className="text-blue-200">Configure your security preferences</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {securitySettings.map((setting) => (
                      <div
                        key={setting.id}
                        className="flex items-center justify-between rounded-lg border border-blue-700 bg-blue-900/30 p-4"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-700/50">
                            <setting.icon className="h-5 w-5 text-blue-300" />
                          </div>
                          <div>
                            <div className="font-medium">{setting.title}</div>
                            <div className="text-sm text-blue-200">{setting.description}</div>
                          </div>
                        </div>
                        <Switch checked={setting.enabled} />
                      </div>
                    ))}
                  </CardContent>
                  <CardFooter className="flex justify-between border-t border-blue-700 pt-4">
                    <Button variant="outline" className="border-blue-400 text-white hover:bg-blue-800">
                      Reset Security Settings
                    </Button>
                    <Button className="bg-yellow-500 text-blue-900 hover:bg-yellow-400">
                      <Lock className="mr-2 h-4 w-4" />
                      Change Password
                    </Button>
                  </CardFooter>
                </Card>
              </div>

              <div>
                <Card className="bg-blue-800/50 text-white">
                  <CardHeader>
                    <CardTitle>Recent Activities</CardTitle>
                    <CardDescription className="text-blue-200">Security-related account activities</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {recentActivities.map((activity) => (
                      <div key={activity.id} className="rounded-lg border border-blue-700 bg-blue-900/30 p-3">
                        <div className="mb-1 flex items-center justify-between">
                          <div className="font-medium">{activity.activity}</div>
                          <div
                            className={`rounded-full px-2 py-1 text-xs font-medium ${
                              activity.status === "success"
                                ? "bg-green-500/20 text-green-400"
                                : activity.status === "warning"
                                  ? "bg-yellow-500/20 text-yellow-400"
                                  : "bg-red-500/20 text-red-400"
                            }`}
                          >
                            {activity.status.toUpperCase()}
                          </div>
                        </div>
                        <div className="text-xs text-blue-200">
                          {activity.date} at {activity.time}
                        </div>
                      </div>
                    ))}
                  </CardContent>
                  <CardFooter className="border-t border-blue-700 pt-4">
                    <Button variant="ghost" className="w-full text-blue-200 hover:text-white">
                      View All Activities
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            </div>

            <div className="mt-8">
              <Card className="bg-blue-800/50 text-white">
                <CardHeader>
                  <CardTitle>Security Tips</CardTitle>
                  <CardDescription className="text-blue-200">
                    Recommendations to keep your account secure
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="rounded-lg bg-blue-900/30 p-4">
                      <h3 className="mb-2 text-lg font-medium">Use a Strong Password</h3>
                      <p className="text-blue-200">
                        Create a unique password with a mix of letters, numbers, and special characters. Avoid using
                        personal information that can be easily guessed.
                      </p>
                    </div>
                    <div className="rounded-lg bg-blue-900/30 p-4">
                      <h3 className="mb-2 text-lg font-medium">Enable Two-Factor Authentication</h3>
                      <p className="text-blue-200">
                        Add an extra layer of security by requiring a second form of verification when logging in to
                        your account.
                      </p>
                    </div>
                    <div className="rounded-lg bg-blue-900/30 p-4">
                      <h3 className="mb-2 text-lg font-medium">Monitor Your Account Regularly</h3>
                      <p className="text-blue-200">
                        Check your account activity frequently and report any suspicious transactions immediately.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

