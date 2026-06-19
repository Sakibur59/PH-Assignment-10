
import { serverFetch, serverMutation } from "../core/server";

export const createOrder = async (orderData) => {
  return serverMutation("/api/orders", orderData, "POST");
};

export const getOrders = async (userId) => {
  return serverFetch(`/api/orders/user/${userId}`);
};

export const getOrderById = async (orderId, userId) => {
  return serverFetch(`/api/orders/single/${orderId}/${userId}`);
};

export const cancelOrder = async (orderId, userId) => {
  return serverMutation(`/api/orders/${orderId}/cancel`, { userId }, "PATCH");
};

export const updateOrderStatus = async (orderId, status) => {
  return serverMutation(`/api/orders/${orderId}/status`, { status }, "PATCH");
};