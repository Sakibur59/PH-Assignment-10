"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { getOrderById, cancelOrder } from "@/lib/api/orders";
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

export default function OrderDetails() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const orderId = params.id;
  
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchOrder();
  }, [orderId]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const data = await getOrderById(orderId, session?.user?.id);
      if (data.success) {
        setOrder(data.data);
      } else {
        toast.error(data.message || "Order not found");
        router.push("/dashboard/buyer/orders");
      }
    } catch (error) {
      toast.error("Failed to load order");
    } finally {
      setLoading(false);
    }
  };

  const openCancelModal = () => {
    setIsModalOpen(true);
  };

  const closeCancelModal = () => {
    if (cancelling) return;
    setIsModalOpen(false);
  };

  const handleCancelOrder = async () => {
    if (!order) return;

    try {
      setCancelling(true);
      const data = await cancelOrder(orderId, session?.user?.id);
      if (data.success) {
        toast.success("Order cancelled successfully");
        setIsModalOpen(false);
        fetchOrder();
      } else {
        toast.error(data.message || "Failed to cancel order");
      }
    } catch (error) {
      toast.error("Error cancelling order");
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner color="success" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Order not found</p>
        <Link href="/dashboard/buyer/orders" className="text-emerald-600 hover:underline">
          Back to Orders
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Order Details</h1>
          <p className="text-gray-500">Order #{order.orderId}</p>
        </div>
        <Link href="/dashboard/buyer/orders">
          <Button variant="bordered" size="sm">← Back to Orders</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order Info */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6 border border-gray-100">
            <div className="flex items-start gap-4">
              {order.productDetails?.image ? (
                <img
                  src={order.productDetails.image}
                  alt={order.productDetails.title}
                  className="w-32 h-32 rounded object-cover"
                />
              ) : (
                <div className="w-32 h-32 bg-gray-100 rounded flex items-center justify-center">
                  <Package className="w-12 h-12 text-gray-400" />
                </div>
              )}
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 text-lg">
                  {order.productDetails?.title || "Product"}
                </h3>
                <p className="text-sm text-gray-500">Quantity: {order.quantity}</p>
                <p className="text-2xl font-bold text-emerald-600 mt-2">
                  BDT {order.totalAmount}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6 border border-gray-100">
            <h3 className="font-semibold text-gray-900 mb-4">Order Timeline</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-green-600">✓</span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Order Placed</p>
                  <p className="text-sm text-gray-500">
                    {new Date(order.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  order.orderStatus === "cancelled" ? "bg-red-100" :
                  order.orderStatus === "pending" ? "bg-yellow-100" :
                  order.orderStatus === "confirmed" ? "bg-blue-100" :
                  order.orderStatus === "shipped" ? "bg-purple-100" :
                  "bg-green-100"
                }`}>
                  <span className={
                    order.orderStatus === "cancelled" ? "text-red-600" :
                    order.orderStatus === "pending" ? "text-yellow-600" :
                    order.orderStatus === "confirmed" ? "text-blue-600" :
                    order.orderStatus === "shipped" ? "text-purple-600" :
                    "text-green-600"
                  }>
                    {order.orderStatus === "cancelled" ? "✕" : "✓"}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">
                    {ORDER_STATUS_LABELS[order.orderStatus] || order.orderStatus}
                  </p>
                  <p className="text-sm text-gray-500">
                    {order.orderStatus === "pending" && "Your order is being processed"}
                    {order.orderStatus === "confirmed" && "Your order has been confirmed"}
                    {order.orderStatus === "shipped" && "Your order is on the way"}
                    {order.orderStatus === "delivered" && "Your order has been delivered"}
                    {order.orderStatus === "cancelled" && "Your order has been cancelled"}
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Order Summary */}
        <div className="space-y-6">
          <Card className="p-6 border border-gray-100">
            <h3 className="font-semibold text-gray-900 mb-4">Order Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Order ID</span>
                <span className="font-medium">{order.orderId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Status</span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${ORDER_STATUS_COLORS[order.orderStatus] || "bg-gray-100 text-gray-700"}`}>
                  {ORDER_STATUS_LABELS[order.orderStatus] || order.orderStatus}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Payment</span>
                <span className={`font-medium ${order.paymentStatus === "paid" ? "text-green-600" : "text-yellow-600"}`}>
                  {order.paymentStatus === "paid" ? "Paid ✓" : "Pending"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Method</span>
                <span>{order.paymentMethod || "Stripe"}</span>
              </div>
            </div>
          </Card>

          {order.orderStatus !== "cancelled" && 
           order.orderStatus !== "delivered" && 
           order.orderStatus !== "shipped" && (
            <Button
              color="danger"
              className="w-full bg-red-500 text-white hover:bg-red-600"
              isLoading={cancelling}
              onClick={openCancelModal}
            >
              Cancel Order
            </Button>
          )}

          <Link href="/products">
            <Button variant="bordered" className="w-full">
              Continue Shopping
            </Button>
          </Link>
        </div>
      </div>

      {/* Cancel Confirmation Modal */}
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

              {order && (
                <div className="bg-gray-50 rounded-lg p-3 mt-3 flex items-center gap-3">
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
                      Order #{order.orderId}
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
                isLoading={cancelling}
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