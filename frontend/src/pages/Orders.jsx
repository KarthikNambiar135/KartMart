import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ShoppingBagIcon, 
  EyeIcon, 
  TrashIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { orderAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [clearingHistory, setClearingHistory] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    pages: 1,
    total: 0
  });
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      fetchOrders();
    }
  }, [isAuthenticated, pagination.page]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await orderAPI.getMyOrders({
        page: pagination.page,
        limit: 10
      });
      
      if (response.data.success) {
        setOrders(response.data.data.orders);
        setPagination(response.data.data.pagination);
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const handleClearHistory = async () => {
    if (!window.confirm('Are you sure you want to clear your entire order history? This action cannot be undone.')) {
      return;
    }

    try {
      setClearingHistory(true);
      const response = await orderAPI.clearOrderHistory();
      
      if (response.data.success) {
        toast.success(response.data.message);
        setOrders([]);
        setPagination({ page: 1, pages: 1, total: 0 });
      }
    } catch (error) {
      console.error('Failed to clear order history:', error);
      toast.error('Failed to clear order history');
    } finally {
      setClearingHistory(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'shipped':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'processing':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'cancelled':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center py-12">
        <div className="text-center">
          <ShoppingBagIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Please Login</h2>
          <p className="text-gray-400 mb-6">You need to be logged in to view your orders</p>
          <Link
            to="/login"
            className="bg-white text-black px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
          >
            Login to Continue
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">My Orders</h1>
            <p className="text-gray-400 mt-2">Track and manage your order history</p>
          </div>
          
          {orders.length > 0 && (
            <button
              onClick={handleClearHistory}
              disabled={clearingHistory}
              className="flex items-center space-x-2 px-4 py-2 bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg hover:bg-red-500/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <TrashIcon className="w-4 h-4" />
              <span>{clearingHistory ? 'Clearing...' : 'Clear History'}</span>
            </button>
          )}
        </div>

        {loading ? (
          /* Loading State */
          <div className="space-y-4">
            {[...Array(3)].map((_, index) => (
              <div key={index} className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6 animate-pulse">
                <div className="flex items-center justify-between mb-4">
                  <div className="h-6 bg-white/10 rounded w-32"></div>
                  <div className="h-6 bg-white/10 rounded w-20"></div>
                </div>
                <div className="grid md:grid-cols-4 gap-4">
                  <div className="h-4 bg-white/10 rounded"></div>
                  <div className="h-4 bg-white/10 rounded"></div>
                  <div className="h-4 bg-white/10 rounded"></div>
                  <div className="h-4 bg-white/10 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        ) : orders.length > 0 ? (
          <>
            {/* Orders List */}
            <div className="space-y-6">
              {orders.map((order) => (
                <div
                  key={order._id}
                  className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6 hover:bg-white/8 transition-all duration-300"
                >
                  {/* Order Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <h3 className="text-lg font-semibold text-white">
                        Order #{order.orderNumber}
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(order.status)}`}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Link
                        to={`/order/${order._id}`}
                        className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                        title="View Details"
                      >
                        <EyeIcon className="w-5 h-5" />
                      </Link>
                    </div>
                  </div>

                  {/* Order Info Grid */}
                  <div className="grid md:grid-cols-4 gap-4 mb-4">
                    <div className="flex items-center space-x-2">
                      <CalendarIcon className="w-4 h-4 text-gray-400" />
                      <div>
                        <p className="text-xs text-gray-400">Order Date</p>
                        <p className="text-white text-sm">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <CurrencyDollarIcon className="w-4 h-4 text-gray-400" />
                      <div>
                        <p className="text-xs text-gray-400">Total Amount</p>
                        <p className="text-white text-sm font-semibold">
                          ${order.totalPrice.toFixed(2)}
                        </p>
                      </div>
                    </div>

                    <div>
                      <p className="text-xs text-gray-400">Payment Status</p>
                      <p className={`text-sm font-semibold ${
                        order.isPaid ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {order.isPaid ? 'Paid' : 'Pending'}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-gray-400">Items</p>
                      <p className="text-white text-sm">
                        {order.orderItems.length} item{order.orderItems.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>

                  {/* Order Items Preview */}
                  <div className="border-t border-white/10 pt-4">
                    <div className="flex items-center space-x-4 overflow-x-auto">
                      {order.orderItems.slice(0, 3).map((item, index) => (
                        <div key={index} className="flex items-center space-x-3 min-w-0 flex-shrink-0">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                          <div className="min-w-0">
                            <p className="text-white text-sm font-medium truncate">
                              {item.name}
                            </p>
                            <p className="text-gray-400 text-xs">
                              Qty: {item.quantity} × ${item.price}
                            </p>
                          </div>
                        </div>
                      ))}
                      {order.orderItems.length > 3 && (
                        <div className="text-gray-400 text-sm">
                          +{order.orderItems.length - 3} more item{order.orderItems.length - 3 !== 1 ? 's' : ''}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="flex justify-center items-center space-x-2 mt-8">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={!pagination.hasPrev}
                  className="px-4 py-2 bg-white/10 backdrop-blur-sm rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/15 transition-colors"
                >
                  Previous
                </button>
                
                <div className="flex space-x-1">
                  {[...Array(pagination.pages)].map((_, index) => {
                    const pageNumber = index + 1;
                    return (
                      <button
                        key={pageNumber}
                        onClick={() => handlePageChange(pageNumber)}
                        className={`px-3 py-2 rounded-lg transition-colors ${
                          pagination.page === pageNumber
                            ? 'bg-white text-black font-semibold'
                            : 'bg-white/10 backdrop-blur-sm text-white hover:bg-white/15'
                        }`}
                      >
                        {pageNumber}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={!pagination.hasNext}
                  className="px-4 py-2 bg-white/10 backdrop-blur-sm rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/15 transition-colors"
                >
                  Next
                </button>
              </div>
            )}
          </>
        ) : (
          /* Empty State */
          <div className="text-center py-20">
            <ShoppingBagIcon className="mx-auto h-16 w-16 text-gray-400 mb-6" />
            <h3 className="text-xl font-semibold text-white mb-2">No Orders Yet</h3>
            <p className="text-gray-400 mb-8 max-w-md mx-auto">
              You haven't placed any orders yet. Start shopping to see your order history here.
            </p>
            <Link
              to="/products"
              className="inline-flex items-center px-6 py-3 bg-white text-black font-semibold rounded-lg hover:bg-gray-100 transition-colors transform hover:scale-105 duration-200"
            >
              <ShoppingBagIcon className="w-5 h-5 mr-2" />
              Start Shopping
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;
