// slider.js

(function() {

let carouselInterval = null;
let currentCarouselIndex = 0;

function initializeCarousel() {
  const carousel = document.getElementById('mainCarousel');
  if (!carousel) return;

  const items = carousel.querySelectorAll('.carousel-item');
  if (items.length === 0) return;

  const prevBtn = carousel.querySelector('#prevSlide');
  const nextBtn = carousel.querySelector('#nextSlide');

  function resetSlides() {
    items.forEach((item, index) => {
      item.classList.remove('active', 'left', 'right');
      if (index === 0) {
        item.classList.add('active');
      } else {
        item.classList.add('right');
      }
    });
    currentCarouselIndex = 0;
  }

  function goToSlide(index) {
    items.forEach((item, i) => {
      item.classList.remove('active', 'left', 'right');
      if (i === index) {
        item.classList.add('active');
      } else if (i > index) {
        item.classList.add('right');
      } else {
        item.classList.add('left');
      }
    });
    currentCarouselIndex = index;
  }

  function nextSlide() {
    const nextIndex = (currentCarouselIndex + 1) % items.length;
    goToSlide(nextIndex);
  }

  function prevSlide() {
    const prevIndex = (currentCarouselIndex - 1 + items.length) % items.length;
    goToSlide(prevIndex);
  }

  function startAutoSlide() {
    stopAutoSlide();
    carouselInterval = setInterval(nextSlide, 3000);
  }

  function stopAutoSlide() {
    if (carouselInterval) {
      clearInterval(carouselInterval);
      carouselInterval = null;
    }
  }

  resetSlides();
  startAutoSlide();

  if (prevBtn) {
    prevBtn.addEventListener('click', (e) => {
      e.preventDefault();
      stopAutoSlide();
      prevSlide();
      startAutoSlide();
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', (e) => {
      e.preventDefault();
      stopAutoSlide();
      nextSlide();
      startAutoSlide();
    });
  }

  carousel.addEventListener('mouseenter', stopAutoSlide);
  carousel.addEventListener('mouseleave', startAutoSlide);

  return function cleanup() {
    stopAutoSlide();
  };
}

// Hamburger menu functionality
function setupHamburgerMenu() {
  const hamburgerBtn = document.querySelector('#navbarToggle');
  const navbarCollapse = document.querySelector('.navbar-collapse');
  
  if (hamburgerBtn && navbarCollapse) {
    hamburgerBtn.addEventListener('click', (e) => {
      e.preventDefault();
      
      // Toggle the 'show' class on the navbar
      navbarCollapse.classList.toggle('show');
      
      // Toggle aria-expanded attribute for accessibility
      const expanded = hamburgerBtn.getAttribute('aria-expanded') === 'true' || false;
      hamburgerBtn.setAttribute('aria-expanded', !expanded);
    });
    
    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
      if (navbarCollapse.classList.contains('show') && 
          !navbarCollapse.contains(e.target) && 
          !hamburgerBtn.contains(e.target)) {
        navbarCollapse.classList.remove('show');
        hamburgerBtn.setAttribute('aria-expanded', 'false');
      }
    });
    
    // Close menu when clicking on a nav link
    const navLinks = navbarCollapse.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        if (navbarCollapse.classList.contains('show')) {
          navbarCollapse.classList.remove('show');
          hamburgerBtn.setAttribute('aria-expanded', 'false');
        }
      });
    });
  }
}

// SPA logic
let currentCleanup = null;
let currentModal = null;

function loadPage(pageId) {
  console.log(`Loading page: ${pageId}`);
  
  // Close any open modal when navigating
  if (currentModal) {
    currentModal.remove();
    currentModal = null;
  }
  
  if (currentCleanup) {
    currentCleanup();
    currentCleanup = null;
  }
  
  const appContent = document.getElementById('app-content');
  const storeResults = document.getElementById('storeResults');
  
  if (appContent) appContent.style.display = 'block';
  if (storeResults) storeResults.style.display = 'none';
  
  if (pageId === 'store') {
    if (appContent) appContent.style.display = 'none';
    if (storeResults) storeResults.style.display = 'block';
    renderStoreList();
    return;
  }
  
  const template = document.getElementById(`${pageId}-template`);
  if (!template || !appContent) return;
  
  appContent.innerHTML = '';
  appContent.appendChild(template.content.cloneNode(true));
  
  if (pageId === 'home') {
    currentCleanup = initializeCarousel();
  }
}

// Store rendering function
function renderStoreList() {
  const storeTemplate = document.getElementById('storeTemplate');
  const storesList = document.getElementById('storesList');
  
  if (!storeTemplate || !storesList) return;
  
  // Clear any existing store cards
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
    
    // Optional animation delay
    card.style.animationDelay = `${index * 0.1}s`;
    
    // Fill in store info
    card.querySelector('.store-name').textContent = store.name;
    card.querySelector('.store-address').textContent = store.address;
    card.querySelector('.store-hours').textContent = store.hours;
    
    const phonePara = card.querySelector('p:nth-child(3)');
    if (store.phone) {
      phonePara.querySelector('.store-phone').textContent = store.phone;
    } else {
      phonePara.style.display = 'none';
    }
    
    storesList.appendChild(storeClone);
  });
}

