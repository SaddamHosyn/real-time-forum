(function () {
  let currentCleanup = null;
  let pageLoaded = {}; // Track loaded pages to prevent reloading
  let isNavigating = false; // Prevent multiple simultaneous navigations

  function loadPage(pageId) {
    // ✅ PREVENT: Multiple simultaneous page loads
    if (isNavigating) {
      console.log(`⚠️ Navigation already in progress, skipping ${pageId}`);
      return;
    }
    
    isNavigating = true;
    console.log(`Loading page: ${pageId}`);

    if (currentCleanup) {
      currentCleanup();
      currentCleanup = null;
    }

    const appContent = document.getElementById('app-content');
    if (!appContent) {
      isNavigating = false;
      return;
    }

    appContent.style.display = 'block';
    const template = document.getElementById(`${pageId}-template`);
    if (!template) {
      isNavigating = false;
      return;
    }

    appContent.innerHTML = '';
    appContent.appendChild(template.content.cloneNode(true));
    
    // Mark page as loaded
    pageLoaded[pageId] = true;
    
    // Reset navigation flag after a delay
    setTimeout(() => {
      isNavigating = false;
    }, 100);
  }

  // ✅ FIXED: Add event listener only once
  let navigationSetup = false;

  function setupNavigation() {
    if (navigationSetup) {
      console.log('⚠️ Navigation already setup, skipping...');
      return;
    }
    
    navigationSetup = true;
    
    document.body.addEventListener('click', (e) => {
      const target = e.target.closest('a.nav-link, .navbar-brand, [data-page]');
      if (!target) return;

      e.preventDefault();
      const pageId = target.dataset.page || (target.classList.contains('navbar-brand') ? 'home' : null);
      if (!pageId) return;

      loadPage(pageId);
    });
  }

  // ✅ Load Top Tips Section
  window.navigateToTips = function () {
    if (isNavigating) return;
    
    const appContent = document.getElementById('app-content');
    const template = document.getElementById('tips-template');
    if (!template || !appContent) return;

    appContent.innerHTML = '';
    appContent.appendChild(template.content.cloneNode(true));
  };

  // ✅ Load Budgeting Calculator Section (updated with validation)
  window.navigateToCalculator = function () {
    if (isNavigating) return;
    
    const appContent = document.getElementById('app-content');
    const template = document.getElementById('calculator-template');
    if (!template || !appContent) return;

    appContent.innerHTML = '';
    appContent.appendChild(template.content.cloneNode(true));

    const form = document.getElementById('budget-form');
    const resultDiv = document.getElementById('calc-result');

    if (form) {
      form.addEventListener('submit', function (e) {
        e.preventDefault();

        const fields = ['income', 'rent', 'groceries', 'transport', 'other'];
        let isValid = true;

        for (const id of fields) {
          const element = document.getElementById(id);
          if (!element) continue;
          
          const val = parseFloat(element.value);
          if (val < 0) {
            isValid = false;
            alert("Please enter only positive values.");
            break;
          }
        }

        if (!isValid) return;

        const income = parseFloat(document.getElementById('income')?.value) || 0;
        const rent = parseFloat(document.getElementById('rent')?.value) || 0;
        const groceries = parseFloat(document.getElementById('groceries')?.value) || 0;
        const transport = parseFloat(document.getElementById('transport')?.value) || 0;
        const other = parseFloat(document.getElementById('other')?.value) || 0;

        const totalExpenses = rent + groceries + transport + other;
        const balance = income - totalExpenses;

        if (resultDiv) {
          resultDiv.innerHTML = `
            <p><strong>Total Expenses:</strong> €${totalExpenses.toFixed(2)}</p>
            <p><strong>Remaining Balance:</strong> €${balance.toFixed(2)}</p>
          `;
        }
      });
    }
  };

  // ✅ Close button: Go to home
  window.navigateToHome = function () {
    loadPage('home');
  };

  // ✅ FIXED: Main initialization function with better state management
  let homeInitialized = false;

  window.initializeHomePage = function () {
    // ✅ PREVENT: Multiple initializations
    if (homeInitialized) {
      console.log('⚠️ Home page already initialized, skipping...');
      return;
    }
    
    homeInitialized = true;
    console.log('Home page initialized');

    // Setup navigation only once
    setupNavigation();

    // Handle logout message
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

    // Load home page only if not already loaded
    if (!pageLoaded['home']) {
      loadPage('home');
    }
  };

  // ✅ FIXED: Prevent multiple DOM ready handlers
  let domReadyHandled = false;

  // Standalone init if router not used
  document.addEventListener('DOMContentLoaded', () => {
    if (!domReadyHandled && !window.routerEnabled) {
      domReadyHandled = true;
      setTimeout(() => {
        initializeHomePage();
      }, 50);
    }
  });

  // ✅ ADDED: Reset function for cleanup
  window.resetHomePage = function() {
    homeInitialized = false;
    navigationSetup = false;
    pageLoaded = {};
    isNavigating = false;
    domReadyHandled = false;
  };
})();
