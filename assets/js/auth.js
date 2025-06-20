


// auth.js - SINGLE LOGIN HANDLER
import { saveUserSession, updateAuthUI, clearUserSession } from './authutils.js';

let isLoginInProgress = false; // Prevent double submissions

async function handleLogin(formElement, errorElementId = 'login-error') {
  // Prevent multiple simultaneous login attempts
  if (isLoginInProgress) {
    console.log('Login already in progress, ignoring duplicate request');
    return;
  }

  isLoginInProgress = true;

  const form = formElement instanceof FormData ? formElement : new FormData(formElement);
  const identity = form.get ? form.get('identity') : formElement.querySelector('#login-identity')?.value.trim();
  const password = form.get ? form.get('password') : formElement.querySelector('#login-password')?.value;

  let errorElement = document.getElementById(errorElementId);
  if (!errorElement) {
    errorElement = document.createElement('div');
    errorElement.id = errorElementId;
    errorElement.className = 'alert alert-danger mt-3 d-none';
    formElement.appendChild(errorElement);
  }

  // Clear previous errors
  errorElement.textContent = '';
  errorElement.classList.add('d-none');

  if (!identity || !password) {
    showError(errorElement, 'Please fill in all fields');
    isLoginInProgress = false;
    return;
  }

  const submitButton = formElement.querySelector('button[type="submit"], input[type="submit"]');
  const originalText = submitButton?.textContent || 'Sign In';
  
  try {
    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = 'Signing in...';
    }

    console.log('Attempting login for:', identity);

    const response = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include', // Important for cookies
      body: JSON.stringify({ identity, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Login failed');
    }

    // Success - save session and update UI
    saveUserSession(data.user);
    updateAuthUI();

    // Handle redirect
    const redirectPage = localStorage.getItem('redirectAfterLogin') || 'feed';
    localStorage.removeItem('redirectAfterLogin');
    
    // Clear form
    formElement.reset();
    
    // Navigate
    if (window.navigateTo) {
      window.navigateTo(redirectPage);
    } else {
      window.location.hash = `#/${redirectPage}`;
    }

  } catch (error) {
    console.error('Login error:', error);
    showError(errorElement, error.message || 'An error occurred during login');
  } finally {
    if (submitButton) {
      submitButton.disabled = false;
      submitButton.textContent = originalText;
    }
    isLoginInProgress = false;
  }
}

function showError(errorElement, message) {
  errorElement.textContent = message;
  errorElement.classList.remove('d-none');
}

// Global exposure
window.handleLogin = handleLogin;
export { handleLogin };





