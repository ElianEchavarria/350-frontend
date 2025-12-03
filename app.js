// ============================
// CONFIGURATION
// ============================

// Allow runtime override from `config.js` (created per-deploy).
// If not present, fall back to localhost for local dev.
const API_BASE = (typeof window !== 'undefined' && window.__API_BASE__) ? window.__API_BASE__ : 'http://localhost:8000';

// ============================
// STATE MANAGEMENT
// ============================

let appState = {
    user: null,
    cart: [],
    products: [],
    currentPage: 'home'
};

// ============================
// DOM ELEMENTS
// ============================

const elements = {
    // Navigation
    navbar: document.querySelector('.navbar'),
    navbarMenu: document.getElementById('navbarMenu'),
    hamburger: document.getElementById('hamburger'),

    // Auth
    loginBtn: document.getElementById('loginBtn'),
    registerBtn: document.getElementById('registerBtn'),
    logoutBtn: document.getElementById('logoutBtn'),
    userProfile: document.getElementById('userProfile'),
    username: document.getElementById('username'),
    authButtons: document.querySelector('.auth-buttons'),

    // Cart
    cartBtn: document.getElementById('cartBtn'),
    cartCount: document.getElementById('cartCount'),
    cartSidebar: document.getElementById('cartSidebar'),
    cartClose: document.getElementById('cartClose'),
    cartItems: document.getElementById('cartItems'),
    cartSubtotal: document.getElementById('cartSubtotal'),
    checkoutBtn: document.getElementById('checkoutBtn'),
    continueShopping: document.getElementById('continueShopping'),
    continueShopping2: document.getElementById('continueShopping2'),
    overlay: document.getElementById('overlay'),

    // Products
    productsGrid: document.getElementById('productsGrid'),

    // Modals
    loginModal: document.getElementById('loginModal'),
    registerModal: document.getElementById('registerModal'),
    checkoutModal: document.getElementById('checkoutModal'),
    confirmationModal: document.getElementById('confirmationModal'),

    // Forms
    loginForm: document.getElementById('loginForm'),
    registerForm: document.getElementById('registerForm'),
    checkoutForm: document.getElementById('checkoutForm'),

    // Messages
    loginMessage: document.getElementById('loginMessage'),
    registerMessage: document.getElementById('registerMessage'),
    checkoutMessage: document.getElementById('checkoutMessage'),
    confirmationMessage: document.getElementById('confirmationMessage'),

    // Close buttons
    loginClose: document.getElementById('loginClose'),
    registerClose: document.getElementById('registerClose'),
    checkoutClose: document.getElementById('checkoutClose'),
    confirmationClose: document.getElementById('confirmationClose'),

    // Checkout
    orderItems: document.getElementById('orderItems'),
    orderTotal: document.getElementById('orderTotal'),
    customerName: document.getElementById('customerName'),

    // Modal switches
    switchToRegister: document.getElementById('switchToRegister'),
    switchToLogin: document.getElementById('switchToLogin')
};

// ============================
// INITIALIZATION
// ============================

document.addEventListener('DOMContentLoaded', () => {
    console.log('App initializing...');
    attachEventListeners();
    checkAuthStatus();
    loadProducts();
});

// ============================
// EVENT LISTENERS
// ============================

function attachEventListeners() {
    // Authentication
    elements.loginBtn.addEventListener('click', () => openModal('login'));
    elements.registerBtn.addEventListener('click', () => openModal('register'));
    elements.logoutBtn.addEventListener('click', logout);

    // Forms
    elements.loginForm.addEventListener('submit', handleLogin);
    elements.registerForm.addEventListener('submit', handleRegister);
    elements.checkoutForm.addEventListener('submit', handleCheckout);

    // Modal closes
    elements.loginClose.addEventListener('click', () => closeModal('login'));
    elements.registerClose.addEventListener('click', () => closeModal('register'));
    elements.checkoutClose.addEventListener('click', () => closeModal('checkout'));
    elements.confirmationClose.addEventListener('click', () => closeModal('confirmation'));

    // Modal switches
    elements.switchToRegister.addEventListener('click', (e) => {
        e.preventDefault();
        closeModal('login');
        openModal('register');
    });

    elements.switchToLogin.addEventListener('click', (e) => {
        e.preventDefault();
        closeModal('register');
        openModal('login');
    });

    // Cart
    elements.cartBtn.addEventListener('click', toggleCart);
    elements.cartClose.addEventListener('click', closeCart);
    elements.overlay.addEventListener('click', () => {
        closeCart();
        closeAllModals();
    });

    elements.checkoutBtn.addEventListener('click', () => {
        if (!appState.user) {
            showMessage('loginMessage', 'Please login first', 'error');
            openModal('login');
            return;
        }
        prepareCheckout();
        openModal('checkout');
    });

    elements.continueShopping.addEventListener('click', closeCart);
    elements.continueShopping2.addEventListener('click', () => {
        closeModal('confirmation');
    });

    // Hamburger menu
    elements.hamburger.addEventListener('click', toggleMobileMenu);

    // Prevent modal closes from body click
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeAllModals();
            }
        });
    });
}

