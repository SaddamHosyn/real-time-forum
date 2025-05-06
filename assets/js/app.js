// app.js
// Centralized state 
let appState = {
  user: null
};

document.addEventListener('DOMContentLoaded', () => {
  initializeApp();
  setupEventListeners();
  checkUserSession();
});

function initializeApp() {
  console.log('App initialized');
  // Any other initialization code
}

function setupEventListeners() {
  // Specific element listeners for navigation
  const registerBtn = document.getElementById('open-register-modal');
  const signinBtn = document.getElementById('open-signin-page');
  const logoutBtn = document.getElementById('logout-btn');
  
  if (registerBtn) {
    registerBtn.addEventListener('click', (e) => {
      e.preventDefault();
      if (window.navigateTo) {
        window.navigateTo('register');
      } else {
        window.location.hash = '#/register';
      }
    });
  }
  
  if (signinBtn) {
    signinBtn.addEventListener('click', (e) => {
      e.preventDefault();
      console.log('Sign-in button clicked from app.js');
      if (window.navigateTo) {
        window.navigateTo('signin');
      } else {
        window.location.hash = '#/signin';
      }
    });
  }
  
  if (logoutBtn) {
    logoutBtn.addEventListener('click', logoutUser);
  }
  
  // Global nav links
  document.body.addEventListener('click', e => {
    if (e.target.matches('.nav-link')) {
      e.preventDefault();
      const page = e.target.dataset.page;
      if (window.navigateTo) {
        window.navigateTo(page);
      } else {
        window.location.hash = `#/${page}`;
      }
    }
  });
}

function checkUserSession() {
  try {
    const userData = localStorage.getItem('user');
    appState.user = userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error('Failed to parse user data from localStorage', error);
    appState.user = null;
  }
  
  updateUIForAuthState();
}

function updateUIForAuthState() {
  // Update the account/login buttons display
  const accountButtons = document.getElementById('account-buttons');
  const loginButtons = document.getElementById('registerlogin-buttons');
  
  if (appState.user) {
    if (accountButtons) accountButtons.classList.remove('d-none');
    if (loginButtons) loginButtons.classList.add('d-none');
  } else {
    if (accountButtons) accountButtons.classList.add('d-none');
    if (loginButtons) loginButtons.classList.remove('d-none');
  }
  
  // Update any other auth-dependent elements
  const authElements = document.querySelectorAll('[data-auth]');
  authElements.forEach(el => {
    const showWhenAuthed = el.dataset.auth === 'true';
    el.classList.toggle('d-none', showWhenAuthed !== !!appState.user);
  });
}

function logoutUser() {
  localStorage.removeItem('user');
  localStorage.removeItem('token');
  appState.user = null;
  
  updateUIForAuthState();
  
  if (window.navigateTo) {
    window.navigateTo('home');
  } else {
    window.location.hash = '#/home';
  }
}

// Make these functions available globally
window.appState = appState;
window.updateUIForAuthState = updateUIForAuthState;
