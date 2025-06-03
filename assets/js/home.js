(function() {
  let carouselInterval = null;
  let currentCarouselIndex = 0;
  let currentCleanup = null;

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

  function setupHamburgerMenu() {
    const hamburgerBtn = document.querySelector('#navbarToggle');
    const navbarCollapse = document.querySelector('.navbar-collapse');
    
    if (hamburgerBtn && navbarCollapse) {
      hamburgerBtn.addEventListener('click', (e) => {
        e.preventDefault();
        navbarCollapse.classList.toggle('show');
        const expanded = hamburgerBtn.getAttribute('aria-expanded') === 'true' || false;
        hamburgerBtn.setAttribute('aria-expanded', !expanded);
      });
      
      document.addEventListener('click', (e) => {
        if (navbarCollapse.classList.contains('show') && 
            !navbarCollapse.contains(e.target) && 
            !hamburgerBtn.contains(e.target)) {
          navbarCollapse.classList.remove('show');
          hamburgerBtn.setAttribute('aria-expanded', 'false');
        }
      });
      
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

  function loadPage(pageId) {
    console.log(`Loading page: ${pageId}`);
    
    if (currentCleanup) {
      currentCleanup();
      currentCleanup = null;
    }
    
    const appContent = document.getElementById('app-content');
    if (!appContent) return;
    
    appContent.style.display = 'block';
    const template = document.getElementById(`${pageId}-template`);
    if (!template) return;
    
    appContent.innerHTML = '';
    appContent.appendChild(template.content.cloneNode(true));
    
    if (pageId === 'home') {
      currentCleanup = initializeCarousel();
    }
  }

  function setupNavigation() {
    document.body.addEventListener('click', (e) => {
      const target = e.target.closest('a.nav-link, .navbar-brand, [data-page]');
      if (!target) return;

      e.preventDefault();
      const pageId = target.dataset.page || (target.classList.contains('navbar-brand') ? 'home' : null);
      if (!pageId) return;

      loadPage(pageId);
    });
  }

  // ✅ Main initialization function
  window.initializeHomePage = function() {
    console.log('Home page initialized');

    // ✅ Show logout message if present
    if (window.logoutSuccessMessage) {
      const msgBox = document.getElementById('logout-message');
      if (msgBox) {
        msgBox.textContent = window.logoutSuccessMessage;
        msgBox.classList.remove('d-none');
        setTimeout(() => {
          msgBox.classList.add('d-none');
        }, 3000);
      }
      window.logoutSuccessMessage = null;
    }

    setupNavigation();
    setupHamburgerMenu();
    loadPage('home');
  };

  // For standalone use (without router)
  document.addEventListener('DOMContentLoaded', () => {
    if (!window.routerEnabled) {
      initializeHomePage();
    }
  });

})();
