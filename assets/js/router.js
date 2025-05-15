// router.js

const routes = {
  'home': { template: 'home-template', authRequired: false, script: '/assets/js/home.js' },
  'store': { template: 'storetemplate', authRequired: false, script: '/assets/js/findastore.js',init: initializeStorePage },
  'topicsbar': { template: 'topicsbar-template', authRequired: true },
  'account': { template: 'account-template', authRequired: true, init: initializeAccountPage, script: '/assets/js/account.js' },
  'signin': { template: 'signin-template', authRequired: false, script: '/assets/js/signinpage.js' },
  'register': { template: 'register-template', authRequired: false, init: initializeRegisterPage, script: '/assets/js/registerfront.js' },
  'feed': { template: 'feed-template', authRequired: false },
  'create-post': { template: 'template-create-post', authRequired: true }
};

const loadedScripts = new Set();
let isNavigating = false; // Add this flag to prevent duplicate navigation

document.addEventListener('DOMContentLoaded', () => {
  handleRoute(getCurrentRoute());

  document.body.addEventListener('click', (e) => {
    // Handle navigation links
    if (e.target.matches('.nav-link[data-page]') || e.target.closest('.nav-link[data-page]')) {
      e.preventDefault();



      
      const element = e.target.matches('.nav-link[data-page]') ? e.target : e.target.closest('.nav-link[data-page]');
      const page = element.dataset.page;
      navigateTo(page);
    }

    // Handle sign-in button
    if (e.target.id === 'open-signin-page' || e.target.closest('#open-signin-page')) {
      e.preventDefault();
      console.log('Sign-in button clicked, navigating to signin page');
      navigateTo('signin');
    }

    // Handle register button
    if (e.target.id === 'open-register-modal' || e.target.closest('#open-register-modal')) {
      e.preventDefault();
      console.log('Register button clicked, navigating to register page');
      navigateTo('register');
    }

    // Handle show register link in signin page
    if (e.target.id === 'show-register' || e.target.closest('#show-register')) {
      e.preventDefault();
      console.log('Show register link clicked, navigating to register page');
      navigateTo('register');
    }
    
    // Handle close signin button
    if (e.target.id === 'close-signin' || e.target.closest('#close-signin')) {
      e.preventDefault();
      e.stopPropagation();
      console.log('Close sign-in button clicked, navigating to home page');
      navigateTo('home');
    }
  });

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
  console.log(`Handling route: ${route}`);
  
  // Hide all views
  const allSections = document.querySelectorAll('.view');
  allSections.forEach(section => section.classList.add('d-none'));

  const [page] = route.split('/').filter(Boolean);
  const routeConfig = routes[page] || routes['home'];

  if (routeConfig.authRequired && !isLoggedIn()) {
    // Store the intended page before redirecting to login
    localStorage.setItem('redirectAfterLogin', page);
    const action = page === 'create-post' ? 'create a post' : 'access this page';
    alert(`Please sign in to ${action}`);

    return navigateTo('signin');
  }

  loadPage(page || 'home', routeConfig);
}

// Navigation function
function navigateTo(page) {
  console.log(`Navigating to: ${page}`);
  window.location.hash = `#/${page}`;
}

// Page loader
function loadPage(page, routeConfig = routes[page]) {
  console.log(`Loading page: ${page}`);
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

  // Load script if it exists (and not already loaded)
  if (routeConfig.script && !loadedScripts.has(routeConfig.script)) {
    loadScript(routeConfig.script)
      .then(() => {
        console.log(`Script ${routeConfig.script} loaded.`);
        // After script is loaded, check if there's an init function
        if (page === 'register' && typeof window.setupRegisterPage === 'function') {
          console.log('Calling setupRegisterPage after script load.');
          window.setupRegisterPage();
        } else if (routeConfig.init) {
          routeConfig.init();
        }
      })
      .catch(err => console.error(`Error loading script ${routeConfig.script}:`, err));
    
    loadedScripts.add(routeConfig.script);
  } else {
    // If script already loaded or not needed
    if (page === 'register' && typeof window.setupRegisterPage === 'function') {
        console.log('Calling setupRegisterPage as script was already loaded.');
        window.setupRegisterPage();
    } else if (routeConfig.init) {
        routeConfig.init();
    }
  }

  updateAuthUI();
  
  // Special case for signin page - ensure close button works
  if (page === 'signin') {
    setTimeout(() => {
      const closeButton = document.getElementById('close-signin');
      if (closeButton) {
        console.log('Setting up close button in router.js');
        closeButton.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          console.log('Close button clicked (from router.js handler)');
          navigateTo('home');
        });
      }
    }, 100);
  }
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
  console.log(`Loading script: ${src}`);
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    script.defer = true;
    script.onload = () => {
      console.log(`Script loaded: ${src}`);
      resolve();
    };
    script.onerror = (err) => {
      console.error(`Failed to load script: ${src}`);
      reject(err);
    };
    document.body.appendChild(script);
  });
}

// Expose functions to window for use in other scripts
window.navigateTo = navigateTo;
window.isLoggedIn = isLoggedIn;
window.updateAuthUI = updateAuthUI;

// Stub functions for page initialization


function initializeRegisterPage() {
  console.log('Register page initialization');
}

function initializeSignInPage() {
  console.log('Sign in page initialization called from router.js');
  // The actual implementation is in signinpage.js
}
function initializeAccountPage() { 
  console.log('Account page initialization');
}

