let cart = [];
let products = [];
let currentUser = null;

// ========== АВТОРИЗАЦИЯ ==========
async function checkAuth() {
    const token = localStorage.getItem('token');
    if (!token) {
        showUnauthorized();
        return false;
    }
    
    try {
        const response = await fetch('/api/auth/me', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.ok) {
            currentUser = await response.json();
            showAuthorized();
            return true;
        } else {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            showUnauthorized();
            return false;
        }
    } catch (error) {
        console.error('Auth error:', error);
        showUnauthorized();
        return false;
    }
}

function showAuthorized() {
    const userName = document.getElementById('userName');
    const loginLink = document.getElementById('loginLink');
    const logoutBtn = document.getElementById('logoutBtn');
    const adminPanel = document.getElementById('adminPanel');
    
    if (userName) userName.textContent = `👤 ${currentUser.name}`;
    if (loginLink) loginLink.style.display = 'none';
    if (logoutBtn) logoutBtn.style.display = 'inline-block';
    if (adminPanel && currentUser.isAdmin) {
        adminPanel.style.display = 'block';
        showJsonDump(); // JSON для админа
    }
}

function showUnauthorized() {
    const userName = document.getElementById('userName');
    const loginLink = document.getElementById('loginLink');
    const logoutBtn = document.getElementById('logoutBtn');
    const adminPanel = document.getElementById('adminPanel');
    
    if (userName) userName.textContent = '👤 Гость';
    if (loginLink) loginLink.style.display = 'inline-block';
    if (logoutBtn) logoutBtn.style.display = 'none';
    if (adminPanel) adminPanel.style.display = 'none';
}

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login.html';
}

// ========== JSON ДЛЯ АДМИНА ==========
function showJsonDump() {
    if (!currentUser?.isAdmin) return;
    
    const jsonOutput = document.getElementById('jsonOutput');
    const jsonData = document.getElementById('jsonData');
    
    if (jsonOutput && jsonData) {
        const dump = {
            products: products,
            totalProducts: products.length,
            categories: [...new Set(products.map(p => p.category))],
            generatedAt: new Date().toISOString()
        };
        jsonData.textContent = JSON.stringify(dump, null, 2);
        jsonOutput.style.display = 'block';
    }
}

// ========== ЗАГРУЗКА ТОВАРОВ ==========
async function loadProducts() {
    try {
        const response = await fetch('/api/products');
        products = await response.json();
        filterProducts();
        console.log(`✅ Загружено ${products.length} товаров`);
    } catch (error) {
        console.error('Ошибка загрузки товаров:', error);
        const container = document.getElementById('products');
        if (container) container.innerHTML = '<p style="color: red;">❌ Ошибка загрузки товаров</p>';
    }
}

// ========== ФИЛЬТРАЦИЯ И ПОИСК ==========
let filteredProducts = [];

function filterProducts() {
    const searchTerm = document.getElementById('searchInput')?.value.toLowerCase() || '';
    const category = document.getElementById('categoryFilter')?.value || 'all';
    const minPrice = parseInt(document.getElementById('minPrice')?.value) || 0;
    const maxPrice = parseInt(document.getElementById('maxPrice')?.value) || Infinity;
    const sortBy = document.getElementById('sortBy')?.value || 'default';
    
    const isEnglishName = (name) => /[a-zA-Z]/.test(name);
    
    filteredProducts = products.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchTerm);
        const matchesCategory = category === 'all' || product.category === category;
        const matchesPrice = product.price >= minPrice && product.price <= maxPrice;
        return matchesSearch && matchesCategory && matchesPrice;
    });
    
    // Сортировка: сначала русские, потом английские
    if (sortBy === 'price_asc') {
        filteredProducts.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price_desc') {
        filteredProducts.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'name_asc') {
        filteredProducts.sort((a, b) => {
            const aIsEng = isEnglishName(a.name);
            const bIsEng = isEnglishName(b.name);
            if (aIsEng && !bIsEng) return 1;
            if (!aIsEng && bIsEng) return -1;
            return a.name.localeCompare(b.name);
        });
    } else {
        // default: русские сначала
        filteredProducts.sort((a, b) => {
            const aIsEng = isEnglishName(a.name);
            const bIsEng = isEnglishName(b.name);
            if (aIsEng && !bIsEng) return 1;
            if (!aIsEng && bIsEng) return -1;
            return 0;
        });
    }
    
    displayProducts(filteredProducts);
}

