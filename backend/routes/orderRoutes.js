const express = require('express');
const router = express.Router();
const {
  createOrder,
  getMyOrders,
  getOrder,
  processPayment
} = require('../controllers/orderController');
const { protect } = require('../middleware/auth');
const Order = require('../models/Order'); // ✅ Added missing import

router.use(protect); // All order routes require authentication

router.post('/', createOrder);
router.get('/my-orders', getMyOrders);
router.get('/:id', getOrder);
router.post('/payment', processPayment);

// For clearing order history
router.delete('/clear-history', async (req, res) => {
  try {
    const result = await Order.deleteMany({ user: req.user.id });
    
    res.json({
      success: true,
      message: `${result.deletedCount} orders cleared from history`,
      data: { deletedCount: result.deletedCount }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
