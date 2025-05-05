document.addEventListener('DOMContentLoaded', () => {
    const template = document.getElementById('register-modal-template');
    const registerBtn = document.getElementById('open-register-modal');
    let modal;
  
    // Event: Open modal when button is clicked
    registerBtn.addEventListener('click', () => {
// Clean up any existing modal and overlay before creating new ones
const existingModal = document.getElementById('registerModal');
if (existingModal) existingModal.remove();

const existingBlur = document.getElementById('page-blur-overlay');
if (existingBlur) existingBlur.remove();

// Now create a fresh one
const clone = document.importNode(template.content, true);
document.body.appendChild(clone);
modal = document.getElementById('registerModal');

// Add new blur overlay
const blurDiv = document.createElement('div');
blurDiv.id = 'page-blur-overlay';
document.body.appendChild(blurDiv);

setupModalLogic(modal);




  
      modal.style.display = 'block';



      const blur = document.getElementById('page-blur-overlay');
      if (blur) blur.style.display = 'block';


      document.body.classList.add('modal-open');
    });
  
    // Function: Set up modal internal logic
    function setupModalLogic(modal) {
      const form = modal.querySelector('#register-form');
      const closeButtons = modal.querySelectorAll('#close-modal');
      const passwordInput = modal.querySelector('#password');
      const confirmPasswordInput = modal.querySelector('#confirmPassword');
      // Prevent clipboard actions on confirmPassword input
      ['copy', 'paste', 'cut', 'drop'].forEach(evt =>
        confirmPasswordInput.addEventListener(evt, (e) => {
          e.preventDefault();
          confirmPasswordInput.value = ''; // Clear field if paste/drop attempted
        })
      );

      // Disable dragover just in case
      confirmPasswordInput.addEventListener('dragover', e => e.preventDefault());





      const passwordToggles = modal.querySelectorAll('.password-toggle');
      const passwordStrengthBar = modal.querySelector('#password-strength');
      const passwordStrengthText = modal.querySelector('#password-strength-text');
      const usernameInput = modal.querySelector('#username');
      const usernameFeedback = modal.querySelector('#username-availability');
  
      // Close modal
      closeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
          modal.style.display = 'none';

          const blur = document.getElementById('page-blur-overlay');
          if (blur) blur.style.display = 'none';


          document.body.classList.remove('modal-open');
        });
      });
  
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
    const feedback = modal.querySelector('#confirm-password-feedback');

    
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
      form.addEventListener('submit', (e) => {
        if (!form.checkValidity()) {
          e.preventDefault();
          e.stopPropagation();
        }
        form.classList.add('was-validated');
      });
    }
  });
  