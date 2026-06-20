
"use client";

import { useState, useEffect } from "react";
import { useSession } from "@/lib/auth-client";
import { getSellerStats } from "@/lib/api/seller";
import { Spinner } from "@heroui/react";
import Link from "next/link";
import { Package, ShoppingBag, DollarSign, Clock, PlusCircle, ClipboardList, TrendingUp } from "lucide-react";

export default function SellerOverview() {
  const { data: session } = useSession();
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    completedOrders: 0,
    pendingOrders: 0,
    totalRevenue: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await getSellerStats(session?.user?.id);
        if (data.success) {
          setStats(data.data);
        }
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
    { label: "Total Products", value: stats.totalProducts, icon: Package, color: "bg-purple-500" },
    { label: "Total Orders", value: stats.totalOrders, icon: ShoppingBag, color: "bg-blue-500" },
    { label: "Total Revenue", value: `BDT ${stats.totalRevenue.toLocaleString()}`, icon: DollarSign, color: "bg-green-500" },
    { label: "Pending Orders", value: stats.pendingOrders, icon: Clock, color: "bg-amber-500" },
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
        <h1 className="text-2xl font-bold text-gray-900">Seller Dashboard</h1>
        <p className="text-gray-500 mt-1">Manage your products, orders, and sales</p>
      </div>

      {/* Stats Cards */}
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

      {/* Quick Actions */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <Link
            href="/dashboard/seller/add-product"
            className="p-4 bg-gray-50 rounded-lg hover:bg-emerald-50 transition text-center"
          >
            <PlusCircle className="w-6 h-6 mx-auto text-gray-600" />
            <span className="text-sm text-gray-700 mt-2 block">Add Product</span>
          </Link>
          <Link
            href="/dashboard/seller/my-products"
            className="p-4 bg-gray-50 rounded-lg hover:bg-emerald-50 transition text-center"
          >
            <Package className="w-6 h-6 mx-auto text-gray-600" />
            <span className="text-sm text-gray-700 mt-2 block">My Products</span>
          </Link>
          <Link
            href="/dashboard/seller/manage-orders"
            className="p-4 bg-gray-50 rounded-lg hover:bg-emerald-50 transition text-center"
          >
            <ClipboardList className="w-6 h-6 mx-auto text-gray-600" />
            <span className="text-sm text-gray-700 mt-2 block">Manage Orders</span>
          </Link>
        </div>
      </div>
    </div>
  );
}