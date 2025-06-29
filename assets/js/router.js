// router.js - FINAL VERSION FOR SPA FORUM PROJECT (with deferred router initialization)
import { updateAuthUI, isLoggedIn } from './authutils.js';

const routes = {
  'home': { template: 'home-template', authRequired: false, script: '/assets/js/home.js', init: initializeHomePage },
  'store': { template: 'store-template', authRequired: false, script: '/assets/js/findastore.js', init: initializeStorePage },
  'topicsbar': { template: 'topicsbar-template', authRequired: true, script: '/assets/js/topicsbar.js', init: initializeTopicsBarPage },
  'my-account': { template: 'account-page-template', authRequired: true, script: '/assets/js/account.js', init: initializeAccountPage },
  'signin': { template: 'signin-template', authRequired: false, script: '/assets/js/signinpage.js', init: initializeSignInPage },
  'register': { template: 'register-template', authRequired: false, script: '/assets/js/registerfront.js', init: initializeRegisterPage },
  'feed': { template: 'forum-feed-template', authRequired: true, init: initializeFeedPage },
  'create-post': { template: 'template-create-post', authRequired: true, script: '/assets/js/createpost.js', init: initializeCreatePostPage }
};

const loadedScripts = new Set();
let isNavigating = false;

function validateHashRoute() {
  const hash = window.location.hash.slice(1) || '/';
  const cleanHash = hash.startsWith('/') ? hash.slice(1) : hash;
  const segments = cleanHash.split('/').filter(Boolean);
  const baseRoute = segments[0];
  const validRoutes = Object.keys(routes);
  const dynamicRoutes = ['topic'];

  if (!validRoutes.includes(baseRoute) && !dynamicRoutes.includes(baseRoute)) return false;
  if (validRoutes.includes(baseRoute) && segments.length > 1) return false;
  if (dynamicRoutes.includes(baseRoute) && (segments.length !== 2 || !segments[1])) return false;

  return true;
}

function handleFallbackRoute() {
  const hash = window.location.hash;
  if (!hash || hash === '#' || hash === '#/') return navigateTo('home');
  if (!hash.startsWith('#/')) return showErrorPage(404, 'Invalid page format.');
  handleRoute(getCurrentRoute());
}

function showErrorPage(errorCode = 404, customMessage = null) {
  console.log(`Showing error page: ${errorCode}`);
  if (window.renderErrorPage) window.renderErrorPage(errorCode, customMessage);
  else console.error('renderErrorPage function not available');
}

function getCurrentRoute() {
  const hash = window.location.hash || '#/home';
  return hash.slice(2) || 'home';
}

function handleRoute(route) {
  if (isNavigating) return;
  isNavigating = true;
  document.querySelectorAll('.view').forEach(section => section.classList.add('d-none'));

  if (route.startsWith('topic/')) {
    const topicSlug = route.split('/')[1];
    if (topicSlug) return handleTopicRoute(topicSlug);
  }

  const [page] = route.split('/').filter(Boolean);
  const routeConfig = routes[page];
  if (!routeConfig) return showErrorPage(404, `The page "${page}" was not found.`);

  if (routeConfig.authRequired && !isLoggedIn()) {
    localStorage.setItem('redirectAfterLogin', page);
    alert('Please sign in to access this page.');
    isNavigating = false;
    return navigateTo('signin');
  }

  loadPage(page, routeConfig)
    .then(() => isNavigating = false)
    .catch(err => {
      console.error('Error loading page:', err);
      isNavigating = false;
      showErrorPage(500, 'Failed to load the page. Please try again.');
    });
}

function handleTopicRoute(topicSlug) {
  if (!isLoggedIn()) {
    localStorage.setItem('redirectAfterLogin', `topic/${topicSlug}`);
    alert('Please sign in to view topic posts');
    isNavigating = false;
    return navigateTo('signin');
  }
  const template = document.getElementById('topic-posts-template');
  if (!template) return;
  injectTemplateContent(template);
  setTimeout(() => {
    if (typeof window.renderPostsForTopic === 'function') window.renderPostsForTopic(topicSlug);
    updateAuthUI();
    isNavigating = false;
  }, 100);
}

