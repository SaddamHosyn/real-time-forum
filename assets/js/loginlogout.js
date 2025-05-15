document.addEventListener('DOMContentLoaded', () => {
  updateAuthUI();
  
  // Check for existing session on page load
  checkSession();
});

async function checkSession() {
  try {
    const response = await fetch('/api/check-session', {
      credentials: 'same-origin'
    });
    
    if (response.ok) {
      const data = await response.json();
      if (data.authenticated) {
        // User is logged in
        localStorage.setItem('user', JSON.stringify(data.user));
        updateAuthUI(true);
      } else {
        // User is not logged in
        updateAuthUI(false);
      }
    }
  } catch (error) {
    console.error('Session check failed:', error);
    updateAuthUI(false);
  }
}

function updateAuthUI(isLoggedIn) {
  const accountButtons = document.getElementById('account-buttons');
  const authButtons = document.getElementById('registerlogin-buttons');
  
  if (isLoggedIn) {
    if (accountButtons) accountButtons.classList.remove('d-none');
    if (authButtons) authButtons.classList.add('d-none');
  } else {
    if (accountButtons) accountButtons.classList.add('d-none');
    if (authButtons) authButtons.classList.remove('d-none');
  }
}

// Add logout functionality
async function handleLogout() {
  try {
    const response = await fetch('/api/logout', {
      method: 'POST',
      credentials: 'same-origin'
    });
    
    if (response.ok) {
      localStorage.removeItem('user');
      localStorage.removeItem('session_token');
      updateAuthUI(false);
      
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
