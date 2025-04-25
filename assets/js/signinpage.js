document.addEventListener("click", (e) => {
  // Open Sign In modal when Sign In button is clicked
  if (e.target.id === "open-signin-page") {
    const template = document.getElementById("signin-template");
    const modal = template.content.cloneNode(true);
    document.body.appendChild(modal);

    // Remove the "hidden" class to show the modal
    document.querySelector(".signin-modal")?.classList.remove("hidden");

      // 👉 Show the background blur
      document.getElementById("login-page-blur-overlay").style.display = "block";


    // Attach submit listener AFTER modal is in DOM
    const loginForm = document.getElementById("login-form");
    if (loginForm) {
      loginForm.addEventListener("submit", (e) => {
        e.preventDefault();

        const identityInput = document.getElementById("login-identity").value.trim();
        const passwordInput = document.getElementById("login-password").value;

        // Format validation
        const isEmail = identityInput.includes("@");
        const isValidEmail = isEmail && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identityInput);
        const isValidUsername = !isEmail && /^[a-zA-Z0-9_]{3,20}$/.test(identityInput); // only letters, numbers, underscores

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

        // If validation passes, continue (this is where real backend call will go)
        errorMsg.textContent = "";
        alert("Login format is valid. Proceeding to backend check...");
        // You would typically call fetch("/api/login", { method: 'POST', ... }) here
      });
    }
  }

  // Close Sign In modal when close button is clicked
  if (e.target.id === "close-login-modal") {
    document.querySelector(".signin-modal")?.remove();

     // 👉 Hide the background blur
     document.getElementById("login-page-blur-overlay").style.display = "none";
  }
});
