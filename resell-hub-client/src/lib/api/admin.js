import { serverFetch, serverMutation } from "../core/server";

export const getAdminStats = async () => {
  return serverFetch("/api/admin/stats");
};

export const getAdminUsers = async () => {
  return serverFetch("/api/admin/users");
};

export const updateUserStatus = async (userId, isBlocked, role) => {
  const body = {};
  if (isBlocked !== undefined) body.isBlocked = isBlocked;
  if (role) body.role = role;

  console.log("Sending update:", { userId, isBlocked, role });
  return serverMutation(`/api/admin/users/${userId}/status`, body, "PATCH");
};
export const deleteUser = async (userId) => {
  return serverMutation(`/api/admin/users/${userId}`, {}, "DELETE");
};

export const getAdminProducts = async () => {
  return serverFetch("/api/admin/products");
};

