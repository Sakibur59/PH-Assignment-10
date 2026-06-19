"use client";

import { useState, useEffect } from "react";
import { useSession } from "@/lib/auth-client";
import { getWishlist } from "@/lib/api/wishlist";
import { Spinner } from "@heroui/react";
import Link from "next/link";
import ProductCard from "@/Components/Homepage/ProductCard";

export default function BuyerWishlist() {
  const { data: session } = useSession();
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        const data = await getWishlist(session?.user?.id);
        if (data.success) {
          setWishlist(data.data);
        }
      } catch (error) {
        console.error("Error fetching wishlist:", error);
      } finally {
        setLoading(false);
      }
    };

    if (session?.user?.id) {
      fetchWishlist();
    }
  }, [session]);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner color="success" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Wishlist</h1>
      <p className="text-gray-500 mt-1">Your saved items</p>

      {wishlist.length === 0 ? (
        <div className="mt-6 bg-white rounded-xl p-12 text-center text-gray-500 border border-gray-100">
          <div className="text-5xl mb-4">❤️</div>
          <p className="text-lg font-medium">No items in wishlist</p>
          <p className="text-sm">Save your favorite items here</p>
          <Link
            href="/products"
            className="mt-4 inline-block bg-emerald-500 text-white px-6 py-2 rounded-lg hover:bg-emerald-600"
          >
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {wishlist.map(
            (item) =>
              item.product && (
                <ProductCard key={item._id} product={item.product} />
              ),
          )}
        </div>
      )}
    </div>
  );
}
