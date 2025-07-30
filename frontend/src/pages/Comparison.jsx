import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ScaleIcon, XMarkIcon, ShoppingCartIcon } from '@heroicons/react/24/outline';
import { useComparison } from '../context/ComparisonContext';
import { useCart } from '../context/CartContext';
import { useCurrency } from '../context/CurrencyContext';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Comparison = () => {
  const { 
    compareProducts, 
    compareList, 
    loading, 
    loadComparisonProducts, 
    removeFromCompare, 
    clearComparison 
  } = useComparison();
  const { addToCart } = useCart();
  const { formatPrice } = useCurrency();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (compareList.length > 0) {
      loadComparisonProducts();
    }
  }, [compareList.length]);

  const handleAddToCart = async (product) => {
    if (!isAuthenticated) {
      toast.error('Please login to add items to cart');
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white">Loading comparison...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 mt-20">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-3">
          <ScaleIcon className="h-8 w-8 text-blue-500" />
          <h1 className="text-3xl font-bold text-white">Product Comparison</h1>
          <span className="bg-white/10 text-white px-3 py-1 rounded-full text-sm">
            {compareProducts.length} products
          </span>
        </div>
        {compareProducts.length > 0 && (
          <button
            onClick={clearComparison}
            className="bg-red-500 text-white px-4 py-2 rounded-xl hover:bg-red-600 transition-colors"
          >
            Clear All
          </button>
        )}
      </div>

      {compareProducts.length === 0 ? (
        <div className="text-center py-16">
          <ScaleIcon className="h-24 w-24 mx-auto mb-6 text-gray-400" />
          <h2 className="text-2xl font-bold text-white mb-4">No products to compare</h2>
          <p className="text-gray-400 mb-8">
            Add products to comparison from product pages to compare their features.
          </p>
          <Link
            to="/products"
            className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-200"
          >
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <div className="min-w-full bg-white/10 backdrop-blur-sm rounded-2xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/20">
                  <td className="p-4 text-white font-semibold">Product</td>
                  {compareProducts.map((product) => (
                    <td key={product._id} className="p-4 text-center relative min-w-[200px]">
                      <button
                        onClick={() => removeFromCompare(product._id)}
                        className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors"
                        title="Remove from comparison"
                      >
                        <XMarkIcon className="h-4 w-4" />
                      </button>
                      <Link to={`/product/${product._id}`}>
                        <img
                          src={product.images?.[0]?.url || product.image}
                          alt={product.name}
                          className="w-32 h-32 object-cover rounded-xl mx-auto mb-4"
                        />
                        <h3 className="text-white font-semibold text-sm line-clamp-2">
                          {product.name}
                        </h3>
                      </Link>
                    </td>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-white/10">
                  <td className="p-4 text-white font-semibold">Price</td>
                  {compareProducts.map((product) => (
                    <td key={product._id} className="p-4 text-center">
                      <div className="text-white font-bold text-lg">
                        {formatPrice(product.price)}
                      </div>
                      {product.comparePrice && product.comparePrice > product.price && (
                        <div className="text-gray-400 text-sm line-through">
                          {formatPrice(product.comparePrice)}
                        </div>
                      )}
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-white/10">
                  <td className="p-4 text-white font-semibold">Rating</td>
                  {compareProducts.map((product) => (
                    <td key={product._id} className="p-4 text-center">
                      <div className="flex items-center justify-center space-x-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <svg
                            key={star}
                            className={`h-4 w-4 ${
                              star <= (product.rating || 0) ? 'text-yellow-400' : 'text-gray-400'
                            }`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                        <span className="text-white text-sm ml-1">
                          ({product.rating || 0})
                        </span>
                      </div>
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-white/10">
                  <td className="p-4 text-white font-semibold">Category</td>
                  {compareProducts.map((product) => (
                    <td key={product._id} className="p-4 text-center text-white">
                      {product.category}
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-white/10">
                  <td className="p-4 text-white font-semibold">Brand</td>
                  {compareProducts.map((product) => (
                    <td key={product._id} className="p-4 text-center text-white">
                      {product.brand}
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-white/10">
                  <td className="p-4 text-white font-semibold">Stock</td>
                  {compareProducts.map((product) => (
                    <td key={product._id} className="p-4 text-center">
                      <span className={`${
                        product.stock > 0 ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                      </span>
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-white/10">
                  <td className="p-4 text-white font-semibold">Description</td>
                  {compareProducts.map((product) => (
                    <td key={product._id} className="p-4 text-center text-gray-300 text-sm">
                      <div className="line-clamp-3">
                        {product.description}
                      </div>
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="p-4 text-white font-semibold">Actions</td>
                  {compareProducts.map((product) => (
                    <td key={product._id} className="p-4 text-center">
                      <div className="space-y-2">
                        <button
                          onClick={() => handleAddToCart(product)}
                          disabled={product.stock === 0}
                          className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white px-3 py-2 rounded-xl font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-1"
                        >
                          <ShoppingCartIcon className="h-4 w-4" />
                          <span className="text-sm">
                            {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
                          </span>
                        </button>
                        <Link
                          to={`/product/${product._id}`}
                          className="block w-full bg-white/10 text-white px-3 py-2 rounded-xl font-semibold hover:bg-white/20 transition-all duration-200 text-center text-sm"
                        >
                          View Details
                        </Link>
                      </div>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Comparison;
