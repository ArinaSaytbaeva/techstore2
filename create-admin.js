const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

mongoose.connect('mongodb://localhost:27017/techstore');

async function createAdmin() {
    try {
        // Проверяем, есть ли уже админ
        const existingAdmin = await User.findOne({ email: 'admin@techstore.com' });
        
        if (existingAdmin) {
            console.log('❌ Админ уже существует!');
            console.log('   Email: admin@techstore.com');
            console.log('   Попробуйте войти с паролем, который вы установили');
        } else {
            // Хешируем пароль
            const hashedPassword = await bcrypt.hash('admin123', 10);
            
            // Создаем админа
            const admin = new User({
                name: 'Администратор',
                email: 'admin@techstore.com',
                password: hashedPassword,
                isAdmin: true
            });
            
            await admin.save();
            console.log('✅ Администратор создан!');
            console.log('   Email: admin@techstore.com');
            console.log('   Пароль: admin123');
        }
        
        mongoose.disconnect();
    } catch (error) {
        console.error('Ошибка:', error);
        mongoose.disconnect();
    }
}

createAdmin();