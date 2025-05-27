"use client"

import { Bell, ChevronDown, CreditCard, Home, Lightbulb, Phone, Plus, Wifi } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"

export default function PayPage() {
  const billCategories = [
    { id: "utilities", name: "Utilities", icon: Lightbulb },
    { id: "telecom", name: "Telecom", icon: Phone },
    { id: "internet", name: "Internet", icon: Wifi },
    { id: "tv", name: "TV", icon: CreditCard },
    { id: "rent", name: "Rent", icon: Home },
  ]

  const recentBills = [
    { id: "1", name: "Electricity Bill", provider: "REG", amount: 45000, dueDate: "May 25, 2025" },
    { id: "2", name: "Water Bill", provider: "WASAC", amount: 18000, dueDate: "May 28, 2025" },
    { id: "3", name: "Internet", provider: "MTN", amount: 35000, dueDate: "June 1, 2025" },
    { id: "4", name: "Mobile Plan", provider: "Airtel", amount: 10000, dueDate: "June 5, 2025" },
  ]

  return (
   

          <main className="flex-1 p-6">
            <div className="mb-6">
              <h2 className="text-2xl font-semibold">Pay Bills</h2>
              <p className="text-blue-200">Pay your bills and subscriptions</p>
            </div>

            <Tabs defaultValue="bills" className="w-full">
              <TabsList className="grid w-full max-w-md grid-cols-3 bg-blue-900/50">
                <TabsTrigger value="bills" className="data-[state=active]:bg-blue-800">
                  Bills
                </TabsTrigger>
                <TabsTrigger value="merchants" className="data-[state=active]:bg-blue-800">
                  Merchants
                </TabsTrigger>
                <TabsTrigger value="subscriptions" className="data-[state=active]:bg-blue-800">
                  Subscriptions
                </TabsTrigger>
              </TabsList>

              <TabsContent value="bills" className="mt-6">
                <div className="grid gap-6 md:grid-cols-3">
                  <div className="md:col-span-2">
                    <Card className="bg-blue-800/50 text-white">
                      <CardHeader>
                        <CardTitle>Pay a Bill</CardTitle>
                        <CardDescription className="text-blue-200">Select a category to pay your bills</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-3 gap-4 sm:grid-cols-5">
                          {billCategories.map((category) => (
                            <div
                              key={category.id}
                              className="flex cursor-pointer flex-col items-center justify-center rounded-lg border border-blue-700 bg-blue-900/30 p-4 text-center transition-colors hover:bg-blue-800"
                            >
                              <category.icon className="mb-2 h-8 w-8 text-blue-300" />
                              <span className="text-sm">{category.name}</span>
                            </div>
                          ))}
                        </div>

                        <div className="mt-8 space-y-4">
                          <h3 className="text-lg font-medium">Quick Pay</h3>
                          <div className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                              <div>
                                <label className="mb-2 block text-sm text-blue-200">Bill Type</label>
                                <Input
                                  placeholder="Select bill type"
                                  className="border-blue-700 bg-blue-900/50 text-white placeholder:text-blue-300"
                                />
                              </div>
                              <div>
                                <label className="mb-2 block text-sm text-blue-200">Bill Number</label>
                                <Input
                                  placeholder="Enter bill number"
                                  className="border-blue-700 bg-blue-900/50 text-white placeholder:text-blue-300"
                                />
                              </div>
                            </div>
                            <div className="grid gap-4 md:grid-cols-2">
                              <div>
                                <label className="mb-2 block text-sm text-blue-200">Amount (RWF)</label>
                                <Input
                                  placeholder="Enter amount"
                                  className="border-blue-700 bg-blue-900/50 text-white placeholder:text-blue-300"
                                />
                              </div>
                              <div>
                                <label className="mb-2 block text-sm text-blue-200">From Account</label>
                                <Input
                                  placeholder="Select account"
                                  className="border-blue-700 bg-blue-900/50 text-white placeholder:text-blue-300"
                                  defaultValue="Current Account - 0842 0842 **** 0842"
                                />
                              </div>
                            </div>
                            <Button className="mt-2 bg-yellow-500 text-blue-900 hover:bg-yellow-400">Pay Bill</Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <div>
                    <Card className="bg-blue-800/50 text-white">
                      <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <div>
                          <CardTitle>Upcoming Bills</CardTitle>
                          <CardDescription className="text-blue-200">Bills due soon</CardDescription>
                        </div>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-300">
                          <Plus className="h-5 w-5" />
                        </Button>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {recentBills.map((bill) => (
                          <div key={bill.id} className="rounded-lg border border-blue-700 bg-blue-900/30 p-3">
                            <div className="mb-2 flex items-center justify-between">
                              <div className="font-medium">{bill.name}</div>
                              <div className="text-sm font-semibold text-yellow-400">
                                RWF {bill.amount.toLocaleString()}
                              </div>
                            </div>
                            <div className="flex items-center justify-between text-xs text-blue-200">
                              <div>{bill.provider}</div>
                              <div>Due: {bill.dueDate}</div>
                            </div>
                          </div>
                        ))}
                      </CardContent>
                      <CardFooter className="border-t border-blue-700 pt-4">
                        <Button variant="ghost" className="w-full text-blue-200 hover:text-white">
                          View All Bills
                        </Button>
                      </CardFooter>
                    </Card>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="merchants">
                <div className="flex h-60 items-center justify-center rounded-lg bg-blue-800/50 p-6">
                  <p className="text-blue-200">Merchant payment options would go here</p>
                </div>
              </TabsContent>

              <TabsContent value="subscriptions">
                <div className="flex h-60 items-center justify-center rounded-lg bg-blue-800/50 p-6">
                  <p className="text-blue-200">Subscription management would go here</p>
                </div>
              </TabsContent>
            </Tabs>
          </main>

  )
}
