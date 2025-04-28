// pcbuild.js - Handles dynamic loading, selection, and adding individual components to cart

// Ensure cart-logic.js is loaded first

document.addEventListener('DOMContentLoaded', function() {

    // --- Configuration & Fallback Data ---
    const componentDataFiles = { 'CPU': 'cpus.json', 'Motherboard': 'motherboards.json', 'RAM': 'ram.json', 'GPU': 'gpus.json', 'Storage': 'storage.json', 'Case': 'cases.json', 'PSU': 'psus.json', 'Cooling': 'cooling.json' };
    const fallbackComponentData = {
        'CPU': [ { ID: "fb-cpu-01", Name: "Fallback CPU 1", Details: "Basic", Price: 99.99 }, { ID: "fb-cpu-02", Name: "Fallback CPU 2", Details: "Mid", Price: 199.99 } ],
        'Motherboard': [ { ID: "fb-mobo-01", Name: "Fallback Motherboard", Details: "Standard", Price: 89.99 } ],
        'RAM': [ { ID: "fb-ram-01", Name: "Fallback RAM 8GB", Details: "DDR4", Price: 39.99 }, { ID: "fb-ram-02", Name: "Fallback RAM 16GB", Details: "DDR4", Price: 69.99 } ],
        'GPU': [ { ID: "fb-gpu-01", Name: "Fallback GPU Basic", Details: "Low-End", Price: 149.99 }, { ID: "fb-gpu-02", Name: "Fallback GPU Mid", Details: "Mid", Price: 299.99 } ],
        'Storage': [ { ID: "fb-ssd-01", Name: "Fallback SSD 256GB", Details: "SATA", Price: 49.99 }, { ID: "fb-ssd-02", Name: "Fallback SSD 512GB", Details: "NVMe", Price: 79.99 } ],
        'Case': [ { ID: "fb-case-01", Name: "Fallback Case Mid", Details: "ATX", Price: 59.99 } ],
        'PSU': [ { ID: "fb-psu-01", Name: "Fallback PSU 500W", Details: "80+", Price: 49.99 } ],
        'Cooling': [ { ID: "fb-cool-01", Name: "Fallback Cooler Air", Details: "Fan", Price: 29.99 } ]
    };

    // --- DOM References ---
    const componentListBody = document.getElementById('component-list');
    // Header total elements are no longer updated by this script
    // const headerTotalElement = document.getElementById('header-cart-total'); // Keep ID for cart-logic.js
    // const headerTotalContainer = document.getElementById('header-cart-total-display'); // Keep ID for cart-logic.js

    // --- State ---
    let allComponentData = {};
    let selectedComponents = {}; // Still useful to know what's selected for enabling buttons

    // --- Fetch Data (with Fallback) ---
    async function fetchComponentData(componentType, filePath) {
        try {
            const response = await fetch(filePath);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status} for ${filePath}`);
            allComponentData[componentType] = await response.json();
            console.log(`Loaded data for ${componentType} from ${filePath}`);
            return true;
        } catch (error) {
            console.warn(`Warning: Failed fetch for ${componentType} (${error.message}). Using fallback.`);
            allComponentData[componentType] = fallbackComponentData[componentType] || [];
            return false;
        }
    }

    // --- Populate Select Dropdown ---
    function populateSelect(componentType) {
        const selectElement = document.getElementById(`select-${componentType}`);
        const data = allComponentData[componentType];
        if (!selectElement) return;
        if (!Array.isArray(data)) {
            selectElement.disabled = true;
            selectElement.innerHTML = `<option value="">Load Error</option>`;
            return;
        }
        selectElement.innerHTML = `<option value="">-- Select ${componentType} --</option>`;
        selectElement.disabled = data.length === 0;
        data.forEach(item => {
            const option = document.createElement('option');
            option.value = item.ID;
            option.textContent = `${item.Name} ($${item.Price.toFixed(2)})`;
            selectElement.appendChild(option);
        });
        if (!selectElement.hasAttribute('data-listener-attached')) {
            selectElement.addEventListener('change', handleSelectionChange);
            selectElement.setAttribute('data-listener-attached', 'true');
        }
    }

    // --- Handle Component Selection Change ---
    function handleSelectionChange(event) {
        const selectElement = event.target;
        const selectedId = selectElement.value;
        const componentType = selectElement.dataset.type;
        const componentRow = selectElement.closest('tr');
        const priceCell = componentRow.querySelector('.price-cell');
        const detailsCell = componentRow.querySelector('.selected-details');
        const addButton = componentRow.querySelector('.btn-add-component'); // Get the add button

        if (!componentType || !componentRow || !priceCell || !detailsCell || !addButton) return;

        const dataSet = allComponentData[componentType] || [];
        const selectedItem = dataSet.find(item => item.ID === selectedId);

        if (selectedItem) {
            // Store selection details
            selectedComponents[componentType] = { ID: selectedItem.ID, Name: selectedItem.Name, Price: selectedItem.Price, Image: `https://placehold.co/100x100/cccccc/333333?text=${encodeURIComponent(componentType)}` }; // Add placeholder image URL
            // Update UI
            priceCell.textContent = `$${selectedItem.Price.toFixed(2)}`;
            priceCell.dataset.price = selectedItem.Price.toFixed(2);
            detailsCell.textContent = selectedItem.Details || '';
            // Enable the Add button for this row
            addButton.disabled = false;
            addButton.title = `Add ${selectedItem.Name} to cart`;
        } else {
            // No item selected
            delete selectedComponents[componentType];
            // Reset UI
            priceCell.textContent = '$0.00';
            priceCell.dataset.price = '0.00';
            detailsCell.textContent = '';
            // Disable the Add button
            addButton.disabled = true;
            addButton.title = 'Select a component first';
        }
        // REMOVED call to updateCostSummary() - header total is now cart total
    }

    // --- Handle Add Component to Cart Button Click ---
    function handleAddComponentClick(event) {
        const button = event.target;
        const componentRow = button.closest('tr');
        const componentType = componentRow.dataset.componentType;

        // Get the currently selected component details for this type
        const selectedItem = selectedComponents[componentType];

        if (selectedItem) {
            console.log(`Adding ${componentType} to cart:`, selectedItem);

            // Use the addToCart function from cart-logic.js
            if (typeof addToCart === 'function') {
                // Pass the necessary details (ID, Name, Price, Image)
                addToCart({
                    ID: selectedItem.ID,
                    Name: selectedItem.Name,
                    Price: selectedItem.Price,
                    Image: selectedItem.Image // Use the placeholder image we stored
                });

                // Provide visual feedback
                button.textContent = '✓'; // Checkmark indicates added
                button.disabled = true; // Disable after adding
                button.title = `${selectedItem.Name} added to cart`;

                // Optional: Reset button after a delay
                setTimeout(() => {
                    // Re-enable only if the item is still selected
                    if (selectedComponents[componentType]?.ID === selectedItem.ID) {
                         button.textContent = '+';
                         button.disabled = false;
                         button.title = `Add ${selectedItem.Name} to cart`;
                    }
                }, 2000); // Reset after 2 seconds
            } else {
                console.error("addToCart function not found. Ensure cart-logic.js is loaded.");
                alert("Error adding item to cart.");
            }
        } else {
            console.warn(`Attempted to add ${componentType} but none is selected.`);
            alert(`Please select a ${componentType} first.`);
        }
    }

    // --- Attach Listeners to Add Buttons ---
    function attachAddButtonListeners() {
        const addButtons = componentListBody.querySelectorAll('.btn-add-component');
        addButtons.forEach(button => {
            if (!button.hasAttribute('data-listener-attached')) {
                button.addEventListener('click', handleAddComponentClick);
                button.setAttribute('data-listener-attached', 'true');
            }
        });
    }

    // --- Initialize Builder ---
    async function initializeBuilder() {
        console.log("Initializing PC Builder...");
        const fetchPromises = [];
        for (const type in componentDataFiles) {
            if (document.querySelector(`tr[data-component-type="${type}"]`)) {
                 fetchPromises.push(fetchComponentData(type, componentDataFiles[type]));
            }
        }
        await Promise.all(fetchPromises);
        console.log("Component data fetching attempted.");

        for (const type in componentDataFiles) {
             if (document.querySelector(`tr[data-component-type="${type}"]`)) {
                populateSelect(type);
             }
        }
        console.log("Dropdowns populated.");

        // Attach listeners to the initially disabled add buttons
        attachAddButtonListeners();

        // REMOVED initial call to updateCostSummary()

        // Update header cart count/total via cart-logic.js functions
        if (typeof updateCartCountHeader === 'function') updateCartCountHeader();
        if (typeof updateCartTotalHeader === 'function') updateCartTotalHeader(); // Call the new function
    }

    // --- Run Initialization ---
    initializeBuilder();

}); // End DOMContentLoaded
