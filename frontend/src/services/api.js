import axios from "axios";

const API_URL =
  process.env.REACT_APP_API_URL || "http://localhost:5001/api";

const api = axios.create({
  baseURL: API_URL,
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API calls
export const authAPI = {
  register: (credentials) => api.post("/auth/register", credentials),
  login: (credentials) => api.post("/auth/login", credentials),
  getCurrentUser: () => api.get("/auth/me"),
  updateProfile: (data) => api.put("/auth/profile", data),
};

// Product API calls
export const productAPI = {
  getAll: (params) => api.get("/products", { params }),
  getById: (id) => api.get(`/products/${id}`),
  addReview: (id, data) => api.post(`/products/${id}/reviews`, data),
  deleteReview: (productId, reviewId) =>
    api.delete(`/products/${productId}/reviews/${reviewId}`),
};

// Cart API calls
export const cartAPI = {
  getCart: () => api.get("/cart"),
  addToCart: (item) => api.post("/cart/add", item),
  removeFromCart: (productId) => api.post("/cart/remove", { productId }),
  updateCart: (productId, quantity) =>
    api.post("/cart/update", { productId, quantity }),
  clearCart: () => api.post("/cart/clear"),
};

// Order API calls
export const orderAPI = {
  create: (data) => api.post("/orders/create", data),
  getAll: () => api.get("/orders"),
  getById: (id) => api.get(`/orders/${id}`),
  cancel: (id) => api.put(`/orders/${id}/cancel`),
  confirmReceived: (id) => api.put(`/orders/${id}/confirm-received`),
  delete: (id) => api.delete(`/orders/${id}`),
  updateStatus: (id, status) => api.put(`/orders/${id}/status`, { status }),
};

// Payment API calls
export const paymentAPI = {
  createIntent: (data) => api.post("/payment/create-intent", data),
  confirmPayment: (data) => api.post("/payment/confirm-payment", data),
};

// Admin API calls
export const adminAPI = {
  addProduct: (data) => api.post("/admin/products", data),
  updateProduct: (id, data) => api.put(`/admin/products/${id}`, data),
  deleteProduct: (id) => api.delete(`/admin/products/${id}`),
  getOrders: () => api.get("/admin/orders"),
  updateOrderStatus: (id, status) =>
    api.put(`/admin/orders/${id}/status`, { status }),
  deleteOrder: (id) => api.delete(`/admin/orders/${id}`),
  getStats: () => api.get("/admin/stats"),
};

export default api;
