"use client";

import { useState, useEffect } from "react";
import { useSession } from "@/lib/auth-client";
import { Spinner, Card, Button, Input } from "@heroui/react";
import toast from "react-hot-toast";
import {
  Search,
  Package,
  Truck,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  User,
  Mail,
  Phone,
  X,
} from "lucide-react";
import { getAdminOrders, updateOrderStatus } from "@/lib/api/admin";

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

const STATUS_LABELS = {
  pending: "Pending",
  confirmed: "Confirmed",
  processing: "Processing",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

const formatPrice = (price) => {
  return new Intl.NumberFormat("en-BD", {
    style: "currency",
    currency: "BDT",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
};

export default function AdminManageOrders() {
  const { data: session } = useSession();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const data = await getAdminOrders();
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

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.orderId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.buyerInfo?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.buyerInfo?.email
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      order.productDetails?.title
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase());

    const matchesStatus =
      filterStatus === "all" || order.orderStatus === filterStatus;

    return matchesSearch && matchesStatus;
  });

  const openDetailsModal = (order) => {
    setSelectedOrder(order);
    setIsDetailsModalOpen(true);
  };

  const closeDetailsModal = () => {
    setIsDetailsModalOpen(false);
    setSelectedOrder(null);
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

  const handleStatusUpdate = async () => {
    if (!selectedOrder) return;

    setIsUpdating(true);
    try {
      const data = await updateOrderStatus(selectedOrder._id, newStatus);
      if (data.success) {
        toast.success(`Order status updated to ${newStatus}`);
        fetchOrders();
        closeStatusModal();
      } else {
        toast.error(data.message || "Failed to update status");
      }
    } catch (error) {
      toast.error("Error updating status");
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusIcon = (status) => {
    const Icon = STATUS_ICONS[status] || Clock;
    return <Icon className="w-4 h-4" />;
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
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manage Orders</h1>
          <p className="text-gray-500 mt-1">
            Monitor and manage all platform orders
          </p>
        </div>
        <div className="text-sm text-gray-500">
          Total Orders:{" "}
          <span className="font-semibold text-gray-900">{orders.length}</span>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 mb-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search orders by ID, buyer or product..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 bg-white"
        >
          <option value="all">All Status</option>
          {ORDER_STATUSES.map((status) => (
            <option key={status} value={status}>
              {STATUS_LABELS[status]}
            </option>
          ))}
        </select>
      </div>

      {filteredOrders.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center text-gray-500 border border-gray-100">
          <Package className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <p className="text-lg font-medium">No orders found</p>
          <p className="text-sm">Try adjusting your search or filter</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <Card
              key={order._id}
              className="p-6 border border-gray-100 hover:shadow-md transition"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                {/* Order Info */}
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
                        Order #{order.orderId}
                      </p>
                      <p className="text-sm text-gray-500">
                        {order.productDetails?.title || "Product"}
                      </p>
                      <p className="text-sm text-gray-500">
                        Buyer: {order.buyerInfo?.name || "Unknown"}
                      </p>
                      <p className="text-xs text-gray-400">
                        {new Date(order.createdAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Amount */}
                <div className="text-center">
                  <p className="font-bold text-gray-900">
                    {formatPrice(order.totalAmount)}
                  </p>
                  <p className="text-xs text-gray-500">Qty: {order.quantity}</p>
                </div>

                {/* Status */}
                <div className="flex items-center gap-2">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 ${STATUS_COLORS[order.orderStatus] || "bg-gray-100 text-gray-700"}`}
                  >
                    {getStatusIcon(order.orderStatus)}
                    {STATUS_LABELS[order.orderStatus] || order.orderStatus}
                  </span>

                  <Button
                    size="sm"
                    variant="light"
                    onClick={() => openDetailsModal(order)}
                    className="text-blue-600 hover:bg-blue-50"
                  >
                    <Eye className="w-4 h-4" />
                  </Button>

                  <Button
                    size="sm"
                    variant="light"
                    onClick={() => openStatusModal(order)}
                    className="text-emerald-600 hover:bg-emerald-50"
                  >
                    <Truck className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Order Details Modal */}
      {isDetailsModalOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  Order Details
                </h3>
                <p className="text-sm text-gray-500">
                  Order #{selectedOrder.orderId}
                </p>
              </div>
              <button
                onClick={closeDetailsModal}
                className="p-1 rounded-lg hover:bg-gray-100"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Product Info */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">
                  Product Details
                </h4>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  {selectedOrder.productDetails?.image ? (
                    <img
                      src={selectedOrder.productDetails.image}
                      alt={selectedOrder.productDetails.title}
                      className="w-16 h-16 rounded object-cover"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center">
                      <Package className="w-8 h-8 text-gray-400" />
                    </div>
                  )}
                  <div>
                    <p className="font-medium text-gray-900">
                      {selectedOrder.productDetails?.title}
                    </p>
                    <p className="text-sm text-gray-500">
                      Qty: {selectedOrder.quantity}
                    </p>
                    <p className="text-lg font-bold text-emerald-600">
                      {formatPrice(selectedOrder.totalAmount)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Buyer Info */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">
                  Buyer Information
                </h4>
                <div className="p-3 bg-gray-50 rounded-lg space-y-2">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-700">
                      {selectedOrder.buyerInfo?.name || "Unknown"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-700">
                      {selectedOrder.buyerInfo?.email || "N/A"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-700">
                      {selectedOrder.buyerInfo?.phone || "N/A"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="mt-4">
              <h4 className="font-semibold text-gray-900 mb-2">
                Shipping Address
              </h4>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-gray-700">
                  {selectedOrder.shippingAddress?.address ||
                    "No address provided"}
                </p>
              </div>
            </div>

            {/* Order Timeline */}
            <div className="mt-4">
              <h4 className="font-semibold text-gray-900 mb-2">
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
                      {new Date(selectedOrder.createdAt).toLocaleDateString(
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
                  className={`flex items-center gap-3 p-2 rounded-lg ${selectedOrder.orderStatus !== "pending" ? "bg-blue-50" : "bg-gray-50"}`}
                >
                  {selectedOrder.orderStatus !== "pending" ? (
                    <CheckCircle className="w-4 h-4 text-blue-500" />
                  ) : (
                    <Clock className="w-4 h-4 text-gray-400" />
                  )}
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Current Status
                    </p>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLORS[selectedOrder.orderStatus]}`}
                    >
                      {STATUS_LABELS[selectedOrder.orderStatus] ||
                        selectedOrder.orderStatus}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6 pt-4 border-t border-gray-100">
              <Button
                variant="light"
                onClick={closeDetailsModal}
                className="flex-1 text-gray-600 hover:bg-gray-100"
              >
                Close
              </Button>
              <Button
                onClick={() => {
                  closeDetailsModal();
                  openStatusModal(selectedOrder);
                }}
                className="flex-1 bg-emerald-500 text-white hover:bg-emerald-600"
              >
                Update Status
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Update Status Modal */}
      {isStatusModalOpen && selectedOrder && (
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
                  Order #{selectedOrder.orderId}
                </p>
              </div>
            </div>

            <div className="py-2">
              <p className="text-sm text-gray-600 mb-3">
                Current Status:
                <span
                  className={`ml-2 px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[selectedOrder.orderStatus]}`}
                >
                  {STATUS_LABELS[selectedOrder.orderStatus] ||
                    selectedOrder.orderStatus}
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
                      {STATUS_LABELS[status] || status}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status Flow Guide */}
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500 mb-2">Order Status Flow:</p>
                <div className="flex items-center gap-1 text-xs">
                  <span className="px-2 py-0.5 rounded bg-yellow-100 text-yellow-700">
                    Pending
                  </span>
                  <span className="text-gray-300">→</span>
                  <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-700">
                    Confirmed
                  </span>
                  <span className="text-gray-300">→</span>
                  <span className="px-2 py-0.5 rounded bg-purple-100 text-purple-700">
                    Processing
                  </span>
                  <span className="text-gray-300">→</span>
                  <span className="px-2 py-0.5 rounded bg-indigo-100 text-indigo-700">
                    Shipped
                  </span>
                  <span className="text-gray-300">→</span>
                  <span className="px-2 py-0.5 rounded bg-green-100 text-green-700">
                    Delivered
                  </span>
                </div>
              </div>
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
                onClick={handleStatusUpdate}
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
