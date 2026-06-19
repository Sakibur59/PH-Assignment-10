
"use client";

import Link from "next/link";
import { Button, Card } from "@heroui/react";

export default function PaymentCancel() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <Card className="max-w-md w-full p-8 text-center">
        <div className="text-6xl mb-4">😕</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Payment Cancelled
        </h1>
        <p className="text-gray-600 mb-2">
          Your payment was cancelled. Don't worry, no charges were made.
        </p>
        <p className="text-sm text-gray-500 mb-6">
          You can try again or continue shopping.
        </p>
        <div className="flex flex-col gap-3">
          <Link href="/products">
            <Button className="w-full bg-emerald-500 text-white hover:bg-emerald-600">
              Continue Shopping
            </Button>
          </Link>
          <Link href="/">
            <Button variant="bordered" className="w-full">
              Go to Home
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}