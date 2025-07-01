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

  // ✅ FIXED: More restrictive global fetch error handler
  const originalFetch = window.fetch;
  window.fetch = async function(...args) {
    try {
      const response = await originalFetch.apply(this, args);
      
      // ✅ ONLY handle specific API errors, NOT network/connection errors
      if (!response.ok && 
          args[0].includes('/api/') && 
          !args[0].includes('/api/login') && 
          !args[0].includes('/api/posts/') &&
          !args[0].includes('/api/comments/') &&
          response.status !== 500) { // ✅ EXCLUDE 500 errors completely
        const errorData = await response.json().catch(() => ({}));
        renderErrorPage(response.status, errorData.message);
        throw new Error(`HTTP ${response.status}: ${errorData.message || response.statusText}`);
      }
      
      return response;
    } catch (error) {
      // ✅ REMOVED: Network error handling that shows 500 page
      // Just log the error and let the application handle it gracefully
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        console.warn('Network connection failed:', error.message);
        // Don't show error page, just throw the error
      }
      throw error;
    }
  };

  // ✅ REMOVED: Global window error handler that shows 500 page
  // window.addEventListener('error', function(event) {
  //   console.error('Global error caught:', event.error);
  //   renderErrorPage(500, 'An unexpected error occurred.');
  // });

  // ✅ REMOVED: Unhandled promise rejection handler that shows 500 page
  // window.addEventListener('unhandledrejection', function(event) {
  //   console.error('Unhandled promise rejection:', event.reason);
  //   renderErrorPage(500, 'A network or processing error occurred.');
  // });

  // ✅ ADDED: Silent error logging instead
  window.addEventListener('error', function(event) {
    console.error('Global error caught:', event.error);
    // Just log, don't show error page
  });

  window.addEventListener('unhandledrejection', function(event) {
    console.error('Unhandled promise rejection:', event.reason);
    // Just log, don't show error page
  });

  // Expose globally
  window.renderErrorPage = renderErrorPage;
});
