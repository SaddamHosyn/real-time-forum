
  // Function to toggle dropdown
  function toggleDropdown(event, dropdownId) {
    event.preventDefault(); // Prevent default link behavior
    const dropdown = document.getElementById(dropdownId);
    dropdown.style.display = dropdown.style.display === "block" ? "none" : "block";
  }
  
  // Expose toggleDropdown to the global scope
  window.toggleDropdown = toggleDropdown;





  // login page
function openLoginPopup() {
    // Fetch the login.html content
    fetch('../login.html')
      .then(response => response.text())
      .then(html => {
        // Create a container for the login popup
        const popupContainer = document.createElement('div');
        popupContainer.classList.add('login-popup');
        popupContainer.innerHTML = html;
  
        // Append the popup to the body
        document.body.appendChild(popupContainer);
  
        // Attach form submission handler
        const loginForm = document.getElementById('login-form');
        if (loginForm) {
          loginForm.addEventListener('submit', handleLoginFormSubmit);
        }
      })
      .catch(error => console.error('Error loading login page:', error));
  }
  
  function closeLoginPopup() {
    const popup = document.querySelector('.login-popup');
    if (popup) {
      popup.remove();
    }
  }
  
  function handleLoginFormSubmit(event) {
    event.preventDefault();
  
    const formData = new FormData(event.target);
    const loginData = {
      email: formData.get('email'),
      password: formData.get('password'),
    };
  
    // Simulate sending data to the server
    console.log('Login Data:', loginData);
  
    // Close the popup after submission
    closeLoginPopup();
  }
  
  // Expose functions to the global scope
  window.openLoginPopup = openLoginPopup;
  window.closeLoginPopup = closeLoginPopup;






  // register page
function openRegisterPopup() {
    fetch('../register.html')
      .then(response => response.text())
      .then(html => {
        const popupContainer = document.createElement('div');
        popupContainer.classList.add('register-popup');
        popupContainer.innerHTML = html;
        document.body.appendChild(popupContainer);
  
        const registerForm = document.getElementById('register-form');
        if (registerForm) {
          registerForm.addEventListener('submit', handleRegisterFormSubmit);
        }
      })
      .catch(error => console.error('Error loading registration page:', error));
  }
  
  function closeRegisterPopup() {
    const popup = document.querySelector('.register-popup');
    if (popup) {
      popup.remove();
    }
  }
  
  function handleRegisterFormSubmit(event) {
    event.preventDefault();
  
    const formData = new FormData(event.target);
    const registerData = {
      nickname: formData.get('nickname'),
      email: formData.get('email'),
      password: formData.get('password'),
      age: formData.get('age'),
      gender: formData.get('gender'),
      firstName: formData.get('first-name'),
      lastName: formData.get('last-name'),
    };
  
    // Simulate sending data to the server
    console.log('Registration Data:', registerData);
  
    // Close the popup after submission
    closeRegisterPopup();
  }
  
  // Expose functions to the global scope
  window.openRegisterPopup = openRegisterPopup;
  window.closeRegisterPopup = closeRegisterPopup; 




  // main.js or a separate slider.js file
let currentIndex = 0;

function moveSlider(direction) {
  const slider = document.querySelector(".slider");
  const posts = document.querySelectorAll(".post");
  const totalPosts = posts.length;
  const postWidth = posts[0].offsetWidth + 20; // Include margin

  currentIndex += direction;

  // Handle boundary cases
  if (currentIndex < 0) {
    currentIndex = totalPosts - 1;
  } else if (currentIndex >= totalPosts) {
    currentIndex = 0;
  }

  // Move the slider
  slider.style.transform = `translateX(${-currentIndex * postWidth}px)`;
}