function displayProducts(productsToShow) {
    const container = document.getElementById('products');
    const countSpan = document.getElementById('products-count');
    
    if (!container) return;
    if (countSpan) countSpan.textContent = `Найдено ${productsToShow.length} товаров`;
    
    if (productsToShow.length === 0) {
        container.innerHTML = '<div class="no-products">😕 Товаров не найдено</div>';
        return;
    }
    
    container.innerHTML = productsToShow.map((product, index) => `
        <div class="product-card" data-id="${product._id}">
            ${index < 2 ? '<div class="product-badge hit">Хит</div>' : ''}
            <img src="${product.image || 'https://via.placeholder.com/200x150?text=No+Image'}" 
                 alt="${product.name}" 
                 onerror="this.src='https://via.placeholder.com/200x150?text=Image+Not+Found'">
            <div class="product-rating">
                <div class="stars">★★★★★</div>
                <div class="reviews-count">${Math.floor(Math.random() * 200) + 10} отзывов</div>
            </div>
            <h3>${product.name}</h3>
            <div class="price-container">
                <span class="current-price">${product.price.toLocaleString()} <small>₽</small></span>
                ${product.price > 50000 ? `<span class="old-price">${Math.floor(product.price * 1.3).toLocaleString()} ₽</span>` : ''}
                ${product.price > 50000 ? `<span class="discount">-${Math.floor((product.price * 1.3 - product.price) / (product.price * 1.3) * 100)}%</span>` : ''}
            </div>
            <div class="installment">от ${Math.floor(product.price / 12).toLocaleString()} ₽/мес</div>
            <button onclick="addToCart('${product._id}')">В корзину</button>
        </div>
    `).join('');
}

function resetFilters() {
    if (document.getElementById('searchInput')) document.getElementById('searchInput').value = '';
    if (document.getElementById('categoryFilter')) document.getElementById('categoryFilter').value = 'all';
    if (document.getElementById('minPrice')) document.getElementById('minPrice').value = '';
    if (document.getElementById('maxPrice')) document.getElementById('maxPrice').value = '';
    if (document.getElementById('sortBy')) document.getElementById('sortBy').value = 'default';
    filterProducts();
}

// ========== ДОБАВЛЕНИЕ ТОВАРА (АДМИН) ==========
async function addProduct() {
    const token = localStorage.getItem('token');
    if (!token) {
        alert('❌ Требуется авторизация!');
        window.location.href = '/login.html';
        return;
    }
    
    const name = document.getElementById('productName').value;
    const price = document.getElementById('productPrice').value;
    const category = document.getElementById('productCategory').value;
    const description = document.getElementById('productDesc').value;
    const imageUrl = document.getElementById('productImage').value;
    
    if (!name || !price) {
        alert('❌ Заполните название и цену!');
        return;
    }
    
    if (isNaN(price) || price <= 0) {
        alert('❌ Введите корректную цену!');
        return;
    }
    
    const newProduct = {
        name: name.trim(),
        price: parseInt(price),
        category: category.trim() || 'Разное',
        description: description.trim() || 'Без описания',
        image: imageUrl || `https://via.placeholder.com/200x150?text=${encodeURIComponent(name.substring(0, 15))}`,
        inStock: true
    };
    
    const addButton = event.target;
    const originalText = addButton.textContent;
    addButton.textContent = '⏳ Добавление...';
    addButton.disabled = true;
    
    try {
        const response = await fetch('/api/products', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(newProduct)
        });
        
        if (response.status === 401) {
            alert('❌ Сессия истекла. Войдите снова.');
            window.location.href = '/login.html';
            return;
        }
        
        if (response.ok) {
            alert(`✅ Товар "${name}" добавлен!`);
            document.getElementById('productName').value = '';
            document.getElementById('productPrice').value = '';
            document.getElementById('productCategory').value = '';
            document.getElementById('productDesc').value = '';
            document.getElementById('productImage').value = '';
            const previewDiv = document.getElementById('imagePreview');
            if (previewDiv) previewDiv.style.display = 'none';
            await loadProducts();
            if (currentUser?.isAdmin) showJsonDump();
        } else {
            const error = await response.json();
            alert('❌ Ошибка: ' + (error.error || error.message));
        }
    } catch (error) {
        console.error('Error:', error);
        alert('❌ Ошибка сервера: ' + error.message);
    } finally {
        addButton.textContent = originalText;
        addButton.disabled = false;
    }
}

// ========== ПРЕДПРОСМОТР КАРТИНКИ ==========
function setupImagePreview() {
    const imageInput = document.getElementById('productImage');
    if (imageInput) {
        imageInput.addEventListener('input', function() {
            const imageUrl = this.value;
            const previewDiv = document.getElementById('imagePreview');
            const previewImg = document.getElementById('previewImg');
            if (!previewDiv || !previewImg) return;
            if (imageUrl && (imageUrl.startsWith('http') || imageUrl.startsWith('https'))) {
                previewImg.src = imageUrl;
                previewDiv.style.display = 'block';
                previewImg.onerror = () => {
                    previewImg.src = 'https://via.placeholder.com/150x150?text=Invalid+URL';
                };
            } else if (imageUrl) {
                previewDiv.style.display = 'block';
                previewImg.src = 'https://via.placeholder.com/150x150?text=Enter+valid+URL';
            } else {
                previewDiv.style.display = 'none';
            }
        });
    }
}