// ============================
// AUTHENTICATION
// ============================

async function checkAuthStatus() {
    try {
        // Check if user data exists in localStorage
        const userData = localStorage.getItem('user');
        if (userData) {
            appState.user = JSON.parse(userData);
            updateAuthUI();
        }
    } catch (error) {
        console.error('Error checking auth status:', error);
    }
}

async function handleLogin(e) {
    e.preventDefault();
    clearMessage('loginMessage');

    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;

    if (!username || !password) {
        showMessage('loginMessage', 'Please fill all fields', 'error');
        return;
    }

    try {
        const formData = new FormData();
        formData.append('username', username);
        formData.append('password', password);

        const response = await fetch(`${API_BASE}/login.php`, {
            method: 'POST',
            body: formData,
            credentials: 'include'
        });

        const data = await response.json();

        if (!response.ok) {
            showMessage('loginMessage', data.error || 'Login failed', 'error');
            return;
        }

        appState.user = data.user;
        localStorage.setItem('user', JSON.stringify(data.user));
        showMessage('loginMessage', 'Login successful!', 'success');

        setTimeout(() => {
            closeModal('login');
            updateAuthUI();
            elements.loginForm.reset();
        }, 1000);

    } catch (error) {
        console.error('Login error:', error);
        showMessage('loginMessage', 'Network error. Please try again.', 'error');
    }
}

async function handleRegister(e) {
    e.preventDefault();
    clearMessage('registerMessage');

    const username = document.getElementById('registerUsername').value;
    const password = document.getElementById('registerPassword').value;

    if (!username || !password) {
        showMessage('registerMessage', 'Please fill all fields', 'error');
        return;
    }

    if (password.length < 4) {
        showMessage('registerMessage', 'Password must be at least 4 characters', 'error');
        return;
    }

    try {
        const formData = new FormData();
        formData.append('username', username);
        formData.append('password', password);

        const response = await fetch(`${API_BASE}/register.php`, {
            method: 'POST',
            body: formData,
            credentials: 'include'
        });

        const data = await response.json();

        if (!response.ok) {
            showMessage('registerMessage', data.error || 'Registration failed', 'error');
            return;
        }

        appState.user = data.user;
        localStorage.setItem('user', JSON.stringify(data.user));
        showMessage('registerMessage', 'Account created successfully!', 'success');

        setTimeout(() => {
            closeModal('register');
            updateAuthUI();
            elements.registerForm.reset();
        }, 1000);

    } catch (error) {
        console.error('Register error:', error);
        showMessage('registerMessage', 'Network error. Please try again.', 'error');
    }
}

async function logout() {
    try {
        await fetch(`${API_BASE}/logout.php`, {
            method: 'POST',
            credentials: 'include'
        });
    } catch (error) {
        console.error('Logout error:', error);
    }

    appState.user = null;
    appState.cart = [];
    localStorage.removeItem('user');
    updateAuthUI();
    updateCartUI();
    closeCart();

    // Reload products in case stock was updated
    loadProducts();
}

function updateAuthUI() {
    if (appState.user) {
        elements.authButtons.classList.add('hidden');
        elements.logoutBtn.classList.remove('hidden');
        elements.userProfile.classList.remove('hidden');
        elements.username.textContent = appState.user.username;
    } else {
        elements.authButtons.classList.remove('hidden');
        elements.logoutBtn.classList.add('hidden');
        elements.userProfile.classList.add('hidden');
    }
}

// ============================
// PRODUCTS
// ============================

async function loadProducts() {
    try {
        elements.productsGrid.innerHTML = '<div class="loading-skeleton">Loading products...</div>';

        const response = await fetch(`${API_BASE}/api_products.php`);
        const data = await response.json();

        if (data.ok) {
            appState.products = data.products;
            renderProducts();
        } else {
            elements.productsGrid.innerHTML = '<div class="loading-skeleton">Error loading products</div>';
        }
    } catch (error) {
        console.error('Error loading products:', error);
        elements.productsGrid.innerHTML = '<div class="loading-skeleton">Error loading products</div>';
    }
}

