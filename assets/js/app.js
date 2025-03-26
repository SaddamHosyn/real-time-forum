import { router } from './router.js';

document.addEventListener('DOMContentLoaded', function() {
    // Set current year in footer
    document.getElementById('current-year').textContent = new Date().getFullYear();

    // Define routes
    setupRoutes();

    // Start the router
    router.start();
});

function setupRoutes() {
    // Home route
    router.addRoute('/', 'home-template', loadAdvertisements);

    // Example route for quick recipes
    router.addRoute('/quick-recipe', 'quick-recipe-template', loadQuickRecipes);

    // Example route for nutrition
    router.addRoute('/nutrition', 'nutrition-template', loadNutritionContent);

    // Add more routes as needed...
}

// Example route callback functions
async function loadAdvertisements() {
    // Your existing advertisement loading code
    const scrollingContainer = document.querySelector('.scrolling-content');
    if (scrollingContainer) {
        // Load scrolling ads...
    }
    
    const fixedAdsContainer = document.querySelector('.fixed-ads .row');
    if (fixedAdsContainer) {
        // Load fixed ads...
    }
}

async function loadQuickRecipes() {
    // Load quick recipe content
    console.log('Loading quick recipes...');
}

async function loadNutritionContent() {
    // Load nutrition content
    console.log('Loading nutrition insights...');
}
