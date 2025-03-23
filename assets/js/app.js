
  // Function to toggle dropdown
  function toggleDropdown(event, dropdownId) {
    event.preventDefault(); // Prevent default link behavior
    const dropdown = document.getElementById(dropdownId);
    dropdown.style.display = dropdown.style.display === "block" ? "none" : "block";
  }
  
  // Expose toggleDropdown to the global scope
  window.toggleDropdown = toggleDropdown;