function renderProducts() {
    elements.productsGrid.innerHTML = '';

    const localImages = {
        '1': { name: 'Baklava', src: 'assets/images/image-baklava-desktop.jpg' },
        '2': { name: 'Brownie', src: 'assets/images/image-brownie-desktop.jpg' },
        '3': { name: 'Cake', src: 'assets/images/image-cake-desktop.jpg' },
        '4': { name: 'Crème Brûlée', src: 'assets/images/image-creme-brulee-desktop.jpg' },
        '5': { name: 'Macaron', src: 'assets/images/image-macaron-desktop.jpg' },
        '6': { name: 'Meringue', src: 'assets/images/image-meringue-desktop.jpg' },
        '7': { name: 'Panna Cotta', src: 'assets/images/image-panna-cotta-desktop.jpg' },
        '8': { name: 'Tiramisu', src: 'assets/images/image-tiramisu-desktop.jpg' },
        '9': { name: 'Waffle', src: 'assets/images/image-waffle-desktop.jpg' }
    };

    appState.products.forEach(product => {
        if (localImages[product.id]) {
            product.image = localImages[product.id].src;
            product.name = localImages[product.id].name;
        }
        const isOutOfStock = product.stock <= 0;
        const productCard = document.createElement('div');
        productCard.className = 'product-card';

        productCard.innerHTML = `
            <img src="${product.image}" alt="${product.name}" class="product-image" onerror='this.onerror=null; this.src="data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="200"><rect width="100%25" height="100%25" fill="%23f1f5f9"/><text x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" fill="%2364748b" font-family="Arial,Helvetica,sans-serif" font-size="20">Product</text></svg>"'>
            <div class="product-body">
                <div class="product-category">${product.category}</div>
                <h3 class="product-name">${product.name}</h3>
                <p class="product-description">${product.name}</p>
                <div class="product-footer">
                    <div class="product-price">$${(product.price / 100).toFixed(2)}</div>
                    <span class="product-stock ${isOutOfStock ? 'out-of-stock' : 'in-stock'}">
                        ${isOutOfStock ? 'Sold Out' : product.stock + ' in stock'}
                    </span>
                </div>
                ${!isOutOfStock ? `
                    <div class="product-actions">
                        <div class="qty-selector">
                            <button type="button" class="qty-btn qty-minus" data-product-id="${product.id}">−</button>
                            <input type="number" class="qty-input" value="1" min="1" data-product-id="${product.id}">
                            <button type="button" class="qty-btn qty-plus" data-product-id="${product.id}">+</button>
                        </div>
                        <button type="button" class="btn btn-primary add-to-cart-btn" data-product-id="${product.id}">Add to Cart</button>
                    </div>
                ` : ''}
            </div>
        `;

        elements.productsGrid.appendChild(productCard);

        // Add event listeners for quantity controls and add to cart
        if (!isOutOfStock) {
            const minusBtn = productCard.querySelector('.qty-minus');
            const plusBtn = productCard.querySelector('.qty-plus');
            const qtyInput = productCard.querySelector('.qty-input');
            const addBtn = productCard.querySelector('.add-to-cart-btn');

            minusBtn.addEventListener('click', () => {
                const val = parseInt(qtyInput.value) || 1;
                if (val > 1) qtyInput.value = val - 1;
            });

            plusBtn.addEventListener('click', () => {
                const prod = appState.products.find(p => p.id == product.id);
                const val = parseInt(qtyInput.value) || 1;
                if (prod && val < prod.stock) qtyInput.value = val + 1;
            });

            addBtn.addEventListener('click', () => {
                const qty = parseInt(qtyInput.value) || 1;
                // pass the clicked button so feedback can target it
                addToCart(product.id, qty, addBtn);
            });
        }
    });
}

// ============================
// SHOPPING CART
// ============================

async function addToCart(productId, qty = 1, sourceBtn = null) {
    if (!appState.user) {
        showMessage('loginMessage', 'Please login first', 'error');
        openModal('login');
        return;
    }

    try {
        const formData = new FormData();
        formData.append('product_id', productId);
        formData.append('qty', qty);

        const response = await fetch(`${API_BASE}/add_to_cart.php`, {
            method: 'POST',
            body: formData,
            credentials: 'include'
        });

        const data = await response.json();

        if (data.ok) {
            // Optimistic UI feedback on the specific button
            showAddedToCartFeedback(sourceBtn);
            // Fetch updated cart (update UI when server confirms)
            await loadCart();
        }
    } catch (error) {
        console.error('Error adding to cart:', error);
    }
}

