
import { authClient } from "../auth-client";
import { serverFetch, serverMutation } from "../core/server";

export const getUsers = async () => {
  return serverFetch('/api/users');
};

export const getUserById = async (userId) => {
  return serverFetch(`/api/users/${userId}`);
};

export const updateUser = async (userId, userData) => {
  return serverMutation(`/api/users/${userId}`, userData, 'PUT');
};

export const changePassword = async (oldPassword, newPassword) => {
  try {
    const res = await authClient.changePassword({
      newPassword: newPassword,
      currentPassword: oldPassword,
      revokeOtherSessions: true,
    });

    if (res.error) {
      return { success: false, message: res.error.message || "Failed to change password" };
    }

    return { success: true };
  } catch (error) {
    console.error("Password change error:", error);
    return { success: false, message: error.message || "Failed to change password" };
  }
};