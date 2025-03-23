import { TEMPLATES } from './templates.js';

const routes = {
  '/': TEMPLATES.HOME,
  '/topics': TEMPLATES.topics,
  '/topics/food-dining': TEMPLATES.FOOD_DINING,
  '/topics/technology': TEMPLATES.TECHNOLOGY,
  '/topics/fashion': TEMPLATES.FASHION,
  '/topics/home-living': TEMPLATES.HOME_LIVING,
  '/topics/health-beauty': TEMPLATES.HEALTH_BEAUTY,
  '/topics/automotive': TEMPLATES.AUTOMOTIVE,
  '/topics/sports-fitness': TEMPLATES.SPORTS_FITNESS,
  '/topics/travel-leisure': TEMPLATES.TRAVEL_LEISURE,
  '/topics/services': TEMPLATES.SERVICES,
  '/topics/miscellaneous': TEMPLATES.MISCELLANEOUS,
  '/create-post': TEMPLATES.CREATE_POST,
  // Add other routes as needed
};

function renderTemplate(templateId) {
  const template = document.getElementById(templateId);
  const content = template.content.cloneNode(true);
  document.getElementById('app').innerHTML = '';
  document.getElementById('app').appendChild(content);
}

export function route(path) {
  const templateId = routes[path] || TEMPLATES.NOT_FOUND;
  renderTemplate(templateId);
}

export const ROUTES = routes;
