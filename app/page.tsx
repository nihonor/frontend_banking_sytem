"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { CiLock } from "react-icons/ci";

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

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
          router.push("/admin");
        } else {
          router.push("/dashboard");
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
    <div className=" bg-[url('/bk_house.jpg')] bg-no-repeat  bg-cover">
      <div className="min-h-screen flex items-center justify-center">
        {/*    */}

        <nav className="fixed top-0 left-0 right-0 bg-gray-200  p-6 shadow-md flex justify-between px-7">
          <Image src="/bk.png" alt="logo" width={250} height={300} />
        </nav>

        <div className="bg-blue-500 p-8 w-1/4 h-full ">
          <h1 className="text-white text-3xl">Sign in to Internet Banking</h1>
          <div className="text-white pr-10 text-2xl">
            <p>State of the Art</p>
            <p> Banking Experience </p>
            <p>At Your Fingertips</p>
          </div>
          <div className="text-gray-300 flex items-center gap-2 py-6">
            <CiLock /> You are logging in to a safe and secure platform
          </div>
        </div>

        <div className="bg-white p-8 w-1/4">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-gray-400"
              >
                Username
              </label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className="mt-1 block w-full  border-b border-gray-300 focus:border-blue-500 focus:ring-blue-500 px-2"
                required
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-400"
              >
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="mt-1 block w-full border-b border-gray-300  focus:border-blue-500 focus:ring-blue-500  px-2"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading || !mounted}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 font-light"
            >
              {loading ? "Logging in..." : "SIGN IN"}
            </button>
          </form>

          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{" "}
              <a
                href="/register"
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                Register here
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
