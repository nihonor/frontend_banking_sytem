"use client";

import { useState, useEffect } from "react";
import { Bell, ChevronDown, Search, Send, User, Users } from "lucide-react";
import { apiClient, type Account, type Transaction } from "@/lib/api";
import { toast } from "react-hot-toast";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function TransferPage() {
  // Transfer state
  const [transferAmount, setTransferAmount] = useState("");
  const [fromAccount, setFromAccount] = useState("");
  const [toAccount, setToAccount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userAccounts, setUserAccounts] = useState<Account[]>([]);
  const [transferType, setTransferType] = useState<"beneficiary" | "new">(
    "beneficiary"
  );

  // Deposit state
  const [depositAccount, setDepositAccount] = useState("");
  const [depositAmount, setDepositAmount] = useState("");
  const [isDepositLoading, setIsDepositLoading] = useState(false);
  const [depositError, setDepositError] = useState<string | null>(null);

  // Recent data state
  const [recentRecipients, setRecentRecipients] = useState<
    Array<{ accountNumber: string; name: string; recentAmount: number }>
  >([]);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>(
    []
  );

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("token");
      const userId = localStorage.getItem("userId");
      console.log("Auth State:", {
        hasToken: !!token,
        tokenValue: token?.substring(0, 10) + "...",
        hasUserId: !!userId,
        userId,
      });
    };

    checkAuth();
    const fetchData = async () => {
      try {
        const userId = localStorage.getItem("userId");
        if (!userId) return;

        const userIdNum = parseInt(userId);
        const [accounts, recipients, transactions] = await Promise.all([
          apiClient.getUserAccounts(userIdNum),
          apiClient.getRecentRecipients(userIdNum),
          apiClient.getUserTransactionHistory(userIdNum),
        ]);

        setUserAccounts(accounts);
        setRecentRecipients(recipients);
        setRecentTransactions(transactions.slice(0, 5)); // Get last 5 transactions

        if (accounts.length > 0) {
          setFromAccount(accounts[0].accountNumber);
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to fetch your account data");
      }
    };

    fetchData();
  }, []);

  const handleTransfer = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Check authentication
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("You are not authenticated. Please log in again.");
      }

      // Validate accounts
      if (!fromAccount) {
        throw new Error("Please select your account");
      }

      if (!toAccount) {
        throw new Error("Please enter a recipient account number");
      }

      if (fromAccount === toAccount) {
        throw new Error("Cannot transfer to the same account");
      }

      // Validate amount
      if (!transferAmount || isNaN(parseFloat(transferAmount))) {
        throw new Error("Please enter a valid amount");
      }

      const amount = parseFloat(transferAmount);
      if (amount <= 0) {
        throw new Error("Amount must be greater than 0");
      }

      // Check balance
      const selectedAccount = userAccounts.find(
        (acc) => acc.accountNumber === fromAccount
      );
      if (!selectedAccount) {
        throw new Error("Source account not found");
      }

      if (selectedAccount.balance < amount) {
        throw new Error(
          `Insufficient balance. Available: RWF ${selectedAccount.balance.toLocaleString()}`
        );
      }

      // Perform transfer
      await apiClient.transfer(fromAccount, toAccount, amount);

      // Show success message
      toast.success("Transfer completed successfully");

      // Reset form
      setTransferAmount("");
      setToAccount("");

      // Refresh account data
      const userId = localStorage.getItem("userId");
      if (userId) {
        const [accounts, recipients, transactions] = await Promise.all([
          apiClient.getUserAccounts(parseInt(userId)),
          apiClient.getRecentRecipients(parseInt(userId)),
          apiClient.getUserTransactionHistory(parseInt(userId)),
        ]);

        setUserAccounts(accounts);
        setRecentRecipients(recipients);
        setRecentTransactions(transactions.slice(0, 5));
      }
    } catch (err: any) {
      console.error("Transfer failed:", err);
      const errorMessage = err.message?.includes("403")
        ? "You don't have permission to perform this transfer. Please check your account status."
        : err.message || "Transfer failed. Please try again.";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeposit = async () => {
    try {
      setIsDepositLoading(true);
      setDepositError(null);

      // Check authentication
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("You are not authenticated. Please log in again.");
      }

      if (!depositAccount) {
        throw new Error("Please select an account");
      }

      if (!depositAmount || isNaN(parseFloat(depositAmount))) {
        throw new Error("Please enter a valid amount");
      }

      const amount = parseFloat(depositAmount);
      if (amount <= 0) {
        throw new Error("Amount must be greater than 0");
      }

      await apiClient.deposit(depositAccount, amount);

      toast.success("Deposit completed successfully");
      setDepositAmount("");

      // Refresh account data
      const userId = localStorage.getItem("userId");
      if (userId) {
        const [accounts, transactions] = await Promise.all([
          apiClient.getUserAccounts(parseInt(userId)),
          apiClient.getUserTransactionHistory(parseInt(userId)),
        ]);

        setUserAccounts(accounts);
        setRecentTransactions(transactions.slice(0, 5));
      }
    } catch (err: any) {
      console.error("Deposit failed:", err);
      const errorMessage = err.message?.includes("403")
        ? "You don't have permission to make deposits. Please check your account status."
        : err.message || "Deposit failed. Please try again.";
      setDepositError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsDepositLoading(false);
    }
  };

  // Replace the static beneficiaries array with recentRecipients data
  const refreshData = async () => {
    try {
      const userId = localStorage.getItem("userId");
      if (!userId) return;

      const userIdNum = parseInt(userId);
      const [accounts, transactions] = await Promise.all([
        apiClient.getUserAccounts(userIdNum),
        apiClient.getUserTransactionHistory(userIdNum),
      ]);

      setUserAccounts(accounts);
      setRecentTransactions(transactions.slice(0, 5));
    } catch (err) {
      console.error("Error refreshing data:", err);
    }
  };

  return (
    <main className="flex-1 p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold">Transfer Money</h2>
        <p className="text-blue-200">
          Send money to accounts and mobile wallets
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2">
          <Tabs defaultValue="bk" className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-blue-900/50">
              <TabsTrigger
                value="bk"
                className="data-[state=active]:bg-blue-800"
              >
                BK to BK
              </TabsTrigger>
              <TabsTrigger
                value="deposit"
                className="data-[state=active]:bg-blue-800"
              >
                Deposit
              </TabsTrigger>
              <TabsTrigger
                value="other"
                className="data-[state=active]:bg-blue-800"
              >
                Other Banks
              </TabsTrigger>
            </TabsList>

            <TabsContent value="bk">
              <Card className="bg-blue-800/50 text-white">
                <CardHeader>
                  <CardTitle>Transfer to BK Account</CardTitle>
                  <CardDescription className="text-blue-200">
                    Send money to another Bank of Kigali account
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="from-account">From Account</Label>
                    <Select value={fromAccount} onValueChange={setFromAccount}>
                      <SelectTrigger className="border-blue-700 bg-blue-900/50 text-white">
                        <SelectValue placeholder="Select account" />
                      </SelectTrigger>
                      <SelectContent className="bg-blue-900 text-white">
                        {userAccounts.map((account) => (
                          <SelectItem
                            key={account.id}
                            value={account.accountNumber}
                          >
                            {account.accountType} - {account.accountNumber} (RWF{" "}
                            {account.balance.toLocaleString()})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="to-account">To Account</Label>
                    <RadioGroup
                      value={transferType}
                      onValueChange={(value) =>
                        setTransferType(value as "beneficiary" | "new")
                      }
                      className="space-y-3"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem
                          value="beneficiary"
                          id="beneficiary"
                          className="border-blue-400"
                        />
                        <Label htmlFor="beneficiary" className="font-normal">
                          Select from beneficiaries
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem
                          value="new"
                          id="new"
                          className="border-blue-400"
                        />
                        <Label htmlFor="new" className="font-normal">
                          New recipient
                        </Label>
                      </div>
                    </RadioGroup>

                    {transferType === "new" && (
                      <div className="space-y-2">
                        <Label htmlFor="new-account">Account Number</Label>
                        <Input
                          id="new-account"
                          value={toAccount}
                          onChange={(e) => setToAccount(e.target.value)}
                          className="border-blue-700 bg-blue-900/50 text-white placeholder:text-blue-300"
                          placeholder="Enter account number"
                        />
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Select Beneficiary</Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-blue-300" />
                      <Input
                        placeholder="Search beneficiaries"
                        className="border-blue-700 bg-blue-900/50 pl-10 text-white placeholder:text-blue-300"
                      />
                    </div>

                    <div className="mt-3 space-y-2">
                      <RadioGroup
                        value={toAccount}
                        onValueChange={setToAccount}
                      >
                        {recentRecipients.map((recipient) => (
                          <div
                            key={recipient.accountNumber}
                            className="flex cursor-pointer items-center justify-between rounded-lg border border-blue-700 bg-blue-900/30 p-3 hover:bg-blue-800/50"
                            onClick={() =>
                              setToAccount(recipient.accountNumber)
                            }
                          >
                            <div className="flex items-center gap-3">
                              <Avatar className="h-10 w-10 bg-green-500/20 text-green-400">
                                <AvatarFallback>
                                  {recipient.name.substring(0, 2).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium">
                                  {recipient.name}
                                </div>
                                <div className="text-xs text-blue-200">
                                  {recipient.accountNumber}
                                </div>
                              </div>
                            </div>
                            <RadioGroupItem
                              value={recipient.accountNumber}
                              className="border-blue-400"
                            />
                          </div>
                        ))}
                      </RadioGroup>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="amount">Amount (RWF)</Label>
                    <Input
                      id="amount"
                      type="text"
                      value={transferAmount}
                      onChange={(e) => setTransferAmount(e.target.value)}
                      className="border-blue-700 bg-blue-900/50 text-white placeholder:text-blue-300"
                      placeholder="Enter amount"
                    />
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-3 border-t border-blue-700 pt-4">
                  {error && (
                    <div className="w-full rounded-lg bg-red-500/10 p-3 text-center text-sm text-red-500">
                      {error}
                    </div>
                  )}
                  <div className="flex w-full justify-end gap-3">
                    <Button
                      variant="outline"
                      className="border-blue-400 text-black hover:bg-blue-800 "
                      onClick={() => {
                        setTransferAmount("");
                        setToAccount("");
                        setError(null);
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      className="bg-yellow-500 text-blue-900 hover:bg-yellow-400"
                      onClick={handleTransfer}
                      disabled={
                        isLoading ||
                        !fromAccount ||
                        (!toAccount && transferType === "new")
                      }
                    >
                      {isLoading ? (
                        <>
                          <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-blue-900 border-t-transparent"></div>
                          Processing...
                        </>
                      ) : (
                        <>
                          <Send className="mr-2 h-4 w-4" />
                          Send Money
                        </>
                      )}
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            </TabsContent>

            <TabsContent value="deposit">
              <Card className="bg-blue-800/50 text-white">
                <CardHeader>
                  <CardTitle>Deposit Money</CardTitle>
                  <CardDescription className="text-blue-200">
                    Deposit money into your account
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="deposit-account">Select Account</Label>
                    <Select
                      value={depositAccount}
                      onValueChange={setDepositAccount}
                    >
                      <SelectTrigger className="border-blue-700 bg-blue-900/50 text-white">
                        <SelectValue placeholder="Select account" />
                      </SelectTrigger>
                      <SelectContent className="bg-blue-900 text-white">
                        {userAccounts.map((account) => (
                          <SelectItem
                            key={account.id}
                            value={account.accountNumber}
                          >
                            {account.accountType} - {account.accountNumber} (RWF{" "}
                            {account.balance.toLocaleString()})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="deposit-amount">Amount (RWF)</Label>
                    <Input
                      id="deposit-amount"
                      type="text"
                      value={depositAmount}
                      onChange={(e) => setDepositAmount(e.target.value)}
                      className="border-blue-700 bg-blue-900/50 text-white placeholder:text-blue-300"
                      placeholder="Enter amount to deposit"
                    />
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-3 border-t border-blue-700 pt-4">
                  {depositError && (
                    <div className="w-full rounded-lg bg-red-500/10 p-3 text-center text-sm text-red-500">
                      {depositError}
                    </div>
                  )}
                  <div className="flex w-full justify-end gap-3">
                    <Button
                      variant="outline"
                      className="border-blue-400 text-white hover:bg-blue-800"
                      onClick={() => {
                        setDepositAmount("");
                        setDepositError(null);
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      className="bg-yellow-500 text-blue-900 hover:bg-yellow-400"
                      onClick={handleDeposit}
                      disabled={
                        isDepositLoading || !depositAccount || !depositAmount
                      }
                    >
                      {isDepositLoading ? (
                        <>
                          <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-blue-900 border-t-transparent"></div>
                          Processing...
                        </>
                      ) : (
                        <>
                          <Send className="mr-2 h-4 w-4" />
                          Deposit Money
                        </>
                      )}
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            </TabsContent>

            <TabsContent value="other">
              <Card className="bg-blue-800/50 text-white">
                <CardHeader>
                  <CardTitle>Transfer to Other Banks</CardTitle>
                  <CardDescription className="text-blue-200">
                    Send money to accounts at other banks
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex h-40 items-center justify-center">
                    <p className="text-blue-200">
                      Other banks transfer form would go here
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <div>
          <Card className="bg-blue-800/50 text-white">
            <CardHeader>
              <CardTitle>Recent Transfers</CardTitle>
              <CardDescription className="text-blue-200">
                Your last 5 transfers
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentTransactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between rounded-lg bg-blue-900/30 p-3"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8 bg-blue-500/20 text-blue-400">
                      <AvatarFallback>
                        {transaction.transactionType === "TRANSFER"
                          ? "TR"
                          : transaction.transactionType === "DEPOSIT"
                          ? "DP"
                          : "WD"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">
                        {transaction.transactionType === "TRANSFER"
                          ? `Transfer to ${transaction.toAccountNumber}`
                          : transaction.transactionType}
                      </div>
                      <div className="text-xs text-blue-200">
                        {new Date(transaction.timestamp).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div
                      className={`font-medium ${
                        transaction.fromAccountNumber === fromAccount
                          ? "text-red-400"
                          : "text-green-400"
                      }`}
                    >
                      {transaction.fromAccountNumber === fromAccount
                        ? "- "
                        : "+ "}
                      RWF {transaction.amount.toLocaleString()}
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
            <CardFooter className="border-t border-blue-700 pt-4">
              <Button
                variant="ghost"
                className="w-full text-blue-200 hover:text-white"
              >
                View All Transfers
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </main>
  );
}
