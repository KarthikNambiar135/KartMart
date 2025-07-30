import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCartIcon, HeartIcon, ScaleIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useCurrency } from '../context/CurrencyContext';
import { useWishlist } from '../context/WishlistContext';
import { useComparison } from '../context/ComparisonContext';
import toast from 'react-hot-toast';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const { formatPrice } = useCurrency();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { addToCompare, isInCompare } = useComparison();
  const navigate = useNavigate();

  // ✅ FIXED: Proper product data extraction
  const productId = product._id || product.id;
  const productImage = product.images?.[0]?.url || product.image;
  const productPrice = product.price;
  const productName = product.name;
  const productDescription = product.description;
  const productRating = product.rating || 0;
  const productStock = Number(product.stock) || 0;
  const lowStockThreshold = Number(product.lowStockThreshold) || 10;
  const isInStock = productStock > 0;
  const isLowStock = productStock <= lowStockThreshold && productStock > 0;

  // ✅ Check wishlist and comparison status
  const inWishlist = isInWishlist(productId);
  const inComparison = isInCompare(productId);

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isAuthenticated) {
      toast.error('Please login to add items to cart');
      navigate('/login');
      return;
    }

    if (!isInStock) {
      toast.error('Product is out of stock');
      return;
    }

    const result = await addToCart(product);
    if (result.success) {
      toast.success('Added to cart!');
    }
  };

  // ✅ FIXED: Handle wishlist toggle
  const handleWishlistToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isAuthenticated) {
      toast.error('Please login to add items to wishlist');
      navigate('/login');
      return;
    }

    if (inWishlist) {
      await removeFromWishlist(productId);
    } else {
      await addToWishlist(product);
    }
  };

  // ✅ FIXED: Handle comparison toggle
  const handleCompareToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCompare(product);
  };

  return (
    <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl overflow-hidden hover:border-white/40 transition-all duration-700 ease-in-out group relative">
      <Link to={`/product/${productId}`} className="block">
        {/* Product Image */}
        <div className="aspect-square overflow-hidden bg-white/5 relative">
          <img
            src={productImage}
            alt={productName}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          
          {/* ✅ RESTORED: Your original heart icon position */}
          <button
            onClick={handleWishlistToggle}
            className={`absolute top-3 right-3 p-2 rounded-full transition-colors ${
              inWishlist
                ? 'bg-red-500 text-white hover:bg-red-600'
                : 'bg-white/100 text-black hover:bg-white/30'
            }`}
          >
            {inWishlist ? (
              <HeartIconSolid className="h-4 w-4" />
            ) : (
              <HeartIcon className="h-4 w-4" />
            )}
          </button>
        </div>

        {/* Product Info */}
        <div className="p-4">
          <h3 className="font-semibold text-white text-lg mb-2 group-hover:text-gray-300 transition-colors line-clamp-2">
            {productName}
          </h3>
          
          <p className="text-gray-400 text-sm mb-3 line-clamp-2">
            {productDescription}
          </p>

          {/* Rating */}
          <div className="flex items-center space-x-1 mb-3">
            {[1, 2, 3, 4, 5].map((star) => (
              <svg
                key={star}
                className={`h-4 w-4 ${
                  star <= productRating ? 'text-yellow-400' : 'text-gray-400'
                }`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
            <span className="text-gray-400 text-sm ml-1">({productRating})</span>
          </div>

          {/* Price */}
          <div className="flex items-center justify-between mb-4">
            <div className="text-xl font-bold text-white">
              {formatPrice(productPrice)}
            </div>
            {product.comparePrice && product.comparePrice > product.price && (
              <div className="text-sm text-gray-400 line-through">
                {formatPrice(product.comparePrice)}
              </div>
            )}
          </div>

          {/* Stock Status */}
          <div className="mb-4">
            {isInStock ? (
              <div className="flex items-center space-x-2">
                <div className="text-green-400 text-sm font-medium">✓ In Stock</div>
                {isLowStock && (
                  <div className="text-yellow-400 text-xs">
                    Only {productStock} left
                  </div>
                )}
              </div>
            ) : (
              <div className="text-red-400 text-sm font-medium">✗ Out of Stock</div>
            )}
          </div>

          {/* ✅ RESTORED: Your original action buttons layout */}
          <div className="flex items-center space-x-2">
            {/* Add to Cart Button */}
            <button
              onClick={handleAddToCart}
              disabled={!isInStock}
              className="flex-1 bg-gradient-to-r from-white/50 via-gray-400 to-gray-700 text-white px-4 py-2 rounded-xl font-semibold hover:from-gray-700 hover:via-gray-400 hover:to-white/50 transition-all duration-700 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              <ShoppingCartIcon className="h-4 w-4" />
              <span>{isInStock ? 'Add to Cart' : 'Out of Stock'}</span>
            </button>

            {/* ✅ RESTORED: Compare button in your original position */}
            <button
              onClick={handleCompareToggle}
              className={`p-2 rounded-xl transition-colors ${
                inComparison
                  ? 'bg-blue-500 text-white hover:bg-blue-600'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
              title={inComparison ? 'Added to Compare' : 'Add to Compare'}
            >
              <ScaleIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default ProductCard;
