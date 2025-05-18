// authUtils.js


// ✅ Defensive fallback in case appState wasn't initialized in app.js
if (!window.appState) {
  window.appState = { user: null, token: null };
}

export function saveUserSession(user, token) {
  localStorage.setItem('user', JSON.stringify(user));
  localStorage.setItem('session_token', token); // ✅ consistent key
  window.appState.user = user;
  window.appState.token = token;
}

export function clearUserSession() {
  localStorage.removeItem('user');
  localStorage.removeItem('session_token');
  window.appState.user = null;
  window.appState.token = null;
}

// ✅ ADD MISSING isLoggedIn FUNCTION
export function isLoggedIn() {
  return !!(window.appState && window.appState.user);
}

export function updateAuthUI() {
  const accountButtons = document.getElementById('account-buttons');
  const loginButtons = document.getElementById('registerlogin-buttons');

  if (window.appState?.user) {
    if (accountButtons) accountButtons.classList.remove('d-none');
    if (loginButtons) loginButtons.classList.add('d-none');
  } else {
    if (accountButtons) accountButtons.classList.add('d-none');
    if (loginButtons) loginButtons.classList.remove('d-none');
  }

  const authElements = document.querySelectorAll('[data-auth]');
  authElements.forEach(el => {
    const showWhenAuthed = el.dataset.auth === 'true';
    el.classList.toggle('d-none', showWhenAuthed !== !!window.appState.user);
  });
}

export async function checkUserSession() {
  try {
    const token = localStorage.getItem('session_token');
    const userData = localStorage.getItem('user');

    if (token && userData) {
      const response = await fetch('/api/check-session', {
        headers: { 'Authorization': `Bearer ${token}` },
        credentials: 'same-origin'
      });

      if (response.ok) {
        const data = await response.json();
        if (data.authenticated) {
          saveUserSession(JSON.parse(userData), token);
        } else {
          clearUserSession();
        }
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
window.updateAuthUI = updateAuthUI;
window.checkUserSession = checkUserSession;
window.isLoggedIn = isLoggedIn; // ✅ Expose to global window object
