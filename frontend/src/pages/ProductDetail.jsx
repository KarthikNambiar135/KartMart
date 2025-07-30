import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ShoppingCartIcon, HeartIcon, ArrowLeftIcon, ScaleIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid'; // ✅ Added
import { productAPI } from '../services/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext'; // ✅ Added
import { useComparison } from '../context/ComparisonContext'; // ✅ Added
import { useCurrency } from '../context/CurrencyContext'; // ✅ Added
import ProductCard from '../components/ProductCard';
import toast from 'react-hot-toast';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist(); // ✅ Added
  const { addToCompare, isInCompare } = useComparison(); // ✅ Added
  const { formatPrice } = useCurrency(); // ✅ Added
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [review, setReview] = useState({ rating: 5, comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await productAPI.getProduct(id);
        const { product, relatedProducts } = response.data.data;
        setProduct(product);
        setRelatedProducts(relatedProducts || []);
      } catch (error) {
        console.error('Failed to fetch product:', error);
        toast.error('Product not found');
        navigate('/products');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id, navigate]);

  // ✅ NEW: Handle wishlist toggle
  const handleWishlistToggle = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to add items to wishlist');
      navigate('/login');
      return;
    }

    if (isInWishlist(product._id)) {
      await removeFromWishlist(product._id);
    } else {
      await addToWishlist(product);
    }
  };

  // ✅ NEW: Handle comparison toggle
  const handleCompareToggle = () => {
    addToCompare(product);
  };

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to add items to cart');
      navigate('/login');
      return;
    }

    const result = await addToCart(product, quantity);
    if (result.success) {
      toast.success(`Added ${quantity} item(s) to cart`);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error('Please login to submit a review');
      navigate('/login');
      return;
    }

    try {
      setSubmittingReview(true);
      await productAPI.addReview(product._id, review);
      toast.success('Review submitted successfully');
      setReview({ rating: 5, comment: '' });
      // Refresh product data to show new review
      const response = await productAPI.getProduct(id);
      setProduct(response.data.data.product);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white text-xl">Product not found</div>
      </div>
    );
  }

  // ✅ Stock calculations
  const productStock = Number(product.stock) || 0;
  const lowStockThreshold = Number(product.lowStockThreshold) || 10;
  const isInStock = productStock > 0;
  const isLowStock = productStock <= lowStockThreshold && productStock > 0;

  // ✅ Check wishlist and comparison status
  const inWishlist = isInWishlist(product._id);
  const inComparison = isInCompare(product._id);

  return (
    <div className="container mx-auto px-4 py-8 mt-20">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center space-x-2 text-white hover:text-gray-300 transition-colors mb-6"
      >
        <ArrowLeftIcon className="h-5 w-5" />
        <span>Back</span>
      </button>

      <div className="grid lg:grid-cols-2 gap-12">
        {/* Product Images */}
        <div className="space-y-4">
          <div className="aspect-square bg-white/10 backdrop-blur-sm rounded-2xl overflow-hidden">
            <img
              src={product.images?.[selectedImage]?.url || product.images?.[0]?.url}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>
          {product.images && product.images.length > 1 && (
            <div className="flex space-x-2 overflow-x-auto">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                    selectedImage === index ? 'border-white' : 'border-white/20'
                  }`}
                >
                  <img
                    src={image.url}
                    alt={`${product.name} ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">{product.name}</h1>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg
                    key={star}
                    className={`h-5 w-5 ${
                      star <= (product.rating || 0) ? 'text-yellow-400' : 'text-gray-400'
                    }`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
                <span className="text-white ml-2">({product.reviews?.length || 0} reviews)</span>
              </div>
            </div>
          </div>

          {/* Price */}
          <div className="space-y-2">
            <div className="text-3xl font-bold text-white">{formatPrice(product.price)}</div>
            {product.comparePrice && product.comparePrice > product.price && (
              <>
                <div className="text-xl text-gray-400 line-through">{formatPrice(product.comparePrice)}</div>
                <div className="text-green-400 font-semibold">
                  {product.discountPercentage}% OFF
                </div>
              </>
            )}
          </div>

          {/* Description */}
          <div className="text-gray-300 leading-relaxed">
            {product.description}
          </div>

          {/* ✅ UPDATED: Stock Status */}
          <div className="space-y-2">
            {isInStock ? (
              <>
                <div className="text-green-400 font-semibold">✓ In Stock</div>
                {isLowStock && (
                  <div className="text-yellow-400 text-sm">
                    Only {productStock} left in stock
                  </div>
                )}
              </>
            ) : (
              <div className="text-red-400 font-semibold">✗ Out of Stock</div>
            )}
          </div>

          {/* Quantity and Actions */}
          <div className="space-y-4">
            {isInStock && (
              <div className="flex items-center space-x-4">
                <label className="text-white font-medium">Quantity:</label>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-8 h-8 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
                  >
                    -
                  </button>
                  <span className="text-white font-medium w-8 text-center">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(productStock, quantity + 1))}
                    className="w-8 h-8 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex space-x-4">
              {isInStock && (
                <button
                  onClick={handleAddToCart}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-200 flex items-center justify-center space-x-2"
                >
                  <ShoppingCartIcon className="h-5 w-5" />
                  <span>Add to Cart</span>
                </button>
              )}

              {/* ✅ FIXED: Wishlist Button */}
              <button
                onClick={handleWishlistToggle}
                className={`p-3 rounded-xl border transition-all duration-200 ${
                  inWishlist
                    ? 'bg-red-500 border-red-500 text-white hover:bg-red-600'
                    : 'border-white/20 text-white hover:border-white hover:bg-white/10'
                }`}
                title={inWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
              >
                {inWishlist ? (
                  <HeartIconSolid className="h-6 w-6" />
                ) : (
                  <HeartIcon className="h-6 w-6" />
                )}
              </button>

              {/* ✅ FIXED: Comparison Button */}
              <button
                onClick={handleCompareToggle}
                className={`p-3 rounded-xl border transition-all duration-200 ${
                  inComparison
                    ? 'bg-blue-500 border-blue-500 text-white hover:bg-blue-600'
                    : 'border-white/20 text-white hover:border-white hover:bg-white/10'
                }`}
                title={inComparison ? 'Added to Compare' : 'Add to Compare'}
              >
                <ScaleIcon className="h-6 w-6" />
              </button>
            </div>
          </div>

          {/* Product Details */}
          <div className="space-y-4 pt-6 border-t border-white/20">
            <h3 className="text-xl font-semibold text-white">Product Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-gray-400">Category:</span>
                <span className="text-white ml-2">{product.category}</span>
              </div>
              <div>
                <span className="text-gray-400">Brand:</span>
                <span className="text-white ml-2">{product.brand}</span>
              </div>
              <div>
                <span className="text-gray-400">SKU:</span>
                <span className="text-white ml-2">{product.sku}</span>
              </div>
              <div>
                <span className="text-gray-400">Stock:</span>
                <span className="text-white ml-2">{productStock} units</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="mt-16 space-y-8">
        <h2 className="text-2xl font-bold text-white">Customer Reviews</h2>
        
        {/* Add Review Form */}
        {isAuthenticated && (
          <form onSubmit={handleReviewSubmit} className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 space-y-4">
            <h3 className="text-lg font-semibold text-white">Write a Review</h3>
            <div>
              <label className="block text-white font-medium mb-2">Rating</label>
              <div className="flex space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setReview({ ...review, rating: star })}
                    className={`h-8 w-8 ${
                      star <= review.rating ? 'text-yellow-400' : 'text-gray-400'
                    } hover:text-yellow-400 transition-colors`}
                  >
                    <svg fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-white font-medium mb-2">Comment</label>
              <textarea
                value={review.comment}
                onChange={(e) => setReview({ ...review, comment: e.target.value })}
                className="w-full p-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-white focus:bg-white/15 transition-all duration-300"
                rows={4}
                placeholder="Share your thoughts about this product..."
                required
              />
            </div>
            <button
              type="submit"
              disabled={submittingReview}
              className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-2 rounded-xl font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-200 disabled:opacity-50"
            >
              {submittingReview ? 'Submitting...' : 'Submit Review'}
            </button>
          </form>
        )}

        {/* Reviews List */}
        <div className="space-y-6">
          {product.reviews && product.reviews.length > 0 ? (
            product.reviews.map((review) => (
              <div key={review._id} className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center space-x-1 mb-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <svg
                          key={star}
                          className={`h-4 w-4 ${
                            star <= review.rating ? 'text-yellow-400' : 'text-gray-400'
                          }`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <div className="text-white font-medium">
                      {review.user?.firstName} {review.user?.lastName}
                    </div>
                  </div>
                  <div className="text-gray-400 text-sm">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <p className="text-gray-300">{review.comment}</p>
              </div>
            ))
          ) : (
            <div className="text-center text-gray-400 py-8">
              No reviews yet. Be the first to review this product!
            </div>
          )}
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-white mb-8">Related Products</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((relatedProduct) => (
              <ProductCard key={relatedProduct._id} product={relatedProduct} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetail;