function addToCart(productId) {
    const product = products.find(p => p._id === productId);
    if (!product) return;
    
    const existingItem = cart.find(item => item.productId === productId);
    
    if (existingItem) {
        existingItem.quantity++;
    } else {
        cart.push({
            productId: product._id,
            name: product.name,
            price: product.price,
            quantity: 1,
            image: product.image
        });
    }
    
    updateCartDisplay();  // обновляет счетчик и содержимое корзины
    // (никаких уведомлений и автоматического открытия)
}
function showAddToCartNotification(productName) {
    const notification = document.createElement('div');
    notification.className = 'cart-notification';
    notification.innerHTML = `
        <div class="notification-content">
            <div class="notification-icon">✅</div>
            <div class="notification-text">
                <strong>${productName}</strong> добавлен в корзину
            </div>
            <div class="notification-buttons">
                <button class="notification-btn continue" onclick="closeNotification()">Продолжить</button>
                <button class="notification-btn checkout" onclick="goToCheckout()">Оформить</button>
            </div>
        </div>
    `;
    document.body.appendChild(notification);
    setTimeout(() => notification.classList.add('show'), 10);
    setTimeout(() => closeNotification(), 5000);
}

function closeNotification() {
    const notification = document.querySelector('.cart-notification');
    if (notification) {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }
}

function goToCheckout() {
    closeNotification();
    toggleCart(); // открываем корзину, чтобы оформить
}

function updateCartDisplay() {
    const cartItems = document.getElementById('cart-items');
    const cartTotal = document.getElementById('cart-total');
    const totalSpan = document.getElementById('total');
    const cartCountSpan = document.getElementById('cartCount');
    
    // Счётчик на иконке
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    if (cartCountSpan) cartCountSpan.textContent = totalItems;
    
    if (!cartItems) return;
    
    if (cart.length === 0) {
        cartItems.innerHTML = '<div class="empty-cart">🛒 Корзина пуста</div>';
        if (cartTotal) cartTotal.style.display = 'none';
        return;
    }
    
    cartItems.innerHTML = cart.map((item, index) => `
        <div class="cart-item">
            <div class="cart-item-info">
                <div class="cart-item-title">${item.name}</div>
                <div class="cart-item-price">${item.price.toLocaleString()} ₽</div>
                <div class="cart-item-quantity">
                    <button class="quantity-btn" onclick="updateQuantity(${index}, ${item.quantity - 1})">-</button>
                    <span>${item.quantity}</span>
                    <button class="quantity-btn" onclick="updateQuantity(${index}, ${item.quantity + 1})">+</button>
                    <span class="remove-item" onclick="removeFromCart(${index})">Удалить</span>
                </div>
            </div>
        </div>
    `).join('');
    
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    if (totalSpan) totalSpan.textContent = total.toLocaleString() + ' ₽';
    if (cartTotal) cartTotal.style.display = 'block';
}

function updateQuantity(index, newQuantity) {
    if (newQuantity <= 0) {
        removeFromCart(index);
    } else {
        cart[index].quantity = newQuantity;
        updateCartDisplay();
    }
}

function removeFromCart(index) {
    cart.splice(index, 1);
    updateCartDisplay();
}

async function checkout() {
    const token = localStorage.getItem('token');
    if (!token) {
        alert('❌ Для оформления заказа нужно войти!');
        window.location.href = '/login.html';
        return;
    }
    
    if (cart.length === 0) {
        alert('Корзина пуста!');
        return;
    }
    
    const orderData = {
        products: cart.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price
        })),
        total: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    };
    
    try {
        const response = await fetch('/api/orders', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(orderData)
        });
        
        if (response.status === 401) {
            alert('❌ Сессия истекла. Войдите снова.');
            window.location.href = '/login.html';
            return;
        }
        
        if (response.ok) {
            alert('✅ Заказ оформлен! Спасибо!');
            cart = [];
            updateCartDisplay();
            closeCart();
        } else {
            alert('❌ Ошибка при оформлении заказа');
        }
    } catch (error) {
        console.error('Ошибка:', error);
        alert('❌ Ошибка сервера');
    }
}

// ========== УПРАВЛЕНИЕ КОРЗИНОЙ (БОКОВАЯ ПАНЕЛЬ) ==========
function toggleCart() {
    const sidebar = document.getElementById('cartSidebar');
    if (sidebar) {
        sidebar.classList.toggle('open');
    }
}

function closeCart() {
    const sidebar = document.getElementById('cartSidebar');
    if (sidebar) {
        sidebar.classList.remove('open');
    }
}

function openCartWithAnimation() {
    const sidebar = document.getElementById('cartSidebar');
    if (sidebar) {
        sidebar.classList.add('open');
        const cartIcon = document.querySelector('.cart-icon-wrapper');
        if (cartIcon) {
            cartIcon.style.animation = 'pulse 0.5s ease';
            setTimeout(() => {
                cartIcon.style.animation = '';
            }, 500);
        }
    }
}

// ========== ИНИЦИАЛИЗАЦИЯ ==========
document.addEventListener('DOMContentLoaded', async () => {
    await checkAuth();
    await loadProducts();
    setupImagePreview();
});