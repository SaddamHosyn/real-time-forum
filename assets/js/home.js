(function () {
  let currentCleanup = null;






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

  // ✅ Load Top Tips Section
  window.navigateToTips = function () {
    const appContent = document.getElementById('app-content');
    const template = document.getElementById('tips-template');
    if (!template || !appContent) return;

    appContent.innerHTML = '';
    appContent.appendChild(template.content.cloneNode(true));
  };

  // ✅ Load Budgeting Calculator Section (updated with validation)
  window.navigateToCalculator = function () {
    const appContent = document.getElementById('app-content');
    const template = document.getElementById('calculator-template');
    if (!template || !appContent) return;

    appContent.innerHTML = '';
    appContent.appendChild(template.content.cloneNode(true));

    const form = document.getElementById('budget-form');
    const resultDiv = document.getElementById('calc-result');

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      const fields = ['income', 'rent', 'groceries', 'transport', 'other'];
      let isValid = true;

      for (const id of fields) {
        const val = parseFloat(document.getElementById(id).value);
        if (val < 0) {
          isValid = false;
          alert("Please enter only positive values.");
          break;
        }
      }

      if (!isValid) return;

      const income = parseFloat(document.getElementById('income').value) || 0;
      const rent = parseFloat(document.getElementById('rent').value) || 0;
      const groceries = parseFloat(document.getElementById('groceries').value) || 0;
      const transport = parseFloat(document.getElementById('transport').value) || 0;
      const other = parseFloat(document.getElementById('other').value) || 0;

      const totalExpenses = rent + groceries + transport + other;
      const balance = income - totalExpenses;

      resultDiv.innerHTML = `
        <p><strong>Total Expenses:</strong> €${totalExpenses.toFixed(2)}</p>
        <p><strong>Remaining Balance:</strong> €${balance.toFixed(2)}</p>
      `;
    });
  };



  // ✅ Close button: Go to home
  window.navigateToHome = function () {
    loadPage('home');
  };






  // ✅ Main initialization function
  window.initializeHomePage = function () {
    console.log('Home page initialized');

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

    loadPage('home');
  };

  // Standalone init if router not used
  document.addEventListener('DOMContentLoaded', () => {
    if (!window.routerEnabled) {
      initializeHomePage();
    }
  });
})();
