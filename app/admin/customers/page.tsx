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
  Check,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { apiClient, type User, type Account, type AuditLog } from "@/lib/api";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

interface CustomerData extends User {
  accounts: Account[];
  totalBalance: number;
  lastLogin?: string;
  recentActivity: AuditLog[];
}

function formatDate(dateString: string | undefined): string {
  if (!dateString) return "Unknown";

  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "Unknown";

  return date.toLocaleDateString();
}

function formatLastLogin(logs: AuditLog[]): string {
  // Consider any user activity as "active"
  if (!logs || logs.length === 0) return "Never";

  const lastActivity = new Date(logs[0].timestamp);
  const now = new Date();

  if (isNaN(lastActivity.getTime())) return "Never";

  const diffInMinutes = Math.floor(
    (now.getTime() - lastActivity.getTime()) / (1000 * 60)
  );

  if (diffInMinutes < 1) return "Just now";
  if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours} hours ago`;

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays} days ago`;

  return lastActivity.toLocaleDateString();
}

function getActivityDescription(log: AuditLog): string {
  switch (log.action) {
    case "User modified":
      return "Updated profile";
    case "Transaction modified":
      return "Made a transaction";
    default:
      return log.action;
  }
}

function getRecentActivityBadge(activity: string) {
  switch (activity) {
    case "User modified":
      return (
        <Badge className="bg-yellow-500/20 text-yellow-400">
          Profile Update
        </Badge>
      );
    case "Transaction modified":
      return (
        <Badge className="bg-blue-500/20 text-blue-400">Transaction</Badge>
      );
    default:
      return <Badge className="bg-gray-500/20 text-gray-400">{activity}</Badge>;
  }
}

// Form validation schema
const userFormSchema = z
  .object({
    username: z.string().min(3, "Username must be at least 3 characters"),
    email: z.string().email("Invalid email address"),
    firstName: z.string().min(2, "First name must be at least 2 characters"),
    lastName: z.string().min(2, "Last name must be at least 2 characters"),
    role: z.enum(["user", "admin"]),
    password: z
      .string()
      .min(6, "Password must be at least 6 characters")
      .optional(),
    confirmPassword: z.string().optional(),
  })
  .refine(
    (data) => {
      // Only validate passwords match if password is provided (for editing)
      if (data.password) {
        return data.password === data.confirmPassword;
      }
      return true;
    },
    {
      message: "Passwords don't match",
      path: ["confirmPassword"],
    }
  );

type UserFormValues = z.infer<typeof userFormSchema>;

