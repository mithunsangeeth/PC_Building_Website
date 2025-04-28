// cart-page.js - Handles displaying cart items and interactions on cart.html

// Make sure this script runs AFTER cart-logic.js is loaded

document.addEventListener('DOMContentLoaded', function() {

    // --- DOM Element References ---
    const cartItemsBody = document.getElementById('cart-items-body');
    const cartSubtotalElement = document.getElementById('cart-subtotal');
    const cartTotalElement = document.getElementById('cart-total');
    const emptyCartRow = document.getElementById('empty-cart-row');
    const checkoutButton = document.getElementById('checkout-button');

    if (!cartItemsBody || !cartSubtotalElement || !cartTotalElement || !emptyCartRow || !checkoutButton) {
        console.error("Error: Missing required elements on the cart page.");
        return;
    }

    // --- Function to Create HTML for a Single Cart Item Row ---
    function createCartItemRowHTML(item) {
        const itemTotal = (item.Price * item.Quantity).toFixed(2);
        return `
            <tr class="cart-item" data-item-id="${item.ID}">
                <td class="item-image">
                    <img src="${item.Image}" alt="${item.Name}">
                </td>
                <td class="item-details">
                    <p class="item-name">${item.Name}</p>
                    <small>ID: ${item.ID}</small>
                </td>
                <td class="item-price">$${item.Price.toFixed(2)}</td>
                <td class="item-quantity">
                    <input type="number" value="${item.Quantity}" min="1" class="quantity-input" aria-label="Item Quantity">
                </td>
                <td class="item-total">$${itemTotal}</td>
                <td class="item-remove">
                    <button class="btn-remove" title="Remove item">&times;</button>
                    </td>
            </tr>
        `;
    }

    // --- Function to Calculate and Display Totals ---
    function calculateAndDisplayTotals() {
        const cart = getCart(); // Get current cart from logic
        let subtotal = 0;

        cart.forEach(item => {
            subtotal += item.Price * item.Quantity;
        });

        // Update DOM elements (add tax/shipping logic here if needed)
        cartSubtotalElement.textContent = `$${subtotal.toFixed(2)}`;
        cartTotalElement.textContent = `$${subtotal.toFixed(2)}`; // Assuming total is just subtotal for now

        // Enable/disable checkout button based on cart content
        checkoutButton.disabled = cart.length === 0;
    }


    // --- Function to Display All Cart Items ---
    function displayCartItems() {
        const cart = getCart(); // Get current cart from logic
        cartItemsBody.innerHTML = ''; // Clear existing items

        if (cart.length === 0) {
            // Show the empty cart message row
            emptyCartRow.style.display = ''; // Make it visible (default is table-row)
        } else {
            // Hide the empty cart message row
            emptyCartRow.style.display = 'none';
            // Generate and append rows for each item
            cart.forEach(item => {
                const itemRowHTML = createCartItemRowHTML(item);
                cartItemsBody.insertAdjacentHTML('beforeend', itemRowHTML);
            });
        }

        // Add event listeners after items are displayed
        addCartInteractionListeners();
        // Calculate and display totals
        calculateAndDisplayTotals();
        // Update header count (important if cart was modified directly)
        updateCartCountHeader();
    }


    // --- Function to Add Listeners for Quantity Changes and Remove Buttons ---
    function addCartInteractionListeners() {
        const quantityInputs = cartItemsBody.querySelectorAll('.quantity-input');
        const removeButtons = cartItemsBody.querySelectorAll('.btn-remove');

        // Quantity Input Listener
        quantityInputs.forEach(input => {
            input.addEventListener('change', handleQuantityChange);
            // Optional: Listen for 'input' for more immediate feedback, but 'change' is usually sufficient
        });

        // Remove Button Listener
        removeButtons.forEach(button => {
            button.addEventListener('click', handleRemoveItem);
        });
    }

    // --- Event Handler for Quantity Change ---
    function handleQuantityChange(event) {
        const input = event.target;
        const newQuantity = parseInt(input.value, 10);
        // Find the parent row (tr) to get the item ID
        const itemRow = input.closest('.cart-item');
        const itemId = itemRow ? itemRow.dataset.itemId : null;

        if (itemId && !isNaN(newQuantity)) {
            if (newQuantity >= 1) {
                // Update quantity using the function from cart-logic.js
                updateItemQuantityInCart(itemId, newQuantity);
                // Refresh the cart display to show updated totals
                displayCartItems();
            } else {
                // If user enters 0 or less, reset to 1 or remove (optional)
                // For simplicity, let's reset to the previous valid quantity or 1
                const cart = getCart();
                const item = cart.find(i => i.ID === itemId);
                input.value = item ? item.Quantity : 1; // Reset input value
                alert("Quantity must be at least 1.");
            }
        }
    }

    // --- Event Handler for Remove Item Click ---
    function handleRemoveItem(event) {
        const button = event.target;
        // Find the parent row (tr) to get the item ID
        const itemRow = button.closest('.cart-item');
        const itemId = itemRow ? itemRow.dataset.itemId : null;

        if (itemId) {
            // Confirm removal (optional but recommended)
            if (confirm("Are you sure you want to remove this item from your cart?")) {
                // Remove using the function from cart-logic.js
                removeItemFromCart(itemId);
                // Refresh the cart display
                displayCartItems();
            }
        }
    }


    // --- Initial Cart Display ---
    // Display items when the cart page loads
    displayCartItems();

}); // End DOMContentLoaded
