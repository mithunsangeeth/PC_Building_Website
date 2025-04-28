// addons.js - Handles category switching, item display, and Add to Cart clicks on addons.html
// Fetches data dynamically from addons_data.json with a local fallback

// Make sure this script runs AFTER cart-logic.js is loaded

document.addEventListener('DOMContentLoaded', function() {

    // --- Fallback Data (Used if fetching addons_data.json fails) ---
    const fallbackAddonsData = [
        { ID: "fallback-kb-01", Category: "Peripherals", Name: "Default Keyboard", Description: "Standard layout, reliable performance.", Price: 29.99, ImagePlaceholderText: "Keyboard" },
        { ID: "fallback-mouse-01", Category: "Peripherals", Name: "Default Mouse", Description: "Optical mouse, comfortable design.", Price: 19.99, ImagePlaceholderText: "Mouse" },
        { ID: "fallback-usb-01", Category: "Storage", Name: "Default USB 32GB", Description: "Basic USB storage.", Price: 9.99, ImagePlaceholderText: "Storage" },
        { ID: "fallback-headset-01", Category: "Audio", Name: "Default Headset", Description: "Basic stereo headset with microphone.", Price: 24.99, ImagePlaceholderText: "Audio" }
        // Add more fallback items if desired
    ];


    // --- Global variable to store fetched or fallback data ---
    let addonsData = []; // Initialize as empty array

    // --- DOM Element References ---
    const categoryButtons = document.querySelectorAll('.category-button');
    const addonsContainer = document.getElementById('dynamic-addons-container');
    const refreshButton = document.getElementById('refresh-addons-button');

    if (!addonsContainer || !refreshButton) {
        console.error("Error: Could not find required elements (container or refresh button).");
        return;
    }

    // --- Function to Fetch Addon Data from JSON ---
    async function fetchAddonData() {
        try {
            // Fetch the JSON file
            const response = await fetch('addons_data.json'); // Ensure path is correct

            if (!response.ok) {
                 // Throw an error if response status is not OK (e.g., 404 Not Found)
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            // Try parsing the JSON response
            const data = await response.json();
            addonsData = data; // Update the global variable with fetched data
            console.log("Addon data loaded successfully from addons_data.json:", addonsData);
            return true; // Indicate success

        } catch (error) {
            // --- Fallback Logic ---
            console.warn(`Warning: Failed to fetch or parse addons_data.json (${error.message}). Using fallback data.`);
            // Use the hardcoded fallback data instead
            addonsData = fallbackAddonsData;
            // Display a message indicating fallback usage
            addonsContainer.innerHTML = '<p class="no-items-message" style="color: orange;">Could not load live data. Showing default items.</p>';
             // Return true because we have successfully loaded *fallback* data
             // This allows the display functions to proceed using the fallback.
            return true;
        }
    }


    // --- Function to Generate HTML for a Single Addon Card ---
    // (No changes needed)
    function createAddonCardHTML(item) {
        const imageUrl = `https://placehold.co/200x150/e0e0e0/777?text=${encodeURIComponent(item.ImagePlaceholderText || 'Item')}`;
        const cartImageUrl = `https://placehold.co/100x100/cccccc/333333?text=${encodeURIComponent(item.ImagePlaceholderText || 'Item')}`;

        return `
            <div class="addon-card">
                <img src="${imageUrl}" alt="${item.Name}" class="addon-image" onerror="this.src='https://placehold.co/200x150/e0e0e0/777?text=Image+Error'; this.alt='Placeholder Image Error'">
                <div class="addon-details">
                    <h4>${item.Name}</h4>
                    <p class="addon-description">${item.Description}</p>
                    <p class="addon-price">$${item.Price.toFixed(2)}</p>
                    <button class="btn btn-add-cart"
                            data-id="${item.ID}"
                            data-name="${item.Name}"
                            data-price="${item.Price.toFixed(2)}"
                            data-image="${cartImageUrl}">
                        Add to Cart
                    </button>
                </div>
            </div>
        `;
    }

    // --- Function to Display Addons for a Given Category ---
    // (Modified slightly to handle the fallback message potentially being present)
    function displayAddons(category) {
        // Check if data (fetched or fallback) is loaded
        if (addonsData.length === 0) {
            console.warn("No addon data available (neither fetched nor fallback).");
             addonsContainer.innerHTML = '<p class="no-items-message">No addon data available.</p>';
            return;
        }

        // Clear container *unless* it currently shows the fallback warning message
        if (!addonsContainer.querySelector('.no-items-message[style*="orange"]')) {
             addonsContainer.innerHTML = '<p class="loading-message">Filtering items...</p>';
        }


        // Simulate a small delay (optional)
        setTimeout(() => {
            // Filter the current addonsData (which might be fetched or fallback)
            const filteredAddons = addonsData.filter(item => item.Category === category);

            // Clear container completely before adding filtered items
            addonsContainer.innerHTML = '';

            if (filteredAddons.length === 0) {
                addonsContainer.innerHTML = '<p class="no-items-message">No items found in this category.</p>';
                return;
            }

            let allCardsHTML = '';
            filteredAddons.forEach(item => {
                allCardsHTML += createAddonCardHTML(item);
            });
            addonsContainer.innerHTML = allCardsHTML;

            attachAddToCartListeners();
        }, 50);
    }

    // --- Function to Handle Category Button Clicks ---
    // (No changes needed)
    function switchCategory(event) {
        const targetCategory = event.target.dataset.category;
        categoryButtons.forEach(button => button.classList.remove('active'));
        event.target.classList.add('active');
        displayAddons(targetCategory);
    }

    // --- Function to Handle Refresh Button Click ---
    // Re-fetches data (which might succeed or fall back again) and re-displays
    async function refreshCurrentCategory() {
        const activeButton = document.querySelector('.category-button.active');
        if (activeButton) {
            const category = activeButton.dataset.category;
            console.log(`Refreshing data and displaying category: ${category}`);
            addonsContainer.innerHTML = '<p class="loading-message">Refreshing data...</p>';
            // Re-fetch the data (will use fallback if fetch fails again)
            const success = await fetchAddonData();
            // No need to check success here, displayAddons will handle empty/fallback data
            displayAddons(category); // Re-display the current category
        } else {
            console.warn("No active category button found to refresh.");
            // Attempt to fetch and display the first category as a fallback
            await fetchAddonData();
            if (categoryButtons.length > 0) displayAddons(categoryButtons[0].dataset.category);
        }
    }


    // --- Function to Attach Listeners to Add to Cart Buttons ---
    // (No changes needed)
    function attachAddToCartListeners() {
        const addToCartButtons = addonsContainer.querySelectorAll('.btn-add-cart');
        addToCartButtons.forEach(button => {
             if (!button.hasAttribute('data-listener-attached')) {
                 button.addEventListener('click', handleAddToCartClick);
                 button.setAttribute('data-listener-attached', 'true');
             }
        });
    }

    // --- Handler for Add to Cart Click ---
    // (No changes needed)
    function handleAddToCartClick(event) {
        const button = event.target;
        const itemData = {
            ID: button.dataset.id,
            Name: button.dataset.name,
            Price: parseFloat(button.dataset.price),
            Image: button.dataset.image
        };

        console.log('Add to Cart Clicked:', itemData);
        if (typeof addToCart === 'function') {
            addToCart(itemData);
        } else {
            console.error("addToCart function is not defined. Make sure cart-logic.js is loaded first.");
            alert("Error: Could not add item to cart.");
            return;
        }

        button.textContent = 'Added!';
        button.disabled = true;
        setTimeout(() => {
            button.textContent = 'Add to Cart';
            button.disabled = false;
        }, 1500);
    }


    // --- Initial Setup Function ---
    // (Modified slightly to handle fetch success/failure more gracefully)
    async function initializePage() {
        // Add listeners to static buttons first
        if (categoryButtons.length > 0) {
            categoryButtons.forEach(button => button.addEventListener('click', switchCategory));
            refreshButton.addEventListener('click', refreshCurrentCategory);
        } else {
             console.warn("No category buttons found.");
             addonsContainer.innerHTML = '<p class="no-items-message">No categories available.</p>';
             return;
        }

        // Fetch initial data (will use fallback if needed)
        addonsContainer.innerHTML = '<p class="loading-message">Loading initial data...</p>';
        await fetchAddonData(); // Wait for fetch (or fallback) to complete

        // Now display the initial category using whatever data was loaded (fetched or fallback)
        const initialActiveButton = document.querySelector('.category-button.active');
        if (initialActiveButton) {
            displayAddons(initialActiveButton.dataset.category);
        } else if (categoryButtons.length > 0) {
            // Fallback: activate and display the first category
            categoryButtons[0].classList.add('active');
            displayAddons(categoryButtons[0].dataset.category);
        }
         // If addonsData is still empty after fetch/fallback, displayAddons will show appropriate message

        // Ensure header count is updated (relies on cart-logic.js)
        if (typeof updateCartCountHeader === 'function') {
            updateCartCountHeader();
        }
    }

    // --- Run Initialization ---
    initializePage();

}); // End DOMContentLoaded
