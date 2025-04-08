
 // find a store
  // find a store


document.addEventListener('DOMContentLoaded', function() {
   const storeLink = document.querySelector('[data-page="store"]');
   const storeTemplate = document.getElementById('storeTemplate');
   
   if (storeLink && storeTemplate) {
       storeLink.addEventListener('click', function(e) {
           e.preventDefault();
           
           document.getElementById('app-content').style.display = 'none';
           const storeResults = document.getElementById('storeResults');
           const storesList = document.getElementById('storesList');
           
           const stores = [
               {
                   name: "Sparhallen",
                   address: "1 Sparvägen, Mariehamn 22150, Åland Islands",
                   hours: "Mon-Fri: 9AM-9PM"
               },
               {
                   name: "S-Market Jomala",
                   address: "1 Lövuddsvägen, Jomala 22120, Åland Islands",
                   hours: "Mon-Sun: 10AM-10PM"
               },
               {
                   name: "K-Supermarket Kantarellen",
                   address: "Nya Godbyvägen, Jomala 22120, Åland Islands",
                   hours: "Sun-Thu: 10AM-8PM, Fri-Sat: 10AM-9PM"
               },
               {
                   name: "Multitronic Åland",
                   address: "3 Storagatan, Mariehamn 22100, Ahvenanmaa",
                   hours: "Mon-Sun: 10AM-10PM"
               },
               {
                   name: "Clas Ohlson",
                   address: "1 Sparvägen, Mariehamn 22150, Åland Islands",
                   hours: "Sun-Thu: 10AM-8PM, Fri-Sat: 10AM-9PM"
               },
              




           ];
           
           storesList.innerHTML = '';
           
           stores.forEach((store, index) => {
            const storeClone = storeTemplate.content.cloneNode(true);
            const card = storeClone.querySelector('.store-card');
            
            // Add animation delay dynamically
            card.style.animationDelay = `${index * 0.1}s`;
            
            // Fill data
            card.querySelector('.store-name').textContent = store.name;
            card.querySelector('.store-address').textContent = store.address;
            card.querySelector('.store-hours').textContent = store.hours;
            
            // Handle phone
            const phonePara = card.querySelector('p:nth-child(3)'); // Phone paragraph
            if (store.phone) {
                phonePara.querySelector('.store-phone').textContent = store.phone;
            } else {
                phonePara.style.display = 'none';
            }
            
            storesList.appendChild(storeClone);
        });
           
           storeResults.style.display = 'block';
       });
   }
   
   // Rest of your navigation handlers remain the same
   document.querySelectorAll('[data-page]:not([data-page="store"])').forEach(link => {
       link.addEventListener('click', function() {
           document.getElementById('storeResults').style.display = 'none';
           document.getElementById('app-content').style.display = 'block';
       });
   });
});

   // find a store
