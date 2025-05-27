"use client";

import { useState, useEffect } from "react";
import {
  Bell,
  ChevronDown,
  Download,
  FileText,
  Calendar,
  TrendingUp,
  Users,
  DollarSign,
  BarChart3,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ReportData {
  dailyTransactions: { date: string; count: number; amount: number }[];
  monthlyRevenue: { month: string; revenue: number }[];
  customerGrowth: {
    month: string;
    newCustomers: number;
    totalCustomers: number;
  }[];
  branchPerformance: {
    branch: string;
    transactions: number;
    revenue: number;
  }[];
}

export default function ReportsPage() {
  const [reportPeriod, setReportPeriod] = useState("30d");
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchReportData();
  }, [reportPeriod]);

  const fetchReportData = async () => {
    try {
      setIsLoading(true);

      // Mock report data - in real app, this would come from backend
      const mockData: ReportData = {
        dailyTransactions: Array.from({ length: 30 }, (_, i) => ({
          date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000)
            .toISOString()
            .split("T")[0],
          count: Math.floor(Math.random() * 500) + 200,
          amount: Math.floor(Math.random() * 50000000) + 10000000,
        })),
        monthlyRevenue: [
          { month: "Jan", revenue: 1200000000 },
          { month: "Feb", revenue: 1350000000 },
          { month: "Mar", revenue: 1180000000 },
          { month: "Apr", revenue: 1420000000 },
          { month: "May", revenue: 1580000000 },
          { month: "Jun", revenue: 1650000000 },
        ],
        customerGrowth: [
          { month: "Jan", newCustomers: 245, totalCustomers: 8500 },
          { month: "Feb", newCustomers: 312, totalCustomers: 8812 },
          { month: "Mar", newCustomers: 189, totalCustomers: 9001 },
          { month: "Apr", newCustomers: 456, totalCustomers: 9457 },
          { month: "May", newCustomers: 523, totalCustomers: 9980 },
          { month: "Jun", newCustomers: 398, totalCustomers: 10378 },
        ],
        branchPerformance: [
          {
            branch: "Kigali City Center",
            transactions: 15420,
            revenue: 450000000,
          },
          { branch: "Nyarugenge", transactions: 12340, revenue: 380000000 },
          { branch: "Musanze", transactions: 8760, revenue: 250000000 },
          { branch: "Huye", transactions: 9850, revenue: 290000000 },
          { branch: "Rubavu", transactions: 7890, revenue: 220000000 },
        ],
      };

      setReportData(mockData);
    } catch (error) {
      console.error("Error fetching report data:", error);
      toast.error("Failed to load report data. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const generateReport = async (reportType: string) => {
    try {
      toast.success(
        `${reportType} report has been generated and will be downloaded shortly.`
      );
      // In real app, this would trigger a download
    } catch (error) {
      toast.error("Failed to generate report. Please try again.");
    }
  };

  const reportTypes = [
    {
      id: "financial",
      title: "Financial Summary",
      description: "Comprehensive financial performance report",
      icon: DollarSign,
    },
    {
      id: "transactions",
      title: "Transaction Analysis",
      description: "Detailed transaction patterns and trends",
      icon: BarChart3,
    },
    {
      id: "customers",
      title: "Customer Report",
      description: "Customer growth and demographics analysis",
      icon: Users,
    },
    {
      id: "branches",
      title: "Branch Performance",
      description: "Individual branch performance metrics",
      icon: TrendingUp,
    },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-[#0a3977] text-white">
      <main className="flex-1 p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-semibold">Reports & Analytics</h2>
          <p className="text-blue-200">
            Generate and view comprehensive business reports
          </p>
        </div>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="bg-blue-900/50">
            <TabsTrigger
              value="overview"
              className="data-[state=active]:bg-blue-800"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger
              value="financial"
              className="data-[state=active]:bg-blue-800"
            >
              Financial
            </TabsTrigger>
            <TabsTrigger
              value="operational"
              className="data-[state=active]:bg-blue-800"
            >
              Operational
            </TabsTrigger>
            <TabsTrigger
              value="custom"
              className="data-[state=active]:bg-blue-800"
            >
              Custom Reports
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Quick Report Generation */}
              <Card className="bg-blue-800/50 text-white">
                <CardHeader>
                  <CardTitle>Quick Reports</CardTitle>
                  <CardDescription className="text-blue-200">
                    Generate standard reports instantly
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {reportTypes.map((report) => (
                    <div
                      key={report.id}
                      className="flex items-center justify-between rounded-lg border border-blue-700 bg-blue-900/30 p-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-700/50">
                          <report.icon className="h-5 w-5 text-blue-300" />
                        </div>
                        <div>
                          <div className="font-medium">{report.title}</div>
                          <div className="text-sm text-blue-200">
                            {report.description}
                          </div>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        className="bg-yellow-500 text-blue-900 hover:bg-yellow-400"
                        onClick={() => generateReport(report.title)}
                      >
                        <Download className="mr-1 h-4 w-4" />
                        Generate
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Recent Reports */}
              <Card className="bg-blue-800/50 text-white">
                <CardHeader>
                  <CardTitle>Recent Reports</CardTitle>
                  <CardDescription className="text-blue-200">
                    Previously generated reports
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    {
                      name: "Monthly Financial Summary",
                      date: "2025-01-20",
                      size: "2.4 MB",
                    },
                    {
                      name: "Q4 2024 Performance Report",
                      date: "2025-01-15",
                      size: "5.1 MB",
                    },
                    {
                      name: "Customer Growth Analysis",
                      date: "2025-01-10",
                      size: "1.8 MB",
                    },
                    {
                      name: "Branch Comparison Report",
                      date: "2025-01-05",
                      size: "3.2 MB",
                    },
                  ].map((report, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between rounded-lg border border-blue-700 bg-blue-900/30 p-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-700/50">
                          <FileText className="h-5 w-5 text-blue-300" />
                        </div>
                        <div>
                          <div className="font-medium">{report.name}</div>
                          <div className="text-sm text-blue-200">
                            {report.date} • {report.size}
                          </div>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-blue-400 text-white hover:bg-blue-800"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="financial" className="mt-6">
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-blue-200">Loading financial data...</div>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2">
                <Card className="bg-blue-800/50 text-white">
                  <CardHeader>
                    <CardTitle>Monthly Revenue Trend</CardTitle>
                    <CardDescription className="text-blue-200">
                      Revenue performance over the last 6 months
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64 w-full">
                      <div className="flex h-full items-end justify-between gap-2">
                        {reportData?.monthlyRevenue.map((data, index) => (
                          <div
                            key={index}
                            className="flex flex-col items-center gap-2"
                          >
                            <div
                              className="w-8 rounded-t bg-gradient-to-t from-green-500 to-green-400"
                              style={{
                                height: `${(data.revenue / 2000000000) * 100}%`,
                              }}
                            />
                            <div className="text-xs text-blue-200">
                              {data.month}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-blue-800/50 text-white">
                  <CardHeader>
                    <CardTitle>Daily Transaction Volume</CardTitle>
                    <CardDescription className="text-blue-200">
                      Transaction count and amount for the last 30 days
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64 w-full">
                      <div className="flex h-full items-end justify-between gap-1">
                        {reportData?.dailyTransactions
                          .slice(-14)
                          .map((data, index) => (
                            <div
                              key={index}
                              className="flex flex-col items-center gap-1"
                            >
                              <div
                                className="w-4 rounded-t bg-gradient-to-t from-blue-500 to-blue-400"
                                style={{
                                  height: `${(data.count / 700) * 100}%`,
                                }}
                              />
                              <div className="text-xs text-blue-200 rotate-45 origin-bottom-left">
                                {new Date(data.date).getDate()}
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          <TabsContent value="operational" className="mt-6">
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-blue-200">Loading operational data...</div>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2">
                <Card className="bg-blue-800/50 text-white">
                  <CardHeader>
                    <CardTitle>Branch Performance</CardTitle>
                    <CardDescription className="text-blue-200">
                      Transaction volume by branch
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {reportData?.branchPerformance.map((branch, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span>{branch.branch}</span>
                          <span className="font-medium">
                            {branch.transactions.toLocaleString()}
                          </span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-blue-900">
                          <div
                            className="h-2 rounded-full bg-gradient-to-r from-yellow-500 to-yellow-400"
                            style={{
                              width: `${(branch.transactions / 20000) * 100}%`,
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card className="bg-blue-800/50 text-white">
                  <CardHeader>
                    <CardTitle>Customer Growth</CardTitle>
                    <CardDescription className="text-blue-200">
                      New customer acquisition over time
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64 w-full">
                      <div className="flex h-full items-end justify-between gap-2">
                        {reportData?.customerGrowth.map((data, index) => (
                          <div
                            key={index}
                            className="flex flex-col items-center gap-2"
                          >
                            <div
                              className="w-8 rounded-t bg-gradient-to-t from-purple-500 to-purple-400"
                              style={{
                                height: `${(data.newCustomers / 600) * 100}%`,
                              }}
                            />
                            <div className="text-xs text-blue-200">
                              {data.month}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          <TabsContent value="custom" className="mt-6">
            <Card className="bg-blue-800/50 text-white">
              <CardHeader>
                <CardTitle>Custom Report Builder</CardTitle>
                <CardDescription className="text-blue-200">
                  Create custom reports with specific parameters
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex h-64 items-center justify-center">
                  <div className="text-center">
                    <Calendar className="mx-auto h-12 w-12 text-blue-300 mb-4" />
                    <p className="text-blue-200">
                      Custom report builder coming soon
                    </p>
                    <p className="text-sm text-blue-300 mt-2">
                      This feature will allow you to create reports with custom
                      date ranges, filters, and metrics.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
