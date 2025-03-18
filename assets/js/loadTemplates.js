

// loadTemplates.js
import { TEMPLATES } from './templates.js';

function loadTemplates() {
  const templateContainer = document.createElement('div');
  templateContainer.innerHTML = Object.values(TEMPLATES).join('');
  document.body.appendChild(templateContainer);
}

document.addEventListener('DOMContentLoaded', loadTemplates);
