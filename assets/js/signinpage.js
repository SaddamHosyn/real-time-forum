// signinpage.js

// This is the main initialization function
function initializeSignInPage() {
  console.log('Initializing sign-in page');
  
  // Set up the close button first - with multiple approaches for reliability
  setupCloseButton();
  
  // Then set up the rest of the form
  setupLoginForm();
  
  // Set up additional close button handler via direct DOM event
  setTimeout(reinforceCloseButtonHandler, 200);
}

// Set up close button with multiple approaches
function setupCloseButton() {
  const closeButton = document.getElementById('close-signin');
  if (closeButton) {
    console.log('Close button found, setting up handlers');
    
    // Clear any existing handlers first
    closeButton.onclick = null;
    
    // Method 1: Direct onclick property
    closeButton.onclick = function(e) {
      e.preventDefault();
      e.stopPropagation();
      console.log('Close button clicked via onclick property');
      navigateToHome();
      return false;
    };
    
    // Method 2: addEventListener
    closeButton.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      console.log('Close button clicked via addEventListener');
      navigateToHome();
    });
    
    // Make it visually clear it's clickable
    closeButton.style.cursor = 'pointer';
    
    // Add debug classes
    closeButton.classList.add('close-button-initialized');
  } else {
    console.error('Close button not found with ID "close-signin", will retry shortly');
    // Try again in a moment
    setTimeout(setupCloseButton, 100);
  }
}

// Extra reinforcement for the close button handler
function reinforceCloseButtonHandler() {
  const closeButton = document.getElementById('close-signin');
  if (closeButton) {
    console.log('Reinforcing close button handler');
    
    // Add inline handler as a last resort
    closeButton.setAttribute('onclick', "event.preventDefault(); event.stopPropagation(); console.log('Close via inline handler'); window.location.hash = '#/home'; return false;");
    
    // Make sure it's styled to look clickable
    closeButton.style.cursor = 'pointer';
    closeButton.style.fontWeight = 'bold';
    
    // One more event listener with capture phase
    document.addEventListener('click', function(e) {
      if (e.target.id === 'close-signin' || e.target.closest('#close-signin')) {
        e.preventDefault();
        e.stopPropagation();
        console.log('Close button clicked via document capture listener');
        navigateToHome();
      }
    }, true);
  }
}

// Function to navigate home
function navigateToHome() {
  console.log('Navigating to home page');
  
  // Try all possible navigation methods
  if (window.navigateTo) {
    window.navigateTo('home');
  } else {
    window.location.hash = '#/home';
  }
}

// Setup the login form and other elements
function setupLoginForm() {
  const loginForm = document.getElementById('login-form');
  if (!loginForm) {
    console.error('Login form not found');
    setTimeout(setupLoginForm, 100); // Retry if form isn't found
    return;
  }
  
  console.log('Found login form, setting up event listeners');
  
  // Remove any existing listeners to prevent duplicates
  const newForm = loginForm.cloneNode(true);
  loginForm.parentNode.replaceChild(newForm, loginForm);
  
  // Add new listener
  newForm.addEventListener('submit', handleLoginSubmit);
  
  // Handle "Create account" link
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

async function handleLoginSubmit(e) {
  e.preventDefault();
  console.log('Login form submitted');
  
  const identity = document.getElementById('login-identity')?.value.trim() || '';
  const password = document.getElementById('login-password')?.value || '';
  
  // Validation
  let errorMsg = document.getElementById('login-error-message');
  if (!errorMsg) {
    errorMsg = document.createElement('p');
    errorMsg.id = 'login-error-message';
    errorMsg.className = 'text-danger mt-3';
    e.target.appendChild(errorMsg);
  }
  
  // Simple validation
  if (!identity || !password) {
    errorMsg.textContent = 'Please fill in all fields';
    return;
  }
  
  try {
    const response = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identity, password })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Login failed');
    }
    
    const data = await response.json();
    localStorage.setItem('user', JSON.stringify(data.user));
    localStorage.setItem('token', data.token);
    
    // Update the app state if possible
    if (window.appState) {
      window.appState.user = data.user;
    }
    
    // Update UI if possible
    if (window.updateAuthUI) {
      window.updateAuthUI();
    }
    
    // Redirect after login
    const redirect = localStorage.getItem('redirectAfterLogin') || 'home';
    localStorage.removeItem('redirectAfterLogin');
    
    if (window.navigateTo) {
      window.navigateTo(redirect);
    } else {
      window.location.hash = `#/${redirect}`;
    }
    
  } catch (error) {
    errorMsg.textContent = error.message || 'Login failed. Please try again.';
    console.error('Login error:', error);
  }
}

// Create a global mutation observer to watch for the close button dynamically
const observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    if (mutation.addedNodes && mutation.addedNodes.length > 0) {
      for (let i = 0; i < mutation.addedNodes.length; i++) {
        const node = mutation.addedNodes[i];
        if (node.nodeType === 1) { // ELEMENT_NODE
          const closeButton = node.querySelector('#close-signin');
          if (closeButton) {
            console.log('Close button detected by observer!');
            
            // Clear and set handlers
            closeButton.onclick = null;
            closeButton.onclick = function(e) {
              e.preventDefault();
              e.stopPropagation();
              console.log('Close button clicked via observer-added handler');
              navigateToHome();
              return false;
            };
            
            // Make it visually clear
            closeButton.style.cursor = 'pointer';
          }
        }
      }
    }
  });
});

// Start observing the document body for changes
observer.observe(document.body, { childList: true, subtree: true });

// Auto-initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOMContentLoaded in signinpage.js');
  if (window.location.hash.includes('#/signin')) {
    console.log('On signin page, initializing');
    initializeSignInPage();
  }
});

// Also initialize when script loads if we're on signin page
if (document.readyState === 'complete' || document.readyState === 'interactive') {
  console.log('Script loaded, checking if we should initialize');
  if (window.location.hash.includes('#/signin')) {
    console.log('On signin page when script loaded, initializing immediately');
    setTimeout(initializeSignInPage, 0);
  }
}

// Expose function to window for router to use
window.initializeSignInPage = initializeSignInPage;