export default function CustomersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [customers, setCustomers] = useState<CustomerData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerData | null>(
    null
  );
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const form = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      username: "",
      email: "",
      firstName: "",
      lastName: "",
      role: "user",
      password: "",
      confirmPassword: "",
    },
  });

  const addCustomerForm = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      username: "",
      email: "",
      firstName: "",
      lastName: "",
      role: "user",
      password: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    fetchCustomerData();
  }, []);

  const fetchCustomerData = async () => {
    try {
      setIsLoading(true);
      const users = await apiClient.getAllUsers();

      // Fetch accounts and audit logs for each user
      const customersWithData = await Promise.all(
        users.map(async (user) => {
          try {
            const [accounts, auditLogs] = await Promise.all([
              apiClient.getUserAccounts(user.id),
              apiClient.getUserAuditLogs(user.id),
            ]);

            const totalBalance = accounts.reduce(
              (sum, account) => sum + account.balance,
              0
            );

            // Sort audit logs by timestamp in descending order
            const sortedLogs = auditLogs.sort(
              (a, b) =>
                new Date(b.timestamp).getTime() -
                new Date(a.timestamp).getTime()
            );

            return {
              ...user,
              accounts,
              totalBalance,
              recentActivity: sortedLogs,
              lastLogin: formatLastLogin(sortedLogs),
            };
          } catch (error) {
            console.error(`Error fetching data for user ${user.id}:`, error);
            return {
              ...user,
              accounts: [],
              totalBalance: 0,
              recentActivity: [],
              lastLogin: "N/A",
            };
          }
        })
      );

      setCustomers(customersWithData);
    } catch (error) {
      console.error("Error fetching customer data:", error);
      toast.error("Failed to load customer data. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewDetails = (customer: CustomerData) => {
    setSelectedCustomer(customer);
    setIsViewModalOpen(true);
  };

  const handleEditCustomer = (customer: CustomerData) => {
    setSelectedCustomer(customer);
    form.reset({
      username: customer.username,
      email: customer.email || "",
      firstName: customer.firstName || "",
      lastName: customer.lastName || "",
      role: customer.role as "user" | "admin",
      password: "",
      confirmPassword: "",
    });
    setIsEditModalOpen(true);
  };

  const handleSuspendAccount = async (userId: number) => {
    try {
      await apiClient.suspendUser(userId);
      // Update the local state to reflect the change
      setCustomers(
        customers.map((customer) =>
          customer.id === userId ? { ...customer, role: "suspended" } : customer
        )
      );
      toast.success("Account suspended successfully");
    } catch (error) {
      console.error("Error suspending account:", error);
      toast.error("Failed to suspend account. Please try again.");
    }
  };

  const handleActivateAccount = async (userId: number) => {
    try {
      await apiClient.activateUser(userId);
      // Update the local state to reflect the change
      setCustomers(
        customers.map((customer) =>
          customer.id === userId ? { ...customer, role: "active" } : customer
        )
      );
      toast.success("Account activated successfully");
    } catch (error) {
      console.error("Error activating account:", error);
      toast.error("Failed to activate account. Please try again.");
    }
  };

  const handleUpdateCustomer = async (values: UserFormValues) => {
    if (!selectedCustomer) return;

    try {
      const updatedCustomer = await apiClient.updateUser(
        selectedCustomer.id,
        values
      );
      setCustomers(
        customers.map((customer) =>
          customer.id === selectedCustomer.id
            ? { ...customer, ...updatedCustomer }
            : customer
        )
      );
      setIsEditModalOpen(false);
      toast.success("Customer updated successfully");
    } catch (error) {
      console.error("Error updating customer:", error);
      toast.error("Failed to update customer. Please try again.");
    }
  };

  const handleAddCustomer = async (values: UserFormValues) => {
    try {
      const { confirmPassword, ...userData } = values;
      const newCustomer = await apiClient.createCustomer(userData);
      setCustomers([
        ...customers,
        {
          ...newCustomer,
          accounts: [],
          totalBalance: 0,
          recentActivity: [],
          lastLogin: "Never",
        },
      ]);
      setIsAddModalOpen(false);
      addCustomerForm.reset();
      toast.success("Customer added successfully");
    } catch (error) {
      console.error("Error adding customer:", error);
      toast.error("Failed to add customer. Please try again.");
    }
  };

  const getStatusBadge = (status: string = "active") => {
    switch (status.toLowerCase()) {
      case "active":
        return <Badge className="bg-green-500/20 text-green-400">Active</Badge>;
      case "suspended":
        return <Badge className="bg-red-500/20 text-red-400">Suspended</Badge>;
      case "pending":
        return (
          <Badge className="bg-yellow-500/20 text-yellow-400">Pending</Badge>
        );
      default:
        return <Badge className="bg-gray-500/20 text-gray-400">Unknown</Badge>;
    }
  };

  const getAccountTypeBadge = (type: string) => {
    switch (type.toLowerCase()) {
      case "premium":
        return (
          <Badge className="bg-purple-500/20 text-purple-400">Premium</Badge>
        );
      case "business":
        return <Badge className="bg-blue-500/20 text-blue-400">Business</Badge>;
      default:
        return <Badge className="bg-gray-500/20 text-gray-400">Standard</Badge>;
    }
  };

  const filteredCustomers = customers.filter((customer) => {
    const matchesSearch =
      customer.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.lastName?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ||
      customer.role.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="flex min-h-screen flex-col bg-[#0a3977] text-white">
      <main className="flex-1 p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-semibold">Customer Management</h2>
          <p className="text-blue-200">Manage and monitor customer accounts</p>
        </div>

        <Card className="bg-blue-800/50 text-white">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>All Customers</CardTitle>
                <CardDescription className="text-blue-200">
                  Total: {customers.length} customers
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="border-blue-400 text-black hover:bg-blue-800 cursor-pointer"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </Button>
                <Button
                  className="bg-yellow-500 text-blue-900 hover:bg-yellow-400 cursor-pointer"
                  onClick={() => setIsAddModalOpen(true)}
                >
                  Add Customer
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="mb-6 flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-blue-300" />
                <Input
                  placeholder="Search customers..."
                  className="border-blue-700 bg-blue-900/50 pl-10 text-white placeholder:text-blue-300"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px] border-blue-700 bg-blue-900/50 text-white">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent className="bg-blue-900 text-white cursor-pointer">
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="user">Regular Users</SelectItem>
                  <SelectItem value="admin">Administrators</SelectItem>
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
                <div className="text-blue-200">Loading customers...</div>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredCustomers.map((customer) => (
                  <div
                    key={customer.id}
                    className="flex items-center justify-between rounded-lg border border-blue-700 bg-blue-900/30 p-4"
                  >
                    <div className="flex items-center gap-4">
                      <Avatar className="h-12 w-12 text-blue-700">
                        <AvatarFallback>
                          {(
                            customer.firstName?.[0] || customer.username[0]
                          ).toUpperCase()}
                          {customer.lastName?.[0] || ""}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">
                            {customer.firstName || customer.username}{" "}
                            {customer.lastName || ""}
                          </h3>
                          {getStatusBadge(customer.role)}
                          {customer.recentActivity[0] &&
                            getRecentActivityBadge(
                              customer.recentActivity[0].action
                            )}
                        </div>
                        <div className="text-sm text-blue-200">
                          {customer.email || "No email"} •{" "}
                          {customer.accounts.length} Account(s)
                        </div>
                        <div className="text-xs text-blue-300">
                          Created: {formatDate(customer.createdAt)} • Last
                          active: {customer.lastLogin}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="font-semibold">
                          RWF {customer.totalBalance.toLocaleString()}
                        </div>
                        <div className="text-sm text-blue-200">
                          Total Balance
                        </div>
                        <div className="text-xs text-blue-300">
                          {customer.recentActivity[0] &&
                            `Last action: ${getActivityDescription(
                              customer.recentActivity[0]
                            )}`}
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
                            onClick={() => handleViewDetails(customer)}
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleEditCustomer(customer)}
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Customer
                          </DropdownMenuItem>
                          {customer.role === "suspended" ? (
                            <DropdownMenuItem
                              className="text-green-400"
                              onClick={() => handleActivateAccount(customer.id)}
                            >
                              <Check className="mr-2 h-4 w-4" />
                              Activate Account
                            </DropdownMenuItem>
                          ) : (
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <DropdownMenuItem
                                  className="text-red-400"
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
                                    account? The user will not be able to access
                                    their account until it is reactivated.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel className="bg-blue-800 text-white hover:bg-blue-700">
                                    Cancel
                                  </AlertDialogCancel>
                                  <AlertDialogAction
                                    className="bg-red-600 hover:bg-red-500"
                                    onClick={() =>
                                      handleSuspendAccount(customer.id)
                                    }
                                  >
                                    Suspend Account
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          )}
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
            <DialogTitle>Customer Details</DialogTitle>
            <DialogDescription className="text-blue-200">
              Detailed information about the customer
            </DialogDescription>
          </DialogHeader>
          {selectedCustomer && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm text-blue-200">Name</h4>
                  <p>
                    {selectedCustomer.firstName} {selectedCustomer.lastName}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm text-blue-200">Email</h4>
                  <p>{selectedCustomer.email}</p>
                </div>
                <div>
                  <h4 className="text-sm text-blue-200">Status</h4>
                  <div>{getStatusBadge(selectedCustomer.role)}</div>
                </div>
                <div>
                  <h4 className="text-sm text-blue-200">Total Balance</h4>
                  <p>RWF {selectedCustomer.totalBalance.toLocaleString()}</p>
                </div>
              </div>
              <div>
                <h4 className="text-sm text-blue-200 mb-2">Recent Activity</h4>
                <div className="space-y-2">
                  {selectedCustomer.recentActivity
                    .slice(0, 5)
                    .map((activity, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between text-sm"
                      >
                        <span>{getActivityDescription(activity)}</span>
                        <span className="text-blue-300">
                          {new Date(activity.timestamp).toLocaleDateString()}
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Customer Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="bg-blue-900 text-white">
          <DialogHeader>
            <DialogTitle>Edit Customer</DialogTitle>
            <DialogDescription className="text-blue-200">
              Make changes to customer information
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleUpdateCustomer)}
              className="space-y-4"
            >
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm text-blue-200">
                        First Name
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          className="border-blue-700 bg-blue-900/50 text-white"
                        />
                      </FormControl>
                      <FormMessage className="text-red-400" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm text-blue-200">
                        Last Name
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          className="border-blue-700 bg-blue-900/50 text-white"
                        />
                      </FormControl>
                      <FormMessage className="text-red-400" />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm text-blue-200">
                      Username
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        className="border-blue-700 bg-blue-900/50 text-white"
                      />
                    </FormControl>
                    <FormMessage className="text-red-400" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm text-blue-200">
                      Email
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="email"
                        className="border-blue-700 bg-blue-900/50 text-white"
                      />
                    </FormControl>
                    <FormMessage className="text-red-400" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm text-blue-200">
                      Role
                    </FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="border-blue-700 bg-blue-900/50 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-blue-900 text-white">
                        <SelectItem value="user">Regular User</SelectItem>
                        <SelectItem value="admin">Administrator</SelectItem>
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
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-yellow-500 text-blue-900 hover:bg-yellow-400"
                >
                  Save Changes
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Add Customer Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="bg-blue-900 text-white">
          <DialogHeader>
            <DialogTitle>Add New Customer</DialogTitle>
            <DialogDescription className="text-blue-200">
              Create a new customer account
            </DialogDescription>
          </DialogHeader>
          <Form {...addCustomerForm}>
            <form
              onSubmit={addCustomerForm.handleSubmit(handleAddCustomer)}
              className="space-y-4"
            >
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={addCustomerForm.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm text-blue-200">
                        First Name
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          className="border-blue-700 bg-blue-900/50 text-white"
                        />
                      </FormControl>
                      <FormMessage className="text-red-400" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={addCustomerForm.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm text-blue-200">
                        Last Name
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          className="border-blue-700 bg-blue-900/50 text-white"
                        />
                      </FormControl>
                      <FormMessage className="text-red-400" />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={addCustomerForm.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm text-blue-200">
                      Username
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        className="border-blue-700 bg-blue-900/50 text-white"
                      />
                    </FormControl>
                    <FormMessage className="text-red-400" />
                  </FormItem>
                )}
              />
              <FormField
                control={addCustomerForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm text-blue-200">
                      Email
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="email"
                        className="border-blue-700 bg-blue-900/50 text-white"
                      />
                    </FormControl>
                    <FormMessage className="text-red-400" />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={addCustomerForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm text-blue-200">
                        Password
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="password"
                          className="border-blue-700 bg-blue-900/50 text-white"
                        />
                      </FormControl>
                      <FormMessage className="text-red-400" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={addCustomerForm.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm text-blue-200">
                        Confirm Password
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="password"
                          className="border-blue-700 bg-blue-900/50 text-white"
                        />
                      </FormControl>
                      <FormMessage className="text-red-400" />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={addCustomerForm.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm text-blue-200">
                      Role
                    </FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="border-blue-700 bg-blue-900/50 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-blue-900 text-white">
                        <SelectItem value="user">Regular User</SelectItem>
                        <SelectItem value="admin">Administrator</SelectItem>
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
                  onClick={() => setIsAddModalOpen(false)}
                  className="border-blue-400 text-black hover:bg-blue-800 cursor-pointer"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-yellow-500 text-blue-900 hover:bg-yellow-400 cursor-pointer"
                >
                  Add Customer
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
