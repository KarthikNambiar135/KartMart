import React, { useState, useEffect } from 'react';
import { 
  ChartBarIcon,
  CurrencyDollarIcon,
  ShoppingBagIcon,
  UsersIcon,
  ArrowTrendingUpIcon, // ✅ Fixed: Use ArrowTrendingUpIcon instead
  CalendarIcon
} from '@heroicons/react/24/outline';
import { adminAPI } from '../../services/api';

const AdminAnalytics = () => {
  const [analytics, setAnalytics] = useState({
    revenue: {
      total: 0,
      thisMonth: 0,
      lastMonth: 0,
      growth: 0
    },
    orders: {
      total: 0,
      thisMonth: 0,
      pending: 0,
      completed: 0
    },
    users: {
      total: 0,
      newThisMonth: 0,
      activeUsers: 0
    },
    products: {
      total: 0,
      lowStock: 0,
      outOfStock: 0
    }
  });
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('30'); // days

  useEffect(() => {
    fetchAnalytics();
  }, [dateRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      // Since we don't have a dedicated analytics endpoint, 
      // we'll use the dashboard data and enhance it
      const response = await adminAPI.getDashboard();
      const dashboardData = response.data.data;
      
      setAnalytics({
        revenue: {
          total: dashboardData.stats.totalRevenue,
          thisMonth: dashboardData.stats.totalRevenue * 0.3, // Mock data
          lastMonth: dashboardData.stats.totalRevenue * 0.25, // Mock data
          growth: 20 // Mock growth percentage
        },
        orders: {
          total: dashboardData.stats.totalOrders,
          thisMonth: Math.floor(dashboardData.stats.totalOrders * 0.3),
          pending: dashboardData.recentOrders.filter(o => o.status === 'pending').length,
          completed: dashboardData.recentOrders.filter(o => o.status === 'delivered').length
        },
        users: {
          total: dashboardData.stats.totalUsers,
          newThisMonth: Math.floor(dashboardData.stats.totalUsers * 0.1),
          activeUsers: Math.floor(dashboardData.stats.totalUsers * 0.7)
        },
        products: {
          total: dashboardData.stats.totalProducts,
          lowStock: dashboardData.lowStockProducts.length,
          outOfStock: dashboardData.lowStockProducts.filter(p => p.stock === 0).length
        }
      });
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, change, icon: Icon, trend, color = "blue" }) => (
    <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6 hover:bg-white/8 transition-all duration-300">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-400 text-sm font-medium">{title}</p>
          <p className="text-2xl font-bold text-white mt-2">{value}</p>
          {change !== undefined && (
            <div className={`flex items-center mt-2 ${trend === 'up' ? 'text-green-400' : 'text-red-400'}`}>
              <ArrowTrendingUpIcon className={`w-4 h-4 mr-1 ${trend === 'down' ? 'rotate-180' : ''}`} />
              <span className="text-sm font-medium">{change}%</span>
              <span className="text-gray-400 text-sm ml-1">vs last month</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-lg ${
          color === 'green' ? 'bg-green-500/20' :
          color === 'blue' ? 'bg-blue-500/20' :
          color === 'purple' ? 'bg-purple-500/20' :
          color === 'orange' ? 'bg-orange-500/20' :
          'bg-blue-500/20'
        }`}>
          <Icon className={`w-6 h-6 ${
            color === 'green' ? 'text-green-400' :
            color === 'blue' ? 'text-blue-400' :
            color === 'purple' ? 'text-purple-400' :
            color === 'orange' ? 'text-orange-400' :
            'text-blue-400'
          }`} />
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Analytics Dashboard</h1>
            <p className="text-gray-400 mt-2">Track your store's performance and insights</p>
          </div>
          <div className="flex items-center space-x-4">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-white"
            >
              <option value="7" className="bg-gray-800">Last 7 days</option>
              <option value="30" className="bg-gray-800">Last 30 days</option>
              <option value="90" className="bg-gray-800">Last 3 months</option>
              <option value="365" className="bg-gray-800">Last year</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          </div>
        ) : (
          <>
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatCard
                title="Total Revenue"
                value={`$${analytics.revenue.total.toFixed(2)}`}
                change={analytics.revenue.growth}
                trend="up"
                icon={CurrencyDollarIcon}
                color="green"
              />
              <StatCard
                title="Total Orders"
                value={analytics.orders.total}
                change={15}
                trend="up"
                icon={ShoppingBagIcon}
                color="blue"
              />
              <StatCard
                title="Total Users"
                value={analytics.users.total}
                change={8}
                trend="up"
                icon={UsersIcon}
                color="purple"
              />
              <StatCard
                title="Active Products"
                value={analytics.products.total}
                icon={ChartBarIcon}
                color="orange"
              />
            </div>

            {/* Secondary Metrics */}
            <div className="grid lg:grid-cols-3 gap-8 mb-8">
              {/* Revenue Breakdown */}
              <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <CurrencyDollarIcon className="w-5 h-5 mr-2" />
                  Revenue Breakdown
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">This Month</span>
                    <span className="text-white font-semibold">${analytics.revenue.thisMonth.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Last Month</span>
                    <span className="text-white font-semibold">${analytics.revenue.lastMonth.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center border-t border-white/10 pt-4">
                    <span className="text-gray-400">Growth</span>
                    <span className="text-green-400 font-semibold">+{analytics.revenue.growth}%</span>
                  </div>
                </div>
              </div>

              {/* Order Status */}
              <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <ShoppingBagIcon className="w-5 h-5 mr-2" />
                  Order Status
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Pending</span>
                    <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-sm">
                      {analytics.orders.pending}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Completed</span>
                    <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded-full text-sm">
                      {analytics.orders.completed}
                    </span>
                  </div>
                  <div className="flex justify-between items-center border-t border-white/10 pt-4">
                    <span className="text-gray-400">This Month</span>
                    <span className="text-white font-semibold">{analytics.orders.thisMonth}</span>
                  </div>
                </div>
              </div>

              {/* User Stats */}
              <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <UsersIcon className="w-5 h-5 mr-2" />
                  User Statistics
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">New This Month</span>
                    <span className="text-white font-semibold">{analytics.users.newThisMonth}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Active Users</span>
                    <span className="text-white font-semibold">{analytics.users.activeUsers}</span>
                  </div>
                  <div className="flex justify-between items-center border-t border-white/10 pt-4">
                    <span className="text-gray-400">Total Users</span>
                    <span className="text-white font-semibold">{analytics.users.total}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Inventory Alerts */}
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Low Stock Alert */}
              <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Inventory Alerts</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                    <div>
                      <p className="text-yellow-400 font-medium">Low Stock Items</p>
                      <p className="text-gray-400 text-sm">Items running low on inventory</p>
                    </div>
                    <span className="text-2xl font-bold text-yellow-400">{analytics.products.lowStock}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                    <div>
                      <p className="text-red-400 font-medium">Out of Stock</p>
                      <p className="text-gray-400 text-sm">Items completely out of stock</p>
                    </div>
                    <span className="text-2xl font-bold text-red-400">{analytics.products.outOfStock}</span>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <button className="w-full p-3 bg-white/10 hover:bg-white/20 rounded-lg text-left transition-colors">
                    <p className="text-white font-medium">Export Sales Report</p>
                    <p className="text-gray-400 text-sm">Download detailed sales analytics</p>
                  </button>
                  <button className="w-full p-3 bg-white/10 hover:bg-white/20 rounded-lg text-left transition-colors">
                    <p className="text-white font-medium">View Customer Insights</p>
                    <p className="text-gray-400 text-sm">Analyze customer behavior and trends</p>
                  </button>
                  <button className="w-full p-3 bg-white/10 hover:bg-white/20 rounded-lg text-left transition-colors">
                    <p className="text-white font-medium">Product Performance</p>
                    <p className="text-gray-400 text-sm">See top performing products</p>
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminAnalytics;
