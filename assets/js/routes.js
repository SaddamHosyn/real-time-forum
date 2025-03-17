import { TEMPLATES } from './templates.js';

const routes = {
    '/': renderHome,
    '/products': renderProducts,
    '/viewpost': renderPost,
    '/login': renderLogin,
    '/profile': renderProfile,
    '/about': renderAbout,
    '/products/grocery': renderGrocery,
    '/products/electronics': renderElectronics,
    '/products/clothing': renderClothing,
    '/products/furniture': renderFurniture,
    '/products/beauty': renderBeauty,
    '/products/auto': renderAuto,
    '/products/sport': renderSport,
    '/products/restaurant': renderRestaurant,
    '/products/services': renderServices,
    '/products/others': renderOthers,
};

function renderTemplate(templateId) {
    const template = document.getElementById(templateId);
    const content = template.content.cloneNode(true);
    document.getElementById('app').innerHTML = '';
    document.getElementById('app').appendChild(content);
}

export function renderHome() {
    renderTemplate(TEMPLATES.HOME);
}

export function renderProducts() {
    renderTemplate(TEMPLATES.PRODUCTS);
}

export function renderPost() {
    renderTemplate(TEMPLATES.POST);
}

export function renderLogin() {
    renderTemplate(TEMPLATES.LOGIN);
}

export function renderProfile() {
    renderTemplate(TEMPLATES.PROFILE);
}

export function renderAbout() {
    renderTemplate(TEMPLATES.ABOUT);
}

export function renderNotFound() {
    renderTemplate(TEMPLATES.NOT_FOUND);
}


export function renderGrocery() {
    renderTemplate(TEMPLATES.GROCERY);
}

export function renderElectronics() {
      renderTemplate(TEMPLATES.ELECTRONICS);    
}

export function renderClothing() {
    renderTemplate(TEMPLATES.CLOTHING);
}

export function renderFurniture() {
      renderTemplate(TEMPLATES.FURNITURE);
}

export function renderBeauty() {
      renderTemplate(TEMPLATES.BEAUTY);
}

export function renderAuto() {
      renderTemplate(TEMPLATES.AUTO);
}        

export function renderSport() {
      renderTemplate(TEMPLATES.SPORT);
}

export function renderRestaurant() {
      renderTemplate(TEMPLATES.RESTAURANT);
}

export function renderServices() {
      renderTemplate(TEMPLATES.SERVICES);
}

export function renderOthers() {
      renderTemplate(TEMPLATES.OTHERS);   
}

