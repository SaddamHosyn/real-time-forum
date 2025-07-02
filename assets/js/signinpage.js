

// signinpage.js - CLEAN INITIALIZATION ONLY

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
    handleLogin(newForm, 'login-error-message');
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

// ADD THIS LOGIN HANDLER FUNCTION
// ADD THIS LOGIN HANDLER FUNCTION
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
      localStorage.setItem('user', JSON.stringify(result.user));

      if (window.appState) {
        window.appState.user = result.user;
        window.appState.isAuthenticated = true;
      }

      // ✅ FIXED: Update auth UI immediately
      if (window.updateAuthUI) {
        window.updateAuthUI();
      }

      // ✅ FIXED: Trigger chat update immediately after login
      if (window.updateChatForAuthStatus) {
        console.log('🔄 Triggering chat update after login...');
        window.updateChatForAuthStatus();
      }

      // ✅ Safe redirect logic
      const redirect = localStorage.getItem('redirectAfterLogin');
      localStorage.removeItem('redirectAfterLogin');
      const safeRedirect = redirect && redirect !== 'create-post' ? redirect : 'feed';

      if (window.navigateTo) {
        window.navigateTo(safeRedirect);
      } else {
        window.location.hash = `#/${safeRedirect}`;
      }
    } else {
      if (errorElement) {
        errorElement.textContent = result.message || 'Invalid username or password';
        errorElement.style.display = 'block';
      } else {
        alert(result.message || 'Invalid username or password');
      }
    }
  } catch (error) {
    console.error('Login error:', error);
    if (errorElement) {
      errorElement.textContent = 'Connection failed. Please try again.';
      errorElement.style.display = 'block';
    } else {
      alert('Connection failed. Please try again.');
    }
  } finally {
    if (submitButton) {
      submitButton.disabled = false;
      submitButton.textContent = originalButtonText;
    }
  }
}


// Global exposure
window.initializeSignInPage = initializeSignInPage;
window.handleLogin = handleLogin;
