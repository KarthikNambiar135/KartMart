import React, { createContext, useContext, useState, useEffect } from 'react';

const CurrencyContext = createContext();

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};

// Exchange rates (in real app, fetch from API)
const EXCHANGE_RATES = {
  USD_TO_INR: 83.25,
  INR_TO_USD: 0.012
};

export const CurrencyProvider = ({ children }) => {
  const [currency, setCurrency] = useState('USD');
  const [exchangeRate, setExchangeRate] = useState(1);

  useEffect(() => {
    // Load saved currency preference
    const savedCurrency = localStorage.getItem('preferredCurrency') || 'USD';
    setCurrency(savedCurrency);
    updateExchangeRate(savedCurrency);
  }, []);

  const updateExchangeRate = (newCurrency) => {
    if (newCurrency === 'USD') {
      setExchangeRate(1);
    } else if (newCurrency === 'INR') {
      setExchangeRate(EXCHANGE_RATES.USD_TO_INR);
    }
  };

  const toggleCurrency = () => {
    const newCurrency = currency === 'USD' ? 'INR' : 'USD';
    setCurrency(newCurrency);
    updateExchangeRate(newCurrency);
    localStorage.setItem('preferredCurrency', newCurrency);
  };

  const formatPrice = (price) => {
    const convertedPrice = price * exchangeRate;
    if (currency === 'USD') {
      return `$${convertedPrice.toFixed(2)}`;
    } else {
      return `₹${convertedPrice.toFixed(0)}`;
    }
  };

  const getSymbol = () => {
    return currency === 'USD' ? '$' : '₹';
  };

  const value = {
    currency,
    exchangeRate,
    toggleCurrency,
    formatPrice,
    getSymbol
  };

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
};
