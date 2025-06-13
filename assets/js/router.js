// router.js - COMPLETE VERSION WITH ALL FUNCTIONS + ERROR HANDLING
import { updateAuthUI, isLoggedIn } from './authutils.js';

const routes = {
  'home': { 
    template: 'home-template', 
    authRequired: false, 
    script: '/assets/js/home.js',
    init: initializeHomePage
  },
  'store': { 
    template: 'store-template-page',
    authRequired: false, 
    script: '/assets/js/findastore.js', 
    init: initializeStorePage 
  },
  'topicsbar': { 
    template: 'topicsbar-template', 
    authRequired: true,
    script: '/assets/js/topicsbar.js',
    init: initializeTopicsBarPage
  },
  'my-account': { 
    template: 'account-page-template', 
    authRequired: true, 
    script: '/assets/js/account.js', 
    init: initializeAccountPage 
  },
  'signin': { 
    template: 'signin-template', 
    authRequired: false, 
    script: '/assets/js/signinpage.js',
    init: initializeSignInPage
  },
  'register': { 
    template: 'register-template', 
    authRequired: false, 
    script: '/assets/js/registerfront.js',
    init: initializeRegisterPage
  },
  'feed': { 
    template: 'feed-template', 
    authRequired: true, 
    init: initializeFeedPage 
  },
  'create-post': { 
    template: 'template-create-post', 
    authRequired: true, 
    script: '/assets/js/createpost.js', 
    init: initializeCreatePostPage 
  }
  // REMOVED: 'error' route - let error.js handle all error rendering
};

const loadedScripts = new Set();
let isNavigating = false;

// Add hash route validation function
// Fix this function in your router.js
function validateHashRoute() {
  const hash = window.location.hash.slice(1) || '/';
  const cleanHash = hash.startsWith('/') ? hash.slice(1) : hash;
  
  const segments = cleanHash.split('/').filter(Boolean); // removes empty parts
  const baseRoute = segments[0];

  const validRoutes = Object.keys(routes);
  const dynamicRoutes = ['topic']; // only allow topic/slug

  // If base route doesn't exist → invalid
  if (!validRoutes.includes(baseRoute) && !dynamicRoutes.includes(baseRoute)) {
    console.warn(`Route "${baseRoute}" is not recognized`);
    return false;
  }

  // Static routes like 'home' shouldn't have extra path parts
  if (validRoutes.includes(baseRoute) && !dynamicRoutes.includes(baseRoute)) {
    if (segments.length > 1) {
      console.warn(`Static route "${baseRoute}" shouldn't have extra path: ${segments.join('/')}`);
      return false;
    }
  }

  // Dynamic route must match pattern e.g. topic/some-slug
  if (dynamicRoutes.includes(baseRoute)) {
    if (segments.length !== 2 || !segments[1]) {
      console.warn(`Dynamic route "${baseRoute}" is malformed: ${segments.join('/')}`);
      return false;
    }
  }

  return true;
}

// Add fallback route handler
function handleFallbackRoute() {
  const hash = window.location.hash;
  
  if (!hash || hash === '#' || hash === '#/') {
    // No hash or empty hash - go to home
    navigateTo('home');
    return;
  }
  
  // Invalid hash format - show error
  if (!hash.startsWith('#/')) {
    showErrorPage(404, 'Invalid page format.');
    return;
  }
  
  // Let normal routing handle it
  handleRoute(getCurrentRoute());
}

