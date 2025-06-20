// authutils.js - ENHANCED CHAT SYNC
if (!window.appState) {
  window.appState = { user: null, isAuthenticated: false };
}

export function saveUserSession(user) {
  console.log('💾 Saving user session and syncing chat:', user);
  localStorage.setItem('user', JSON.stringify(user));
  window.appState.user = user;
  window.appState.isAuthenticated = true;
  
  // Sync chat immediately when user logs in
  setTimeout(() => {
    console.log('🔄 Syncing chat after login...');
    if (window.updateChatForAuthStatus) {
      window.updateChatForAuthStatus();
    }
  }, 200);
}

export function clearUserSession() {
  console.log('🗑️ Clearing user session and syncing chat');
  localStorage.removeItem('user');
  window.appState.user = null;
  window.appState.isAuthenticated = false;
  
  // Sync chat immediately when user logs out
  if (window.updateChatForAuthStatus) {
    console.log('🔄 Syncing chat after logout...');
    window.updateChatForAuthStatus();
  }
}

export function isLoggedIn() {
  return !!window.appState.user && window.appState.isAuthenticated;
}

export function updateAuthUI() {
  console.log('🎨 Updating auth UI and syncing chat, isAuthenticated:', window.appState.isAuthenticated);
  
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
  
  loginRequiredElements.forEach(element => {
    if (isAuthenticated) {
      element.classList.remove('d-none');
    } else {
      element.classList.add('d-none');
    }
  });
  
  logoutRequiredElements.forEach(element => {
    if (isAuthenticated) {
      element.classList.add('d-none');
    } else {
      element.classList.remove('d-none');
    }
  });

  // ✅ CRITICAL: Sync chat with auth state changes
  setTimeout(() => {
    if (window.updateChatForAuthStatus) {
      console.log('🔄 Syncing chat from updateAuthUI...');
      window.updateChatForAuthStatus();
    }
  }, 100);
}

export async function checkUserSession() {
  console.log('🔍 Checking user session...');
  try {
    const response = await fetch('/api/check-session', {
      credentials: 'include', // Changed from 'same-origin' to 'include'
    });

    if (response.ok) {
      const data = await response.json();
      console.log('📡 Session check response:', data);
      if (data.authenticated && data.user) {
        // Restore user session immediately
        localStorage.setItem('user', JSON.stringify(data.user));
        window.appState.user = data.user;
        window.appState.isAuthenticated = true;
        console.log('✅ Session restored for user:', data.user.username);
      } else {
        clearUserSession();
      }
    } else {
      console.log('❌ Session check failed with status:', response.status);
      clearUserSession();
    }
  } catch (error) {
    console.error('❌ Session check error:', error);
    clearUserSession();
  }

  updateAuthUI();
  return window.appState.isAuthenticated; // Return the auth status
}

// Expose functions globally
window.checkUserSession = checkUserSession;
window.updateAuthUI = updateAuthUI;
window.isLoggedIn = isLoggedIn;
window.updateUIForAuthState = updateAuthUI;
window.saveUserSession = saveUserSession;
window.clearUserSession = clearUserSession;
