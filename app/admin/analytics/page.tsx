"use client";

import {
  Bell,
  ChevronDown,
  TrendingUp,
  TrendingDown,
  Download,
} from "lucide-react";
import { useState, useEffect } from "react";
import { apiClient } from "@/lib/api";

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
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/app/components/admin-sidebar";
import { Progress } from "@/components/ui/progress";

// Define the Transaction interface with correct status values
interface Transaction {
  id: number;
  amount: number;
  transactionType: string;
  timestamp: string;
  createdAt: string; // When the transaction was created
  updatedAt: string; // When the transaction was last updated
  fromAccount: { accountNumber: string } | null;
  toAccount: { accountNumber: string } | null;
  user: { username: string };
  status: "COMPLETED" | "PENDING" | "FAILED";
}

export default function AnalyticsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const allTransactions = await apiClient.getAllTransactions();
        console.log("Fetched transactions:", allTransactions);
        setTransactions(allTransactions as Transaction[]);
      } catch (error) {
        console.error("Error fetching transactions:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  // Calculate success rate for current day and previous day
  const calculateSuccessRate = (
    transactions: Transaction[],
    daysAgo: number = 0
  ) => {
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() - daysAgo);
    const dateStr = targetDate.toISOString().split("T")[0];

    console.log("Calculating for date:", dateStr);
    console.log("Total transactions:", transactions.length);

    const dayTransactions = transactions.filter(
      (t) => new Date(t.timestamp).toISOString().split("T")[0] === dateStr
    );

    console.log("Filtered transactions for day:", dayTransactions.length);

    if (dayTransactions.length === 0) {
      console.log("No transactions found for this day");
      return 0;
    }

    const successfulTransactions = dayTransactions.filter(
      (t) => t.status === "COMPLETED"
    ).length;

    console.log("Successful transactions:", successfulTransactions);

    const rate = (successfulTransactions / dayTransactions.length) * 100;
    console.log("Calculated success rate:", rate);

    return rate;
  };

  const todaySuccessRate = calculateSuccessRate(transactions, 0);
  const yesterdaySuccessRate = calculateSuccessRate(transactions, 1);
  const successRateChange = todaySuccessRate - yesterdaySuccessRate;

  // Calculate average response time for a given day
  const calculateAverageResponseTime = (
    transactions: Transaction[],
    daysAgo: number = 0
  ) => {
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() - daysAgo);
    const dateStr = targetDate.toISOString().split("T")[0];

    const dayTransactions = transactions.filter((t) => {
      const transactionDate = new Date(t.timestamp).toISOString().split("T")[0];
      return transactionDate === dateStr && t.status === "COMPLETED";
    });

    if (dayTransactions.length === 0) return 0;

    const responseTimes = dayTransactions.map((t) => {
      const startTime = new Date(t.createdAt).getTime();
      const endTime = new Date(t.updatedAt).getTime();
      return endTime - startTime;
    });

    console.log("Response times for", dateStr, ":", responseTimes);

    const totalResponseTime = responseTimes.reduce(
      (sum, time) => sum + time,
      0
    );
    const avgTime = totalResponseTime / dayTransactions.length;

    console.log("Average response time for", dateStr, ":", avgTime, "ms");

    return avgTime;
  };

  const todayAvgResponseTime = calculateAverageResponseTime(transactions, 0);
  const yesterdayAvgResponseTime = calculateAverageResponseTime(
    transactions,
    1
  );
  const responseTimeChange = todayAvgResponseTime - yesterdayAvgResponseTime;

  // Format response time to readable string
  const formatResponseTime = (ms: number): string => {
    if (ms === 0) return "N/A";
    if (isNaN(ms)) return "N/A";
    if (ms < 1000) return `${ms.toFixed(0)}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  // Calculate daily transaction volumes starting from the first transaction
  const calculateDailyVolumes = () => {
    if (transactions.length === 0) return { volumes: [], dates: [] };

    // Find the earliest and latest transaction dates
    const dates = transactions.map(
      (t) => new Date(t.timestamp).toISOString().split("T")[0]
    );
    const earliestDate = new Date(
      Math.min(...dates.map((d) => new Date(d).getTime()))
    );
    const latestDate = new Date(
      Math.max(...dates.map((d) => new Date(d).getTime()))
    );

    const volumes: number[] = [];
    const volumeDates: string[] = [];

    // Calculate the number of days between earliest and latest
    const daysDiff = Math.ceil(
      (latestDate.getTime() - earliestDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    // Get volumes for each day from earliest to latest
    for (let i = 0; i <= daysDiff; i++) {
      const targetDate = new Date(earliestDate);
      targetDate.setDate(earliestDate.getDate() + i);
      const dateStr = targetDate.toISOString().split("T")[0];

      const dayTransactions = transactions.filter(
        (t) => new Date(t.timestamp).toISOString().split("T")[0] === dateStr
      );

      volumes.push(dayTransactions.length);
      volumeDates.push(dateStr);
    }

    return { volumes, dates: volumeDates };
  };

  const { volumes: dailyVolumes, dates: volumeDates } = calculateDailyVolumes();
  const maxVolume = Math.max(...dailyVolumes, 1); // Avoid division by zero

  const exportTransactionData = () => {
    if (dailyVolumes.length === 0 || volumeDates.length === 0) return;

    // Create CSV content with formatted dates
    const csvContent = [
      ["Date", "Number of Transactions", "Total Volume"],
      ...volumeDates.map((date, index) => {
        const formattedDate = new Date(date).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        });
        const dayTransactions = transactions.filter(
          (t) => new Date(t.timestamp).toISOString().split("T")[0] === date
        );
        const totalVolume = dayTransactions.reduce(
          (sum, t) => sum + t.amount,
          0
        );
        return [
          `"${formattedDate}"`, // Wrap date in quotes to preserve formatting
          `${dailyVolumes[index]}`,
          `${totalVolume.toLocaleString("en-US")}`,
        ];
      }),
    ]
      .map((row) => row.join(","))
      .join("\n");

    // Create and trigger download with formatted filename
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    const today = new Date()
      .toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
      .replace(/,/g, "");
    link.setAttribute("href", url);
    link.setAttribute("download", `transaction_volumes_${today}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#0a3977] text-white">
      <main className="flex-1 p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-semibold">Advanced Analytics</h2>
          <p className="text-blue-200">
            Detailed insights and performance metrics
          </p>
        </div>

        <Tabs defaultValue="performance" className="w-full">
          <TabsList className="bg-blue-900/50">
            <TabsTrigger
              value="performance"
              className="data-[state=active]:bg-blue-800"
            >
              Performance
            </TabsTrigger>
            <TabsTrigger
              value="customers"
              className="data-[state=active]:bg-blue-800"
            >
              Customer Analytics
            </TabsTrigger>
            <TabsTrigger
              value="revenue"
              className="data-[state=active]:bg-blue-800"
            >
              Revenue Analysis
            </TabsTrigger>
            <TabsTrigger
              value="risk"
              className="data-[state=active]:bg-blue-800"
            >
              Risk Management
            </TabsTrigger>
          </TabsList>

          <TabsContent value="performance" className="mt-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <Card className="bg-blue-800/50 text-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-blue-200">
                        Transaction Success Rate
                      </p>
                      <p className="text-2xl font-bold">
                        {loading
                          ? "Loading..."
                          : `${todaySuccessRate.toFixed(1)}%`}
                      </p>
                      <div
                        className={`flex items-center gap-1 text-sm ${
                          successRateChange >= 0
                            ? "text-green-400"
                            : "text-red-400"
                        }`}
                      >
                        {successRateChange >= 0 ? (
                          <TrendingUp className="h-4 w-4" />
                        ) : (
                          <TrendingDown className="h-4 w-4" />
                        )}
                        {Math.abs(successRateChange).toFixed(1)}%
                      </div>
                    </div>
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-full ${
                        successRateChange >= 0
                          ? "bg-green-500/20"
                          : "bg-red-500/20"
                      }`}
                    >
                      {successRateChange >= 0 ? (
                        <TrendingUp
                          className={`h-6 w-6 ${
                            successRateChange >= 0
                              ? "text-green-400"
                              : "text-red-400"
                          }`}
                        />
                      ) : (
                        <TrendingDown
                          className={`h-6 w-6 ${
                            successRateChange >= 0
                              ? "text-green-400"
                              : "text-red-400"
                          }`}
                        />
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-blue-800/50 text-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-blue-200">
                        Average Response Time
                      </p>
                      <p className="text-2xl font-bold">
                        {loading
                          ? "Loading..."
                          : formatResponseTime(todayAvgResponseTime)}
                      </p>
                      <div
                        className={`flex items-center gap-1 text-sm ${
                          responseTimeChange <= 0
                            ? "text-green-400"
                            : "text-red-400"
                        }`}
                      >
                        {responseTimeChange <= 0 ? (
                          <TrendingDown className="h-4 w-4" />
                        ) : (
                          <TrendingUp className="h-4 w-4" />
                        )}
                        {formatResponseTime(Math.abs(responseTimeChange))}
                      </div>
                    </div>
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-full ${
                        responseTimeChange <= 0
                          ? "bg-green-500/20"
                          : "bg-red-500/20"
                      }`}
                    >
                      {responseTimeChange <= 0 ? (
                        <TrendingDown
                          className={`h-6 w-6 ${
                            responseTimeChange <= 0
                              ? "text-green-400"
                              : "text-red-400"
                          }`}
                        />
                      ) : (
                        <TrendingUp
                          className={`h-6 w-6 ${
                            responseTimeChange <= 0
                              ? "text-green-400"
                              : "text-red-400"
                          }`}
                        />
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-blue-800/50 text-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-blue-200">System Uptime</p>
                      <p className="text-2xl font-bold">99.9%</p>
                      <div className="flex items-center gap-1 text-sm text-green-400">
                        <TrendingUp className="h-4 w-4" />
                        +0.1%
                      </div>
                    </div>
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-500/20">
                      <TrendingUp className="h-6 w-6 text-green-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-blue-800/50 text-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-blue-200">Error Rate</p>
                      <p className="text-2xl font-bold">0.3%</p>
                      <div className="flex items-center gap-1 text-sm text-red-400">
                        <TrendingUp className="h-4 w-4" />
                        +0.1%
                      </div>
                    </div>
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-500/20">
                      <TrendingUp className="h-6 w-6 text-red-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="mt-8 grid gap-6 lg:grid-cols-2">
              <Card className="bg-blue-800/50 text-white">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Transaction Volume Trends</CardTitle>
                    <CardDescription className="text-blue-200">
                      Daily transaction patterns from{" "}
                      {volumeDates[0]
                        ? new Date(volumeDates[0]).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })
                        : "N/A"}
                    </CardDescription>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-blue-300 hover:text-blue-100 hover:bg-blue-700/50 cursor-pointer"
                    onClick={exportTransactionData}
                    title="Export data as CSV"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="h-64 w-full">
                    <div className="flex h-full items-end justify-between gap-1">
                      {dailyVolumes.map((volume, index) => (
                        <div
                          key={index}
                          className="relative flex-1 rounded-t bg-gradient-to-t from-blue-500 to-blue-400 group"
                          style={{ height: `${(volume / maxVolume) * 100}%` }}
                        >
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity bg-blue-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                            {volume} transactions
                            <br />
                            {new Date(volumeDates[index]).toLocaleDateString(
                              "en-US",
                              {
                                month: "short",
                                day: "numeric",
                              }
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 flex justify-between text-xs text-blue-200">
                      {volumeDates
                        .filter(
                          (_, i) =>
                            i === 0 ||
                            i === Math.floor(volumeDates.length / 5) ||
                            i === Math.floor((volumeDates.length * 2) / 5) ||
                            i === Math.floor((volumeDates.length * 3) / 5) ||
                            i === Math.floor((volumeDates.length * 4) / 5) ||
                            i === volumeDates.length - 1
                        )
                        .map((date) => (
                          <span key={date}>
                            {new Date(date).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                            })}
                          </span>
                        ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-blue-800/50 text-white">
                <CardHeader>
                  <CardTitle>Channel Performance</CardTitle>
                  <CardDescription className="text-blue-200">
                    Performance by service channel
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Mobile Banking</span>
                      <span className="font-medium">87%</span>
                    </div>
                    <Progress value={87} className="h-2 bg-blue-900" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>ATM Network</span>
                      <span className="font-medium">92%</span>
                    </div>
                    <Progress value={92} className="h-2 bg-blue-900" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Branch Services</span>
                      <span className="font-medium">95%</span>
                    </div>
                    <Progress value={95} className="h-2 bg-blue-900" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Online Banking</span>
                      <span className="font-medium">89%</span>
                    </div>
                    <Progress value={89} className="h-2 bg-blue-900" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="customers">
            <div className="flex h-60 items-center justify-center rounded-lg bg-blue-800/50 p-6">
              <p className="text-blue-200">
                Customer analytics charts and insights would go here
              </p>
            </div>
          </TabsContent>

          <TabsContent value="revenue">
            <div className="flex h-60 items-center justify-center rounded-lg bg-blue-800/50 p-6">
              <p className="text-blue-200">
                Revenue analysis charts and metrics would go here
              </p>
            </div>
          </TabsContent>

          <TabsContent value="risk">
            <div className="flex h-60 items-center justify-center rounded-lg bg-blue-800/50 p-6">
              <p className="text-blue-200">
                Risk management dashboard would go here
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
