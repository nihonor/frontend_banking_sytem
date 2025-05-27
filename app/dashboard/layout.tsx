"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AppSidebar } from "@/components/app-sidebar";
import { Bell, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { apiClient, type User } from "@/lib/api";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/");
      return;
    }

    // Fetch user data
    const userId = localStorage.getItem("userId");
    if (userId) {
      fetchUserData(parseInt(userId));
    }
  }, [mounted, router]);

  const fetchUserData = async (userId: number) => {
    try {
      const users = await apiClient.getAllUsers();
      const currentUser = users.find((u) => u.id === userId);
      if (currentUser) {
        setUser(currentUser);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 flex h-16 items-center justify-between border-b border-gray-200 bg-white px-4">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-semibold">ATM System</h1>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon">
            <Bell className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            <div className="text-sm">{user?.username || "Loading..."}</div>
            <Button variant="ghost" size="icon">
              <ChevronDown className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <AppSidebar />

      {/* Main Content */}
      <main className="ml-64 pt-16">
        <div className="container mx-auto p-6">{children}</div>
      </main>
    </div>
  );
}
