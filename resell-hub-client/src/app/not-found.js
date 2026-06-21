"use client";

import Link from "next/link";
import { Button } from "@heroui/react";
import { Home, Search, ArrowLeft, Package } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center">
        {/* 404 Illustration */}
        <div className="relative mx-auto w-32 h-32 mb-6">
          <div className="absolute inset-0 bg-blue-100 rounded-full animate-pulse"></div>
          <div className="relative w-32 h-32 bg-blue-100 rounded-full flex items-center justify-center">
            <span className="text-5xl font-bold text-blue-500">404</span>
          </div>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Page Not Found
        </h1>

        <p className="text-gray-600 mb-6">
          Oops! The page you're looking for doesn't exist or has been moved.
        </p>

        {/* Search Suggestions */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <p className="text-sm text-gray-600 mb-2">You might want to check:</p>
          <div className="flex flex-wrap gap-2 justify-center">
            <Link href="/products" className="text-sm text-emerald-600 hover:underline">
              Products
            </Link>
            <span className="text-gray-300">•</span>
            <Link href="/categories" className="text-sm text-emerald-600 hover:underline">
              Categories
            </Link>
            <span className="text-gray-300">•</span>
            <Link href="/about" className="text-sm text-emerald-600 hover:underline">
              About Us
            </Link>
            <span className="text-gray-300">•</span>
            <Link href="/contact" className="text-sm text-emerald-600 hover:underline">
              Contact
            </Link>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Link href="/" className="block">
            <Button
              className="w-full bg-emerald-500 text-white hover:bg-emerald-600 h-12 text-base"
              startContent={<Home className="w-5 h-5" />}
            >
              Go to Homepage
            </Button>
          </Link>

          <div className="flex gap-3">
            <Link href="/products" className="flex-1">
              <Button
                variant="bordered"
                className="w-full border-emerald-200 text-gray-700 hover:bg-emerald-50 h-12 text-base"
                startContent={<Package className="w-5 h-5" />}
              >
                Browse Products
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

        <p className="text-xs text-gray-400 mt-6">
          Can't find what you're looking for?{" "}
          <Link href="/products" className="text-emerald-600 hover:underline font-medium">
            Search all products
          </Link>
        </p>
      </div>
    </div>
  );
}