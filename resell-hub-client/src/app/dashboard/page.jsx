"use client";

import { useSession } from "@/lib/auth-client";
import Link from "next/link";
import { 
  ShoppingBag, 
  Heart, 
  CreditCard, 
  Package,
  TrendingUp,
  Users,
  DollarSign,
  PlusCircle,
  ClipboardList,
  User
} from "lucide-react";

export default function DashboardOverview() {
  const { data: session } = useSession();
  const user = session?.user;
  const role = user?.role || "buyer";

  const getStats = () => {
    const buyerStats = [
      { label: "Total Orders", value: "0", icon: ShoppingBag, color: "bg-blue-500" },
      { label: "Wishlist Items", value: "0", icon: Heart, color: "bg-red-500" },
      { label: "Total Spent", value: "BDT 0", icon: CreditCard, color: "bg-green-500" },
    ];

    const sellerStats = [
      { label: "Total Products", value: "0", icon: Package, color: "bg-purple-500" },
      { label: "Total Orders", value: "0", icon: ShoppingBag, color: "bg-blue-500" },
      { label: "Total Revenue", value: "BDT 0", icon: DollarSign, color: "bg-green-500" },
    ];

    const adminStats = [
      { label: "Total Users", value: "0", icon: Users, color: "bg-purple-500" },
      { label: "Total Products", value: "0", icon: Package, color: "bg-blue-500" },
      { label: "Total Orders", value: "0", icon: ShoppingBag, color: "bg-green-500" },
      { label: "Total Revenue", value: "BDT 0", icon: TrendingUp, color: "bg-amber-500" },
    ];

    if (role === "buyer") return buyerStats;
    if (role === "seller") return sellerStats;
    if (role === "admin") return adminStats;
    return [];
  };

  const getQuickActions = () => {
    if (role === "buyer") {
      return [
        { label: "My Orders", href: "/dashboard/buyer/orders", icon: ShoppingBag },
        { label: "Wishlist", href: "/dashboard/buyer/wishlist", icon: Heart },
        { label: "Payment History", href: "/dashboard/buyer/payments", icon: CreditCard },
      ];
    }
    if (role === "seller") {
      return [
        { label: "Add Product", href: "/dashboard/seller/add-product", icon: PlusCircle },
        { label: "My Products", href: "/dashboard/seller/my-products", icon: Package },
        { label: "Manage Orders", href: "/dashboard/seller/manage-orders", icon: ClipboardList },
      ];
    }
    if (role === "admin") {
      return [
        { label: "Manage Users", href: "/dashboard/admin/manage-users", icon: Users },
        { label: "Manage Products", href: "/dashboard/admin/manage-products", icon: Package },
        { label: "Manage Orders", href: "/dashboard/admin/manage-orders", icon: ClipboardList },
      ];
    }
    return [];
  };

  const stats = getStats();
  const quickActions = getQuickActions();

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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, index) => {
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
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <Link
                key={index}
                href={action.href}
                className="p-4 bg-gray-50 rounded-lg hover:bg-emerald-50 transition text-center"
              >
                <Icon className="w-6 h-6 mx-auto text-gray-600" />
                <span className="text-sm text-gray-700 mt-2 block">{action.label}</span>
              </Link>
            );
          })}
          <Link
            href="/dashboard/profile"
            className="p-4 bg-gray-50 rounded-lg hover:bg-emerald-50 transition text-center"
          >
            <User className="w-6 h-6 mx-auto text-gray-600" />
            <span className="text-sm text-gray-700 mt-2 block">Profile</span>
          </Link>
        </div>
      </div>
    </div>
  );
}