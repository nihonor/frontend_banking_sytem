"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AppSidebar } from "./Sidebar";
import {
  Bell,
  ChevronDown,
  LogOut,
  Settings,
  Sidebar,
  User as UserIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { apiClient, type User } from "@/lib/api";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import Link from "next/link";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const [userData, setUserData] = useState<User | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/");
      return;
    }

    fetchUserData();
  }, [router]);

  const fetchUserData = async () => {
    try {
      const user = await apiClient.getCurrentUser();
      setUserData(user);
    } catch (error) {
      console.error("Error fetching user data:", error);
      router.push("/");
    }
  };

  const getInitials = (username: string) => {
    return username
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const handleLogout = async () => {
    try {
      await apiClient.logout();
      localStorage.removeItem("token");
      localStorage.removeItem("username");
      localStorage.removeItem("userId");
      localStorage.removeItem("userRole");
      router.push("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        {/* Header */}
        <header className="flex h-16 items-center justify-between border-b border-blue-800 px-6 bg-[#0a3977] text-white">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white">BANK OF KIGALI</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              {/* <Button variant="ghost" size="icon" className="text-white">
              <Bell className="h-5 w-5" />
              <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                3
              </span>
            </Button> */}
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className="flex cursor-pointer items-center gap-2 rounded-full bg-white/10 px-3 py-1.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 text-blue-900 font-semibold">
                    {userData ? getInitials(userData.username) : "..."}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-white">
                      {userData ? userData.username : "Loading..."}
                    </span>
                    <span className="text-xs text-blue-300">
                      {userData ? userData.role : ""}
                    </span>
                  </div>
                  <ChevronDown className="h-4 w-4 text-white" />
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-56 bg-blue-900 text-white"
                align="end"
              >
                <DropdownMenuItem className="cursor-pointer">
                  <UserIcon className="mr-2 h-4 w-4" />
                  <Link href="/dashboard/profile">Profile</Link>
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

        {/* Sidebar */}

        {/* Main Content */}
        <main className="flex-1 p-6 bg-[#0a3977] text-white">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
