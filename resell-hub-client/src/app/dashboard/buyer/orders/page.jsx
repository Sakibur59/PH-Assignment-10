
"use client";

import { useState, useEffect } from "react";
import { useSession } from "@/lib/auth-client";
import { getOrders, cancelOrder } from "@/lib/api/orders";
import { Spinner, Card, Button } from "@heroui/react";
import Link from "next/link";
import toast from "react-hot-toast";
import { Package, AlertTriangle, X } from "lucide-react";

const ORDER_STATUS_COLORS = {
  pending: "bg-yellow-100 text-yellow-700",
  confirmed: "bg-blue-100 text-blue-700",
  shipped: "bg-purple-100 text-purple-700",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};

const ORDER_STATUS_LABELS = {
  pending: "Pending",
  confirmed: "Confirmed",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export default function BuyerOrders() {
  const { data: session } = useSession();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, [session]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await getOrders(session?.user?.id);
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


  const openCancelModal = (order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const closeCancelModal = () => {
    if (cancelling) return; 
    setIsModalOpen(false);
    setSelectedOrder(null);
  };

  
  const handleCancelOrder = async () => {
    if (!selectedOrder) return;

    const orderId = selectedOrder._id;

    try {
      setCancelling(orderId);
      const data = await cancelOrder(orderId, session?.user?.id);
      if (data.success) {
        toast.success("Order cancelled successfully");
        setIsModalOpen(false);
        setSelectedOrder(null);
        fetchOrders();
      } else {
        toast.error(data.message || "Failed to cancel order");
      }
    } catch (error) {
      toast.error("Error cancelling order");
    } finally {
      setCancelling(null);
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
      <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>
      <p className="text-gray-500 mt-1">View and manage all your orders</p>

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
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex-1 min-w-[200px]">
                  <div className="flex items-center gap-3">
                    {order.productDetails?.image ? (
                      <img
                        src={order.productDetails.image}
                        alt={order.productDetails.title}
                        className="w-16 h-16 rounded object-cover"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-gray-100 rounded flex items-center justify-center">
                        <Package className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                    <div>
                      <Link 
                        href={`/products/${order.productId}`}
                        className="font-semibold text-gray-900 hover:text-emerald-600 transition"
                      >
                        {order.productDetails?.title || "Product"}
                      </Link>
                      <p className="text-sm text-gray-500">Order #{order.orderId}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(order.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="text-center">
                  <p className="font-bold text-gray-900">BDT {order.totalAmount}</p>
                  <p className="text-xs text-gray-500">Qty: {order.quantity}</p>
                </div>

                <div className="text-center">
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${ORDER_STATUS_COLORS[order.orderStatus] || "bg-gray-100 text-gray-700"}`}>
                    {ORDER_STATUS_LABELS[order.orderStatus] || order.orderStatus}
                  </span>
                </div>

                <div className="flex gap-2">
                  <Link href={`/dashboard/buyer/orders/${order._id}`}>
                    <Button size="sm" variant="bordered" className="border-emerald-500 text-emerald-600">
                      Details
                    </Button>
                  </Link>
                  {order.orderStatus !== "cancelled" && 
                   order.orderStatus !== "delivered" && 
                   order.orderStatus !== "shipped" && (
                    <Button
                      size="sm"
                      color="danger"
                      variant="light"
                      isLoading={cancelling === order._id}
                      onClick={() => openCancelModal(order)}
                      className="text-red-600"
                    >
                      Cancel
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}


      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={closeCancelModal}
        >
          <div
            className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                <h2 className="font-semibold text-gray-900">Cancel Order</h2>
              </div>
              <button
                onClick={closeCancelModal}
                className="p-1 rounded-full hover:bg-gray-100 disabled:opacity-50"
                disabled={!!cancelling}
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Body */}
            <div className="px-6 py-4">
              <p className="text-gray-600">
                Are you sure you want to cancel this order?
              </p>

              {selectedOrder && (
                <div className="bg-gray-50 rounded-lg p-3 mt-3 flex items-center gap-3">
                  {selectedOrder.productDetails?.image ? (
                    <img
                      src={selectedOrder.productDetails.image}
                      alt={selectedOrder.productDetails.title}
                      className="w-12 h-12 rounded object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
                      <Package className="w-6 h-6 text-gray-400" />
                    </div>
                  )}
                  <div>
                    <p className="font-medium text-gray-900 text-sm">
                      {selectedOrder.productDetails?.title || "Product"}
                    </p>
                    <p className="text-xs text-gray-500">
                      Order #{selectedOrder.orderId}
                    </p>
                  </div>
                </div>
              )}

              <p className="text-xs text-gray-400 mt-3">
                This action cannot be undone.
              </p>
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-2 px-6 py-4 border-t border-gray-100">
              <Button
                variant="light"
                onClick={closeCancelModal}
                isDisabled={!!cancelling}
              >
                No, Keep Order
              </Button>
              <Button
                color="danger"
                onClick={handleCancelOrder}
                isLoading={cancelling === selectedOrder?._id}
              >
                Yes, Cancel Order
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}