import { serverFetch, serverMutation } from "../core/server";

export const getAdminStats = async () => {
  return serverFetch("/api/admin/stats");
};

export const getAdminUsers = async () => {
  return serverFetch("/api/admin/users");
};

export const updateUserStatus = async (userId, isBlocked) => {
  return serverMutation(
    `/api/admin/users/${userId}/status`,
    { isBlocked },
    "PATCH",
  );
};

