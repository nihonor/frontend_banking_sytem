"use client"

import { Bell, ChevronDown, Moon, Palette, Sun } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"

export default function SettingsPage() {
  return (
    
        <div className="flex min-h-screen flex-col bg-[#0a3977] text-white">
          

          <main className="flex-1 p-6">
            <div className="mb-6">
              <h2 className="text-2xl font-semibold">Settings</h2>
              <p className="text-blue-200">Customize your banking experience</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <Card className="bg-blue-800/50 text-white">
                <CardHeader>
                  <CardTitle>Appearance</CardTitle>
                  <CardDescription className="text-blue-200">Customize how the banking interface looks</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label>Theme</Label>
                    <RadioGroup defaultValue="dark" className="flex gap-4">
                      <div className="flex flex-col items-center gap-2">
                        <div className="flex h-16 w-16 items-center justify-center rounded-md border border-blue-700 bg-blue-900 shadow-sm">
                          <Moon className="h-6 w-6 text-blue-300" />
                        </div>
                        <RadioGroupItem value="dark" id="dark" className="sr-only" />
                        <Label htmlFor="dark" className="cursor-pointer text-sm font-normal">
                          Dark
                        </Label>
                      </div>
                      <div className="flex flex-col items-center gap-2">
                        <div className="flex h-16 w-16 items-center justify-center rounded-md border border-blue-700 bg-white shadow-sm">
                          <Sun className="h-6 w-6 text-blue-900" />
                        </div>
                        <RadioGroupItem value="light" id="light" className="sr-only" />
                        <Label htmlFor="light" className="cursor-pointer text-sm font-normal">
                          Light
                        </Label>
                      </div>
                      <div className="flex flex-col items-center gap-2">
                        <div className="flex h-16 w-16 items-center justify-center rounded-md border border-blue-700 bg-gradient-to-b from-white to-blue-900 shadow-sm">
                          <Palette className="h-6 w-6 text-blue-700" />
                        </div>
                        <RadioGroupItem value="system" id="system" className="sr-only" />
                        <Label htmlFor="system" className="cursor-pointer text-sm font-normal">
                          System
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div className="space-y-2">
                    <Label>Color Scheme</Label>
                    <RadioGroup defaultValue="blue" className="flex gap-4">
                      <div className="flex flex-col items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-blue-600 shadow-sm" />
                        <RadioGroupItem value="blue" id="blue" className="sr-only" />
                        <Label htmlFor="blue" className="cursor-pointer text-sm font-normal">
                          Blue
                        </Label>
                      </div>
                      <div className="flex flex-col items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-green-600 shadow-sm" />
                        <RadioGroupItem value="green" id="green" className="sr-only" />
                        <Label htmlFor="green" className="cursor-pointer text-sm font-normal">
                          Green
                        </Label>
                      </div>
                      <div className="flex flex-col items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-purple-600 shadow-sm" />
                        <RadioGroupItem value="purple" id="purple" className="sr-only" />
                        <Label htmlFor="purple" className="cursor-pointer text-sm font-normal">
                          Purple
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="animations">Animations</Label>
                      <Switch id="animations" defaultChecked />
                    </div>
                    <p className="text-sm text-blue-200">Enable or disable animations throughout the interface</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-blue-800/50 text-white">
                <CardHeader>
                  <CardTitle>Language & Region</CardTitle>
                  <CardDescription className="text-blue-200">
                    Set your preferred language and regional settings
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="language">Language</Label>
                    <Select defaultValue="en">
                      <SelectTrigger className="border-blue-700 bg-blue-900/50 text-white">
                        <SelectValue placeholder="Select language" />
                      </SelectTrigger>
                      <SelectContent className="bg-blue-900 text-white">
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="fr">French</SelectItem>
                        <SelectItem value="rw">Kinyarwanda</SelectItem>
                        <SelectItem value="sw">Swahili</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="currency">Default Currency</Label>
                    <Select defaultValue="rwf">
                      <SelectTrigger className="border-blue-700 bg-blue-900/50 text-white">
                        <SelectValue placeholder="Select currency" />
                      </SelectTrigger>
                      <SelectContent className="bg-blue-900 text-white">
                        <SelectItem value="rwf">Rwandan Franc (RWF)</SelectItem>
                        <SelectItem value="usd">US Dollar (USD)</SelectItem>
                        <SelectItem value="eur">Euro (EUR)</SelectItem>
                        <SelectItem value="gbp">British Pound (GBP)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="timezone">Time Zone</Label>
                    <Select defaultValue="cat">
                      <SelectTrigger className="border-blue-700 bg-blue-900/50 text-white">
                        <SelectValue placeholder="Select time zone" />
                      </SelectTrigger>
                      <SelectContent className="bg-blue-900 text-white">
                        <SelectItem value="cat">Central Africa Time (CAT)</SelectItem>
                        <SelectItem value="eat">East Africa Time (EAT)</SelectItem>
                        <SelectItem value="gmt">Greenwich Mean Time (GMT)</SelectItem>
                        <SelectItem value="est">Eastern Standard Time (EST)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="dateFormat">Date Format</Label>
                      <Select defaultValue="dmy">
                        <SelectTrigger className="w-[180px] border-blue-700 bg-blue-900/50 text-white">
                          <SelectValue placeholder="Select format" />
                        </SelectTrigger>
                        <SelectContent className="bg-blue-900 text-white">
                          <SelectItem value="dmy">DD/MM/YYYY</SelectItem>
                          <SelectItem value="mdy">MM/DD/YYYY</SelectItem>
                          <SelectItem value="ymd">YYYY/MM/DD</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-blue-800/50 text-white">
                <CardHeader>
                  <CardTitle>Notifications</CardTitle>
                  <CardDescription className="text-blue-200">Manage your notification preferences</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="push">Push Notifications</Label>
                      <Switch id="push" defaultChecked />
                    </div>
                    <p className="text-sm text-blue-200">Receive notifications on your mobile device</p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="email">Email Notifications</Label>
                      <Switch id="email" defaultChecked />
                    </div>
                    <p className="text-sm text-blue-200">Receive notifications via email</p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="sms">SMS Notifications</Label>
                      <Switch id="sms" defaultChecked />
                    </div>
                    <p className="text-sm text-blue-200">Receive notifications via SMS</p>
                  </div>

                  <div className="pt-4">
                    <h3 className="mb-3 text-sm font-medium">Notification Types</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="transactions">Transactions</Label>
                        <Switch id="transactions" defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="security">Security Alerts</Label>
                        <Switch id="security" defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="promotions">Promotions</Label>
                        <Switch id="promotions" />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="news">News & Updates</Label>
                        <Switch id="news" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-blue-800/50 text-white">
                <CardHeader>
                  <CardTitle>Accessibility</CardTitle>
                  <CardDescription className="text-blue-200">Customize accessibility settings</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Text Size</Label>
                    <RadioGroup defaultValue="medium" className="flex gap-4">
                      <div className="flex items-center gap-2">
                        <RadioGroupItem value="small" id="small" />
                        <Label htmlFor="small" className="cursor-pointer text-sm font-normal">
                          Small
                        </Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <RadioGroupItem value="medium" id="medium" />
                        <Label htmlFor="medium" className="cursor-pointer text-sm font-normal">
                          Medium
                        </Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <RadioGroupItem value="large" id="large" />
                        <Label htmlFor="large" className="cursor-pointer text-sm font-normal">
                          Large
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="contrast">High Contrast</Label>
                      <Switch id="contrast" />
                    </div>
                    <p className="text-sm text-blue-200">Increase contrast for better visibility</p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="motion">Reduce Motion</Label>
                      <Switch id="motion" />
                    </div>
                    <p className="text-sm text-blue-200">Minimize animations and transitions</p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="screenReader">Screen Reader Support</Label>
                      <Switch id="screenReader" defaultChecked />
                    </div>
                    <p className="text-sm text-blue-200">Optimize for screen readers</p>
                  </div>
                </CardContent>
                <CardFooter className="border-t border-blue-700 pt-4">
                  <Button className="w-full bg-yellow-500 text-blue-900 hover:bg-yellow-400">Save Settings</Button>
                </CardFooter>
              </Card>
            </div>
          </main>
        </div>

  )
}
