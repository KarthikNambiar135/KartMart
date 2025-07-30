const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('../models/Product');
const User = require('../models/User');
const Category = require('../models/Category');

dotenv.config();

const products = [
  {
    name: "Premium Wireless Headphones",
    description: "High-quality wireless headphones with active noise cancellation, premium comfort, and up to 30 hours of battery life.",
    price: 299.99,
    category: "electronics",
    subcategory: "headphones",
    brand: "AudioTech",
    sku: "AT-WH-001",
    slug: "premium-wireless-headphones-at-wh-001", // Add explicit slug
    images: [{
      public_id: "sample_headphones",
      url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600",
      alt: "Premium Wireless Headphones"
    }],
    specifications: new Map([
      ["Driver Size", "40mm"],
      ["Frequency Response", "20Hz - 20kHz"],
      ["Battery Life", "30 hours"],
      ["Connectivity", "Bluetooth 5.0"],
      ["Weight", "250g"]
    ]),
    features: [
      "Active Noise Cancellation",
      "30-hour battery life",
      "Premium comfort design",
      "High-resolution audio",
      "Fast charging capability"
    ],
    stock: 50,
    rating: 4.8,
    numReviews: 24,
    isActive: true,
    isFeatured: true
  },
  {
    name: "Smart Watch Pro",
    description: "Advanced smartwatch with health monitoring features, GPS tracking, and seamless smartphone integration.",
    price: 399.99,
    category: "electronics",
    subcategory: "wearables",
    brand: "TechWear",
    sku: "TW-SW-002",
    slug: "smart-watch-pro-tw-sw-002", // Add explicit slug
    images: [{
      public_id: "sample_smartwatch",
      url: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600",
      alt: "Smart Watch Pro"
    }],
    specifications: new Map([
      ["Display", "1.4-inch AMOLED"],
      ["Battery Life", "7 days"],
      ["Water Resistance", "50 meters"],
      ["Storage", "32GB"],
      ["Connectivity", "WiFi, Bluetooth, GPS"]
    ]),
    features: [
      "Heart rate monitoring",
      "GPS tracking",
      "Sleep analysis",
      "Water resistant",
      "Multiple sport modes"
    ],
    stock: 30,
    rating: 4.6,
    numReviews: 18,
    isActive: true,
    isFeatured: true
  },
  {
    name: "Minimalist Backpack",
    description: "Sleek and functional backpack perfect for everyday use, work, or travel. Made with durable materials.",
    price: 89.99,
    category: "accessories",
    subcategory: "bags",
    brand: "UrbanCarry",
    sku: "UC-BP-003",
    slug: "minimalist-backpack-uc-bp-003", // Add explicit slug
    images: [{
      public_id: "sample_backpack",
      url: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600",
      alt: "Minimalist Backpack"
    }],
    specifications: new Map([
      ["Material", "Water-resistant nylon"],
      ["Capacity", "20 liters"],
      ["Dimensions", "45 x 30 x 15 cm"],
      ["Weight", "800g"],
      ["Warranty", "2 years"]
    ]),
    features: [
      "Water-resistant material",
      "Multiple compartments",
      "Padded laptop sleeve",
      "Ergonomic design",
      "Lifetime warranty"
    ],
    stock: 75,
    rating: 4.4,
    numReviews: 32,
    isActive: true,
    isFeatured: true
  },
  {
    name: "Bluetooth Speaker",
    description: "Portable wireless speaker with premium sound quality, deep bass, and long-lasting battery.",
    price: 149.99,
    category: "electronics",
    subcategory: "speakers",
    brand: "SoundWave",
    sku: "SW-BS-004",
    slug: "bluetooth-speaker-sw-bs-004", // Add explicit slug
    images: [{
      public_id: "sample_speaker",
      url: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600",
      alt: "Bluetooth Speaker"
    }],
    specifications: new Map([
      ["Power Output", "20W"],
      ["Battery Life", "12 hours"],
      ["Connectivity", "Bluetooth 5.0"],
      ["Range", "30 meters"],
      ["Water Rating", "IPX7"]
    ]),
    features: [
      "360-degree sound",
      "Water resistant",
      "Long battery life",
      "Voice assistant compatible",
      "Portable design"
    ],
    stock: 40,
    rating: 4.7,
    numReviews: 28,
    isActive: true,
    isFeatured: true
  }
];

const categories = [
  {
    name: "Electronics",
    description: "Latest electronic gadgets and devices",
    slug: "electronics", // Add explicit slug
    isActive: true,
    sortOrder: 1
  },
  {
    name: "Accessories",
    description: "Fashion and lifestyle accessories",
    slug: "accessories", // Add explicit slug
    isActive: true,
    sortOrder: 2
  },
  {
    name: "Clothing",
    description: "Fashion apparel for all occasions",
    slug: "clothing", // Add explicit slug
    isActive: true,
    sortOrder: 3
  },
  {
    name: "Home",
    description: "Home and kitchen essentials",
    slug: "home", // Add explicit slug
    isActive: true,
    sortOrder: 4
  }
];

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data and drop indexes
    await Product.collection.drop().catch(() => console.log('Products collection does not exist'));
    await Category.collection.drop().catch(() => console.log('Categories collection does not exist'));
    console.log('Cleared existing data and indexes');

    // Insert categories
    await Category.insertMany(categories);
    console.log('Categories seeded');

    // Insert products
    await Product.insertMany(products);
    console.log('Products seeded');

    console.log('Database seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedData();
