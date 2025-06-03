// authutils.js - SIMPLIFIED VERSION

if (!window.appState) {
  window.appState = { user: null, isAuthenticated: false };
}

export function saveUserSession(user) {
  localStorage.setItem('user', JSON.stringify(user));
  window.appState.user = user;
  window.appState.isAuthenticated = true;
}

export function clearUserSession() {
  localStorage.removeItem('user');
  window.appState.user = null;
  window.appState.isAuthenticated = false;
}

export function isLoggedIn() {
  return !!window.appState.user && window.appState.isAuthenticated;
}

export function updateAuthUI() {
  const accountButtons = document.getElementById('account-buttons');
  const loginButtons = document.getElementById('registerlogin-buttons');
  const isAuthenticated = window.appState.isAuthenticated;

  if (window.appState?.user && isAuthenticated) {
    accountButtons?.classList.remove('d-none');
    loginButtons?.classList.add('d-none');
  } else {
    accountButtons?.classList.add('d-none');
    loginButtons?.classList.remove('d-none');
  }

  document.querySelectorAll('[data-auth]').forEach(el => {
    const showWhenAuthed = el.dataset.auth === 'true';
    el.classList.toggle('d-none', showWhenAuthed !== isAuthenticated);
  });

  const loginRequiredElements = document.querySelectorAll('.login-required, [data-login-required]');
  const logoutRequiredElements = document.querySelectorAll('.logout-required, [data-logout-required]');
  
  loginRequiredElements.forEach(btn => {
    btn.style.display = isAuthenticated ? 'block' : 'none';
  });
  
  logoutRequiredElements.forEach(btn => {
    btn.style.display = isAuthenticated ? 'none' : 'block';
  });

  const createPostLink = document.querySelector('a[href="#/create-post"]');
  if (createPostLink) {
    createPostLink.style.display = isAuthenticated ? 'inline-block' : 'none';
  }
}

export async function checkUserSession() {
  try {
    const response = await fetch('/api/check-session', {
      credentials: 'same-origin',
    });

    if (response.ok) {
      const data = await response.json();
      if (data.authenticated) {
        saveUserSession(data.user);
      } else {
        clearUserSession();
      }
    } else {
      clearUserSession();
    }
  } catch (error) {
    console.error('Session check failed:', error);
    clearUserSession();
  }

  updateAuthUI();
}

// Expose functions globally
window.checkUserSession = checkUserSession;
window.updateAuthUI = updateAuthUI;
window.isLoggedIn = isLoggedIn;
window.updateUIForAuthState = updateAuthUI;
window.saveUserSession = saveUserSession;
window.clearUserSession = clearUserSession;
