import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  getProfile: () => api.get('/auth/me'),
  updateProfile: (userData) => api.put('/auth/profile', userData),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, password) => api.post('/auth/reset-password', { token, password }),
};

// Product API
export const productAPI = {
  getProducts: (params) => api.get('/products', { params }),
  getProduct: (id) => api.get(`/products/${id}`),
  getFeaturedProducts: () => api.get('/products/featured'),
  getSearchSuggestions: (query) => api.get('/products/search-suggestions', { params: { q: query } }),
  addReview: (productId, reviewData) => api.post(`/products/${productId}/reviews`, reviewData),
};

// Cart API
export const cartAPI = {
  getCart: () => api.get('/cart'),
  addToCart: (productData) => api.post('/cart/add', productData),
  updateCartItem: (updateData) => api.put('/cart/update', updateData),
  removeFromCart: (productId) => api.delete(`/cart/remove/${productId}`),
  clearCart: () => api.delete('/cart/clear'),
};

// Order API
export const orderAPI = {
  createOrder: (orderData) => api.post('/orders', orderData),
  getMyOrders: () => api.get('/orders/my-orders'),
  getOrder: (id) => api.get(`/orders/${id}`),
  processPayment: (paymentData) => api.post('/orders/payment', paymentData),
};

// ✅ FIXED: User API (includes wishlist and comparison)
export const userAPI = {
  getWishlist: () => api.get('/user/wishlist'),
  addToWishlist: (productId) => api.post('/user/wishlist/add', { productId }),
  removeFromWishlist: (productId) => api.delete(`/user/wishlist/remove/${productId}`),
  compareProducts: (productIds) => api.post('/user/compare', { productIds }),
};

// ✅ FIXED: Wishlist API (backward compatibility)
export const wishlistAPI = {
  getWishlist: () => userAPI.getWishlist(),
  addToWishlist: (productId) => userAPI.addToWishlist(productId),
  removeFromWishlist: (productId) => userAPI.removeFromWishlist(productId),
};

// ✅ FIXED: Comparison API (backward compatibility)
export const comparisonAPI = {
  compareProducts: (productIds) => userAPI.compareProducts(productIds),
};

// ✅ Chat API
export const chatAPI = {
  getMessages: () => api.get('/chat/messages'),
  sendMessage: (message) => api.post('/chat/messages', { message }),
};

// Admin API
export const adminAPI = {
  getDashboard: () => api.get('/admin/dashboard'),
  // Products
  getProducts: (params) => api.get('/admin/products', { params }),
  getProduct: (id) => api.get(`/admin/products/${id}`),
  createProduct: (productData) => api.post('/admin/products', productData),
  updateProduct: (id, productData) => api.put(`/admin/products/${id}`, productData),
  deleteProduct: (id) => api.delete(`/admin/products/${id}`),
  // Orders
  getOrders: (params) => api.get('/admin/orders', { params }),
  getOrder: (id) => api.get(`/admin/orders/${id}`),
  updateOrderStatus: (id, status) => api.put(`/admin/orders/${id}/status`, { status }),
  confirmPayment: (orderId) => api.put(`/admin/orders/${orderId}/payment`, { isPaid: true }),
  // Users
  getUsers: (params) => api.get('/admin/users', { params }),
  updateUserRole: (id, role) => api.put(`/admin/users/${id}/role`, { role }),
  // Categories
  getCategories: () => api.get('/admin/categories'),
  createCategory: (categoryData) => api.post('/admin/categories', categoryData),
  updateCategory: (id, categoryData) => api.put(`/admin/categories/${id}`, categoryData),
  deleteCategory: (id) => api.delete(`/admin/categories/${id}`),
  // Coupons
  getCoupons: () => api.get('/admin/coupons'),
  createCoupon: (couponData) => api.post('/admin/coupons', couponData),
  updateCoupon: (id, couponData) => api.put(`/admin/coupons/${id}`, couponData),
  deleteCoupon: (id) => api.delete(`/admin/coupons/${id}`),
};

export default api;
