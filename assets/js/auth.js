import { saveUserSession, updateAuthUI } from './authutils.js';

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
      credentials: 'include',
      body: JSON.stringify({ identity, password })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || 'Login failed');
    }

    const data = await response.json();
    saveUserSession(data.user, data.token);
    updateAuthUI();

    const redirect = localStorage.getItem('redirectAfterLogin') || 'home';
    localStorage.removeItem('redirectAfterLogin');
    window.navigateTo ? window.navigateTo(redirect) : window.location.hash = `#/${redirect}`;

  } catch (error) {
    errorElement.textContent = error.message;
    console.error('Login error:', error);
  }
}

window.handleLogin = handleLogin;