async function loadCart() {
    try {
        const response = await fetch(`${API_BASE}/get_cart.php`, {
            credentials: 'include'
        });

        const data = await response.json();

        if (data.ok) {
            appState.cart = data.cart;
            updateCartUI();
        }
    } catch (error) {
        console.error('Error loading cart:', error);
    }
}

function updateCartUI() {
    // Update cart count
    const totalItems = appState.cart.reduce((sum, item) => sum + item.qty, 0);
    elements.cartCount.textContent = totalItems;

    // Update cart items display
    elements.cartItems.innerHTML = '';

    if (appState.cart.length === 0) {
        elements.cartItems.innerHTML = `
            <div class="cart-empty">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
                </svg>
                <p>Your cart is empty</p>
            </div>
        `;
        elements.checkoutBtn.disabled = true;
        elements.cartSubtotal.textContent = '$0.00';
        return;
    }

    elements.checkoutBtn.disabled = false;

    let subtotal = 0;
    const localImages = {
        '1': 'assets/images/image-baklava-desktop.jpg',
        '2': 'assets/images/image-brownie-desktop.jpg',
        '3': 'assets/images/image-cake-desktop.jpg',
        '4': 'assets/images/image-creme-brulee-desktop.jpg',
        '5': 'assets/images/image-macaron-desktop.jpg',
        '6': 'assets/images/image-meringue-desktop.jpg',
        '7': 'assets/images/image-panna-cotta-desktop.jpg',
        '8': 'assets/images/image-tiramisu-desktop.jpg',
        '9': 'assets/images/image-waffle-desktop.jpg'
    };

    appState.cart.forEach(item => {
        if (localImages[item.id]) {
            item.image = localImages[item.id];
        }
        subtotal += (item.price / 100) * item.qty;

        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        cartItem.innerHTML = `
            <img src="${item.image}" alt="${item.name}" class="cart-item-image" onerror='this.onerror=null; this.src="data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80"><rect width="100%25" height="100%25" fill="%23f8fafc"/><text x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" fill="%2394a3b8" font-family="Arial,Helvetica,sans-serif" font-size="12">Product</text></svg>"'>
            <div class="cart-item-details">
                <div class="cart-item-name">${item.name}</div>
                <div class="cart-item-price">$${(item.price / 100).toFixed(2)}</div>
                <div class="cart-item-qty">Quantity: ${item.qty}</div>
            </div>
            <button type="button" class="cart-item-remove" data-product-id="${item.id}">×</button>
        `;

        const removeBtn = cartItem.querySelector('.cart-item-remove');
        removeBtn.addEventListener('click', () => removeFromCart(item.id));

        elements.cartItems.appendChild(cartItem);
    });

    elements.cartSubtotal.textContent = '$' + subtotal.toFixed(2);
}

async function removeFromCart(productId) {
    // Find the product in cart and remove it
    appState.cart = appState.cart.filter(item => item.id != productId);
    updateCartUI();
}

function toggleCart() {
    if (appState.cart.length === 0 && !appState.user) {
        showMessage('loginMessage', 'Please login first', 'error');
        openModal('login');
        return;
    }

    if (elements.cartSidebar.classList.contains('open')) {
        closeCart();
    } else {
        openCart();
    }
}

function openCart() {
    elements.cartSidebar.classList.add('open');
    elements.overlay.classList.add('active');
}

function closeCart() {
    elements.cartSidebar.classList.remove('open');
    elements.overlay.classList.remove('active');
}

function showAddedToCartFeedback() {
    // Visual feedback - you could add a toast notification here
    let btn = null;
    // If a specific button element was passed via arguments, use it
    if (arguments && arguments.length > 0 && arguments[0]) {
        btn = arguments[0];
    }
    // Fallback: pick the last add button
    if (!btn) btn = document.querySelector('.add-to-cart-btn:last-of-type');
    if (!btn) return;

    const originalText = btn.textContent;
    const originalBg = btn.style.backgroundColor || '';
    btn.disabled = true;
    btn.textContent = '✓ Added!';
    btn.style.backgroundColor = 'var(--success-color)';
    btn.style.color = '#fff';

    setTimeout(() => {
        btn.textContent = originalText;
        btn.style.backgroundColor = originalBg;
        btn.style.color = '';
        btn.disabled = false;
    }, 1600);
}

