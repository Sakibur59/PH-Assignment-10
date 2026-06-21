import { serverFetch, serverMutation } from "../core/server";


export const getAdminStats = async () => {
  return serverFetch('/api/admin/stats');
};


export const getAdminUsers = async () => {
  return serverFetch('/api/admin/users');
};


export const updateUserStatus = async (userId, isBlocked, role) => {
  const body = {};
  if (isBlocked !== undefined) body.isBlocked = isBlocked;
  if (role) body.role = role;
  return serverMutation(`/api/admin/users/${userId}/status`, body, 'PATCH');
};


export const deleteUser = async (userId) => {
  return serverMutation(`/api/admin/users/${userId}`, {}, 'DELETE');
};


export const getAdminProducts = async () => {
  return serverFetch('/api/admin/products');
};


export const updateProductStatus = async (productId, adminStatus) => {
  return serverMutation(`/api/admin/products/${productId}/status`, { status: adminStatus }, 'PATCH');
};


export const deleteProduct = async (productId) => {
  return serverMutation(`/api/admin/products/${productId}`, {}, 'DELETE');
};


export const getAdminOrders = async () => {
  return serverFetch('/api/admin/orders');
};


export const updateOrderStatus = async (orderId, status) => {
  return serverMutation(`/api/admin/orders/${orderId}/status`, { status }, 'PATCH');
};