
import { serverFetch } from "../core/server";

export const getUsers = async () => {
  return serverFetch('/api/users');
};

export const getUserById = async (id) => {
  return serverFetch(`/api/users/${id}`);
};