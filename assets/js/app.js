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
