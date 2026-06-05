const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const { authenticateToken } = require('../middleware/auth');
const fs = require('fs');

// Логирование действий
function logAction(userId, action, details) {
    const logEntry = {
        timestamp: new Date().toISOString(),
        userId: userId || 'guest',
        action: action,
        details: details
    };
    fs.appendFileSync('./logs/auth.log', JSON.stringify(logEntry) + '\n');
}

// Создать заказ (ТОЛЬКО ЗДЕСЬ ТРЕБУЕТСЯ ЛОГИН)
router.post('/', authenticateToken, async (req, res) => {
    try {
        const order = new Order({
            ...req.body,
            userId: req.user.userId
        });
        await order.save();
        
        // Логируем успешный заказ
        logAction(req.user.userId, 'order_created', { total: req.body.total });
        
        res.status(201).json(order);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Получить заказы (требуется логин)
router.get('/my', authenticateToken, async (req, res) => {
    const orders = await Order.find({ userId: req.user.userId })
        .populate('products.productId')
        .sort({ createdAt: -1 });
    res.json(orders);
});

module.exports = router;