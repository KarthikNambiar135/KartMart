import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { CurrencyProvider } from './context/CurrencyContext';
import { WishlistProvider } from './context/WishlistContext'; // ✅ FIXED
import { ComparisonProvider } from './context/ComparisonContext';
import Wishlist from './pages/Wishlist';
import Comparison from './pages/Comparison';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import AdminRoute from './components/AdminRoute';
import AdminLayout from './components/AdminLayout';
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProducts from './pages/admin/AdminProducts';
import AdminProductForm from './pages/admin/AdminProductForm';
import LightRaysBackground from './components/LightRaysBackground';
import Orders from './pages/Orders';
import OrderConfirmation from './pages/OrderConfirmation';
import OrderDetail from './pages/OrderDetail';
import AdminOrders from './pages/admin/AdminOrders';
import AdminUsers from './pages/admin/AdminUsers';
import AdminCategories from './pages/admin/AdminCategories';
import AdminCoupons from './pages/admin/AdminCoupons';
import AdminAnalytics from './pages/admin/AdminAnalytics';
import AdminOrderDetail from './pages/admin/AdminOrderDetail';

function App() {
  return (
    <AuthProvider>
      <CurrencyProvider>
        <CartProvider>
          <WishlistProvider>
            <ComparisonProvider>
              <Router>
                <div className="min-h-screen bg-gray-900 text-white relative overflow-hidden">
                  <LightRaysBackground />
                  <div className="relative z-10">
                    <Routes>
                      {/* Admin Routes */}
                      <Route path="/admin/*" element={
                        <AdminRoute>
                          <AdminLayout />
                        </AdminRoute>
                      }>
                        <Route index element={<AdminDashboard />} />
                        <Route path="products" element={<AdminProducts />} />
                        <Route path="products/create" element={<AdminProductForm />} />
                        <Route path="products/:id/edit" element={<AdminProductForm />} />
                        <Route path="orders" element={<AdminOrders />} />
                        <Route path="users" element={<AdminUsers />} />
                        <Route path="categories" element={<AdminCategories />} />
                        <Route path="coupons" element={<AdminCoupons />} />
                        <Route path="analytics" element={<AdminAnalytics />} />
                        <Route path="orders/:id" element={<AdminOrderDetail />} />
                      </Route>

                      {/* Public Routes */}
                      <Route path="/*" element={
                        <>
                          <Navbar />
                          <main className="transition-all duration-500 ease-out">
                            <Routes>
                              <Route path="/" element={<Home />} />
                              <Route path="/products" element={<Products />} />
                              <Route path="/product/:id" element={<ProductDetail />} />
                              <Route path="/cart" element={<Cart />} />
                              <Route path="/checkout" element={<Checkout />} />
                              <Route path="/profile" element={<Profile />} />
                              <Route path="/login" element={<Login />} />
                              <Route path="/register" element={<Register />} />
                              <Route path="/orders" element={<Orders />} />
                              <Route path="/order-confirmation" element={<OrderConfirmation />} />
                              <Route path="/order/:id" element={<OrderDetail />} />
                              <Route path="/order-confirmation/:orderId?" element={<OrderConfirmation />} />
                              <Route path="/wishlist" element={<Wishlist />} />
                              <Route path="/comparison" element={<Comparison />} />
                            </Routes>
                          </main>
                          <Footer />
                        </>
                      } />
                    </Routes>
                  </div>
                </div>
                <Toaster
                  position="top-right"
                  toastOptions={{
                    duration: 4000,
                    style: {
                      background: 'rgba(0, 0, 0, 0.8)',
                      color: '#fff',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255, 255, 255, 0.1)'
                    }
                  }}
                />
              </Router>
            </ComparisonProvider>
          </WishlistProvider>
        </CartProvider>
      </CurrencyProvider>
    </AuthProvider>
  );
}

export default App;
