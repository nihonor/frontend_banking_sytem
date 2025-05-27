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
  AlertTriangle,
  Flag,
  Shield,
} from "lucide-react";

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
import { toast } from "sonner";
import { apiClient, type Transaction, type User } from "@/lib/api";

interface SuspiciousActivity {
  id: number;
  transactionId: number;
  userId: number;
  riskLevel: "low" | "medium" | "high" | "critical";
  reason: string;
  detectedAt: string;
  status: "pending" | "reviewed" | "resolved" | "escalated";
  reviewedBy?: string;
  notes?: string;
  transaction?: Transaction;
}

export default function SuspiciousActivityPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [riskFilter, setRiskFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [suspiciousActivities, setSuspiciousActivities] = useState<
    SuspiciousActivity[]
  >([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchSuspiciousActivityData();
  }, []);

  const fetchSuspiciousActivityData = async () => {
    try {
      setIsLoading(true);
      const allUsers = await apiClient.getAllUsers();
      setUsers(allUsers);

      // Mock suspicious activities - in real app, this would come from backend
      const mockActivities: SuspiciousActivity[] = [
        {
          id: 1,
          transactionId: 1,
          userId: 1,
          riskLevel: "high",
          reason: "Large amount transfer exceeding daily limit",
          detectedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          status: "pending",
        },
        {
          id: 2,
          transactionId: 2,
          userId: 2,
          riskLevel: "medium",
          reason: "Multiple rapid transactions from same account",
          detectedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
          status: "reviewed",
          reviewedBy: "Admin User",
          notes: "Verified with customer - legitimate business transactions",
        },
        {
          id: 3,
          transactionId: 3,
          userId: 3,
          riskLevel: "critical",
          reason: "Transaction pattern matches known fraud indicators",
          detectedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
          status: "escalated",
          reviewedBy: "Security Team",
        },
        {
          id: 4,
          transactionId: 4,
          userId: 1,
          riskLevel: "low",
          reason: "Unusual transaction time (outside normal hours)",
          detectedAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
          status: "resolved",
          reviewedBy: "Admin User",
          notes: "Customer confirmed transaction",
        },
      ];

      setSuspiciousActivities(mockActivities);
    } catch (error) {
      console.error("Error fetching suspicious activity data:", error);
      toast.error("Failed to load suspicious activity data. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusUpdate = async (
    activityId: number,
    newStatus: string,
    notes?: string
  ) => {
    try {
      setSuspiciousActivities((prev) =>
        prev.map((activity) =>
          activity.id === activityId
            ? {
                ...activity,
                status: newStatus as any,
                reviewedBy: "Admin User",
                notes: notes || activity.notes,
              }
            : activity
        )
      );

      toast.success(`Activity status updated to ${newStatus}.`);
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update status. Please try again.");
    }
  };

  const getRiskBadge = (riskLevel: string) => {
    switch (riskLevel) {
      case "critical":
        return <Badge className="bg-red-600/20 text-red-400">Critical</Badge>;
      case "high":
        return <Badge className="bg-red-500/20 text-red-400">High</Badge>;
      case "medium":
        return (
          <Badge className="bg-yellow-500/20 text-yellow-400">Medium</Badge>
        );
      case "low":
        return <Badge className="bg-blue-500/20 text-blue-400">Low</Badge>;
      default:
        return <Badge className="bg-gray-500/20 text-gray-400">Unknown</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge className="bg-yellow-500/20 text-yellow-400">Pending</Badge>
        );
      case "reviewed":
        return <Badge className="bg-blue-500/20 text-blue-400">Reviewed</Badge>;
      case "resolved":
        return (
          <Badge className="bg-green-500/20 text-green-400">Resolved</Badge>
        );
      case "escalated":
        return <Badge className="bg-red-500/20 text-red-400">Escalated</Badge>;
      default:
        return <Badge className="bg-gray-500/20 text-gray-400">Unknown</Badge>;
    }
  };

  const getRiskIcon = (riskLevel: string) => {
    switch (riskLevel) {
      case "critical":
        return <AlertTriangle className="h-5 w-5 text-red-400" />;
      case "high":
        return <Flag className="h-5 w-5 text-red-400" />;
      case "medium":
        return <Shield className="h-5 w-5 text-yellow-400" />;
      case "low":
        return <Eye className="h-5 w-5 text-blue-400" />;
      default:
        return <Eye className="h-5 w-5 text-gray-400" />;
    }
  };

  const getUserById = (userId: number) =>
    users.find((user) => user.id === userId);

  const filteredActivities = suspiciousActivities.filter((activity) => {
    const user = getUserById(activity.userId);
    const matchesSearch =
      user?.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.reason.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRisk =
      riskFilter === "all" || activity.riskLevel === riskFilter;
    const matchesStatus =
      statusFilter === "all" || activity.status === statusFilter;
    return matchesSearch && matchesRisk && matchesStatus;
  });

  const activitiesByRisk = suspiciousActivities.reduce((acc, activity) => {
    acc[activity.riskLevel] = (acc[activity.riskLevel] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const pendingActivities = suspiciousActivities.filter(
    (a) => a.status === "pending"
  ).length;

  return (
    <div className="flex min-h-screen flex-col bg-[#0a3977] text-white">
      <main className="flex-1 p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-semibold">
            Suspicious Activity Monitoring
          </h2>
          <p className="text-blue-200">
            Monitor and investigate potentially fraudulent activities
          </p>
        </div>

        {/* Summary Cards */}
        <div className="mb-6 grid gap-4 md:grid-cols-4">
          <Card className="bg-blue-800/50 text-white">
            <CardContent className="p-4">
              <div className="text-sm text-blue-200">Pending Review</div>
              <div className="text-2xl font-bold text-yellow-400">
                {pendingActivities}
              </div>
            </CardContent>
          </Card>
          <Card className="bg-blue-800/50 text-white">
            <CardContent className="p-4">
              <div className="text-sm text-blue-200">Critical Risk</div>
              <div className="text-2xl font-bold text-red-400">
                {activitiesByRisk.critical || 0}
              </div>
            </CardContent>
          </Card>
          <Card className="bg-blue-800/50 text-white">
            <CardContent className="p-4">
              <div className="text-sm text-blue-200">High Risk</div>
              <div className="text-2xl font-bold text-red-400">
                {activitiesByRisk.high || 0}
              </div>
            </CardContent>
          </Card>
          <Card className="bg-blue-800/50 text-white">
            <CardContent className="p-4">
              <div className="text-sm text-blue-200">Total Activities</div>
              <div className="text-2xl font-bold">
                {suspiciousActivities.length}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-blue-800/50 text-white">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Suspicious Activities</CardTitle>
                <CardDescription className="text-blue-200">
                  Total: {suspiciousActivities.length} activities | Pending:{" "}
                  {pendingActivities}
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="border-blue-400 text-white hover:bg-blue-800"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Export Report
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="mb-6 flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-blue-300" />
                <Input
                  placeholder="Search by customer name or reason..."
                  className="border-blue-700 bg-blue-900/50 pl-10 text-white placeholder:text-blue-300"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={riskFilter} onValueChange={setRiskFilter}>
                <SelectTrigger className="w-[150px] border-blue-700 bg-blue-900/50 text-white">
                  <SelectValue placeholder="Risk Level" />
                </SelectTrigger>
                <SelectContent className="bg-blue-900 text-white">
                  <SelectItem value="all">All Risk Levels</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px] border-blue-700 bg-blue-900/50 text-white">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent className="bg-blue-900 text-white">
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="reviewed">Reviewed</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="escalated">Escalated</SelectItem>
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
                <div className="text-blue-200">
                  Loading suspicious activities...
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredActivities.map((activity) => {
                  const user = getUserById(activity.userId);
                  return (
                    <div
                      key={activity.id}
                      className="flex items-center justify-between rounded-lg border border-blue-700 bg-blue-900/30 p-4"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-700/50">
                          {getRiskIcon(activity.riskLevel)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold">
                              {user?.username || "Unknown User"}
                            </h3>
                            {getRiskBadge(activity.riskLevel)}
                            {getStatusBadge(activity.status)}
                          </div>
                          <div className="text-sm text-blue-200">
                            {activity.reason}
                          </div>
                          <div className="text-xs text-blue-300">
                            Detected:{" "}
                            {new Date(activity.detectedAt).toLocaleString()}
                          </div>
                          {activity.reviewedBy && (
                            <div className="text-xs text-blue-300">
                              Reviewed by: {activity.reviewedBy}
                            </div>
                          )}
                          {activity.notes && (
                            <div className="text-xs text-green-300 mt-1">
                              Notes: {activity.notes}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {activity.status === "pending" && (
                          <>
                            <Button
                              size="sm"
                              className="bg-green-600 hover:bg-green-700"
                              onClick={() =>
                                handleStatusUpdate(
                                  activity.id,
                                  "resolved",
                                  "Reviewed and cleared"
                                )
                              }
                            >
                              Resolve
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() =>
                                handleStatusUpdate(
                                  activity.id,
                                  "escalated",
                                  "Escalated to security team"
                                )
                              }
                            >
                              Escalate
                            </Button>
                          </>
                        )}
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
                              <Flag className="mr-2 h-4 w-4" />
                              Add Notes
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
