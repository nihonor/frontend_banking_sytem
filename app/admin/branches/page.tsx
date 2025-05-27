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
  MapPin,
  Building,
  Users,
  DollarSign,
} from "lucide-react";
import { toast } from "sonner";

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

interface Branch {
  id: number;
  name: string;
  code: string;
  address: string;
  city: string;
  province: string;
  manager: string;
  phone: string;
  email: string;
  status: "active" | "inactive" | "maintenance";
  totalCustomers: number;
  monthlyTransactions: number;
  monthlyRevenue: number;
  openingHours: string;
  services: string[];
  lastUpdated: string;
}

export default function BranchManagementPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [provinceFilter, setProvinceFilter] = useState("all");
  const [branches, setBranches] = useState<Branch[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchBranchData();
  }, []);

  const fetchBranchData = async () => {
    try {
      setIsLoading(true);

      // Mock branch data - in real app, this would come from backend
      const mockBranches: Branch[] = [
        {
          id: 1,
          name: "Kigali City Center",
          code: "BK001",
          address: "KN 3 Ave, Kigali",
          city: "Kigali",
          province: "Kigali City",
          manager: "Jean Baptiste Uwimana",
          phone: "+250 788 123 456",
          email: "kigali.center@bk.rw",
          status: "active",
          totalCustomers: 2847,
          monthlyTransactions: 15420,
          monthlyRevenue: 450000000,
          openingHours: "8:00 AM - 5:00 PM",
          services: ["Banking", "Loans", "Foreign Exchange", "ATM"],
          lastUpdated: new Date().toISOString(),
        },
        {
          id: 2,
          name: "Nyarugenge Branch",
          code: "BK002",
          address: "KG 15 St, Nyarugenge",
          city: "Kigali",
          province: "Kigali City",
          manager: "Marie Mukamana",
          phone: "+250 788 234 567",
          email: "nyarugenge@bk.rw",
          status: "active",
          totalCustomers: 2156,
          monthlyTransactions: 12340,
          monthlyRevenue: 380000000,
          openingHours: "8:00 AM - 5:00 PM",
          services: ["Banking", "Loans", "ATM"],
          lastUpdated: new Date().toISOString(),
        },
        {
          id: 3,
          name: "Musanze Branch",
          code: "BK003",
          address: "Musanze District Center",
          city: "Musanze",
          province: "Northern Province",
          manager: "Paul Kagame Nzeyimana",
          phone: "+250 788 345 678",
          email: "musanze@bk.rw",
          status: "active",
          totalCustomers: 1432,
          monthlyTransactions: 8760,
          monthlyRevenue: 250000000,
          openingHours: "8:00 AM - 4:30 PM",
          services: ["Banking", "Loans", "ATM", "Mobile Banking"],
          lastUpdated: new Date().toISOString(),
        },
        {
          id: 4,
          name: "Huye Branch",
          code: "BK004",
          address: "University Road, Huye",
          city: "Huye",
          province: "Southern Province",
          manager: "Alice Mutoni",
          phone: "+250 788 456 789",
          email: "huye@bk.rw",
          status: "maintenance",
          totalCustomers: 1876,
          monthlyTransactions: 9850,
          monthlyRevenue: 290000000,
          openingHours: "Temporarily Closed",
          services: ["Banking", "Student Loans", "ATM"],
          lastUpdated: new Date().toISOString(),
        },
        {
          id: 5,
          name: "Rubavu Branch",
          code: "BK005",
          address: "Gisenyi Town Center",
          city: "Rubavu",
          province: "Western Province",
          manager: "Eric Bizimana",
          phone: "+250 788 567 890",
          email: "rubavu@bk.rw",
          status: "active",
          totalCustomers: 1654,
          monthlyTransactions: 7890,
          monthlyRevenue: 220000000,
          openingHours: "8:00 AM - 4:30 PM",
          services: ["Banking", "Foreign Exchange", "ATM"],
          lastUpdated: new Date().toISOString(),
        },
      ];

      setBranches(mockBranches);
    } catch (error) {
      console.error("Error fetching branch data:", error);
      toast.error("Failed to load branch data. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500/20 text-green-400">Active</Badge>;
      case "inactive":
        return <Badge className="bg-red-500/20 text-red-400">Inactive</Badge>;
      case "maintenance":
        return (
          <Badge className="bg-yellow-500/20 text-yellow-400">
            Maintenance
          </Badge>
        );
      default:
        return <Badge className="bg-gray-500/20 text-gray-400">Unknown</Badge>;
    }
  };

  const filteredBranches = branches.filter((branch) => {
    const matchesSearch =
      branch.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      branch.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      branch.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      branch.manager.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || branch.status === statusFilter;
    const matchesProvince =
      provinceFilter === "all" || branch.province === provinceFilter;
    return matchesSearch && matchesStatus && matchesProvince;
  });

  const totalCustomers = branches.reduce(
    (sum, branch) => sum + branch.totalCustomers,
    0
  );
  const totalRevenue = branches.reduce(
    (sum, branch) => sum + branch.monthlyRevenue,
    0
  );
  const activeBranches = branches.filter((b) => b.status === "active").length;

  return (
    <div className="flex min-h-screen flex-col bg-[#0a3977] text-white">
      <main className="flex-1 p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-semibold">Branch Management</h2>
          <p className="text-blue-200">
            Monitor and manage all bank branches across Rwanda
          </p>
        </div>

        {/* Summary Cards */}
        <div className="mb-6 grid gap-4 md:grid-cols-4">
          <Card className="bg-blue-800/50 text-white">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Building className="h-5 w-5 text-blue-300" />
                <div className="text-sm text-blue-200">Total Branches</div>
              </div>
              <div className="text-2xl font-bold">{branches.length}</div>
              <div className="text-xs text-blue-300">
                {activeBranches} active
              </div>
            </CardContent>
          </Card>
          <Card className="bg-blue-800/50 text-white">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-300" />
                <div className="text-sm text-blue-200">Total Customers</div>
              </div>
              <div className="text-2xl font-bold">
                {totalCustomers.toLocaleString()}
              </div>
            </CardContent>
          </Card>
          <Card className="bg-blue-800/50 text-white">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-blue-300" />
                <div className="text-sm text-blue-200">Monthly Revenue</div>
              </div>
              <div className="text-2xl font-bold">
                RWF {(totalRevenue / 1000000).toFixed(1)}M
              </div>
            </CardContent>
          </Card>
          <Card className="bg-blue-800/50 text-white">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-blue-300" />
                <div className="text-sm text-blue-200">Provinces Covered</div>
              </div>
              <div className="text-2xl font-bold">4</div>
              <div className="text-xs text-blue-300">All major provinces</div>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-blue-800/50 text-white">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>All Branches</CardTitle>
                <CardDescription className="text-blue-200">
                  Total: {branches.length} branches
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
                <Button className="bg-yellow-500 text-blue-900 hover:bg-yellow-400">
                  <Building className="mr-2 h-4 w-4" />
                  Add Branch
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="mb-6 flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-blue-300" />
                <Input
                  placeholder="Search by branch name, code, city, or manager..."
                  className="border-blue-700 bg-blue-900/50 pl-10 text-white placeholder:text-blue-300"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px] border-blue-700 bg-blue-900/50 text-white">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent className="bg-blue-900 text-white">
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                </SelectContent>
              </Select>
              <Select value={provinceFilter} onValueChange={setProvinceFilter}>
                <SelectTrigger className="w-[180px] border-blue-700 bg-blue-900/50 text-white">
                  <SelectValue placeholder="Province" />
                </SelectTrigger>
                <SelectContent className="bg-blue-900 text-white">
                  <SelectItem value="all">All Provinces</SelectItem>
                  <SelectItem value="Kigali City">Kigali City</SelectItem>
                  <SelectItem value="Northern Province">
                    Northern Province
                  </SelectItem>
                  <SelectItem value="Southern Province">
                    Southern Province
                  </SelectItem>
                  <SelectItem value="Western Province">
                    Western Province
                  </SelectItem>
                  <SelectItem value="Eastern Province">
                    Eastern Province
                  </SelectItem>
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
                <div className="text-blue-200">Loading branches...</div>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredBranches.map((branch) => (
                  <div
                    key={branch.id}
                    className="rounded-lg border border-blue-700 bg-blue-900/30 p-4"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-700/50">
                          <Building className="h-6 w-6 text-blue-300" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-lg">
                              {branch.name}
                            </h3>
                            <Badge className="bg-blue-500/20 text-blue-400">
                              {branch.code}
                            </Badge>
                            {getStatusBadge(branch.status)}
                          </div>
                          <div className="text-sm text-blue-200 mt-1">
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {branch.address}, {branch.city}, {branch.province}
                            </div>
                            <div className="mt-1">
                              Manager: {branch.manager}
                            </div>
                            <div>
                              Phone: {branch.phone} | Email: {branch.email}
                            </div>
                            <div>Hours: {branch.openingHours}</div>
                          </div>
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
                          <DropdownMenuItem>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Branch
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <MapPin className="mr-2 h-4 w-4" />
                            View on Map
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    <div className="grid gap-4 md:grid-cols-4">
                      <div className="rounded-lg border border-blue-700 bg-blue-800/30 p-3">
                        <div className="text-sm text-blue-200">Customers</div>
                        <div className="text-lg font-semibold">
                          {branch.totalCustomers.toLocaleString()}
                        </div>
                      </div>
                      <div className="rounded-lg border border-blue-700 bg-blue-800/30 p-3">
                        <div className="text-sm text-blue-200">
                          Monthly Transactions
                        </div>
                        <div className="text-lg font-semibold">
                          {branch.monthlyTransactions.toLocaleString()}
                        </div>
                      </div>
                      <div className="rounded-lg border border-blue-700 bg-blue-800/30 p-3">
                        <div className="text-sm text-blue-200">
                          Monthly Revenue
                        </div>
                        <div className="text-lg font-semibold">
                          RWF {(branch.monthlyRevenue / 1000000).toFixed(1)}M
                        </div>
                      </div>
                      <div className="rounded-lg border border-blue-700 bg-blue-800/30 p-3">
                        <div className="text-sm text-blue-200">Services</div>
                        <div className="text-sm font-medium">
                          {branch.services.length} services
                        </div>
                        <div className="text-xs text-blue-300 mt-1">
                          {branch.services.slice(0, 2).join(", ")}
                          {branch.services.length > 2 &&
                            ` +${branch.services.length - 2} more`}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
