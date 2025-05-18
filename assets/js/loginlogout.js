// loginlogout.js
import { updateAuthUI, checkUserSession, clearUserSession } from './authutils.js';

document.addEventListener('DOMContentLoaded', () => {
  checkUserSession(); // Replaces old checkSession + updateAuthUI
});

// Add logout functionality
async function handleLogout() {
  try {
    const response = await fetch('/api/logout', {
      method: 'POST',
      credentials: 'same-origin'
    });

    if (response.ok) {
      clearUserSession();
      updateAuthUI();

      // Redirect to home
      if (window.navigateTo) {
        window.navigateTo('home');
      } else {
        window.location.hash = '#/home';
      }
    }
  } catch (error) {
    console.error('Logout failed:', error);
  }
}

// Attach logout handler
const logoutBtn = document.getElementById('logout-btn');
if (logoutBtn) {
  logoutBtn.addEventListener('click', handleLogout);
}
