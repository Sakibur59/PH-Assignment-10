"use client";

import { useState, useEffect } from "react";
import { useSession } from "@/lib/auth-client";
import { getAdminStats } from "@/lib/api/admin";
import { Spinner } from "@heroui/react";
import Link from "next/link";
import {
  Users,
  Package,
  ShoppingBag,
  DollarSign,
  TrendingUp,
  UserCheck,
  Clock,
} from "lucide-react";

export default function AdminOverview() {
  const { data: session } = useSession();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    activeUsersCount: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await getAdminStats();
        if (data.success) {
          setStats(data.data);
        }
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statCards = [
    {
      label: "Total Users",
      value: stats.totalUsers,
      icon: Users,
      color: "bg-purple-500",
    },
    {
      label: "Active Users",
      value: stats.activeUsersCount,
      icon: UserCheck,
      color: "bg-green-500",
    },
    {
      label: "Total Products",
      value: stats.totalProducts,
      icon: Package,
      color: "bg-blue-500",
    },
    {
      label: "Total Orders",
      value: stats.totalOrders,
      icon: ShoppingBag,
      color: "bg-amber-500",
    },
    {
      label: "Pending Orders",
      value: stats.pendingOrders,
      icon: Clock,
      color: "bg-red-500",
    },
    {
      label: "Total Revenue",
      value: `BDT ${stats.totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      color: "bg-emerald-500",
    },
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
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-500 mt-1">
          Manage users, products, and platform analytics
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500">{stat.label}</p>
                  <p className="text-[16px] font-bold text-gray-900 mt-1">
                    {stat.value}
                  </p>
                </div>
                <div
                  className={`w-10 h-10 rounded-lg ${stat.color} bg-opacity-10 flex items-center justify-center`}
                >
                  <Icon
                    className={`w-5 h-5 ${stat.color.replace("bg-", "text-900")}`}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Link
            href="/dashboard/admin/manage-users"
            className="p-4 bg-gray-50 rounded-lg hover:bg-emerald-50 transition text-center"
          >
            <Users className="w-6 h-6 mx-auto text-gray-900" />
            <span className="text-sm text-gray-700 mt-2 block">
              Manage Users
            </span>
          </Link>
          <Link
            href="/dashboard/admin/manage-products"
            className="p-4 bg-gray-50 rounded-lg hover:bg-emerald-50 transition text-center"
          >
            <Package className="w-6 h-6 mx-auto text-gray-900" />
            <span className="text-sm text-gray-700 mt-2 block">
              Manage Products
            </span>
          </Link>
          <Link
            href="/dashboard/admin/manage-orders"
            className="p-4 bg-gray-50 rounded-lg hover:bg-emerald-50 transition text-center"
          >
            <ShoppingBag className="w-6 h-6 mx-auto text-gray-900" />
            <span className="text-sm text-gray-700 mt-2 block">
              Manage Orders
            </span>
          </Link>
          <Link
            href="/dashboard/admin/platform-analytics"
            className="p-4 bg-gray-50 rounded-lg hover:bg-emerald-50 transition text-center"
          >
            <TrendingUp className="w-6 h-6 mx-auto text-gray-900" />
            <span className="text-sm text-gray-700 mt-2 block">Analytics</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
