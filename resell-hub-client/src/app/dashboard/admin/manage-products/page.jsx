"use client";

import { useState, useEffect } from "react";
import { useSession } from "@/lib/auth-client";
import { Spinner, Card, Button, Input } from "@heroui/react";
import toast from "react-hot-toast";
import { Search, CheckCircle, XCircle, Trash2, Eye, Clock, Package } from "lucide-react";
import Link from "next/link";
import { getAdminProducts, updateProductStatus, deleteProduct } from "@/lib/api/admin";

const formatPrice = (price) => {
  return new Intl.NumberFormat('en-BD', {
    style: 'currency',
    currency: 'BDT',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(price);
};

export default function AdminManageProducts() {
  const { data: session } = useSession();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [actionType, setActionType] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const data = await getAdminProducts();
      if (data.success) {
        setProducts(data.data || []);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sellerInfo?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === "all" || product.adminStatus === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const openActionModal = (product, action) => {
    setSelectedProduct(product);
    setActionType(action);
    setIsActionModalOpen(true);
  };

  const closeActionModal = () => {
    setIsActionModalOpen(false);
    setSelectedProduct(null);
    setActionType("");
  };

  const handleAction = async () => {
    setIsProcessing(true);
    try {
      if (actionType === "Delete") {
        await deleteProduct(selectedProduct._id);
      } else if (actionType === "Approve") {
        await updateProductStatus(selectedProduct._id, "approved");
      } else if (actionType === "Reject") {
        await updateProductStatus(selectedProduct._id, "rejected");
      }
      toast.success(`Product ${actionType.toLowerCase()} successfully`);
      fetchProducts();
      closeActionModal();
    } catch (error) {
      console.error("Action error:", error);
      toast.error(error?.message || "Failed to perform action");
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusBadge = (status) => {
    if (status === "approved") {
      return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">Approved</span>;
    } else if (status === "rejected") {
      return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">Rejected</span>;
    } else {
      return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">Pending</span>;
    }
  };

  const getStatusIcon = (status) => {
    if (status === "approved") {
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    } else if (status === "rejected") {
      return <XCircle className="w-4 h-4 text-red-500" />;
    } else {
      return <Clock className="w-4 h-4 text-yellow-500" />;
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
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manage Products</h1>
          <p className="text-gray-500 mt-1">Review and moderate product listings</p>
        </div>
        <div className="text-sm text-gray-500">
          Total Products: <span className="font-semibold text-gray-900">{products.length}</span>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 mb-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search products by title, category or seller..."
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
          <option value="pending">⏳ Pending</option>
          <option value="approved">✅ Approved</option>
          <option value="rejected">❌ Rejected</option>
        </select>
      </div>

      {filteredProducts.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center text-gray-500 border border-gray-100">
          <Package className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <p className="text-lg font-medium">No products found</p>
          <p className="text-sm">Try adjusting your search or filter</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProducts.map((product) => (
            <Card key={product._id} className="p-4 border border-gray-100 hover:shadow-lg transition">
              <div className="relative h-40 bg-gray-100 rounded-lg overflow-hidden">
                {product.images && product.images.length > 0 ? (
                  <img src={product.images[0]} alt={product.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <Package className="w-8 h-8" />
                  </div>
                )}
                <div className="absolute top-2 right-2">
                  {getStatusBadge(product.adminStatus || "pending")}
                </div>
                <div className="absolute top-2 left-2">
                  {getStatusIcon(product.adminStatus || "pending")}
                </div>
              </div>
              <div className="mt-3">
                <h3 className="font-semibold text-gray-900 line-clamp-1">{product.title}</h3>
                <p className="text-sm text-gray-500">{product.category}</p>
                <p className="text-lg font-bold text-emerald-600 mt-1">{formatPrice(product.price)}</p>
                <p className="text-sm text-gray-500">Seller: {product.sellerInfo?.name || "Unknown"}</p>
                <p className="text-xs text-gray-400">Stock: {product.stock || 0}</p>
              </div>
              <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
                <Link href={`/products/${product._id}`} className="flex-1">
                  <Button size="sm" variant="bordered" className="w-full border-emerald-500 text-emerald-600">
                    <Eye className="w-4 h-4 mr-1" /> View
                  </Button>
                </Link>
                
                {product.adminStatus !== "approved" && (
                  <Button
                    size="sm"
                    variant="light"
                    onClick={() => openActionModal(product, "Approve")}
                    className="text-green-600 hover:bg-green-50"
                  >
                    <CheckCircle className="w-4 h-4" />
                  </Button>
                )}
                
                {product.adminStatus !== "rejected" && (
                  <Button
                    size="sm"
                    variant="light"
                    onClick={() => openActionModal(product, "Reject")}
                    className="text-red-600 hover:bg-red-50"
                  >
                    <XCircle className="w-4 h-4" />
                  </Button>
                )}
                
                <Button
                  size="sm"
                  variant="light"
                  color="danger"
                  onClick={() => openActionModal(product, "Delete")}
                  className="text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Action Modal */}
      {isActionModalOpen && selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                actionType === "Delete" ? "bg-red-100" :
                actionType === "Reject" ? "bg-red-100" :
                "bg-green-100"
              }`}>
                {actionType === "Delete" ? (
                  <Trash2 className="w-6 h-6 text-red-500" />
                ) : actionType === "Reject" ? (
                  <XCircle className="w-6 h-6 text-red-500" />
                ) : (
                  <CheckCircle className="w-6 h-6 text-green-500" />
                )}
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">{actionType} Product</h3>
                <p className="text-sm text-gray-500">
                  {actionType === "Approve" 
                    ? "Approve this product for listing?"
                    : actionType === "Reject" 
                    ? "Reject this product listing?"
                    : "Delete this product permanently?"
                  }
                </p>
              </div>
            </div>

            <div className="py-2">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                {selectedProduct.images && selectedProduct.images.length > 0 ? (
                  <img src={selectedProduct.images[0]} alt={selectedProduct.title} className="w-12 h-12 rounded object-cover" />
                ) : (
                  <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
                    <Package className="w-6 h-6 text-gray-400" />
                  </div>
                )}
                <div>
                  <p className="font-medium text-gray-900">{selectedProduct.title}</p>
                  <p className="text-sm text-gray-500">{formatPrice(selectedProduct.price)}</p>
                  <p className="text-xs text-gray-400">Status: {selectedProduct.adminStatus || "pending"}</p>
                </div>
              </div>
              <p className="text-xs text-red-400 mt-3">⚠️ This action cannot be undone.</p>
            </div>

            <div className="flex gap-3 mt-6">
              <Button
                variant="light"
                onClick={closeActionModal}
                className="flex-1 text-gray-600 hover:bg-gray-100"
              >
                Cancel
              </Button>
              <Button
                onClick={handleAction}
                isLoading={isProcessing}
                className={`flex-1 ${
                  actionType === "Delete" || actionType === "Reject" ? "bg-red-500 text-white hover:bg-red-600" :
                  "bg-green-500 text-white hover:bg-green-600"
                }`}
              >
                Yes, {actionType}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}