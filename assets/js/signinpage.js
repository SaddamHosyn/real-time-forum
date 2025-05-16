// signinpage.js
function initializeSignInPage() {
  console.log('Initializing sign-in page');
  setupCloseButton();
  setupLoginForm();
  setTimeout(reinforceCloseButtonHandler, 200);
}

function setupCloseButton() {
  const closeButton = document.getElementById('close-signin');
  if (closeButton) {
    closeButton.onclick = null;
    closeButton.onclick = function(e) {
      e.preventDefault();
      e.stopPropagation();
      navigateTo('home');
      return false;
    };
    closeButton.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      navigateTo('home');
    });
    closeButton.style.cursor = 'pointer';
    closeButton.classList.add('close-button-initialized');
  } else {
    setTimeout(setupCloseButton, 100);
  }
}

function reinforceCloseButtonHandler() {
  const closeButton = document.getElementById('close-signin');
  if (closeButton) {
    closeButton.setAttribute(
      'onclick',
      "event.preventDefault(); event.stopPropagation(); window.location.hash = '#/home'; return false;"
    );
    closeButton.style.cursor = 'pointer';
    closeButton.style.fontWeight = 'bold';

    document.addEventListener(
      'click',
      function(e) {
        if (e.target.id === 'close-signin' || e.target.closest('#close-signin')) {
          e.preventDefault();
          e.stopPropagation();
          navigateTo('home');
        }
      },
      true
    );
  }
}

function navigateToHome() {
  if (window.navigateTo) {
    window.navigateTo('home');
  } else {
    window.location.hash = '#/home';
  }
}

function setupLoginForm() {
  const loginForm = document.getElementById('login-form');
  if (!loginForm) {
    setTimeout(setupLoginForm, 100);
    return;
  }

  loginForm.setAttribute('action', 'javascript:void(0);');
  loginForm.setAttribute('method', 'post');
  loginForm.setAttribute('onsubmit', 'return false;');

  const submitButton = loginForm.querySelector('button[type="submit"], input[type="submit"]');
  if (submitButton) {
    submitButton.onclick = function(e) {
      e.preventDefault();
      e.stopPropagation();
      handleLogin(loginForm, 'login-error-message');
      return false;
    };
  }

  loginForm.addEventListener(
    'submit',
    function(e) {
      e.preventDefault();
      e.stopPropagation();
      handleLogin(loginForm, 'login-error-message');
      return false;
    },
    true
  );

  const showRegisterLink = document.getElementById('show-register');
  if (showRegisterLink) {
    showRegisterLink.addEventListener('click', (e) => {
      e.preventDefault();
      if (window.navigateTo) {
        window.navigateTo('register');
      } else {
        window.location.hash = '#/register';
      }
    });
  }
}

// Only declare observer once
const observer = window.observer || new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    mutation.addedNodes.forEach((node) => {
      if (node.nodeType === 1 && node.querySelector('#close-signin')) {
        const closeButton = node.querySelector('#close-signin');
        closeButton.onclick = null;
        closeButton.onclick = function(e) {
          e.preventDefault();
          navigateTo('home');
          return false;
        };
        closeButton.style.cursor = 'pointer';
      }
      if (node.nodeType === 1 && (node.id === 'login-form' || node.querySelector('#login-form'))) {
        setupLoginForm();
      }
    });
  });
});

if (!window.observer) {
  observer.observe(document.body, { childList: true, subtree: true });
  window.observer = observer;
}

async function handleLogin(form, errorElementId) {
  const formData = new FormData(form);
  const identity = formData.get('identity');
  const password = formData.get('password');

  console.log('Attempting login for:', identity);

  const errorElement = document.getElementById(errorElementId);
  if (errorElement) {
    errorElement.textContent = '';
    errorElement.style.display = 'none';
  }

  const submitButton = form.querySelector('button[type="submit"], input[type="submit"]');
  const originalButtonText = submitButton ? submitButton.textContent : 'Sign In';
  if (submitButton) {
    submitButton.disabled = true;
    submitButton.textContent = 'Signing in...';
  }

  try {
    const response = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identity, password }),
      credentials: 'same-origin'
    });

    if (submitButton) {
      submitButton.disabled = false;
      submitButton.textContent = originalButtonText;
    }

    if (response.ok) {
      const data = await response.json();
      localStorage.setItem('session_token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      window.userToken = data.token;

      const redirectTo = localStorage.getItem('redirectAfterLogin') || 'home';
      localStorage.removeItem('redirectAfterLogin');
      
      if (window.navigateTo) {
        window.navigateTo(redirectTo);
      } else {
        window.location.hash = `#/${redirectTo}`;
      }
    } else {
      const errorData = await response.json().catch(() => ({ message: 'Login failed. Please try again.' }));
      if (errorElement) {
        errorElement.textContent = errorData.message || 'Invalid username/email or password';
        errorElement.style.display = 'block';
      }
    }
  } catch (error) {
    console.error('Login error:', error);
    if (submitButton) {
      submitButton.disabled = false;
      submitButton.textContent = originalButtonText;
    }
    if (errorElement) {
      errorElement.textContent = 'Network error. Please try again later.';
      errorElement.style.display = 'block';
    }
  }
}

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

  localStorage.removeItem('session_token');
  localStorage.removeItem('user');
  window.userToken = null;

  if (window.navigateTo) {
    window.navigateTo('signin');
  } else {
    window.location.hash = '#/signin';
  }
}

// Expose functions globally
window.handleLogin = handleLogin;
window.handleLogout = handleLogout;
window.initializeSignInPage = initializeSignInPage;

// Initialize sign-in page
if (window.location.hash.includes('#/signin')) {
  initializeSignInPage();
}
