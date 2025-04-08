// register form open and close logic with the register button
// register form open and close logic with the register button


// Modal Controller
document.addEventListener('DOMContentLoaded', () => {
   // Clone and append template
   const template = document.getElementById('register-modal-template');
   const modal = template.content.cloneNode(true);
   document.body.appendChild(modal);
   
   // Event delegation for all modal actions
   document.addEventListener('click', (e) => {
     const action = e.target.closest('[data-action]')?.dataset.action;
     
     if (action === 'open-register') {
       document.querySelector('[data-modal="register"]').showModal();
     }
     
     if (action === 'close-modal') {
       e.target.closest('dialog').close();
     }
   });
 });

  // register form open and close logic with the register button
 
