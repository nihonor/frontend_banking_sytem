"use client";

import { useState, useEffect } from "react";
import {
  Bell,
  ChevronDown,
  Search,
  Filter,
  Download,
  MoreHorizontal,
  Edit,
  Save,
  Shield,
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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface TransactionLimit {
  id: number;
  accountType: string;
  transactionType: string;
  dailyLimit: number;
  monthlyLimit: number;
  perTransactionLimit: number;
  isActive: boolean;
  lastUpdated: string;
  updatedBy: string;
}

export default function TransactionLimitsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [accountTypeFilter, setAccountTypeFilter] = useState("all");
  const [transactionTypeFilter, setTransactionTypeFilter] = useState("all");
  const [limits, setLimits] = useState<TransactionLimit[]>([]);
  const [editingLimit, setEditingLimit] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchTransactionLimits();
  }, []);

  const fetchTransactionLimits = async () => {
    try {
      setIsLoading(true);

      // Mock transaction limits - in real app, this would come from backend
      const mockLimits: TransactionLimit[] = [
        {
          id: 1,
          accountType: "SAVINGS",
          transactionType: "WITHDRAWAL",
          dailyLimit: 500000,
          monthlyLimit: 10000000,
          perTransactionLimit: 200000,
          isActive: true,
          lastUpdated: new Date().toISOString(),
          updatedBy: "Admin User",
        },
        {
          id: 2,
          accountType: "CURRENT",
          transactionType: "WITHDRAWAL",
          dailyLimit: 1000000,
          monthlyLimit: 20000000,
          perTransactionLimit: 500000,
          isActive: true,
          lastUpdated: new Date().toISOString(),
          updatedBy: "Admin User",
        },
        {
          id: 3,
          accountType: "SAVINGS",
          transactionType: "TRANSFER",
          dailyLimit: 1000000,
          monthlyLimit: 15000000,
          perTransactionLimit: 300000,
          isActive: true,
          lastUpdated: new Date().toISOString(),
          updatedBy: "Admin User",
        },
        {
          id: 4,
          accountType: "CURRENT",
          transactionType: "TRANSFER",
          dailyLimit: 2000000,
          monthlyLimit: 50000000,
          perTransactionLimit: 1000000,
          isActive: true,
          lastUpdated: new Date().toISOString(),
          updatedBy: "Admin User",
        },
        {
          id: 5,
          accountType: "BUSINESS",
          transactionType: "WITHDRAWAL",
          dailyLimit: 5000000,
          monthlyLimit: 100000000,
          perTransactionLimit: 2000000,
          isActive: true,
          lastUpdated: new Date().toISOString(),
          updatedBy: "Admin User",
        },
        {
          id: 6,
          accountType: "BUSINESS",
          transactionType: "TRANSFER",
          dailyLimit: 10000000,
          monthlyLimit: 200000000,
          perTransactionLimit: 5000000,
          isActive: true,
          lastUpdated: new Date().toISOString(),
          updatedBy: "Admin User",
        },
      ];

      setLimits(mockLimits);
    } catch (error) {
      console.error("Error fetching transaction limits:", error);
      toast.error("Failed to load transaction limits. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateLimit = async (
    limitId: number,
    updatedData: Partial<TransactionLimit>
  ) => {
    try {
      setLimits((prev) =>
        prev.map((limit) =>
          limit.id === limitId
            ? {
                ...limit,
                ...updatedData,
                lastUpdated: new Date().toISOString(),
                updatedBy: "Admin User",
              }
            : limit
        )
      );

      setEditingLimit(null);
      toast.success("Transaction limit has been updated successfully.");
    } catch (error) {
      console.error("Error updating limit:", error);
      toast.error("Failed to update limit. Please try again.");
    }
  };

  const handleToggleStatus = async (limitId: number) => {
    const limit = limits.find((l) => l.id === limitId);
    if (limit) {
      await handleUpdateLimit(limitId, { isActive: !limit.isActive });
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
      default:
        return <Badge className="bg-gray-500/20 text-gray-400">{type}</Badge>;
    }
  };

  const getTransactionTypeBadge = (type: string) => {
    switch (type.toLowerCase()) {
      case "withdrawal":
        return <Badge className="bg-red-500/20 text-red-400">Withdrawal</Badge>;
      case "transfer":
        return <Badge className="bg-blue-500/20 text-blue-400">Transfer</Badge>;
      case "deposit":
        return (
          <Badge className="bg-green-500/20 text-green-400">Deposit</Badge>
        );
      default:
        return <Badge className="bg-gray-500/20 text-gray-400">{type}</Badge>;
    }
  };

  const getStatusBadge = (isActive: boolean) => {
    return isActive ? (
      <Badge className="bg-green-500/20 text-green-400">Active</Badge>
    ) : (
      <Badge className="bg-red-500/20 text-red-400">Inactive</Badge>
    );
  };

  const filteredLimits = limits.filter((limit) => {
    const matchesSearch =
      limit.accountType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      limit.transactionType.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesAccountType =
      accountTypeFilter === "all" ||
      limit.accountType.toLowerCase() === accountTypeFilter.toLowerCase();
    const matchesTransactionType =
      transactionTypeFilter === "all" ||
      limit.transactionType.toLowerCase() ===
        transactionTypeFilter.toLowerCase();
    return matchesSearch && matchesAccountType && matchesTransactionType;
  });

  return (
    <div className="flex min-h-screen flex-col bg-[#0a3977] text-white">
      <main className="flex-1 p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-semibold">Transaction Limits</h2>
          <p className="text-blue-200">
            Configure and manage transaction limits for different account types
          </p>
        </div>

        <Card className="bg-blue-800/50 text-white">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Transaction Limits Configuration</CardTitle>
                <CardDescription className="text-blue-200">
                  Total: {limits.length} limit configurations
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
                  <Shield className="mr-2 h-4 w-4" />
                  Add New Limit
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="mb-6 flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-blue-300" />
                <Input
                  placeholder="Search by account type or transaction type..."
                  className="border-blue-700 bg-blue-900/50 pl-10 text-white placeholder:text-blue-300"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select
                value={accountTypeFilter}
                onValueChange={setAccountTypeFilter}
              >
                <SelectTrigger className="w-[150px] border-blue-700 bg-blue-900/50 text-white">
                  <SelectValue placeholder="Account Type" />
                </SelectTrigger>
                <SelectContent className="bg-blue-900 text-white">
                  <SelectItem value="all">All Account Types</SelectItem>
                  <SelectItem value="savings">Savings</SelectItem>
                  <SelectItem value="current">Current</SelectItem>
                  <SelectItem value="business">Business</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={transactionTypeFilter}
                onValueChange={setTransactionTypeFilter}
              >
                <SelectTrigger className="w-[150px] border-blue-700 bg-blue-900/50 text-white">
                  <SelectValue placeholder="Transaction Type" />
                </SelectTrigger>
                <SelectContent className="bg-blue-900 text-white">
                  <SelectItem value="all">All Transaction Types</SelectItem>
                  <SelectItem value="withdrawal">Withdrawal</SelectItem>
                  <SelectItem value="transfer">Transfer</SelectItem>
                  <SelectItem value="deposit">Deposit</SelectItem>
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
                  Loading transaction limits...
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredLimits.map((limit) => (
                  <div
                    key={limit.id}
                    className="rounded-lg border border-blue-700 bg-blue-900/30 p-4"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-700/50">
                          <Shield className="h-6 w-6 text-blue-300" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            {getAccountTypeBadge(limit.accountType)}
                            {getTransactionTypeBadge(limit.transactionType)}
                            {getStatusBadge(limit.isActive)}
                          </div>
                          <div className="text-sm text-blue-200 mt-1">
                            Last updated:{" "}
                            {new Date(limit.lastUpdated).toLocaleDateString()}{" "}
                            by {limit.updatedBy}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant={limit.isActive ? "destructive" : "default"}
                          onClick={() => handleToggleStatus(limit.id)}
                        >
                          {limit.isActive ? "Deactivate" : "Activate"}
                        </Button>
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
                            <DropdownMenuItem
                              onClick={() => setEditingLimit(limit.id)}
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              Edit Limits
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>

                    {editingLimit === limit.id ? (
                      <EditLimitForm
                        limit={limit}
                        onSave={(updatedData) =>
                          handleUpdateLimit(limit.id, updatedData)
                        }
                        onCancel={() => setEditingLimit(null)}
                      />
                    ) : (
                      <div className="grid gap-4 md:grid-cols-3">
                        <div className="rounded-lg border border-blue-700 bg-blue-800/30 p-3">
                          <div className="text-sm text-blue-200">
                            Daily Limit
                          </div>
                          <div className="text-lg font-semibold">
                            RWF {limit.dailyLimit.toLocaleString()}
                          </div>
                        </div>
                        <div className="rounded-lg border border-blue-700 bg-blue-800/30 p-3">
                          <div className="text-sm text-blue-200">
                            Monthly Limit
                          </div>
                          <div className="text-lg font-semibold">
                            RWF {limit.monthlyLimit.toLocaleString()}
                          </div>
                        </div>
                        <div className="rounded-lg border border-blue-700 bg-blue-800/30 p-3">
                          <div className="text-sm text-blue-200">
                            Per Transaction Limit
                          </div>
                          <div className="text-lg font-semibold">
                            RWF {limit.perTransactionLimit.toLocaleString()}
                          </div>
                        </div>
                      </div>
                    )}
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

function EditLimitForm({
  limit,
  onSave,
  onCancel,
}: {
  limit: TransactionLimit;
  onSave: (data: Partial<TransactionLimit>) => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState({
    dailyLimit: limit.dailyLimit.toString(),
    monthlyLimit: limit.monthlyLimit.toString(),
    perTransactionLimit: limit.perTransactionLimit.toString(),
  });

  const handleSave = () => {
    onSave({
      dailyLimit: Number.parseInt(formData.dailyLimit),
      monthlyLimit: Number.parseInt(formData.monthlyLimit),
      perTransactionLimit: Number.parseInt(formData.perTransactionLimit),
    });
  };

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <div className="space-y-2">
        <Label htmlFor="dailyLimit" className="text-blue-200">
          Daily Limit (RWF)
        </Label>
        <Input
          id="dailyLimit"
          type="number"
          value={formData.dailyLimit}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, dailyLimit: e.target.value }))
          }
          className="border-blue-700 bg-blue-900/50 text-white"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="monthlyLimit" className="text-blue-200">
          Monthly Limit (RWF)
        </Label>
        <Input
          id="monthlyLimit"
          type="number"
          value={formData.monthlyLimit}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, monthlyLimit: e.target.value }))
          }
          className="border-blue-700 bg-blue-900/50 text-white"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="perTransactionLimit" className="text-blue-200">
          Per Transaction Limit (RWF)
        </Label>
        <Input
          id="perTransactionLimit"
          type="number"
          value={formData.perTransactionLimit}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              perTransactionLimit: e.target.value,
            }))
          }
          className="border-blue-700 bg-blue-900/50 text-white"
        />
      </div>
      <div className="md:col-span-3 flex gap-2 justify-end mt-4">
        <Button
          variant="outline"
          onClick={onCancel}
          className="border-blue-400 text-white hover:bg-blue-800"
        >
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          className="bg-yellow-500 text-blue-900 hover:bg-yellow-400"
        >
          <Save className="mr-2 h-4 w-4" />
          Save Changes
        </Button>
      </div>
    </div>
  );
}
