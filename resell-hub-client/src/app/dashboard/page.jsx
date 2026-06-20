"use client";

import { useState, useEffect } from "react";
import { useSession } from "@/lib/auth-client";
import { getOrders } from "@/lib/api/orders";
import { getWishlist } from "@/lib/api/wishlist";
import { getUserPayments } from "@/lib/api/payments";
import Link from "next/link";
import { Spinner } from "@heroui/react";
import { 
  ShoppingBag, 
  Heart, 
  CreditCard, 
  Package,
  ArrowRight,
  User
} from "lucide-react";

export default function DashboardOverview() {
  const { data: session } = useSession();
  const user = session?.user;
  const role = user?.role || "buyer";
  
  const [stats, setStats] = useState({
    totalOrders: 0,
    wishlistCount: 0,
    totalSpent: 0,
    recentOrders: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const userId = session?.user?.id;

        // Fetch orders
        const ordersData = await getOrders(userId);
        const wishlistData = await getWishlist(userId);
        const paymentsData = await getUserPayments(userId);

        let orders = [];
        if (ordersData.success) {
          orders = ordersData.data || [];
        }

        let wishlist = [];
        if (wishlistData.success) {
          wishlist = wishlistData.data || [];
        }

        let payments = [];
        if (paymentsData.success) {
          payments = paymentsData.data || [];
        }

        // Calculate total spent
        const totalSpent = payments.reduce((sum, p) => sum + p.amount, 0);

        // Get recent orders (last 3)
        const recentOrders = orders.slice(0, 3);

        setStats({
          totalOrders: orders.length,
          wishlistCount: wishlist.length,
          totalSpent: totalSpent,
          recentOrders: recentOrders,
        });
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (session?.user?.id) {
      fetchDashboardData();
    }
  }, [session]);

  const getStatsCards = () => {
    if (role === "buyer") {
      return [
        { label: "Total Orders", value: stats.totalOrders, icon: ShoppingBag, color: "bg-blue-500" },
        { label: "Wishlist Items", value: stats.wishlistCount, icon: Heart, color: "bg-red-500" },
        { label: "Total Spent", value: `BDT ${stats.totalSpent.toLocaleString()}`, icon: CreditCard, color: "bg-green-500" },
      ];
    }
    return [];
  };

  const statsCards = getStatsCards();

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
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {user?.name} 👋
        </h1>
        <p className="text-gray-500 mt-1">
          {role === "buyer" && "Manage your orders, wishlist, and profile"}
          {role === "seller" && "Manage your products, orders, and sales"}
          {role === "admin" && "Manage users, products, and platform analytics"}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {statsCards.map((stat, index) => {
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

      {/* Recent Orders */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Recent Orders</h2>
          <Link 
            href="/dashboard/buyer/orders" 
            className="text-sm text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
          >
            View All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {stats.recentOrders.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No orders yet</p>
            <Link href="/products" className="text-emerald-600 hover:underline text-sm mt-2 inline-block">
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {stats.recentOrders.map((order) => (
              <Link
                key={order._id}
                href={`/dashboard/buyer/orders/${order._id}`}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-emerald-50 transition"
              >
                <div className="flex items-center gap-3">
                  {order.productDetails?.image ? (
                    <img
                      src={order.productDetails.image}
                      alt={order.productDetails.title}
                      className="w-12 h-12 rounded object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
                      <Package className="w-6 h-6 text-gray-400" />
                    </div>
                  )}
                  <div>
                    <p className="font-medium text-gray-900 text-sm">
                      {order.productDetails?.title || "Product"}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900">BDT {order.totalAmount}</p>
                  <span className={`inline-block text-xs px-2 py-0.5 rounded-full ${
                    order.orderStatus === "delivered" ? "bg-green-100 text-green-700" :
                    order.orderStatus === "cancelled" ? "bg-red-100 text-red-700" :
                    "bg-yellow-100 text-yellow-700"
                  }`}>
                    {order.orderStatus}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Link
          href="/dashboard/buyer/orders"
          className="p-4 bg-white rounded-xl border border-gray-100 hover:border-emerald-200 hover:shadow-md transition text-center"
        >
          <ShoppingBag className="w-6 h-6 mx-auto text-gray-600" />
          <span className="text-sm text-gray-700 mt-2 block">My Orders</span>
        </Link>
        <Link
          href="/dashboard/buyer/wishlist"
          className="p-4 bg-white rounded-xl border border-gray-100 hover:border-emerald-200 hover:shadow-md transition text-center"
        >
          <Heart className="w-6 h-6 mx-auto text-gray-600" />
          <span className="text-sm text-gray-700 mt-2 block">Wishlist</span>
        </Link>
        <Link
          href="/dashboard/buyer/payments"
          className="p-4 bg-white rounded-xl border border-gray-100 hover:border-emerald-200 hover:shadow-md transition text-center"
        >
          <CreditCard className="w-6 h-6 mx-auto text-gray-600" />
          <span className="text-sm text-gray-700 mt-2 block">Payments</span>
        </Link>
        <Link
          href="/dashboard/buyer/profile"
          className="p-4 bg-white rounded-xl border border-gray-100 hover:border-emerald-200 hover:shadow-md transition text-center"
        >
          <User className="w-6 h-6 mx-auto text-gray-600" />
          <span className="text-sm text-gray-700 mt-2 block">Profile</span>
        </Link>
      </div>
    </div>
  );
}