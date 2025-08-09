import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeftIcon, StarIcon } from '@heroicons/react/24/outline';
import { orderAPI, productAPI } from '../services/api';
import toast from 'react-hot-toast';

const OrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reviewModal, setReviewModal] = useState({ isOpen: false, product: null });
  const [review, setReview] = useState({ rating: 5, comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const response = await orderAPI.getOrder(id);
      if (response.data.success) {
        setOrder(response.data.data.order);
      }
    } catch (error) {
      console.error('Failed to fetch order:', error);
      toast.error('Order not found');
      navigate('/orders');
    } finally {
      setLoading(false);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setSubmittingReview(true);
      await productAPI.addReview(reviewModal.product._id, review);
      toast.success('Review submitted successfully');
      setReviewModal({ isOpen: false, product: null });
      setReview({ rating: 5, comment: '' });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  const openReviewModal = (product) => {
    setReviewModal({ isOpen: true, product });
  };

  const closeReviewModal = () => {
    setReviewModal({ isOpen: false, product: null });
    setReview({ rating: 5, comment: '' });
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
          <Link
            to="/orders"
            className="text-gray-400 hover:text-white"
          >
            Back to Orders
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen mt-15 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center mb-8">
          <button
            onClick={() => navigate('/orders')}
            className="flex items-center text-gray-400 hover:text-white mr-4"
          >
            <ArrowLeftIcon className="w-5 h-5 mr-2" />
            Back to Orders
          </button>
          <div>
            <h1 className="text-3xl font-bold text-white">Order Details</h1>
            <p className="text-gray-400">Order #{order.orderNumber}</p>
          </div>
        </div>

        {/* Order Information */}
        <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6 mb-8">
          <div className="grid md:grid-cols-3 gap-6 mb-6">
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Order Status</h3>
              <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${getStatusColor(order.status)}`}>
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Payment Status</h3>
              <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${
                order.isPaid ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-red-500/20 text-red-400 border-red-500/30'
              }`}>
                {order.isPaid ? 'Paid' : 'Pending Payment'}
              </span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Order Date</h3>
              <p className="text-gray-300">{new Date(order.createdAt).toLocaleDateString()}</p>
            </div>
          </div>

          {/* Shipping Address */}
          <div className="border-t border-white/10 pt-6">
            <h3 className="text-lg font-semibold text-white mb-4">Shipping Address</h3>
            <div className="text-gray-300">
              <p>{order.shippingAddress.firstName} {order.shippingAddress.lastName}</p>
              <p>{order.shippingAddress.street}</p>
              <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}</p>
              <p>{order.shippingAddress.country}</p>
              {order.shippingAddress.phone && <p>Phone: {order.shippingAddress.phone}</p>}
            </div>
          </div>
        </div>

        {/* Order Items */}
        <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6 mb-8">
          <h3 className="text-lg font-semibold text-white mb-4">Order Items</h3>
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
                  <h4 className="text-white font-medium">{item.name}</h4>
                  <p className="text-gray-400 text-sm">Quantity: {item.quantity}</p>
                  <p className="text-gray-400 text-sm">${item.price} each</p>
                </div>
                <div className="text-right">
                  <p className="text-white font-semibold">${(item.price * item.quantity).toFixed(2)}</p>
                  {order.status === 'delivered' && (
                    <button
                      onClick={() => openReviewModal(item)}
                      className="mt-2 text-xs text-blue-400 hover:text-blue-300 underline"
                    >
                      Write Review
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Order Summary */}
        <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Order Summary</h3>
          <div className="space-y-2">
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

        {/* Review Modal */}
        {reviewModal.isOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-gray-900 rounded-xl p-6 max-w-md w-full mx-4 border border-white/10">
              <h3 className="text-xl font-semibold text-white mb-4">Write a Review</h3>
              <p className="text-gray-400 mb-4">Reviewing: {reviewModal.product?.name}</p>
              
              <form onSubmit={handleReviewSubmit}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-300 mb-2">Rating</label>
                  <div className="flex space-x-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setReview({ ...review, rating: star })}
                        className={`p-1 ${star <= review.rating ? 'text-yellow-400' : 'text-gray-600'}`}
                      >
                        <StarIcon className="w-6 h-6 fill-current" />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-300 mb-2">Review</label>
                  <textarea
                    value={review.comment}
                    onChange={(e) => setReview({ ...review, comment: e.target.value })}
                    required
                    rows={4}
                    className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-white"
                    placeholder="Share your experience with this product..."
                  />
                </div>

                <div className="flex space-x-4">
                  <button
                    type="submit"
                    disabled={submittingReview}
                    className="flex-1 bg-white text-black font-semibold py-2 px-4 rounded-lg hover:bg-gray-100 disabled:opacity-50 transition-colors"
                  >
                    {submittingReview ? 'Submitting...' : 'Submit Review'}
                  </button>
                  <button
                    type="button"
                    onClick={closeReviewModal}
                    className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderDetail;
