// app.js

import { checkUserSession, updateAuthUI, clearUserSession } from './authutils.js'; // ✅ Added clearUserSession import


// ✅ Initialize appState early before anything else uses it
window.appState = {
  user: null,
  token: null
};


document.addEventListener('DOMContentLoaded', () => {
  initializeApp();
  setupEventListeners();
  checkUserSession();
});

function initializeApp() {
  console.log('App initialized');
}

function setupEventListeners() {
  const logoutBtn = document.getElementById('logout-btn');

  if (logoutBtn) {
    logoutBtn.addEventListener('click', logoutUser);
  }

  document.body.addEventListener('click', e => {
    if (e.target.matches('.nav-link')) {
      e.preventDefault();
      const page = e.target.dataset.page;
      window.navigateTo ? window.navigateTo(page) : window.location.hash = `#/${page}`;
    }
  });
}

async function logoutUser() {
  try {
    const response = await fetch('/api/logout', {
      method: 'POST',
      credentials: 'same-origin'
    });

    if (response.ok) {
      clearUserSession();
    } else {
      console.error('Logout failed with status:', response.status);
      clearUserSession();
    }
  } catch (error) {
    console.error('Logout failed:', error);
    clearUserSession();
  }

  updateAuthUI();
  window.navigateTo ? window.navigateTo('home') : window.location.hash = '#/home';
}
