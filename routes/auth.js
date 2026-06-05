const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../middleware/auth');

// Регистрация
router.post('/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        
        // Проверяем, существует ли пользователь
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: 'Пользователь с таким email уже существует' });
        }
        
        // Хешируем пароль
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Создаем пользователя
        const user = new User({
            name,
            email,
            password: hashedPassword,
            isAdmin: email === 'admin@techstore.com' // Первый пользователь - админ
        });
        
        await user.save();
        
        // Создаем токен
        const token = jwt.sign(
            { userId: user._id, email: user.email, isAdmin: user.isAdmin },
            JWT_SECRET,
            { expiresIn: '7d' }
        );
        
        res.status(201).json({
            message: 'Регистрация успешна',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                isAdmin: user.isAdmin
            }
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Логин
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // Ищем пользователя
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ error: 'Неверный email или пароль' });
        }
        
        // Проверяем пароль
        const valid = await bcrypt.compare(password, user.password);
        if (!valid) {
            return res.status(400).json({ error: 'Неверный email или пароль' });
        }
        
        // Создаем токен
        const token = jwt.sign(
            { userId: user._id, email: user.email, isAdmin: user.isAdmin },
            JWT_SECRET,
            { expiresIn: '7d' }
        );
        
        res.json({
            message: 'Вход выполнен успешно',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                isAdmin: user.isAdmin
            }
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Получить текущего пользователя (по токену)
router.get('/me', async (req, res) => {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ error: 'Нет токена' });
    }
    
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await User.findById(decoded.userId).select('-password');
        res.json(user);
    } catch (error) {
        res.status(401).json({ error: 'Недействительный токен' });
    }
});

module.exports = router;