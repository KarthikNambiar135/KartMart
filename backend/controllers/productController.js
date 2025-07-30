const Product = require('../models/Product');
const cloudinary = require('../config/cloudinary');

// Get all products
const getProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;

    // Build search query
    let query = { isActive: true };
    
    // Search by keyword
    if (req.query.search) {
      query.$text = { $search: req.query.search };
    }
    
    // Filter by category
    if (req.query.category && req.query.category !== 'all') {
      query.category = req.query.category;
    }
    
    // Filter by subcategory
    if (req.query.subcategory) {
      query.subcategory = req.query.subcategory;
    }
    
    // Filter by brand
    if (req.query.brand) {
      query.brand = req.query.brand;
    }
    
    // Filter by price range
    if (req.query.minPrice || req.query.maxPrice) {
      query.price = {};
      if (req.query.minPrice) query.price.$gte = parseFloat(req.query.minPrice);
      if (req.query.maxPrice) query.price.$lte = parseFloat(req.query.maxPrice);
    }
    
    // Filter by rating
    if (req.query.rating) {
      query.rating = { $gte: parseFloat(req.query.rating) };
    }
    
    // Filter by stock status
    if (req.query.inStock === 'true') {
      query.stock = { $gt: 0 };
    }

    // Sort options
    let sort = {};
    switch (req.query.sort) {
      case 'price_asc':
        sort.price = 1;
        break;
      case 'price_desc':
        sort.price = -1;
        break;
      case 'rating':
        sort.rating = -1;
        break;
      case 'newest':
        sort.createdAt = -1;
        break;
      case 'popular':
        sort.salesCount = -1;
        break;
      default:
        sort.createdAt = -1;
    }

    const products = await Product.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .select('-reviews');

    const total = await Product.countDocuments(query);
    const pages = Math.ceil(total / limit);

    // Get filter options
    const categories = await Product.distinct('category', { isActive: true });
    const brands = await Product.distinct('brand', { isActive: true });
    const priceRange = await Product.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: null, min: { $min: '$price' }, max: { $max: '$price' } } }
    ]);

    res.json({
      success: true,
      data: {
        products,
        pagination: {
          page,
          pages,
          total,
          hasNext: page < pages,
          hasPrev: page > 1
        },
        filters: {
          categories,
          brands,
          priceRange: priceRange[0] || { min: 0, max: 1000 }
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get single product
const getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('reviews.user', 'firstName lastName');
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Get related products
    const relatedProducts = await Product.find({
      category: product.category,
      _id: { $ne: product._id },
      isActive: true
    }).limit(4);

    // ✅ Convert to object to include virtuals
    const productData = product.toObject();
    const relatedProductsData = relatedProducts.map(p => p.toObject());

    res.json({
      success: true,
      data: {
        product: productData,
        relatedProducts: relatedProductsData
      }
    });
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Get featured products
const getFeaturedProducts = async (req, res) => {
  try {
    const products = await Product.find({ 
      isFeatured: true, 
      isActive: true 
    })
    .limit(8)
    .select('-reviews');

    res.json({
      success: true,
      data: { products }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Add product review
const addProductReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Check if user already reviewed
    const existingReview = product.reviews.find(
      review => review.user.toString() === req.user.id.toString()
    );

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this product'
      });
    }

    const review = {
      user: req.user.id,
      rating: Number(rating),
      comment
    };

    product.reviews.push(review);
    product.updateRating();
    await product.save();

    res.status(201).json({
      success: true,
      message: 'Review added successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Search suggestions
const getSearchSuggestions = async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q || q.length < 2) {
      return res.json({
        success: true,
        data: { suggestions: [] }
      });
    }

    const suggestions = await Product.find({
      $text: { $search: q },
      isActive: true
    })
    .select('name category brand')
    .limit(5);

    const formattedSuggestions = suggestions.map(product => ({
      id: product._id,
      text: product.name,
      category: product.category,
      brand: product.brand
    }));

    res.json({
      success: true,
      data: { suggestions: formattedSuggestions }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  getProducts,
  getProduct,
  getFeaturedProducts,
  addProductReview,
  getSearchSuggestions
};
