// app/dashboard/seller/my-products/page.jsx
"use client";

import { useState, useEffect } from "react";
import { useSession } from "@/lib/auth-client";
import { getSellerProducts, deleteProduct, updateProduct } from "@/lib/api/seller";
import { Spinner, Card, Button, Input } from "@heroui/react";
import Link from "next/link";
import toast from "react-hot-toast";
import { Package, Pencil, Trash2, Eye, X, Clock, CheckCircle, XCircle, ChevronDown, ChevronUp } from "lucide-react";

const CATEGORIES = ["Electronics", "Furniture", "Vehicles", "Fashion", "Mobile Phones", "Appliances", "Books", "Sports", "Toys", "Games", "Other"];
const CONDITIONS = ["Excellent", "Good", "Fair"];

const formatPrice = (price) => {
  return new Intl.NumberFormat('en-BD', {
    style: 'currency',
    currency: 'BDT',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(price);
};

// Admin Status Badge Component
const AdminStatusBadge = ({ status }) => {
  if (!status || status === "approved") {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
        <CheckCircle className="w-3 h-3" /> Approved
      </span>
    );
  } else if (status === "pending") {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
        <Clock className="w-3 h-3" /> Pending
      </span>
    );
  } else if (status === "rejected") {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
        <XCircle className="w-3 h-3" /> Rejected
      </span>
    );
  }
  return null;
};