// ============================
// CHECKOUT
// ============================

function prepareCheckout() {
    elements.orderItems.innerHTML = '';

    let total = 0;
    appState.cart.forEach(item => {
        const itemTotal = (item.price / 100) * item.qty;
        total += itemTotal;

        const orderItem = document.createElement('div');
        orderItem.className = 'order-item';
        orderItem.innerHTML = `
            <span class="order-item-name">${item.name} × ${item.qty}</span>
            <span class="order-item-price">$${itemTotal.toFixed(2)}</span>
        `;
        elements.orderItems.appendChild(orderItem);
    });

    elements.orderTotal.textContent = '$' + total.toFixed(2);

    // Pre-fill customer name
    if (appState.user) {
        elements.customerName.value = appState.user.username;
    }
}

async function handleCheckout(e) {
    e.preventDefault();
    clearMessage('checkoutMessage');

    if (!appState.user) {
        showMessage('checkoutMessage', 'Please login first', 'error');
        return;
    }

    const name = elements.customerName.value;

    if (!name) {
        showMessage('checkoutMessage', 'Please enter your name', 'error');
        return;
    }

    if (appState.cart.length === 0) {
        showMessage('checkoutMessage', 'Your cart is empty', 'error');
        return;
    }

    try {
        const formData = new FormData();
        formData.append('name', name);

        const response = await fetch(`${API_BASE}/checkout.php`, {
            method: 'POST',
            body: formData,
            credentials: 'include'
        });

        const data = await response.json();

        if (!response.ok) {
            showMessage('checkoutMessage', data.error || 'Checkout failed', 'error');
            return;
        }

        // Success! Show confirmation
        const total = (data.order_total / 100).toFixed(2);
        elements.confirmationMessage.innerHTML = `
            <strong>${name}</strong> ordered the following items, and the total is <strong>$${total}</strong>
            <br><br>
            An order confirmation has been sent to your email.
        `;

        closeModal('checkout');
        openModal('confirmation');

        // Clear cart and reload
        appState.cart = [];
        updateCartUI();
        loadProducts();

    } catch (error) {
        console.error('Checkout error:', error);
        showMessage('checkoutMessage', 'Network error. Please try again.', 'error');
    }
}

// ============================
// MODALS
// ============================

function openModal(type) {
    closeAllModals();

    switch (type) {
        case 'login':
            elements.loginModal.classList.remove('hidden');
            break;
        case 'register':
            elements.registerModal.classList.remove('hidden');
            break;
        case 'checkout':
            elements.checkoutModal.classList.remove('hidden');
            break;
        case 'confirmation':
            elements.confirmationModal.classList.remove('hidden');
            break;
    }

    elements.overlay.classList.add('active');
}

function closeModal(type) {
    switch (type) {
        case 'login':
            elements.loginModal.classList.add('hidden');
            break;
        case 'register':
            elements.registerModal.classList.add('hidden');
            break;
        case 'checkout':
            elements.checkoutModal.classList.add('hidden');
            break;
        case 'confirmation':
            elements.confirmationModal.classList.add('hidden');
            break;
    }
    // If no other modals are visible and the cart isn't open, remove the overlay
    const openModals = document.querySelectorAll('.modal:not(.hidden)').length;
    const cartOpen = elements.cartSidebar && elements.cartSidebar.classList.contains('open');
    if (openModals === 0 && !cartOpen) {
        elements.overlay.classList.remove('active');
    }
}


function closeAllModals() {
    elements.loginModal.classList.add('hidden');
    elements.registerModal.classList.add('hidden');
    elements.checkoutModal.classList.add('hidden');
    elements.confirmationModal.classList.add('hidden');
    elements.overlay.classList.remove('active');
}

// ============================
// MESSAGES
// ============================

function showMessage(elementId, message, type) {
    const element = document.getElementById(elementId);
    if (!element) return;

    element.textContent = message;
    element.className = 'form-message ' + type;
    element.style.display = 'block';
}

function clearMessage(elementId) {
    const element = document.getElementById(elementId);
    if (!element) return;

    element.textContent = '';
    element.className = 'form-message';
    element.style.display = 'none';
}

// ============================
// MOBILE MENU
// ============================

function toggleMobileMenu() {
    elements.navbarMenu.classList.toggle('active');
}

// Close menu when a link is clicked
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
        elements.navbarMenu.classList.remove('active');
    });
});

// ============================
// AUTH BUTTONS COLLECTION
// ============================

