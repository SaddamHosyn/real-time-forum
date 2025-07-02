// authutils.js - FIXED: No circular calls
if (!window.appState) {
  window.appState = { user: null, isAuthenticated: false };
}

// ✅ ADDED: Prevent multiple simultaneous auth updates
let isUpdatingAuth = false;

export function saveUserSession(user) {
  console.log('💾 Saving user session:', user);
  localStorage.setItem('user', JSON.stringify(user));
  window.appState.user = user;
  window.appState.isAuthenticated = true;
  
  // ✅ FIXED: Update UI immediately after login
  updateAuthUI();
  
  // ✅ FIXED: Trigger chat update immediately after login
  if (window.updateChatForAuthStatus) {
    console.log('🔄 Triggering chat update after login...');
    window.updateChatForAuthStatus();
  }
}


export function clearUserSession() {
  console.log('🗑️ Clearing user session');
  localStorage.removeItem('user');
  window.appState.user = null;
  window.appState.isAuthenticated = false;
  
  // ✅ FIXED: Single sync call with debounce
  debouncedSyncChat();
}

export function isLoggedIn() {
  return !!window.appState.user && window.appState.isAuthenticated;
}

// ✅ FIXED: Simplified updateAuthUI without circular calls
export function updateAuthUI() {
  // ✅ PREVENT: Multiple simultaneous updates
  if (isUpdatingAuth) {
    console.log('⚠️ Auth update already in progress, skipping...');
    return;
  }
  
  isUpdatingAuth = true;
  console.log('🎨 Updating auth UI, isAuthenticated:', window.appState.isAuthenticated);
  
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

  // ✅ FIXED: Reset flag after UI update
  setTimeout(() => {
    isUpdatingAuth = false;
  }, 100);
}

// ✅ FIXED: Simplified session check without circular calls
export async function checkUserSession() {
  console.log('🔍 Checking user session...');
  try {
    const response = await fetch('/api/check-session', {
      credentials: 'include',
    });

    if (response.ok) {
      const data = await response.json();
      console.log('📡 Session check response:', data);
      if (data.authenticated && data.user) {
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

  // ✅ FIXED: Only update UI once, no chat sync here
  updateAuthUI();
  
  // ✅ FIXED: Single chat sync after session check
  debouncedSyncChat();
  
  return window.appState.isAuthenticated;
}

// ✅ NEW: Debounced chat sync to prevent repeated calls
let chatSyncTimeout;
function debouncedSyncChat() {
  clearTimeout(chatSyncTimeout);
  chatSyncTimeout = setTimeout(() => {
    if (window.updateChatForAuthStatus) {
      console.log('🔄 Syncing chat (debounced)...');
      window.updateChatForAuthStatus();
    }
  }, 200);
}

// Expose functions globally
window.checkUserSession = checkUserSession;
window.updateAuthUI = updateAuthUI;
window.isLoggedIn = isLoggedIn;
window.updateUIForAuthState = updateAuthUI;
window.saveUserSession = saveUserSession;
window.clearUserSession = clearUserSession;
