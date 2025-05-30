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
import { apiClient } from "@/lib/api";
import { toast } from "react-hot-toast";

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
import * as XLSX from "xlsx";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { useRouter } from "next/navigation";
import { Transaction } from "../home/page";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  type User,
  type Account,
  type Transaction as ApiTransaction,
} from "@/lib/api";

interface RecentTransaction {}

interface Notification {
  id: number;
  message: string;
  timestamp: string;
  isRead: boolean;
  type: "TRANSACTION" | "ACCOUNT" | "SYSTEM";
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
  const [isCreating, setIsCreating] = useState(false);
  const [transaction, setTransaction] = useState<Transaction[]>([]);
  const [showAllTransactions, setShowAllTransactions] = useState(false);
  const [newAccount, setNewAccount] = useState({
    accountType: "",
    initialDeposit: "",
  });
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [isManageOpen, setIsManageOpen] = useState(false);
  const [isStatementOpen, setIsStatementOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

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

  const exportToExcel = () => {
    const data = filteredTransactions.map((transaction) => ({
      "Amount (RWF)": transaction.amount,
      Date: new Date(transaction.timestamp).toLocaleDateString(),
      Time: new Date(transaction.timestamp).toLocaleTimeString(),
      Type: transaction.type,
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Transaction");
    const date = new Date().toISOString().split("T")[0];
    XLSX.writeFile(wb, `transaction_${date}.xlsx`);
  };

  useEffect(() => {
    if (userId) {
      fetchAccounts();
      currentUser();
      fetchTransactions(userId);
      fetchNotifications();
    }
  }, [userId]);

  const currentUser = async () => {
    try {
      const userData = await apiClient.getCurrentUser();
      setUser(userData);
    } catch (err) {
      console.error("Error fetching user:", err);
      router.push("/");
    }
  };

  const fetchAccounts = async () => {
    if (!userId) return;

    try {
      const accountsData = await apiClient.getUserAccounts(userId);
      setAccounts(accountsData);
    } catch (err: any) {
      console.error("Error fetching accounts:", err);
      if (err.message.includes("403")) {
        router.push("/");
      }
      setError("Failed to fetch accounts");
    }
  };

  const fetchTransactions = async (userId: number | undefined) => {
    try {
      const response = await fetch(
        `http://localhost:8080/api/transactions/history/user/${userId}`,
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
        setTransaction(data);
        console.log(data);
      } else {
        console.error("Failed to fetch transactions");
      }
    } catch (err) {
      console.error("Error fetching transactions:", err);
    }
  };

  const createAccount = async () => {
    if (!userId) return;

    try {
      setIsCreating(true);
      const createdAccount = await apiClient.createAccountForUser(
        userId,
        newAccount.accountType,
        parseFloat(newAccount.initialDeposit) || 0
      );

      if (createdAccount) {
        await fetchAccounts(); // Refresh accounts list
        setNewAccount({ accountType: "", initialDeposit: "" }); // Reset form
        toast.success("Account created successfully");
      }
    } catch (err: any) {
      console.error("Error creating account:", err);
      toast.error(err.message || "Failed to create account. Please try again.");
      setError(err.message || "Failed to create account");
    } finally {
      setIsCreating(false);
    }
  };

  const downloadStatement = async (account: Account) => {
    try {
      const response = await fetch(
        `http://localhost:8080/api/transactions/history/account/${account.accountNumber}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );

      if (response.ok) {
        const transactions = await response.json();
        const data = transactions.map((tx: any) => ({
          "Amount (RWF)": tx.amount,
          Date: new Date(tx.timestamp).toLocaleDateString(),
          Time: new Date(tx.timestamp).toLocaleTimeString(),
          Type: tx.type,
        }));

        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Account Statement");
        const date = new Date().toISOString().split("T")[0];
        XLSX.writeFile(wb, `statement_${account.accountNumber}_${date}.xlsx`);
      }
    } catch (err) {
      console.error("Error downloading statement:", err);
    }
  };

  const filteredAccounts = accounts.filter(
    (account) =>
      account.accountNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      account.accountType.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredTransactions = transaction.filter((transaction) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      (transaction?.type?.toLowerCase() || "").includes(searchLower) ||
      (transaction?.amount?.toString() || "").includes(searchQuery) ||
      (transaction?.description?.toLowerCase() || "").includes(searchLower)
    );
  });

  const fetchNotifications = async () => {
    if (!userId) return;

    try {
      const response = await fetch(
        `http://localhost:8080/api/users/${userId}/notifications`,
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
        setNotifications(data);
      }
    } catch (err) {
      console.error("Error fetching notifications:", err);
    }
  };

  const markAsRead = async (notificationId: number) => {
    try {
      const response = await fetch(
        `http://localhost:8080/api/notifications/${notificationId}/read`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );

      if (response.ok) {
        setNotifications(
          notifications.map((notification) =>
            notification.id === notificationId
              ? { ...notification, isRead: true }
              : notification
          )
        );
      }
    } catch (err) {
      console.error("Error marking notification as read:", err);
    }
  };

  const markAllAsRead = async () => {
    try {
      const response = await fetch(
        `http://localhost:8080/api/users/${userId}/notifications/read-all`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );

      if (response.ok) {
        setNotifications(
          notifications.map((notification) => ({
            ...notification,
            isRead: true,
          }))
        );
      }
    } catch (err) {
      console.error("Error marking all notifications as read:", err);
    }
  };

  const handleViewAllClick = () => {
    setShowAllTransactions(true);
  };

  const handleViewLessClick = () => {
    setShowAllTransactions(false);
  };

  const displayedTransactions = showAllTransactions
    ? filteredTransactions
    : filteredTransactions.slice(0, 5);

  const handleRefresh = async () => {
    try {
      setIsRefreshing(true);
      // Refresh all data
      await Promise.all([
        fetchAccounts(),
        fetchTransactions(userId),
        fetchNotifications(),
      ]);
      toast.success("Data refreshed successfully");
    } catch (error) {
      console.error("Error refreshing data:", error);
      toast.error("Failed to refresh data");
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#0a3977] text-white">
      <main className="flex-1 p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-semibold">My Accounts</h2>
          <p className="text-blue-200">Manage all your accounts in one place</p>
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
              className="border-blue-400 text-black hover:bg-blue-800 cursor-pointer"
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw
                className={`mr-2 h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
              />
              {isRefreshing ? "Refreshing..." : "Refresh"}
            </Button>
            <Dialog>
              <DialogTrigger asChild>
                <Button className="bg-yellow-500 text-blue-900 hover:bg-yellow-400">
                  <Plus className="mr-2 h-4 w-4" />
                  New Account
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-blue-900 text-white sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Create New Account</DialogTitle>
                  <DialogDescription className="text-blue-200">
                    Fill in the details below to create a new bank account.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="accountType">Account Type</Label>
                    <Select
                      value={newAccount.accountType}
                      onValueChange={(value) =>
                        setNewAccount({ ...newAccount, accountType: value })
                      }
                    >
                      <SelectTrigger className="bg-blue-800 text-white">
                        <SelectValue placeholder="Select account type" />
                      </SelectTrigger>
                      <SelectContent className="bg-blue-800 text-white">
                        <SelectItem value="CURRENT">Current Account</SelectItem>
                        <SelectItem value="SAVINGS">Savings Account</SelectItem>
                        <SelectItem value="FIXED">Fixed Deposit</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="initialDeposit">
                      Initial Deposit (RWF)
                    </Label>
                    <Input
                      id="initialDeposit"
                      type="number"
                      value={newAccount.initialDeposit}
                      onChange={(e) =>
                        setNewAccount({
                          ...newAccount,
                          initialDeposit: e.target.value,
                        })
                      }
                      className="bg-blue-800 text-white"
                      placeholder="Enter amount"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    type="submit"
                    onClick={createAccount}
                    disabled={
                      isCreating ||
                      !newAccount.accountType ||
                      !newAccount.initialDeposit
                    }
                    className="bg-yellow-500 text-blue-900 hover:bg-yellow-400"
                  >
                    {isCreating ? (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      "Create Account"
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
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
                <Card key={account.id} className="bg-blue-800/50 text-white">
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
                      onClick={() => downloadStatement(account)}
                    >
                      <FileText className="mr-2 h-4 w-4" />
                      Statement
                    </Button>
                    <Dialog
                      open={isManageOpen && selectedAccount?.id === account.id}
                      onOpenChange={(open) => {
                        setIsManageOpen(open);
                        if (!open) setSelectedAccount(null);
                      }}
                    >
                      <DialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-blue-200 hover:text-white"
                          onClick={() => setSelectedAccount(account)}
                        >
                          <Settings className="mr-2 h-4 w-4" />
                          Manage
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="bg-blue-900 text-white sm:max-w-[425px]">
                        <DialogHeader>
                          <DialogTitle>Manage Account</DialogTitle>
                          <DialogDescription className="text-blue-200">
                            Account Number: {selectedAccount?.accountNumber}
                          </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                          <div className="flex flex-col gap-2">
                            <Label>Account Type</Label>
                            <div className="text-sm">
                              {selectedAccount?.accountType}
                            </div>
                          </div>
                          <div className="flex flex-col gap-2">
                            <Label>Current Balance</Label>
                            <div className="text-sm">
                              RWF {selectedAccount?.balance.toLocaleString()}
                            </div>
                          </div>
                          <div className="flex flex-col gap-4">
                            <Button
                              variant="outline"
                              className="w-full border-blue-400 text-white hover:bg-blue-800"
                              onClick={() =>
                                downloadStatement(selectedAccount!)
                              }
                            >
                              <FileText className="mr-2 h-4 w-4" />
                              Download Statement
                            </Button>
                            <Button
                              variant="destructive"
                              className="w-full bg-red-500 text-white hover:bg-red-600"
                              onClick={() => {
                                // Implement close account functionality
                                console.log(
                                  "Close account:",
                                  selectedAccount?.accountNumber
                                );
                              }}
                            >
                              Close Account
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
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
                  <Card key={account.id} className="bg-blue-800/50 text-white">
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
                  <Card key={account.id} className="bg-blue-800/50 text-white">
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
                  <Card key={account.id} className="bg-blue-800/50 text-white">
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
                {showAllTransactions
                  ? "All Transactions"
                  : "Last 5 Transactions"}
              </CardDescription>
            </div>
            <Button
              variant="outline"
              className="border-blue-400 text-black hover:bg-blue-800 cursor-pointer "
              onClick={exportToExcel}
            >
              <Download className="mr-2 h-4 w-4 " />
              Export
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {displayedTransactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between rounded-lg bg-blue-900/50 p-3"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-full ${
                        transaction.type === "DEPOSIT"
                          ? "bg-green-500/20 text-green-400"
                          : "bg-red-500/20 text-red-400"
                      }`}
                    >
                      {transaction.type === "WITHDRAW" ||
                      transaction.type === "TRANSFER" ? (
                        <ArrowDownLeft className="h-5 w-5" />
                      ) : (
                        <ArrowUpRight className="h-5 w-5" />
                      )}
                    </div>
                    <div>
                      <div className="font-medium">{transaction.type}</div>
                      <div className="text-xs text-blue-200">
                        {transaction.accountNumber} •{" "}
                        {new Date(transaction.timestamp).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div
                      className={`font-semibold ${
                        transaction.type === "DEPOSIT"
                          ? "text-green-400"
                          : "text-red-400"
                      }`}
                    >
                      {transaction.type === "DEPOSIT" ? "+" : "-"} RWF{" "}
                      {transaction.amount.toLocaleString()}
                    </div>
                    <div className="text-xs text-blue-200">
                      {new Date(transaction.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter className="flex justify-center border-t border-blue-700 pt-4">
            {!showAllTransactions && filteredTransactions.length > 5 ? (
              <Button
                variant="ghost"
                className="text-blue-200 hover:text-black cursor-pointer"
                onClick={handleViewAllClick}
              >
                <History className="mr-2 h-4 w-4" />
                View All Transactions
              </Button>
            ) : (
              showAllTransactions && (
                <Button
                  variant="ghost"
                  className="text-blue-200 hover:text-black cursor-pointer"
                  onClick={handleViewLessClick}
                >
                  <History className="mr-2 h-4 w-4" />
                  View Less
                </Button>
              )
            )}
          </CardFooter>
        </Card>
      </main>
    </div>
  );
}
