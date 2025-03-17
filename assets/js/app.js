function navigateTo(event, url) {
   event.preventDefault(); // Prevent the default anchor tag navigation
   history.pushState({}, '', url);
   route();
}

function route() {
   const path = window.location.pathname;
   const routeHandler = routes[path] || renderNotFound;
   routeHandler();
}

window.onpopstate = route; // Handle back/forward buttons
document.addEventListener('DOMContentLoaded', route); // Handle initial load
