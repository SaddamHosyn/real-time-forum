import { TEMPLATES, CATEGORIES } from './templates.js';

const ROUTES = {
  '/': TEMPLATES.HOME,
  '/topics': TEMPLATES.TOPICS,
  '/create-post': TEMPLATES.CREATE_POST,
  ...generateCategoryRoutes() // Dynamic category routes
};

function generateCategoryRoutes() {
  const routes = {};
  for (const category of Object.values(CATEGORIES)) {
    routes[`/topics/${category}`] = TEMPLATES.CATEGORY;
  }
  return routes;
}

export function navigateTo(path) {
  history.pushState({}, '', path);
  renderRoute(path);
}

function renderRoute(path) {
  const templateId = ROUTES[path] || TEMPLATES.NOT_FOUND;
  const app = document.getElementById('app');
  
  if (templateId === TEMPLATES.CATEGORY) {
    renderCategoryPage(path.split('/').pop());
  } else {
    app.innerHTML = document.getElementById(templateId).innerHTML;
  }
}

function renderCategoryPage(categoryId) {
  const template = document.getElementById(TEMPLATES.CATEGORY);
  const categoryName = formatCategoryName(categoryId);
  
  document.getElementById('app').innerHTML = 
    template.innerHTML.replace('{{category}}', categoryName);
  
  // Load posts for this category (example)
  loadCategoryPosts(categoryId);
}

function formatCategoryName(id) {
  return id.split('-')
    .map(word => word[0].toUpperCase() + word.slice(1))
    .join(' ');
}

// Initialize router
window.addEventListener('popstate', () => renderRoute(location.pathname));
document.addEventListener('DOMContentLoaded', initRouter);

function initRouter() {
  // Handle all link clicks
  document.body.addEventListener('click', e => {
    const link = e.target.closest('[data-link]');
    if (link) {
      e.preventDefault();
      navigateTo(link.href.replace(location.origin, ''));
    }
  });
  
  // Initial render
  renderRoute(location.pathname);
}
