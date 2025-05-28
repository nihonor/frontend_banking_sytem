"use client";

import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  CreditCard,
  ExternalLink,
  ArrowRight,
  Plus,
  ChevronDown,
  FileText,
  Send,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface Account {
  id: number;
  accountNumber: string;
  balance: number;
  accountType: string;
}

export interface Transaction {
  id: number;
  accountNumber: string;
  amount: number;
  timestamp: string;
  description?: string;
  fromAccountId?: number;
  toAccountId?: number;
  type: "DEPOSIT" | "WITHDRAW" | "TRANSFER";
}

export interface User {
  id: number;
  username: string;
  email: string;
}

const page = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showCreateAccount, setShowCreateAccount] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "withdraw" | "deposit" | "transfer"
  >("withdraw");
  const [currentAccount, setCurrentAccount] = useState({
    name: "Current account",
    number: "0842 0842 **** 0842",
  });
  const [userId, setUserId] = useState<number>();
  const [user, setUser] = useState<User | null>(null);
  const [amount, setAmount] = useState("");
  const [recipientId, setRecipientId] = useState("");
  const router = useRouter();

  const [newAccountType, setNewAccountType] = useState("SAVINGS");

  useEffect(() => {
    const storedUserId = localStorage.getItem("userId");

    if (!storedUserId) {
      router.push("/");
      return;
    }

    const parsedUserId = Number(storedUserId);
    setUserId(parsedUserId);
  }, []);

  useEffect(() => {
    if (userId) {
      fetchAccounts();
      currentUser();
    }
  }, [userId]);

  useEffect(() => {
    if (userId) {
      console.log("Fetching transactions for user:", userId);
      fetchTransactions(userId);
    }
  }, [userId]);

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
        if (data.length > 0 && !selectedAccount) {
          setSelectedAccount(data[0]);
        }
      } else if (response.status === 403) {
        router.push("/");
      }
    } catch (err) {
      setError("Failed to fetch accounts");
    }
  };

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

  const createNewAccount = async () => {
    if (!userId) {
      console.log("No userId found");
      setError("User ID not found. Please log in again.");
      return;
    }

    console.log("Creating new account:", {
      userId,
      accountType: newAccountType,
    });

    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.log("No token found");
        setError("Authentication token not found. Please log in again.");
        return;
      }

      console.log("Making API request to create account");
      const response = await fetch(
        `http://localhost:8080/api/users/${userId}/accounts?accountType=${newAccountType}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );

      console.log("API response status:", response.status);

      if (response.ok) {
        const newAccount = await response.json();
        console.log("New account created:", newAccount);
        setAccounts([...accounts, newAccount]);
        setShowCreateAccount(false);
        setNewAccountType("SAVINGS");
        // Refresh accounts list
        await fetchAccounts();
      } else {
        let errorMessage = "Failed to create account";
        try {
          const errorData = await response.json();
          console.log("Error data:", errorData);
          errorMessage = errorData.message || errorMessage;
        } catch (e) {
          console.error("Error parsing error response:", e);
        }
        setError(errorMessage);
      }
    } catch (err) {
      console.error("Network error:", err);
      setError("Network error. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  const handleOperation = async (
    operation: "withdraw" | "deposit" | "transfer"
  ) => {
    if (!selectedAccount) {
      setError("Please select an account");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const amountNum = parseFloat(amount);
      if (isNaN(amountNum) || amountNum <= 0) {
        setError("Please enter a valid amount");
        return;
      }

      let response;
      switch (operation) {
        case "withdraw":
          response = await fetch(
            `http://localhost:8080/api/transactions/withdraw/${selectedAccount.accountNumber}?amount=${amountNum}`,
            {
              method: "PUT",
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
                "Content-Type": "application/json",
              },
              credentials: "include",
            }
          );
          break;

        case "deposit":
          response = await fetch(
            `http://localhost:8080/api/transactions/deposit/${selectedAccount.accountNumber}?amount=${amountNum}`,
            {
              method: "PUT",
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
                "Content-Type": "application/json",
              },
              credentials: "include",
            }
          );
          break;

        case "transfer":
          if (!recipientId) {
            setError("Please enter a recipient account number");
            return;
          }
          response = await fetch(
            `http://localhost:8080/api/transactions/transfer?fromAccountNumber=${selectedAccount.accountNumber}&toAccountNumber=${recipientId}&amount=${amountNum}`,
            {
              method: "PUT",
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
                "Content-Type": "application/json",
              },
              credentials: "include",
            }
          );
          break;

        default:
          throw new Error("Invalid operation");
      }

      if (response.ok) {
        setAmount("");
        setRecipientId("");
        // Refresh account data after successful transaction
        await fetchAccounts();
        // Fetch updated transactions
        const userId = localStorage.getItem("userId");
        if (userId) {
          await fetchTransactions(Number(userId));
        }
      } else {
        const errorData = await response
          .json()
          .catch(() => ({ message: "Operation failed" }));
        setError(errorData.message || "Operation failed");
      }
    } catch (err) {
      console.error("Transaction error:", err);
      setError("An error occurred during the operation");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userRole");
    router.push("/");
  };

  const quickLinks = [
    {
      id: "transfer",
      name: "Make Transfer",
      icon: Send,
      action: "Transfer",
      href: "/dashboard/transfer",
    },
    {
      id: "statement",
      name: "Download Statement",
      icon: FileText,
      action: "Download",
      href: "#",
    },
    {
      id: "new-account",
      name: "Open New Account",
      icon: Plus,
      action: "Create",
      onClick: () => setShowCreateAccount(true),
    },
  ];

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
        setTransactions(data);
        console.log(data);
      } else {
        console.error("Failed to fetch transactions");
      }
    } catch (err) {
      console.error("Error fetching transactions:", err);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-3xl font-semibold">
          Welcome back, {user?.username}
        </h2>
      </div>

      <div className="mb-8">
        <Card className="bg-blue-800/50 text-white">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Current Balance</CardTitle>
              <ChevronDown className="h-5 w-5" />
            </div>
            <CardDescription className="text-blue-200">
              {selectedAccount?.accountNumber}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              RWF {selectedAccount?.balance.toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Quick Links */}
        <Card className="bg-blue-800/50 text-white">
          <CardHeader>
            <CardTitle className="text-lg">QUICK LINKS</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {quickLinks.map((link) => (
              <div
                key={link.id}
                className="flex items-center justify-between cursor-pointer hover:bg-blue-700/50 rounded-lg p-2 transition-colors"
                onClick={link.onClick || (() => router.push(link.href))}
              >
                <div className="flex items-center gap-3">
                  <link.icon className="h-5 w-5 text-blue-300" />
                  <span>{link.name}</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 gap-1 text-blue-300 hover:text-white"
                >
                  {link.action}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Account Summary */}
        <Card className="bg-blue-800/50 text-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg">ACCOUNT SUMMARY</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {accounts.map((account) => (
              <div
                key={account.id}
                className="flex items-center justify-between p-3 rounded-lg bg-blue-900/30 hover:bg-blue-700/50 cursor-pointer"
                onClick={() => setSelectedAccount(account)}
              >
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8 bg-green-500/20 text-green-400">
                    <AvatarFallback>
                      {account.accountType.substring(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">{account.accountType}</div>
                    <div className="text-xs text-blue-300">
                      {account.accountNumber}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium">
                    RWF {account.balance.toLocaleString()}
                  </div>
                </div>
              </div>
            ))}
            {/* <Button
              variant="outline"
              className="w-full border-blue-400 text-blue-300 hover:bg-blue-700/50 hover:text-white"
              onClick={() => setShowCreateAccount(true)}
            >
              <Plus className="mr-2 h-4 w-4" />
              Open New Account
            </Button> */}
          </CardContent>
        </Card>

        {/* Recent Transactions */}
        <Card className="bg-blue-800/50 text-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg">RECENT TRANSACTIONS</CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-blue-300"
              onClick={() => router.push("/dashboard/transactions")}
            >
              <ExternalLink className="h-5 w-5" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {transactions.slice(0, 5).map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-full ${
                      transaction.type === "DEPOSIT"
                        ? "bg-green-500/20 text-green-400"
                        : transaction.type === "WITHDRAW"
                        ? "bg-red-500/20 text-red-400"
                        : "bg-blue-500/20 text-blue-400"
                    }`}
                  >
                    <CreditCard className="h-4 w-4" />
                  </div>
                  <div>
                    <div>{transaction.type}</div>
                    <div className="text-xs text-blue-300">
                      {new Date(transaction.timestamp).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div
                    className={`font-medium ${
                      transaction.type === "DEPOSIT"
                        ? "text-green-400"
                        : "text-red-400"
                    }`}
                  >
                    {transaction.type === "DEPOSIT" ? "+" : "-"} RWF{" "}
                    {transaction.amount.toLocaleString()}
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
          <CardFooter>
            {/* <Button
              variant="ghost"
              className="w-full text-blue-300 hover:text-white"
              onClick={() => router.push("/dashboard/transactions")}
            >
              View All Transactions
            </Button> */}
          </CardFooter>
        </Card>
      </div>

      {/* Mortgage Banner */}
      <div className="mt-8">
        <Card className="bg-gradient-to-r from-blue-800/80 to-blue-700/50 text-white">
          <CardContent className="flex items-center justify-between p-6">
            <div>
              <h3 className="mb-2 text-xl font-semibold">MORTGAGE READY</h3>
              <p className="mb-4 text-blue-200">Blossom into homeownership</p>
              <Button className="bg-yellow-500 text-blue-900 hover:bg-yellow-400">
                Learn More
              </Button>
            </div>
            <div className="hidden md:block">
              <img
                src="/placeholder.svg?height=120&width=120"
                alt="Mortgage illustration"
                className="h-30 w-30 rounded-full"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default page;
