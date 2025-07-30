import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { userAPI } from '../services/api';
import toast from 'react-hot-toast';

const ComparisonContext = createContext();

export const useComparison = () => {
  const context = useContext(ComparisonContext);
  if (!context) {
    throw new Error('useComparison must be used within a ComparisonProvider');
  }
  return context;
};

export const ComparisonProvider = ({ children }) => {
  const [compareList, setCompareList] = useState(() => {
    const saved = localStorage.getItem('compareList');
    return saved ? JSON.parse(saved) : [];
  });
  const [compareProducts, setCompareProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  // Save to localStorage whenever compareList changes
  useEffect(() => {
    localStorage.setItem('compareList', JSON.stringify(compareList));
  }, [compareList]);

  const addToCompare = useCallback((product) => {
    if (compareList.includes(product._id)) {
      toast.info('Product already in comparison');
      return;
    }

    if (compareList.length >= 4) {
      toast.error('You can compare maximum 4 products');
      return;
    }

    setCompareList(prev => [...prev, product._id]);
    toast.success('Added to comparison');
  }, [compareList]);

  const removeFromCompare = useCallback((productId) => {
    setCompareList(prev => prev.filter(id => id !== productId));
    setCompareProducts(prev => prev.filter(product => product._id !== productId));
    toast.success('Removed from comparison');
  }, []);

  const loadComparisonProducts = useCallback(async () => {
    if (compareList.length === 0) {
      setCompareProducts([]);
      return;
    }

    try {
      setLoading(true);
      const response = await userAPI.compareProducts(compareList);
      if (response.data.success) {
        setCompareProducts(response.data.data.products || []);
      }
    } catch (error) {
      console.error('Comparison error:', error);
      if (error.response?.status !== 404) {
        toast.error('Failed to load comparison products');
      }
      setCompareProducts([]);
    } finally {
      setLoading(false);
    }
  }, [compareList]);

  const clearComparison = useCallback(() => {
    setCompareList([]);
    setCompareProducts([]);
    localStorage.removeItem('compareList');
    toast.success('Comparison cleared');
  }, []);

  const isInCompare = useCallback((productId) => {
    return compareList.includes(productId);
  }, [compareList]);

  const getCompareCount = useCallback(() => {
    return compareList.length;
  }, [compareList.length]);

  const value = {
    compareList,
    compareProducts,
    loading,
    addToCompare,
    removeFromCompare,
    loadComparisonProducts,
    clearComparison,
    isInCompare,
    getCompareCount
  };

  return (
    <ComparisonContext.Provider value={value}>
      {children}
    </ComparisonContext.Provider>
  );
};
