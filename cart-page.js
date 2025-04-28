// cart-page.js - Handles displaying cart items and interactions on cart.html (Part List Viewer)

// Make sure cart-logic.js is loaded first

document.addEventListener('DOMContentLoaded', function() {

    // --- DOM Element References ---
    const cartItemsBody = document.getElementById('cart-items-body');
    const emptyCartRow = document.getElementById('empty-cart-row');
    // Action Buttons
    const exportButton = document.getElementById('export-list-button');
    const clearCartButton = document.getElementById('clear-cart-button');
    // Removed references to summary elements

    // Basic check for essential elements
    if (!cartItemsBody || !emptyCartRow || !exportButton || !clearCartButton) {
        console.error("Error: Missing required elements on the cart page (table body or action buttons).");
        return;
    }

    // --- Function to Create HTML for a Single Cart Item Row ---
    // (No changes needed from previous version)
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

    // --- Function to Calculate and Display Totals REMOVED ---
    // Totals are now only handled in the header by cart-logic.js

    // --- Function to Display All Cart Items ---
    function displayCartItems() {
        const cart = getCart(); // Get current cart from logic
        cartItemsBody.innerHTML = ''; // Clear existing items

        if (cart.length === 0) {
            emptyCartRow.style.display = ''; // Show empty message
            exportButton.disabled = true; // Disable buttons if cart is empty
            clearCartButton.disabled = true;
        } else {
            emptyCartRow.style.display = 'none'; // Hide empty message
            cart.forEach(item => {
                const itemRowHTML = createCartItemRowHTML(item);
                cartItemsBody.insertAdjacentHTML('beforeend', itemRowHTML);
            });
            exportButton.disabled = false; // Enable buttons
            clearCartButton.disabled = false;
        }

        addCartInteractionListeners();
        // REMOVED call to calculateAndDisplayTotals()
        // Header updates are handled by cart-logic.js calls within interaction handlers
    }


    // --- Function to Add Listeners for Quantity Changes and Remove Buttons ---
    function addCartInteractionListeners() {
        const quantityInputs = cartItemsBody.querySelectorAll('.quantity-input');
        const removeButtons = cartItemsBody.querySelectorAll('.btn-remove');

        quantityInputs.forEach(input => {
             if (!input.hasAttribute('data-listener-attached')) {
                input.addEventListener('change', handleQuantityChange);
                input.setAttribute('data-listener-attached', 'true');
             }
        });
        removeButtons.forEach(button => {
             if (!button.hasAttribute('data-listener-attached')) {
                button.addEventListener('click', handleRemoveItem);
                button.setAttribute('data-listener-attached', 'true');
             }
        });
    }

    // --- Event Handler for Quantity Change ---
    function handleQuantityChange(event) {
        const input = event.target;
        const newQuantity = parseInt(input.value, 10);
        const itemRow = input.closest('.cart-item');
        const itemId = itemRow ? itemRow.dataset.itemId : null;

        if (itemId && !isNaN(newQuantity)) {
            if (newQuantity >= 1) {
                // Update quantity using cart-logic.js (this now also updates header total)
                updateItemQuantityInCart(itemId, newQuantity);
                // Refresh only the specific row's total for immediate feedback
                const item = getCart().find(i => i.ID === itemId); // Get updated item
                const totalCell = itemRow.querySelector('.item-total');
                if (item && totalCell) {
                     totalCell.textContent = `$${(item.Price * item.Quantity).toFixed(2)}`;
                }
                // Optionally, could call displayCartItems() but might be less smooth
            } else {
                const cart = getCart();
                const item = cart.find(i => i.ID === itemId);
                input.value = item ? item.Quantity : 1;
                alert("Quantity must be at least 1.");
            }
        }
    }

    // --- Event Handler for Remove Item Click ---
    function handleRemoveItem(event) {
        const button = event.target;
        const itemRow = button.closest('.cart-item');
        const itemId = itemRow ? itemRow.dataset.itemId : null;

        if (itemId) {
            if (confirm("Are you sure you want to remove this item from your list?")) {
                // Remove using cart-logic.js (this now also updates header total)
                removeItemFromCart(itemId);
                // Refresh the entire cart display
                displayCartItems();
            }
        }
    }

    // --- NEW: Event Handler for Export Button ---
    function handleExportList() {
        const cart = getCart();
        if (cart.length === 0) {
            alert("Your list is empty.");
            return;
        }

        let listText = "PC Forge - Part List\n";
        listText += "================================\n\n";
        let total = 0;

        cart.forEach(item => {
            const itemTotal = item.Price * item.Quantity;
            listText += `Item: ${item.Name}\n`;
            listText += `ID: ${item.ID}\n`;
            listText += `Qty: ${item.Quantity}\n`;
            listText += `Price: $${item.Price.toFixed(2)}\n`;
            listText += `Subtotal: $${itemTotal.toFixed(2)}\n`;
            listText += "--------------------------------\n";
            total += itemTotal;
        });

        listText += `\n================================\n`;
        listText += `GRAND TOTAL: $${total.toFixed(2)}\n`;
        listText += `================================\n`;

        // Simple text export: Copy to clipboard or download as .txt

        // Option 1: Copy to Clipboard (more broadly compatible)
        try {
            navigator.clipboard.writeText(listText).then(() => {
                alert("Part list copied to clipboard!");
            }, (err) => {
                console.error('Failed to copy text: ', err);
                alert("Failed to copy list. Please try selecting and copying manually.");
                // As fallback, show the text in a textarea for manual copy
                showExportTextArea(listText);
            });
        } catch (err) {
             console.error('Clipboard API not available or failed: ', err);
             alert("Clipboard copy failed. Please try selecting and copying manually.");
             showExportTextArea(listText);
        }

        // Option 2: Download as .txt (commented out, clipboard is often preferred)
        /*
        const blob = new Blob([listText], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'pc-forge-part-list.txt';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        */
    }

     // Helper for showing text area if clipboard fails
    function showExportTextArea(text) {
        let textarea = document.getElementById('export-textarea');
        if (!textarea) {
            textarea = document.createElement('textarea');
            textarea.id = 'export-textarea';
            textarea.readOnly = true;
            textarea.style.width = '90%';
            textarea.style.height = '150px';
            textarea.style.marginTop = '15px';
            textarea.style.fontFamily = 'monospace';
            // Find a place to insert it, e.g., after the action buttons
            const actionsDiv = document.querySelector('.cart-actions');
            if (actionsDiv) {
                actionsDiv.parentNode.insertBefore(textarea, actionsDiv.nextSibling);
            } else { // fallback if actions div not found
                 document.querySelector('.cart-section').appendChild(textarea);
            }
        }
        textarea.value = text;
        textarea.select(); // Select text for easy manual copying
    }


    // --- NEW: Event Handler for Clear Cart Button ---
    function handleClearCart() {
        if (confirm("Are you sure you want to clear your entire part list? This cannot be undone.")) {
            // Use the clearCart function (to be added to cart-logic.js)
            if (typeof clearCart === 'function') {
                clearCart();
                // Refresh the display
                displayCartItems();
            } else {
                 console.error("clearCart function not found. Ensure cart-logic.js is updated and loaded.");
                 alert("Error clearing list.");
            }
        }
    }


    // --- Add Listeners for Action Buttons ---
    exportButton.addEventListener('click', handleExportList);
    clearCartButton.addEventListener('click', handleClearCart);


    // --- Initial Cart Display ---
    displayCartItems();

}); // End DOMContentLoaded
