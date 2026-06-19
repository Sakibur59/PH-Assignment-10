
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