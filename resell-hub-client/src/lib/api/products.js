
import { serverFetch } from "../core/server";

export const getProducts = async () => {
  return serverFetch('/api/products');
};

export const getProductById = async (id) => {
  return serverFetch(`/api/products/${id}`);
};