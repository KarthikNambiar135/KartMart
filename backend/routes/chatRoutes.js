const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');

// In-memory chat storage (in production, use database)
let chatMessages = [];
let chatId = 1;

// Get chat messages
router.get('/messages', protect, async (req, res) => {
  try {
    const userMessages = chatMessages.filter(msg => 
      msg.userId === req.user.id || msg.type === 'admin'
    );
    
    res.json({
      success: true,
      data: { messages: userMessages }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Send message
router.post('/messages', protect, async (req, res) => {
  try {
    const { message } = req.body;
    
    const newMessage = {
      id: chatId++,
      userId: req.user.id,
      userName: `${req.user.firstName} ${req.user.lastName}`,
      message,
      type: 'user',
      timestamp: new Date(),
      read: false
    };
    
    chatMessages.push(newMessage);
    
    // Auto-reply for demo purposes
    setTimeout(() => {
      const autoReply = {
        id: chatId++,
        userId: req.user.id,
        userName: 'Support Team',
        message: 'Thank you for your message! Our team will get back to you shortly.',
        type: 'admin',
        timestamp: new Date(),
        read: false
      };
      chatMessages.push(autoReply);
    }, 2000);
    
    res.json({
      success: true,
      data: { message: newMessage }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
