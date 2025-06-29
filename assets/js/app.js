import { checkUserSession, updateAuthUI, clearUserSession } from './authutils.js';

// Simple appState (back to your working version)
window.appState = {
  user: null,
  token: null,
  isAuthenticated: false
};

document.addEventListener('DOMContentLoaded', async () => {
  initializeApp();
  setupEventListeners();
  setupHamburgerMenu();

  // ✅ CRITICAL FIX: Wait for session check to complete BEFORE routing
  console.log('🔄 Checking session before routing...');
  await checkUserSession();
  console.log('✅ Session check complete, auth status:', window.appState.isAuthenticated);

  // ✅ Now it's safe to initialize the router
  if (window.initializeRouterAfterAuth) {
    window.initializeRouterAfterAuth();
  }
});

function initializeApp() {
  console.log('App initialized');
}

function setupEventListeners() {
  document.body.addEventListener('click', e => {
    // Use closest() to find the nav-link element with data-page
    const navLink = e.target.closest('.nav-link[data-page]');
    
    if (navLink) {
      e.preventDefault();
      const page = navLink.dataset.page;
      
      // Add safety check
      if (page) {
        window.navigateTo ? window.navigateTo(page) : window.location.hash = `#/${page}`;
      } else {
        console.error('Nav link found but no data-page attribute:', navLink);
      }
    }
  });
}

function setupHamburgerMenu() {
  const hamburgerBtn = document.querySelector('#navbarToggle');
  const navbarCollapse = document.querySelector('.navbar-collapse');

  if (hamburgerBtn && navbarCollapse) {
    hamburgerBtn.addEventListener('click', (e) => {
      e.preventDefault();
      navbarCollapse.classList.toggle('show');
      const expanded = hamburgerBtn.getAttribute('aria-expanded') === 'true' || false;
      hamburgerBtn.setAttribute('aria-expanded', !expanded);
    });

    document.addEventListener('click', (e) => {
      if (
        navbarCollapse.classList.contains('show') &&
        !navbarCollapse.contains(e.target) &&
        !hamburgerBtn.contains(e.target)
      ) {
        navbarCollapse.classList.remove('show');
        hamburgerBtn.setAttribute('aria-expanded', 'false');
      }
    });

    const navLinks = navbarCollapse.querySelectorAll('.nav-link');
    navLinks.forEach((link) => {
      link.addEventListener('click', () => {
        if (navbarCollapse.classList.contains('show')) {
          navbarCollapse.classList.remove('show');
          hamburgerBtn.setAttribute('aria-expanded', 'false');
        }
      });
    });
  }
}
