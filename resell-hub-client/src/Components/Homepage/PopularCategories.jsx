
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getProducts } from "@/lib/api/products";
import { getCategories } from "@/lib/api/categories";


const CATEGORY_ICONS = {
  "Electronics": "💻",
  "Furniture": "🪑",
  "Vehicles": "🚗",
  "Fashion": "👕",
  "Mobile Phones": "📱",
  "Appliances": "🔌",
  "Books": "📚",
  "Sports": "⚽",
  "Toys": "🎮",
  "Games": "🎯",
  "Other": "📦"
};

const getCategoryIcon = (category) => {
  return CATEGORY_ICONS[category] || "📦";
};

export default function PopularCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

 useEffect(() => {
  const fetchCategories = async () => {
    try {
      const data = await getProducts();
      if (data.success) {

        const approvedProducts = data.data.filter(p => 
          !p.adminStatus || p.adminStatus === "approved"
        );
        const categoryData = await getCategories(approvedProducts);
        setCategories(categoryData);
      } else {
        setError(data.message || "Failed to fetch categories");
      }
    } catch (err) {
      setError("Error fetching categories");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  fetchCategories();
}, []);

  if (loading) {
    return (
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 bg-white">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-gray-900">Popular Categories</h2>
          <div className="h-4 w-48 bg-gray-200 rounded mx-auto mt-2 animate-pulse"></div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-gray-100 rounded-xl h-32 animate-pulse"></div>
          ))}
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 bg-white">
        <div className="text-center py-12">
          <p className="text-red-500 text-lg">{error}</p>
        </div>
      </section>
    );
  }

  if (categories.length === 0) {
    return (
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 bg-white">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-gray-900">Popular Categories</h2>
          <p className="text-gray-500 mt-2">Explore products by category</p>
        </div>
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No categories available</p>
        </div>
      </section>
    );
  }

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 bg-white">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold text-gray-900">Popular Categories</h2>
        <p className="text-gray-500 mt-2">Explore products by category</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {categories.map((category) => (
          <Link
            key={category.name}
            href={`/products?category=${encodeURIComponent(category.name)}`}
            className="group bg-gray-50 hover:bg-emerald-50 rounded-xl p-6 text-center transition-all duration-200 hover:shadow-md border border-transparent hover:border-emerald-200"
          >
            <div className="text-4xl mb-2">
              {getCategoryIcon(category.name)}
            </div>
            <h3 className="font-semibold text-gray-900 group-hover:text-emerald-600 transition">
              {category.name}
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              {category.count} item{category.count !== 1 ? 's' : ''}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}