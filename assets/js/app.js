import { checkUserSession, updateAuthUI, clearUserSession } from './authutils.js';

// Simple appState (back to your working version)
window.appState = {
  user: null,
  token: null,
  isAuthenticated: false
};

document.addEventListener('DOMContentLoaded', () => {
  initializeApp();
  setupEventListeners();
   setupHamburgerMenu();
  
  // Simple approach: just check session without complex waiting
  setTimeout(() => {
    checkUserSession();
  }, 100);
});

function initializeApp() {
  console.log('App initialized');
}

function setupEventListeners() {
  document.body.addEventListener('click', e => {
    if (e.target.matches('.nav-link')) {
      e.preventDefault();
      const page = e.target.dataset.page;
      window.navigateTo ? window.navigateTo(page) : window.location.hash = `#/${page}`;
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
