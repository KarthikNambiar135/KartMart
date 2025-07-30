import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { CheckCircleIcon, ShoppingBagIcon, PrinterIcon } from '@heroicons/react/24/outline';
import { orderAPI } from '../services/api';
import toast from 'react-hot-toast';

const OrderConfirmation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [customerInfo, setCustomerInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // First try to get order from navigation state
    if (location.state?.order) {
      setOrder(location.state.order);
      setCustomerInfo(location.state.customerInfo);
      setLoading(false);
    } 
    // If no state data and we have orderId, fetch from API
    else if (orderId) {
      fetchOrder();
    }
    // If no order data at all, show error
    else {
      setLoading(false);
    }
  }, [location.state, orderId]);

  const fetchOrder = async () => {
    try {
      const response = await orderAPI.getOrder(orderId);
      if (response.data.success) {
        setOrder(response.data.data.order);
        setCustomerInfo({
          email: response.data.data.order.user.email,
          name: `${response.data.data.order.user.firstName} ${response.data.data.order.user.lastName}`,
          phone: response.data.data.order.shippingAddress.phone
        });
      }
    } catch (error) {
      console.error('Failed to fetch order:', error);
      toast.error('Order not found');
      navigate('/orders');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Order not found</h2>
          <p className="text-gray-400 mb-6">The order you're looking for doesn't exist or you don't have permission to view it.</p>
          <Link
            to="/orders"
            className="bg-white text-black px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
          >
            View All Orders
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Success Header */}
        <div className="text-center mb-8">
          <CheckCircleIcon className="mx-auto h-16 w-16 text-green-400 mb-4" />
          <h1 className="text-3xl font-bold text-white mb-2">Order Confirmed!</h1>
          <p className="text-gray-400 text-lg">
            Thank you for your purchase. Your order has been placed successfully.
          </p>
        </div>

        {/* Order Details */}
        <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6 mb-8">
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div>
              <h2 className="text-xl font-semibold text-white mb-4">Order Information</h2>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-400">Order Number:</span>
                  <span className="text-white font-mono">{order.orderNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Order Date:</span>
                  <span className="text-white">{new Date(order.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Status:</span>
                  <span className={`px-2 py-1 rounded-full text-sm ${
                    order.status === 'delivered' ? 'bg-green-500/20 text-green-400' :
                    order.status === 'shipped' ? 'bg-blue-500/20 text-blue-400' :
                    order.status === 'processing' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-gray-500/20 text-gray-400'
                  }`}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Payment Status:</span>
                  <span className={`px-2 py-1 rounded-full text-sm ${
                    order.isPaid ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                  }`}>
                    {order.isPaid ? 'Paid' : 'Pending'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Total Amount:</span>
                  <span className="text-white font-bold text-lg">${order.totalPrice.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {customerInfo && (
              <div>
                <h2 className="text-xl font-semibold text-white mb-4">Customer Information</h2>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Name:</span>
                    <span className="text-white">{customerInfo.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Email:</span>
                    <span className="text-white">{customerInfo.email}</span>
                  </div>
                  {customerInfo.phone && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Phone:</span>
                      <span className="text-white">{customerInfo.phone}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Shipping Address */}
          <div className="border-t border-white/10 pt-6 mb-6">
            <h2 className="text-xl font-semibold text-white mb-4">Shipping Address</h2>
            <div className="text-gray-300">
              <p>{order.shippingAddress.firstName} {order.shippingAddress.lastName}</p>
              <p>{order.shippingAddress.street}</p>
              <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}</p>
              <p>{order.shippingAddress.country}</p>
              {order.shippingAddress.phone && <p>Phone: {order.shippingAddress.phone}</p>}
            </div>
          </div>

          {/* Order Items */}
          <div className="border-t border-white/10 pt-6">
            <h2 className="text-xl font-semibold text-white mb-4">Order Items</h2>
            <div className="space-y-4">
              {order.orderItems.map((item, index) => (
                <div key={index} className="flex items-center space-x-4 p-4 bg-white/5 rounded-lg">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-16 h-16 rounded-lg object-cover"
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=400&fit=crop';
                    }}
                  />
                  <div className="flex-1">
                    <h3 className="text-white font-medium">{item.name}</h3>
                    <p className="text-gray-400 text-sm">Quantity: {item.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-semibold">${(item.price * item.quantity).toFixed(2)}</p>
                    <p className="text-gray-400 text-sm">${item.price} each</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div className="border-t border-white/10 pt-6 mt-6">
            <div className="max-w-md ml-auto space-y-2">
              <div className="flex justify-between text-gray-300">
                <span>Subtotal:</span>
                <span>${(order.totalPrice - order.taxPrice - order.shippingPrice).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-300">
                <span>Shipping:</span>
                <span>${order.shippingPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-300">
                <span>Tax:</span>
                <span>${order.taxPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xl font-bold text-white border-t border-white/10 pt-2">
                <span>Total:</span>
                <span>${order.totalPrice.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={handlePrint}
            className="flex items-center justify-center px-6 py-3 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
          >
            <PrinterIcon className="w-5 h-5 mr-2" />
            Print Order
          </button>
          
          <Link
            to="/orders"
            className="flex items-center justify-center px-6 py-3 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
          >
            <ShoppingBagIcon className="w-5 h-5 mr-2" />
            View All Orders
          </Link>
          
          <Link
            to="/products"
            className="flex items-center justify-center px-6 py-3 bg-white text-black font-semibold rounded-lg hover:bg-gray-100 transition-colors"
          >
            Continue Shopping
          </Link>
        </div>

        {/* What's Next */}
        <div className="mt-12 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6">
          <h2 className="text-xl font-semibold text-white mb-4">What's Next?</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-500/20 text-blue-400 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-xl">📦</span>
              </div>
              <h3 className="text-white font-medium mb-2">Order Processing</h3>
              <p className="text-gray-400 text-sm">We'll prepare your order within 24 hours</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-500/20 text-purple-400 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-xl">🚚</span>
              </div>
              <h3 className="text-white font-medium mb-2">Shipping</h3>
              <p className="text-gray-400 text-sm">Your order will be shipped within 2-3 business days</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-xl">✅</span>
              </div>
              <h3 className="text-white font-medium mb-2">Delivery</h3>
              <p className="text-gray-400 text-sm">Expected delivery in 5-7 business days</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation;