// UPDATED: Use existing error.js system instead of routing
function showErrorPage(errorCode = 404, customMessage = null) {
  console.log(`Showing error page: ${errorCode}`);
  
  // Use your existing renderErrorPage function instead of routing
  if (window.renderErrorPage) {
    window.renderErrorPage(errorCode, customMessage);
  } else {
    console.error('renderErrorPage function not available');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  if (!window.posts) window.posts = [];
  
  // CHECK FOR ERROR PARAMETERS FIRST - before any routing
  const urlParams = new URLSearchParams(window.location.search);
  const errorParam = urlParams.get('error');
  
  if (errorParam && !isNaN(errorParam)) {
    console.log(`Error parameter detected: ${errorParam}`);
    // Wait for error.js to load, then trigger error page
    setTimeout(() => {
      if (window.renderErrorPage) {
        window.renderErrorPage(Number(errorParam));
      } else {
        console.error('renderErrorPage function not available');
      }
    }, 100);
    return; // Don't proceed with normal routing
  }
  
  // Normal routing if no error parameter
  handleRoute(getCurrentRoute());

  // ENHANCED event delegation handler
  document.body.addEventListener('click', (e) => {
    const navLink = e.target.closest('.nav-link[data-page]');
    const registerBtn = e.target.closest('#open-register-page');
    const signInBtn = e.target.closest('#open-signin-page');
    const showRegisterLink = e.target.closest('#show-register');
    const closeSigninBtn = e.target.closest('#close-signin');
    const accountLink = e.target.closest('#account-buttons a');
    const createPostLink = e.target.closest('a[href="#/create-post"]');
    
    // Handle navigation links
    if (navLink) {
      e.preventDefault();
      const page = navLink.dataset.page;
      console.log('Nav link clicked:', page);
      navigateTo(page);
    } 
    // Handle register button
    else if (registerBtn) {
      e.preventDefault();
      console.log('Register button clicked');
      navigateTo('register');
    } 
    // Handle sign in button
    else if (signInBtn) {
      e.preventDefault();
      console.log('Sign in button clicked');
      navigateTo('signin');
    }
    // Handle show register link (from signin page)
    else if (showRegisterLink) {
      e.preventDefault();
      console.log('Show register link clicked');
      navigateTo('register');
    }
    // Handle close signin button
    else if (closeSigninBtn) {
      e.preventDefault();
      console.log('Close signin button clicked');
      navigateTo('home');
    }
    // Handle account link
    else if (accountLink && accountLink.getAttribute('href') === '#/my-account') {
      e.preventDefault();
      console.log('Account link clicked');
      navigateTo('my-account');
    }
    // Handle create post link
    else if (createPostLink) {
      e.preventDefault();
      if (isLoggedIn()) {
        navigateTo('create-post');
      } else {
        localStorage.setItem('redirectAfterLogin', 'create-post');
        alert('You must be logged in to create a post.');
        navigateTo('signin');
      }
    }
  });

  // ENHANCED hash change listener with validation
  window.addEventListener('hashchange', () => {
    const currentRoute = getCurrentRoute();
    
    // Validate the route before handling
    if (!validateHashRoute()) {
      console.warn(`Invalid hash route: ${window.location.hash}`);
      showErrorPage(404, `The page "${currentRoute}" was not found.`);
      return;
    }
    
    handleRoute(currentRoute);
  });
});

function getCurrentRoute() {
  const hash = window.location.hash || '#/home';
  const route = hash.slice(2);
  return route || 'home';
}

function handleRoute(route) {
  if (isNavigating) return;
  isNavigating = true;

  const allSections = document.querySelectorAll('.view');
  allSections.forEach(section => section.classList.add('d-none'));

  // Handle dynamic topic routes
  if (route.startsWith('topic/')) {
    const topicSlug = route.split('/')[1];
    if (topicSlug) {
      handleTopicRoute(topicSlug);
      return;
    }
  }

  const [page] = route.split('/').filter(Boolean);
  const routeConfig = routes[page];
  
  // ENHANCED: Check if route exists and handle unknown routes
  if (!routeConfig) {
    console.warn(`Route not found: ${page}`);
    isNavigating = false;
    // Use the existing showErrorPage function
    return showErrorPage(404, `The page "${page}" was not found.`);
  }

  const finalConfig = routeConfig || routes['home'];

  // BETTER APPROACH: Redirect to sign-in instead of showing 401 error
  if (finalConfig.authRequired && !isLoggedIn()) {
    localStorage.setItem('redirectAfterLogin', page);
    // DON'T show error - redirect to sign-in instead
    console.log(`Authentication required for ${page}, redirecting to sign-in`);
    
    // Show appropriate message based on the page
    const pageMessages = {
      'feed': 'Please sign in to view the feed.',
      'create-post': 'Please sign in to create a post.',
      'topicsbar': 'Please sign in to view topics.',
      'my-account': 'Please sign in to access your account.'
    };
    
    const message = pageMessages[page] || 'Please sign in to access this page.';
    alert(message);
    
    isNavigating = false;
    navigateTo('signin');
    return;
  }

  loadPage(page || 'home', finalConfig)
    .then(() => {
      isNavigating = false;
    })
    .catch(err => {
      console.error('Error loading page:', err);
      isNavigating = false;
      showErrorPage(500, 'Failed to load the page. Please try again.');
    });
}

function handleTopicRoute(topicSlug) {
  console.log(`Handling topic route: ${topicSlug}`);
  
  if (!isLoggedIn()) {
    localStorage.setItem('redirectAfterLogin', `topic/${topicSlug}`);
    alert('Please sign in to view topic posts');
    isNavigating = false;
    return navigateTo('signin');
  }

  const template = document.getElementById('topic-posts-template');
  if (!template) {
    console.error('Topic posts template not found');
    isNavigating = false;
    return;
  }

  injectTemplateContent(template);
  
  setTimeout(() => {
    if (typeof window.renderPostsForTopic === 'function') {
      window.renderPostsForTopic(topicSlug);
    } else {
      console.error('renderPostsForTopic function not found');
    }
    updateAuthUI();
    isNavigating = false;
  }, 100);
}

