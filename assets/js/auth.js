// Shared Login Function
async function handleLogin(form, errorElementId = 'login-error') {
  const identityInput = form.querySelector('#login-identity');
  const passwordInput = form.querySelector('#login-password');

  const identity = identityInput?.value.trim() || '';
  const password = passwordInput?.value || '';

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
      body: JSON.stringify({ identity, password }), // ✔️ Only send relevant data
      credentials: 'include'
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || 'Login failed');
    }

    const data = await response.json();
    localStorage.setItem('user', JSON.stringify(data.user));
    localStorage.setItem('token', data.token);

    if (window.appState) window.appState.user = data.user;
    if (window.updateAuthUI) window.updateAuthUI();

    const redirect = localStorage.getItem('redirectAfterLogin') || 'home';
    localStorage.removeItem('redirectAfterLogin');

    if (window.navigateTo) {
      window.navigateTo(redirect);
    } else {
      window.location.hash = `#/${redirect}`;
    }
  } catch (error) {
    errorElement.textContent = error.message || 'Login failed';
    console.error('Login error:', error);
  }
}



// Register Handler
document.getElementById('register-form')?.addEventListener('submit', function (e) {
  e.preventDefault();

  const errorElement = document.getElementById('register-error');
  const formData = {
    email: this.querySelector('[name="email"]').value,
    password: this.querySelector('[name="password"]').value,
    name: this.querySelector('[name="name"]')?.value || ''
  };

  fetch('/api/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(formData),
  })
  .then(response => {
    if (response.ok) {
      window.location.hash = '#/login';
    } else {
      return response.text().then(text => {
        throw new Error(text || 'Registration failed');
      });
    }
  })
  .catch(error => {
    console.error('Error:', error);
    errorElement.textContent = error.message;
    errorElement.style.display = 'block';
  });
});

// Expose for use in signinpage.js
window.handleLogin = handleLogin;
