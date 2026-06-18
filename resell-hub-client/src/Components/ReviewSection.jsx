"use client";

import React, { useState, useEffect } from "react";
import { Button, Card, Spinner, Modal } from "@heroui/react";
import Link from "next/link";
import { getProductReviews, addReview, deleteReview } from "@/lib/api/reviews";
import StarRating from "./StarRating";
import { useSession } from "@/lib/auth-client";
import toast from "react-hot-toast";

export default function ReviewSection({ productId, onReviewChange }) {
  const { data: session } = useSession();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [reviewToDelete, setReviewToDelete] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

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
        await fetchReviews();
        if (onReviewChange) {
          onReviewChange();
        }
      } else {
        toast.error(data.message || "Failed to submit review");
      }
    } catch (error) {
      toast.error("Error submitting review");
    } finally {
      setSubmitting(false);
    }
  };

  const openDeleteModal = (reviewId) => {
    setReviewToDelete(reviewId);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setReviewToDelete(null);
  };

  const handleConfirmDelete = async () => {
    if (!reviewToDelete) return;

    try {
      setDeleting(reviewToDelete);
      const data = await deleteReview(reviewToDelete);

      if (data.success) {
        toast.success("Review deleted successfully!");
        await fetchReviews();
        if (onReviewChange) {
          onReviewChange();
        }
      } else {
        toast.error(data.message || "Failed to delete review");
      }
    } catch (error) {
      toast.error("Error deleting review");
    } finally {
      setDeleting(null);
      closeDeleteModal();
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

                {session?.user && review.userId === session.user.id && (
                  <Button
                    isIconOnly
                    size="sm"
                    variant="light"
                    color="danger"
                    isLoading={deleting === review._id}
                    onClick={() => openDeleteModal(review._id)}
                    className="text-red-500 hover:bg-red-50 min-w-8"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <Modal>
        <Modal.Backdrop isOpen={isDeleteModalOpen} onOpenChange={(open) => !open && closeDeleteModal()}>
          <Modal.Container>
            <Modal.Dialog className="max-w-md">
              {({ close }) => (
                <>
                  <Modal.Header>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                        <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </div>
                      <div>
                        <Modal.Heading className="text-xl font-bold text-gray-900">
                          Delete Review
                        </Modal.Heading>
                        <p className="text-sm text-gray-500 font-normal">This action cannot be undone</p>
                      </div>
                    </div>
                  </Modal.Header>
                  <Modal.Body>
                    <div className="py-2">
                      <p className="text-gray-600">
                        Are you sure you want to delete this review? This will permanently remove your rating and comment from this product.
                      </p>
                      <div className="mt-4 p-4 bg-amber-50 rounded-lg border border-amber-200">
                        <div className="flex items-start gap-2">
                          <svg className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                          <p className="text-sm text-amber-700">
                            This action is permanent and cannot be recovered.
                          </p>
                        </div>
                      </div>
                    </div>
                  </Modal.Body>
                  <Modal.Footer className="flex gap-3">
                    <Button
                      variant="light"
                      onPress={() => {
                        close();
                        closeDeleteModal();
                      }}
                      className="flex-1 text-gray-600 hover:bg-gray-100"
                    >
                      Cancel
                    </Button>
                    <Button
                      color="danger"
                      onPress={async () => {
                        await handleConfirmDelete();
                        close();
                      }}
                      isLoading={deleting === reviewToDelete}
                      className="flex-1 bg-red-500 text-white hover:bg-red-600"
                    >
                      Yes, Delete Review
                    </Button>
                  </Modal.Footer>
                </>
              )}
            </Modal.Dialog>
          </Modal.Container>
        </Modal.Backdrop>
      </Modal>
    </div>
  );
}