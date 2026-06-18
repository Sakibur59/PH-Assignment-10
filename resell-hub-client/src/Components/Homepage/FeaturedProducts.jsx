"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button, Spinner } from "@heroui/react";

import { getProducts } from "@/lib/api/products";
import ProductCard from "./ProductCard";

export default function FeaturedProducts({ limit = 6 }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await getProducts();
        if (data.success) {
          setProducts(data.data.slice(0, limit));
        } else {
          setError(data.message || "Failed to fetch products");
        }
      } catch (err) {
        setError("Error fetching products");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [limit]);

  if (loading) {
    return (
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">
            Featured Products
          </h2>
          <div className="h-6 w-24 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="flex justify-center items-center py-20">
          <div className="text-center">
            <Spinner size="lg" color="success" />
            <p className="mt-4 text-gray-500 text-sm">Loading amazing products...</p>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center py-12">
          <div className="text-red-500 text-5xl mb-4">😕</div>
          <p className="text-red-500 text-lg">{error}</p>
          <Button
            className="mt-4 bg-emerald-500 text-white hover:bg-emerald-600"
            onClick={() => window.location.reload()}
          >
            Try Again
          </Button>
        </div>
      </section>
    );
  }

  if (products.length === 0) {
    return (
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">
            Featured Products
          </h2>
          <Link
            href="/products"
            className="text-emerald-600 hover:text-emerald-700 font-semibold"
          >
            View All →
          </Link>
        </div>
        <div className="text-center py-12">
          <div className="text-gray-400 text-5xl mb-4">📦</div>
          <p className="text-gray-500 text-lg">No products available yet</p>
          <p className="text-gray-400 text-sm mt-2">Check back soon for new listings</p>
        </div>
      </section>
    );
  }

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900">Featured Products</h2>
        <Link
          href="/products"
          className="text-emerald-600 hover:text-emerald-700 font-semibold flex items-center gap-1 transition-colors"
        >
          View All →
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>
    </section>
  );
}