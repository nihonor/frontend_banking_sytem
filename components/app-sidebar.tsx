import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  CreditCard,
  Send,
  History,
  Settings,
  HelpCircle,
  LogOut,
} from "lucide-react";

export function AppSidebar() {
  const pathname = usePathname();

  const menuItems = [
    { icon: Home, label: "Home", href: "/dashboard/home" },
    { icon: CreditCard, label: "Accounts", href: "/dashboard/accounts" },
    { icon: Send, label: "Transfer", href: "/dashboard/transfer" },
    { icon: History, label: "Transactions", href: "/dashboard/transactions" },
    { icon: Settings, label: "Settings", href: "/dashboard/settings" },
    { icon: HelpCircle, label: "Help", href: "/dashboard/help" },
  ];

  return (
    <div className="fixed left-0 top-16 z-40 h-[calc(100vh-4rem)] w-64 border-r border-gray-200 bg-white">
      <div className="flex h-full flex-col">
        <nav className="space-y-1 p-4">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                  isActive
                    ? "bg-gray-100 text-gray-900"
                    : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto p-4">
          <button
            onClick={() => {
              localStorage.removeItem("token");
              window.location.href = "/";
            }}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-red-500 transition-colors hover:bg-red-50"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
