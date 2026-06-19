
import { serverFetch, serverMutation } from "../core/server";


export const createOrder = async (orderData) => {
  return serverMutation('/api/orders', orderData, 'POST');
};


export const getOrders = async (userId) => {
  return serverFetch(`/api/orders/${userId}`);
};


export const getOrderById = async (orderId) => {
  return serverFetch(`/api/orders/single/${orderId}`);
};


export const updateOrderStatus = async (orderId, status) => {
  return serverMutation(`/api/orders/${orderId}/status`, { status }, 'PATCH');
};