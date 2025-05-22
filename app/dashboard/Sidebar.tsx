import React, { useState } from "react";
import { MdDashboard } from "react-icons/md";
import { TbReport } from "react-icons/tb";
import { CiStreamOn } from "react-icons/ci";
import { MdAutoGraph } from "react-icons/md";
import { CgProfile } from "react-icons/cg";
import { IoLogOutOutline } from "react-icons/io5";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { GoSidebarCollapse, GoSidebarExpand } from "react-icons/go";

const Sidebar = () => {
  const [collapse, setCollapse] = useState(false);
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <div
      className={`h-screen bg-white p-6 md:flex hidden flex-col shadow-lg transition-all duration-300 ${
        collapse ? "w-20" : "w-64"
      }`}
    >
      {/* Navigation Links */}
      <div className="flex-1">
        <ul className="space-y-0.5 font-semibold">
          <li>
            <Link
              href="/dashboard"
              className={`flex items-center gap-3 p-3 rounded-lg ${
                isActive("/dashboard")
                  ? "text-[#1F65B3] bg-[#CED8E9] rounded-lg"
                  : "text-gray-500"
              } hover:text-[#1F65B3] hover:bg-[#CED8E9]`}
            >
              <div className="text-xl">
                <MdDashboard />
              </div>
              {!collapse && <span>Dashboard</span>}
            </Link>
          </li>
          <li>
            <Link
              href="/appointment"
              className={`flex items-center gap-3 p-3 rounded-lg ${
                isActive("/appointment")
                  ? "text-[#1F65B3] bg-[#CED8E9] rounded-lg"
                  : "text-gray-500"
              } hover:text-[#1F65B3] hover:bg-[#CED8E9]`}
            >
              <div className="text-xl">
                <TbReport />
              </div>
              {!collapse && <span>Accounts</span>}
            </Link>
          </li>
          <li>
            <Link
              href="/tables"
              className={`flex items-center gap-3 p-3 rounded-lg ${
                isActive("/tables")
                  ? "text-[#1F65B3] bg-[#CED8E9] rounded-lg"
                  : "text-gray-500"
              } hover:text-[#1F65B3] hover:bg-[#CED8E9]`}
            >
              <div className="text-xl">
                <CiStreamOn />
              </div>
              {!collapse && <span>Tables</span>}
            </Link>
          </li>
          <li>
            <Link
              href="/articles"
              className={`flex items-center gap-3 p-3 rounded-lg ${
                isActive("/articles")
                  ? "text-[#1F65B3] bg-[#CED8E9] rounded-lg"
                  : "text-gray-500"
              } hover:text-[#1F65B3] hover:bg-[#CED8E9]`}
            >
              <div className="text-xl">
                <MdAutoGraph />
              </div>
              {!collapse && <span>Articles</span>}
            </Link>
          </li>
          <li>
            <Link
              href="/profile"
              className={`flex items-center gap-3 p-3 rounded-lg ${
                isActive("/profile")
                  ? "text-[#1F65B3] bg-[#CED8E9] rounded-lg"
                  : "text-gray-500"
              } hover:text-[#1F65B3] hover:bg-[#CED8E9]`}
            >
              <div className="text-xl">
                <CgProfile />
              </div>
              {!collapse && <span>Profile</span>}
            </Link>
          </li>
        </ul>
      </div>

      {/* Logout Button */}
      
    </div>
  );
};

export default Sidebar;
