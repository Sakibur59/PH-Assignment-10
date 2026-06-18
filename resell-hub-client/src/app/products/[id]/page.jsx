"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Button, Card, Spinner } from "@heroui/react";
import Link from "next/link";
import { getProducts } from "@/lib/api/products";
import { getProductReviews } from "@/lib/api/reviews";
import StarRating from "@/Components/StarRating";
import ReviewSection from "@/Components/ReviewSection";
import ProductCard from "@/Components/Homepage/ProductCard";

export default function ProductDetailsPage() {
  const params = useParams();
  const productId = params.id;
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [mainImage, setMainImage] = useState(""); // State for main image

  useEffect(() => {
    const fetchProductData = async () => {
      try {
        setLoading(true);
        
        // Fetch all products
        const productsData = await getProducts();
        
        if (productsData.success) {
          // Find the specific product
          const foundProduct = productsData.data.find(p => p._id === productId);
          
          if (foundProduct) {
            setProduct(foundProduct);
            // Set main image to first image
            if (foundProduct.images && foundProduct.images.length > 0) {
              setMainImage(foundProduct.images[0]);
            }
            
            // Get related products (same category, exclude current)
            const related = productsData.data
              .filter(p => p.category === foundProduct.category && p._id !== productId)
              .slice(0, 4);
            setRelatedProducts(related);
            
            // Fetch reviews for this product
            try {
              const reviewsData = await getProductReviews(productId);
              if (reviewsData.success && reviewsData.data) {
                const total = reviewsData.data.length;
                const avg = reviewsData.data.reduce((sum, r) => sum + r.rating, 0) / total || 0;
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

  // Handle Buy Now - Stripe Payment
  const handleBuyNow = async () => {
    if (!product || product.status !== 'available') {
      return;
    }

    try {
      setIsProcessing(true);
      
      // TODO: Implement Stripe payment integration
      console.log("Processing payment for product:", productId);
      alert("Stripe payment integration will be implemented here!");
      
    } catch (error) {
      console.error("Payment error:", error);
      alert("Payment failed. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle thumbnail click
  const handleThumbnailClick = (imageUrl) => {
    setMainImage(imageUrl);
  };

  // Format price
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-BD', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  // Loading state
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

  // Error state
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
        {/* Back Button */}
        <Link 
          href="/products" 
          className="inline-flex items-center text-emerald-600 hover:text-emerald-700 mb-6 transition-colors"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Products
        </Link>

        {/* Product Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Product Image */}
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
              <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-sm font-medium ${
                product.status === 'available' 
                  ? 'bg-emerald-500 text-white' 
                  : 'bg-red-500 text-white'
              }`}>
                {product.status === 'available' ? 'Available' : 'Sold'}
              </div>
            </div>
            
            {/* Thumbnail Images */}
            {product.images && product.images.length > 1 && (
              <div className="p-4 flex gap-2 overflow-x-auto">
                {product.images.map((img, index) => (
                  <div
                    key={index}
                    onClick={() => handleThumbnailClick(img)}
                    className={`w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                      mainImage === img 
                        ? 'border-emerald-500 shadow-md' 
                        : 'border-gray-200 hover:border-emerald-400'
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

          {/* Product Info */}
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
              
              {/* Rating */}
              <div className="flex items-center gap-2 mt-3">
                <StarRating rating={averageRating || product.averageRating || 0} readonly size="md" />
                <span className="text-sm text-gray-500">
                  ({totalReviews || product.totalReviews || 0} reviews)
                </span>
              </div>
            </div>

            {/* Price */}
            <div className="text-3xl md:text-4xl font-bold text-emerald-600">
              {formatPrice(product.price)}
            </div>

            {/* Description */}
            <div className="border-t border-gray-200 pt-4">
              <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
              <p className="text-gray-600 leading-relaxed">
                {product.description || "No description available"}
              </p>
            </div>

            {/* Seller Info */}
            {product.sellerInfo && (
              <div className="bg-gray-50 rounded-xl p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Seller Information</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-semibold">
                      {product.sellerInfo.name?.charAt(0) || "U"}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{product.sellerInfo.name || "N/A"}</p>
                      <p className="text-xs text-gray-500">Member since 2024</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                    <p className="text-gray-600">
                      <span className="font-medium">Email:</span> {product.sellerInfo.email || "N/A"}
                    </p>
                    <p className="text-gray-600">
                      <span className="font-medium">Phone:</span> {product.sellerInfo.phone || "N/A"}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Buy Now Button - Stripe Payment */}
            <div className="flex flex-col gap-3">
              {product.status === 'available' ? (
                <Button
                  onClick={handleBuyNow}
                  isLoading={isProcessing}
                  className="w-full bg-gradient-to-r from-emerald-600 to-teal-500 text-white hover:from-emerald-700 hover:to-teal-600 h-14 text-xl font-semibold shadow-lg shadow-emerald-200 rounded-xl"
                >
                  <span className="flex items-center gap-3">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                    Buy Now - {formatPrice(product.price)}
                  </span>
                </Button>
              ) : (
                <Button
                  disabled
                  className="w-full bg-gray-400 text-white h-14 text-xl font-semibold rounded-xl cursor-not-allowed"
                >
                  Sold Out
                </Button>
              )}

              {/* Secure Payment Badge */}
              {product.status === 'available' && (
                <div className="flex items-center justify-center gap-4 text-sm text-gray-500 bg-gray-50 px-4 py-3 rounded-lg">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Secure payment</span>
                  </div>
                  <span className="text-gray-300">|</span>
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                      <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                    </svg>
                    <span>100% buyer protection</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-12">
          <ReviewSection productId={productId} />
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Related Products</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {relatedProducts.map((relatedProduct) => (
                <ProductCard key={relatedProduct._id} product={relatedProduct} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}




