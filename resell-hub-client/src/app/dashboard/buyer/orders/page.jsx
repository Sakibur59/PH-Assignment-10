
"use client";

import { useState, useEffect } from "react";
import { useSession } from "@/lib/auth-client";
import { getOrders } from "@/lib/api/orders";
import { Spinner, Card } from "@heroui/react";
import Link from "next/link";

export default function BuyerOrders() {
  const { data: session } = useSession();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const data = await getOrders(session?.user?.id);
        if (data.success) {
          setOrders(data.data);
        } else {
          setError(data.message);
        }
      } catch (err) {
        setError("Failed to fetch orders");
      } finally {
        setLoading(false);
      }
    };

    if (session?.user?.id) {
      fetchOrders();
    }
  }, [session]);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner color="success" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>
      <p className="text-gray-500 mt-1">View all your orders</p>

      {orders.length === 0 ? (
        <div className="mt-6 bg-white rounded-xl p-12 text-center text-gray-500 border border-gray-100">
          <div className="text-5xl mb-4">📦</div>
          <p className="text-lg font-medium">No orders yet</p>
          <p className="text-sm">Start shopping to see your orders here</p>
          <Link href="/products" className="mt-4 inline-block bg-emerald-500 text-white px-6 py-2 rounded-lg hover:bg-emerald-600">
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {orders.map((order) => (
            <Card key={order._id} className="p-6 border border-gray-100">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="font-semibold text-gray-900">{order.orderId}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    {order.productDetails?.title}
                  </p>
                </div>
                <div>
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                    order.orderStatus === "delivered" ? "bg-green-100 text-green-700" :
                    order.orderStatus === "cancelled" ? "bg-red-100 text-red-700" :
                    "bg-yellow-100 text-yellow-700"
                  }`}>
                    {order.orderStatus}
                  </span>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900">BDT {order.totalAmount}</p>
                  <p className="text-xs text-gray-500">Qty: {order.quantity}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}