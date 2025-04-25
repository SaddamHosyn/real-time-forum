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
  // Specific element listeners
  const registerBtn = document.getElementById('open-register-modal');
  const signinBtn = document.getElementById('open-signin-page');
  const logoutBtn = document.getElementById('logout-btn');

  if (registerBtn) registerBtn.addEventListener('click', openRegisterModal);
  if (signinBtn) signinBtn.addEventListener('click', openSignInModal);
  if (logoutBtn) logoutBtn.addEventListener('click', logoutUser);

  // Event delegation
  document.body.addEventListener('click', e => {
    if (e.target.matches('.nav-link')) {
      const page = e.target.dataset.page;
      navigateTo(page);
    }
    
    if (e.target.matches('[data-modal-close]')) {
      toggleModal(e.target.closest('.modal').id, false);
    }
  });
}

function checkUserSession() {
  const userData = localStorage.getItem('user');
  appState.user = userData ? JSON.parse(userData) : null;
  
  // Specific UI updates
  if (appState.user) {
    document.getElementById('account-buttons').classList.remove('d-none');
    document.getElementById('registerlogin-buttons').classList.add('d-none');
  }
  
  // Generic auth-aware UI updates
  updateUIForAuthState();
}

function updateUIForAuthState() {
  const authElements = document.querySelectorAll('[data-auth]');
  authElements.forEach(el => {
    const showWhenAuthed = el.dataset.auth === 'true';
    el.classList.toggle('d-none', showWhenAuthed !== !!appState.user);
  });
}

// Modal functions
function openRegisterModal() {
  toggleModal('registerModal', true);
}

function openSignInModal() {
  toggleModal('login-modal', true);
}

function toggleModal(modalId, show) {
  const modal = document.getElementById(modalId);
  if (modal) modal.classList.toggle('hidden', !show);
}

function logoutUser() {
  localStorage.removeItem('user');
  appState.user = null;
  
  document.getElementById('account-buttons').classList.add('d-none');
  document.getElementById('registerlogin-buttons').classList.remove('d-none');
  updateUIForAuthState();
  
  navigateTo('home');
}
