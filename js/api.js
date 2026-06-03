/**
 * GHOUL Frontend API Client
 * Handles all communication with the backend API
 */

const API_BASE_URL = 'http://localhost:5000/api';

// Token management
const TOKEN_KEY = 'ghoul_auth_token';

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (token) => localStorage.setItem(TOKEN_KEY, token);
export const removeToken = () => localStorage.removeItem(TOKEN_KEY);
export const isAuthenticated = () => !!getToken();

/**
 * Generic fetch wrapper with error handling
 */
const apiCall = async (endpoint, options = {}) => {
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  };

  // Add Authorization header if token exists
  const token = getToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || data.errors?.[0] || 'API Error');
    }

    return { success: true, data };
  } catch (error) {
    console.error('API Error:', error);
    return { success: false, error: error.message };
  }
};

// ============================================
// Authentication Endpoints
// ============================================

export const auth = {
  register: async (email, password, nombre, apellido) => {
    return apiCall('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, nombre, apellido })
    });
  },

  login: async (email, password) => {
    return apiCall('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
  },

  logout: () => {
    removeToken();
    return { success: true };
  },

  verifyEmail: async () => {
    return apiCall('/auth/verify-email', { method: 'POST' });
  },

  getMe: async () => {
    return apiCall('/auth/me', { method: 'GET' });
  }
};

// ============================================
// Products Endpoints
// ============================================

export const products = {
  getAll: async (limit = 20, offset = 0) => {
    return apiCall(`/products?limit=${limit}&offset=${offset}`, { method: 'GET' });
  },

  getById: async (productId) => {
    return apiCall(`/products/${productId}`, { method: 'GET' });
  }
};

// ============================================
// Cart Endpoints
// ============================================

export const cart = {
  get: async () => {
    return apiCall('/cart', { method: 'GET' });
  },

  add: async (product_id, talla, cantidad = 1) => {
    return apiCall('/cart', {
      method: 'POST',
      body: JSON.stringify({ product_id, talla, cantidad })
    });
  },

  updateQuantity: async (cartItemId, cantidad) => {
    return apiCall(`/cart/${cartItemId}`, {
      method: 'PUT',
      body: JSON.stringify({ cantidad })
    });
  },

  remove: async (cartItemId) => {
    return apiCall(`/cart/${cartItemId}`, { method: 'DELETE' });
  },

  clear: async () => {
    return apiCall('/cart', { method: 'DELETE' });
  }
};

// ============================================
// Orders Endpoints
// ============================================

export const orders = {
  create: async (orderData) => {
    return apiCall('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData)
    });
  },

  getAll: async (limit = 20, offset = 0) => {
    return apiCall(`/orders?limit=${limit}&offset=${offset}`, { method: 'GET' });
  },

  getById: async (orderId) => {
    return apiCall(`/orders/${orderId}`, { method: 'GET' });
  },

  updateStatus: async (orderId, estado) => {
    return apiCall(`/orders/${orderId}`, {
      method: 'PUT',
      body: JSON.stringify({ estado })
    });
  }
};

// ============================================
// Users Endpoints
// ============================================

export const users = {
  getProfile: async () => {
    return apiCall('/users/profile', { method: 'GET' });
  },

  updateProfile: async (nombre, apellido) => {
    return apiCall('/users/profile', {
      method: 'PUT',
      body: JSON.stringify({ nombre, apellido })
    });
  }
};

// ============================================
// Helper Functions
// ============================================

export const handleAuthError = (error, onLogout = null) => {
  if (error && (error.includes('invalid') || error.includes('token'))) {
    removeToken();
    if (onLogout) onLogout();
  }
};

export const cartCount = async () => {
  if (!isAuthenticated()) return 0;
  const result = await cart.get();
  if (result.success) {
    return result.data.summary.item_count;
  }
  return 0;
};
