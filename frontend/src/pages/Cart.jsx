import React from 'react';
import { Link } from 'react-router-dom';
import { TrashIcon, PlusIcon, MinusIcon, ShoppingBagIcon } from '@heroicons/react/24/outline';
import { useCart } from '../context/CartContext';
import { useCurrency } from '../context/CurrencyContext'; // ✅ Added currency context

const Cart = () => {
  const { cartItems, removeFromCart, updateQuantity, getCartTotal, loading } = useCart();
  const { formatPrice } = useCurrency(); // ✅ Added currency formatting

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen flex items-center mt-15 justify-center">
        <div className="text-center">
          <ShoppingBagIcon className="mx-auto h-16 w-16 text-gray-400 mb-4" />
          <h2 className="text-2xl font-bold text-white mb-4">Your cart is empty</h2>
          <p className="text-gray-400 mb-8">Add some products to get started</p>
          <Link
            to="/products"
            className="bg-white text-black px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  const subtotal = getCartTotal();
  const shipping = 10;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  return (
    <div className="min-h-screen mt-15 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-white">Shopping Cart</h1>
          <span className="text-gray-400">{cartItems.length} item{cartItems.length !== 1 ? 's' : ''}</span>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => {
              const productId = item.product._id || item.product.id;
              const productImage = item.product.images?.[0]?.url || item.product.image;
              const productPrice = item.product.price;
              const productName = item.product.name;
              const productDescription = item.product.description;
              const itemTotal = productPrice * item.quantity;

              return (
                <div key={productId} className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6 hover:bg-white/8 transition-all duration-300">
                  <div className="flex items-center space-x-4">
                    {/* Product Image */}
                    <div className="flex-shrink-0">
                      <img
                        src={productImage}
                        alt={productName}
                        className="w-20 h-20 rounded-lg object-cover"
                        onError={(e) => {
                          e.target.src = 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=400&fit=crop';
                        }}
                      />
                    </div>

                    {/* Product Details */}
                    <div className="flex-1 min-w-0">
                      <Link 
                        to={`/product/${productId}`}
                        className="text-lg font-semibold text-white hover:text-gray-300 transition-colors"
                      >
                        {productName}
                      </Link>
                      <p className="text-gray-400 text-sm mt-1 line-clamp-2">
                        {productDescription}
                      </p>
                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center space-x-3">
                          {/* Quantity Controls */}
                          <div className="flex items-center space-x-2 bg-white/10 rounded-lg p-1">
                            <button
                              onClick={() => updateQuantity(productId, Math.max(1, item.quantity - 1))}
                              className="p-1 hover:bg-white/10 rounded transition-colors"
                            >
                              <MinusIcon className="w-4 h-4 text-gray-400" />
                            </button>
                            <span className="px-3 py-1 text-white font-medium min-w-[2rem] text-center">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(productId, item.quantity + 1)}
                              className="p-1 hover:bg-white/10 rounded transition-colors"
                            >
                              <PlusIcon className="w-4 h-4 text-gray-400" />
                            </button>
                          </div>
                          
                          {/* Price */}
                          <span className="text-white font-semibold">
                            {formatPrice(productPrice)} {/* ✅ Updated to use currency formatting */}
                          </span>
                        </div>

                        {/* Item Total and Remove */}
                        <div className="flex items-center space-x-4">
                          <span className="text-lg font-bold text-white">
                            {formatPrice(itemTotal)} {/* ✅ Updated to use currency formatting */}
                          </span>
                          <button
                            onClick={() => removeFromCart(productId)}
                            className="p-2 text-gray-400 hover:text-red-400 hover:bg-white/10 rounded-lg transition-all duration-200"
                          >
                            <TrashIcon className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6 sticky top-24">
              <h2 className="text-xl font-semibold text-white mb-6">Order Summary</h2>
              
              <div className="space-y-4">
                <div className="flex justify-between text-gray-300">
                  <span>Subtotal ({cartItems.length} item{cartItems.length !== 1 ? 's' : ''})</span>
                  <span>{formatPrice(subtotal)}</span> {/* ✅ Updated to use currency formatting */}
                </div>
                
                <div className="flex justify-between text-gray-300">
                  <span>Shipping</span>
                  <span>{formatPrice(shipping)}</span> {/* ✅ Updated to use currency formatting */}
                </div>
                
                <div className="flex justify-between text-gray-300">
                  <span>Tax</span>
                  <span>{formatPrice(tax)}</span> {/* ✅ Updated to use currency formatting */}
                </div>
                
                <hr className="border-white/10" />
                
                <div className="flex justify-between text-xl font-bold text-white">
                  <span>Total</span>
                  <span>{formatPrice(total)}</span> {/* ✅ Updated to use currency formatting */}
                </div>
              </div>

              <div className="mt-8">
                <Link
                  to="/checkout"
                  className="w-full bg-white text-black font-semibold py-3 px-6 rounded-lg hover:bg-gray-100 transition-colors text-center block"
                >
                  Proceed to Checkout
                </Link>
              </div>

              <div className="mt-4">
                <Link
                  to="/products"
                  className="w-full bg-white/10 text-white font-medium py-2 px-6 rounded-lg hover:bg-white/20 transition-colors text-center block"
                >
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
