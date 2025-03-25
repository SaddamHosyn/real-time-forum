// assets/js/utils/formHelpers.js

/**
 * Generates standardized form field HTML
 * @param {string} id - Field ID
 * @param {string} label - Display label
 * @param {string} type - Input type (text/email/password/number)
 * @param {boolean} required - Whether field is required
 */
export function formField(id, label, type = 'text', required = true) {
   return `
     <div class="form-group">
       <label for="${id}">${label}</label>
       <input type="${type}" id="${id}" name="${id.replace('reg-', '')}" 
         placeholder="${label}" ${required ? 'required' : ''} 
         ${type === 'number' ? 'min="0"' : ''}>
     </div>
   `;
 }
