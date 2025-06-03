// auth.js

import { saveUserSession, updateAuthUI, clearUserSession } from './authutils.js';

async function handleLogin(form, errorElementId = 'login-error') {
  const identity = form.querySelector('#login-identity')?.value.trim();
  const password = form.querySelector('#login-password')?.value;

  let errorElement = document.getElementById(errorElementId);
  if (!errorElement) {
    errorElement = document.createElement('p');
    errorElement.id = errorElementId;
    errorElement.className = 'text-danger mt-3';
    form.appendChild(errorElement);
  }

  if (!identity || !password) {
    errorElement.textContent = 'Please fill in all fields';
    return;
  }

  try {
    const response = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'same-origin', // crucial to get cookie from server
      body: JSON.stringify({ identity, password }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || 'Login failed');
    }

    const data = await response.json();
    saveUserSession(data.user); // This now also sets isAuthenticated = true
    updateAuthUI();

    const redirect = localStorage.getItem('redirectAfterLogin') || 'home';
    localStorage.removeItem('redirectAfterLogin');
    window.navigateTo ? window.navigateTo(redirect) : (window.location.hash = `#/${redirect}`);
  } catch (error) {
    errorElement.textContent = error.message;
    console.error('Login error:', error);
  }
}

// Enhanced logout function
async function handleLogout() {
  try {
    const response = await fetch('/api/logout', {
      method: 'POST',
      credentials: 'same-origin',
    });

    if (response.ok) {
      console.log('Logout successful');
    } else {
      console.warn('Logout failed on server:', await response.text());
    }
  } catch (error) {
    console.error('Logout request failed:', error);
  }

  // Clear session and update UI
  clearUserSession(); // This now also sets isAuthenticated = false
  updateAuthUI();

  // Show logout message
  const logoutMessage = document.getElementById('logout-message');
  if (logoutMessage) {
    logoutMessage.textContent = 'You have been logged out successfully';
    logoutMessage.classList.remove('d-none');
    setTimeout(() => {
      logoutMessage.classList.add('d-none');
    }, 3000);
  }

  // Navigate to signin or home
  window.navigateTo ? window.navigateTo('signin') : (window.location.hash = '#/signin');
}

window.handleLogin = handleLogin;
window.handleLogout = handleLogout;
