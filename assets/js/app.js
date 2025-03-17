function navigateTo(event, url) {
   event.preventDefault(); // Prevent the default anchor tag navigation
   history.pushState({}, '', url);
   route();
}

function route() {
   const path = window.location.pathname;
   const routeHandler = routes[path] || renderNotFound;
   routeHandler();
}

window.onpopstate = route; // Handle back/forward buttons
document.addEventListener('DOMContentLoaded', route); // Handle initial load



// Add the filterCombobox function

function filterCombobox() {
   const input = document.getElementById('combobox-input').value.toLowerCase();
   const listContainer = document.getElementById('combobox-list');
   listContainer.innerHTML = '';

   if (input === '') {
       listContainer.style.display = 'none';
       return;
   }

   const filteredProducts = products.filter(product =>
       product.name.toLowerCase().includes(input)
   );

   if (filteredProducts.length > 0) {
       filteredProducts.forEach(product => {
           const link = document.createElement('a');
           link.href = product.path;
           link.textContent = product.name;
           link.onclick = (event) => navigateTo(event, product.path);
           listContainer.appendChild(link);
       });
       listContainer.style.display = 'block';
   } else {
       listContainer.style.display = 'none';
   }
}


document.getElementById('combobox-input').addEventListener('keydown', (e) => {
   const items = document.querySelectorAll('#combobox-list a');
   const currentIndex = Array.from(items).indexOf(document.activeElement);

   switch (e.key) {
       case 'ArrowDown':
           e.preventDefault();
           if (currentIndex < items.length - 1) {
               items[currentIndex + 1].focus();
           }
           break;
       case 'ArrowUp':
           e.preventDefault();
           if (currentIndex > 0) {
               items[currentIndex - 1].focus();
           }
           break;
       case 'Enter':
           if (document.activeElement.tagName === 'A') {
               document.activeElement.click();
           }
           break;
       case 'Escape':
           document.getElementById('combobox-list').style.display = 'none';
           break;
   }
});
