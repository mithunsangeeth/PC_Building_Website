// prebuild.js - Handles category switching and build display on prebuild.html
// Fetches data from prebuilds_data.json with fallback

// Ensure cart-logic.js is loaded first if header count update is needed

document.addEventListener('DOMContentLoaded', function() {

    // --- Fallback Data ---
    const fallbackBuildsData = [
      { ID: "fallback-office-01", Category: "Office", Name: "Default Office PC", Highlight: "Basic tasks.", Price: 399.99, ImagePlaceholderText: "Office PC", Specs: { CPU: "Basic CPU", RAM: "4GB", Storage: "128GB SSD" } },
      { ID: "fallback-gaming-01", Category: "Gaming", Name: "Default Gaming PC", Highlight: "Entry-level gaming.", Price: 599.99, ImagePlaceholderText: "Gaming PC", Specs: { CPU: "Basic Gaming CPU", GPU: "Entry GPU", RAM: "8GB", Storage: "256GB SSD" } }
    ];

    // --- Global variable for data ---
    let prebuildsData = [];

    // --- DOM References ---
    const categoryButtons = document.querySelectorAll('.category-button');
    const buildsContainer = document.getElementById('dynamic-builds-container');

    if (!buildsContainer) {
        console.error("Error: Could not find builds container '#dynamic-builds-container'.");
        return;
    }

    // --- Fetch Pre-Build Data ---
    async function fetchPrebuildData() {
        try {
            const response = await fetch('prebuilds_data.json'); // Ensure path is correct
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            prebuildsData = await response.json();
            console.log("Pre-build data loaded successfully:", prebuildsData);
            return true;
        } catch (error) {
            console.warn(`Warning: Failed to fetch prebuilds_data.json (${error.message}). Using fallback data.`);
            prebuildsData = fallbackBuildsData;
            buildsContainer.innerHTML = '<p class="no-items-message" style="color: orange;">Could not load live data. Showing default builds.</p>';
            return true; // Indicate success with fallback data
        }
    }

    // --- Generate HTML for Build Specs List ---
    function createSpecsListHTML(specs) {
        let listHTML = '<ul>';
        for (const key in specs) {
            // Capitalize key for display (e.g., "CPU", "RAM")
            const displayName = key.charAt(0).toUpperCase() + key.slice(1);
            listHTML += `<li><strong>${displayName}:</strong> ${specs[key]}</li>`;
        }
        listHTML += '</ul>';
        return listHTML;
    }


    // --- Generate HTML for a Single Build Card ---
    function createBuildCardHTML(build) {
        const imageUrl = `https://placehold.co/120x100/e8e8e8/555?text=${encodeURIComponent(build.ImagePlaceholderText || 'Build')}`;
        const specsHTML = createSpecsListHTML(build.Specs);

        return `
            <div class="build-card" data-build-id="${build.ID}">
                <div class="build-card-header">
                    <img src="${imageUrl}" alt="${build.Name}" class="build-image" onerror="this.src='https://placehold.co/120x100/e8e8e8/555?text=Error'; this.alt='Image Error'">
                    <div class="build-info">
                        <h3>${build.Name}</h3>
                        <p class="build-highlight">${build.Highlight}</p>
                        <p class="build-price">$${build.Price.toFixed(2)}</p>
                        <button class="btn btn-toggle-details">More Info</button>
                    </div>
                </div>
                <div class="build-details">
                    <h4>Specifications</h4>
                    ${specsHTML}
                </div>
            </div>
        `;
    }

    // --- Display Builds for Selected Category ---
    function displayBuilds(category) {
        if (prebuildsData.length === 0) {
            console.warn("No prebuild data available.");
            if (!buildsContainer.querySelector('.no-items-message')) { // Avoid overwriting fallback message immediately
                 buildsContainer.innerHTML = '<p class="no-items-message">No build data loaded.</p>';
            }
            return;
        }

        // Clear container *unless* it shows the fallback warning
         if (!buildsContainer.querySelector('.no-items-message[style*="orange"]')) {
            buildsContainer.innerHTML = '<p class="loading-message">Filtering builds...</p>';
         }


        setTimeout(() => { // Optional delay
            const filteredBuilds = prebuildsData.filter(build => build.Category === category);

             // Clear container before adding filtered items
            buildsContainer.innerHTML = '';

            if (filteredBuilds.length === 0) {
                buildsContainer.innerHTML = '<p class="no-items-message">No builds found in this category.</p>';
                return;
            }

            let allCardsHTML = '';
            filteredBuilds.forEach(build => {
                allCardsHTML += createBuildCardHTML(build);
            });
            buildsContainer.innerHTML = allCardsHTML;

            // Add listeners for the new "More Info" buttons
            addToggleDetailsListeners();

        }, 50); // Reduced delay
    }

    // --- Handle Category Button Clicks ---
    function switchCategory(event) {
        const targetCategory = event.target.dataset.category;
        categoryButtons.forEach(button => button.classList.remove('active'));
        event.target.classList.add('active');
        displayBuilds(targetCategory);
    }

    // --- Handle "More Info" Button Clicks ---
    function toggleDetails(event) {
        // Find the parent .build-card element
        const buildCard = event.target.closest('.build-card');
        if (buildCard) {
            buildCard.classList.toggle('expanded'); // Add/remove 'expanded' class
            // Change button text
            const button = buildCard.querySelector('.btn-toggle-details');
            if (button) {
                button.textContent = buildCard.classList.contains('expanded') ? 'Less Info' : 'More Info';
            }
        }
    }

    // --- Add Listeners to "More Info" Buttons ---
    function addToggleDetailsListeners() {
        const toggleButtons = buildsContainer.querySelectorAll('.btn-toggle-details');
        toggleButtons.forEach(button => {
             // Avoid attaching multiple listeners
             if (!button.hasAttribute('data-listener-attached')) {
                button.addEventListener('click', toggleDetails);
                button.setAttribute('data-listener-attached', 'true');
             }
        });
    }


    // --- Initial Page Setup ---
    async function initializePage() {
        if (categoryButtons.length > 0) {
            categoryButtons.forEach(button => button.addEventListener('click', switchCategory));
        } else {
            console.warn("No category buttons found.");
            buildsContainer.innerHTML = '<p class="no-items-message">No categories available.</p>';
            return;
        }

        // Fetch initial data (or use fallback)
        buildsContainer.innerHTML = '<p class="loading-message">Loading initial data...</p>';
        await fetchPrebuildData();

        // Display initial category
        const initialActiveButton = document.querySelector('.category-button.active');
        if (initialActiveButton) {
            displayBuilds(initialActiveButton.dataset.category);
        } else if (categoryButtons.length > 0) {
            categoryButtons[0].classList.add('active');
            displayBuilds(categoryButtons[0].dataset.category);
        }

        // Update header cart count (if function exists)
        if (typeof updateCartCountHeader === 'function') {
            updateCartCountHeader();
        }
    }

    // --- Run Initialization ---
    initializePage();

}); // End DOMContentLoaded
