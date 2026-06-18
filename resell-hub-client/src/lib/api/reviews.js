
import { serverFetch, serverMutation } from "../core/server";


export const getProductReviews = async (productId) => {
  return serverFetch(`/api/reviews/${productId}`);
};


export const addReview = async (reviewData) => {
  return serverMutation('/api/reviews', reviewData, 'POST');
};


export const updateReview = async (reviewId, reviewData) => {
  return serverMutation(`/api/reviews/${reviewId}`, reviewData, 'PUT');
};


export const deleteReview = async (reviewId) => {
  return serverMutation(`/api/reviews/${reviewId}`, {}, 'DELETE');
};