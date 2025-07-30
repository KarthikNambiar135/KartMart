const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProduct,
  getFeaturedProducts,
  addProductReview,
  getSearchSuggestions
} = require('../controllers/productController');
const { protect } = require('../middleware/auth');

router.get('/', getProducts);
router.get('/featured', getFeaturedProducts);
router.get('/search-suggestions', getSearchSuggestions);
router.get('/:id', getProduct);
router.post('/:id/reviews', protect, addProductReview);

module.exports = router;