export default function MyProducts() {
  const { data: session } = useSession();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedProductId, setExpandedProductId] = useState(null);

  // Edit Modal States
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [editFormData, setEditFormData] = useState({
    title: "",
    category: "",
    condition: "",
    price: "",
    stock: "",
    description: "",
    images: [],
    status: "",
  });
  const [isEditLoading, setIsEditLoading] = useState(false);
  const [imageInput, setImageInput] = useState("");

  // Delete Modal States
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingProductId, setDeletingProductId] = useState(null);
  const [deletingProductTitle, setDeletingProductTitle] = useState("");
  const [isDeleteLoading, setIsDeleteLoading] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, [session]);

  const fetchProducts = async () => {
    try {
      const data = await getSellerProducts(session?.user?.id);
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

  const toggleExpand = (productId) => {
    setExpandedProductId(expandedProductId === productId ? null : productId);
  };

  // Open Edit Modal
  const openEditModal = (product) => {
    setEditingProduct(product);
    setEditFormData({
      title: product.title || "",
      category: product.category || "",
      condition: product.condition || "",
      price: product.price || "",
      stock: product.stock || "",
      description: product.description || "",
      images: product.images || [],
      status: product.status || "available",
    });
    setImageInput("");
    setIsEditModalOpen(true);
  };

  // Close Edit Modal
  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setEditingProduct(null);
    setImageInput("");
  };

  // Handle Edit Form Change
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle Image Add
  const addImage = () => {
    if (imageInput && editFormData.images.length < 4) {
      setEditFormData((prev) => ({
        ...prev,
        images: [...prev.images, imageInput],
      }));
      setImageInput("");
    }
  };

  // Handle Image Remove
  const removeImage = (index) => {
    setEditFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  // Handle Edit Submit
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setIsEditLoading(true);

    try {
      const productData = {
        ...editFormData,
        price: parseFloat(editFormData.price),
        stock: parseInt(editFormData.stock),
        images: editFormData.images.filter(img => img.trim() !== ""),
      };

      const response = await updateProduct(editingProduct._id, productData);

      if (response.success) {
        toast.success("Product updated successfully!");
        closeEditModal();
        fetchProducts();
      } else {
        toast.error(response.message || "Failed to update product");
      }
    } catch (error) {
      console.error("Error updating product:", error);
      toast.error("Failed to update product");
    } finally {
      setIsEditLoading(false);
    }
  };

  // Open Delete Modal
  const openDeleteModal = (productId, productTitle) => {
    setDeletingProductId(productId);
    setDeletingProductTitle(productTitle);
    setIsDeleteModalOpen(true);
  };

  // Close Delete Modal
  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setDeletingProductId(null);
    setDeletingProductTitle("");
  };

  // Handle Delete
  const handleDelete = async () => {
    if (!deletingProductId) return;

    setIsDeleteLoading(true);

    try {
      const data = await deleteProduct(deletingProductId);

      if (data.success) {
        toast.success("Product deleted successfully");
        closeDeleteModal();
        fetchProducts();
      } else {
        toast.error(data.message || "Failed to delete product");
      }
    } catch (error) {
      toast.error("Error deleting product");
    } finally {
      setIsDeleteLoading(false);
    }
  };

  const filteredProducts = products.filter(p =>
    p.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          <h1 className="text-2xl font-bold text-gray-900">My Products</h1>
          <p className="text-gray-500 mt-1">Manage your products</p>
        </div>
        <Link href="/dashboard/seller/add-product">
          <Button className="bg-emerald-500 text-white hover:bg-emerald-600">
            Add New Product
          </Button>
        </Link>
      </div>

      <div className="mb-4">
        <Input
          type="text"
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md"
        />
      </div>

      {filteredProducts.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center text-gray-500 border border-gray-100">
          <Package className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <p className="text-lg font-medium">No products found</p>
          <p className="text-sm">Start by adding your first product</p>
          <Link href="/dashboard/seller/add-product" className="mt-4 inline-block bg-emerald-500 text-white px-6 py-2 rounded-lg hover:bg-emerald-600">
            Add Product
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredProducts.map((product) => (
            <Card key={product._id} className="border border-gray-100 overflow-hidden">
              {/* Product Header - Always Visible */}
              <div 
                className="p-4 hover:bg-gray-50 transition cursor-pointer"
                onClick={() => toggleExpand(product._id)}
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex items-center gap-3 flex-1 min-w-[200px]">
                    <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                      {product.images && product.images.length > 0 ? (
                        <img src={product.images[0]} alt={product.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <Package className="w-6 h-6" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{product.title}</h3>
                      <p className="text-sm text-gray-500">{product.category}</p>
                      <p className="text-lg font-bold text-emerald-600">{formatPrice(product.price)}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {/* Product Status */}
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      product.status === 'available' ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'
                    }`}>
                      {product.status === 'available' ? 'Available' : 'Sold'}
                    </span>
                    
                    {/* Admin Status */}
                    <AdminStatusBadge status={product.adminStatus} />

                    {/* Expand/Collapse Button */}
                    <Button
                      size="sm"
                      variant="light"
                      isIconOnly
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleExpand(product._id);
                      }}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      {expandedProductId === product._id ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Product Details - Expandable */}
              {expandedProductId === product._id && (
                <div className="border-t border-gray-100 p-4 bg-gray-50">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Left Column - Product Info */}
                    <div>
                      <p className="text-sm text-gray-600 mb-1">
                        <span className="font-medium">Description:</span> {product.description || "N/A"}
                      </p>
                      <p className="text-sm text-gray-600 mb-1">
                        <span className="font-medium">Condition:</span> {product.condition || "N/A"}
                      </p>
                      <p className="text-sm text-gray-600 mb-1">
                        <span className="font-medium">Stock:</span> {product.stock || 0}
                      </p>
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Status:</span> {product.status || "N/A"}
                      </p>
                    </div>

                    {/* Right Column - Seller Info */}
                    <div>
                      <p className="text-sm text-gray-600 mb-1">
                        <span className="font-medium">Admin Status:</span> {product.adminStatus || "pending"}
                      </p>
                      <p className="text-sm text-gray-600 mb-1">
                        <span className="font-medium">Created:</span> {product.createdAt ? new Date(product.createdAt).toLocaleDateString() : "N/A"}
                      </p>
                      {product.adminStatus === "rejected" && (
                        <p className="text-sm text-red-600 mt-2">
                          ⚠️ This product has been rejected by admin.
                        </p>
                      )}
                      {product.adminStatus === "pending" && (
                        <p className="text-sm text-yellow-600 mt-2">
                          ⏳ Waiting for admin approval.
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 mt-4 pt-4 border-t border-gray-200">
                    <Link href={`/products/${product._id}`} className="flex-1">
                      <Button size="sm" variant="bordered" className="w-full border-emerald-500 text-emerald-600">
                        <Eye className="w-4 h-4 mr-1" /> View Details
                      </Button>
                    </Link>
                    
                    {product.adminStatus !== "rejected" ? (
                      <Button
                        size="sm"
                        variant="bordered"
                        className="flex-1 border-blue-500 text-blue-600"
                        onClick={() => openEditModal(product)}
                      >
                        <Pencil className="w-4 h-4 mr-1" /> Edit Product
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="bordered"
                        className="flex-1 border-gray-300 text-gray-400 cursor-not-allowed"
                        disabled
                      >
                        <Pencil className="w-4 h-4 mr-1" /> Edit (Rejected)
                      </Button>
                    )}
                    
                    <Button
                      size="sm"
                      color="danger"
                      variant="light"
                      onClick={() => openDeleteModal(product._id, product.title)}
                      className="text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Edit Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Edit Product</h3>
                <p className="text-sm text-gray-500">Update your product information</p>
              </div>
              <button
                onClick={closeEditModal}
                className="p-1 rounded-lg hover:bg-gray-100"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Product Title</label>
                <Input
                  name="title"
                  value={editFormData.title}
                  onChange={handleEditChange}
                  placeholder="Enter product title"
                  required
                  className="w-full"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    name="category"
                    value={editFormData.category}
                    onChange={handleEditChange}
                    className="w-full rounded-xl border border-gray-200 px-3 py-2.5 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition-colors text-sm bg-white"
                    required
                  >
                    <option value="">Select Category</option>
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Condition</label>
                  <select
                    name="condition"
                    value={editFormData.condition}
                    onChange={handleEditChange}
                    className="w-full rounded-xl border border-gray-200 px-3 py-2.5 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition-colors text-sm bg-white"
                    required
                  >
                    <option value="">Select Condition</option>
                    {CONDITIONS.map((cond) => (
                      <option key={cond} value={cond}>{cond}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price (BDT)</label>
                  <Input
                    type="number"
                    name="price"
                    value={editFormData.price}
                    onChange={handleEditChange}
                    placeholder="Enter price"
                    required
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Stock</label>
                  <Input
                    type="number"
                    name="stock"
                    value={editFormData.stock}
                    onChange={handleEditChange}
                    placeholder="Enter stock"
                    required
                    className="w-full"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  name="description"
                  value={editFormData.description}
                  onChange={handleEditChange}
                  placeholder="Describe your product"
                  rows={3}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition-colors text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Product Images</label>
                <div className="flex gap-2 mb-2">
                  <Input
                    value={imageInput}
                    onChange={(e) => setImageInput(e.target.value)}
                    placeholder="Enter image URL"
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    onClick={addImage}
                    className="bg-emerald-500 text-white hover:bg-emerald-600"
                    size="sm"
                  >
                    Add
                  </Button>
                </div>
                
                {editFormData.images.length > 0 && (
                  <div className="flex gap-2 flex-wrap mt-2">
                    {editFormData.images.map((url, index) => (
                      <div key={index} className="relative group">
                        <img 
                          src={url} 
                          alt={`Product ${index + 1}`} 
                          className="w-16 h-16 object-cover rounded-lg border border-gray-200"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600 transition"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <p className="text-xs text-gray-400 mt-1">Maximum 4 images. Enter image URL and click Add.</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  name="status"
                  value={editFormData.status}
                  onChange={handleEditChange}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2.5 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition-colors text-sm bg-white"
                >
                  <option value="available">Available</option>
                  <option value="sold">Sold</option>
                </select>
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  type="submit"
                  isLoading={isEditLoading}
                  className="flex-1 bg-emerald-500 text-white hover:bg-emerald-600"
                >
                  Update Product
                </Button>
                <Button
                  type="button"
                  variant="light"
                  onClick={closeEditModal}
                  className="text-gray-600 hover:bg-gray-100"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Delete Product</h3>
                <p className="text-sm text-gray-500">This action cannot be undone</p>
              </div>
            </div>

            <div className="py-2">
              <p className="text-gray-600">
                Are you sure you want to delete <span className="font-semibold">"{deletingProductTitle}"</span>?
                This will permanently remove this product from the marketplace.
              </p>
              <div className="mt-4 p-4 bg-amber-50 rounded-lg border border-amber-200">
                <div className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <p className="text-sm text-amber-700">
                    This action is permanent and cannot be recovered. All associated data will be removed.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button
                variant="light"
                onClick={closeDeleteModal}
                className="flex-1 text-gray-600 hover:bg-gray-100"
              >
                Cancel
              </Button>
              <Button
                color="danger"
                onClick={handleDelete}
                isLoading={isDeleteLoading}
                className="flex-1 bg-red-500 text-white hover:bg-red-600"
              >
                Yes, Delete Product
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}