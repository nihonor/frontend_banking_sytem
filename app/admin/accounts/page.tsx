"use client";

import { useState, useEffect } from "react";
import {
  Bell,
  ChevronDown,
  Search,
  Filter,
  Download,
  MoreHorizontal,
  Eye,
  Edit,
  Ban,
  Plus,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { apiClient, type Account, type User } from "@/lib/api";

export default function AdminAccountsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAccountData();
  }, []);

  const fetchAccountData = async () => {
    try {
      setIsLoading(true);
      const [allAccounts, allUsers] = await Promise.all([
        apiClient.getAllAccounts(),
        apiClient.getAllUsers(),
      ]);
      setAccounts(allAccounts);
      setUsers(allUsers);
    } catch (error) {
      console.error("Error fetching account data:", error);
      toast.error("Failed to load account data. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async (accountId: number) => {
    try {
      await apiClient.deleteAccount(accountId);
      setAccounts(accounts.filter((account) => account.id !== accountId));
      toast.success("Account has been successfully deleted.");
    } catch (error) {
      console.error("Error deleting account:", error);
      toast.error("Failed to delete account. Please try again.");
    }
  };

  const getAccountTypeBadge = (type: string) => {
    switch (type.toLowerCase()) {
      case "savings":
        return (
          <Badge className="bg-green-500/20 text-green-400">Savings</Badge>
        );
      case "current":
        return <Badge className="bg-blue-500/20 text-blue-400">Current</Badge>;
      case "business":
        return (
          <Badge className="bg-purple-500/20 text-purple-400">Business</Badge>
        );
      case "fixed":
        return (
          <Badge className="bg-orange-500/20 text-orange-400">
            Fixed Deposit
          </Badge>
        );
      default:
        return <Badge className="bg-gray-500/20 text-gray-400">{type}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case "active":
        return <Badge className="bg-green-500/20 text-green-400">Active</Badge>;
      case "suspended":
        return <Badge className="bg-red-500/20 text-red-400">Suspended</Badge>;
      case "closed":
        return <Badge className="bg-gray-500/20 text-gray-400">Closed</Badge>;
      default:
        return <Badge className="bg-green-500/20 text-green-400">Active</Badge>;
    }
  };

  const getUserById = (userId: number) =>
    users.find((user) => user.id === userId);

  const filteredAccounts = accounts.filter((account) => {
    const user = getUserById(account.userId);
    const matchesSearch =
      user?.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      account.accountNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType =
      typeFilter === "all" ||
      account.accountType.toLowerCase() === typeFilter.toLowerCase();
    const matchesStatus =
      statusFilter === "all" ||
      (account.status?.toLowerCase() || "active") ===
        statusFilter.toLowerCase();
    return matchesSearch && matchesType && matchesStatus;
  });

  const totalBalance = accounts.reduce(
    (sum, account) => sum + account.balance,
    0
  );
  const accountsByType = accounts.reduce((acc, account) => {
    const type = account.accountType.toLowerCase();
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="flex min-h-screen flex-col bg-[#0a3977] text-white">
      <main className="flex-1 p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-semibold">Account Management</h2>
          <p className="text-blue-200">
            Manage and monitor all customer accounts
          </p>
        </div>

        {/* Summary Cards */}
        <div className="mb-6 grid gap-4 md:grid-cols-4">
          <Card className="bg-blue-800/50 text-white">
            <CardContent className="p-4">
              <div className="text-sm text-blue-200">Total Accounts</div>
              <div className="text-2xl font-bold">{accounts.length}</div>
            </CardContent>
          </Card>
          <Card className="bg-blue-800/50 text-white">
            <CardContent className="p-4">
              <div className="text-sm text-blue-200">Total Balance</div>
              <div className="text-2xl font-bold">
                RWF {totalBalance.toLocaleString()}
              </div>
            </CardContent>
          </Card>
          <Card className="bg-blue-800/50 text-white">
            <CardContent className="p-4">
              <div className="text-sm text-blue-200">Savings Accounts</div>
              <div className="text-2xl font-bold">
                {accountsByType.savings || 0}
              </div>
            </CardContent>
          </Card>
          <Card className="bg-blue-800/50 text-white">
            <CardContent className="p-4">
              <div className="text-sm text-blue-200">Current Accounts</div>
              <div className="text-2xl font-bold">
                {accountsByType.current || 0}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-blue-800/50 text-white">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>All Accounts</CardTitle>
                <CardDescription className="text-blue-200">
                  Total: {accounts.length} accounts
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="border-blue-400 text-white hover:bg-blue-800"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </Button>
                <Button className="bg-yellow-500 text-blue-900 hover:bg-yellow-400">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Account
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="mb-6 flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-blue-300" />
                <Input
                  placeholder="Search by customer name or account number..."
                  className="border-blue-700 bg-blue-900/50 pl-10 text-white placeholder:text-blue-300"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[150px] border-blue-700 bg-blue-900/50 text-white">
                  <SelectValue placeholder="Account Type" />
                </SelectTrigger>
                <SelectContent className="bg-blue-900 text-white">
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="savings">Savings</SelectItem>
                  <SelectItem value="current">Current</SelectItem>
                  <SelectItem value="business">Business</SelectItem>
                  <SelectItem value="fixed">Fixed Deposit</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px] border-blue-700 bg-blue-900/50 text-white">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent className="bg-blue-900 text-white">
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                className="border-blue-400 text-white hover:bg-blue-800"
              >
                <Filter className="h-4 w-4" />
              </Button>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-blue-200">Loading accounts...</div>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredAccounts.map((account) => (
                  <div
                    key={account.id}
                    className="flex items-center justify-between rounded-lg border border-blue-700 bg-blue-900/30 p-4"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-700 text-white font-bold">
                        {account.accountType.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">
                            {account.accountNumber}
                          </h3>
                          {getAccountTypeBadge(account.accountType)}
                          <Badge className="bg-green-500/20 text-green-400">
                            Active
                          </Badge>
                        </div>
                        <div className="text-sm text-blue-200">
                          Owner:{" "}
                          {getUserById(account.userId)?.username ||
                            "Loading..."}
                        </div>
                        <div className="text-xs text-blue-300">
                          Email:{" "}
                          {getUserById(account.userId)?.email || "Loading..."}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="font-semibold text-lg">
                          RWF {account.balance.toLocaleString()}
                        </div>
                        <div className="text-sm text-blue-200">Balance</div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-blue-300"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="bg-blue-900 text-white">
                          <DropdownMenuItem>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Account
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Ban className="mr-2 h-4 w-4" />
                            Suspend Account
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-red-400"
                            onClick={() => handleDeleteAccount(account.id)}
                          >
                            <Ban className="mr-2 h-4 w-4" />
                            Delete Account
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