// Modal handling functions
function openCreatePostModal() {
  if (currentModal) return;

  const template = document.getElementById('template-create-post-modal');
  if (!template) return;

  currentModal = document.createElement('div');
  currentModal.classList.add('modal-overlay');
  currentModal.appendChild(template.content.cloneNode(true));
  document.body.appendChild(currentModal);

  setupModalCloseHandlers();
  setupCreatePostForm();
}

function setupModalCloseHandlers() {
  if (!currentModal) return;

  // Close button
  const closeBtn = currentModal.querySelector('.create-post-close-btn');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      currentModal.remove();
      currentModal = null;
    });
  }

  // Click outside to close
  currentModal.addEventListener('click', (e) => {
    if (e.target === currentModal) {
      currentModal.remove();
      currentModal = null;
    }
  });
}

function setupCreatePostForm() {
  if (!currentModal) return;

  const form = currentModal.querySelector('#form-create-post');
  if (!form) return;

  // Get all topic checkboxes and their labels
  const topicCheckboxes = Array.from(form.querySelectorAll('input[name="create-post-topic"]'));
  const topicLabels = Array.from(form.querySelectorAll('label[for^="create-post-topic-"]'));

  // Function to update checkbox states
  function updateCheckboxStates() {
    const checkedCount = topicCheckboxes.filter(cb => cb.checked).length;
    
    if (checkedCount >= 3) {
      // If 3+ checked, disable and blur unselected checkboxes
      topicCheckboxes.forEach((checkbox, index) => {
        if (!checkbox.checked) {
          checkbox.disabled = true;
          if (topicLabels[index]) {
            topicLabels[index].style.opacity = '0.5';
            topicLabels[index].style.filter = 'blur(1px)';
            topicLabels[index].style.pointerEvents = 'none';
          }
        }
      });
    } else {
      // If less than 3 checked, enable all checkboxes
      topicCheckboxes.forEach((checkbox, index) => {
        checkbox.disabled = false;
        if (topicLabels[index]) {
          topicLabels[index].style.opacity = '1';
          topicLabels[index].style.filter = 'none';
          topicLabels[index].style.pointerEvents = 'auto';
        }
      });
    }
  }

  // Add event listeners to all checkboxes
  topicCheckboxes.forEach(checkbox => {
    checkbox.addEventListener('change', updateCheckboxStates);
  });

  // Initialize the state
  updateCheckboxStates();

  // Rest of your form setup code...
  // Clear validation errors on input
  const inputs = form.querySelectorAll('input[type="text"], textarea, input[type="checkbox"]');
  inputs.forEach(input => {
    input.addEventListener('input', () => {
      const errorContainer = form.querySelector('.validation-errors');
      if (errorContainer) errorContainer.style.display = 'none';
    });
  });

  // Form validation
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const title = form.querySelector('#input-create-post-title').value.trim();
    const content = form.querySelector('#textarea-create-post-content').value.trim();
    const checkedTopics = topicCheckboxes.filter(cb => cb.checked);

    let errors = [];
    if (title.length < 10) errors.push("Title must be at least 10 characters long.");
    if (checkedTopics.length < 3) errors.push("Select at least 3 topics.");
    if (content.length < 20) errors.push("Content must be at least 20 characters long.");

    const errorContainer = form.querySelector('.validation-errors');
    if (errors.length > 0) {
      errorContainer.innerHTML = '';
      const errorList = document.createElement('ul');
      errorList.classList.add('error-list');
      errors.forEach(error => {
        const li = document.createElement('li');
        li.textContent = error;
        errorList.appendChild(li);
      });
      errorContainer.appendChild(errorList);
      errorContainer.style.display = 'block';
    } else {
      console.log("Form submitted successfully!", { 
        title, 
        content, 
        topics: checkedTopics.map(cb => cb.value) 
      });
      currentModal.remove();
      currentModal = null;
    }
  });
}
// Updated navigation delegation
function setupNavigation() {
  document.body.addEventListener('click', (e) => {
    const target = e.target.closest('a.nav-link, .navbar-brand, [data-page]');
    if (!target) return;

    e.preventDefault();

    const pageId = target.dataset.page || (target.classList.contains('navbar-brand') ? 'home' : null);
    const type = target.dataset.type || 'page';

    if (!pageId) return;

    if (type === 'modal') {
      if (pageId === 'template-create-post-modal') {
        openCreatePostModal();
      }
      return;
    }

    loadPage(pageId);
  });
}

// Init
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM fully loaded');
  setupNavigation();
  setupHamburgerMenu();
  loadPage('home');
});
})();
