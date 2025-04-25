document.addEventListener('DOMContentLoaded', () => {
   const authButtons = document.getElementById('auth-buttons');
   const accountButtons = document.getElementById('account-buttons');
 
   // Simulate login
   document.getElementById('open-signin-page').addEventListener('click', () => {
     // Simulate login success
     authButtons.classList.add('d-none');
     accountButtons.classList.remove('d-none');
   });
 
   // Simulate logout
   document.getElementById('logout-btn').addEventListener('click', () => {
     accountButtons.classList.add('d-none');
     authButtons.classList.remove('d-none');
   });
 });
 