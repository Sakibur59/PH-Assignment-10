import { serverFetch } from "../core/server";

export const getProducts = async () => {
    return serverFetch('/api/products');
}