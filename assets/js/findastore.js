function renderStoreList() {
  console.log("Rendering store list");

  const storeTemplate = document.getElementById('store-card-template');
  const storesList = document.getElementById('storesList');

  console.log("Store template found:", !!storeTemplate);
  console.log("Stores list found:", !!storesList);

  if (!storeTemplate || !storesList) {
    console.error("Template or list container not found");
    console.error("storeTemplate:", storeTemplate);
    console.error("storesList:", storesList);
    return;
  }

  // Clear the list
  storesList.innerHTML = '';
  console.log("Cleared stores list");

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
    }
  ];

  console.log("Processing", stores.length, "stores");

  stores.forEach((store, index) => {
    console.log("Processing store", index + 1, ":", store.name);
    
    const storeClone = storeTemplate.content.cloneNode(true);
    const card = storeClone.querySelector('.store-card');

    console.log("Card found:", !!card);

    if (card) {
      card.style.animationDelay = `${index * 0.1}s`;
      card.querySelector('.store-name').textContent = store.name;
      card.querySelector('.store-address').textContent = store.address;
      card.querySelector('.store-hours').textContent = store.hours;

      const phonePara = card.querySelector('.store-phone-line');
      if (store.phone) {
        phonePara.querySelector('.store-phone').textContent = store.phone;
      } else {
        phonePara.style.display = 'none';
      }

      storesList.appendChild(storeClone);
      console.log("Added store", store.name, "to list");
    }
  });

  console.log("Final stores list children count:", storesList.children.length);
  console.log("Store list rendered successfully");
}

// Initialize function for router
function initializeStorePage() {
  console.log('Store page initialized');
  renderStoreList();
}
