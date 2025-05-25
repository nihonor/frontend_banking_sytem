"use client";

import { useEffect, useState } from "react";
import {
  Download,
  Eye,
  EyeOff,
  FileText,
  History,
  Plus,
  RefreshCw,
  Search,
  Settings,
  ArrowDownLeft,
  ArrowUpRight,
  Bell,
  ChevronDown,
} from "lucide-react";

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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { useRouter } from "next/navigation";

interface User {
  id: number;
  username: string;
  email: string;
}

interface Account {
  id: number;
  accountNumber: string;
  balance: number;
  accountType: string;
}

export default function AccountsPage() {
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const [showBalance, setShowBalance] = useState(true);
  const [userId, setUserId] = useState<number>();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const storedUserId = localStorage.getItem("userId");

    if (!storedUserId) {
      router.push("/");
      return;
    }

    const parsedUserId = Number(storedUserId);
    setUserId(parsedUserId);
  }, [mounted, router]);

  useEffect(() => {
    if (userId) {
      fetchAccounts();
      currentUser();
    }
  }, [userId]);

  const currentUser = async () => {
    try {
      const response = await fetch(
        `http://localhost:8080/api/users/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );
      if (response.ok) {
        const data = await response.json();
        setUser(data);
      }
    } catch (err) {
      console.error("Error fetching user:", err);
    }
  };

  const fetchAccounts = async () => {
    if (!userId) return;

    try {
      const response = await fetch(
        `http://localhost:8080/api/users/${userId}/accounts`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );

      if (response.ok) {
        const data = await response.json();
        setAccounts(data);
      } else if (response.status === 403) {
        router.push("/");
      }
    } catch (err) {
      setError("Failed to fetch accounts");
    }
  };

  const recentTransactions = [
    {
      id: "tx1",
      description: "Salary Deposit",
      amount: 120000.0,
      type: "credit",
      date: "May 20, 2025",
      time: "09:15",
      account: "Current Account",
    },
    {
      id: "tx2",
      description: "Rent Payment",
      amount: 50000.0,
      type: "debit",
      date: "May 19, 2025",
      time: "14:30",
      account: "Current Account",
    },
    {
      id: "tx3",
      description: "Savings Transfer",
      amount: 25000.0,
      type: "debit",
      date: "May 18, 2025",
      time: "16:45",
      account: "Current Account",
    },
    {
      id: "tx4",
      description: "Interest Earned",
      amount: 1500.0,
      type: "credit",
      date: "May 15, 2025",
      time: "00:00",
      account: "Savings Account",
    },
  ];

  const filteredAccounts = accounts.filter(
    (account) =>
      account.accountNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      account.accountType.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredTransactions = recentTransactions.filter(
    (transaction) =>
      transaction.description
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      transaction.account.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transaction.amount.toString().includes(searchQuery)
  );

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
                <Button
                  variant="ghost"
                  size="icon"
                  className="ml-1 h-5 w-5 text-white"
                >
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </header>
          <main className="flex-1 p-6">
            <div className="mb-6">
              <h2 className="text-2xl font-semibold">My Accounts</h2>
              <p className="text-blue-200">
                Manage all your accounts in one place
              </p>
            </div>

            <div className="mb-8 flex items-center justify-between">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-blue-300" />
                <Input
                  placeholder="Search accounts or transactions"
                  className="w-[300px] rounded-lg border-blue-800 bg-blue-900/50 pl-10 text-white placeholder:text-blue-300"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="border-blue-400 text-white hover:bg-blue-800"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Refresh
                </Button>
                <Button className="bg-yellow-500 text-blue-900 hover:bg-yellow-400">
                  <Plus className="mr-2 h-4 w-4" />
                  New Account
                </Button>
              </div>
            </div>

            <Tabs defaultValue="all" className="mb-8">
              <TabsList className="bg-blue-900/50">
                <TabsTrigger
                  value="all"
                  className="data-[state=active]:bg-blue-800"
                >
                  All Accounts
                </TabsTrigger>
                <TabsTrigger
                  value="current"
                  className="data-[state=active]:bg-blue-800"
                >
                  Current
                </TabsTrigger>
                <TabsTrigger
                  value="savings"
                  className="data-[state=active]:bg-blue-800"
                >
                  Savings
                </TabsTrigger>
                <TabsTrigger
                  value="fixed"
                  className="data-[state=active]:bg-blue-800"
                >
                  Fixed Deposits
                </TabsTrigger>
              </TabsList>
              <TabsContent value="all" className="mt-4">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {filteredAccounts.map((account) => (
                    <Card
                      key={account.id}
                      className="bg-blue-800/50 text-white"
                    >
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">
                            {account.accountType}
                          </CardTitle>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setShowBalance(!showBalance)}
                          >
                            {showBalance ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                        <CardDescription className="text-blue-200">
                          {account.accountNumber}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="mb-4">
                          <div className="text-sm text-blue-200">
                            Available Balance
                          </div>
                          <div className="text-2xl font-bold">
                            {showBalance
                              ? `RWF ${account.balance.toLocaleString()}`
                              : "••••••"}
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-xs text-blue-200">
                          <div>Last updated: </div>
                          <div className="rounded-full bg-green-500/20 px-2 py-1 text-green-400"></div>
                        </div>
                      </CardContent>
                      <CardFooter className="flex justify-between border-t border-blue-700 pt-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-blue-200 hover:text-white"
                        >
                          <FileText className="mr-2 h-4 w-4" />
                          Statement
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-blue-200 hover:text-white"
                        >
                          <Settings className="mr-2 h-4 w-4" />
                          Manage
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              </TabsContent>
              <TabsContent value="current" className="mt-4">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {accounts
                    .filter((a) => a.accountType === "current")
                    .map((account) => (
                      <Card
                        key={account.id}
                        className="bg-blue-800/50 text-white"
                      >
                        <CardHeader className="pb-2">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-lg">
                              {account.accountType}
                            </CardTitle>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setShowBalance(!showBalance)}
                            >
                              {showBalance ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                          <CardDescription className="text-blue-200">
                            {account.accountNumber}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="mb-4">
                            <div className="text-sm text-blue-200">
                              Available Balance
                            </div>
                            <div className="text-2xl font-bold">
                              {showBalance
                                ? `RWF ${account.balance.toLocaleString()}`
                                : "••••••"}
                            </div>
                          </div>
                          <div className="flex items-center justify-between text-xs text-blue-200">
                            <div>Last updated: </div>
                            <div className="rounded-full bg-green-500/20 px-2 py-1 text-green-400"></div>
                          </div>
                        </CardContent>
                        <CardFooter className="flex justify-between border-t border-blue-700 pt-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-blue-200 hover:text-white"
                          >
                            <FileText className="mr-2 h-4 w-4" />
                            Statement
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-blue-200 hover:text-white"
                          >
                            <Settings className="mr-2 h-4 w-4" />
                            Manage
                          </Button>
                        </CardFooter>
                      </Card>
                    ))}
                </div>
              </TabsContent>
              <TabsContent value="savings" className="mt-4">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {accounts
                    .filter((a) => a.accountNumber === "SAVINGS")
                    .map((account) => (
                      <Card
                        key={account.id}
                        className="bg-blue-800/50 text-white"
                      >
                        <CardHeader className="pb-2">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-lg">
                              {account.accountType}
                            </CardTitle>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setShowBalance(!showBalance)}
                            >
                              {showBalance ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                          <CardDescription className="text-blue-200">
                            {account.accountNumber}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="mb-4">
                            <div className="text-sm text-blue-200">
                              Available Balance
                            </div>
                            <div className="text-2xl font-bold">
                              {showBalance
                                ? `RWF ${account.balance.toLocaleString()}`
                                : "••••••"}
                            </div>
                          </div>
                          <div className="flex items-center justify-between text-xs text-blue-200">
                            <div>Last updated:</div>
                            <div className="rounded-full bg-green-500/20 px-2 py-1 text-green-400"></div>
                          </div>
                        </CardContent>
                        <CardFooter className="flex justify-between border-t border-blue-700 pt-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-blue-200 hover:text-white"
                          >
                            <FileText className="mr-2 h-4 w-4" />
                            Statement
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-blue-200 hover:text-white"
                          >
                            <Settings className="mr-2 h-4 w-4" />
                            Manage
                          </Button>
                        </CardFooter>
                      </Card>
                    ))}
                </div>
              </TabsContent>
              <TabsContent value="fixed" className="mt-4">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {accounts
                    .filter((a) => a.accountType === "fixed")
                    .map((account) => (
                      <Card
                        key={account.id}
                        className="bg-blue-800/50 text-white"
                      >
                        <CardHeader className="pb-2">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-lg">
                              {account.accountType}
                            </CardTitle>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setShowBalance(!showBalance)}
                            >
                              {showBalance ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                          <CardDescription className="text-blue-200">
                            {account.accountNumber}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="mb-4">
                            <div className="text-sm text-blue-200">
                              Available Balance
                            </div>
                            <div className="text-2xl font-bold">
                              {showBalance
                                ? `RWF ${account.balance.toLocaleString()}`
                                : "••••••"}
                            </div>
                          </div>
                          <div className="flex items-center justify-between text-xs text-blue-200">
                            <div>Last updated: </div>
                            <div className="rounded-full bg-green-500/20 px-2 py-1 text-green-400"></div>
                          </div>
                        </CardContent>
                        <CardFooter className="flex justify-between border-t border-blue-700 pt-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-blue-200 hover:text-white"
                          >
                            <FileText className="mr-2 h-4 w-4" />
                            Statement
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-blue-200 hover:text-white"
                          >
                            <Settings className="mr-2 h-4 w-4" />
                            Manage
                          </Button>
                        </CardFooter>
                      </Card>
                    ))}
                </div>
              </TabsContent>
            </Tabs>

            <div className="mb-6">
              <h3 className="text-xl font-semibold">Recent Transactions</h3>
              <p className="text-blue-200">Your latest account activities</p>
            </div>

            <Card className="bg-blue-800/50 text-white">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Transaction History</CardTitle>
                  <CardDescription className="text-blue-200">
                    Last 30 days
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  className="border-blue-400 text-white hover:bg-blue-800"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredTransactions.map((transaction) => (
                    <div
                      key={transaction.id}
                      className="flex items-center justify-between rounded-lg bg-blue-900/50 p-3"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-10 w-10 items-center justify-center rounded-full ${
                            transaction.type === "credit"
                              ? "bg-green-500/20 text-green-400"
                              : "bg-red-500/20 text-red-400"
                          }`}
                        >
                          {transaction.type === "credit" ? (
                            <ArrowDownLeft className="h-5 w-5" />
                          ) : (
                            <ArrowUpRight className="h-5 w-5" />
                          )}
                        </div>
                        <div>
                          <div className="font-medium">
                            {transaction.description}
                          </div>
                          <div className="text-xs text-blue-200">
                            {transaction.account} • {transaction.date}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div
                          className={`font-semibold ${
                            transaction.type === "credit"
                              ? "text-green-400"
                              : "text-red-400"
                          }`}
                        >
                          {transaction.type === "credit" ? "+" : "-"} RWF{" "}
                          {transaction.amount.toLocaleString()}
                        </div>
                        <div className="text-xs text-blue-200">
                          {transaction.time}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="flex justify-center border-t border-blue-700 pt-4">
                <Button
                  variant="ghost"
                  className="text-blue-200 hover:text-white"
                >
                  <History className="mr-2 h-4 w-4" />
                  View All Transactions
                </Button>
              </CardFooter>
            </Card>
          </main>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
