// app/blocked/page.jsx
"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@heroui/react";
import { useRouter } from "next/navigation";
import { signOut } from "@/lib/auth-client";
import { ShieldAlert, Home, LogOut } from "lucide-react";
import toast from "react-hot-toast";

export default function BlockedPage() {
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success("Signed out successfully");
      router.push("/");
      router.refresh();
    } catch (error) {
      toast.error("Failed to sign out");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center">
        {/* Blocked Icon */}
        <div className="relative mx-auto w-24 h-24 mb-6">
          <div className="absolute inset-0 bg-red-100 rounded-full animate-pulse"></div>
          <div className="relative w-24 h-24 bg-red-100 rounded-full flex items-center justify-center">
            <ShieldAlert className="w-12 h-12 text-red-500 animate-bounce" />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Account Blocked
        </h1>

        <p className="text-gray-600 mb-6">
          Your account has been blocked by the administrator. You cannot access the dashboard or perform any actions on the platform.
        </p>

        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-left">
          <p className="text-sm text-red-700">
            <span className="font-semibold">Reason:</span> Your account was blocked due to violation of our terms of service.
          </p>
          <p className="text-xs text-red-600 mt-2">
            If you believe this is a mistake, please contact our support team.
          </p>
        </div>

        <div className="space-y-3">
          <Button
            onClick={handleSignOut}
            className="w-full bg-red-500 text-white hover:bg-red-600 h-12 text-base"
            startContent={<LogOut className="w-5 h-5" />}
          >
            Sign Out
          </Button>

          <Link href="/" className="block">
            <Button
              variant="bordered"
              className="w-full border-emerald-200 text-gray-700 hover:bg-emerald-50 h-12 text-base"
              startContent={<Home className="w-5 h-5" />}
            >
              Go to Homepage
            </Button>
          </Link>
        </div>

        <p className="text-xs text-gray-400 mt-6">
          Need help?{" "}
          <Link href="/contact" className="text-emerald-600 hover:underline font-medium">
            Contact Support
          </Link>
        </p>
      </div>
    </div>
  );
}