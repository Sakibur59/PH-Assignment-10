// components/ReviewSection.jsx
"use client";

import React, { useState, useEffect } from "react";
import { Button, Card, Spinner } from "@heroui/react";
import { getProductReviews, addReview } from "@/lib/api/reviews";
import StarRating from "./StarRating";
import { useSession } from "@/lib/auth-client";
import toast from "react-hot-toast";
import Link from "next/link";

export default function ReviewSection({ productId }) {
  const { data: session } = useSession();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (productId) {
      fetchReviews();
    }
  }, [productId]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const data = await getProductReviews(productId);
      if (data.success) {
        setReviews(data.data || []);
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    
    if (!session?.user) {
      toast.error("Please login to submit a review");
      return;
    }

    if (rating === 0) {
      toast.error("Please select a rating");
      return;
    }

    setSubmitting(true);

    try {
      const data = await addReview({
        productId: productId,
        userId: session.user.id,
        rating: rating,
        comment: comment
      });

      if (data.success) {
        toast.success("Review submitted successfully!");
        setRating(0);
        setComment("");
        fetchReviews();
      } else {
        toast.error(data.message || "Failed to submit review");
      }
    } catch (error) {
      toast.error("Error submitting review");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Spinner color="success" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-gray-900">
        Reviews ({reviews.length})
      </h3>

      {/* Review Form */}
      {session?.user ? (
        <Card className="p-6 border border-gray-100">
          <h4 className="font-semibold text-gray-900 mb-4">Write a Review</h4>
          <form onSubmit={handleSubmitReview} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rating
              </label>
              <StarRating
                rating={rating}
                onRatingChange={setRating}
                size="lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Comment
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your experience with this product..."
                rows={3}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition-colors"
              />
            </div>

            <Button
              type="submit"
              isLoading={submitting}
              className="bg-emerald-500 text-white hover:bg-emerald-600"
            >
              Submit Review
            </Button>
          </form>
        </Card>
      ) : (
        <Card className="p-6 border border-gray-100 text-center">
          <p className="text-gray-600">
            <Link href="/auth/signin" className="text-emerald-600 hover:underline font-medium">
              Sign in
            </Link> to write a review
          </p>
        </Card>
      )}

      {/* Reviews List */}
      {reviews.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p className="text-lg">No reviews yet</p>
          <p className="text-sm">Be the first to review this product!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <Card key={review._id} className="p-6 border border-gray-100">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-semibold text-sm">
                      {review.user?.name?.charAt(0) || "U"}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">
                        {review.user?.name || "Deleted User"}
                      </p>
                      <StarRating rating={review.rating} readonly size="sm" />
                    </div>
                  </div>
                  {review.comment && (
                    <p className="text-gray-600 mt-2">{review.comment}</p>
                  )}
                  <p className="text-xs text-gray-400 mt-2">
                    {new Date(review.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}