// lib/core/server.js
const baseUrl = process.env.NEXT_PUBLIC_API_URL;

export const serverFetch = async (path) => {
  try {
    const res = await fetch(`${baseUrl}${path}`);
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
    const res = await fetch(`${baseUrl}${path}`, {
      method: method,
      headers: {
        'Content-Type': 'application/json',
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