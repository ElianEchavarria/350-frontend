import { cart, removeFromCart, calculateCartTotal, updateQuantity } from "../data/cart.js";
import products, { getProduct } from "../data/products.js";
import formatCurrency from "./utils/money.js";
import { renderPaymentSummary } from "./paymentSummary.js";
import { revertToAddToCart } from "./index.js";

export function renderOrderSummary() {
  let cartSummaryHTML = '';

  cart.forEach((cartItem) => {
    const productId = cartItem.productId;
    const matchingProduct = getProduct(productId);

    cartSummaryHTML += `
      <div class="items-cart item-hidden js-cart-item-container-${matchingProduct.id}">
        <div class="item-information">
          <h4>${matchingProduct.name}</h4>
          <div class="information-wrap">
            <div class="item-quantity">
              <p>${cartItem.quantity}x</p>
            </div>
            <div class="item-price">
              <p>@ $${formatCurrency(matchingProduct.price)} <span>$${((matchingProduct.price / 100) * cartItem.quantity).toFixed(2)}</span> </p>
            </div>
          </div>
        </div>
        <div class="remove-item-btn js-delete-quantity" data-product-id="${matchingProduct.id}">
          <img src="assets/images/icon-remove-item.svg" alt="remove button" class="remove-item-icon">
        </div>
      </div>
    `;
  });

  document.querySelector('.js-cart-items').innerHTML = cartSummaryHTML;

  document.querySelectorAll('.js-delete-quantity').forEach((button) => {
    button.addEventListener('click', () => {
      const productId = button.dataset.productId;
      removeFromCart(productId);

      const container = document.querySelector(`.js-cart-item-container-${productId}`);
      container.remove();
      updateCartQuantity();
      renderPaymentSummary();
      revertToAddToCart(productId);
    });
  });

  function updateCartQuantity() {
    const cartQuantity = calculateCartTotal();
    document.querySelector('.js-quantity').innerHTML = `Your Cart(${cartQuantity})`;
  }

  updateCartQuantity();
  renderPaymentSummary();
}

renderOrderSummary();