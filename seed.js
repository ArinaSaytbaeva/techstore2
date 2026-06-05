const mongoose = require('mongoose');
const Product = require('./models/Product');

mongoose.connect('mongodb://localhost:27017/techstore')
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log('Connection error:', err));

const products = [
    { 
        name: "iPhone 15 Pro", 
        price: 99900, 
        category: "Смартфоны", 
        description: "Новый флагман Apple с Titanium корпусом",
        image: "https://images.pexels.com/photos/699122/pexels-photo-699122.jpeg?w=600&h=400&fit=crop",
        inStock: true 
    },
        { 
        name: "Samsung Galaxy S24 Ultra", 
        price: 129900, 
        category: "Смартфоны", 
        description: "Топовый Samsung с S Pen и 200MP камерой",
        image: "https://images.samsung.com/is/image/samsung/p6pim/ru/sm-a245fdruser/gallery/ru-galaxy-a24-sm-a245-sm-a245fdruser-536260310",
        inStock: true 
    },
    { 
        name: "Samsung Galaxy A24", 
        price: 22990, 
        category: "Смартфоны", 
        description: "Отличный смартфон с 50MP камерой и AMOLED экраном, 5000mAh",
        image: "https://hi-stores.ru/upload/iblock/d10/j5fmncmofdlp0h9naoh8ip43o3yz9d4a.jpg",
        inStock: true 
    },
    { 
        name: "MacBook Pro M3", 
        price: 149900, 
        category: "Ноутбуки", 
        description: "Мощный ноутбук Apple",
        image: "https://images.pexels.com/photos/18105/pexels-photo.jpg?w=600&h=400&fit=crop",
        inStock: true 
    },
    { 
        name: "Sony WH-1000XM5", 
        price: 34900, 
        category: "Наушники", 
        description: "Лучшие наушники с шумоподавлением",
        image: "https://images.pexels.com/photos/3394659/pexels-photo-3394659.jpeg?w=600&h=400&fit=crop",
        inStock: true 
    },
    { 
        name: "Apple Watch Series 9", 
        price: 39900, 
        category: "Аксессуары", 
        description: "Умные часы",
        image: "https://images.pexels.com/photos/437037/pexels-photo-437037.jpeg?w=600&h=400&fit=crop",
        inStock: true 
    }
];

async function seedDatabase() {
    try {
        await Product.deleteMany({});
        console.log('✅ Старые товары удалены');
        
        const inserted = await Product.insertMany(products);
        console.log(`✅ Добавлено ${inserted.length} товаров с качественными картинками!\n`);
        
        inserted.forEach(p => {
            console.log(`   📱 ${p.name}`);
            console.log(`      Картинка: ${p.image}\n`);
        });
        
    } catch (err) {
        console.error('❌ Ошибка:', err);
    } finally {
        mongoose.disconnect();
        console.log('💾 Отключено от базы данных');
    }
}

seedDatabase();