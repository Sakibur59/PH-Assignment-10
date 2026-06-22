import { authClient } from "../auth-client";


const baseUrl = process.env.NEXT_PUBLIC_API_URL;


const getAuthToken = async () => {
  try {
    const { data } = await authClient.token();
    return data?.token || null;
  } catch (error) {
    console.error("Failed to get auth token:", error);
    return null;
  }
};

export const serverFetch = async (path) => {
  try {
    const token = await getAuthToken();

    const res = await fetch(`${baseUrl}${path}`, {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    return res.json();
  } catch (error) {
    console.error(`API Error (${path}):`, error);
    return {
      success: false,
      message: error.message || "Network error"
    };
  }
};

export const serverMutation = async (path, data, method = 'POST') => {
  try {
    const token = await getAuthToken();

    const res = await fetch(`${baseUrl}${path}`, {
      method: method,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}), 
      },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    return res.json();
  } catch (error) {
    console.error(`API Error (${path}):`, error);
    return {
      success: false,
      message: error.message || "Network error"
    };
  }
};