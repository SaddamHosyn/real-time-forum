








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
// ✅ ENHANCED LOGOUT FUNCTION - Better UX
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
    
    // ✅ ENHANCED ERROR HANDLING
    if (error.message.includes('Failed to fetch') || error.name === 'TypeError') {
      // Server is down - perform local logout anyway
      console.log('🔌 Server unavailable - performing local logout');
      
      // Clear local session data
      clearUserSession();
      
      // Update UI immediately
      updateAuthUI();
      
      // Show appropriate message
      showLogoutMessage('Logged out locally (server unavailable)');
      
      // Navigate to home
      setTimeout(() => {
        if (window.navigateTo) {
          window.navigateTo('home');
        } else {
          window.location.hash = '#/home';
        }
      }, 1000);
      
    } else {
      // Other errors - show alert and keep user logged in
      alert('Logout failed: ' + error.message);
    }
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
