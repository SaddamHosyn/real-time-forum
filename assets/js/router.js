class Router {
   constructor() {
       this.routes = {};
       this.currentRoute = null;
       this.initEventListeners();
   }

   // Initialize event listeners
   initEventListeners() {
       // Handle back/forward browser buttons
       window.addEventListener('popstate', () => {
           this.loadRoute(window.location.pathname);
       });

       // Delegate all navigation link clicks
       document.addEventListener('click', (e) => {
           const link = e.target.closest('a[data-page]');
           if (link) {
               e.preventDefault();
               const page = link.getAttribute('data-page');
               this.navigateTo(page);
           }
       });
   }

   // Add a new route
   addRoute(path, templateId, callback) {
       this.routes[path] = {
           templateId,
           callback
       };
   }

   // Navigate to a specific route
   navigateTo(path, data = {}) {
       // Update browser history
       window.history.pushState({}, '', path);
       
       // Load the route
       this.loadRoute(path, data);
   }

   // Load a route
   async loadRoute(path, data = {}) {
       // Check if route exists
       const route = this.routes[path];
       if (!route) {
           this.navigateTo('/'); // Redirect to home if route doesn't exist
           return;
       }

       // Prevent reloading the same route
       if (this.currentRoute === path) return;
       this.currentRoute = path;

       // Get the template
       const template = document.getElementById(route.templateId);
       if (!template) {
           console.error(`Template ${route.templateId} not found`);
           return;
       }

       // Clone the template content
       const content = template.content.cloneNode(true);

       // Clear existing content and add new content
       const main = document.querySelector('main');
       main.innerHTML = '';
       main.appendChild(content);

       // Execute route callback if it exists
       if (route.callback && typeof route.callback === 'function') {
           await route.callback(data);
       }

       // Update active nav item
       this.updateActiveNav(path);
   }

   // Update active navigation item
   updateActiveNav(path) {
       // Remove active class from all nav items
       document.querySelectorAll('[data-page]').forEach(link => {
           link.classList.remove('active');
           link.ariaCurrent = null;
       });

       // Add active class to current route's nav item
       const activeLink = document.querySelector(`[data-page="${path}"]`);
       if (activeLink) {
           activeLink.classList.add('active');
           activeLink.ariaCurrent = 'page';
       }
   }

   // Start the router
   start() {
       // Load the initial route
       const path = window.location.pathname || '/';
       this.loadRoute(path);
   }
}

// Create and export router instance
export const router = new Router();
