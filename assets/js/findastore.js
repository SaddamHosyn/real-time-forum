function renderStoreList() {
  console.log("Rendering store list");

  const storeTemplate = document.getElementById('storetemplate');
  const storesList = document.getElementById('storesList');

  if (!storeTemplate) {
    console.error("Store template not found");
    return;
  }

  if (!storesList) {
    console.error("Stores list container not found");
    return;
  }

  storesList.innerHTML = '';

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

  stores.forEach((store, index) => {
    const storeClone = storeTemplate.content.cloneNode(true);
    const card = storeClone.querySelector('.store-card');

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
  });
}

// Store page initialization function
function initializeStorePage() {
  console.log("Initializing store page");
  const storeResults = document.getElementById('storeResults');
  if (storeResults) storeResults.classList.remove('d-none');
  
  // Wait briefly to ensure template is injected
  setTimeout(() => {
    if (window.renderStoreList) {
      renderStoreList();
    } else {
      console.error("renderStoreList function not available");
    }
  }, 50);
}

// Expose functions to window
window.renderStoreList = renderStoreList;
window.initializeStorePage = initializeStorePage;

// For standalone page testing (if needed)
document.addEventListener('DOMContentLoaded', () => {
  if (window.location.pathname.includes('store')) {
    initializeStorePage();
  }
});
