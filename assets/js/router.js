// router.js

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
    script: '/assets/js/signinpage.js' 
  },
  'register': { 
    template: 'register-template', 
    authRequired: false, 
    init: initializeRegisterPage, 
    script: '/assets/js/registerfront.js' 
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
};

const loadedScripts = new Set();
let isNavigating = false;

document.addEventListener('DOMContentLoaded', () => {
  // ✅ Initialize window.posts if it doesn't exist
  if (!window.posts) window.posts = [];
  
  handleRoute(getCurrentRoute());

  document.body.addEventListener('click', (e) => {
    const navLink = e.target.closest('.nav-link[data-page]');
    const registerBtn = e.target.closest('#open-register-page');
    const signInBtn = e.target.closest('#open-signin-page');
    const showRegisterLink = e.target.closest('#show-register');
    const closeSigninBtn = e.target.closest('#close-signin');
    const accountLink = e.target.closest('#account-buttons a');
    const createPostLink = e.target.closest('a[href="#/create-post"]');

    if (navLink) {
      e.preventDefault();
      navigateTo(navLink.dataset.page);
    } else if (registerBtn) {
      e.preventDefault();
      navigateTo('register');
    } else if (signInBtn) {
      e.preventDefault();
      navigateTo('signin');
    } else if (showRegisterLink) {
      e.preventDefault();
      navigateTo('register');
    } else if (closeSigninBtn) {
      e.preventDefault();
      navigateTo('home');
    } else if (accountLink && accountLink.getAttribute('href') === '#/my-account') {
      e.preventDefault();
      navigateTo('my-account');
    } else if (createPostLink) {
      e.preventDefault();
      if (isLoggedIn()) {
        navigateTo('create-post');
      } else {
        alert('You must be logged in to create a post.');
      }
    }
  });

  // Listen for hash changes
  window.addEventListener('hashchange', () => {
    handleRoute(getCurrentRoute());
  });
});

function getCurrentRoute() {
  const hash = window.location.hash || '#/home';
  const route = hash.slice(2);
  return route || 'home';
}

function handleRoute(route) {
  // ✅ AUTH STABILIZATION CHECK - Give time for auth state to stabilize
  if (window.appState && typeof window.appState.isAuthenticated === 'undefined') {
    setTimeout(() => handleRoute(route), 200);
    return;
  }

  // ✅ Additional check for auth state initialization
  if (window.appState && window.appState.isAuthChecking) {
    setTimeout(() => handleRoute(route), 100);
    return;
  }

  // Prevent multiple navigations at once
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
  const routeConfig = routes[page] || routes['home'];

  if (routeConfig.authRequired && !isLoggedIn()) {
    localStorage.setItem('redirectAfterLogin', page);
    const action = page === 'create-post' ? 'create a post' : 'access this page';
    alert(`Please sign in to ${action}`);
    isNavigating = false;
    return navigateTo('signin');
  }

  loadPage(page || 'home', routeConfig)
    .then(() => {
      isNavigating = false;
    })
    .catch(err => {
      console.error('Error loading page:', err);
      isNavigating = false;
    });
}

function handleTopicRoute(topicSlug) {
  console.log(`Handling topic route: ${topicSlug}`);
  
  // Check auth for topic posts (assuming it requires auth)
  if (!isLoggedIn()) {
    localStorage.setItem('redirectAfterLogin', `topic/${topicSlug}`);
    alert('Please sign in to view topic posts');
    isNavigating = false;
    return navigateTo('signin');
  }

  // Load the topic posts template and initialize
  const template = document.getElementById('topic-posts-template');
  if (!template) {
    console.error('Topic posts template not found');
    isNavigating = false;
    return;
  }

  injectTemplateContent(template);
  
  // Initialize the topic posts page
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

function navigateTo(page) {
  window.location.hash = `/${page}`;
}

// ✅ Modified to return a Promise for better control flow
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
        // Add a small delay to ensure DOM is ready and scripts are fully loaded
        setTimeout(() => {
          try {
            if (page === 'register' && typeof window.setupRegisterPage === 'function') {
              window.setupRegisterPage();
            } else if (routeConfig.init) {
              routeConfig.init();
            }
            
            updateAuthUI();
    
            if (page === 'signin') {
              const closeButton = document.getElementById('close-signin');
              if (closeButton) {
                closeButton.addEventListener('click', (e) => {
                  e.preventDefault();
                  navigateTo('home');
                });
              }
              
              const redirectPage = localStorage.getItem('redirectAfterLogin');
              if (isLoggedIn() && redirectPage) {
                localStorage.removeItem('redirectAfterLogin');
                navigateTo(redirectPage);
              } else if (isLoggedIn()) {
                navigateTo('feed');
              }
            }
            
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

// Page initialization functions
function initializeHomePage() {
  console.log('Home page initialization from router.js');
  if (typeof window.initializeHomePage === 'function') {
    window.initializeHomePage();
  } else {
    console.warn('initializeHomePage function not found');
  }
}

function initializeRegisterPage() {
  console.log('Register page initialization');
}

function initializeSignInPage() {
  console.log('Sign in page initialization called from router.js');
  // The actual implementation is in signinpage.js
}

function initializeAccountPage() {
  console.log('Account page initialization from router.js');
  if (typeof window.initializeAccountPage === 'function') {
    window.initializeAccountPage();
  } else {
    console.warn('initializeAccountPage function not found');
  }
}


function initializeFeedPage() {
  console.log('Feed page initialization');
  // If user is logged in, initialize feed data
  if (isLoggedIn()) {
    console.log('User is logged in, loading feed data');
    // Check if loadFeedContent exists before calling
    if (typeof loadFeedContent === 'function') {
      loadFeedContent();
    } else {
      console.warn('loadFeedContent function not found');
    }
  }
}

function initializeStorePage() {
  console.log('Store page initialization from router.js');
  // Call the actual rendering logic from findastore.js
  if (typeof renderStoreList === 'function') {
    renderStoreList();
  } else {
    console.warn('renderStoreList function not found');
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

function initializeTopicsBarPage() {
  console.log('TopicsBar page initialization from router.js');
  if (typeof window.initializeTopicsBarPage === 'function') {
    window.initializeTopicsBarPage();
  } else {
    console.warn('initializeTopicsBarPage function not found');
  }
}

window.updateUIForAuthState = updateAuthUI;
