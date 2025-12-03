
export let cart = JSON.parse(localStorage.getItem('cart'));


if (!cart) {
    cart = [{
        productId: '1',
        quantity: 2,
    },
    {
        productId: '2',
        quantity: 1,
    }
    ]
};

function saveToStorage() {
    localStorage.setItem('cart', JSON.stringify(cart));
};

export function addToCart(productId) {
    let macthingItem;

    cart.forEach((item) => {
        if (productId === item.productId) {
            macthingItem = item;
        }
    });

    if (macthingItem) {
        macthingItem.quantity++;
    } else {
        cart.push({
            productId: productId,
            quantity: 1
        });
    }



    saveToStorage();
};

export function removeFromCart(productId) {
    const newCart = [];
    cart.forEach((carItem) => {
        if (carItem.productId !== productId) {
            newCart.push(carItem);
        }
    });


    cart = newCart;

    saveToStorage();


};

export function calculateCartTotal() {
    let cartQuantity = 0;

    cart.forEach((cartItem) => {
        cartQuantity += cartItem.quantity;
    });

    return cartQuantity;
};

export function updateQuantity(productId, newQuantity) {
    let matchingItem;

    cart.forEach((cartItem) => {
        if (productId === cartItem.productId) {
            matchingItem = cartItem;
        };
    });

    matchingItem.quantity = newQuantity;

    saveToStorage();
};


