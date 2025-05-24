"use client"

import { Bell, ChevronDown, CreditCard, Lock, Plus, RefreshCw, Settings, Shield } from 'lucide-react'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { Progress } from "@/components/ui/progress"

export default function CardsPage() {
  const cards = [
    {
      id: "1",
      type: "Visa Debit",
      number: "**** **** **** 4582",
      expiry: "05/28",
      status: "active",
      limit: 1000000,
      spent: 350000,
      color: "bg-gradient-to-r from-blue-600 to-blue-800",
    },
    {
      id: "2",
      type: "Mastercard Credit",
      number: "**** **** **** 7291",
      expiry: "09/27",
      status: "active",
      limit: 2000000,
      spent: 750000,
      color: "bg-gradient-to-r from-yellow-600 to-yellow-800",
    },
  ]

  const recentTransactions = [
    { id: "1", merchant: "Simba Supermarket", date: "May 22, 2025", amount: 45000 },
    { id: "2", merchant: "Kigali Heights Parking", date: "May 21, 2025", amount: 2000 },
    { id: "3", merchant: "KFC Restaurant", date: "May 20, 2025", amount: 18500 },
    { id: "4", merchant: "Amazon.com", date: "May 19, 2025", amount: 65000 },
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
              <h2 className="text-2xl font-semibold">My Cards</h2>
              <p className="text-blue-200">Manage your debit and credit cards</p>
            </div>

            <div className="mb-6 flex items-center justify-between">
              <Tabs defaultValue="all" className="w-[400px]">
                <TabsList className="bg-blue-900/50">
                  <TabsTrigger value="all" className="data-[state=active]:bg-blue-800">All Cards</TabsTrigger>
                  <TabsTrigger value="debit" className="data-[state=active]:bg-blue-800">Debit</TabsTrigger>
                  <TabsTrigger value="credit" className="data-[state=active]:bg-blue-800">Credit</TabsTrigger>
                </TabsList>
              </Tabs>
              <Button className="bg-yellow-500 text-blue-900 hover:bg-yellow-400">
                <Plus className="mr-2 h-4 w-4" />
                Request New Card
              </Button>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {cards.map((card) => (
                <div key={card.id} className="flex flex-col gap-4">
                  <div className={`relative h-48 w-full rounded-xl p-6 shadow-lg ${card.color}`}>
                    <div className="mb-6 flex justify-between">
                      <div className="text-lg font-semibold text-white">Bank of Kigali</div>
                      <CreditCard className="h-8 w-8 text-white/80" />
                    </div>
                    <div className="mb-6 text-xl font-medium tracking-widest text-white">{card.number}</div>
                    <div className="flex justify-between">
                      <div>
                        <div className="text-xs text-white/70">VALID THRU</div>
                        <div className="text-white">{card.expiry}</div>
                      </div>
                      <div>
                        <div className="text-xs text-white/70">CARD HOLDER</div>
                        <div className="text-white">MUTONI ALICE</div>
                      </div>
                      <div className="flex items-end">
                        <div className="h-8 w-12">
                          {card.type.includes("Visa") ? (
                            <div className="text-xl font-bold italic text-white">VISA</div>
                          ) : (
                            <div className="text-sm font-bold text-white">MASTERCARD</div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <Card className="bg-blue-800/50 text-white">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{card.type}</CardTitle>
                        <div className="rounded-full bg-green-500/20 px-2 py-1 text-xs font-medium text-green-400">
                          {card.status.toUpperCase()}
                        </div>
                      </div>
                      <CardDescription className="text-blue-200">
                        Linked to Current Account
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <div className="mb-1 flex items-center justify-between text-sm">
                          <span className="text-blue-200">Spending Limit</span>
                          <span>
                            RWF {card.spent.toLocaleString()} / {card.limit.toLocaleString()}
                          </span>
                        </div>
                        <Progress 
                          value={(card.spent / card.limit) * 100} 
                          className="h-2 bg-blue-900" 
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Shield className="h-4 w-4 text-blue-300" />
                            <span>Online Payments</span>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Lock className="h-4 w-4 text-blue-300" />
                            <span>Contactless Payments</span>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between border-t border-blue-700 pt-4">
                      <Button variant="ghost" size="sm" className="text-blue-200 hover:text-white">
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Transactions
                      </Button>
                      <Button variant="ghost" size="sm" className="text-blue-200 hover:text-white">
                        <Settings className="mr-2 h-4 w-4" />
                        Manage
                      </Button>
                    </CardFooter>
                  </Card>
                </div>
              ))}
            </div>
            
            <div className="mt-8">
              <Card className="bg-blue-800/50 text-white">
                <CardHeader>
                  <CardTitle>Recent Card Transactions</CardTitle>
                  <CardDescription className="text-blue-200">
                    Your latest card activities
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentTransactions.map((transaction) => (
                      <div 
                        key={transaction.id} 
                        className="flex items-center justify-between rounded-lg border border-blue-700 bg-blue-900/30 p-4"
                      >
                        <div>
                          <div className="font-medium">{transaction.merchant}</div>
                          <div className="text-sm text-blue-200">{transaction.date}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-red-400">
                            - RWF {transaction.amount.toLocaleString()}
                          </div>
                          <div className="text-xs text-blue-200">Visa Debit ****4582</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
                <CardFooter className="border-t border-blue-700 pt-4">
                  <Button variant="ghost" className="w-full text-blue-200 hover:text-white">
                    View All Transactions
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </main>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
