"use client";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AdminSidebar } from "../components/admin-sidebar";
import { useRouter } from "next/navigation";
import { Bell, ChevronDown, LogOut, Settings, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState, useEffect } from "react";
import { apiClient } from "@/lib/api";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [timeRange, setTimeRange] = useState("7d");
  const [userData, setUserData] = useState<{
    username: string;
    role: string;
  } | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/");
      return;
    }

    // Get user data from localStorage
    const username = localStorage.getItem("username") || "admin";
    const userRole = localStorage.getItem("userRole");

    if (username && userRole) {
      setUserData({
        username,
        role: userRole,
      });
    }
  }, [router]);

  const handleLogout = async () => {
    try {
      await apiClient.logout();
      // Clear all auth-related localStorage items
      localStorage.removeItem("token");
      localStorage.removeItem("username");
      localStorage.removeItem("userId");
      localStorage.removeItem("userRole");
      router.push("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const getInitials = (username: string) => {
    return username
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <SidebarProvider>
      <AdminSidebar />
      <SidebarInset>
        <header className="flex h-16 items-center justify-between border-b border-blue-800 px-6 bg-[#0a3977] text-white">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold">BANK OF KIGALI - ADMIN</h1>
          </div>
          <div className="flex items-center gap-4">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-[180px] border-blue-700 bg-blue-900/50 text-white">
                <SelectValue placeholder="Select time range" />
              </SelectTrigger>
              <SelectContent className="bg-blue-900 text-white">
                <SelectItem value="24h">Last 24 hours</SelectItem>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
              </SelectContent>
            </Select>
            <div className="relative">
              <Button variant="ghost" size="icon" className="text-white">
                <Bell className="h-5 w-5" />
                <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                  5
                </span>
              </Button>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className="flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 cursor-pointer">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 text-blue-900">
                    {userData ? getInitials(userData.username) : "AD"}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">
                      {userData ? userData.username : "Loading..."}
                    </span>
                    <span className="text-xs text-blue-300">
                      {userData ? userData.role : ""}
                    </span>
                  </div>
                  <ChevronDown className="h-4 w-4" />
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-56 bg-blue-900 text-white"
                align="end"
              >
                <DropdownMenuItem className="cursor-pointer">
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-blue-800" />
                <DropdownMenuItem
                  className="cursor-pointer text-red-400"
                  onClick={handleLogout}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        <main className="flex-1 p-6 bg-[#0a3977] text-white">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
