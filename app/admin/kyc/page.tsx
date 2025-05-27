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
  Check,
  X,
  Clock,
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
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { apiClient, type User } from "@/lib/api";

interface KYCDocument {
  id: number;
  userId: number;
  documentType: string;
  documentNumber: string;
  status: "pending" | "approved" | "rejected";
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  comments?: string;
}

export default function KYCPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [users, setUsers] = useState<User[]>([]);
  const [kycDocuments, setKycDocuments] = useState<KYCDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchKYCData();
  }, []);

  const fetchKYCData = async () => {
    try {
      setIsLoading(true);
      const allUsers = await apiClient.getAllUsers();
      setUsers(allUsers);

      // Mock KYC documents - in real app, this would come from backend
      const mockKYCDocs: KYCDocument[] = allUsers.map((user, index) => ({
        id: index + 1,
        userId: user.id,
        documentType: ["National ID", "Passport", "Driving License"][index % 3],
        documentNumber: `DOC${String(user.id).padStart(6, "0")}`,
        status: ["pending", "approved", "rejected"][index % 3] as any,
        submittedAt: new Date(
          Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000
        ).toISOString(),
        reviewedAt: index % 3 !== 0 ? new Date().toISOString() : undefined,
        reviewedBy: index % 3 !== 0 ? "Admin User" : undefined,
        comments: index % 3 === 2 ? "Document quality insufficient" : undefined,
      }));
      setKycDocuments(mockKYCDocs);
    } catch (error) {
      console.error("Error fetching KYC data:", error);
      toast.error("Failed to load KYC data. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKYCAction = async (
    documentId: number,
    action: "approve" | "reject",
    comments?: string
  ) => {
    try {
      setKycDocuments((prev) =>
        prev.map((doc) =>
          doc.id === documentId
            ? {
                ...doc,
                status: action === "approve" ? "approved" : "rejected",
                reviewedAt: new Date().toISOString(),
                reviewedBy: "Admin User",
                comments: comments || doc.comments,
              }
            : doc
        )
      );

      toast.success(
        `Document has been ${
          action === "approve" ? "approved" : "rejected"
        } successfully.`
      );
    } catch (error) {
      console.error("Error updating KYC status:", error);
      toast.error("Failed to update KYC status. Please try again.");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return (
          <Badge className="bg-green-500/20 text-green-400">Approved</Badge>
        );
      case "rejected":
        return <Badge className="bg-red-500/20 text-red-400">Rejected</Badge>;
      case "pending":
        return (
          <Badge className="bg-yellow-500/20 text-yellow-400">Pending</Badge>
        );
      default:
        return <Badge className="bg-gray-500/20 text-gray-400">Unknown</Badge>;
    }
  };

  const getUserById = (userId: number) =>
    users.find((user) => user.id === userId);

  const filteredDocuments = kycDocuments.filter((doc) => {
    const user = getUserById(doc.userId);
    const matchesSearch =
      user?.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.documentNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || doc.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="flex min-h-screen flex-col bg-[#0a3977] text-white">
      <main className="flex-1 p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-semibold">KYC Verification</h2>
          <p className="text-blue-200">
            Review and manage customer identity verification documents
          </p>
        </div>

        <Card className="bg-blue-800/50 text-white">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>KYC Documents</CardTitle>
                <CardDescription className="text-blue-200">
                  Total: {kycDocuments.length} documents | Pending:{" "}
                  {kycDocuments.filter((d) => d.status === "pending").length}
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="border-blue-400 text-black hover:bg-blue-800"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="mb-6 flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-blue-300" />
                <Input
                  placeholder="Search by customer name or document number..."
                  className="border-blue-700 bg-blue-900/50 pl-10 text-white placeholder:text-blue-300"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px] border-blue-700 bg-blue-900/50 text-white">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent className="bg-blue-900 text-white">
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
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
                <div className="text-blue-200">Loading KYC documents...</div>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredDocuments.map((document) => {
                  const user = getUserById(document.userId);
                  return (
                    <div
                      key={document.id}
                      className="flex items-center justify-between rounded-lg border border-blue-700 bg-blue-900/30 p-4"
                    >
                      <div className="flex items-center gap-4">
                        <Avatar className="h-12 w-12 bg-blue-700 text-white">
                          <AvatarFallback>
                            {user?.username.substring(0, 2).toUpperCase() ||
                              "??"}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold">
                              {user?.username || "Unknown User"}
                            </h3>
                            {getStatusBadge(document.status)}
                          </div>
                          <div className="text-sm text-blue-200">
                            {document.documentType} • {document.documentNumber}
                          </div>
                          <div className="text-xs text-blue-300">
                            Submitted:{" "}
                            {new Date(
                              document.submittedAt
                            ).toLocaleDateString()}
                            {document.reviewedAt && (
                              <>
                                {" "}
                                • Reviewed:{" "}
                                {new Date(
                                  document.reviewedAt
                                ).toLocaleDateString()}
                              </>
                            )}
                          </div>
                          {document.comments && (
                            <div className="text-xs text-red-300 mt-1">
                              Comments: {document.comments}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {document.status === "pending" && (
                          <>
                            <Button
                              size="sm"
                              className="bg-green-600 hover:bg-green-700"
                              onClick={() =>
                                handleKYCAction(document.id, "approve")
                              }
                            >
                              <Check className="mr-1 h-4 w-4" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() =>
                                handleKYCAction(
                                  document.id,
                                  "reject",
                                  "Document review failed"
                                )
                              }
                            >
                              <X className="mr-1 h-4 w-4" />
                              Reject
                            </Button>
                          </>
                        )}
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
                              View Document
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Clock className="mr-2 h-4 w-4" />
                              View History
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
