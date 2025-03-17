import { routes, renderNotFound } from './routes.js';

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
