// router.js

// Route configuration
const routes = {
  'home': { template: 'home-template', authRequired: false, script: '/assets/js/home.js' },
  'store': { template: 'storeTemplate', authRequired: false },
  'topicsbar': { template: 'topicsbar-template', authRequired: true },
  'account': { template: 'account-template', authRequired: true, init: showAccountPage, script: '/assets/js/account.js' },
  'signin': { template: 'signin-template', authRequired: false, init: showSignInForm, script: '/assets/js/signinpage.js' },
  'register': { template: 'register-modal-template', authRequired: false, init: showRegisterForm, script: '/assets/js/registerfront.js' },
  'feed': { template: 'feed-template', authRequired: false },
  'template-create-post-modal': { template: 'template-create-post-modal', authRequired: true, isModal: true }
};

const loadedScripts = new Set();

document.addEventListener('DOMContentLoaded', () => {
  handleRoute(getCurrentRoute());

  document.body.addEventListener('click', (e) => {
    if (e.target.matches('.nav-link[data-page]')) {
      e.preventDefault();
      const page = e.target.dataset.page;
      const isModal = e.target.dataset.type === 'modal';
      
      if (isModal) {
        showModal(page);
      } else {
        navigateTo(page);
      }
    }

    // Handle Register button click
    if (e.target.matches('#open-register-modal')) {
      e.preventDefault();
      navigateTo('register');
    }

    // Handle Sign In button click
    if (e.target.matches('#open-signin-page')) {
      e.preventDefault();
      navigateTo('signin');
    }

   // Combined handler for sign-in/register toggle links
   if (e.target.matches('#show-register, #show-login')) {
    e.preventDefault();
    const modal = e.target.closest('.modal-overlay, .signin-modal');
    if (modal) modal.remove();
    navigateTo(e.target.id === 'show-register' ? 'register' : 'signin');
  }

  // Old login button handler (can be removed if no longer needed)
  if (e.target.matches('#show-login')) {
    e.preventDefault();
    const modal = e.target.closest('.modal-overlay');
    if (modal) modal.remove();
    navigateTo('signin');
  }
});

  // Listen for hash changes instead of popstate
  window.addEventListener('hashchange', () => {
    handleRoute(getCurrentRoute());
  });
});

// Get current route from hash
function getCurrentRoute() {
  const hash = window.location.hash || '#/home'; // Default to home
  const route = hash.slice(2); // Remove "#/"
  return route || 'home';
}

// Main route handler
function handleRoute(route) {
  const allSections = document.querySelectorAll('.view');
  allSections.forEach(section => section.classList.add('d-none'));

  const [page] = route.split('/').filter(Boolean);
  const routeConfig = routes[page] || routes['home'];

  if (routeConfig.authRequired && !isLoggedIn()) {
    // Store the intended page before redirecting to login
    localStorage.setItem('redirectAfterLogin', page);
    const action = page === 'template-create-post-modal' ? 'create a post' : 'access topics';
    alert(`Please sign in to ${action}`);

    return navigateTo('signin');
  }

  if (routeConfig.isModal) {
    showModal(page);
    return;
  }

  loadPage(page || 'home', routeConfig);
}

// Navigation function
function navigateTo(page) {
  window.location.hash = `#/${page}`;
}

// Page loader
function loadPage(page, routeConfig = routes[page]) {
  if (!routeConfig) {
    console.error(`No route configuration for ${page}`);
    return navigateTo('home');
  }

  const template = document.getElementById(routeConfig.template);
  if (!template) {
    console.error(`Template ${routeConfig.template} not found`);
    return navigateTo('home');
  }

  injectTemplateContent(template);

  if (routeConfig.init) {
    routeConfig.init();
  }

  if (routeConfig.script && !loadedScripts.has(routeConfig.script)) {
    loadScript(routeConfig.script);
    loadedScripts.add(routeConfig.script);
  }

  updateAuthUI();
}

// Template injection
function injectTemplateContent(template) {
  const container = document.getElementById('app-content');
  if (!container) {
    console.error('Main content container not found');
    return;
  }
  
  container.innerHTML = '';
  const clone = document.importNode(template.content, true);
  container.appendChild(clone);
}

// Modal handling
// Modal handling - Updated version
function showModal(modalId) {
  const routeConfig = routes[modalId];
  if (!routeConfig) return;

  // Check if authentication is required and user is not logged in
  if (routeConfig.authRequired && !isLoggedIn()) {
    // Store the intended modal ID in localStorage before redirecting
    localStorage.setItem('redirectAfterLogin', modalId);
    
    // Show a message to the user (optional)
    alert('Please sign in to create a post');
    
    // Redirect to signin page
    navigateTo('signin');
    return;
  }

  // If we get here, either no auth is required or user is logged in
  const template = document.getElementById(routeConfig.template);
  if (!template) return;

  // Create modal container
  const modalContainer = document.createElement('div');
  modalContainer.className = 'modal-overlay';
  
  // Add modal content
  const clone = document.importNode(template.content, true);
  modalContainer.appendChild(clone);
  
  // Add to DOM
  document.body.appendChild(modalContainer);

  // Handle close buttons
  const closeButtons = modalContainer.querySelectorAll('[data-modal-close]');
  closeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      document.body.removeChild(modalContainer);
    });
  });

  // Close modal when clicking outside content (optional)
  modalContainer.addEventListener('click', (e) => {
    if (e.target === modalContainer) {
      document.body.removeChild(modalContainer);
    }
  });
}

// Auth-related functions
function isLoggedIn() {
  return localStorage.getItem('user') !== null;
}

function updateAuthUI() {
  const authButtons = document.getElementById('account-buttons');
  const noAuthButtons = document.getElementById('registerlogin-buttons');
  
  if (isLoggedIn()) {
    authButtons?.classList.remove('d-none');
    noAuthButtons?.classList.add('d-none');
  } else {
    authButtons?.classList.add('d-none');
    noAuthButtons?.classList.remove('d-none');
  }
}

// Script loader helper
function loadScript(src) {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    script.defer = true;
    script.onload = resolve;
    script.onerror = reject;
    document.body.appendChild(script);
  });
}

// Page-specific functions
function showRegisterForm() { 
  // This will be implemented in your registerfront.js
}

function showSignInForm() { 
  // This will be implemented in your signinpage.js
}

function showAccountPage() { 
  // This will be implemented in your account.js
}
