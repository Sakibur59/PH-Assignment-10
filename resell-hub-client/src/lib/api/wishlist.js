
import { serverFetch, serverMutation } from "../core/server";


export const addToWishlist = async (data) => {
  return serverMutation('/api/wishlist', data, 'POST');
};


export const removeFromWishlist = async (data) => {
  return serverMutation('/api/wishlist', data, 'DELETE');
};


export const getWishlist = async (userId) => {
  return serverFetch(`/api/wishlist/${userId}`);
};


export const checkWishlist = async (userId, productId) => {
  return serverFetch(`/api/wishlist/check/${userId}/${productId}`);
};