// app.js
// Centralized state 
let appState = {
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

async function checkUserSession() {
  try {
    // Check localStorage first
    const token = localStorage.getItem('session_token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      // Verify with server
      const response = await fetch('/api/check-session', {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        credentials: 'same-origin'
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.authenticated) {
          appState.user = JSON.parse(userData);
          appState.token = token;
        } else {
          // Server says session is invalid
          clearSessionData();
        }
      } else {
        // Network error or server error
        clearSessionData();
      }
    } else {
      // No session data in localStorage
      clearSessionData();
    }
  } catch (error) {
    console.error('Session check failed:', error);
    clearSessionData();
  }
  
  updateUIForAuthState();
}

function clearSessionData() {
  localStorage.removeItem('user');
  localStorage.removeItem('session_token');
  appState.user = null;
  appState.token = null;
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

async function logoutUser() {
  try {
    const response = await fetch('/api/logout', {
      method: 'POST',
      credentials: 'same-origin'
    });
    
    if (response.ok) {
      clearSessionData();
      updateUIForAuthState();
      
      if (window.navigateTo) {
        window.navigateTo('home');
      } else {
        window.location.hash = '#/home';
      }
    } else {
      console.error('Logout failed with status:', response.status);
      // Still clear local data even if server logout failed
      clearSessionData();
      updateUIForAuthState();
    }
  } catch (error) {
    console.error('Logout failed:', error);
    // Clear local data on error too
    clearSessionData();
    updateUIForAuthState();
  }
}

// Make these functions available globally
window.appState = appState;
window.updateUIForAuthState = updateUIForAuthState;
window.checkUserSession = checkUserSession;
