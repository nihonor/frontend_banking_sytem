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
  Edit,
  Ban,
  Plus,
  Check,
} from "lucide-react";
import { toast } from "sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

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
import { apiClient, type Account, type User } from "@/lib/api";

// Form validation schema
const accountFormSchema = z.object({
  accountType: z.enum(["SAVINGS", "CHECKING"]),
  status: z.enum(["ACTIVE", "SUSPENDED", "CLOSED"]),
});

type AccountFormValues = z.infer<typeof accountFormSchema>;

// Add new form schema for creating account
const createAccountSchema = z.object({
  userId: z.number({
    required_error: "Please select a user",
  }),
  accountType: z.enum(["SAVINGS", "CHECKING"], {
    required_error: "Please select an account type",
  }),
  initialBalance: z.number().min(0, "Initial balance must be 0 or greater"),
});

type CreateAccountFormValues = z.infer<typeof createAccountSchema>;

export default function AdminAccountsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isSuspendDialogOpen, setIsSuspendDialogOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const form = useForm<AccountFormValues>({
    resolver: zodResolver(accountFormSchema),
    defaultValues: {
      accountType: "SAVINGS",
      status: "ACTIVE",
    },
  });

  const createAccountForm = useForm<CreateAccountFormValues>({
    resolver: zodResolver(createAccountSchema),
    defaultValues: {
      accountType: "SAVINGS",
      initialBalance: 0,
    },
  });

  useEffect(() => {
    fetchAccountData();
  }, []);

  const fetchAccountData = async () => {
    try {
      setIsLoading(true);
      const [allAccounts, allUsers] = await Promise.all([
        apiClient.getAllAccounts(),
        apiClient.getAllUsers(),
      ]);
      setAccounts(allAccounts);
      setUsers(allUsers);
    } catch (error) {
      console.error("Error fetching account data:", error);
      toast.error("Failed to load account data. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async (accountId: number) => {
    try {
      setIsLoading(true);
      await apiClient.deleteAccount(accountId);
      setAccounts(accounts.filter((account) => account.id !== accountId));
      setIsDeleteDialogOpen(false);
      toast.success("Account has been successfully deleted");
    } catch (error: any) {
      console.error("Error deleting account:", error);
      toast.error(
        error.message || "Failed to delete account. Please try again."
      );
    } finally {
      setIsLoading(false);
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
      case "fixed":
        return (
          <Badge className="bg-orange-500/20 text-orange-400">
            Fixed Deposit
          </Badge>
        );
      default:
        return <Badge className="bg-gray-500/20 text-gray-400">{type}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case "active":
        return <Badge className="bg-green-500/20 text-green-400">Active</Badge>;
      case "suspended":
        return <Badge className="bg-red-500/20 text-red-400">Suspended</Badge>;
      case "closed":
        return <Badge className="bg-gray-500/20 text-gray-400">Closed</Badge>;
      default:
        return <Badge className="bg-green-500/20 text-green-400">Active</Badge>;
    }
  };

  const getUserById = (userId: number) =>
    users.find((user) => user.id === userId);

  const filteredAccounts = accounts.filter((account) => {
    const user = getUserById(account.userId);
    const matchesSearch =
      user?.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      account.accountNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType =
      typeFilter === "all" ||
      account.accountType.toLowerCase() === typeFilter.toLowerCase();
    const matchesStatus =
      statusFilter === "all" ||
      (account.status?.toLowerCase() || "active") ===
        statusFilter.toLowerCase();
    return matchesSearch && matchesType && matchesStatus;
  });

  const totalBalance = accounts.reduce(
    (sum, account) => sum + account.balance,
    0
  );
  const accountsByType = accounts.reduce((acc, account) => {
    const type = account.accountType.toLowerCase();
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const handleViewDetails = (account: Account) => {
    setSelectedAccount(account);
    setIsViewModalOpen(true);
  };

  const handleEditAccount = (account: Account) => {
    setSelectedAccount(account);
    form.reset({
      accountType: account.accountType.toUpperCase() as
        | "SAVINGS"
        | "CURRENT"
        | "BUSINESS"
        | "FIXED",
      status:
        (account.status?.toUpperCase() as "ACTIVE" | "SUSPENDED" | "CLOSED") ||
        "ACTIVE",
    });
    setIsEditModalOpen(true);
  };

  const handleUpdateAccount = async (values: AccountFormValues) => {
    if (!selectedAccount) {
      toast.error("No account selected");
      return;
    }

    try {
      setIsLoading(true);
      const updatedAccount = await apiClient.updateAccount(selectedAccount.id, {
        ...selectedAccount,
        accountType: values.accountType,
        status: values.status,
      });

      setAccounts(
        accounts.map((account) =>
          account.id === selectedAccount.id ? updatedAccount : account
        )
      );

      setIsEditModalOpen(false);
      toast.success("Account updated successfully");
    } catch (error: any) {
      console.error("Error updating account:", error);
      toast.error(
        error.message || "Failed to update account. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuspendAccount = async (accountId: number) => {
    try {
      setIsLoading(true);
      const updatedAccount = await apiClient.suspendAccount(accountId);

      setAccounts(
        accounts.map((account) =>
          account.id === accountId ? updatedAccount : account
        )
      );

      setIsSuspendDialogOpen(false);
      toast.success("Account has been suspended");
    } catch (error: any) {
      console.error("Error suspending account:", error);
      toast.error(
        error.message || "Failed to suspend account. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleActivateAccount = async (accountId: number) => {
    try {
      setIsLoading(true);
      const updatedAccount = await apiClient.activateAccount(accountId);

      setAccounts(
        accounts.map((account) =>
          account.id === accountId ? updatedAccount : account
        )
      );

      toast.success("Account has been activated");
    } catch (error: any) {
      console.error("Error activating account:", error);
      toast.error(
        error.message || "Failed to activate account. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateAccount = async (values: CreateAccountFormValues) => {
    try {
      setIsLoading(true);
      const newAccount = await apiClient.createAccountForUser(
        values.userId,
        values.accountType,
        values.initialBalance
      );

      setAccounts([...accounts, newAccount]);
      setIsCreateModalOpen(false);
      createAccountForm.reset();
      toast.success("Account created successfully");
    } catch (error: any) {
      console.error("Error creating account:", error);
      toast.error(
        error.message || "Failed to create account. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#0a3977] text-white">
      <main className="flex-1 p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-semibold">Account Management</h2>
          <p className="text-blue-200">
            Manage and monitor all customer accounts
          </p>
        </div>

        {/* Summary Cards */}
        <div className="mb-6 grid gap-4 md:grid-cols-4">
          <Card className="bg-blue-800/50 text-white">
            <CardContent className="p-4">
              <div className="text-sm text-blue-200">Total Accounts</div>
              <div className="text-2xl font-bold">{accounts.length}</div>
            </CardContent>
          </Card>
          <Card className="bg-blue-800/50 text-white">
            <CardContent className="p-4">
              <div className="text-sm text-blue-200">Total Balance</div>
              <div className="text-2xl font-bold">
                RWF {totalBalance.toLocaleString()}
              </div>
            </CardContent>
          </Card>
          <Card className="bg-blue-800/50 text-white">
            <CardContent className="p-4">
              <div className="text-sm text-blue-200">Savings Accounts</div>
              <div className="text-2xl font-bold">
                {accountsByType.savings || 0}
              </div>
            </CardContent>
          </Card>
          <Card className="bg-blue-800/50 text-white">
            <CardContent className="p-4">
              <div className="text-sm text-blue-200">Current Accounts</div>
              <div className="text-2xl font-bold">
                {accountsByType.current || 0}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-blue-800/50 text-white">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>All Accounts</CardTitle>
                <CardDescription className="text-blue-200">
                  Total: {accounts.length} accounts
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
                <Button
                  className="bg-yellow-500 text-blue-900 hover:bg-yellow-400"
                  onClick={() => setIsCreateModalOpen(true)}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Create Account
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="mb-6 flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-blue-300" />
                <Input
                  placeholder="Search by customer name or account number..."
                  className="border-blue-700 bg-blue-900/50 pl-10 text-white placeholder:text-blue-300"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[150px] border-blue-700 bg-blue-900/50 text-white">
                  <SelectValue placeholder="Account Type" />
                </SelectTrigger>
                <SelectContent className="bg-blue-900 text-white">
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="savings">Savings</SelectItem>
                  <SelectItem value="current">Current</SelectItem>
                  <SelectItem value="business">Business</SelectItem>
                  <SelectItem value="fixed">Fixed Deposit</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px] border-blue-700 bg-blue-900/50 text-white">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent className="bg-blue-900 text-white">
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
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
                <div className="text-blue-200">Loading accounts...</div>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredAccounts.map((account) => (
                  <div
                    key={account.id}
                    className="flex items-center justify-between rounded-lg border border-blue-700 bg-blue-900/30 p-4"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-700 text-white font-bold">
                        {account.accountType.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">
                            {account.accountNumber}
                          </h3>
                          {getAccountTypeBadge(account.accountType)}
                          <Badge className="bg-green-500/20 text-green-400">
                            Active
                          </Badge>
                        </div>
                        <div className="text-sm text-blue-200">
                          Owner:{" "}
                          {getUserById(account.userId)?.username ||
                            "Loading..."}
                        </div>
                        <div className="text-xs text-blue-300">
                          Email:{" "}
                          {getUserById(account.userId)?.email || "Loading..."}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="font-semibold text-lg">
                          RWF {account.balance.toLocaleString()}
                        </div>
                        <div className="text-sm text-blue-200">Balance</div>
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
                            onClick={() => handleViewDetails(account)}
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleEditAccount(account)}
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Account
                          </DropdownMenuItem>
                          {account.status === "SUSPENDED" ? (
                            <DropdownMenuItem
                              className="text-green-400"
                              onClick={() => handleActivateAccount(account.id)}
                            >
                              <Check className="mr-2 h-4 w-4" />
                              Activate Account
                            </DropdownMenuItem>
                          ) : (
                            <AlertDialog
                              open={isSuspendDialogOpen}
                              onOpenChange={setIsSuspendDialogOpen}
                            >
                              <AlertDialogTrigger asChild>
                                <DropdownMenuItem
                                  onSelect={(e) => e.preventDefault()}
                                >
                                  <Ban className="mr-2 h-4 w-4" />
                                  Suspend Account
                                </DropdownMenuItem>
                              </AlertDialogTrigger>
                              <AlertDialogContent className="bg-blue-900 text-white">
                                <AlertDialogHeader>
                                  <AlertDialogTitle>
                                    Suspend Account
                                  </AlertDialogTitle>
                                  <AlertDialogDescription className="text-blue-200">
                                    Are you sure you want to suspend this
                                    account? All transactions will be frozen.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel
                                    className="bg-blue-800 text-white hover:bg-blue-700"
                                    disabled={isLoading}
                                  >
                                    Cancel
                                  </AlertDialogCancel>
                                  <AlertDialogAction
                                    className="bg-red-600 hover:bg-red-500"
                                    onClick={() =>
                                      handleSuspendAccount(account.id)
                                    }
                                    disabled={isLoading}
                                  >
                                    {isLoading
                                      ? "Suspending..."
                                      : "Suspend Account"}
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          )}
                          <AlertDialog
                            open={isDeleteDialogOpen}
                            onOpenChange={setIsDeleteDialogOpen}
                          >
                            <AlertDialogTrigger asChild>
                              <DropdownMenuItem
                                className="text-red-400"
                                onSelect={(e) => e.preventDefault()}
                              >
                                <Ban className="mr-2 h-4 w-4" />
                                Delete Account
                              </DropdownMenuItem>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="bg-blue-900 text-white">
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Delete Account
                                </AlertDialogTitle>
                                <AlertDialogDescription className="text-blue-200">
                                  Are you sure you want to delete this account?
                                  This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel
                                  className="bg-blue-800 text-white hover:bg-blue-700"
                                  disabled={isLoading}
                                >
                                  Cancel
                                </AlertDialogCancel>
                                <AlertDialogAction
                                  className="bg-red-600 hover:bg-red-500"
                                  onClick={() =>
                                    handleDeleteAccount(account.id)
                                  }
                                  disabled={isLoading}
                                >
                                  {isLoading ? "Deleting..." : "Delete Account"}
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
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

      {/* View Details Modal */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="bg-blue-900 text-white">
          <DialogHeader>
            <DialogTitle>Account Details</DialogTitle>
            <DialogDescription className="text-blue-200">
              Detailed information about the account
            </DialogDescription>
          </DialogHeader>
          {selectedAccount && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm text-blue-200">Account Number</h4>
                  <p>{selectedAccount.accountNumber}</p>
                </div>
                <div>
                  <h4 className="text-sm text-blue-200">Account Type</h4>
                  <div>{getAccountTypeBadge(selectedAccount.accountType)}</div>
                </div>
                <div>
                  <h4 className="text-sm text-blue-200">Status</h4>
                  <div>
                    {getStatusBadge(selectedAccount.status || "ACTIVE")}
                  </div>
                </div>
                <div>
                  <h4 className="text-sm text-blue-200">Balance</h4>
                  <p>RWF {selectedAccount.balance.toLocaleString()}</p>
                </div>
                <div>
                  <h4 className="text-sm text-blue-200">Owner</h4>
                  <p>{getUserById(selectedAccount.userId)?.username}</p>
                </div>
                <div>
                  <h4 className="text-sm text-blue-200">Created At</h4>
                  <p>
                    {new Date(
                      selectedAccount.createdAt || ""
                    ).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Account Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="bg-blue-900 text-white">
          <DialogHeader>
            <DialogTitle>Edit Account</DialogTitle>
            <DialogDescription className="text-blue-200">
              Make changes to account settings
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleUpdateAccount)}
              className="space-y-4"
            >
              <FormField
                control={form.control}
                name="accountType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm text-blue-200">
                      Account Type
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <SelectTrigger className="border-blue-700 bg-blue-900/50 text-white">
                        <SelectValue placeholder="Select account type" />
                      </SelectTrigger>
                      <SelectContent className="bg-blue-900 text-white">
                        <SelectItem value="SAVINGS">Savings</SelectItem>
                        <SelectItem value="CURRENT">Current</SelectItem>
                        <SelectItem value="BUSINESS">Business</SelectItem>
                        <SelectItem value="FIXED">Fixed Deposit</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-red-400" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm text-blue-200">
                      Status
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <SelectTrigger className="border-blue-700 bg-blue-900/50 text-white">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent className="bg-blue-900 text-white">
                        <SelectItem value="ACTIVE">Active</SelectItem>
                        <SelectItem value="SUSPENDED">Suspended</SelectItem>
                        <SelectItem value="CLOSED">Closed</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-red-400" />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditModalOpen(false)}
                  className="border-blue-400 text-black hover:bg-blue-800"
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-yellow-500 text-blue-900 hover:bg-yellow-400"
                  disabled={isLoading}
                >
                  {isLoading ? "Saving..." : "Save Changes"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Create Account Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="bg-blue-900 text-white">
          <DialogHeader>
            <DialogTitle>Create New Account</DialogTitle>
            <DialogDescription className="text-blue-200">
              Create a new account for a user
            </DialogDescription>
          </DialogHeader>
          <Form {...createAccountForm}>
            <form
              onSubmit={createAccountForm.handleSubmit(handleCreateAccount)}
              className="space-y-4"
            >
              <FormField
                control={createAccountForm.control}
                name="userId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm text-blue-200">
                      Select User
                    </FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(parseInt(value))}
                      defaultValue={field.value?.toString()}
                    >
                      <SelectTrigger className="border-blue-700 bg-blue-900/50 text-white">
                        <SelectValue placeholder="Select a user" />
                      </SelectTrigger>
                      <SelectContent className="bg-blue-900 text-white">
                        {users.map((user) => (
                          <SelectItem key={user.id} value={user.id.toString()}>
                            {user.username} ({user.email})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-red-400" />
                  </FormItem>
                )}
              />
              <FormField
                control={createAccountForm.control}
                name="accountType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm text-blue-200">
                      Account Type
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <SelectTrigger className="border-blue-700 bg-blue-900/50 text-white">
                        <SelectValue placeholder="Select account type" />
                      </SelectTrigger>
                      <SelectContent className="bg-blue-900 text-white">
                        <SelectItem value="SAVINGS">SAVINGS</SelectItem>
                        <SelectItem value="CHECKING">CHECKINGS</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-red-400" />
                  </FormItem>
                )}
              />
              <FormField
                control={createAccountForm.control}
                name="initialBalance"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm text-blue-200">
                      Initial Balance
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseFloat(e.target.value))
                        }
                        className="border-blue-700 bg-blue-900/50 text-white"
                      />
                    </FormControl>
                    <FormMessage className="text-red-400" />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="border-blue-400 text-black hover:bg-blue-800"
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-yellow-500 text-blue-900 hover:bg-yellow-400"
                  disabled={isLoading}
                >
                  {isLoading ? "Creating..." : "Create Account"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
