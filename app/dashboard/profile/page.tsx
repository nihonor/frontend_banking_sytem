"use client";

import { useState, useEffect } from "react";
import {
  Bell,
  ChevronDown,
  Edit,
  Mail,
  MapPin,
  Phone,
  Save,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { apiClient } from "@/lib/api";

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();
  const [userProfile, setUserProfile] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    dateOfBirth: "",
    nationality: "",
    occupation: "",
    idNumber: "",
    avatarUrl: "/profile-image.jpg",
  });

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (!userId) {
      router.push("/");
      return;
    }

    fetchUserProfile(parseInt(userId));
  }, [router]);

  const fetchUserProfile = async (userId: number) => {
    try {
      setLoading(true);
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

      if (!response.ok) {
        throw new Error("Failed to fetch user profile");
      }

      const data = await response.json();
      setUserProfile({
        name: `${data.firstName} ${data.lastName}`,
        email: data.email,
        phone: data.phoneNumber || "",
        address: data.address || "",
        dateOfBirth: data.dateOfBirth || "",
        nationality: data.nationality || "",
        occupation: data.occupation || "",
        idNumber: data.nationalId || "",
        avatarUrl: data.avatarUrl || "/profile-image.jpg",
      });
    } catch (err) {
      console.error("Error fetching user profile:", err);
      setError("Failed to load profile data");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveChanges = async () => {
    try {
      const userId = localStorage.getItem("userId");
      if (!userId) return;

      const response = await fetch(
        `http://localhost:8080/api/users/${userId}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            firstName: userProfile.name.split(" ")[0],
            lastName: userProfile.name.split(" ")[1] || "",
            email: userProfile.email,
            phoneNumber: userProfile.phone,
            address: userProfile.address,
            dateOfBirth: userProfile.dateOfBirth,
            nationality: userProfile.nationality,
            occupation: userProfile.occupation,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update profile");
      }

      setIsEditing(false);
      // Refresh the profile data
      fetchUserProfile(parseInt(userId));
    } catch (err) {
      console.error("Error updating profile:", err);
      setError("Failed to update profile");
    }
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-blue-200">Loading profile...</div>
      </div>
    );
  }

  return (
    <main className="flex-1 p-6">
      {error && (
        <div className="mb-4 rounded-lg bg-red-100 p-4 text-red-700">
          {error}
        </div>
      )}
      <div className="mb-6">
        <h2 className="text-2xl font-semibold">My Profile</h2>
        <p className="text-blue-200">Manage your personal information</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div>
          <Card className="bg-blue-800/50 text-white">
            <CardContent className="flex flex-col items-center justify-center p-6">
              <div className="relative mb-4 h-32 w-32 overflow-hidden rounded-full border-4 border-blue-700">
                <Image
                  src={userProfile.avatarUrl}
                  alt={userProfile.name}
                  fill
                  className="object-cover"
                  priority
                />
              </div>
              <h3 className="mb-1 text-xl font-semibold">{userProfile.name}</h3>
              <p className="mb-4 text-blue-200">Customer since 2020</p>
              <Button className="mb-2 w-full bg-yellow-500 text-blue-900 hover:bg-yellow-400">
                <Edit className="mr-2 h-4 w-4" />
                Change Photo
              </Button>
              <div className="mt-6 w-full space-y-3">
                <div className="flex items-center gap-3 rounded-lg border border-blue-700 bg-blue-900/30 p-3">
                  <Mail className="h-5 w-5 text-blue-300" />
                  <div>
                    <div className="text-xs text-blue-200">Email</div>
                    <div>{userProfile.email}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-lg border border-blue-700 bg-blue-900/30 p-3">
                  <Phone className="h-5 w-5 text-blue-300" />
                  <div>
                    <div className="text-xs text-blue-200">Phone</div>
                    <div>{userProfile.phone}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-lg border border-blue-700 bg-blue-900/30 p-3">
                  <MapPin className="h-5 w-5 text-blue-300" />
                  <div>
                    <div className="text-xs text-blue-200">Address</div>
                    <div>{userProfile.address}</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2">
          <Tabs defaultValue="personal" className="w-full">
            <TabsList className="bg-blue-900/50">
              <TabsTrigger
                value="personal"
                className="data-[state=active]:bg-blue-800"
              >
                Personal Information
              </TabsTrigger>
              <TabsTrigger
                value="preferences"
                className="data-[state=active]:bg-blue-800"
              >
                Preferences
              </TabsTrigger>
              <TabsTrigger
                value="documents"
                className="data-[state=active]:bg-blue-800"
              >
                Documents
              </TabsTrigger>
            </TabsList>

            <TabsContent value="personal" className="mt-4">
              <Card className="bg-blue-800/50 text-white">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Personal Information</CardTitle>
                    <CardDescription className="text-blue-200">
                      Your personal details
                    </CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    className="border-blue-400 text-white hover:bg-blue-800"
                    onClick={() => {
                      if (isEditing) {
                        handleSaveChanges();
                      } else {
                        setIsEditing(true);
                      }
                    }}
                  >
                    {isEditing ? (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Save Changes
                      </>
                    ) : (
                      <>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Profile
                      </>
                    )}
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Full Name</Label>
                      <Input
                        id="fullName"
                        value={userProfile.name}
                        onChange={(e) =>
                          setUserProfile({
                            ...userProfile,
                            name: e.target.value,
                          })
                        }
                        readOnly={!isEditing}
                        className="border-blue-700 bg-blue-900/50 text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        value={userProfile.email}
                        onChange={(e) =>
                          setUserProfile({
                            ...userProfile,
                            email: e.target.value,
                          })
                        }
                        readOnly={!isEditing}
                        className="border-blue-700 bg-blue-900/50 text-white"
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        value={userProfile.phone}
                        onChange={(e) =>
                          setUserProfile({
                            ...userProfile,
                            phone: e.target.value,
                          })
                        }
                        readOnly={!isEditing}
                        className="border-blue-700 bg-blue-900/50 text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="dob">Date of Birth</Label>
                      <Input
                        id="dob"
                        value={userProfile.dateOfBirth}
                        readOnly={!isEditing}
                        className="border-blue-700 bg-blue-900/50 text-white"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      value={userProfile.address}
                      readOnly={!isEditing}
                      className="border-blue-700 bg-blue-900/50 text-white"
                    />
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="nationality">Nationality</Label>
                      <Input
                        id="nationality"
                        value={userProfile.nationality}
                        readOnly={!isEditing}
                        className="border-blue-700 bg-blue-900/50 text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="occupation">Occupation</Label>
                      <Input
                        id="occupation"
                        value={userProfile.occupation}
                        readOnly={!isEditing}
                        className="border-blue-700 bg-blue-900/50 text-white"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="idNumber">ID Number</Label>
                    <Input
                      id="idNumber"
                      value={userProfile.idNumber}
                      readOnly={true}
                      className="border-blue-700 bg-blue-900/50 text-white"
                    />
                    <p className="text-xs text-blue-200">
                      ID Number cannot be changed. Please visit a branch with
                      your ID to update.
                    </p>
                  </div>
                </CardContent>
                <CardFooter className="border-t border-blue-700 pt-4">
                  <p className="text-sm text-blue-200">
                    Last updated: May 15, 2025
                  </p>
                </CardFooter>
              </Card>
            </TabsContent>

            <TabsContent value="preferences">
              <Card className="bg-blue-800/50 text-white">
                <CardHeader>
                  <CardTitle>Preferences</CardTitle>
                  <CardDescription className="text-blue-200">
                    Manage your account preferences
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex h-40 items-center justify-center">
                    <p className="text-blue-200">
                      Preferences settings would go here
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="documents">
              <Card className="bg-blue-800/50 text-white">
                <CardHeader>
                  <CardTitle>Documents</CardTitle>
                  <CardDescription className="text-blue-200">
                    Your uploaded documents
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex h-40 items-center justify-center">
                    <p className="text-blue-200">
                      Document management would go here
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </main>
  );
}
