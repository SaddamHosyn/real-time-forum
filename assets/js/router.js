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
  },
  'error': { 
    template: 'error-template', 
    authRequired: false,
    init: initializeErrorPage
  }
};

const loadedScripts = new Set();
let isNavigating = false;

// Add error handling function
function showErrorPage(errorCode = 404, customMessage = null) {
  console.log(`Showing error page: ${errorCode}`);
  
  const errorData = {
    400: {
      title: "Bad Request",
      message: customMessage || "The server could not understand your request.",
      icon: "⚠️"
    },
    401: {
      title: "Unauthorized", 
      message: customMessage || "You need to sign in to access this page.",
      icon: "🔒"
    },
    403: {
      title: "Forbidden",
      message: customMessage || "You don't have permission to access this page.",
      icon: "🚫"
    },
    404: {
      title: "Page Not Found",
      message: customMessage || "The page you are looking for does not exist.",
      icon: "🔍"
    },
    405: {
      title: "Method Not Allowed",
      message: customMessage || "The method you used is not allowed for this request.",
      icon: "❌"
    },
    500: {
      title: "Server Error",
      message: customMessage || "Something went wrong on our end. Please try again later.",
      icon: "💥"
    }
  };

  const error = errorData[errorCode] || errorData[404];
  
  // Store error data for the error page to use
  window.currentError = {
    code: errorCode,
    ...error
  };
  
  // Navigate to error page
  window.location.hash = '#/error';
}

document.addEventListener('DOMContentLoaded', () => {
  if (!window.posts) window.posts = [];
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
  
  // Check if route exists
  if (!routeConfig && page !== 'error') {
    console.warn(`Route not found: ${page}`);
    isNavigating = false;
    return showErrorPage(404, `The page "${page}" could not be found.`);
  }

  const finalConfig = routeConfig || routes['home'];

  // Check authentication
  if (finalConfig.authRequired && !isLoggedIn()) {
    localStorage.setItem('redirectAfterLogin', page);
    const action = page === 'create-post' ? 'create a post' : 'access this page';
    isNavigating = false;
    return showErrorPage(401, `Please sign in to ${action}.`);
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

function navigateTo(page) {
  console.log(`Navigating to: ${page}`);
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

// Add initialization function for error page
function initializeErrorPage() {
  console.log('Error page initialization from router.js');
  
  // Set up back button functionality
  const backBtn = document.querySelector('.error-back-btn');
  if (backBtn) {
    backBtn.addEventListener('click', (e) => {
      e.preventDefault();
      // Go back to previous page or home
      if (window.history.length > 1) {
        window.history.back();
      } else {
        navigateTo('home');
      }
    });
  }

  // Set up retry button if it exists
  const retryBtn = document.querySelector('.error-retry-btn');
  if (retryBtn) {
    retryBtn.addEventListener('click', (e) => {
      e.preventDefault();
      window.location.reload();
    });
  }
}

// Expose functions globally
window.navigateTo = navigateTo;
window.updateUIForAuthState = updateAuthUI;
window.showErrorPage = showErrorPage;
