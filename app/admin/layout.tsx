"use client";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AdminSidebar } from "../components/admin-sidebar";

import { Bell, ChevronDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [timeRange, setTimeRange] = useState("7d");
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
            <div className="flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 text-blue-900">
                AD
              </div>
              <span className="text-sm font-medium">Admin User</span>
              <Button
                variant="ghost"
                size="icon"
                className="ml-1 h-5 w-5 text-white"
              >
                <ChevronDown className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </header>
        <main className="flex-1 p-6 bg-[#0a3977] text-white">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
