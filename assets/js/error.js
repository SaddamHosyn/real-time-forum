document.addEventListener('DOMContentLoaded', function () {
  function renderErrorPage(errorCode, customMessage = null) {
    let template;

    switch (errorCode) {
      case 400:
        template = document.getElementById('error-400-template');
        break;
      case 401:
        template = document.getElementById('error-401-template');
        break;
      case 403:
        template = document.getElementById('error-403-template');
        break;
      case 404:
        template = document.getElementById('error-404-template');
        break;
      
      case 500:
        template = document.getElementById('error-500-template');
        break;
      default:
        template = document.getElementById('error-404-template');
    }

    if (!template) return;

    const errorClone = document.importNode(template.content, true);
    
    // Update error content with dynamic data
    const errorData = {
      400: { title: "Bad Request", icon: "⚠️" },
      401: { title: "Unauthorized", icon: "🔒" },
      403: { title: "Forbidden", icon: "🚫" },
      404: { title: "Page Not Found", icon: "🔍" },
      500: { title: "Server Error", icon: "💥" }
    };

    const error = errorData[errorCode] || errorData[404];
    
    // Update error content elements if they exist
    const iconEl = errorClone.getElementById('error-icon');
    const codeEl = errorClone.getElementById('error-code');
    const titleEl = errorClone.getElementById('error-title');
    const messageEl = errorClone.getElementById('error-message');
    
    if (iconEl) iconEl.textContent = error.icon;
    if (codeEl) codeEl.textContent = errorCode;
    if (titleEl) titleEl.textContent = error.title;
    if (messageEl) {
      messageEl.textContent = customMessage || getDefaultMessage(errorCode);
    }

    // REMOVED: Retry button logic for 500 errors
    // REMOVED: Back button logic

    const app = document.getElementById('app-content');
    if (app) {
      app.innerHTML = '';
      app.appendChild(errorClone);
    }
  }

  function getDefaultMessage(errorCode) {
    const messages = {
      400: "The server could not understand your request.",
      401: "You need to sign in to access this page.",
      403: "You don't have permission to access this page.",
      404: "The page you are looking for does not exist.",
     
      500: "Something went wrong on our end. Please try again later."
    };
    return messages[errorCode] || messages[404];
  }

  // Handle URL error parameters
  const errorParam = new URLSearchParams(window.location.search).get("error");
  if (errorParam && !isNaN(errorParam)) {
    renderErrorPage(Number(errorParam));
  }



// Global fetch error handler - UPDATED TO EXCLUDE LOGIN AND POSTS
const originalFetch = window.fetch;
window.fetch = async function(...args) {
  try {
    const response = await originalFetch.apply(this, args);
    
    // Handle API errors - BUT EXCLUDE LOGIN AND POSTS ENDPOINTS
    if (!response.ok && 
        args[0].includes('/api/') && 
        !args[0].includes('/api/login') && 
        !args[0].includes('/api/posts/') &&
        !args[0].includes('/api/comments/')) {
      const errorData = await response.json().catch(() => ({}));
      renderErrorPage(response.status, errorData.message);
      throw new Error(`HTTP ${response.status}: ${errorData.message || response.statusText}`);
    }
    
    return response;
  } catch (error) {
    // Handle network errors
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      renderErrorPage(500, 'Network connection failed. Please check your internet connection.');
    }
    throw error;
  }
};











  // Handle window errors
  window.addEventListener('error', function(event) {
    console.error('Global error caught:', event.error);
    renderErrorPage(500, 'An unexpected error occurred.');
  });

  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', function(event) {
    console.error('Unhandled promise rejection:', event.reason);
    renderErrorPage(500, 'A network or processing error occurred.');
  });

  // Expose globally
  window.renderErrorPage = renderErrorPage;
});
