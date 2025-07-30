import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { HeartIcon, ShoppingCartIcon } from '@heroicons/react/24/outline';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { useCurrency } from '../context/CurrencyContext';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Wishlist = () => {
  const { wishlistItems, removeFromWishlist, loading } = useWishlist();
  const { addToCart } = useCart();
  const { formatPrice } = useCurrency();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  const handleAddToCart = async (product) => {
    if (!isAuthenticated) {
      toast.error('Please login to add items to cart');
      navigate('/login');
      return;
    }

    if (product.stock === 0) {
      toast.error('Product is out of stock');
      return;
    }

    const result = await addToCart(product);
    if (result.success) {
      toast.success('Added to cart!');
    }
  };

  const handleRemoveFromWishlist = async (productId) => {
    await removeFromWishlist(productId);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center text-white">
          <HeartIcon className="h-16 w-16 mx-auto mb-4 text-gray-400" />
          <h2 className="text-2xl font-bold mb-4">Please Login</h2>
          <p className="text-gray-400 mb-6">You need to login to access your wishlist.</p>
          <Link
            to="/login"
            className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-200"
          >
            Login
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white">Loading your wishlist...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 mt-20">
      <div className="flex items-center space-x-3 mb-8">
        <HeartIcon className="h-8 w-8 text-red-500" />
        <h1 className="text-3xl font-bold text-white">My Wishlist</h1>
        <span className="bg-white/10 text-white px-3 py-1 rounded-full text-sm">
          {wishlistItems.length} items
        </span>
      </div>

      {wishlistItems.length === 0 ? (
        <div className="text-center py-16">
          <HeartIcon className="h-24 w-24 mx-auto mb-6 text-gray-400" />
          <h2 className="text-2xl font-bold text-white mb-4">Your wishlist is empty</h2>
          <p className="text-gray-400 mb-8">
            Save your favorite items to your wishlist and shop them later.
          </p>
          <Link
            to="/products"
            className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-200"
          >
            Continue Shopping
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {wishlistItems.map((product) => (
            <div
              key={product._id}
              className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl overflow-hidden hover:border-white/40 transition-all duration-300 group"
            >
              <Link to={`/product/${product._id}`} className="block">
                <div className="aspect-square overflow-hidden bg-white/5">
                  <img
                    src={product.images?.[0]?.url || product.image}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-white text-lg mb-2 group-hover:text-gray-300 transition-colors line-clamp-2">
                    {product.name}
                  </h3>
                  <p className="text-gray-400 text-sm mb-3 line-clamp-2">
                    {product.description}
                  </p>
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-xl font-bold text-white">
                      {formatPrice(product.price)}
                    </div>
                    {product.comparePrice && product.comparePrice > product.price && (
                      <div className="text-sm text-gray-400 line-through">
                        {formatPrice(product.comparePrice)}
                      </div>
                    )}
                  </div>
                  {/* Stock Status */}
                  <div className="mb-4">
                    {product.stock > 0 ? (
                      <div className="text-green-400 text-sm font-medium">✓ In Stock</div>
                    ) : (
                      <div className="text-red-400 text-sm font-medium">✗ Out of Stock</div>
                    )}
                  </div>
                </div>
              </Link>
              
              <div className="p-4 pt-0 flex space-x-2">
                <button
                  onClick={() => handleAddToCart(product)}
                  disabled={product.stock === 0}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-xl font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  <ShoppingCartIcon className="h-4 w-4" />
                  <span>{product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}</span>
                </button>
                <button
                  onClick={() => handleRemoveFromWishlist(product._id)}
                  className="p-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors"
                  title="Remove from Wishlist"
                >
                  <HeartIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Wishlist;
