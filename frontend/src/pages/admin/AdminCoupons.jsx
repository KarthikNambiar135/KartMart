import React, { useState, useEffect } from 'react';
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon,
  TicketIcon,
  CalendarIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';
import { adminAPI } from '../../services/api';
import toast from 'react-hot-toast';

const AdminCoupons = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [formData, setFormData] = useState({
    code: '',
    description: '',
    type: 'percentage',
    value: '',
    minimumAmount: '',
    maximumDiscount: '',
    usageLimit: '',
    userLimit: 1,
    validFrom: '',
    validUntil: '',
    isActive: true
  });

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getCoupons();
      setCoupons(response.data.data.coupons);
    } catch (error) {
      console.error('Failed to fetch coupons:', error);
      toast.error('Failed to load coupons');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const submitData = {
        ...formData,
        value: parseFloat(formData.value),
        minimumAmount: formData.minimumAmount ? parseFloat(formData.minimumAmount) : 0,
        maximumDiscount: formData.maximumDiscount ? parseFloat(formData.maximumDiscount) : null,
        usageLimit: formData.usageLimit ? parseInt(formData.usageLimit) : null,
        userLimit: parseInt(formData.userLimit)
      };

      if (editingCoupon) {
        await adminAPI.updateCoupon(editingCoupon._id, submitData);
        toast.success('Coupon updated successfully');
      } else {
        await adminAPI.createCoupon(submitData);
        toast.success('Coupon created successfully');
      }
      
      fetchCoupons();
      resetForm();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save coupon');
    }
  };

  const handleEdit = (coupon) => {
    setEditingCoupon(coupon);
    setFormData({
      code: coupon.code,
      description: coupon.description || '',
      type: coupon.type,
      value: coupon.value.toString(),
      minimumAmount: coupon.minimumAmount?.toString() || '',
      maximumDiscount: coupon.maximumDiscount?.toString() || '',
      usageLimit: coupon.usageLimit?.toString() || '',
      userLimit: coupon.userLimit,
      validFrom: new Date(coupon.validFrom).toISOString().slice(0, 16),
      validUntil: new Date(coupon.validUntil).toISOString().slice(0, 16),
      isActive: coupon.isActive
    });
    setShowModal(true);
  };

  const handleDelete = async (couponId) => {
    if (!window.confirm('Are you sure you want to delete this coupon?')) {
      return;
    }

    try {
      await adminAPI.deleteCoupon(couponId);
      toast.success('Coupon deleted successfully');
      fetchCoupons();
    } catch (error) {
      toast.error('Failed to delete coupon');
    }
  };

  const resetForm = () => {
    setFormData({
      code: '',
      description: '',
      type: 'percentage',
      value: '',
      minimumAmount: '',
      maximumDiscount: '',
      usageLimit: '',
      userLimit: 1,
      validFrom: '',
      validUntil: '',
      isActive: true
    });
    setEditingCoupon(null);
    setShowModal(false);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const getCouponStatus = (coupon) => {
    const now = new Date();
    const validFrom = new Date(coupon.validFrom);
    const validUntil = new Date(coupon.validUntil);
    
    if (!coupon.isActive) return { text: 'Inactive', color: 'bg-gray-500/20 text-gray-400' };
    if (now < validFrom) return { text: 'Scheduled', color: 'bg-blue-500/20 text-blue-400' };
    if (now > validUntil) return { text: 'Expired', color: 'bg-red-500/20 text-red-400' };
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) return { text: 'Used Up', color: 'bg-orange-500/20 text-orange-400' };
    return { text: 'Active', color: 'bg-green-500/20 text-green-400' };
  };

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Coupons</h1>
            <p className="text-gray-400 mt-2">Manage discount coupons and promotions</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="bg-white text-black px-4 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors flex items-center space-x-2"
          >
            <PlusIcon className="w-5 h-5" />
            <span>Add Coupon</span>
          </button>
        </div>

        {/* Coupons List */}
        <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-white/5">
                  <tr className="text-left">
                    <th className="px-6 py-4 text-gray-300 font-medium">Code</th>
                    <th className="px-6 py-4 text-gray-300 font-medium">Type</th>
                    <th className="px-6 py-4 text-gray-300 font-medium">Value</th>
                    <th className="px-6 py-4 text-gray-300 font-medium">Usage</th>
                    <th className="px-6 py-4 text-gray-300 font-medium">Valid Period</th>
                    <th className="px-6 py-4 text-gray-300 font-medium">Status</th>
                    <th className="px-6 py-4 text-gray-300 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {coupons.map((coupon) => {
                    const status = getCouponStatus(coupon);
                    return (
                      <tr key={coupon._id} className="hover:bg-white/5 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center">
                              <TicketIcon className="w-5 h-5 text-gray-400" />
                            </div>
                            <div>
                              <p className="text-white font-mono font-semibold">{coupon.code}</p>
                              {coupon.description && (
                                <p className="text-gray-400 text-sm">{coupon.description}</p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-2 py-1 bg-white/10 text-white rounded-full text-xs">
                            {coupon.type === 'percentage' ? 'Percentage' : 'Fixed Amount'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-white font-semibold">
                          {coupon.type === 'percentage' ? `${coupon.value}%` : `$${coupon.value}`}
                        </td>
                        <td className="px-6 py-4 text-gray-300">
                          {coupon.usedCount} / {coupon.usageLimit || '∞'}
                        </td>
                        <td className="px-6 py-4 text-gray-300">
                          <div className="flex items-center space-x-1">
                            <CalendarIcon className="w-4 h-4" />
                            <span className="text-xs">
                              {new Date(coupon.validFrom).toLocaleDateString()} - {new Date(coupon.validUntil).toLocaleDateString()}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${status.color}`}>
                            {status.text}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleEdit(coupon)}
                              className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                            >
                              <PencilIcon className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(coupon._id)}
                              className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                            >
                              <TrashIcon className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 overflow-y-auto">
            <div className="bg-gray-900 rounded-xl p-6 max-w-2xl w-full mx-4 border border-white/10 my-8">
              <h3 className="text-xl font-semibold text-white mb-6">
                {editingCoupon ? 'Edit Coupon' : 'Add New Coupon'}
              </h3>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Coupon Code *
                    </label>
                    <input
                      type="text"
                      name="code"
                      value={formData.code}
                      onChange={handleInputChange}
                      required
                      className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-white uppercase"
                      placeholder="SAVE20"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Type *
                    </label>
                    <select
                      name="type"
                      value={formData.type}
                      onChange={handleInputChange}
                      required
                      className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-white"
                    >
                      <option value="percentage" className="bg-gray-800">Percentage</option>
                      <option value="fixed" className="bg-gray-800">Fixed Amount</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={2}
                    className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-white"
                    placeholder="Describe this coupon"
                  />
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Value * {formData.type === 'percentage' ? '(%)' : '($)'}
                    </label>
                    <input
                      type="number"
                      name="value"
                      value={formData.value}
                      onChange={handleInputChange}
                      required
                      min="0"
                      step={formData.type === 'percentage' ? '1' : '0.01'}
                      max={formData.type === 'percentage' ? '100' : undefined}
                      className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Min. Order Amount
                    </label>
                    <input
                      type="number"
                      name="minimumAmount"
                      value={formData.minimumAmount}
                      onChange={handleInputChange}
                      min="0"
                      step="0.01"
                      className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Max. Discount
                    </label>
                    <input
                      type="number"
                      name="maximumDiscount"
                      value={formData.maximumDiscount}
                      onChange={handleInputChange}
                      min="0"
                      step="0.01"
                      className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-white"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Usage Limit
                    </label>
                    <input
                      type="number"
                      name="usageLimit"
                      value={formData.usageLimit}
                      onChange={handleInputChange}
                      min="1"
                      className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-white"
                      placeholder="Unlimited"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Per User Limit *
                    </label>
                    <input
                      type="number"
                      name="userLimit"
                      value={formData.userLimit}
                      onChange={handleInputChange}
                      required
                      min="1"
                      className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-white"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Valid From *
                    </label>
                    <input
                      type="datetime-local"
                      name="validFrom"
                      value={formData.validFrom}
                      onChange={handleInputChange}
                      required
                      className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Valid Until *
                    </label>
                    <input
                      type="datetime-local"
                      name="validUntil"
                      value={formData.validUntil}
                      onChange={handleInputChange}
                      required
                      className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="isActive"
                      checked={formData.isActive}
                      onChange={handleInputChange}
                      className="mr-3 w-4 h-4"
                    />
                    <span className="text-white">Coupon is active</span>
                  </label>
                </div>

                <div className="flex space-x-4 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-white text-black font-semibold py-2 px-4 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    {editingCoupon ? 'Update Coupon' : 'Create Coupon'}
                  </button>
                  <button
                    type="button"
                    onClick={resetForm}
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

export default AdminCoupons;
