"use client";

import { useState, useEffect } from "react";
import { apiClient, type User, type Account } from "@/lib/api";

// Update Transaction interface to match database structure
interface Transaction {
  id: number;
  amount: number;
  transactionType: string;
  timestamp: string;
  fromAccount: { accountNumber: string } | null;
  toAccount: { accountNumber: string } | null;
  user: { username: string };
  status: "completed" | "pending" | "failed";
}

type APITransaction = {
  id: number;
  amount: number;
  transactionType: string;
  timestamp: string;
  fromAccount: { accountNumber: string } | null;
  toAccount: { accountNumber: string } | null;
  user: { username: string };
  status: "completed" | "pending" | "failed";
};

import {
  Bell,
  ChevronDown,
  Users,
  CreditCard,
  DollarSign,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  MoreHorizontal,
  Download,
  Filter,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";

function formatCurrency(amount: number): string {
  if (amount >= 1000000000) {
    return `RWF ${(amount / 1000000000).toFixed(1)}B`;
  }
  if (amount >= 1000000) {
    return `RWF ${(amount / 1000000).toFixed(1)}M`;
  }
  return `RWF ${amount.toLocaleString()}`;
}

export default function Home() {
  const [timeRange, setTimeRange] = useState("7d");
  const [users, setUsers] = useState<User[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [dailyTransactions, setDailyTransactions] = useState<number[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        const [allUsers, allAccounts, allTransactions] = await Promise.all([
          apiClient.getAllUsers(),
          apiClient.getAllAccounts(),
          apiClient.getAllTransactions(),
        ]);

        // Calculate account type distribution
        const accountTypeDistribution = allAccounts.reduce((acc, account) => {
          const type = account.accountType;
          acc[type] = (acc[type] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        const total = Object.values(accountTypeDistribution).reduce(
          (a, b) => a + b,
          0
        );

        // Convert to percentage and format for display
        const accountTypes = Object.entries(accountTypeDistribution).map(
          ([type, count]) => ({
            type,
            count,
            percentage: Math.round((count / total) * 100),
          })
        );

        setUsers(allUsers);
        setAccounts(allAccounts);
        setTransactions(allTransactions as APITransaction[]);

        // Find the date range in the transactions
        const dates = allTransactions
          .map((t) => new Date(t.timestamp).toISOString().split("T")[0])
          .sort();

        // Get the most recent date
        const lastDate = dates[dates.length - 1];
        if (!lastDate) {
          return;
        }

        // Create an array of 7 days ending at the most recent transaction
        const last7Days = Array.from({ length: 7 }, (_, i) => {
          const d = new Date(lastDate);
          d.setDate(d.getDate() - (6 - i)); // Count backwards from the last date
          const formattedDate = d.toISOString().split("T")[0];

          return formattedDate;
        });

        // Count transactions per day
        const dailyCounts = allTransactions.reduce((acc, t) => {
          if (!t || !t.timestamp) {
            return acc;
          }

          const date = new Date(t.timestamp).toISOString().split("T")[0];

          acc[date] = (acc[date] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        // Map counts to days
        const countsArray = last7Days.map((date) => {
          const count = dailyCounts[date] || 0;
          return count;
        });

        setDailyTransactions(countsArray);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [mounted]);

  const stats = [
    {
      title: "Total Customers",
      value: users.length.toString(),
      change: (() => {
        // Get today's date
        const today = new Date().toISOString().split("T")[0];
        // Get yesterday's date
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split("T")[0];

        // Count users created today
        const todayUsers = users.filter(
          (user) =>
            user.createdAt &&
            new Date(user.createdAt).toISOString().split("T")[0] === today
        ).length;

        // Count users created yesterday
        const yesterdayUsers = users.filter(
          (user) =>
            user.createdAt &&
            new Date(user.createdAt).toISOString().split("T")[0] ===
              yesterdayStr
        ).length;

        // Calculate change percentage
        if (yesterdayUsers === 0) return todayUsers > 0 ? "+100%" : "0%";

        const changePercent =
          ((todayUsers - yesterdayUsers) / yesterdayUsers) * 100;
        const sign = changePercent > 0 ? "+" : "";
        return `${sign}${changePercent.toFixed(1)}%`;
      })(),
      trend: (() => {
        const today = new Date().toISOString().split("T")[0];
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split("T")[0];

        const todayUsers = users.filter(
          (user) =>
            user.createdAt &&
            new Date(user.createdAt).toISOString().split("T")[0] === today
        ).length;
        const yesterdayUsers = users.filter(
          (user) =>
            user.createdAt &&
            new Date(user.createdAt).toISOString().split("T")[0] ===
              yesterdayStr
        ).length;

        return todayUsers >= yesterdayUsers ? "up" : "down";
      })(),
      icon: Users,
      color: (() => {
        const today = new Date().toISOString().split("T")[0];
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split("T")[0];

        const todayUsers = users.filter(
          (user) =>
            user.createdAt &&
            new Date(user.createdAt).toISOString().split("T")[0] === today
        ).length;
        const yesterdayUsers = users.filter(
          (user) =>
            user.createdAt &&
            new Date(user.createdAt).toISOString().split("T")[0] ===
              yesterdayStr
        ).length;

        return todayUsers >= yesterdayUsers ? "text-green-400" : "text-red-400";
      })(),
    },
    {
      title: "Total Deposits",
      value: formatCurrency(
        accounts.reduce((sum, acc) => sum + acc.balance, 0)
      ),
      change: (() => {
        // Get today's date
        const today = new Date().toISOString().split("T")[0];
        // Get yesterday's date
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split("T")[0];

        // Calculate today's total deposits
        const todayDeposits = transactions
          .filter(
            (t) =>
              t.transactionType === "DEPOSIT" &&
              new Date(t.timestamp).toISOString().split("T")[0] === today
          )
          .reduce((sum, t) => sum + t.amount, 0);

        // Calculate yesterday's total deposits
        const yesterdayDeposits = transactions
          .filter(
            (t) =>
              t.transactionType === "DEPOSIT" &&
              new Date(t.timestamp).toISOString().split("T")[0] === yesterdayStr
          )
          .reduce((sum, t) => sum + t.amount, 0);

        // Calculate change percentage
        if (yesterdayDeposits === 0) return todayDeposits > 0 ? "+100%" : "0%";

        const changePercent =
          ((todayDeposits - yesterdayDeposits) / yesterdayDeposits) * 100;
        const sign = changePercent > 0 ? "+" : "";
        return `${sign}${changePercent.toFixed(1)}%`;
      })(),
      trend: (() => {
        const today = new Date().toISOString().split("T")[0];
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split("T")[0];

        const todayDeposits = transactions
          .filter(
            (t) =>
              t.transactionType === "DEPOSIT" &&
              new Date(t.timestamp).toISOString().split("T")[0] === today
          )
          .reduce((sum, t) => sum + t.amount, 0);

        const yesterdayDeposits = transactions
          .filter(
            (t) =>
              t.transactionType === "DEPOSIT" &&
              new Date(t.timestamp).toISOString().split("T")[0] === yesterdayStr
          )
          .reduce((sum, t) => sum + t.amount, 0);

        return todayDeposits >= yesterdayDeposits ? "up" : "down";
      })(),
      icon: DollarSign,
      color: (() => {
        const today = new Date().toISOString().split("T")[0];
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split("T")[0];

        const todayDeposits = transactions
          .filter(
            (t) =>
              t.transactionType === "DEPOSIT" &&
              new Date(t.timestamp).toISOString().split("T")[0] === today
          )
          .reduce((sum, t) => sum + t.amount, 0);

        const yesterdayDeposits = transactions
          .filter(
            (t) =>
              t.transactionType === "DEPOSIT" &&
              new Date(t.timestamp).toISOString().split("T")[0] === yesterdayStr
          )
          .reduce((sum, t) => sum + t.amount, 0);

        return todayDeposits >= yesterdayDeposits
          ? "text-green-400"
          : "text-red-400";
      })(),
    },
    {
      title: "Active Accounts",
      value: accounts
        .filter((acc) => acc.status !== "INACTIVE")
        .length.toString(),
      change:
        accounts.length > 0
          ? `+${(
              (accounts.filter((acc) => acc.status !== "INACTIVE").length /
                accounts.length) *
              100
            ).toFixed(1)}%`
          : "0%",
      trend: "up",
      icon: CreditCard,
      color: "text-green-400",
    },
    {
      title: "Daily Transactions",
      value: (() => {
        const today = new Date().toISOString().split("T")[0];
        const todayCount = transactions.filter(
          (t) => new Date(t.timestamp).toISOString().split("T")[0] === today
        ).length;
        return todayCount.toString();
      })(),
      change: (() => {
        // Get today's date
        const today = new Date().toISOString().split("T")[0];
        // Get yesterday's date
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split("T")[0];

        // Count today's transactions
        const todayCount = transactions.filter(
          (t) => new Date(t.timestamp).toISOString().split("T")[0] === today
        ).length;

        // Count yesterday's transactions
        const yesterdayCount = transactions.filter(
          (t) =>
            new Date(t.timestamp).toISOString().split("T")[0] === yesterdayStr
        ).length;

        // Calculate change percentage
        if (yesterdayCount === 0) return todayCount > 0 ? "+100%" : "0%";

        const changePercent =
          ((todayCount - yesterdayCount) / yesterdayCount) * 100;
        const sign = changePercent > 0 ? "+" : "";
        return `${sign}${changePercent.toFixed(1)}%`;
      })(),
      trend: (() => {
        const today = new Date().toISOString().split("T")[0];
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split("T")[0];

        const todayCount = transactions.filter(
          (t) => new Date(t.timestamp).toISOString().split("T")[0] === today
        ).length;
        const yesterdayCount = transactions.filter(
          (t) =>
            new Date(t.timestamp).toISOString().split("T")[0] === yesterdayStr
        ).length;

        return todayCount >= yesterdayCount ? "up" : "down";
      })(),
      icon: Activity,
      color: (() => {
        const today = new Date().toISOString().split("T")[0];
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split("T")[0];

        const todayCount = transactions.filter(
          (t) => new Date(t.timestamp).toISOString().split("T")[0] === today
        ).length;
        const yesterdayCount = transactions.filter(
          (t) =>
            new Date(t.timestamp).toISOString().split("T")[0] === yesterdayStr
        ).length;

        return todayCount >= yesterdayCount ? "text-green-400" : "text-red-400";
      })(),
    },
  ];

  // Helper function to format relative time
  const getRelativeTime = (timestamp: string) => {
    const now = new Date();
    const txDate = new Date(timestamp);
    const diffInSeconds = Math.floor((now.getTime() - txDate.getTime()) / 1000);

    if (diffInSeconds < 60) return `${diffInSeconds} sec ago`;
    if (diffInSeconds < 3600)
      return `${Math.floor(diffInSeconds / 60)} min ago`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)} hr ago`;
    return `${Math.floor(diffInSeconds / 86400)} days ago`;
  };

  // Get recent transactions from actual data
  const recentTransactions = transactions
    .sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )
    .slice(0, 5)
    .map((transaction) => ({
      id: transaction.id.toString(),
      customer: transaction.user.username,
      type: transaction.transactionType,
      amount: transaction.amount,
      status: transaction.status,
      time: getRelativeTime(transaction.timestamp),
    }));

  // Calculate top customers by transaction count
  const topCustomers = Object.entries(
    transactions.reduce((acc, t) => {
      const username = t.user.username;
      if (!acc[username]) {
        acc[username] = {
          transactionCount: 0,
          totalAmount: 0,
          lastTransaction: new Date(t.timestamp),
        };
      }
      acc[username].transactionCount++;
      acc[username].totalAmount += t.amount;
      const txDate = new Date(t.timestamp);
      if (txDate > acc[username].lastTransaction) {
        acc[username].lastTransaction = txDate;
      }
      return acc;
    }, {} as Record<string, { transactionCount: number; totalAmount: number; lastTransaction: Date }>)
  )
    .map(([username, stats]) => ({
      username,
      ...stats,
    }))
    .sort((a, b) => b.transactionCount - a.transactionCount)
    .slice(0, 5);

  const accountTypesSection = (
    <Card className="bg-blue-800/50 text-white">
      <CardHeader>
        <CardTitle>Account Types</CardTitle>
        <CardDescription className="text-blue-200">
          Distribution by account type
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {accounts.length > 0 ? (
          Object.entries(
            accounts.reduce((acc, account) => {
              const type = account.accountType;
              acc[type] = (acc[type] || 0) + 1;
              return acc;
            }, {} as Record<string, number>)
          ).map(([type, count]) => {
            const percentage = Math.round((count / accounts.length) * 100);
            return (
              <div key={type} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>{type}</span>
                  <span className="font-medium">{count.toLocaleString()}</span>
                </div>
                <Progress value={percentage} className="h-2 bg-blue-900" />
                <div className="text-right text-xs text-blue-200">
                  {percentage}%
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center text-blue-200">No accounts found</div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <main className="flex-1 p-6 ">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold">Dashboard Overview</h2>
        <p className="text-blue-200">
          Monitor bank operations and performance metrics
        </p>
      </div>

      {/* Key Statistics */}
      <div className="mb-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="bg-blue-800/50 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-200">{stat.title}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <div
                    className={`flex items-center gap-1 text-sm ${stat.color}`}
                  >
                    {stat.trend === "up" ? (
                      <ArrowUpRight className="h-4 w-4" />
                    ) : (
                      <ArrowDownRight className="h-4 w-4" />
                    )}
                    {stat.change}
                  </div>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-700/50">
                  <stat.icon className="h-6 w-6 text-blue-300" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Transaction Volume Chart */}
        <div className="lg:col-span-2">
          <Card className="bg-blue-800/50 text-white">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Transaction Volume</CardTitle>
                <CardDescription className="text-blue-200">
                  Daily transaction trends
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-blue-300"
                >
                  <Filter className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-blue-300"
                >
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-64 w-full">
                <div className="flex h-full items-end justify-between gap-2">
                  <TooltipProvider>
                    {(() => {
                      // Get last 7 days
                      const last7Days = Array.from({ length: 7 }, (_, i) => {
                        const d = new Date();
                        d.setDate(d.getDate() - (6 - i));
                        const formattedDate = d.toISOString().split("T")[0];
                        return formattedDate;
                      });

                      // Count transactions per day
                      const dailyCounts = transactions.reduce((acc, t) => {
                        if (!t || !t.timestamp) return acc;
                        const date = new Date(t.timestamp)
                          .toISOString()
                          .split("T")[0];
                        acc[date] = (acc[date] || 0) + 1;
                        return acc;
                      }, {} as Record<string, number>);

                      // Map counts to days
                      const countsArray = last7Days.map((date) => {
                        const count = dailyCounts[date] || 0;
                        return count;
                      });

                      const maxCount = Math.max(...countsArray, 1);

                      return countsArray.map((count, index) => {
                        const percentage = (count / maxCount) * 100;
                        const date = last7Days[index];
                        const formattedDate = new Date(date).toLocaleDateString(
                          "en-US",
                          {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          }
                        );

                        return (
                          <Tooltip key={index}>
                            <TooltipTrigger asChild>
                              <div
                                className="flex-1 rounded-t bg-gradient-to-t from-yellow-500 to-yellow-400 cursor-pointer"
                                style={{
                                  height: `${Math.max(percentage, 5)}%`,
                                }}
                              />
                            </TooltipTrigger>
                            <TooltipContent>
                              <div className="text-sm">
                                <p className="font-semibold">{formattedDate}</p>
                                <p className="text-blue-200">
                                  {count} transactions
                                </p>
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        );
                      });
                    })()}
                  </TooltipProvider>
                </div>
                <div className="mt-4 flex justify-between text-xs text-blue-200">
                  {Array.from({ length: 7 }, (_, i) => {
                    const d = new Date();
                    d.setDate(d.getDate() - (6 - i));
                    return d.toLocaleDateString("en-US", { weekday: "short" });
                  }).map((day, i) => (
                    <span key={i}>{day}</span>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Account Types Distribution */}
        <div>{accountTypesSection}</div>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        {/* Recent Transactions */}
        <Card className="bg-blue-800/50 text-white">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription className="text-blue-200">
                Latest customer transactions
              </CardDescription>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-blue-300"
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentTransactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between rounded-lg border border-blue-700 bg-blue-900/30 p-3"
                >
                  <div>
                    <div className="font-medium">{transaction.customer}</div>
                    <div className="text-sm text-blue-200">
                      {transaction.type} • {transaction.time}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">
                      RWF {transaction.amount.toLocaleString()}
                    </div>
                    <div
                      className={`text-xs ${
                        transaction.status === "completed"
                          ? "text-green-400"
                          : transaction.status === "pending"
                          ? "text-yellow-400"
                          : "text-red-400"
                      }`}
                    >
                      {transaction.status.toUpperCase()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Customers Section */}
        <Card className="bg-blue-800/50 text-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Top Customers
              <span className="animate-bounce inline-block">🏆</span>
            </CardTitle>
            <CardDescription className="text-blue-200">
              Most active customers by transaction volume
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topCustomers.map((customer, index) => (
                <div
                  key={customer.username}
                  className="relative flex items-center justify-between rounded-lg border border-blue-700 bg-blue-900/30 p-3 overflow-hidden group hover:border-yellow-400 transition-colors"
                >
                  {/* Celebration animation overlay */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity">
                    <div className="absolute -left-4 top-1/2 animate-[celebrate-left_2s_ease-out_infinite]">
                      🎉
                    </div>
                    <div className="absolute -right-4 top-1/2 animate-[celebrate-right_2s_ease-out_infinite]">
                      🎉
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-full ${
                        index === 0
                          ? "bg-yellow-500"
                          : index === 1
                          ? "bg-gray-300"
                          : index === 2
                          ? "bg-amber-700"
                          : "bg-blue-700"
                      } text-sm font-bold`}
                    >
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-medium">{customer.username}</div>
                      <div className="text-sm text-blue-200">
                        {customer.transactionCount} transactions
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">
                      {formatCurrency(customer.totalAmount)}
                    </div>
                    <div className="text-xs text-blue-200">
                      Last active:{" "}
                      {getRelativeTime(customer.lastTransaction.toISOString())}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Analytics */}
      <div className="mt-8">
        <Card className="bg-blue-800/50 text-white">
          <CardHeader>
            <CardTitle>Revenue Analytics</CardTitle>
            <CardDescription className="text-blue-200">
              Monthly revenue breakdown by service
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="bg-blue-900/50">
                <TabsTrigger
                  value="overview"
                  className="data-[state=active]:bg-blue-800"
                >
                  Overview
                </TabsTrigger>
                <TabsTrigger
                  value="services"
                  className="data-[state=active]:bg-blue-800"
                >
                  Services
                </TabsTrigger>
                <TabsTrigger
                  value="geography"
                  className="data-[state=active]:bg-blue-800"
                >
                  Geography
                </TabsTrigger>
              </TabsList>
              <TabsContent value="overview" className="mt-4">
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="rounded-lg border border-blue-700 bg-blue-900/30 p-4">
                    <div className="text-sm text-blue-200">Total Revenue</div>
                    {(() => {
                      // Calculate this month's revenue
                      const now = new Date();
                      const thisMonth = now.getMonth();
                      const thisYear = now.getFullYear();
                      const lastMonth = thisMonth === 0 ? 11 : thisMonth - 1;
                      const lastMonthYear =
                        thisMonth === 0 ? thisYear - 1 : thisYear;

                      const thisMonthRevenue = transactions
                        .filter((t) => {
                          const date = new Date(t.timestamp);
                          return (
                            date.getMonth() === thisMonth &&
                            date.getFullYear() === thisYear
                          );
                        })
                        .reduce((sum, t) => sum + t.amount, 0);

                      const lastMonthRevenue = transactions
                        .filter((t) => {
                          const date = new Date(t.timestamp);
                          return (
                            date.getMonth() === lastMonth &&
                            date.getFullYear() === lastMonthYear
                          );
                        })
                        .reduce((sum, t) => sum + t.amount, 0);

                      const changePercent =
                        lastMonthRevenue === 0
                          ? thisMonthRevenue > 0
                            ? 100
                            : 0
                          : ((thisMonthRevenue - lastMonthRevenue) /
                              lastMonthRevenue) *
                            100;

                      return (
                        <>
                          <div className="text-2xl font-bold">
                            {formatCurrency(thisMonthRevenue)}
                          </div>
                          <div
                            className={`text-sm ${
                              changePercent >= 0
                                ? "text-green-400"
                                : "text-red-400"
                            }`}
                          >
                            {changePercent >= 0 ? "+" : ""}
                            {changePercent.toFixed(1)}% from last month
                          </div>
                        </>
                      );
                    })()}
                  </div>
                  <div className="rounded-lg border border-blue-700 bg-blue-900/30 p-4">
                    <div className="text-sm text-blue-200">
                      Transaction Fees
                    </div>
                    {(() => {
                      // Calculate this month's transaction fees (assuming 1% fee)
                      const now = new Date();
                      const thisMonth = now.getMonth();
                      const thisYear = now.getFullYear();
                      const lastMonth = thisMonth === 0 ? 11 : thisMonth - 1;
                      const lastMonthYear =
                        thisMonth === 0 ? thisYear - 1 : thisYear;

                      const FEE_PERCENTAGE = 0.01; // 1% transaction fee

                      const thisMonthFees = transactions
                        .filter((t) => {
                          const date = new Date(t.timestamp);
                          return (
                            date.getMonth() === thisMonth &&
                            date.getFullYear() === thisYear
                          );
                        })
                        .reduce((sum, t) => sum + t.amount * FEE_PERCENTAGE, 0);

                      const lastMonthFees = transactions
                        .filter((t) => {
                          const date = new Date(t.timestamp);
                          return (
                            date.getMonth() === lastMonth &&
                            date.getFullYear() === lastMonthYear
                          );
                        })
                        .reduce((sum, t) => sum + t.amount * FEE_PERCENTAGE, 0);

                      const changePercent =
                        lastMonthFees === 0
                          ? thisMonthFees > 0
                            ? 100
                            : 0
                          : ((thisMonthFees - lastMonthFees) / lastMonthFees) *
                            100;

                      return (
                        <>
                          <div className="text-2xl font-bold">
                            {formatCurrency(thisMonthFees)}
                          </div>
                          <div
                            className={`text-sm ${
                              changePercent >= 0
                                ? "text-green-400"
                                : "text-red-400"
                            }`}
                          >
                            {changePercent >= 0 ? "+" : ""}
                            {changePercent.toFixed(1)}% from last month
                          </div>
                        </>
                      );
                    })()}
                  </div>
                  <div className="rounded-lg border border-blue-700 bg-blue-900/30 p-4">
                    <div className="text-sm text-blue-200">Interest Income</div>
                    {(() => {
                      // Calculate this month's interest income (assuming 5% APR on positive balances)
                      const now = new Date();
                      const thisMonth = now.getMonth();
                      const thisYear = now.getFullYear();
                      const lastMonth = thisMonth === 0 ? 11 : thisMonth - 1;
                      const lastMonthYear =
                        thisMonth === 0 ? thisYear - 1 : thisYear;

                      const ANNUAL_INTEREST_RATE = 0.05; // 5% APR
                      const MONTHLY_INTEREST_RATE = ANNUAL_INTEREST_RATE / 12;

                      const thisMonthInterest = accounts
                        .filter((acc) => acc.balance > 0)
                        .reduce(
                          (sum, acc) =>
                            sum + acc.balance * MONTHLY_INTEREST_RATE,
                          0
                        );

                      // For last month comparison, we'll use the same calculation
                      // In a real app, you'd want to store historical balance data
                      const lastMonthInterest = thisMonthInterest * 0.95; // Assuming 5% less last month

                      const changePercent =
                        lastMonthInterest === 0
                          ? thisMonthInterest > 0
                            ? 100
                            : 0
                          : ((thisMonthInterest - lastMonthInterest) /
                              lastMonthInterest) *
                            100;

                      return (
                        <>
                          <div className="text-2xl font-bold">
                            {formatCurrency(thisMonthInterest)}
                          </div>
                          <div
                            className={`text-sm ${
                              changePercent >= 0
                                ? "text-green-400"
                                : "text-red-400"
                            }`}
                          >
                            {changePercent >= 0 ? "+" : ""}
                            {changePercent.toFixed(1)}% from last month
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="services">
                <div className="space-y-6">
                  {(() => {
                    // Get current month's transactions
                    const now = new Date();
                    const thisMonth = now.getMonth();
                    const thisYear = now.getFullYear();

                    // Group transactions by type and calculate total amount
                    const serviceRevenue = transactions
                      .filter((t) => {
                        const date = new Date(t.timestamp);
                        return (
                          date.getMonth() === thisMonth &&
                          date.getFullYear() === thisYear
                        );
                      })
                      .reduce((acc, t) => {
                        acc[t.transactionType] =
                          (acc[t.transactionType] || 0) + t.amount;
                        return acc;
                      }, {} as Record<string, number>);

                    // Convert to array and sort by amount
                    const services = Object.entries(serviceRevenue)
                      .map(([type, amount]) => ({
                        type,
                        amount,
                        percentage: 0, // Will be calculated below
                      }))
                      .sort((a, b) => b.amount - a.amount);

                    // Calculate total and percentages
                    const total = services.reduce(
                      (sum, service) => sum + service.amount,
                      0
                    );
                    services.forEach((service) => {
                      service.percentage = (service.amount / total) * 100;
                    });

                    return (
                      <>
                        <div className="mb-4">
                          <h4 className="text-sm font-medium text-blue-200">
                            Revenue by Service Type
                          </h4>
                          <p className="text-2xl font-bold">
                            {formatCurrency(total)}
                          </p>
                        </div>
                        <div className="space-y-4">
                          {services.map((service) => (
                            <div key={service.type} className="space-y-2">
                              <div className="flex items-center justify-between text-sm">
                                <span className="font-medium">
                                  {service.type}
                                </span>
                                <span>{formatCurrency(service.amount)}</span>
                              </div>
                              <div className="relative h-2 overflow-hidden rounded-full bg-blue-900">
                                <div
                                  className="h-full bg-gradient-to-r from-yellow-500 to-yellow-400"
                                  style={{ width: `${service.percentage}%` }}
                                />
                              </div>
                              <div className="text-right text-xs text-blue-200">
                                {service.percentage.toFixed(1)}%
                              </div>
                            </div>
                          ))}
                        </div>
                      </>
                    );
                  })()}
                </div>
              </TabsContent>
              <TabsContent value="geography">
                <div className="flex h-40 items-center justify-center">
                  <p className="text-blue-200">
                    Geographic revenue distribution would go here
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
