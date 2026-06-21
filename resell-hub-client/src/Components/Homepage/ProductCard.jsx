"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@heroui/react";
import { useSession } from "@/lib/auth-client";
import { addToWishlist, removeFromWishlist, checkWishlist } from "@/lib/api/wishlist";
import { getUserById } from "@/lib/api/user";
import toast from "react-hot-toast";

const formatPrice = (price) => {
  return new Intl.NumberFormat("en-BD", {
    style: "currency",
    currency: "BDT",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
};

export default function ProductCard({ product }) {
  const { data: session } = useSession();
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [userData, setUserData] = useState(null);

  const userRole = session?.user?.role;
  const isBuyer = userRole === "buyer";

  const isProductVisible = !product.adminStatus || product.adminStatus === "approved";


  useEffect(() => {
    const fetchUserData = async () => {
      if (session?.user?.id) {
        try {
          const data = await getUserById(session.user.id);
          if (data.success) {
            setUserData(data.data);
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      }
    };
    fetchUserData();
  }, [session]);

  useEffect(() => {
    if (session?.user && isBuyer && isProductVisible && !userData?.isBlocked) {
      checkWishlistStatus();
    }
  }, [session, product._id, isBuyer, isProductVisible, userData]);

  const checkWishlistStatus = async () => {
    try {
      const data = await checkWishlist(session.user.id, product._id);
      if (data.success) {
        setIsWishlisted(data.inWishlist);
      }
    } catch (error) {
      console.error("Error checking wishlist:", error);
    }
  };

  const handleWishlistToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!session?.user) {
      toast.error("Please login to add to wishlist");
      return;
    }


    if (userData?.isBlocked) {
      toast.error("Your account has been blocked. Please contact support.");
      return;
    }

    if (!isBuyer) {
      toast.error("Only buyers can add items to wishlist");
      return;
    }

    setIsLoading(true);

    try {
      if (isWishlisted) {
        const data = await removeFromWishlist({
          userId: session.user.id,
          productId: product._id,
        });
        if (data.success) {
          setIsWishlisted(false);
          toast.success("Removed from wishlist");
        }
      } else {
        const data = await addToWishlist({
          userId: session.user.id,
          productId: product._id,
        });
        if (data.success) {
          setIsWishlisted(true);
          toast.success("Added to wishlist");
        }
      }
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="group bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col relative">
      {/* Image Section */}
      <Link href={`/products/${product._id}`} className="block">
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
          
          {/* Stock Badge */}
          <div
            className={`absolute top-2 left-2 text-white text-xs px-2 py-1 rounded-full ${
              product.stock > 0 ? "bg-emerald-500" : "bg-red-500"
            }`}
          >
            {product.stock > 0 ? `${product.stock} in stock` : "Out of Stock"}
          </div>

          {product.adminStatus && product.adminStatus !== "approved" && (
            <div
              className={`absolute top-2 right-2 text-white text-xs px-2 py-1 rounded-full ${
                product.adminStatus === "pending"
                  ? "bg-yellow-500"
                  : product.adminStatus === "rejected"
                  ? "bg-red-500"
                  : "bg-green-500"
              }`}
            >
              {product.adminStatus === "pending" && "⏳ Pending"}
              {product.adminStatus === "rejected" && "❌ Rejected"}
              {product.adminStatus === "approved" && "✅ Approved"}
            </div>
          )}
        </div>
      </Link>

      <div className="p-4 flex flex-col flex-1">
        <Link href={`/products/${product._id}`} className="block flex-1">
          <h3 className="font-semibold text-gray-900 text-sm mb-1 line-clamp-1 hover:text-emerald-600 transition">
            {product.title}
          </h3>
          <p className="text-sm text-gray-500 mb-2">{product.category}</p>
          <div className="flex justify-between items-center mb-3">
            <span className="text-lg font-bold text-emerald-600">
              {formatPrice(product.price)}
            </span>
            <span className="text-xs text-gray-400">{product.condition}</span>
          </div>
        </Link>

        <div className="flex gap-2">
          <Link href={`/products/${product._id}`} className="flex-1">
            <Button
              className="w-full bg-emerald-500 text-white hover:bg-emerald-600 transition-colors"
              size="sm"
            >
              View Details
            </Button>
          </Link>


          {isBuyer && isProductVisible && !userData?.isBlocked && (
            <button
              onClick={handleWishlistToggle}
              disabled={isLoading}
              className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all flex-shrink-0 ${
                isWishlisted
                  ? "bg-red-50 text-red-500 border border-red-200"
                  : "bg-gray-100 text-gray-400 hover:bg-red-50 hover:text-red-500"
              }`}
            >
              <svg
                className={`w-5 h-5 transition-all ${
                  isWishlisted ? "fill-red-500" : "fill-none"
                }`}
                fill={isWishlisted ? "currentColor" : "none"}
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}