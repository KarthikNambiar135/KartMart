import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FunnelIcon, Squares2X2Icon, ListBulletIcon } from '@heroicons/react/24/outline';
import { productAPI } from '../services/api';
import ProductCard from '../components/ProductCard';
import toast from 'react-hot-toast';

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    categories: [],
    brands: [],
    priceRange: { min: 0, max: 1000 }
  });
  const [pagination, setPagination] = useState({
    page: 1,
    pages: 1,
    total: 0
  });

  // Filter states
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [priceRange, setPriceRange] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('newest');

  const fetchProducts = async (params = {}) => {
    try {
      setLoading(true);
      const queryParams = {
        page: pagination.page,
        limit: 12,
        search: searchTerm,
        category: selectedCategory !== 'all' ? selectedCategory : undefined,
        sort: sortBy,
        ...params
      };

      // Add price range filters
      if (priceRange === '0-50') {
        queryParams.maxPrice = 50;
      } else if (priceRange === '50-200') {
        queryParams.minPrice = 50;
        queryParams.maxPrice = 200;
      } else if (priceRange === '200+') {
        queryParams.minPrice = 200;
      }

      // Remove undefined values
      Object.keys(queryParams).forEach(key => 
        queryParams[key] === undefined && delete queryParams[key]
      );

      const response = await productAPI.getProducts(queryParams);
      const { products, pagination: paginationData, filters: filterData } = response.data.data;

      setProducts(products);
      setPagination(paginationData);
      setFilters(filterData);
    } catch (error) {
      console.error('Failed to fetch products:', error);
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [searchTerm, selectedCategory, priceRange, sortBy, pagination.page]);

  useEffect(() => {
    const searchQuery = searchParams.get('search');
    if (searchQuery) {
      setSearchTerm(searchQuery);
    }
  }, [searchParams]);

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handlePriceRangeChange = (range) => {
    setPriceRange(range);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleSortChange = (sort) => {
    setSortBy(sort);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const categories = [
    { value: 'all', label: 'All', emoji: '🛍️' },
    ...filters.categories.map(cat => ({
      value: cat,
      label: cat.charAt(0).toUpperCase() + cat.slice(1),
      emoji: cat === 'electronics' ? '📱' : cat === 'accessories' ? '👜' : cat === 'clothing' ? '👕' : '🏠'
    }))
  ];

  const priceRanges = [
    { value: 'all', label: 'All Prices' },
    { value: '0-50', label: 'Under $50' },
    { value: '50-200', label: '$50 - $200' },
    { value: '200+', label: 'Over $200' }
  ];

  const sortOptions = [
    { value: 'newest', label: 'Newest' },
    { value: 'price_asc', label: 'Price: Low to High' },
    { value: 'price_desc', label: 'Price: High to Low' },
    { value: 'rating', label: 'Highest Rated' },
    { value: 'popular', label: 'Most Popular' }
  ];

  return (
    <div className="min-h-screen py-4 md:py-8 mt-15">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl md:text-4xl font-bold text-white mb-2">Products</h1>
          <p className="text-gray-400">Discover our curated collection</p>
        </div>

        {/* Mobile Category Pills */}
        <div className="mb-6 overflow-x-auto scrollbar-hide">
          <div className="flex space-x-3 pb-2">
            {categories.map(category => (
              <button
                key={category.value}
                onClick={() => handleCategoryChange(category.value)}
                className={`flex items-center space-x-2 px-4 py-3 rounded-2xl whitespace-nowrap transition-all duration-300 transform hover:scale-105 ${
                  selectedCategory === category.value
                    ? 'bg-white text-black shadow-lg shadow-white/25 font-semibold'
                    : 'bg-white/10 backdrop-blur-sm text-gray-300 hover:bg-white/15'
                }`}
              >
                <span className="text-lg">{category.emoji}</span>
                <span className="font-medium">{category.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-3">
            <select
              value={priceRange}
              onChange={(e) => handlePriceRangeChange(e.target.value)}
              className="px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl text-white focus:outline-none focus:border-white transition-all duration-300"
            >
              {priceRanges.map(range => (
                <option key={range.value} value={range.value} className="bg-gray-800">
                  {range.label}
                </option>
              ))}
            </select>

            <select
              value={sortBy}
              onChange={(e) => handleSortChange(e.target.value)}
              className="px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl text-white focus:outline-none focus:border-white transition-all duration-300"
            >
              {sortOptions.map(option => (
                <option key={option.value} value={option.value} className="bg-gray-800">
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* View Mode Toggle */}
          <div className="hidden md:flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-2xl p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-xl transition-all duration-200 ${
                viewMode === 'grid' ? 'bg-white text-black' : 'text-gray-400 hover:text-white'
              }`}
            >
              <Squares2X2Icon className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-xl transition-all duration-200 ${
                viewMode === 'list' ? 'bg-white text-black' : 'text-gray-400 hover:text-white'
              }`}
            >
              <ListBulletIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Results count */}
        <div className="mb-6">
          <p className="text-gray-400 text-sm">
            {pagination.total} product{pagination.total !== 1 ? 's' : ''} found
          </p>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className={`grid gap-4 md:gap-6 ${
            viewMode === 'grid' 
              ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5' 
              : 'grid-cols-1 max-w-4xl mx-auto'
          }`}>
            {[...Array(8)].map((_, index) => (
              <div key={index} className="bg-white/5 backdrop-blur-sm rounded-3xl overflow-hidden border border-white/10 p-6 animate-pulse">
                <div className="aspect-square bg-white/10 rounded-2xl mb-4"></div>
                <div className="h-4 bg-white/10 rounded mb-2"></div>
                <div className="h-3 bg-white/10 rounded mb-4"></div>
                <div className="h-4 bg-white/10 rounded w-20"></div>
              </div>
            ))}
          </div>
        ) : products.length > 0 ? (
          <>
            <div className={`grid gap-4 md:gap-6 transition-all duration-500 ${
              viewMode === 'grid' 
                ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5' 
                : 'grid-cols-1 max-w-4xl mx-auto'
            }`}>
              {products.map((product, index) => (
                <div
                  key={product._id}
                  className="animate-fadeInUp"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <ProductCard product={product} />
                </div>
              ))}
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="flex justify-center items-center space-x-2 mt-12">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={!pagination.hasPrev}
                  className="px-4 py-2 bg-white/10 backdrop-blur-sm rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/15 transition-colors"
                >
                  Previous
                </button>
                
                <div className="flex space-x-1">
                  {[...Array(pagination.pages)].map((_, index) => {
                    const pageNumber = index + 1;
                    return (
                      <button
                        key={pageNumber}
                        onClick={() => handlePageChange(pageNumber)}
                        className={`px-3 py-2 rounded-lg transition-colors ${
                          pagination.page === pageNumber
                            ? 'bg-white text-black font-semibold'
                            : 'bg-white/10 backdrop-blur-sm text-white hover:bg-white/15'
                        }`}
                      >
                        {pageNumber}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={!pagination.hasNext}
                  className="px-4 py-2 bg-white/10 backdrop-blur-sm rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/15 transition-colors"
                >
                  Next
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-white mb-2">No products found</h3>
            <p className="text-gray-400">Try adjusting your search or filter criteria</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Products;
