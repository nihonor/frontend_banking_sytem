"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  CreditCard,
  Home,
  Landmark,
  Newspaper,
  PiggyBank,
  Send,
  Settings,
  ShieldCheck,
  User,
  Wallet,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar>
      <SidebarHeader className="flex h-16 items-center border-b border-blue-800 px-4 bg-[#0a3977]">
        <Link href="/" className="flex items-center gap-2 font-bold text-white">
          <Landmark className="h-6 w-6" />
          <span className="text-lg">BANK OF KIGALI</span>
        </Link>
      </SidebarHeader>
      <SidebarContent className="bg-[#0a3977] text-white">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === "/dashboard/home"}
                >
                  <Link href="/dashboard/home">
                    <Home className="h-5 w-5" />
                    <span>Home</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === "/dashboard/accounts"}
                >
                  <Link href="/dashboard/accounts">
                    <Wallet className="h-5 w-5" />
                    <span>Accounts</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === "/dashboard/transfer"}
                >
                  <Link href="/dashboard/transfer">
                    <Send className="h-5 w-5" />
                    <span>Transfer</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === "/dashboard/cards"}
                >
                  <Link href="/dashboard/cards">
                    <CreditCard className="h-5 w-5" />
                    <span>Cards</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === "/dashboard/savings"}
                >
                  <Link href="/dashboard/savings">
                    <PiggyBank className="h-5 w-5" />
                    <span>Savings</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === "/dashboard/investments"}
                >
                  <Link href="/dashboard/investments">
                    <BarChart3 className="h-5 w-5" />
                    <span>Investments</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === "/dashboard/statements"}
                >
                  <Link href="/dashboard/statements">
                    <Newspaper className="h-5 w-5" />
                    <span>Statements</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === "/dashboard/profile"}
                >
                  <Link href="/dashboard/profile">
                    <User className="h-5 w-5" />
                    <span>Profile</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === "/dashboard/pay"}
                >
                  <Link href="/dashboard/profile">
                    <CreditCard className="h-5 w-5" />
                    <span>Pay</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === "/dashboard/security"}
                >
                  <Link href="/dashboard/security">
                    <ShieldCheck className="h-5 w-5" />
                    <span>Security</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === "/dashboard/settings"}
                >
                  <Link href="/dashboard/settings">
                    <Settings className="h-5 w-5" />
                    <span>Settings</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
