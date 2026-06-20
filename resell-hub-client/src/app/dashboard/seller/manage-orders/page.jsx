"use client";

import { useState, useEffect } from "react";
import { useSession } from "@/lib/auth-client";
import { getSellerOrders, updateOrderStatus } from "@/lib/api/seller";
import { Spinner, Card, Button } from "@heroui/react";
import toast from "react-hot-toast";
import {
  Package,
  CheckCircle,
  XCircle,
  Truck,
  Clock,
  Eye,
  User,
  Mail,
  Phone,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

const ORDER_STATUSES = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];
const STATUS_COLORS = {
  pending: "bg-yellow-100 text-yellow-700",
  confirmed: "bg-blue-100 text-blue-700",
  processing: "bg-purple-100 text-purple-700",
  shipped: "bg-indigo-100 text-indigo-700",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};

const STATUS_ICONS = {
  pending: Clock,
  confirmed: CheckCircle,
  processing: Truck,
  shipped: Truck,
  delivered: CheckCircle,
  cancelled: XCircle,
};

export default function ManageOrders() {
  const { data: session } = useSession();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");

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
    setIsUpdating(true);
    try {
      const data = await updateOrderStatus(
        orderId,
        newStatus,
        session?.user?.id,
      );
      if (data.success) {
        toast.success(`Order status updated to ${newStatus}`);
        fetchOrders();
        setIsStatusModalOpen(false);
        setNewStatus("");
      } else {
        toast.error(data.message || "Failed to update status");
      }
    } catch (error) {
      toast.error("Error updating status");
    } finally {
      setIsUpdating(false);
    }
  };

  const toggleExpand = (orderId) => {
    setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
  };

  const openStatusModal = (order) => {
    setSelectedOrder(order);
    setNewStatus(order.orderStatus);
    setIsStatusModalOpen(true);
  };

  const closeStatusModal = () => {
    setIsStatusModalOpen(false);
    setSelectedOrder(null);
    setNewStatus("");
  };

  const getStatusIcon = (status) => {
    const Icon = STATUS_ICONS[status] || Clock;
    return <Icon className="w-4 h-4" />;
  };

  const getNextStatuses = (currentStatus) => {
    const flow = {
      pending: ["confirmed", "cancelled"],
      confirmed: ["processing", "cancelled"],
      processing: ["shipped", "cancelled"],
      shipped: ["delivered"],
      delivered: [],
      cancelled: [],
    };
    return flow[currentStatus] || [];
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner color="success" />
      </div>
    );
  }

  const filteredOrders =
    statusFilter === "all"
      ? orders
      : orders.filter((order) => order.orderStatus === statusFilter);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manage Orders</h1>
          <p className="text-gray-500 mt-1">View and manage incoming orders</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">
            Total Orders:{" "}
            <span className="font-semibold text-gray-900">{orders.length}</span>
          </span>
        </div>
      </div>

      {/* Status Legend */}
      <div className="flex flex-wrap gap-2 mb-4 p-3 bg-gray-50 rounded-lg">
        <button
          onClick={() => setStatusFilter("all")}
          className={`px-4 py-2 rounded-full text-sm font-medium transition
      ${
        statusFilter === "all"
          ? "bg-emerald-500 text-white"
          : "bg-gray-200 text-gray-700 hover:bg-gray-300"
      }`}
        >
          All ({orders.length})
        </button>

        {Object.entries(STATUS_COLORS).map(([status, color]) => {
          const count = orders.filter(
            (order) => order.orderStatus === status,
          ).length;

          return (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition
        ${statusFilter === status ? "ring-2 ring-emerald-500 scale-105" : ""}
        ${color}`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)} ({count})
            </button>
          );
        })}
      </div>

      {orders.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center text-gray-500 border border-gray-100">
          <Package className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <p className="text-lg font-medium">No orders yet</p>
          <p className="text-sm">
            Orders will appear here when customers purchase your products
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <Card
              key={order._id}
              className="border border-gray-100 overflow-hidden"
            >
              {/* Order Header */}
              <div className="p-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex-1 min-w-[200px]">
                    <div className="flex items-center gap-3">
                      {order.productDetails?.image ? (
                        <img
                          src={order.productDetails.image}
                          alt={order.productDetails.title}
                          className="w-14 h-14 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="w-14 h-14 bg-gray-100 rounded-lg flex items-center justify-center">
                          <Package className="w-7 h-7 text-gray-400" />
                        </div>
                      )}
                      <div>
                        <p className="font-semibold text-gray-900">
                          {order.productDetails?.title || "Product"}
                        </p>
                        <p className="text-sm text-gray-500">
                          Order #{order.orderId}
                        </p>
                        <p className="text-sm text-gray-500">
                          Buyer: {order.buyerInfo?.name || "Unknown"}
                        </p>
                        <p className="text-xs text-gray-400">
                          {new Date(order.createdAt).toLocaleDateString(
                            "en-US",
                            {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            },
                          )}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <p className="font-bold text-gray-900">
                      BDT {order.totalAmount}
                    </p>
                    <p className="text-xs text-gray-500">
                      Qty: {order.quantity}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 ${STATUS_COLORS[order.orderStatus] || "bg-gray-100 text-gray-700"}`}
                    >
                      {getStatusIcon(order.orderStatus)}
                      {order.orderStatus.charAt(0).toUpperCase() +
                        order.orderStatus.slice(1)}
                    </span>

                    {/* Eye Button - Toggle Details */}
                    <Button
                      size="sm"
                      variant="light"
                      onClick={() => toggleExpand(order._id)}
                      className={`${expandedOrderId === order._id ? "bg-emerald-50 text-emerald-600" : "text-blue-600 hover:bg-blue-50"}`}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>

                    {/* Delivery Button - Status Update */}
                    {order.orderStatus !== "delivered" &&
                      order.orderStatus !== "cancelled" && (
                        <Button
                          size="sm"
                          variant="light"
                          onClick={() => openStatusModal(order)}
                          className="text-emerald-600 hover:bg-emerald-50"
                        >
                          <Truck className="w-4 h-4" />
                        </Button>
                      )}
                  </div>
                </div>
              </div>

              {/* Expandable Order Details*/}
              {expandedOrderId === order._id && (
                <div className="border-t border-gray-100 p-6 bg-gray-50">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Product Info */}
                    <div>
                      <h4 className="font-semibold text-gray-900 text-sm mb-2">
                        Product Details
                      </h4>
                      <div className="flex items-center gap-3 p-3 bg-white rounded-lg shadow-sm">
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
                          <p className="font-medium text-gray-900 text-sm">
                            {order.productDetails?.title}
                          </p>
                          <p className="text-sm text-gray-500">
                            Qty: {order.quantity}
                          </p>
                          <p className="text-lg font-bold text-emerald-600">
                            BDT {order.totalAmount}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Buyer Info */}
                    <div>
                      <h4 className="font-semibold text-gray-900 text-sm mb-2">
                        Buyer Information
                      </h4>
                      <div className="p-3 bg-white rounded-lg shadow-sm space-y-2">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-700 text-sm">
                            {order.buyerInfo?.name || "Unknown"}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-700 text-sm">
                            {order.buyerInfo?.email || "N/A"}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-700 text-sm">
                            {order.buyerInfo?.phone || "N/A"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Shipping Address */}
                  <div className="mt-4">
                    <h4 className="font-semibold text-gray-900 text-sm mb-2">
                      Shipping Address
                    </h4>
                    <div className="p-3 bg-white rounded-lg shadow-sm">
                      <p className="text-gray-700 text-sm">
                        {order.shippingAddress?.address ||
                          "No address provided"}
                      </p>
                    </div>
                  </div>

                  {/* Order Timeline */}
                  <div className="mt-4">
                    <h4 className="font-semibold text-gray-900 text-sm mb-2">
                      Order Timeline
                    </h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-3 p-2 bg-green-50 rounded-lg">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            Order Placed
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(order.createdAt).toLocaleDateString(
                              "en-US",
                              {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              },
                            )}
                          </p>
                        </div>
                      </div>
                      <div
                        className={`flex items-center gap-3 p-2 rounded-lg ${order.orderStatus !== "pending" ? "bg-blue-50" : "bg-gray-50"}`}
                      >
                        {order.orderStatus !== "pending" ? (
                          <CheckCircle className="w-4 h-4 text-blue-500" />
                        ) : (
                          <Clock className="w-4 h-4 text-gray-400" />
                        )}
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            Current Status
                          </p>
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLORS[order.orderStatus]}`}
                          >
                            {order.orderStatus.charAt(0).toUpperCase() +
                              order.orderStatus.slice(1)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Close Button */}
                  <div className="flex gap-3 mt-4 pt-4 border-t border-gray-200">
                    <Button
                      variant="light"
                      onClick={() => toggleExpand(order._id)}
                      className="flex-1 text-gray-600 hover:bg-gray-100"
                      size="sm"
                    >
                      Close Details
                    </Button>
                    {order.orderStatus !== "delivered" &&
                      order.orderStatus !== "cancelled" && (
                        <Button
                          onClick={() => openStatusModal(order)}
                          className="flex-1 bg-emerald-500 text-white hover:bg-emerald-600"
                          size="sm"
                        >
                          Update Status
                        </Button>
                      )}
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Update Status Modal */}
      {isStatusModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                <Truck className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  Update Order Status
                </h3>
                <p className="text-sm text-gray-500">
                  Order #{selectedOrder?.orderId}
                </p>
              </div>
            </div>

            <div className="py-2">
              <p className="text-sm text-gray-600 mb-3">
                Current Status:
                <span
                  className={`ml-2 px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[selectedOrder?.orderStatus]}`}
                >
                  {selectedOrder?.orderStatus?.charAt(0).toUpperCase() +
                    selectedOrder?.orderStatus?.slice(1)}
                </span>
              </p>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Select New Status
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-4 py-2.5 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition-colors"
                >
                  {ORDER_STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              {getNextStatuses(selectedOrder?.orderStatus).length > 0 && (
                <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-700">
                    Suggested next statuses:
                  </p>
                  <div className="flex gap-2 mt-1 flex-wrap">
                    {getNextStatuses(selectedOrder?.orderStatus).map(
                      (status) => (
                        <button
                          key={status}
                          onClick={() => setNewStatus(status)}
                          className={`px-3 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[status]} hover:opacity-80`}
                        >
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </button>
                      ),
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <Button
                variant="light"
                onClick={closeStatusModal}
                className="flex-1 text-gray-600 hover:bg-gray-100"
              >
                Cancel
              </Button>
              <Button
                onClick={() =>
                  handleStatusUpdate(selectedOrder?._id, newStatus)
                }
                isLoading={isUpdating}
                className="flex-1 bg-emerald-500 text-white hover:bg-emerald-600"
              >
                Update Status
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
