import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  EyeIcon, 
  CheckIcon, 
  XMarkIcon,
  TruckIcon,
  ClockIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import { adminAPI } from '../../services/api';
import toast from 'react-hot-toast';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    pages: 1,
    total: 0
  });
  const [filters, setFilters] = useState({
    search: '',
    status: 'all'
  });

  useEffect(() => {
    fetchOrders();
  }, [pagination.page, filters]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.page,
        limit: 10,
        ...filters
      };
      
      Object.keys(params).forEach(key => {
        if (params[key] === '' || params[key] === 'all') {
          delete params[key];
        }
      });

      const response = await adminAPI.getOrders(params);
      const { orders, pagination: paginationData } = response.data.data;
      
      setOrders(orders);
      setPagination(paginationData);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, status) => {
    try {
      await adminAPI.updateOrderStatus(orderId, status);
      toast.success('Order status updated successfully');
      fetchOrders();
    } catch (error) {
      toast.error('Failed to update order status');
    }
  };

  const confirmPayment = async (orderId) => {
    if (!window.confirm('Are you sure you want to confirm this payment?')) {
      return;
    }

    try {
      // Update order to mark as paid and change status to processing
      const orderToUpdate = orders.find(o => o._id === orderId);
      if (orderToUpdate) {
        await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/admin/orders/${orderId}/payment`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({ isPaid: true })
        });
        
        toast.success('Payment confirmed successfully');
        fetchOrders();
      }
    } catch (error) {
      toast.error('Failed to confirm payment');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-500/20 text-green-400';
      case 'shipped':
        return 'bg-blue-500/20 text-blue-400';
      case 'processing':
        return 'bg-yellow-500/20 text-yellow-400';
      case 'cancelled':
        return 'bg-red-500/20 text-red-400';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const statusOptions = [
    { value: 'pending', label: 'Pending', action: () => updateOrderStatus },
    { value: 'processing', label: 'Processing', action: () => updateOrderStatus },
    { value: 'shipped', label: 'Shipped', action: () => updateOrderStatus },
    { value: 'delivered', label: 'Delivered', action: () => updateOrderStatus },
    { value: 'cancelled', label: 'Cancelled', action: () => updateOrderStatus }
  ];

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Order Management</h1>
          <p className="text-gray-400 mt-2">Manage and track customer orders</p>
        </div>

        {/* Filters */}
        <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6 mb-8">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by order number..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-white"
              />
            </div>

            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-white"
            >
              <option value="all" className="bg-gray-800">All Status</option>
              <option value="pending" className="bg-gray-800">Pending</option>
              <option value="processing" className="bg-gray-800">Processing</option>
              <option value="shipped" className="bg-gray-800">Shipped</option>
              <option value="delivered" className="bg-gray-800">Delivered</option>
              <option value="cancelled" className="bg-gray-800">Cancelled</option>
            </select>

            <div className="text-sm text-gray-400 flex items-center">
              Total: {pagination.total} orders
            </div>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-white/5">
                    <tr className="text-left">
                      <th className="px-6 py-4 text-gray-300 font-medium">Order #</th>
                      <th className="px-6 py-4 text-gray-300 font-medium">Customer</th>
                      <th className="px-6 py-4 text-gray-300 font-medium">Date</th>
                      <th className="px-6 py-4 text-gray-300 font-medium">Items</th>
                      <th className="px-6 py-4 text-gray-300 font-medium">Total</th>
                      <th className="px-6 py-4 text-gray-300 font-medium">Payment</th>
                      <th className="px-6 py-4 text-gray-300 font-medium">Status</th>
                      <th className="px-6 py-4 text-gray-300 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {orders.map((order) => (
                      <tr key={order._id} className="hover:bg-white/5 transition-colors">
                        <td className="px-6 py-4">
                          <p className="text-white font-mono text-sm">{order.orderNumber}</p>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <p className="text-white font-medium">
                              {order.user.firstName} {order.user.lastName}
                            </p>
                            <p className="text-gray-400 text-sm">{order.user.email}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-300">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-gray-300">
                          {order.orderItems.length} items
                        </td>
                        <td className="px-6 py-4 text-white font-semibold">
                          ${order.totalPrice.toFixed(2)}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              order.isPaid 
                                ? 'bg-green-500/20 text-green-400' 
                                : 'bg-red-500/20 text-red-400'
                            }`}>
                              {order.isPaid ? 'Paid' : 'Pending'}
                            </span>
                            {!order.isPaid && (
                              <button
                                onClick={() => confirmPayment(order._id)}
                                className="p-1 text-green-400 hover:text-green-300 hover:bg-green-500/10 rounded"
                                title="Confirm Payment"
                              >
                                <CheckIcon className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <select
                            value={order.status}
                            onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                            className={`px-2 py-1 rounded text-xs font-semibold focus:outline-none ${getStatusColor(order.status)}`}
                          >
                            {statusOptions.map(option => (
                              <option key={option.value} value={option.value} className="bg-gray-800">
                                {option.label}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            <Link
                              to={`/admin/orders/${order._id}`}
                              className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                              title="View Details"
                            >
                              <EyeIcon className="w-4 h-4" />
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {pagination.pages > 1 && (
                <div className="px-6 py-4 border-t border-white/10 flex justify-between items-center">
                  <div className="text-sm text-gray-400">
                    Showing {((pagination.page - 1) * 10) + 1} to {Math.min(pagination.page * 10, pagination.total)} of {pagination.total} results
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={!pagination.hasPrev}
                      className="px-3 py-1 bg-white/10 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/20 transition-colors"
                    >
                      Previous
                    </button>
                    {[...Array(pagination.pages)].map((_, index) => (
                      <button
                        key={index + 1}
                        onClick={() => handlePageChange(index + 1)}
                        className={`px-3 py-1 rounded transition-colors ${
                          pagination.page === index + 1
                            ? 'bg-white text-black'
                            : 'bg-white/10 text-white hover:bg-white/20'
                        }`}
                      >
                        {index + 1}
                      </button>
                    ))}
                    <button
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={!pagination.hasNext}
                      className="px-3 py-1 bg-white/10 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/20 transition-colors"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminOrders;
