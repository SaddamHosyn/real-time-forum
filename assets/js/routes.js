import { TEMPLATES } from './templates.js';

// Route configuration
const routes = {
    '/': TEMPLATES.HOME,
    '/products': TEMPLATES.PRODUCTS,
    '/viewpost': TEMPLATES.POST,
    '/login': TEMPLATES.LOGIN,
    '/profile': TEMPLATES.PROFILE,
    '/about': TEMPLATES.ABOUT,
    '/products/grocery': TEMPLATES.GROCERY,
    '/products/electronics': TEMPLATES.ELECTRONICS,
    '/products/clothing': TEMPLATES.CLOTHING,
    '/products/furniture': TEMPLATES.FURNITURE,
    '/products/beauty': TEMPLATES.BEAUTY,
    '/products/auto': TEMPLATES.AUTO,
    '/products/sport': TEMPLATES.SPORT,
    '/products/restaurant': TEMPLATES.RESTAURANT,
    '/products/services': TEMPLATES.SERVICES,
    '/products/others': TEMPLATES.OTHERS,
};

// Generic render function
function renderTemplate(templateId) {
    const template = document.getElementById(templateId);
    const content = template.content.cloneNode(true);
    document.getElementById('app').innerHTML = '';
    document.getElementById('app').appendChild(content);
}

// Route handler
export function route(path) {
    const templateId = routes[path] || TEMPLATES.NOT_FOUND;
    renderTemplate(templateId);
}

// Expose routes for navigation
export const ROUTES = routes;
