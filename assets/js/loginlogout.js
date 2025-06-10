// loginlogout.js

/*

import { updateAuthUI, checkUserSession, clearUserSession } from './authutils.js';

document.addEventListener('DOMContentLoaded', () => {
  checkUserSession();
  waitForLogoutButton(); // wait until logout button is really in the DOM
});

window.addEventListener('hashchange', () => {
  waitForLogoutButton();
});

// ✅ Wait and bind logout button when available in DOM
function waitForLogoutButton() {
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn && !logoutBtn.dataset.bound) {
    logoutBtn.addEventListener('click', handleLogout);
    logoutBtn.dataset.bound = 'true';
    console.log('✅ Logout button bound!');
  } else {
    setTimeout(waitForLogoutButton, 300);
  }
}

// ✅ The actual logout request + feedback
async function handleLogout(e) {
  e?.preventDefault();

  try {
    const response = await fetch('/api/logout', {
      method: 'POST',
      credentials: 'same-origin'
    });

    if (response.ok) {
      const result = await response.json();
      console.log('✅ Logout Response:', result);

      // ✅ Clear session and auth UI
      clearUserSession();
      updateAuthUI();

      // ✅ Set logout message to be shown on home page
      window.logoutSuccessMessage = result.message;

      // ✅ Navigate to home
      if (window.navigateTo) {
        window.navigateTo('home');
      } else {
        window.location.hash = '#/home';
      }
    } else {
      const err = await response.text();
      console.warn('❌ Logout failed:', err);
      alert('Logout failed: ' + err);
    }
  } catch (error) {
    console.error('❌ Logout request error:', error);
    alert('Logout error: ' + error.message);
  }
}
  



*/




























// loginlogout.js - FIXED VERSION WITH GLOBAL EXPOSURE
import { updateAuthUI, checkUserSession, clearUserSession } from './authutils.js';

document.addEventListener('DOMContentLoaded', () => {
  console.log('LoginLogout.js loaded');
  checkUserSession();
  setupLogoutHandlers();
});

function setupLogoutHandlers() {
  // Wait for logout button to be available in DOM
  const checkForButton = () => {
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn && !logoutBtn.dataset.handlerBound) {
      // Remove onclick attribute to avoid conflicts
      logoutBtn.removeAttribute('onclick');
      
      // Add event listener
      logoutBtn.addEventListener('click', handleLogout);
      logoutBtn.dataset.handlerBound = 'true';
      console.log('✅ Logout button handler bound via addEventListener');
    } else if (!logoutBtn) {
      // Try again in 200ms if button not found
      setTimeout(checkForButton, 200);
    }
  };
  
  checkForButton();
}

// ✅ MAIN LOGOUT FUNCTION
async function handleLogout(e) {
  if (e) {
    e.preventDefault();
    e.stopPropagation();
  }
  
  console.log('🔄 Logout initiated...');
  
  const logoutBtn = document.getElementById('logout-btn');
  const originalText = logoutBtn ? logoutBtn.textContent : 'Logout';
  
  try {
    // Show loading state
    if (logoutBtn) {
      logoutBtn.disabled = true;
      logoutBtn.textContent = 'Logging out...';
    }
    
    const response = await fetch('/api/logout', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      const result = await response.json();
      console.log('✅ Logout successful:', result);

      // Clear local session data
      clearUserSession();
      
      // Update UI immediately
      updateAuthUI();

      // Show success message briefly
      showLogoutMessage(result.message || 'Successfully logged out');

      // Navigate to home after a brief delay
      setTimeout(() => {
        if (window.navigateTo) {
          window.navigateTo('home');
        } else {
          window.location.hash = '#/home';
        }
      }, 1000);
      
    } else {
      const errorText = await response.text();
      console.error('❌ Logout failed:', errorText);
      throw new Error(errorText || 'Logout failed');
    }
    
  } catch (error) {
    console.error('❌ Logout error:', error);
    alert('Logout failed: ' + error.message);
  } finally {
    // Restore button state
    if (logoutBtn) {
      logoutBtn.disabled = false;
      logoutBtn.textContent = originalText;
    }
  }
}

function showLogoutMessage(message) {
  const messageEl = document.getElementById('logout-message');
  if (messageEl) {
    messageEl.textContent = message;
    messageEl.classList.remove('d-none');
    
    // Hide after 3 seconds
    setTimeout(() => {
      messageEl.classList.add('d-none');
    }, 3000);
  }
}

// ✅ EXPOSE HANDLELOGOUT GLOBALLY FOR ONCLICK HANDLERS
window.handleLogout = handleLogout;

// Re-setup handlers when navigating
window.addEventListener('hashchange', () => {
  setTimeout(setupLogoutHandlers, 100);
});
