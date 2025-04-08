// This works for both static and dynamically loaded password fields
document.addEventListener('click', function(e) {
  if (e.target.classList.contains('custom-password-toggle')) {
    const passwordInput = e.target.parentElement.querySelector('input');
    if (passwordInput) {
      passwordInput.type = passwordInput.type === 'password' ? 'text' : 'password';
      e.target.textContent = passwordInput.type === 'password' ? 'Show' : 'Hide';
    }
  }
});
