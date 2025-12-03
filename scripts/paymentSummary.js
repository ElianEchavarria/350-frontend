
import { cart } from '../data/cart.js'
import { getProduct } from '../data/products.js'
import formatCurrency from './utils/money.js'




export function renderPaymentSummary() {
    let productPriceCents = 0;

    cart.forEach((cartItem) => {
        const product = getProduct(cartItem.productId);
        productPriceCents += product.price * cartItem.quantity;
    });



    const totalCents = productPriceCents;




    document.querySelector('.js-price-show').textContent = `$${formatCurrency(totalCents)}`;





};