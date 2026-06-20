
import { serverFetch, serverMutation } from "../core/server";


export const getSellerProducts = async (userId) => {
  return serverFetch(`/api/seller/products/${userId}`);
};


export const getSellerOrders = async (userId) => {
  return serverFetch(`/api/seller/orders/${userId}`);
};


export const getSellerStats = async (userId) => {
  return serverFetch(`/api/seller/stats/${userId}`);
};


export const updateOrderStatus = async (orderId, status, sellerId) => {
  return serverMutation(`/api/seller/orders/${orderId}/status`, { status, sellerId }, 'PATCH');
};


export const createProduct = async (productData) => {
  return serverMutation('/api/products', productData, 'POST');
};


export const updateProduct = async (productId, productData) => {
  return serverMutation(`/api/products/${productId}`, productData, 'PUT');
};


export const deleteProduct = async (productId) => {
  return serverMutation(`/api/products/${productId}`, {}, 'DELETE');
};