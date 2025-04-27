// signinpage.js

function handleLoginSuccess() {
  // Clean up the modal and overlay
  document.querySelector(".signin-modal")?.remove();
  document.getElementById("login-page-blur-overlay").style.display = "none";

  // Handle post-login redirect
  const redirectTo = localStorage.getItem('redirectAfterLogin');
  if (redirectTo) {
    localStorage.removeItem('redirectAfterLogin');
    if (routes[redirectTo]?.isModal) {
      showModal(redirectTo);
    } else {
      navigateTo(redirectTo);
    }
  } else {
    navigateTo('home');
  }
}

document.addEventListener("click", (e) => {
  // Open Sign In modal when Sign In button is clicked
  if (e.target.id === "open-signin-page") {
    const template = document.getElementById("signin-template");
    const modal = template.content.cloneNode(true);
    document.body.appendChild(modal);

    // Show the modal and overlay
    document.querySelector(".signin-modal")?.classList.remove("hidden");
    document.getElementById("login-page-blur-overlay").style.display = "block";

    // Attach submit listener AFTER modal is in DOM
    const loginForm = document.getElementById("login-form");
    if (loginForm) {
      loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const identityInput = document.getElementById("login-identity").value.trim();
        const passwordInput = document.getElementById("login-password").value;

        // Format validation
        const isEmail = identityInput.includes("@");
        const isValidEmail = isEmail && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identityInput);
        const isValidUsername = !isEmail && /^[a-zA-Z0-9_]{3,20}$/.test(identityInput);

        let errorMsg = document.getElementById("login-error-message");
        if (!errorMsg) {
          errorMsg = document.createElement("p");
          errorMsg.id = "login-error-message";
          errorMsg.style.color = "red";
          errorMsg.style.marginTop = "10px";
          loginForm.appendChild(errorMsg);
        }

        if (!isValidEmail && !isValidUsername) {
          errorMsg.textContent = "Please enter a valid email or username (3-20 characters, no spaces).";
          return;
        }

        if (passwordInput.length < 6) {
          errorMsg.textContent = "Password must be at least 6 characters.";
          return;
        }

        // Clear any previous errors
        errorMsg.textContent = "";

        try {
          // Perform actual login API call
          const response = await fetch("/api/login", {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              identity: identityInput,
              password: passwordInput
            })
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Login failed');
          }

          const data = await response.json();
          
          // Store authentication data (adapt to your actual auth system)
          localStorage.setItem('user', JSON.stringify(data.user));
          localStorage.setItem('token', data.token);

          // Handle successful login and redirect
          handleLoginSuccess();

        } catch (error) {
          errorMsg.textContent = error.message || 'Login failed. Please try again.';
        }
      });
    }
  }

  // Close Sign In modal when close button is clicked
  if (e.target.id === "close-login-modal") {
    document.querySelector(".signin-modal")?.remove();
    document.getElementById("login-page-blur-overlay").style.display = "none";
  }
});
