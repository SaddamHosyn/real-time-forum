// dropdown.js
export function toggleDropdown(event, dropdownId) {
   event.preventDefault(); // Prevent the default link behavior
   const dropdown = document.getElementById(dropdownId);
   dropdown.classList.toggle("show");
 }
 
 // Close the dropdown if the user clicks outside of it
 window.onclick = function (event) {
   if (!event.target.matches('.dropdown a')) {
     const dropdowns = document.getElementsByClassName("dropdown-content");
     for (let i = 0; i < dropdowns.length; i++) {
       const openDropdown = dropdowns[i];
       if (openDropdown.classList.contains('show')) {
         openDropdown.classList.remove('show');
       }
     }
   }
 };
