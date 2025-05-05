document.addEventListener('DOMContentLoaded', function () {
   function renderErrorPage(errorCode) {
     let template;
 
     switch (errorCode) {
       case 400:
         template = document.getElementById('error-400-template');
         break;
       case 404:
         template = document.getElementById('error-404-template');
         break;
       case 500:
         template = document.getElementById('error-500-template');
         break;
       case 405:
         template = document.getElementById('error-405-template');
         break;
       default:
         template = document.getElementById('error-404-template');
     }
 
     if (!template) return;
 
     const errorClone = document.importNode(template.content, true);
     const app = document.getElementById('app-content');
     if (app) {
       app.innerHTML = '';
       app.appendChild(errorClone);
     }
   }
 
   const errorParam = new URLSearchParams(window.location.search).get("error");
 
   // ✅ This guard prevents passing "NaN" to renderErrorPage
   if (errorParam && !isNaN(errorParam)) {
     renderErrorPage(Number(errorParam));
   }
 });
 