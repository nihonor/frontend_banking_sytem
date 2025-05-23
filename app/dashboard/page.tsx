"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "./Sidebar";
import Image from "next/image";
import { Avatar, DropdownMenu, Link } from "@radix-ui/themes";
import { GrTransaction } from "react-icons/gr";

interface Account {
  id: number;
  accountNumber: string;
  balance: number;
  accountType: string;
}

interface Transaction {
  id: string;
  type: string;
  amount: number;
  timestamp: string;
  description: string;
}

interface User {
  id: number;
  username: string;
  email: string;
}

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [userId, setUserId] = useState<number>();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [amount, setAmount] = useState("");
  const [recipientId, setRecipientId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showCreateAccount, setShowCreateAccount] = useState(false);
  const [newAccountType, setNewAccountType] = useState("SAVINGS");
  const [activeTab, setActiveTab] = useState<
    "withdraw" | "deposit" | "transfer"
  >("withdraw");

  useEffect(() => {
    const storedUserId = localStorage.getItem("userId");

    if (!storedUserId) {
      router.push("/");
      return;
    }

    const parsedUserId = Number(storedUserId);

    setUserId(parsedUserId);
  }, [router]);

  useEffect(() => {
    if (userId) {
      fetchAccounts();
      currentUser();
    }
  }, [userId]);

  useEffect(() => {
    if (selectedAccount) {
      console.log("Fetching transactions for user:", userId);
      fetchTransactions(userId);
    }
  }, [selectedAccount, userId]);

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

  return (
    // <div className="min-h-screen bg-gray-100 p-6">
    //   <div className="max-w-6xl mx-auto">
    //     <div className="flex justify-between items-center mb-6">
    //       <h1 className="text-3xl font-bold">ATM Dashboard</h1>
    //       <div className="flex gap-4">
    //         <button
    //           onClick={() => setShowCreateAccount(true)}
    //           className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
    //         >
    //           Create Account
    //         </button>
    //         <button
    //           onClick={handleLogout}
    //           className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
    //         >
    //           Logout
    //         </button>
    //       </div>
    //     </div>

    //     {/* Create Account Modal */}
    //     {showCreateAccount && (
    //       <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
    //         <div className="bg-white p-6 rounded-lg shadow-lg w-96">
    //           <h2 className="text-xl font-bold mb-4">Create New Account</h2>
    //           <div className="mb-4">
    //             <label className="block text-sm font-medium text-gray-700 mb-2">
    //               Account Type
    //             </label>
    //             <select
    //               value={newAccountType}
    //               onChange={(e) => setNewAccountType(e.target.value)}
    //               className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
    //             >
    //               <option value="SAVINGS">Savings</option>
    //               <option value="CHECKING">Checking</option>
    //             </select>
    //           </div>
    //           <div className="flex justify-end gap-4">
    //             <button
    //               onClick={() => setShowCreateAccount(false)}
    //               className="px-4 py-2 text-gray-600 hover:text-gray-800"
    //               disabled={loading}
    //             >
    //               Cancel
    //             </button>
    //             <button
    //               onClick={createNewAccount}
    //               disabled={loading}
    //               className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
    //             >
    //               {loading ? "Creating..." : "Create"}
    //             </button>
    //           </div>
    //         </div>
    //       </div>
    //     )}

    //     {/* Account Selection */}
    //     <div className="bg-white rounded-lg shadow p-6 mb-6">
    //       <h2 className="text-xl font-semibold mb-4">Your Accounts</h2>
    //       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    //         {accounts.map((account) => (
    //           <div
    //             key={account.id}
    //             onClick={() => setSelectedAccount(account)}
    //             className={`p-4 rounded-lg border-2 cursor-pointer transition-colors ${
    //               selectedAccount?.id === account.id
    //                 ? "border-blue-500 bg-blue-50"
    //                 : "border-gray-200 hover:border-blue-300"
    //             }`}
    //           >
    //             <p className="text-sm text-gray-600">{account.accountType}</p>
    //             <p className="text-lg font-semibold">{account.accountNumber}</p>
    //             <p className="text-2xl font-bold text-green-600">
    //               ${account.balance.toFixed(2)}
    //             </p>
    //           </div>
    //         ))}
    //       </div>
    //     </div>

    //     {selectedAccount && (
    //       <>
    //         {/* Operations Card */}
    //         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    //           <div className="bg-white rounded-lg shadow p-6">
    //             <div className="flex space-x-4 mb-4">
    //               <button
    //                 onClick={() => setActiveTab("withdraw")}
    //                 className={`px-4 py-2 rounded ${
    //                   activeTab === "withdraw"
    //                     ? "bg-blue-600 text-white"
    //                     : "bg-gray-200"
    //                 }`}
    //               >
    //                 Withdraw
    //               </button>
    //               <button
    //                 onClick={() => setActiveTab("deposit")}
    //                 className={`px-4 py-2 rounded ${
    //                   activeTab === "deposit"
    //                     ? "bg-blue-600 text-white"
    //                     : "bg-gray-200"
    //                 }`}
    //               >
    //                 Deposit
    //               </button>
    //               <button
    //                 onClick={() => setActiveTab("transfer")}
    //                 className={`px-4 py-2 rounded ${
    //                   activeTab === "transfer"
    //                     ? "bg-blue-600 text-white"
    //                     : "bg-gray-200"
    //                 }`}
    //               >
    //                 Transfer
    //               </button>
    //             </div>

    //             {error && (
    //               <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
    //                 {error}
    //               </div>
    //             )}

    //             <div className="space-y-4">
    //               <div>
    //                 <label className="block text-sm font-medium text-gray-700">
    //                   Amount
    //                 </label>
    //                 <input
    //                   type="number"
    //                   value={amount}
    //                   onChange={(e) => setAmount(e.target.value)}
    //                   className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
    //                   placeholder="Enter amount"
    //                   min="0"
    //                   step="0.01"
    //                 />
    //               </div>

    //               {activeTab === "transfer" && (
    //                 <div>
    //                   <label className="block text-sm font-medium text-gray-700">
    //                     Recipient Account Number
    //                   </label>
    //                   <input
    //                     type="text"
    //                     value={recipientId}
    //                     onChange={(e) => setRecipientId(e.target.value)}
    //                     className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
    //                     placeholder="Enter recipient account number"
    //                   />
    //                 </div>
    //               )}

    //               <button
    //                 onClick={() => handleOperation(activeTab)}
    //                 disabled={loading}
    //                 className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
    //               >
    //                 {loading ? "Processing..." : `Confirm ${activeTab}`}
    //               </button>
    //             </div>
    //           </div>

    //           {/* Transactions */}
    // <div className="bg-white rounded-lg shadow">
    //   <h2 className="text-xl font-semibold p-6 border-b">
    //     Transaction History
    //   </h2>
    //   <div className="overflow-x-auto">
    //     <table className="min-w-full divide-y divide-gray-200">
    //       <thead className="bg-gray-50">
    //         <tr>
    //           <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
    //             Type
    //           </th>
    //           <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
    //             Amount
    //           </th>
    //           <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
    //             Description
    //           </th>
    //           <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
    //             Date
    //           </th>
    //         </tr>
    //       </thead>
    //       <tbody className="bg-white divide-y divide-gray-200">
    //         {transactions.map((transaction) => (
    //           <tr key={transaction.id}>
    //             <td className="px-6 py-4 whitespace-nowrap">
    //               <span
    //                 className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
    //                   transaction.type === "DEPOSIT"
    //                     ? "bg-green-100 text-green-800"
    //                     : transaction.type === "WITHDRAWAL"
    //                     ? "bg-red-100 text-red-800"
    //                     : "bg-blue-100 text-blue-800"
    //                 }`}
    //               >
    //                 {transaction.type}
    //               </span>
    //             </td>
    //             <td className="px-6 py-4 whitespace-nowrap">
    //               ${transaction.amount.toFixed(2)}
    //             </td>
    //             <td className="px-6 py-4 whitespace-nowrap">
    //               {transaction.description}
    //             </td>
    //             <td className="px-6 py-4 whitespace-nowrap">
    //               {new Date(transaction.timestamp).toLocaleString()}
    //             </td>
    //           </tr>
    //         ))}
    //       </tbody>
    //     </table>
    //   </div>
    // </div>
    //         </div>
    //       </>
    //     )}
    //   </div>
    // </div>
    <div className="bg-[#1F65B3]">
      <nav className=" top-0 left-0 right-0  p-6 flex items-center px-7 text-white text-2xl font-bold justify-between">
        <div className="flex items-center">
          <Image src="/bk_logo.png" alt="logo" width={50} height={300} />
          BANK OF KIGALI
        </div>
        <div>
          <DropdownMenu.Root>
            <DropdownMenu.Trigger>
              <button className="flex items-center gap-2 px-3 py-2 rounded-full bg-white hover:bg-white/20  text-sm text-[#1F65B3]">
                <Avatar
                  src=""
                  fallback={user?.username?.charAt(0).toUpperCase() || "?"}
                  size="3"
                  radius="full"
                  className="cursor-pointer"
                  variant="soft"
                />
                <span>{user?.username}</span>
              </button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Content>
              <DropdownMenu.Item>
                <Link href="/logout">Logout</Link>
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Root>
        </div>
      </nav>
      <div className="flex">
        <Sidebar />
        <div className="flex-1 p-6 text-white">
          <h1 className="text-2xl py-6">Welcome back, {user?.username}</h1>
          <div className="bg-white/10 w-72 rounded-lg px-4 py-2 cursor-pointer my-16">
            <DropdownMenu.Root>
              <DropdownMenu.Trigger className="w-full">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center">
                      <span className="text-sm">BK</span>
                    </div>
                    <div>
                      <p className="text-sm text-white">Current account</p>
                      <p className="text-xs text-white/80">
                        {selectedAccount?.accountNumber
                          ?.replace(/(\d{4})/g, "$1 ")
                          .trim() || "Select account"}
                      </p>
                    </div>
                  </div>
                  <svg
                    className="w-4 h-4 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </DropdownMenu.Trigger>
              <DropdownMenu.Content>
                {accounts.map((account) => (
                  <DropdownMenu.Item
                    key={account.id}
                    onClick={() => setSelectedAccount(account)}
                  >
                    {account.accountNumber}
                  </DropdownMenu.Item>
                ))}
              </DropdownMenu.Content>
            </DropdownMenu.Root>
          </div>
          <div className="bg-white rounded-lg w-1/4 px-6 py-3">
            <h1 className="text-gray-400 font-semibold text-sm mb-4">
              RECENT TRANSACTIONS
            </h1>
            {transactions && transactions.length > 0 ? (
              <div className="space-y-4 ">
                {transactions.slice(0, 5).map((transaction, index) => (
                  <div
                    key={transaction.id}
                    className="flex text-black items-center justify-between gap-3 border-t border-gray-200 pt-4"
                  >
                    <div className="flex gap-4 items-center">
                      <span
                        className={`p-4 rounded-full ${
                          transaction.type === "DEPOSIT"
                            ? "bg-green-100"
                            : transaction.type === "WITHDRAWAL"
                            ? "bg-red-100"
                            : "bg-blue-100"
                        }`}
                      >
                        <GrTransaction />
                      </span>

                      <div>
                        <h4 className="text-xs font-medium first-letter:uppercase">
                          {transaction.description || transaction.type}
                        </h4>
                        <p className="text-xs text-gray-500 font-medium">
                          {new Date(transaction.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                    <p
                      className={` text-sm font-medium ${
                        transaction.type === "DEPOSIT"
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {transaction.type === "DEPOSIT" ? "+" : "-"}
                      RWF {transaction.amount.toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm py-2">
                No recent transactions
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
