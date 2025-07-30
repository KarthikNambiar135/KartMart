const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const User = require('../models/User');
const Product = require('../models/Product');

// Add to wishlist
router.post('/wishlist/add', protect, async (req, res) => {
  try {
    const { productId } = req.body;
    
    const user = await User.findById(req.user.id);
    
    // Check if product already in wishlist
    if (user.wishlist.includes(productId)) {
      return res.status(400).json({
        success: false,
        message: 'Product already in wishlist'
      });
    }
    
    user.wishlist.push(productId);
    await user.save();
    
    res.json({
      success: true,
      message: 'Product added to wishlist',
      data: { wishlist: user.wishlist }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Remove from wishlist
router.delete('/wishlist/remove/:productId', protect, async (req, res) => {
  try {
    const { productId } = req.params;
    
    const user = await User.findById(req.user.id);
    user.wishlist = user.wishlist.filter(id => id.toString() !== productId);
    await user.save();
    
    res.json({
      success: true,
      message: 'Product removed from wishlist',
      data: { wishlist: user.wishlist }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get wishlist
router.get('/wishlist', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate({
      path: 'wishlist',
      select: 'name price images stock isActive brand category'
    });
    
    // Filter out inactive products
    const activeWishlist = user.wishlist.filter(product => product.isActive);
    
    res.json({
      success: true,
      data: { wishlist: activeWishlist }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get comparison products
router.post('/compare', async (req, res) => {
  try {
    const { productIds } = req.body;
    
    if (!productIds || productIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Product IDs are required'
      });
    }
    
    if (productIds.length > 4) {
      return res.status(400).json({
        success: false,
        message: 'Cannot compare more than 4 products'
      });
    }
    
    const products = await Product.find({
      _id: { $in: productIds },
      isActive: true
    }).select('name price images specifications features brand category rating numReviews stock');
    
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
});

module.exports = router;