function loadPage(page, routeConfig = routes[page]) {
  return new Promise((resolve, reject) => {
    const template = document.getElementById(routeConfig.template);
    if (!template) {
      console.error(`Template not found: ${routeConfig.template}`);
      navigateTo('home');
      return reject(new Error(`Template not found: ${routeConfig.template}`));
    }

    injectTemplateContent(template);

    const scriptPromise = routeConfig.script && !loadedScripts.has(routeConfig.script)
      ? loadScript(routeConfig.script)
      : Promise.resolve();

    scriptPromise
      .then(() => {
        setTimeout(() => {
          try {
            if (routeConfig.init) {
              routeConfig.init();
            }
            updateAuthUI();
            resolve();
          } catch (error) {
            console.error('Error initializing page:', error);
            reject(error);
          }
        }, 100);
      })
      .catch(err => {
        console.error(`Error loading script for page "${page}":`, err);
        reject(err);
      });

    if (routeConfig.script) {
      loadedScripts.add(routeConfig.script);
    }
  });
}

// ENHANCED navigateTo function with route validation
function navigateTo(page) {
  console.log(`Navigating to: ${page}`);
  
  // Check if route exists before navigating (removed 'error' check)
  if (!routes[page] && !page.startsWith('topic/')) {
    console.warn(`Attempting to navigate to non-existent route: ${page}`);
    showErrorPage(404, `The page "${page}" does not exist.`);
    return;
  }
  
  window.location.hash = `/${page}`;
}

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

function loadScript(src) {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = (err) => reject(err);
    document.body.appendChild(script);
  });
}

// ===== ALL INITIALIZATION FUNCTIONS =====

function initializeHomePage() {
  console.log('Home page initialization from router.js');
  if (typeof window.initializeHomePage === 'function') {
    window.initializeHomePage();
  } else {
    console.warn('initializeHomePage function not found in external script');
  }
}

function initializeStorePage() {
  console.log('Store page initialization from router.js');
  if (typeof window.renderStoreList === 'function') {
    window.renderStoreList();
  } else if (typeof renderStoreList === 'function') {
    renderStoreList();
  } else {
    console.warn('renderStoreList function not found');
  }
}

function initializeTopicsBarPage() {
  console.log('TopicsBar page initialization from router.js');
  if (typeof window.initializeTopicsBarPage === 'function') {
    window.initializeTopicsBarPage();
  } else {
    console.warn('initializeTopicsBarPage function not found');
  }
}

function initializeAccountPage() {
  console.log('Account page initialization from router.js');
  if (typeof window.initializeAccountPage === 'function') {
    window.initializeAccountPage();
  } else {
    console.warn('initializeAccountPage function not found');
  }
}

function initializeSignInPage() {
  console.log('Sign in page initialization from router.js');
  if (typeof window.initializeSignInPage === 'function') {
    window.initializeSignInPage();
  } else {
    console.warn('initializeSignInPage function not found');
  }
}

function initializeRegisterPage() {
  console.log('Register page initialization from router.js');
  if (typeof window.setupRegisterPage === 'function') {
    window.setupRegisterPage();
  } else if (typeof window.initializeRegisterPage === 'function') {
    window.initializeRegisterPage();
  } else {
    console.warn('Register page initialization function not found');
  }
}

function initializeFeedPage() {
  console.log('Feed page initialization from router.js');
  if (isLoggedIn()) {
    console.log('User is logged in, loading feed data');
    if (typeof window.loadFeedContent === 'function') {
      window.loadFeedContent();
    } else if (typeof loadFeedContent === 'function') {
      loadFeedContent();
    } else {
      console.warn('loadFeedContent function not found');
    }
  } else {
    console.warn('User not logged in for feed page');
  }
}

function initializeCreatePostPage() {
  console.log('Create Post page initialization from router.js');
  if (typeof window.initializeCreatePostPage === 'function') {
    window.initializeCreatePostPage();
  } else {
    console.warn('initializeCreatePostPage function not found');
  }
}

// REMOVED: initializeErrorPage function - no longer needed

// Expose functions globally
window.navigateTo = navigateTo;
window.updateUIForAuthState = updateAuthUI;
window.showErrorPage = showErrorPage;
window.handleFallbackRoute = handleFallbackRoute;
