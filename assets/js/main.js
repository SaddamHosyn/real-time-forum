// main.js
import { routes, renderNotFound } from './routes.js';
import './app.js'; // Import app.js to initialize UI-specific logic

// Routing and navigation logic
function navigateTo(event, url) {
  if (event) event.preventDefault();
  history.pushState({}, '', url);
  route();
}

function route() {
  const path = window.location.pathname;
  const routeHandler = routes[path] || renderNotFound;
  routeHandler();
}

window.onpopstate = route;
document.addEventListener('DOMContentLoaded', route);

// Expose navigateTo to the global scope for use in templates
window.navigateTo = navigateTo;
