// router.js

// Route configuration
const routes = {
  'home': { 
    template: 'home-template', 
    authRequired: false,
    script: '/assets/js/home.js'
  },
  'store': { 
    template: 'storeTemplate', 
    authRequired: false
  },
  'topicsbar': { 
    template: 'topicsbar-template', 
    authRequired: false
  },
  'account': { 
    template: 'account-template', 
    authRequired: true,
    init: showAccountPage,
    script: '/assets/js/account.js'
  },
  'signin': { 
    template: 'signin-template', 
    authRequired: false,
    init: showSignInForm,
    script: '/assets/js/signinpage.js'
  },
  'register': {
    template: 'register-modal-template',
    authRequired: false,
    init: showRegisterForm,
    script: '/assets/js/registerfront.js'
  },
  'feed': {
    template: 'feed-template',
    authRequired: false
  },
  'template-create-post-modal': {
    template: 'template-create-post-modal',
    authRequired: true,
    isModal: true
  }
};

// Track loaded scripts to prevent duplicate loading
const loadedScripts = new Set();

document.addEventListener('DOMContentLoaded', () => {
  // Set up initial route
  handleRoute(window.location.pathname);
  
  // Event delegation for navigation
  document.body.addEventListener('click', (e) => {
    // Handle regular page links
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

    // Handle auth redirect links
    if (e.target.matches('#show-login')) {
      e.preventDefault();
      navigateTo('signin');
    }
  });

  // Listen to back/forward navigation
  window.addEventListener('popstate', () => {
    handleRoute(window.location.pathname);
  });
});

// Main route handler
function handleRoute(route) {
  // Hide all sections first
  const allSections = document.querySelectorAll('.view');
  allSections.forEach(section => section.classList.add('d-none'));

  const [page] = route.split('/').filter(Boolean);
  const routeConfig = routes[page] || routes['home']; // Default to home
  
  // Check authentication if required
  if (routeConfig.authRequired && !isLoggedIn()) {
    return navigateTo('signin');
  }

  // Handle modal routes differently
  if (routeConfig.isModal) {
    showModal(page);
    return;
  }

  loadPage(page || 'home', routeConfig);
}

// Navigation function
function navigateTo(page) {
  window.history.pushState({}, '', `/${page}`);
  handleRoute(`/${page}`);
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

  // Inject template content
  injectTemplateContent(template);
  
  // Call init function if specified
  if (routeConfig.init) {
    routeConfig.init();
  }

  // Load associated script if specified
  if (routeConfig.script && !loadedScripts.has(routeConfig.script)) {
    loadScript(routeConfig.script);
    loadedScripts.add(routeConfig.script);
  }

  // Update UI based on auth state
  updateAuthUI();
}

// Template injection
function injectTemplateContent(template) {
  const container = document.getElementById('main-content');
  if (!container) {
    console.error('Main content container not found');
    return;
  }
  
  container.innerHTML = '';
  const clone = document.importNode(template.content, true);
  container.appendChild(clone);
}

// Modal handling
function showModal(modalId) {
  const routeConfig = routes[modalId];
  if (!routeConfig) return;

  if (routeConfig.authRequired && !isLoggedIn()) {
    return navigateTo('signin');
  }

  const template = document.getElementById(routeConfig.template);
  if (!template) return;

  const modalContainer = document.createElement('div');
  modalContainer.className = 'modal-overlay';
  modalContainer.innerHTML = '';
  const clone = document.importNode(template.content, true);
  modalContainer.appendChild(clone);
  
  document.body.appendChild(modalContainer);
  
  // Add close handler
  const closeButtons = modalContainer.querySelectorAll('[data-modal-close]');
  closeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      document.body.removeChild(modalContainer);
    });
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
  // Additional register form setup if needed
}

function showSignInForm() {
  // Additional signin form setup if needed
}

function showAccountPage() {
  // Additional account page setup if needed
}
initializeRouter();
