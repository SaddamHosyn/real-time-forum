// Renamed the top-level function to be called from router.js
function setupRegisterPage() {
  console.log('Setting up register page event listeners...');
  const registerPage = document.getElementById('register-page');
  const registerForm = document.getElementById('registerForm');
  const passwordInput = document.getElementById('passwordInput');
  const confirmPasswordInput = document.getElementById('confirmPasswordInput');
  const passwordToggles = document.querySelectorAll('.password-toggle-btn');
  const passwordStrengthBar = document.getElementById('passwordStrength');
  const passwordStrengthText = document.getElementById('passwordStrengthText');
  const usernameInput = document.getElementById('usernameInput');
  const usernameFeedback = document.getElementById('usernameAvailability');
  const closeRegisterButton = document.getElementById('close-register'); // Get the close button

  if (!registerForm) {
      console.error('Register form not found!');
      return;
  }

   // Event listener for the close button
   if (closeRegisterButton) {
    closeRegisterButton.addEventListener('click', () => {
        console.log('Close register button clicked.');
        window.navigateTo('home'); // Or any other page you want to navigate to
    });
} else {
    console.warn('Close register button element not found.');
}






  // Prevent clipboard actions on confirmPassword input
  ['copy', 'paste', 'cut', 'drop'].forEach(evt =>
      confirmPasswordInput.addEventListener(evt, (e) => {
          e.preventDefault();
          confirmPasswordInput.value = ''; // Clear field if paste/drop attempted
      })
  );
  // Disable dragover just in case
  confirmPasswordInput.addEventListener('dragover', e => e.preventDefault());

  // Password toggle
  passwordToggles.forEach(toggle => {
      toggle.addEventListener('click', () => {
          const input = toggle.previousElementSibling.querySelector('input');
          if (input.type === 'password') {
              input.type = 'text';
              toggle.textContent = 'Hide';
          } else {
              input.type = 'password';
              toggle.textContent = 'Show';
          }
      });
  });

  // Password strength checker
  passwordInput.addEventListener('input', () => {
      const value = passwordInput.value;
      let strength = 0;

      if (value.length >= 8) strength++;
      if (/[a-z]/.test(value)) strength++;
      if (/[A-Z]/.test(value)) strength++;
      if (/\d/.test(value)) strength++;

      const strengthClasses = ['bg-danger', 'bg-warning', 'bg-info', 'bg-success'];
      passwordStrengthBar.className = 'progress-bar';
      passwordStrengthBar.style.width = `${(strength / 4) * 100}%`;

      if (strength > 0) {
          passwordStrengthBar.classList.add(strengthClasses[strength - 1]);
      }

      const messages = ['Weak', 'Fair', 'Good', 'Strong'];
      passwordStrengthText.textContent = messages[strength - 1] || '';
  });

  // Confirm password match (Real-time validation)
  function validatePasswords() {
      const feedback = document.getElementById('confirmPasswordFeedback');

      if (confirmPasswordInput.value !== passwordInput.value) {
          confirmPasswordInput.setCustomValidity('Passwords do not match');
          feedback.style.display = 'block';
          confirmPasswordInput.classList.remove('is-valid');
          confirmPasswordInput.classList.add('is-invalid');
      } else {
          confirmPasswordInput.setCustomValidity('');
          feedback.style.display = 'none';
          confirmPasswordInput.classList.remove('is-invalid');
          confirmPasswordInput.classList.add('is-valid');
      }
  }
  // Run the validation when password or confirm password changes
  passwordInput.addEventListener('input', validatePasswords);
  confirmPasswordInput.addEventListener('input', validatePasswords);

  // Username availability check
  usernameInput.addEventListener('input', () => {
      const username = usernameInput.value;
      if (username.toLowerCase() === 'takenuser') {
          usernameFeedback.textContent = 'This username is already taken.';
          usernameFeedback.classList.add('text-danger');
          usernameFeedback.classList.remove('text-success');
          usernameInput.setCustomValidity('Username taken');
      } else {
          usernameFeedback.textContent = 'Username is available.';
          usernameFeedback.classList.remove('text-danger');
          usernameFeedback.classList.add('text-success');
          usernameInput.setCustomValidity('');
      }
  });

  // Form validation
  registerForm.addEventListener('submit', (e) => {
      if (!registerForm.checkValidity()) {
          e.preventDefault();
          e.stopPropagation();
      }
      registerForm.classList.add('was-validated');
  });
}

// The initializeRegisterPage function in router.js will trigger setupRegisterPage
