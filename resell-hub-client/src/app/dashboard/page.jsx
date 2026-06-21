"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";

export default function DashboardPage() {
  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (session?.user?.role) {
      const role = session.user.role;
      
      if (role === "buyer") {
        router.replace("/dashboard/buyer");
      } else if (role === "seller") {
        router.replace("/dashboard/seller");
      } else if (role === "admin") {
        router.replace("/dashboard/admin");
      } else {
        router.replace("/");
      }
    } else {
      router.replace("/auth/signin");
    }
  }, [session, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto"></div>
        <p className="mt-4 text-gray-500">Redirecting...</p>
      </div>
    </div>
  );
}