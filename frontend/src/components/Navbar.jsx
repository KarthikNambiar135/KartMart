import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShoppingCartIcon,
  UserIcon,
  Bars3Icon,
  XMarkIcon,
  MagnifyingGlassIcon,
  ChevronDownIcon,
  ArrowLeftOnRectangleIcon,
  HeartIcon,
  ScaleIcon
} from '@heroicons/react/24/outline';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import { useComparison } from '../context/ComparisonContext';
import { useCurrency } from '../context/CurrencyContext';
import { productAPI } from '../services/api';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const { getCartCount } = useCart();
  const { getWishlistCount } = useWishlist();
  const { getCompareCount } = useComparison();
  const { currency, toggleCurrency } = useCurrency();
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const searchRef = useRef(null);
  const profileDropdownRef = useRef(null);

  const cartItemsCount = getCartCount();
  const wishlistCount = getWishlistCount();
  const compareCount = getCompareCount();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    navigate(`/product/${suggestion.id}`);
    setSearchQuery('');
    setShowSuggestions(false);
  };

  const toggleProfileDropdown = () => {
    setProfileDropdownOpen(!profileDropdownOpen);
  };

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
        setProfileDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch search suggestions
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (searchQuery.length > 1) {
        try {
          const response = await productAPI.getSearchSuggestions(searchQuery);
          setSearchSuggestions(response.data.data.suggestions);
          setShowSuggestions(true);
        } catch (error) {
          console.error('Failed to fetch suggestions:', error);
        }
      } else {
        setSearchSuggestions([]);
        setShowSuggestions(false);
      }
    };

    const timeoutId = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setProfileDropdownOpen(false);
    navigate('/');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/20 backdrop-blur-md border-b border-white/10">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-xl">K</span>
            </div>
            <span className="text-white font-bold text-xl hidden sm:block">KartMart</span>
          </Link>

          {/* Desktop Search */}
          <div className="hidden lg:block flex-1 max-w-2xl mx-8 relative" ref={searchRef}>
            <form onSubmit={handleSearch} className="relative">
              <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products..."
                className="w-full pl-12 pr-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-white placeholder-gray-400 focus:outline-none focus:border-white focus:bg-white/15 transition-all duration-300"
              />
            </form>

            {/* Search Suggestions */}
            {showSuggestions && searchSuggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-black/90 backdrop-blur-sm border border-white/20 rounded-2xl overflow-hidden z-50">
                {searchSuggestions.map((suggestion) => (
                  <button
                    key={suggestion.id}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="w-full px-4 py-3 text-left hover:bg-white/10 transition-colors text-white text-sm border-b border-white/5 last:border-b-0"
                  >
                    <div className="font-medium">{suggestion.text}</div>
                    <div className="text-gray-400 text-xs">
                      in {suggestion.category} • {suggestion.brand}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-6">
            <Link
              to="/"
              className="text-white hover:text-gray-300 transition-colors duration-200 font-medium"
            >
              Home
            </Link>
            <Link
              to="/products"
              className="text-white hover:text-gray-300 transition-colors duration-200 font-medium"
            >
              Products
            </Link>

            {/* Admin Panel Link (if admin) */}
            {isAuthenticated && user?.role === 'admin' && (
              <Link
                to="/admin"
                className="text-yellow-400 hover:text-yellow-300 transition-colors duration-200 font-medium"
              >
                Admin Panel
              </Link>
            )}

            {/* ✅ Currency Changer */}
            <button
              onClick={toggleCurrency}
              className="flex items-center space-x-1 text-white hover:text-gray-300 transition-colors duration-200 bg-white/10 px-3 py-2 rounded-xl"
            >
              <span>{currency === 'USD' ? '$' : '₹'}</span>
              <ChevronDownIcon className="h-4 w-4" />
              <span className="text-sm">{currency}</span>
            </button>

            {/* ✅ FIXED: Comparison */}
            <Link
              to="/comparison"
              className="relative text-white hover:text-gray-300 transition-colors duration-200 p-2"
            >
              <ScaleIcon className="h-6 w-6" />
              {compareCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {compareCount}
                </span>
              )}
            </Link>

            {/* ✅ FIXED: Wishlist */}
            {isAuthenticated && (
              <Link
                to="/wishlist"
                className="relative text-white hover:text-gray-300 transition-colors duration-200 p-2"
              >
                <HeartIcon className="h-6 w-6" />
                {wishlistCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {wishlistCount}
                  </span>
                )}
              </Link>
            )}

            {/* Cart */}
            <Link
              to="/cart"
              className="relative text-white hover:text-gray-300 transition-colors duration-200 p-2"
            >
              <ShoppingCartIcon className="h-6 w-6" />
              {cartItemsCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-green-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {cartItemsCount}
                </span>
              )}
            </Link>

            {/* User Profile/Authentication */}
            {isAuthenticated ? (
              <div className="relative" ref={profileDropdownRef}>
                <button
                  onClick={toggleProfileDropdown}
                  className="flex items-center space-x-2 text-white hover:text-gray-300 transition-colors duration-200 bg-white/10 px-4 py-2 rounded-xl"
                >
                  <UserIcon className="h-5 w-5" />
                  <span className="font-medium">{user?.firstName}</span>
                  <ChevronDownIcon className="h-4 w-4" />
                </button>

                {/* Profile Dropdown */}
                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-black/90 backdrop-blur-sm border border-white/20 rounded-2xl overflow-hidden">
                    <Link
                      to="/profile"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center space-x-2 px-4 py-2 text-white hover:bg-white/10 transition-colors"
                    >
                      <UserIcon className="h-4 w-4" />
                      <span>Profile</span>
                    </Link>
                    <Link
                      to="/orders"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center space-x-2 px-4 py-2 text-white hover:bg-white/10 transition-colors"
                    >
                      <ShoppingCartIcon className="h-4 w-4" />
                      <span>My Orders</span>
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left flex items-center space-x-2 px-4 py-2 text-white hover:bg-white/10 transition-colors"
                    >
                      <ArrowLeftOnRectangleIcon className="h-4 w-4" />
                      <span>Logout</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to="/login"
                  className="text-white hover:text-gray-300 transition-colors duration-200 font-medium"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-xl font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-200"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Cart and Menu */}
          <div className="lg:hidden flex items-center space-x-4">
            {/* Mobile Currency Changer */}
            <button
              onClick={toggleCurrency}
              className="text-white hover:text-gray-300 transition-colors duration-200 text-sm"
            >
              {currency === 'USD' ? '$' : '₹'}
            </button>

            {/* Mobile Cart */}
            <Link to="/cart" className="relative text-white hover:text-gray-300 transition-colors duration-200">
              <ShoppingCartIcon className="h-6 w-6" />
              {cartItemsCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-green-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {cartItemsCount}
                </span>
              )}
            </Link>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-white hover:text-gray-300 transition-colors duration-200"
            >
              {isOpen ? <XMarkIcon className="h-6 w-6" /> : <Bars3Icon className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Search */}
        <div className="lg:hidden pb-4 relative" ref={searchRef}>
          <form onSubmit={handleSearch} className="relative">
            <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products..."
              className="w-full pl-12 pr-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:border-white focus:bg-white/15 transition-all duration-300"
            />
          </form>

          {/* Mobile Search Suggestions */}
          {showSuggestions && searchSuggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-black/90 backdrop-blur-sm border border-white/20 rounded-2xl overflow-hidden z-50">
              {searchSuggestions.map((suggestion) => (
                <button
                  key={suggestion.id}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="w-full px-4 py-3 text-left hover:bg-white/10 transition-colors text-white text-sm border-b border-white/5 last:border-b-0"
                >
                  <div className="font-medium">{suggestion.text}</div>
                  <div className="text-gray-400 text-xs">
                    in {suggestion.category} • {suggestion.brand}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="lg:hidden pb-4 space-y-2">
            <Link
              to="/"
              onClick={() => setIsOpen(false)}
              className="block px-4 py-3 text-white hover:text-gray-300 transition-colors duration-200 hover:bg-white/5 rounded-xl font-medium"
            >
              Home
            </Link>
            <Link
              to="/products"
              onClick={() => setIsOpen(false)}
              className="block px-4 py-3 text-white hover:text-gray-300 transition-colors duration-200 hover:bg-white/5 rounded-xl font-medium"
            >
              Products
            </Link>

            {/* Admin Panel Link for Mobile (if admin) */}
            {isAuthenticated && user?.role === 'admin' && (
              <Link
                to="/admin"
                onClick={() => setIsOpen(false)}
                className="block px-4 py-3 text-yellow-400 hover:text-yellow-300 transition-colors duration-200 hover:bg-white/5 rounded-xl font-medium"
              >
                Admin Panel
              </Link>
            )}

            {/* Mobile Wishlist and Compare */}
            {isAuthenticated && (
              <>
                <Link
                  to="/wishlist"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-between px-4 py-3 text-white hover:text-gray-300 transition-colors duration-200 hover:bg-white/5 rounded-xl"
                >
                  <span>Wishlist</span>
                  {wishlistCount > 0 && (
                    <span className="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {wishlistCount}
                    </span>
                  )}
                </Link>
              </>
            )}

            {compareCount > 0 && (
              <Link
                to="/comparison"
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-between px-4 py-3 text-white hover:text-gray-300 transition-colors duration-200 hover:bg-white/5 rounded-xl"
              >
                <span>Compare</span>
                <span className="bg-blue-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {compareCount}
                </span>
              </Link>
            )}

            {isAuthenticated ? (
              <>
                <Link
                  to="/profile"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center space-x-3 px-4 py-3 text-white hover:text-gray-300 transition-colors duration-200 hover:bg-white/5 rounded-xl"
                >
                  <UserIcon className="h-5 w-5" />
                  <span>Profile</span>
                </Link>
                <Link
                  to="/orders"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center space-x-3 px-4 py-3 text-white hover:text-gray-300 transition-colors duration-200 hover:bg-white/5 rounded-xl"
                >
                  <ShoppingCartIcon className="h-5 w-5" />
                  <span>My Orders</span>
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    setIsOpen(false);
                  }}
                  className="w-full text-left px-4 py-3 hover:text-gray-300 transition-colors duration-200 hover:bg-white/5 rounded-xl text-red-400 flex items-center space-x-3"
                >
                  <ArrowLeftOnRectangleIcon className="h-5 w-5" />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setIsOpen(false)}
                  className="block px-4 py-3 text-white hover:text-gray-300 transition-colors duration-200 hover:bg-white/5 rounded-xl font-medium"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  onClick={() => setIsOpen(false)}
                  className="block px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-200 text-center"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
