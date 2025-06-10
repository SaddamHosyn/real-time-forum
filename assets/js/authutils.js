// authutils.js - ENHANCED WITH CHAT DEBUG
if (!window.appState) {
  window.appState = { user: null, isAuthenticated: false };
}

export function saveUserSession(user) {
  console.log('💾 Saving user session:', user);
  localStorage.setItem('user', JSON.stringify(user));
  window.appState.user = user;
  window.appState.isAuthenticated = true;
  
  // Initialize chat for newly authenticated users
  setTimeout(() => {
    console.log('🔄 Attempting to initialize chat...');
    if (window.initializeChat) {
      console.log('✅ initializeChat function found, calling...');
      window.initializeChat();
    } else {
      console.error('❌ initializeChat function not found!');
    }
  }, 200); // Increased delay
}

export function clearUserSession() {
  console.log('🗑️ Clearing user session');
  localStorage.removeItem('user');
  window.appState.user = null;
  window.appState.isAuthenticated = false;
  
  // Destroy chat on logout
  if (window.destroyChat) {
    console.log('🔥 Destroying chat...');
    window.destroyChat();
  }
}

export function isLoggedIn() {
  return !!window.appState.user && window.appState.isAuthenticated;
}

export function updateAuthUI() {
  console.log('🎨 Updating auth UI, isAuthenticated:', window.appState.isAuthenticated);
  
  const accountButtons = document.getElementById('account-buttons');
  const loginButtons = document.getElementById('registerlogin-buttons');
  const chatContainer = document.getElementById('chatbox-container');
  const isAuthenticated = window.appState.isAuthenticated;

  if (window.appState?.user && isAuthenticated) {
    accountButtons?.classList.remove('d-none');
    loginButtons?.classList.add('d-none');
    
    // Show chatbox for authenticated users
    if (chatContainer) {
      console.log('💬 Showing chatbox for authenticated user');
      chatContainer.classList.remove('d-none');
    }
    
    // Initialize chat for authenticated users
    setTimeout(() => {
      if (window.initializeChat && !window.chatManager) {
        console.log('🚀 Initializing chat from updateAuthUI');
        window.initializeChat();
      }
    }, 100);
  } else {
    accountButtons?.classList.add('d-none');
    loginButtons?.classList.remove('d-none');
    
    // Hide chatbox for unauthenticated users
    if (chatContainer) {
      console.log('🙈 Hiding chatbox for unauthenticated user');
      chatContainer.classList.add('d-none');
    }
    
    // Destroy chat for unauthenticated users
    if (window.destroyChat) {
      window.destroyChat();
    }
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
}

export async function checkUserSession() {
  console.log('🔍 Checking user session...');
  try {
    const response = await fetch('/api/check-session', {
      credentials: 'same-origin',
    });

    if (response.ok) {
      const data = await response.json();
      console.log('📡 Session check response:', data);
      if (data.authenticated) {
        saveUserSession(data.user);
      } else {
        clearUserSession();
      }
    } else {
      console.log('❌ Session check failed');
      clearUserSession();
    }
  } catch (error) {
    console.error('❌ Session check error:', error);
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
