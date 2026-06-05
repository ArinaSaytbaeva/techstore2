const jwt = require('jsonwebtoken');

// Секретный ключ (в реальном проекте хранить в .env)
const JWT_SECRET = 'your_secret_key_here_change_me';

// Middleware для проверки токена
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ error: 'Доступ запрещен. Требуется авторизация' });
    }
    
    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Недействительный токен' });
        }
        req.user = user;
        next();
    });
}

// Middleware для проверки администратора
function authenticateAdmin(req, res, next) {
    authenticateToken(req, res, () => {
        if (!req.user.isAdmin) {
            return res.status(403).json({ error: 'Доступ запрещен. Требуются права администратора' });
        }
        next();
    });
}

module.exports = { authenticateToken, authenticateAdmin, JWT_SECRET };