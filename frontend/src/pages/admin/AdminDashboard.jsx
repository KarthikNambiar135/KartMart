import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  CubeIcon, 
  UsersIcon, 
  ShoppingBagIcon, 
  CurrencyDollarIcon,
  ExclamationTriangleIcon,
  TrophyIcon
} from '@heroicons/react/24/outline';
import { adminAPI } from '../../services/api';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    stats: {
      totalProducts: 0,
      totalUsers: 0,
      totalOrders: 0,
      totalRevenue: 0
    },
    recentOrders: [],
    lowStockProducts: [],
    topSellingProducts: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await adminAPI.getDashboard();
        setDashboardData(response.data.data);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    );
  }

  const statsCards = [
    {
      title: 'Total Products',
      value: dashboardData.stats.totalProducts,
      icon: CubeIcon,
      color: 'from-blue-500 to-blue-600',
      link: '/admin/products'
    },
    {
      title: 'Total Users',
      value: dashboardData.stats.totalUsers,
      icon: UsersIcon,
      color: 'from-green-500 to-green-600',
      link: '/admin/users'
    },
    {
      title: 'Total Orders',
      value: dashboardData.stats.totalOrders,
      icon: ShoppingBagIcon,
      color: 'from-purple-500 to-purple-600',
      link: '/admin/orders'
    },
    {
      title: 'Total Revenue',
      value: `$${dashboardData.stats.totalRevenue.toFixed(2)}`,
      icon: CurrencyDollarIcon,
      color: 'from-yellow-500 to-yellow-600',
      link: '/admin/orders'
    }
  ];

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
          <p className="text-gray-400 mt-2">Welcome back! Here's what's happening with your store.</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statsCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Link
                key={index}
                to={stat.link}
                className="group relative bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6 hover:bg-white/10 transition-all duration-300 transform hover:scale-105"
              >
                <div className={`absolute inset-0 bg-gradient-to-r ${stat.color} opacity-0 group-hover:opacity-10 rounded-xl transition-opacity duration-300`}></div>
                <div className="relative">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm font-medium">{stat.title}</p>
                      <p className="text-2xl font-bold text-white mt-2">{stat.value}</p>
                    </div>
                    <div className={`p-3 rounded-lg bg-gradient-to-r ${stat.color}`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Recent Orders */}
          <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white">Recent Orders</h2>
              <Link to="/admin/orders" className="text-gray-400 hover:text-white text-sm">
                View All
              </Link>
            </div>
            <div className="space-y-4">
              {dashboardData.recentOrders.length > 0 ? (
                dashboardData.recentOrders.map((order) => (
                  <div key={order._id} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                    <div>
                      <p className="text-white font-medium">#{order.orderNumber}</p>
                      <p className="text-gray-400 text-sm">
                        {order.user.firstName} {order.user.lastName}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-semibold">${order.totalPrice}</p>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        order.status === 'delivered' ? 'bg-green-500/20 text-green-400' :
                        order.status === 'shipped' ? 'bg-blue-500/20 text-blue-400' :
                        order.status === 'processing' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-gray-500/20 text-gray-400'
                      }`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-400">No recent orders</p>
              )}
            </div>
          </div>

          {/* Low Stock Alert */}
          <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white flex items-center">
                <ExclamationTriangleIcon className="w-5 h-5 text-yellow-500 mr-2" />
                Low Stock Alert
              </h2>
              <Link to="/admin/products" className="text-gray-400 hover:text-white text-sm">
                View All
              </Link>
            </div>
            <div className="space-y-4">
              {dashboardData.lowStockProducts.length > 0 ? (
                dashboardData.lowStockProducts.map((product) => (
                  <div key={product._id} className="flex items-center justify-between p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <img
                        src={product.images[0]?.url}
                        alt={product.name}
                        className="w-10 h-10 rounded-lg object-cover"
                      />
                      <div>
                        <p className="text-white font-medium">{product.name}</p>
                        <p className="text-gray-400 text-sm">SKU: {product.sku}</p>
                      </div>
                    </div>
                    <span className="px-2 py-1 bg-red-500/20 text-red-400 rounded-full text-xs">
                      {product.stock} left
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-gray-400">All products are well stocked</p>
              )}
            </div>
          </div>
        </div>

        {/* Top Selling Products */}
        <div className="mt-8 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white flex items-center">
              <TrophyIcon className="w-5 h-5 text-yellow-500 mr-2" />
              Top Selling Products
            </h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4">
            {dashboardData.topSellingProducts.map((product, index) => (
              <div key={product._id} className="bg-white/5 rounded-lg p-4">
                <img
                  src={product.images[0]?.url}
                  alt={product.name}
                  className="w-full h-32 object-cover rounded-lg mb-3"
                />
                <h3 className="text-white font-medium text-sm mb-1">{product.name}</h3>
                <p className="text-gray-400 text-xs">Sales: {product.salesCount}</p>
                <p className="text-white font-semibold">${product.price}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
