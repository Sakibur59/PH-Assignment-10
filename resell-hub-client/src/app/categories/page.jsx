"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Button, Card, Spinner } from "@heroui/react";
import { getProducts } from "@/lib/api/products";

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
  "Health": "💊",
  "Beauty": "💄",
  "Home": "🏠",
  "Garden": "🌱",
  "Music": "🎵",
  "Other": "📦"
};

const CATEGORY_COLORS = {
  "Electronics": "from-blue-500 to-cyan-400",
  "Furniture": "from-amber-500 to-orange-400",
  "Vehicles": "from-red-500 to-rose-400",
  "Fashion": "from-purple-500 to-pink-400",
  "Mobile Phones": "from-emerald-500 to-teal-400",
  "Appliances": "from-indigo-500 to-blue-400",
  "Books": "from-yellow-500 to-amber-400",
  "Sports": "from-green-500 to-emerald-400",
  "Toys": "from-pink-500 to-rose-400",
  "Games": "from-violet-500 to-purple-400",
  "Health": "from-red-500 to-pink-400",
  "Beauty": "from-pink-500 to-purple-400",
  "Home": "from-orange-500 to-yellow-400",
  "Garden": "from-green-500 to-lime-400",
  "Music": "from-indigo-500 to-violet-400",
  "Other": "from-gray-500 to-gray-400"
};

const getCategoryIcon = (category) => {
  return CATEGORY_ICONS[category] || "📦";
};

const getCategoryColor = (category) => {
  return CATEGORY_COLORS[category] || "from-gray-500 to-gray-400";
};

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalProducts, setTotalProducts] = useState(0);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getProducts();
        if (data.success) {
          const products = data.data;
          setTotalProducts(products.length);

          // Group products by category
          const categoryMap = {};
          products.forEach(product => {
            const cat = product.category || "Other";
            if (!categoryMap[cat]) {
              categoryMap[cat] = [];
            }
            categoryMap[cat].push(product);
          });

          // Convert to array with counts and sample products
          const categoryArray = Object.keys(categoryMap).map(cat => ({
            name: cat,
            count: categoryMap[cat].length,
            products: categoryMap[cat].slice(0, 4), // Show up to 4 sample products
            averagePrice: categoryMap[cat].reduce((sum, p) => sum + p.price, 0) / categoryMap[cat].length,
          }));

          // Sort by count (most popular first)
          categoryArray.sort((a, b) => b.count - a.count);

          setCategories(categoryArray);
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

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-BD', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Spinner size="lg" color="success" />
          <p className="mt-4 text-gray-500">Loading categories...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-5xl mb-4">😕</div>
          <p className="text-red-500 text-lg">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 bg-emerald-500 text-white px-6 py-2 rounded-lg hover:bg-emerald-600"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">📂</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">No Categories Found</h1>
          <p className="text-gray-500">No products available to create categories.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-emerald-500 to-teal-400 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-3">Categories</h1>
          <p className="text-xl text-white/90 max-w-2xl">
            Explore {totalProducts} products across {categories.length} categories
          </p>
        </div>
      </section>

      {/* Categories Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => (
            <Link
              key={category.name}
              href={`/products?category=${encodeURIComponent(category.name)}`}
              className="group block"
            >
              <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 border border-gray-100">
                {/* Category Header with Gradient */}
                <div className={`bg-gradient-to-r ${getCategoryColor(category.name)} p-6 text-white`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-4xl mb-1">{getCategoryIcon(category.name)}</div>
                      <h3 className="text-xl font-bold">{category.name}</h3>
                      <p className="text-sm text-white/80">{category.count} products</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold">{category.count}</p>
                      <p className="text-xs text-white/70">Items</p>
                    </div>
                  </div>
                </div>

                {/* Sample Products */}
                <div className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-gray-600">Popular in this category</span>
                    <span className="text-xs text-emerald-600 group-hover:underline">
                      View All →
                    </span>
                  </div>

                  {category.products.length > 0 ? (
                    <div className="space-y-2">
                      {category.products.map((product) => (
                        <div
                          key={product._id}
                          className="flex items-center justify-between text-sm hover:bg-gray-50 p-2 rounded-lg transition"
                        >
                          <div className="flex items-center gap-2">
                            {product.images && product.images.length > 0 ? (
                              <img
                                src={product.images[0]}
                                alt={product.title}
                                className="w-8 h-8 rounded object-cover"
                              />
                            ) : (
                              <div className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center text-xs">
                                📦
                              </div>
                            )}
                            <span className="text-gray-700 truncate max-w-[150px]">
                              {product.title}
                            </span>
                          </div>
                          <span className="font-semibold text-emerald-600">
                            {formatPrice(product.price)}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-400">No products yet</p>
                  )}

                  {/* Avg Price */}
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Avg. Price</span>
                      <span className="font-semibold">{formatPrice(category.averagePrice)}</span>
                    </div>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Bottom CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-gradient-to-r from-emerald-500 to-teal-400 rounded-2xl p-8 md:p-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Can't Find What You're Looking For?</h2>
          <p className="text-xl text-white/90 mb-6 max-w-2xl mx-auto">
            Browse all products or contact us for specific requests
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/products">
              <Button className="bg-white text-emerald-600 hover:bg-gray-100 px-8 py-6 text-lg">
                All Products
              </Button>
            </Link>
            <Link href="/contact">
              <Button variant="bordered" className="border-white text-white hover:bg-white/10 px-8 py-6 text-lg">
                Contact Us
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}