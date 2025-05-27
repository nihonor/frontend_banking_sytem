"use client";

import { useState } from "react";
import { Bell, ChevronDown, Search, Send, User, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function TransferPage() {
  const [transferAmount, setTransferAmount] = useState("");

  const beneficiaries = [
    {
      id: "1",
      name: "Teta Vanessa",
      account: "0753 **** **** 1234",
      avatar: "TV",
    },
    { id: "2", name: "Yvonne", account: "0842 **** **** 5678", avatar: "YV" },
    { id: "3", name: "Berg", account: "0921 **** **** 9012", avatar: "BG" },
    { id: "4", name: "Simon", account: "0753 **** **** 3456", avatar: "SM" },
  ];

  return (
   

          <main className="flex-1 p-6">
            <div className="mb-6">
              <h2 className="text-2xl font-semibold">Transfer Money</h2>
              <p className="text-blue-200">
                Send money to accounts and mobile wallets
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              <div className="md:col-span-2">
                <Tabs defaultValue="bk" className="w-full">
                  <TabsList className="grid w-full grid-cols-3 bg-blue-900/50">
                    <TabsTrigger
                      value="bk"
                      className="data-[state=active]:bg-blue-800"
                    >
                      BK to BK
                    </TabsTrigger>
                    <TabsTrigger
                      value="mobile"
                      className="data-[state=active]:bg-blue-800"
                    >
                      Mobile Money
                    </TabsTrigger>
                    <TabsTrigger
                      value="other"
                      className="data-[state=active]:bg-blue-800"
                    >
                      Other Banks
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="bk">
                    <Card className="bg-blue-800/50 text-white">
                      <CardHeader>
                        <CardTitle>Transfer to BK Account</CardTitle>
                        <CardDescription className="text-blue-200">
                          Send money to another Bank of Kigali account
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="from-account">From Account</Label>
                          <Select defaultValue="current">
                            <SelectTrigger className="border-blue-700 bg-blue-900/50 text-white">
                              <SelectValue placeholder="Select account" />
                            </SelectTrigger>
                            <SelectContent className="bg-blue-900 text-white">
                              <SelectItem value="current">
                                Current Account - 0842 0842 **** 0842
                              </SelectItem>
                              <SelectItem value="savings">
                                Savings Account - 0753 0753 **** 0753
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="to-account">To Account</Label>
                          <RadioGroup
                            defaultValue="beneficiary"
                            className="space-y-3"
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem
                                value="beneficiary"
                                id="beneficiary"
                                className="border-blue-400"
                              />
                              <Label
                                htmlFor="beneficiary"
                                className="font-normal"
                              >
                                Select from beneficiaries
                              </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem
                                value="new"
                                id="new"
                                className="border-blue-400"
                              />
                              <Label htmlFor="new" className="font-normal">
                                New recipient
                              </Label>
                            </div>
                          </RadioGroup>
                        </div>

                        <div className="space-y-2">
                          <Label>Select Beneficiary</Label>
                          <div className="relative">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-blue-300" />
                            <Input
                              placeholder="Search beneficiaries"
                              className="border-blue-700 bg-blue-900/50 pl-10 text-white placeholder:text-blue-300"
                            />
                          </div>

                          <div className="mt-3 space-y-2">
                            <RadioGroup defaultValue={beneficiaries[0].id}>
                              {beneficiaries.map((beneficiary) => (
                                <div
                                  key={beneficiary.id}
                                  className="flex cursor-pointer items-center justify-between rounded-lg border border-blue-700 bg-blue-900/30 p-3 hover:bg-blue-800/50"
                                >
                                  <div className="flex items-center gap-3">
                                    <Avatar className="h-10 w-10 bg-green-500/20 text-green-400">
                                      <AvatarFallback>
                                        {beneficiary.avatar}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div>
                                      <div className="font-medium">
                                        {beneficiary.name}
                                      </div>
                                      <div className="text-xs text-blue-200">
                                        {beneficiary.account}
                                      </div>
                                    </div>
                                  </div>
                                  <RadioGroupItem
                                    value={beneficiary.id}
                                    className="border-blue-400"
                                  />
                                </div>
                              ))}
                            </RadioGroup>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="amount">Amount (RWF)</Label>
                          <Input
                            id="amount"
                            type="text"
                            value={transferAmount}
                            onChange={(e) => setTransferAmount(e.target.value)}
                            className="border-blue-700 bg-blue-900/50 text-white placeholder:text-blue-300"
                            placeholder="Enter amount"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="reason">Reason for Transfer</Label>
                          <Select defaultValue="payment">
                            <SelectTrigger className="border-blue-700 bg-blue-900/50 text-white">
                              <SelectValue placeholder="Select reason" />
                            </SelectTrigger>
                            <SelectContent className="bg-blue-900 text-white">
                              <SelectItem value="payment">Payment</SelectItem>
                              <SelectItem value="gift">Gift</SelectItem>
                              <SelectItem value="loan">Loan</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </CardContent>
                      <CardFooter className="flex justify-end gap-3 border-t border-blue-700 pt-4">
                        <Button
                          variant="outline"
                          className="border-blue-400 text-white hover:bg-blue-800"
                        >
                          Cancel
                        </Button>
                        <Button className="bg-yellow-500 text-blue-900 hover:bg-yellow-400">
                          <Send className="mr-2 h-4 w-4" />
                          Send Money
                        </Button>
                      </CardFooter>
                    </Card>
                  </TabsContent>

                  <TabsContent value="mobile">
                    <Card className="bg-blue-800/50 text-white">
                      <CardHeader>
                        <CardTitle>Transfer to Mobile Money</CardTitle>
                        <CardDescription className="text-blue-200">
                          Send money to mobile money accounts
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex h-40 items-center justify-center">
                          <p className="text-blue-200">
                            Mobile Money transfer form would go here
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="other">
                    <Card className="bg-blue-800/50 text-white">
                      <CardHeader>
                        <CardTitle>Transfer to Other Banks</CardTitle>
                        <CardDescription className="text-blue-200">
                          Send money to accounts at other banks
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex h-40 items-center justify-center">
                          <p className="text-blue-200">
                            Other banks transfer form would go here
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>

              <div>
                <Card className="bg-blue-800/50 text-white">
                  <CardHeader>
                    <CardTitle>Recent Transfers</CardTitle>
                    <CardDescription className="text-blue-200">
                      Your last 5 transfers
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between rounded-lg bg-blue-900/30 p-3"
                      >
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8 bg-blue-500/20 text-blue-400">
                            <AvatarFallback>
                              {i % 2 === 0 ? (
                                <User className="h-4 w-4" />
                              ) : (
                                <Users className="h-4 w-4" />
                              )}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">
                              {i % 2 === 0 ? "Teta Vanessa" : "Mobile Money"}
                            </div>
                            <div className="text-xs text-blue-200">
                              May {20 - i}, 2025
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium text-red-400">
                            - RWF {(i * 15000).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                  <CardFooter className="border-t border-blue-700 pt-4">
                    <Button
                      variant="ghost"
                      className="w-full text-blue-200 hover:text-white"
                    >
                      View All Transfers
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            </div>
          </main>
       

  );
}
