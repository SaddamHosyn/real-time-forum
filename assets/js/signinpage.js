// signinpage.js - REMOVE THE LOGOUT FUNCTION FROM HERE
/*
function initializeSignInPage() {
  console.log('Initializing sign-in page');
  
  // Only clear session if we're explicitly on signin page (not from redirect)
  const urlParams = new URLSearchParams(window.location.search);
  if (!urlParams.has('redirectAfterLogin')) {
    clearSessionCookie();
  }
  
  setupCloseButton();
  setupLoginForm();
  setTimeout(reinforceCloseButtonHandler, 200);
}

function clearSessionCookie() {
  document.cookie = "session_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
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
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ identity, password }),
      credentials: 'include',
    });

    const result = await response.json();

    if (response.ok) {
      // Store user info in localStorage
      localStorage.setItem('user', JSON.stringify(result.user));
      
      // Update global app state
      if (window.appState) {
        window.appState.user = result.user;
        window.appState.isAuthenticated = true;
      }
      
      // Update UI for authenticated state
      if (window.updateAuthUI) {
        window.updateAuthUI();
      }
      
      // Navigate to redirect page or feed
      const redirectPage = localStorage.getItem('redirectAfterLogin') || 'feed';
      localStorage.removeItem('redirectAfterLogin');
      
      if (window.navigateTo) {
        window.navigateTo(redirectPage);
      } else {
        window.location.hash = `#/${redirectPage}`;
      }
    } else {
      if (errorElement) {
        errorElement.textContent = result.message || 'Login failed.';
        errorElement.classList.remove('d-none');
        errorElement.style.display = 'block';
      } else {
        alert(result.message || 'Login failed.');
      }
    }
  } catch (error) {
    console.error('Login error:', error);
    if (errorElement) {
      errorElement.textContent = 'An error occurred during login.';
      errorElement.classList.remove('d-none');
      errorElement.style.display = 'block';
    } else {
      alert('An error occurred during login.');
    }
  } finally {
    if (submitButton) {
      submitButton.disabled = false;
      submitButton.textContent = originalButtonText;
    }
  }
}


// Simple auth status check (keep it simple)
async function checkAuthStatus() {
  try {
    const response = await fetch('/api/check-session', {
      credentials: 'include'
    });
    
    const result = await response.json();
    
    if (result.authenticated) {
      if (window.appState) {
        window.appState.user = result.user;
        window.appState.isAuthenticated = true;
      }
      localStorage.setItem('user', JSON.stringify(result.user));
    } else {
      if (window.appState) {
        window.appState.user = null;
        window.appState.isAuthenticated = false;
      }
      localStorage.removeItem('user');
    }
    
    if (window.updateAuthUI) {
      window.updateAuthUI();
    }
  } catch (error) {
    console.error('Auth check failed:', error);
    if (window.appState) {
      window.appState.user = null;
      window.appState.isAuthenticated = false;
    }
    localStorage.removeItem('user');
  }
}

window.handleLogin = handleLogin;

window.checkAuthStatus = checkAuthStatus;
window.initializeSignInPage = initializeSignInPage;

// Only check auth on page load if not on signin page
if (!window.location.hash.includes('#/signin')) {
  document.addEventListener('DOMContentLoaded', checkAuthStatus);
}

if (window.location.hash.includes('#/signin')) {
  initializeSignInPage();
}
 

*/
 

// signinpage.js - CLEAN INITIALIZATION ONLY


function initializeSignInPage() {
  console.log('Initializing sign-in page');
  
  setupCloseButton();
  setupLoginForm();
}

function setupCloseButton() {
  const closeButton = document.getElementById('close-signin');
  if (!closeButton) {
    setTimeout(setupCloseButton, 100);
    return;
  }

  // Remove any existing listeners by cloning the button
  const newCloseButton = closeButton.cloneNode(true);
  closeButton.parentNode.replaceChild(newCloseButton, closeButton);
  
  // Add single event listener
  newCloseButton.addEventListener('click', function(e) {
    e.preventDefault();
    e.stopPropagation();
    if (window.navigateTo) {
      window.navigateTo('home');
    } else {
      window.location.hash = '#/home';
    }
  });
}

function setupLoginForm() {
  const loginForm = document.getElementById('login-form');
  if (!loginForm) {
    setTimeout(setupLoginForm, 100);
    return;
  }

  // Remove any existing listeners by cloning the form
  const newForm = loginForm.cloneNode(true);
  loginForm.parentNode.replaceChild(newForm, loginForm);

  // Set up SINGLE submit handler
  newForm.addEventListener('submit', function(e) {
    e.preventDefault();
    e.stopPropagation();
    window.handleLogin(newForm, 'login-error-message');
  });

  // Setup register link
  const showRegisterLink = newForm.querySelector('#show-register');
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

// Global exposure
window.initializeSignInPage = initializeSignInPage;
