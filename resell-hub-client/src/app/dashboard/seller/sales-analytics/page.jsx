"use client";

import { useState, useEffect } from "react";
import { useSession } from "@/lib/auth-client";
import { getSellerOrders, getSellerProducts } from "@/lib/api/seller";
import { Spinner, Card } from "@heroui/react";
import {
  BarChart3,
  TrendingUp,
  Package,
  DollarSign,
  ShoppingBag,
  ArrowUp,
  ArrowDown,
  Clock,
} from "lucide-react";

export default function SalesAnalytics() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    totalProducts: 0,
    totalSales: 0,
    pendingOrders: 0,
    monthlyData: [],
    topProducts: [],
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ordersData, productsData] = await Promise.all([
          getSellerOrders(session?.user?.id),
          getSellerProducts(session?.user?.id),
        ]);

        let orders = ordersData.success ? ordersData.data || [] : [];
        let products = productsData.success ? productsData.data || [] : [];

        // Calculate stats
        const deliveredOrders = orders.filter(
          (o) => o.orderStatus === "delivered",
        );
        const totalRevenue = deliveredOrders.reduce(
          (sum, o) => sum + o.totalAmount,
          0,
        );
        const pendingOrders = orders.filter(
          (o) => o.orderStatus === "pending" || o.orderStatus === "confirmed",
        ).length;

        // Monthly Sales Data (Fake data for demo)
        const monthlySales = [
          { month: "Jan", sales: 12000, orders: 4 },
          { month: "Feb", sales: 18000, orders: 6 },
          { month: "Mar", sales: 15000, orders: 5 },
          { month: "Apr", sales: 25000, orders: 8 },
          { month: "May", sales: 22000, orders: 7 },
          { month: "Jun", sales: 30000, orders: 10 },
        ];

        // Top Selling Products (Fake data for demo)
        const topProducts = [
          { name: "Samsung Galaxy S23 Ultra", sales: 12, revenue: 1140000 },
          { name: "iPhone 13 Pro Max", sales: 8, revenue: 680000 },
          { name: "Dell Inspiron Laptop", sales: 6, revenue: 210000 },
          { name: "PS5 Disc Edition", sales: 5, revenue: 275000 },
          { name: "Canon EOS R6", sales: 4, revenue: 480000 },
        ];

        setStats({
          totalOrders: orders.length,
          totalRevenue: totalRevenue,
          totalProducts: products.length,
          totalSales: deliveredOrders.length,
          pendingOrders: pendingOrders,
          monthlyData: monthlySales,
          topProducts: topProducts,
        });
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (session?.user?.id) {
      fetchData();
    }
  }, [session]);

  const formatPrice = (price) => {
    return new Intl.NumberFormat("en-BD", {
      style: "currency",
      currency: "BDT",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
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
        <h1 className="text-2xl font-bold text-gray-900">Sales Analytics</h1>
        <p className="text-gray-500 mt-1">
          Track your sales performance and growth
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card className="p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Revenue</p>
              <p className="text-2xl font-bold text-emerald-600">
                {formatPrice(stats.totalRevenue)}
              </p>
              <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                <ArrowUp className="w-3 h-3" /> +12.5% from last month
              </p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-emerald-500 bg-opacity-10 flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-emerald-500" />
            </div>
          </div>
        </Card>

        <Card className="p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Orders</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.totalOrders}
              </p>
              <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                <ArrowUp className="w-3 h-3" /> +8% from last month
              </p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-blue-500 bg-opacity-10 flex items-center justify-center">
              <ShoppingBag className="w-6 h-6 text-blue-500" />
            </div>
          </div>
        </Card>

        <Card className="p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Products</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.totalProducts}
              </p>
              <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                <ArrowUp className="w-3 h-3" /> +5 new this month
              </p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-purple-500 bg-opacity-10 flex items-center justify-center">
              <Package className="w-6 h-6 text-purple-500" />
            </div>
          </div>
        </Card>

        <Card className="p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Pending Orders</p>
              <p className="text-2xl font-bold text-amber-600">
                {stats.pendingOrders}
              </p>
              <p className="text-xs text-amber-600 flex items-center gap-1 mt-1">
                <Clock className="w-3 h-3" /> Needs attention
              </p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-amber-500 bg-opacity-10 flex items-center justify-center">
              <Clock className="w-6 h-6 text-amber-500" />
            </div>
          </div>
        </Card>
      </div>

      {/* Monthly Sales Trend */}
      <Card className="p-6 border border-gray-100 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900">Monthly Sales Trend</h3>
          <span className="text-xs text-gray-500">Last 6 months</span>
        </div>
        <div className="space-y-3">
          {stats.monthlyData.map((item) => {
            const maxSales = Math.max(...stats.monthlyData.map((d) => d.sales));
            const percentage = (item.sales / maxSales) * 100;

            return (
              <div key={item.month} className="flex items-center gap-4">
                <span className="w-10 text-sm font-medium text-gray-600">
                  {item.month}
                </span>
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <div className="flex-1 bg-gray-100 rounded-full h-8 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-1000 flex items-center justify-end pr-3"
                        style={{ width: `${percentage}%` }}
                      >
                        <span className="text-xs text-white font-medium">
                          {item.sales > 10000
                            ? `${item.sales / 1000}k`
                            : item.sales}
                        </span>
                      </div>
                    </div>
                    <div className="text-right min-w-[80px]">
                      <p className="text-sm font-semibold text-gray-900">
                        {formatPrice(item.sales)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {item.orders} orders
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Selling Products */}
        <Card className="p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">
              Top Selling Products
            </h3>
            <TrendingUp className="w-5 h-5 text-emerald-500" />
          </div>
          <div className="space-y-4">
            {stats.topProducts.map((product, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-semibold text-sm">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900 text-sm">
                    {product.name}
                  </p>
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <span>{product.sales} sales</span>
                    <span>•</span>
                    <span className="text-emerald-600 font-medium">
                      {formatPrice(product.revenue)}
                    </span>
                  </div>
                </div>
                <div className="w-16 h-1 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full rounded-full"
                    style={{
                      width: `${(product.sales / stats.topProducts[0].sales) * 100}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Sales Overview */}
        <Card className="p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Sales Overview</h3>
            <BarChart3 className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <p className="text-2xl font-bold text-gray-900">
                  {stats.totalSales}
                </p>
                <p className="text-xs text-gray-500">Total Sales</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <p className="text-2xl font-bold text-emerald-600">
                  {formatPrice(stats.totalRevenue)}
                </p>
                <p className="text-xs text-gray-500">Total Revenue</p>
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">
                  Average Order Value
                </span>
                <span className="font-semibold text-gray-900">
                  {stats.totalOrders > 0
                    ? formatPrice(stats.totalRevenue / stats.totalOrders)
                    : formatPrice(0)}
                </span>
              </div>
              <div className="flex justify-between items-center mt-2">
                <span className="text-sm text-gray-600">Conversion Rate</span>
                <span className="font-semibold text-gray-900">
                  {stats.totalProducts > 0
                    ? Math.round((stats.totalSales / stats.totalProducts) * 100)
                    : 0}
                  %
                </span>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
