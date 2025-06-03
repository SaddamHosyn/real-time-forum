// loginlogout.js
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
