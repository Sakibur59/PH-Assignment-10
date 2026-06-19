
import { serverFetch, serverMutation } from "../core/server";

export const createPayment = async (paymentData) => {
  return serverMutation("/api/payments", paymentData, "POST");
};

export const getPaymentByOrder = async (orderId) => {
  return serverFetch(`/api/payments/${orderId}`);
};

export const getUserPayments = async (userId) => {
  return serverFetch(`/api/payments/user/${userId}`);
};