"use client";

import { useState, useEffect } from "react";
import {
  Download,
  Filter,
  Search,
  ChevronDown,
  ChevronUp,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { apiClient, type Transaction } from "@/lib/api";

export default function StatementPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("7d");
  const [sortConfig, setSortConfig] = useState({
    key: "timestamp",
    direction: "desc",
  });
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchTransactions();
  }, [timeRange]);

  const fetchTransactions = async () => {
    try {
      const data = await apiClient.getTransactions(timeRange);
      setTransactions(data);
    } catch (error) {
      console.error("Error fetching transactions:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (key: keyof Transaction) => {
    setSortConfig({
      key,
      direction:
        sortConfig.key === key && sortConfig.direction === "asc"
          ? "desc"
          : "asc",
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "RWF",
    }).format(amount);
  };

  const filteredTransactions = transactions
    .filter((transaction) => {
      if (!searchTerm) return true;
      return (
        transaction.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.reference
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        transaction.description
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase())
      );
    })
    .sort((a, b) => {
      const aValue = a[sortConfig.key as keyof Transaction];
      const bValue = b[sortConfig.key as keyof Transaction];
      if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });

  const downloadStatement = async () => {
    try {
      const blob = await apiClient.downloadStatement(timeRange);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `statement-${timeRange}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Error downloading statement:", error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Account Statement</h1>
        <Button
          onClick={downloadStatement}
          className="bg-yellow-500 text-blue-900 hover:bg-yellow-400"
        >
          <Download className="mr-2 h-4 w-4" />
          Download Statement
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
          <Input
            placeholder="Search transactions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[180px]">
            <Calendar className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Select time range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="90d">Last 90 days</SelectItem>
            <SelectItem value="1y">Last year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead
                className="cursor-pointer"
                onClick={() => handleSort("timestamp")}
              >
                Date & Time
                {sortConfig.key === "timestamp" && (
                  <span className="ml-2">
                    {sortConfig.direction === "asc" ? (
                      <ChevronUp className="inline h-4 w-4" />
                    ) : (
                      <ChevronDown className="inline h-4 w-4" />
                    )}
                  </span>
                )}
              </TableHead>
              <TableHead
                className="cursor-pointer"
                onClick={() => handleSort("type")}
              >
                Type
                {sortConfig.key === "type" && (
                  <span className="ml-2">
                    {sortConfig.direction === "asc" ? (
                      <ChevronUp className="inline h-4 w-4" />
                    ) : (
                      <ChevronDown className="inline h-4 w-4" />
                    )}
                  </span>
                )}
              </TableHead>
              <TableHead>Reference</TableHead>
              <TableHead>Description</TableHead>
              <TableHead
                className="cursor-pointer text-right"
                onClick={() => handleSort("amount")}
              >
                Amount
                {sortConfig.key === "amount" && (
                  <span className="ml-2">
                    {sortConfig.direction === "asc" ? (
                      <ChevronUp className="inline h-4 w-4" />
                    ) : (
                      <ChevronDown className="inline h-4 w-4" />
                    )}
                  </span>
                )}
              </TableHead>
              <TableHead className="text-right">Balance</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center">
                  Loading transactions...
                </TableCell>
              </TableRow>
            ) : filteredTransactions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center">
                  No transactions found
                </TableCell>
              </TableRow>
            ) : (
              filteredTransactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell>{formatDate(transaction.timestamp)}</TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                        transaction.type === "CREDIT"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {transaction.type}
                    </span>
                  </TableCell>
                  <TableCell>{transaction.reference || "-"}</TableCell>
                  <TableCell>{transaction.description || "-"}</TableCell>
                  <TableCell
                    className={`text-right ${
                      transaction.type === "CREDIT"
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {formatAmount(transaction.amount)}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatAmount(transaction.balance)}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                        transaction.status === "COMPLETED"
                          ? "bg-green-100 text-green-700"
                          : transaction.status === "PENDING"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {transaction.status}
                    </span>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
