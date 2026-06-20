// app/dashboard/seller/manage-orders/page.jsx
"use client";

import { useState, useEffect } from "react";
import { useSession } from "@/lib/auth-client";
import { getSellerOrders, updateOrderStatus } from "@/lib/api/seller";
import { Spinner, Card, Button } from "@heroui/react";
import toast from "react-hot-toast";
import { Package, CheckCircle, XCircle, Truck, Clock } from "lucide-react";

const ORDER_STATUSES = ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"];
const STATUS_COLORS = {
  pending: "bg-yellow-100 text-yellow-700",
  confirmed: "bg-blue-100 text-blue-700",
  processing: "bg-purple-100 text-purple-700",
  shipped: "bg-indigo-100 text-indigo-700",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};

export default function ManageOrders() {
  const { data: session } = useSession();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, [session]);

  const fetchOrders = async () => {
    try {
      const data = await getSellerOrders(session?.user?.id);
      if (data.success) {
        setOrders(data.data || []);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      const data = await updateOrderStatus(orderId, newStatus, session?.user?.id);
      if (data.success) {
        toast.success(`Order status updated to ${newStatus}`);
        fetchOrders();
      } else {
        toast.error(data.message || "Failed to update status");
      }
    } catch (error) {
      toast.error("Error updating status");
    }
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
      <h1 className="text-2xl font-bold text-gray-900">Manage Orders</h1>
      <p className="text-gray-500 mt-1">View and manage incoming orders</p>

      {orders.length === 0 ? (
        <div className="mt-6 bg-white rounded-xl p-12 text-center text-gray-500 border border-gray-100">
          <Package className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <p className="text-lg font-medium">No orders yet</p>
          <p className="text-sm">Orders will appear here when customers purchase your products</p>
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {orders.map((order) => (
            <Card key={order._id} className="p-6 border border-gray-100">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    {order.productDetails?.image ? (
                      <img src={order.productDetails.image} alt={order.productDetails.title} className="w-12 h-12 rounded object-cover" />
                    ) : (
                      <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center">
                        <Package className="w-6 h-6 text-gray-400" />
                      </div>
                    )}
                    <div>
                      <p className="font-semibold text-gray-900">{order.productDetails?.title || "Product"}</p>
                      <p className="text-sm text-gray-500">Order #{order.orderId}</p>
                      <p className="text-sm text-gray-500">Buyer: {order.buyerInfo?.name || "Unknown"}</p>
                    </div>
                  </div>
                </div>

                <div className="text-center">
                  <p className="font-bold text-gray-900">BDT {order.totalAmount}</p>
                  <p className="text-xs text-gray-500">Qty: {order.quantity}</p>
                </div>

                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${STATUS_COLORS[order.orderStatus] || "bg-gray-100 text-gray-700"}`}>
                    {order.orderStatus}
                  </span>
                  <select
                    value={order.orderStatus}
                    onChange={(e) => handleStatusUpdate(order._id, e.target.value)}
                    className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                  >
                    {ORDER_STATUSES.map((status) => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}