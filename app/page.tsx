"use client";

import type React from "react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Landmark, Lock, Mail } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Check if user was redirected from registration
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has("registered")) {
      setSuccess(
        "Registration successful! Please login with your new account."
      );
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mounted) return;

    setError("");
    setLoading(true);

    try {
      const response = await fetch("http://localhost:8080/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
        credentials: "include",
      });

      let data;
      try {
        data = await response.json();
      } catch (jsonError) {
        console.error("Error parsing response:", jsonError);
        setError("Server error. Please try again.");
        return;
      }

      if (response.ok && data.token) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("userRole", data.role);
        localStorage.setItem("userId", data.id);

        if (data.role === "ADMIN") {
          router.push("/admin/home");
        } else {
          router.push("/dashboard/home");
        }
      } else {
        setError(
          data.message || "Login failed. Please check your credentials."
        );
      }
    } catch (err) {
      console.error("Network error:", err);
      setError("Network error. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) {
    return null;
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#0a3977] p-4">
      <div className="mb-8 flex items-center gap-2">
        <Landmark className="h-10 w-10 text-white" />
        <h1 className="text-3xl font-bold text-white">BANK OF KIGALI</h1>
      </div>

      <Card className="w-full max-w-md bg-blue-800/50 text-white">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            Welcome Back
          </CardTitle>
          <CardDescription className="text-center text-blue-200">
            Enter your credentials to access your account
          </CardDescription>
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
              {success}
            </div>
          )}
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username or Customer ID</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-blue-300" />
                <Input
                  id="username"
                  name="username"
                  type="text"
                  placeholder="Enter your username"
                  className="border-blue-700 bg-blue-900/50 pl-10 text-white placeholder:text-blue-300"
                  value={formData.username}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      username: e.target.value,
                    }))
                  }
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link
                  href="/forgot-password"
                  className="text-sm text-blue-200 underline-offset-4 hover:text-white hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-blue-300" />
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="border-blue-700 bg-blue-900/50 pl-10 pr-10 text-white placeholder:text-blue-300"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      password: e.target.value,
                    }))
                  }
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 text-blue-300 hover:text-white"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                  <span className="sr-only">
                    {showPassword ? "Hide password" : "Show password"}
                  </span>
                </Button>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="remember"
                checked={rememberMe}
                onCheckedChange={(checked) => setRememberMe(checked as boolean)}
              />
              <Label htmlFor="remember" className="text-sm font-normal">
                Remember me for 30 days
              </Label>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button
              type="submit"
              className="w-full bg-yellow-500 text-blue-900 hover:bg-yellow-400"
              disabled={loading || !mounted}
            >
              {loading ? "Signing in..." : "Sign In"}
            </Button>
            <div className="text-center text-sm text-blue-200">
              Don&apos;t have an account?{" "}
              {/* <Link
                href="/register"
                className="font-medium text-white underline-offset-4 hover:underline"
              >
                Sign up
              </Link> */}
            </div>
          </CardFooter>
        </form>
      </Card>

      <div className="mt-8 text-center text-sm text-blue-200">
        <p>© 2025 Bank of Kigali. All rights reserved.</p>
        <div className="mt-2 flex justify-center gap-4">
          <Link href="#" className="hover:text-white">
            Terms
          </Link>
          <Link href="#" className="hover:text-white">
            Privacy
          </Link>
          <Link href="#" className="hover:text-white">
            Security
          </Link>
        </div>
      </div>
    </div>
  );
}
