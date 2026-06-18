"use client";

import Link from "next/link";
import { Button } from "@heroui/react";

const formatPrice = (price) => {
  return new Intl.NumberFormat('en-BD', {
    style: 'currency',
    currency: 'BDT',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(price);
};

export default function ProductCard({ product }) {
  return (
    <div className="group bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col">
      {/* Image Section */}
      <Link href={`/product/${product._id}`} className="block">
        <div className="relative h-48 bg-gray-100 overflow-hidden">
          {product.images && product.images.length > 0 ? (
            <img
              src={product.images[0]}
              alt={product.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-400">
              No Image
            </div>
          )}
          <div className={`absolute top-2 right-2 text-white text-xs px-2 py-1 rounded-full ${
            product.status === 'available' ? 'bg-emerald-500' : 'bg-red-500'
          }`}>
            {product.status}
          </div>
        </div>
      </Link>

      {/* Content Section */}
      <div className="p-4 flex flex-col flex-1">
        <Link href={`/product/${product._id}`} className="block flex-1">
          <h3 className="font-semibold text-gray-900 text-sm mb-1 line-clamp-1 hover:text-emerald-600 transition">
            {product.title}
          </h3>
          <p className="text-sm text-gray-500 mb-2">
            {product.category}
          </p>
          <div className="flex justify-between items-center mb-3">
            <span className="text-lg font-bold text-emerald-600">
              {formatPrice(product.price)}
            </span>
            <span className="text-xs text-gray-400">
              {product.condition}
            </span>
          </div>
        </Link>

        {/* View Details Button */}
        <Link href={`/products/${product._id}`} className="w-full">
          <Button
            className="w-full bg-emerald-500 text-white hover:bg-emerald-600 transition-colors"
            size="sm"
          >
            View Details
          </Button>
        </Link>
      </div>
    </div>
  );
}