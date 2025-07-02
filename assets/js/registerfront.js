// register.js

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
  const closeRegisterButton = document.getElementById('close-register'); 
  const successMessage = document.getElementById('registerSuccessMessage');

  if (!registerForm) {
      console.error('Register form not found!');
      return;
  }

  // Event listener for the close button
  if (closeRegisterButton) {
    closeRegisterButton.addEventListener('click', () => {
        console.log('Close register button clicked.');
        window.navigateTo('home'); // Navigate to home page
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

  // Form submission handler
  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    registerForm.classList.add('was-validated');

    if (!registerForm.checkValidity()) {
        return;
    }

    const formData = {
        firstName: document.getElementById('firstNameInput').value,
        lastName: document.getElementById('lastNameInput').value,
        username: document.getElementById('usernameInput').value,
        email: document.getElementById('emailInput').value,
        age: parseInt(document.getElementById('ageInput').value, 10),
        gender: document.querySelector('input[name="gender"]:checked')?.value,
        password: document.getElementById('passwordInput').value,
        termsAccepted: document.getElementById('termsCheckbox').checked
    };

    try {
        const response = await fetch('/api/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        const result = await response.json();

        if (response.ok) {
            // Show success message
            if (successMessage) {
                successMessage.classList.remove('d-none');
                successMessage.textContent = result.message || 'Registration successful!';
            }
            
            // Wait a moment before redirecting to login
            setTimeout(() => {
                // Navigate to the feed page after successful registration
                window.navigateTo('signin');
            }, 1500);
        } else {
            alert(result.error || 'Registration failed');
        }
    } catch (error) {
        console.error('Registration error:', error);
        alert('An error occurred. Please try again.');
    }
  });
}

// Make the function globally available
window.setupRegisterPage = setupRegisterPage;
