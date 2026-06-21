"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@heroui/react";
import { AlertTriangle, Home, RefreshCw, ArrowLeft } from "lucide-react";

export default function Error({ error, reset }) {
  useEffect(() => {
    console.error("Application Error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center">
        {/* Error Icon */}
        <div className="relative mx-auto w-24 h-24 mb-6">
          <div className="absolute inset-0 bg-red-100 rounded-full animate-pulse"></div>
          <div className="relative w-24 h-24 bg-red-100 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-12 h-12 text-red-500 animate-bounce" />
          </div>
        </div>

        {/* Error Code */}
        <div className="mb-2">
          <span className="inline-block bg-red-100 text-red-700 text-xs font-semibold px-3 py-1 rounded-full">
            Error {error?.status || 500}
          </span>
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Oops! Something Went Wrong
        </h1>

        {/* Description */}
        <p className="text-gray-600 mb-6">
          We're sorry, but an unexpected error occurred. Our team has been
          notified and is working on a fix.
        </p>

        {/* Error Details (if available) */}
        {error?.message && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-6 text-left">
            <p className="text-xs text-red-600 font-mono break-all">
              {error.message}
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button
            onPress={reset}
            className="w-full bg-emerald-500 text-white hover:bg-emerald-600 h-12 text-base"
            startContent={<RefreshCw className="w-5 h-5" />}
          >
            Try Again
          </Button>

          <div className="flex gap-3">
            <Link href="/" className="flex-1">
              <Button
                variant="bordered"
                className="w-full border-emerald-200 text-gray-700 hover:bg-emerald-50 h-12 text-base"
                startContent={<Home className="w-5 h-5" />}
              >
                Go Home
              </Button>
            </Link>

            <Button
              variant="bordered"
              className="flex-1 border-gray-200 text-gray-700 hover:bg-gray-50 h-12 text-base"
              startContent={<ArrowLeft className="w-5 h-5" />}
              onPress={() => window.history.back()}
            >
              Go Back
            </Button>
          </div>
        </div>

        {/* Support Link */}
        <p className="text-xs text-gray-400 mt-6">
          Need help?{" "}
          <Link
            href="/contact"
            className="text-emerald-600 hover:underline font-medium"
          >
            Contact Support
          </Link>
        </p>
      </div>
    </div>
  );
}
