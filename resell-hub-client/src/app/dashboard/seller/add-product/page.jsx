// app/dashboard/seller/add-product/page.jsx
"use client";

import { useState } from "react";
import { useSession } from "@/lib/auth-client";
import { Card, Button, Input, Select, SelectItem, Textarea } from "@heroui/react";
import { createProduct } from "@/lib/api/seller";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

const CATEGORIES = ["Electronics", "Furniture", "Vehicles", "Fashion", "Mobile Phones", "Appliances", "Books", "Sports", "Toys", "Games", "Other"];
const CONDITIONS = ["Excellent", "Good", "Fair"];

export default function AddProduct() {
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    category: "",
    condition: "",
    price: "",
    stock: "",
    description: "",
    images: [],
  });
  const [imageInput, setImageInput] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const addImage = () => {
    if (imageInput && formData.images.length < 4) {
      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, imageInput],
      }));
      setImageInput("");
    }
  };

  const removeImage = (index) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const productData = {
        ...formData,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
        sellerInfo: {
          userId: session.user.id,
          name: session.user.name,
          email: session.user.email,
          phone: session.user.phone || "",
        },
        status: "available",
      };

      const response = await createProduct(productData);

      if (response.success) {
        toast.success("Product added successfully!");
        router.push("/dashboard/seller/my-products");
      } else {
        toast.error(response.message || "Failed to add product");
      }
    } catch (error) {
      console.error("Error adding product:", error);
      toast.error("Failed to add product");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Add Product</h1>
      <p className="text-gray-500 mt-1">List a new product for sale</p>

      <Card className="mt-6 p-6 border border-gray-100">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Product Title</label>
            <Input
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Enter product title"
              required
              className="w-full"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition-colors"
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
                value={formData.condition}
                onChange={handleChange}
                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition-colors"
                required
              >
                <option value="">Select Condition</option>
                {CONDITIONS.map((cond) => (
                  <option key={cond} value={cond}>{cond}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price (BDT)</label>
              <Input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                placeholder="Enter price"
                required
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Stock Quantity</label>
              <Input
                type="number"
                name="stock"
                value={formData.stock}
                onChange={handleChange}
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
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe your product"
              rows={4}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition-colors"
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
              >
                Add
              </Button>
            </div>
            <div className="flex gap-2 flex-wrap">
              {formData.images.map((url, index) => (
                <div key={index} className="relative">
                  <img src={url} alt={`Product ${index + 1}`} className="w-20 h-20 object-cover rounded-lg border" />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>

          <Button
            type="submit"
            isLoading={loading}
            className="w-full bg-emerald-500 text-white hover:bg-emerald-600 h-12 text-lg"
          >
            Add Product
          </Button>
        </form>
      </Card>
    </div>
  );
}