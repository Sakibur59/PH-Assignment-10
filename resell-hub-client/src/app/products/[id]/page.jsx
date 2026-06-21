"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button, Card, Spinner } from "@heroui/react";
import Link from "next/link";
import { getProducts } from "@/lib/api/products";
import { getProductReviews } from "@/lib/api/reviews";
import { createOrder } from "@/lib/api/orders";
import {
  addToWishlist,
  removeFromWishlist,
  checkWishlist,
} from "@/lib/api/wishlist";
import { useSession } from "@/lib/auth-client";
import { getUserById } from "@/lib/api/user";
import StarRating from "@/Components/StarRating";
import ReviewSection from "@/Components/ReviewSection";
import ProductCard from "@/Components/Homepage/ProductCard";
import toast from "react-hot-toast";

export default function ProductDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const productId = params.id;

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [mainImage, setMainImage] = useState("");
  const [userData, setUserData] = useState(null);

  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isWishlistLoading, setIsWishlistLoading] = useState(false);

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
    if (session?.user && productId) {
      checkWishlistStatus();
    }
  }, [session, productId]);

  const checkWishlistStatus = async () => {
    try {
      const data = await checkWishlist(session.user.id, productId);
      if (data.success) {
        setIsWishlisted(data.inWishlist);
      }
    } catch (error) {
      console.error("Error checking wishlist:", error);
    }
  };

  const refreshProductData = async () => {
    try {
      const productsData = await getProducts();
      if (productsData.success) {
        const foundProduct = productsData.data.find((p) => p._id === productId);
        if (foundProduct) {
          setProduct(foundProduct);
          setAverageRating(foundProduct.averageRating || 0);
          setTotalReviews(foundProduct.totalReviews || 0);
        }
      }
    } catch (err) {
      console.error("Error refreshing product data:", err);
    }
  };

  useEffect(() => {
    const fetchProductData = async () => {
      try {
        setLoading(true);

        const productsData = await getProducts();

        if (productsData.success) {
          const foundProduct = productsData.data.find(
            (p) => p._id === productId,
          );

          if (foundProduct) {
            setProduct(foundProduct);
            if (foundProduct.images && foundProduct.images.length > 0) {
              setMainImage(foundProduct.images[0]);
            }

            const related = productsData.data
              .filter(
                (p) =>
                  p.category === foundProduct.category && p._id !== productId,
              )
              .slice(0, 4);
            setRelatedProducts(related);

            try {
              const reviewsData = await getProductReviews(productId);
              if (reviewsData.success && reviewsData.data) {
                const total = reviewsData.data.length;
                const avg =
                  reviewsData.data.reduce((sum, r) => sum + r.rating, 0) /
                    total || 0;
                setAverageRating(avg);
                setTotalReviews(total);
              }
            } catch (reviewError) {
              console.error("Error fetching reviews:", reviewError);
            }
          } else {
            setError("Product not found");
          }
        } else {
          setError("Failed to fetch products");
        }
      } catch (err) {
        console.error("Error fetching product:", err);
        setError("Error loading product");
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      fetchProductData();
    }
  }, [productId]);

  const handleWishlistToggle = async () => {
    if (!session?.user) {
      toast.error("Please login to add to wishlist");
      router.push("/auth/signin");
      return;
    }

    if (userData?.isBlocked) {
      toast.error("Your account has been blocked. Please contact support.");
      return;
    }

    if (session.user?.role === "seller") {
      toast.error("Only buyers can add items to wishlist");
      return;
    }

    if (session.user?.role === "admin") {
      toast.error("Only buyers can add items to wishlist");
      return;
    }

    setIsWishlistLoading(true);

    try {
      if (isWishlisted) {
        const data = await removeFromWishlist({
          userId: session.user.id,
          productId: productId,
        });
        if (data.success) {
          setIsWishlisted(false);
          toast.success("Removed from wishlist");
        }
      } else {
        const data = await addToWishlist({
          userId: session.user.id,
          productId: productId,
        });
        if (data.success) {
          setIsWishlisted(true);
          toast.success("Added to wishlist");
        }
      }
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setIsWishlistLoading(false);
    }
  };

  const handleBuyNow = async () => {
    if (!product || product.status !== "available") {
      toast.error("Product is not available");
      return;
    }

    if (product.stock < 1) {
      toast.error("Product is out of stock");
      return;
    }

    if (!session?.user) {
      toast.error("Please login to purchase");
      router.push("/auth/signin");
      return;
    }

    if (userData?.isBlocked) {
      toast.error("Your account has been blocked. Please contact support.");
      return;
    }

    if (product.sellerInfo?.userId === session.user.id) {
      toast.error("You cannot purchase your own product");
      return;
    }

    if (session.user?.role === "seller") {
      toast.error("Only buyers can purchase products");
      return;
    }

    if (session.user?.role === "admin") {
      toast.error("Admin cannot purchase products");
      return;
    }

    try {
      setIsProcessing(true);

      const orderData = {
        userId: session.user.id,
        productId: productId,
        quantity: 1,
        paymentMethod: "stripe",
        paymentStatus: "pending",
        shippingAddress: {
          name: userData?.name || session.user.name || "",
          email: userData?.email || session.user.email || "",
          phone: userData?.phone || "",
          address: userData?.address || "",
          location: userData?.location || "",
        },
      };

      const orderResponse = await createOrder(orderData);

      if (!orderResponse.success) {
        toast.error(orderResponse.message || "Failed to create order");
        return;
      }

      const orderId = orderResponse.data._id;

      const stripeResponse = await fetch("/api/checkout_session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId: productId,
          productTitle: product.title,
          productPrice: product.price,
          productImage: product.images?.[0] || null,
          userId: session.user.id,
          orderId: orderId,
        }),
      });

      const stripeData = await stripeResponse.json();

      if (stripeData.success && stripeData.url) {
        window.location.href = stripeData.url;
      } else {
        toast.error(stripeData.error || "Failed to create payment session");
      }
    } catch (error) {
      console.error("Payment error:", error);
      toast.error("Failed to process payment. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };
  const handleThumbnailClick = (imageUrl) => {
    setMainImage(imageUrl);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("en-BD", {
      style: "currency",
      currency: "BDT",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const isSeller = session?.user?.id === product?.sellerInfo?.userId;

  const isBuyer = session?.user?.role === "buyer";

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Spinner size="lg" color="success" />
          <p className="mt-4 text-gray-500">Loading product details...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-5xl mb-4">😕</div>
          <p className="text-red-500 text-lg">{error || "Product not found"}</p>
          <Link href="/products">
            <Button className="mt-4 bg-emerald-500 text-white hover:bg-emerald-600">
              Back to Products
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link
          href="/products"
          className="inline-flex items-center text-emerald-600 hover:text-emerald-700 mb-6 transition-colors"
        >
          <svg
            className="w-5 h-5 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Back to Products
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100">
            <div className="relative h-96">
              {mainImage ? (
                <img
                  src={mainImage}
                  alt={product.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-400">
                  <div className="text-center">
                    <div className="text-6xl mb-2">📦</div>
                    <p>No Image Available</p>
                  </div>
                </div>
              )}
              <div
                className={`absolute top-4 right-4 px-3 py-1 rounded-full text-sm font-medium ${
                  product.status === "available"
                    ? "bg-emerald-500 text-white"
                    : "bg-red-500 text-white"
                }`}
              >
                {product.status === "available" ? "Available" : "Sold"}
              </div>
              <div className="absolute bottom-4 left-4 px-3 py-1 rounded-full text-sm font-medium bg-black/70 text-white">
                {product.stock > 0
                  ? `${product.stock} in stock`
                  : "Out of Stock"}
              </div>
            </div>

            {product.images && product.images.length > 1 && (
              <div className="p-4 flex gap-2 overflow-x-auto">
                {product.images.map((img, index) => (
                  <div
                    key={index}
                    onClick={() => handleThumbnailClick(img)}
                    className={`w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                      mainImage === img
                        ? "border-emerald-500 shadow-md"
                        : "border-gray-200 hover:border-emerald-400"
                    }`}
                  >
                    <img
                      src={img}
                      alt={`${product.title} ${index + 1}`}
                      className="w-full h-full object-cover hover:scale-105 transition-transform"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div>
              <div className="flex items-start justify-between">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                  {product.title}
                </h1>
              </div>

              <div className="flex items-center gap-4 mt-2 flex-wrap">
                <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                  {product.category}
                </span>
                <span className="text-sm text-gray-500">•</span>
                <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                  {product.condition}
                </span>
              </div>

              <div className="flex items-center gap-2 mt-3">
                <StarRating
                  rating={averageRating || product.averageRating || 0}
                  readonly
                  size="md"
                />
                <span className="text-sm text-gray-500">
                  ({totalReviews || product.totalReviews || 0} reviews)
                </span>
              </div>
            </div>

            <div className="text-3xl md:text-4xl font-bold text-emerald-600">
              {formatPrice(product.price)}
            </div>

            <div className="border-t border-gray-200 pt-4">
              <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
              <p className="text-gray-600 leading-relaxed">
                {product.description || "No description available"}
              </p>
            </div>

            {product.sellerInfo && (
              <div className="bg-gray-50 rounded-xl p-4">
                <h3 className="font-semibold text-gray-900 mb-3">
                  Seller Information
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-semibold">
                      {product.sellerInfo.name?.charAt(0) || "U"}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {product.sellerInfo.name || "N/A"}
                      </p>
                      <p className="text-xs text-gray-500">Member since 2024</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                    <p className="text-gray-600">
                      <span className="font-medium">Email:</span>{" "}
                      {product.sellerInfo.email || "N/A"}
                    </p>
                    <p className="text-gray-600">
                      <span className="font-medium">Phone:</span>{" "}
                      {product.sellerInfo.phone || "N/A"}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3">
              {product.status === "available" && product.stock > 0 ? (
                isSeller ? (
                  <Button
                    disabled
                    className="flex-1 bg-gray-400 text-white h-14 text-xl font-semibold rounded-xl cursor-not-allowed"
                  >
                    You cannot buy your own product
                  </Button>
                ) : !session?.user ? (
                  <Button
                    onClick={() => router.push("/auth/signin")}
                    className="flex-1 bg-gray-400 text-white h-14 text-xl font-semibold rounded-xl cursor-not-allowed"
                  >
                    Please login to purchase
                  </Button>
                ) : session?.user?.role !== "buyer" ? (
                  <Button
                    disabled
                    className="flex-1 bg-gray-400 text-white h-14 text-xl font-semibold rounded-xl cursor-not-allowed"
                  >
                    Only buyers can purchase products
                  </Button>
                ) : (
                  <Button
                    onClick={handleBuyNow}
                    isLoading={isProcessing}
                    className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-500 text-white hover:from-emerald-700 hover:to-teal-600 h-14 text-xl font-semibold shadow-lg shadow-emerald-200 rounded-xl"
                  >
                    <span className="flex items-center gap-3">
                      <svg
                        className="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                        />
                      </svg>
                      Buy Now - {formatPrice(product.price)}
                    </span>
                  </Button>
                )
              ) : (
                <Button
                  disabled
                  className="flex-1 bg-gray-400 text-white h-14 text-xl font-semibold rounded-xl cursor-not-allowed"
                >
                  {product.stock === 0 ? "Out of Stock" : "Sold Out"}
                </Button>
              )}

              {isBuyer && !isSeller && (
                <Button
                  onClick={handleWishlistToggle}
                  isLoading={isWishlistLoading}
                  variant="bordered"
                  className={`h-14 px-6 rounded-xl border-2 transition-all duration-200 ${
                    isWishlisted
                      ? "border-red-500 bg-red-50 text-red-500 hover:bg-red-100"
                      : "border-gray-300 text-gray-600 hover:border-red-400 hover:text-red-500"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <svg
                      className={`w-6 h-6 ${
                        isWishlisted ? "fill-red-500 text-red-500" : "fill-none"
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
                    {isWishlisted ? "Wishlisted" : "Add to Wishlist"}
                  </span>
                </Button>
              )}
            </div>

            {product.status === "available" &&
              product.stock > 0 &&
              isBuyer &&
              !isSeller && (
                <div className="flex items-center justify-center gap-4 text-sm text-gray-500 bg-gray-50 px-4 py-3 rounded-lg">
                  <div className="flex items-center gap-2">
                    <svg
                      className="w-5 h-5 text-emerald-500"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span>Secure payment</span>
                  </div>
                  <span className="text-gray-300">|</span>
                  <div className="flex items-center gap-2">
                    <svg
                      className="w-5 h-5 text-emerald-500"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9zM4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span>100% buyer protection</span>
                  </div>
                </div>
              )}
          </div>
        </div>

        <div className="mt-12">
          <ReviewSection
            productId={productId}
            onReviewChange={refreshProductData}
            isBuyer={isBuyer}
          />
        </div>

        {relatedProducts.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Related Products
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {relatedProducts.map((relatedProduct) => (
                <ProductCard
                  key={relatedProduct._id}
                  product={relatedProduct}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
