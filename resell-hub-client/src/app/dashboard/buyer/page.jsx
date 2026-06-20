"use client";

import { useState, useEffect } from "react";
import { useSession } from "@/lib/auth-client";

import { Spinner } from "@heroui/react";
import Link from "next/link";
import { ShoppingBag, Heart, CreditCard, TrendingUp } from "lucide-react";
import { getOrders } from "@/lib/api/orders";
import { getWishlist } from "@/lib/api/wishlist";
import { getUserPayments } from "@/lib/api/payments";

export default function BuyerOverview() {
  const { data: session } = useSession();
  const [stats, setStats] = useState({
    totalOrders: 0,
    wishlistCount: 0,
    totalSpent: 0,
    pendingOrders: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const userId = session?.user?.id;

        const ordersData = await getOrders(userId);
        const wishlistData = await getWishlist(userId);
        const paymentsData = await getUserPayments(userId);

        let orders = ordersData.success ? ordersData.data || [] : [];
        let wishlist = wishlistData.success ? wishlistData.data || [] : [];
        let payments = paymentsData.success ? paymentsData.data || [] : [];

        setStats({
          totalOrders: orders.length,
          wishlistCount: wishlist.length,
          totalSpent: payments.reduce((sum, p) => sum + p.amount, 0),
          pendingOrders: orders.filter(o => o.orderStatus === "pending").length,
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    };

    if (session?.user?.id) {
      fetchStats();
    }
  }, [session]);

  const statCards = [
    { label: "Total Orders", value: stats.totalOrders, icon: ShoppingBag, color: "bg-blue-500" },
    { label: "Wishlist Items", value: stats.wishlistCount, icon: Heart, color: "bg-red-500" },
    { label: "Total Spent", value: `BDT ${stats.totalSpent.toLocaleString()}`, icon: CreditCard, color: "bg-green-500" },
    { label: "Pending Orders", value: stats.pendingOrders, icon: TrendingUp, color: "bg-amber-500" },
  ];

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner color="success" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Buyer Dashboard</h1>
        <p className="text-gray-500 mt-1">Manage your orders, wishlist, and payments</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                </div>
                <div className={`w-12 h-12 rounded-lg ${stat.color} bg-opacity-10 flex items-center justify-center`}>
                  <Icon className={`w-6 h-6 ${stat.color.replace("bg-", "text-")}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <Link href="/dashboard/buyer/orders" className="p-4 bg-gray-50 rounded-lg hover:bg-emerald-50 transition text-center">
            <ShoppingBag className="w-6 h-6 mx-auto text-gray-600" />
            <span className="text-sm text-gray-700 mt-2 block">My Orders</span>
          </Link>
          <Link href="/dashboard/buyer/wishlist" className="p-4 bg-gray-50 rounded-lg hover:bg-emerald-50 transition text-center">
            <Heart className="w-6 h-6 mx-auto text-gray-600" />
            <span className="text-sm text-gray-700 mt-2 block">Wishlist</span>
          </Link>
          <Link href="/dashboard/buyer/payments" className="p-4 bg-gray-50 rounded-lg hover:bg-emerald-50 transition text-center">
            <CreditCard className="w-6 h-6 mx-auto text-gray-600" />
            <span className="text-sm text-gray-700 mt-2 block">Payment History</span>
          </Link>
        </div>
      </div>
    </div>
  );
}