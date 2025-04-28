// cart-logic.js - Core functions for managing the shopping cart using localStorage

const CART_STORAGE_KEY = 'pcForgeCart';

function getCart() {
    const cartJson = localStorage.getItem(CART_STORAGE_KEY);
    try {
        return cartJson ? JSON.parse(cartJson) : [];
    } catch (error) {
        console.error("Error parsing cart data:", error);
        return [];
    }
}

function saveCart(cart) {
    if (!Array.isArray(cart)) {
        console.error("Invalid cart data provided to saveCart.");
        return;
    }
    try {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch (error) {
        console.error("Error saving cart data:", error);
        alert("Could not save cart. Storage might be full.");
    }
}

function addToCart(itemToAdd) {
    if (!itemToAdd || !itemToAdd.ID || !itemToAdd.Name || itemToAdd.Price === undefined || !itemToAdd.Image) {
        console.error("Invalid item data provided to addToCart:", itemToAdd);
        alert("Error: Could not add item due to invalid data.");
        return;
    }
    const cart = getCart();
    const existingItemIndex = cart.findIndex(item => item.ID === itemToAdd.ID);
    if (existingItemIndex > -1) {
        cart[existingItemIndex].Quantity += 1;
    } else {
        cart.push({ ...itemToAdd, Quantity: 1 });
    }
    saveCart(cart);
    updateCartCountHeader();
    updateCartTotalHeader(); // <-- Update total when adding
}

function updateItemQuantityInCart(itemId, newQuantity) {
    const quantity = parseInt(newQuantity, 10);
    if (isNaN(quantity) || quantity < 1) {
        console.warn(`Invalid quantity for item ${itemId}: ${newQuantity}.`);
        return; // Ignore invalid quantity
    }
    const cart = getCart();
    const itemIndex = cart.findIndex(item => item.ID === itemId);
    if (itemIndex > -1) {
        cart[itemIndex].Quantity = quantity;
        saveCart(cart);
        updateCartCountHeader(); // Count might not change, but total will
        updateCartTotalHeader(); // <-- Update total when quantity changes
    }
}

function removeItemFromCart(itemId) {
    let cart = getCart();
    cart = cart.filter(item => item.ID !== itemId);
    saveCart(cart);
    updateCartCountHeader();
    updateCartTotalHeader(); // <-- Update total when removing
}

function getCartItemCount() {
    const cart = getCart();
    return cart.reduce((total, item) => total + item.Quantity, 0);
}

// --- NEW: Calculate Cart Total Value ---
function getCartTotal() {
    const cart = getCart();
    return cart.reduce((total, item) => total + (item.Price * item.Quantity), 0);
}


function updateCartCountHeader() {
    const count = getCartItemCount();
    const cartCountElement = document.querySelector('.cart-count');
    if (cartCountElement) {
        cartCountElement.textContent = count;
    }
}

// --- NEW: Update Cart Total Display in Header ---
function updateCartTotalHeader() {
    const total = getCartTotal();
    // Use the updated IDs/Classes for the header total display
    const cartTotalElement = document.getElementById('header-cart-total');
    const cartTotalContainer = document.getElementById('header-cart-total-display');

    if (cartTotalElement && cartTotalContainer) {
        if (total > 0) {
            cartTotalElement.textContent = `$${total.toFixed(2)}`;
            cartTotalContainer.style.display = ''; // Show container
        } else {
            cartTotalContainer.style.display = 'none'; // Hide if cart total is zero
        }
    } else {
        // console.warn("Header cart total element not found."); // Less noisy warning
    }
}


// --- Initial Updates on Load ---
document.addEventListener('DOMContentLoaded', () => {
    updateCartCountHeader();
    updateCartTotalHeader(); // <-- Update total on initial load
});
