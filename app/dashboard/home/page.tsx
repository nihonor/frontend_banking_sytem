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
    { id: "rwf", name: "RWF **********", icon: FileText, action: "View" },
    { id: "statement", name: "Get statement", icon: FileText, action: "View" },
    { id: "bk-to-momo", name: "BK to Momo", icon: Send, action: "Send" },
    { id: "bk-to-bk", name: "BK to BK", icon: Send, action: "Send" },
    {
      id: "bk-to-mobile",
      name: "BK to Mobile money",
      icon: Send,
      action: "Send",
    },
  ];

  const beneficiaries = [
    { id: "1", name: "Teta Vanessa", paymentRefs: 5, avatar: "TV" },
    { id: "2", name: "Yvonne", paymentRefs: 3, avatar: "YV" },
    { id: "3", name: "Berg", paymentRefs: 2, avatar: "BG" },
    { id: "4", name: "Simon", paymentRefs: 3, avatar: "SM" },
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
              <CardTitle className="text-lg">{currentAccount.name}</CardTitle>
              <ChevronDown className="h-5 w-5" />
            </div>
            <CardDescription className="text-blue-200">
              {selectedAccount?.accountNumber}
            </CardDescription>
          </CardHeader>
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
              <div key={link.id} className="flex items-center justify-between">
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

        {/* Favorite Beneficiaries */}
        <Card className="bg-blue-800/50 text-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg">FAVORITE BENEFICIARIES</CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-blue-300"
            >
              <Plus className="h-5 w-5" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {beneficiaries.map((beneficiary) => (
              <div
                key={beneficiary.id}
                className="flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8 bg-green-500/20 text-green-400">
                    <AvatarFallback>{beneficiary.avatar}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div>{beneficiary.name}</div>
                    <div className="text-xs text-blue-300">
                      {beneficiary.paymentRefs} payment references
                    </div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 gap-1 text-blue-300 hover:text-white"
                >
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recent Transactions */}
        <Card className="bg-blue-800/50 text-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg">RECENT TRANSACTION</CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-blue-300"
            >
              <ExternalLink className="h-5 w-5" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {transactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-500/20 text-red-400">
                    <CreditCard className="h-4 w-4" />
                  </div>
                  <div>
                    <div>{transaction.type}</div>
                    <div className="text-xs text-blue-300">
                      {new Date(transaction.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium">
                    RWF {transaction.amount.toLocaleString()}
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
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