function loadPage(page, routeConfig = routes[page]) {
  return new Promise((resolve, reject) => {
    const template = document.getElementById(routeConfig.template);
    if (!template) return reject(new Error(`Template not found: ${routeConfig.template}`));

    injectTemplateContent(template);
    const scriptPromise = routeConfig.script && !loadedScripts.has(routeConfig.script)
      ? loadScript(routeConfig.script)
      : Promise.resolve();

    scriptPromise.then(() => {
      setTimeout(() => {
        try {
          if (routeConfig.init) routeConfig.init();
          updateAuthUI();
          resolve();
        } catch (error) {
          reject(error);
        }
      }, 100);
    }).catch(reject);

    if (routeConfig.script) loadedScripts.add(routeConfig.script);
  });
}

function navigateTo(page) {
  // Add null/undefined check
  if (!page || typeof page !== 'string') {
    console.error('navigateTo called with invalid page:', page);
    return showErrorPage(404, 'Invalid page specified.');
  }
  
  if (!routes[page] && !page.startsWith('topic/')) {
    return showErrorPage(404, `The page "${page}" does not exist.`);
  }
  
  window.location.hash = `/${page}`;
}

function injectTemplateContent(template) {
  const container = document.getElementById('app-content');
  if (!container) return;
  container.innerHTML = '';
  container.appendChild(document.importNode(template.content, true));
}

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

function initializeHomePage() {
  if (typeof window.initializeHomePage === 'function') window.initializeHomePage();
}
function initializeStorePage() {
  if (typeof window.renderStoreList === 'function') window.renderStoreList();
  else if (typeof renderStoreList === 'function') renderStoreList();
}
function initializeTopicsBarPage() {
  if (typeof window.initializeTopicsBarPage === 'function') window.initializeTopicsBarPage();
}
function initializeAccountPage() {
  if (typeof window.initializeAccountPage === 'function') window.initializeAccountPage();
}
function initializeSignInPage() {
  if (typeof window.initializeSignInPage === 'function') window.initializeSignInPage();
}
function initializeRegisterPage() {
  if (typeof window.setupRegisterPage === 'function') window.setupRegisterPage();
  else if (typeof window.initializeRegisterPage === 'function') window.initializeRegisterPage();
}
function initializeFeedPage() {
  if (isLoggedIn()) {
    if (typeof window.loadFeedContent === 'function') window.loadFeedContent();
    else if (typeof loadFeedContent === 'function') loadFeedContent();
  }
}
function initializeCreatePostPage() {
  if (typeof window.initializeCreatePostPage === 'function') window.initializeCreatePostPage();
}

window.navigateTo = navigateTo;
window.updateUIForAuthState = updateAuthUI;
window.showErrorPage = showErrorPage;
window.handleFallbackRoute = handleFallbackRoute;

// ✅ NEW: Defer router start until auth session is checked
window.initializeRouterAfterAuth = function () {
  const urlParams = new URLSearchParams(window.location.search);
  const errorParam = urlParams.get('error');
  if (errorParam && !isNaN(errorParam)) {
    setTimeout(() => {
      if (window.renderErrorPage) window.renderErrorPage(Number(errorParam));
    }, 100);
    return;
  }

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
        loadPage('create-post').then(() => {
          const appContent = document.getElementById('app-content');
          if (appContent) appContent.classList.add('blurred');

          localStorage.setItem('redirectAfterLogin', 'create-post');

          setTimeout(() => {
            alert('You must be logged in to create a post.');

            if (appContent) appContent.classList.remove('blurred');

            navigateTo('signin');
          }, 50);
        });
      }
    }

  });

  window.addEventListener('hashchange', () => {
    const currentRoute = getCurrentRoute();
    if (!validateHashRoute()) {
      showErrorPage(404, `The page "${currentRoute}" was not found.`);
      return;
    }
    handleRoute(currentRoute);
  });
};
