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
  ArrowUpRight,
  ArrowDownLeft,
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function AdminTransactionsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  useEffect(() => {
    fetchTransactionData();
  }, []);

  const fetchTransactionData = async () => {
    try {
      setIsLoading(true);
      // Get all transactions using the admin endpoint
      const [allTransactions, allUsers] = await Promise.all([
        apiClient.getAllTransactions(),
        apiClient.getAllUsers(),
      ]);

      setTransactions(allTransactions || []);
      setUsers(allUsers || []);
    } catch (error) {
      console.error("Error fetching transaction data:", error);
      toast.error("Failed to load transaction data. Please try again.");
      // Initialize with empty arrays if fetch fails
      setTransactions([]);
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  };

  const getTransactionIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "deposit":
        return <ArrowDownLeft className="h-5 w-5 text-green-400" />;
      case "withdrawal":
        return <ArrowUpRight className="h-5 w-5 text-red-400" />;
      case "transfer":
        return <ArrowUpRight className="h-5 w-5 text-blue-400" />;
      default:
        return <ArrowUpRight className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return (
          <Badge className="bg-green-500/20 text-green-400">Completed</Badge>
        );
      case "pending":
        return (
          <Badge className="bg-yellow-500/20 text-yellow-400">Pending</Badge>
        );
      case "failed":
        return <Badge className="bg-red-500/20 text-red-400">Failed</Badge>;
      default:
        return (
          <Badge className="bg-green-500/20 text-green-400">Completed</Badge>
        );
    }
  };

  const getAmountColor = (type: string) => {
    switch (type.toLowerCase()) {
      case "deposit":
        return "text-green-400";
      case "withdrawal":
        return "text-red-400";
      case "transfer":
        return "text-blue-400";
      default:
        return "text-white";
    }
  };

  // Safe calculation of totals with null checks
  const totalTransactionValue = transactions.reduce(
    (sum, transaction) => sum + (transaction?.amount || 0),
    0
  );

  const transactionsByType = transactions.reduce((acc, transaction) => {
    if (transaction && transaction.transactionType) {
      const type = transaction.transactionType.toLowerCase();
      acc[type] = (acc[type] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  const filteredTransactions = transactions.filter((transaction) => {
    if (!transaction) return false;

    const matchesSearch =
      (transaction.fromAccountNumber?.toLowerCase() || "").includes(
        searchTerm.toLowerCase()
      ) ||
      (transaction.toAccountNumber?.toLowerCase() || "").includes(
        searchTerm.toLowerCase()
      ) ||
      (transaction.description?.toLowerCase() || "").includes(
        searchTerm.toLowerCase()
      );

    const matchesType =
      typeFilter === "all" ||
      (transaction.transactionType?.toLowerCase() || "") ===
        typeFilter.toLowerCase();

    const matchesStatus =
      statusFilter === "all" ||
      (transaction.status?.toLowerCase() || "completed") ===
        statusFilter.toLowerCase();

    return matchesSearch && matchesType && matchesStatus;
  });

  const handleViewDetails = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setIsViewModalOpen(true);
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const formatAmount = (amount: number) => {
    return `RWF ${amount.toLocaleString()}`;
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#0a3977] text-white">
      <main className="flex-1 p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-semibold">Transaction Management</h2>
          <p className="text-blue-200">
            Monitor and manage all system transactions
          </p>
        </div>

        {/* Summary Cards */}
        <div className="mb-6 grid gap-4 md:grid-cols-4">
          <Card className="bg-blue-800/50 text-white">
            <CardContent className="p-4">
              <div className="text-sm text-blue-200">Total Transactions</div>
              <div className="text-2xl font-bold">{transactions.length}</div>
            </CardContent>
          </Card>
          <Card className="bg-blue-800/50 text-white">
            <CardContent className="p-4">
              <div className="text-sm text-blue-200">Total Value</div>
              <div className="text-2xl font-bold">
                RWF {totalTransactionValue.toLocaleString()}
              </div>
            </CardContent>
          </Card>
          <Card className="bg-blue-800/50 text-white">
            <CardContent className="p-4">
              <div className="text-sm text-blue-200">Deposits</div>
              <div className="text-2xl font-bold">
                {transactionsByType.deposit || 0}
              </div>
            </CardContent>
          </Card>
          <Card className="bg-blue-800/50 text-white">
            <CardContent className="p-4">
              <div className="text-sm text-blue-200">Transfers</div>
              <div className="text-2xl font-bold">
                {transactionsByType.transfer || 0}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-blue-800/50 text-white">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>All Transactions</CardTitle>
                <CardDescription className="text-blue-200">
                  Total: {transactions.length} transactions
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
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="mb-6 flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-blue-300" />
                <Input
                  placeholder="Search by account number or description..."
                  className="border-blue-700 bg-blue-900/50 pl-10 text-white placeholder:text-blue-300"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[150px] border-blue-700 bg-blue-900/50 text-white">
                  <SelectValue placeholder="Transaction Type" />
                </SelectTrigger>
                <SelectContent className="bg-blue-900 text-white">
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="deposit">Deposit</SelectItem>
                  <SelectItem value="withdrawal">Withdrawal</SelectItem>
                  <SelectItem value="transfer">Transfer</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px] border-blue-700 bg-blue-900/50 text-white">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent className="bg-blue-900 text-white">
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
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
                <div className="text-blue-200">Loading transactions...</div>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredTransactions.slice(0, 50).map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between rounded-lg border border-blue-700 bg-blue-900/30 p-4"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-700/50">
                        {getTransactionIcon(
                          transaction.transactionType || "unknown"
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold capitalize">
                            {transaction.transactionType}
                          </h3>
                          {getStatusBadge(transaction.status || "completed")}
                        </div>
                        <div className="text-sm text-blue-200">
                          {transaction.fromAccountNumber &&
                            `From: ${transaction.fromAccountNumber}`}
                          {transaction.toAccountNumber &&
                            ` To: ${transaction.toAccountNumber}`}
                        </div>
                        <div className="text-xs text-blue-300">
                          {new Date(transaction.timestamp).toLocaleString()}
                        </div>
                        {transaction.description && (
                          <div className="text-xs text-blue-300 mt-1">
                            {transaction.description}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div
                          className={`font-semibold text-lg ${getAmountColor(
                            transaction.transactionType || "unknown"
                          )}`}
                        >
                          RWF {transaction.amount?.toLocaleString() || "N/A"}
                        </div>
                        <div className="text-sm text-blue-200">
                          {new Date(transaction.timestamp).toLocaleDateString()}
                        </div>
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
                          <DropdownMenuItem
                            onClick={() => handleViewDetails(transaction)}
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
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

      {/* View Transaction Details Modal */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="bg-blue-900 text-white">
          <DialogHeader>
            <DialogTitle>Transaction Details</DialogTitle>
            <DialogDescription className="text-blue-200">
              Detailed information about the transaction
            </DialogDescription>
          </DialogHeader>
          {selectedTransaction && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm text-blue-200">Transaction ID</h4>
                  <p>{selectedTransaction.id}</p>
                </div>
                <div>
                  <h4 className="text-sm text-blue-200">Type</h4>
                  <div className="flex items-center gap-2">
                    {getTransactionIcon(
                      selectedTransaction.transactionType || "unknown"
                    )}
                    <span className="capitalize">
                      {selectedTransaction.transactionType}
                    </span>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm text-blue-200">Status</h4>
                  <div>
                    {getStatusBadge(selectedTransaction.status || "completed")}
                  </div>
                </div>
                <div>
                  <h4 className="text-sm text-blue-200">Amount</h4>
                  <p
                    className={getAmountColor(
                      selectedTransaction.transactionType || "unknown"
                    )}
                  >
                    {formatAmount(selectedTransaction.amount)}
                  </p>
                </div>
                {selectedTransaction.fromAccountNumber && (
                  <div>
                    <h4 className="text-sm text-blue-200">From Account</h4>
                    <p>{selectedTransaction.fromAccountNumber}</p>
                  </div>
                )}
                {selectedTransaction.toAccountNumber && (
                  <div>
                    <h4 className="text-sm text-blue-200">To Account</h4>
                    <p>{selectedTransaction.toAccountNumber}</p>
                  </div>
                )}
                <div className="col-span-2">
                  <h4 className="text-sm text-blue-200">Timestamp</h4>
                  <p>{formatTimestamp(selectedTransaction.timestamp)}</p>
                </div>
                {selectedTransaction.description && (
                  <div className="col-span-2">
                    <h4 className="text-sm text-blue-200">Description</h4>
                    <p className="text-sm">{selectedTransaction.description}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
