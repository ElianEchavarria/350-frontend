import { cart, addToCart, calculateCartTotal, updateQuantity, removeFromCart } from "../data/cart.js";
import products from "../data/products.js";
import formatCurrency from "./utils/money.js";
import { renderOrderSummary } from "./cartSummary.js";
import { renderPaymentSummary } from "./paymentSummary.js";


let productsHTML = '';

products.forEach((product) => {
  productsHTML += `
    <article class="product-container">
      <div class="image-container">
        <img class="product-img" src="${product.image.desktop}" alt="${product.name}" />
        <div class="button-container js-button-container" data-product-id="${product.id}">
          <button class="js-add-to-cart" data-product-id="${product.id}">
            <img src="assets/images/icon-add-to-cart.svg" alt="Add to cart Icon" class="add-to-cart-icon" id="cartIcon">
            <span class="btn-text">Add to Cart</span>
          </button>
        </div>
      </div>
      <p>${product.category}</p>
      <h2>${product.name}</h2>
      <p class="price-tag">$${formatCurrency(product.price)}</p>
    </article>
  `;
});

document.querySelector('.js-products-grid').innerHTML = productsHTML;

function updateCartQuantity() {
  const cartQuantity = calculateCartTotal();
  document.querySelector('.js-quantity').innerHTML = `Your Cart(${cartQuantity})`;
}

function renderButtonState(productId, buttonContainer) {
  const cartItem = cart.find(item => item.productId === productId);
  const quantity = cartItem ? cartItem.quantity : 0;
  const totalCartQuantity = calculateCartTotal();

  if (quantity === 0) {
    buttonContainer.innerHTML = `
      <button class="js-add-to-cart" data-product-id="${productId}">
        <img src="assets/images/icon-add-to-cart.svg" alt="Add to cart Icon" class="add-to-cart-icon">
        <span class="btn-text">Add to Cart</span>
      </button>
    `;
    const productImg = buttonContainer.closest('.product-container').querySelector('.product-img');
    if (productImg) {
      productImg.classList.remove('border-img-active');
    }
  } else {
    buttonContainer.innerHTML = `
      <button class="js-quantity-control active" data-product-id="${productId}">
        <div class="round-decrement">
          <img src="assets/images/icon-decrement-quantity.svg" alt="decrement quantity" class="decrement-quantity-icon js-decrement" data-product-id="${productId}">
        </div>
        <span class="btn-text">${quantity}</span>
        <img src="assets/images/icon-increment-quantity.svg" alt="increment quantity" class="increment-quantity-icon js-increment" data-product-id="${productId}">
      </button>
    `;
    const productImg = buttonContainer.closest('.product-container').querySelector('.product-img');
    if (productImg) {
      productImg.classList.add('border-img-active');
    }
  }

  const emptyElement = document.querySelector('.empty-cart-items');
  const cartQuantityElement = document.querySelector('.js-cart-quantity');
  const priceContainer = document.querySelector('.price-container');
  const carbonNeutralContainer = document.querySelector('.carbon-neutral-container');
  const confirmButtonElement = document.querySelector('.button-container-cart');

  if (totalCartQuantity === 0) {
    cartQuantityElement.classList.add('hide');
    priceContainer.classList.add('hide');
    carbonNeutralContainer.classList.add('hide');
    confirmButtonElement.classList.add('hide');
    emptyElement.classList.remove('empty-hidden');
  } else {
    cartQuantityElement.classList.remove('hide');
    priceContainer.classList.remove('hide');
    carbonNeutralContainer.classList.remove('hide');
    confirmButtonElement.classList.remove('hide');
    emptyElement.classList.add('empty-hidden');
  }

  const addButton = buttonContainer.querySelector('.js-add-to-cart');
  if (addButton) {
    addButton.addEventListener('click', () => handleAddToCart(productId, buttonContainer));
  }

  const incrementButton = buttonContainer.querySelector('.js-increment');
  const decrementButton = buttonContainer.querySelector('.js-decrement');
  if (incrementButton && decrementButton) {
    incrementButton.addEventListener('click', () => {
      addToCart(productId);
      renderButtonState(productId, buttonContainer);
      updateCartQuantity();
      renderOrderSummary();
      renderPaymentSummary();
    });
    decrementButton.addEventListener('click', () => {
      const cartItem = cart.find(item => item.productId === productId);
      if (cartItem) {
        if (cartItem.quantity > 1) {
          updateQuantity(productId, cartItem.quantity - 1);
        } else {
          removeFromCart(productId);
        }
        renderButtonState(productId, buttonContainer);
        updateCartQuantity();
        renderOrderSummary();
        renderPaymentSummary();
      }
    });
  }
}

function handleAddToCart(productId, buttonContainer) {
  addToCart(productId);
  renderButtonState(productId, buttonContainer);
  updateCartQuantity();
  renderOrderSummary();
  renderPaymentSummary();
}

// New Modal Logic
function showConfirmationModal() {
  const modalOverlay = document.querySelector('.js-modal-overlay');
  const modalItemsList = document.querySelector('.js-modal-items-list');
  const modalOrderTotal = document.querySelector('.js-modal-order-total');

  let cartHTML = '';
  let total = 0;
  cart.forEach((cartItem) => {
    const product = products.find(p => p.id === cartItem.productId);
    const itemTotal = (product.price / 100) * cartItem.quantity;
    total += itemTotal;
    cartHTML += `
      <div class="modal-item">
        <div>
          <img src="${product.image.thumbnail}" alt="${product.name}" class="modal-item-thumbnail">
        </div>
        <div class="modal-item-details">
          <h4>${product.name}</h4>
          <div class="modal-item-info">
            <div class="modal-item-qty">
              <p>${cartItem.quantity}x</p>
            </div>
            <div class="modal-item-unit-price">
              <p>@ $${formatCurrency(product.price)}</p>
            </div>
          </div>
        </div>
        <div class="modal-item-total">
          <p>$${itemTotal.toFixed(2)}</p>
        </div>
      </div>
    `;
  });
  modalItemsList.innerHTML = cartHTML;
  modalOrderTotal.textContent = `$${total.toFixed(2)}`;
  modalOverlay.classList.remove('modal-hidden');
}

// Initial setup for all buttons
document.querySelectorAll('.js-button-container').forEach((buttonContainer) => {
  const productId = buttonContainer.dataset.productId;
  renderButtonState(productId, buttonContainer);
});

// Modal Event Listeners
const confirmButton = document.querySelector('.checkout-btn');
const startNewOrderButton = document.querySelector('.js-modal-reset-btn');

confirmButton.addEventListener('click', () => {
  showConfirmationModal();
});

startNewOrderButton.addEventListener('click', () => {
  const modalOverlay = document.querySelector('.js-modal-overlay');
  modalOverlay.classList.add('modal-hidden');
  cart.length = 0; // Reset cart
  document.querySelectorAll('.js-button-container').forEach((buttonContainer) => {
    const productId = buttonContainer.dataset.productId;
    renderButtonState(productId, buttonContainer);
  });
  renderOrderSummary();
  renderPaymentSummary();
});

// Exported function to revert button state
export function revertToAddToCart(productId) {
  const buttonContainer = document.querySelector(`.js-button-container[data-product-id="${productId}"]`);
  if (buttonContainer) {
    renderButtonState(productId, buttonContainer);
  }
}