"use client";

import { useState, useEffect } from "react";
import { useSession } from "@/lib/auth-client";
import { Spinner, Card } from "@heroui/react";
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Package, 
  ShoppingBag, 
  DollarSign,
  Calendar,
  ArrowUp,
  ArrowDown
} from "lucide-react";
import { getAdminStats } from "@/lib/api/admin";

export default function PlatformAnalytics() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    activeUsersCount: 0,
  });


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

  const userGrowth = [
    { month: "Jan", users: 10 },
    { month: "Feb", users: 18 },
    { month: "Mar", users: 25 },
    { month: "Apr", users: 35 },
    { month: "May", users: 42 },
    { month: "Jun", users: stats.totalUsers || 50 },
  ];

  const monthlyOrders = [
    { month: "Jan", orders: 8, revenue: 120000 },
    { month: "Feb", orders: 12, revenue: 180000 },
    { month: "Mar", orders: 15, revenue: 220000 },
    { month: "Apr", orders: 22, revenue: 350000 },
    { month: "May", orders: 25, revenue: 400000 },
    { month: "Jun", orders: stats.totalOrders || 30, revenue: stats.totalRevenue || 500000 },
  ];

  const categoryPerformance = [
    { name: "Electronics", count: 15, revenue: 450000, color: "bg-blue-500" },
    { name: "Furniture", count: 10, revenue: 280000, color: "bg-amber-500" },
    { name: "Vehicles", count: 8, revenue: 320000, color: "bg-red-500" },
    { name: "Fashion", count: 12, revenue: 200000, color: "bg-pink-500" },
    { name: "Others", count: 5, revenue: 80000, color: "bg-gray-500" },
  ];

  const topProducts = [
    { name: "Samsung Galaxy S23 Ultra", sales: 12, revenue: 1140000 },
    { name: "iPhone 13 Pro Max", sales: 8, revenue: 680000 },
    { name: "Dell Inspiron Laptop", sales: 6, revenue: 210000 },
    { name: "PS5 Disc Edition", sales: 5, revenue: 275000 },
    { name: "Canon EOS R6", sales: 4, revenue: 480000 },
  ];

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-BD', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner color="success" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Platform Analytics</h1>
        <p className="text-gray-500 mt-1">Overall business insights and performance metrics</p>
      </div>

      {/* Summary Cards - Real Data */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card className="p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
              <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                <ArrowUp className="w-3 h-3" /> 12% growth
              </p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-purple-500 bg-opacity-10 flex items-center justify-center">
              <Users className="w-6 h-6 text-purple-900" />
            </div>
          </div>
        </Card>

        <Card className="p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Products</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalProducts}</p>
              <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                <ArrowUp className="w-3 h-3" /> 8% growth
              </p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-blue-500 bg-opacity-10 flex items-center justify-center">
              <Package className="w-6 h-6 text-blue-900" />
            </div>
          </div>
        </Card>

        <Card className="p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Orders</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalOrders}</p>
              <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                <ArrowUp className="w-3 h-3" /> 15% growth
              </p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-amber-500 bg-opacity-10 flex items-center justify-center">
              <ShoppingBag className="w-6 h-6 text-amber-900" />
            </div>
          </div>
        </Card>

        <Card className="p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Revenue</p>
              <p className="text-2xl font-bold text-emerald-600">{formatPrice(stats.totalRevenue)}</p>
              <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                <ArrowUp className="w-3 h-3" /> 20% growth
              </p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-emerald-500 bg-opacity-10 flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-emerald-900" />
            </div>
          </div>
        </Card>
      </div>

      {/* User Growth Chart */}
      <Card className="p-6 border border-gray-100 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-gray-900">User Growth</h3>
            <p className="text-xs text-gray-500">Monthly active users</p>
          </div>
          <TrendingUp className="w-5 h-5 text-emerald-500" />
        </div>
        <div className="space-y-3">
          {userGrowth.map((item) => {
            const maxUsers = Math.max(...userGrowth.map(d => d.users));
            const percentage = (item.users / maxUsers) * 100;
            return (
              <div key={item.month} className="flex items-center gap-4">
                <span className="w-10 text-sm font-medium text-gray-600">{item.month}</span>
                <div className="flex-1 bg-gray-100 rounded-full h-8 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-purple-500 to-blue-500 h-full rounded-full transition-all duration-1000 flex items-center justify-end pr-3"
                    style={{ width: `${percentage}%` }}
                  >
                    <span className="text-xs text-white font-medium">{item.users}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Monthly Orders & Revenue Chart */}
      <Card className="p-6 border border-gray-100 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-gray-900">Monthly Orders & Revenue</h3>
            <p className="text-xs text-gray-500">Orders and revenue trends</p>
          </div>
          <Calendar className="w-5 h-5 text-amber-500" />
        </div>
        <div className="space-y-4">
          {monthlyOrders.map((item) => {
            const maxOrders = Math.max(...monthlyOrders.map(d => d.orders));
            const percentage = (item.orders / maxOrders) * 100;
            return (
              <div key={item.month}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600 font-medium">{item.month}</span>
                  <span className="text-gray-900">
                    {item.orders} orders • {formatPrice(item.revenue)}
                  </span>
                </div>
                <div className="flex-1 bg-gray-100 rounded-full h-6 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-amber-500 to-orange-400 h-full rounded-full transition-all duration-1000 flex items-center justify-end pr-3"
                    style={{ width: `${percentage}%` }}
                  >
                    <span className="text-xs text-white font-medium">{item.orders}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Performance */}
        <Card className="p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-gray-900">Category Performance</h3>
              <p className="text-xs text-gray-500">Products by category</p>
            </div>
            <BarChart3 className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-3">
            {categoryPerformance.map((item) => {
              const maxCount = Math.max(...categoryPerformance.map(d => d.count));
              const percentage = (item.count / maxCount) * 100;
              return (
                <div key={item.name}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">{item.name}</span>
                    <span className="font-medium text-gray-900">{item.count} items</span>
                  </div>
                  <div className="flex-1 bg-gray-100 rounded-full h-5 overflow-hidden">
                    <div
                      className={`${item.color} h-full rounded-full transition-all duration-1000 flex items-center justify-end pr-2`}
                      style={{ width: `${percentage}%` }}
                    >
                      <span className="text-xs text-white font-medium">{formatPrice(item.revenue)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Top Selling Products */}
        <Card className="p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-gray-900">Top Selling Products</h3>
              <p className="text-xs text-gray-500">Best performing products</p>
            </div>
            <TrendingUp className="w-5 h-5 text-emerald-500" />
          </div>
          <div className="space-y-4">
            {topProducts.map((product, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-white font-semibold text-xs ${
                  index === 0 ? "bg-emerald-500" :
                  index === 1 ? "bg-blue-500" :
                  index === 2 ? "bg-amber-500" :
                  index === 3 ? "bg-purple-500" :
                  "bg-gray-500"
                }`}>
                  {index + 1}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900 text-sm">{product.name}</p>
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <span>{product.sales} sales</span>
                    <span>•</span>
                    <span className="text-emerald-600 font-medium">{formatPrice(product.revenue)}</span>
                  </div>
                </div>
                <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      index === 0 ? "bg-emerald-500" :
                      index === 1 ? "bg-blue-500" :
                      index === 2 ? "bg-amber-500" :
                      index === 3 ? "bg-purple-500" :
                      "bg-gray-500"
                    }`}
                    style={{ width: `${(product.sales / topProducts[0].sales) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}