// createpost.js
(function() {
   let currentModal = null;
 
   function setupModalCloseHandlers() {
     if (!currentModal) return;
 
     // Close button
     const closeBtn = currentModal.querySelector('.create-post-close-btn');
     if (closeBtn) {
       closeBtn.addEventListener('click', () => {
         currentModal.remove();
         currentModal = null;
       });
     }
 
     // Click outside to close
     currentModal.addEventListener('click', (e) => {
       if (e.target === currentModal) {
         currentModal.remove();
         currentModal = null;
       }
     });
   }
 
   function setupCreatePostForm() {
     if (!currentModal) return;
 
     const form = currentModal.querySelector('#form-create-post');
     if (!form) return;
 
     // Get all topic checkboxes and their labels
     const topicCheckboxes = Array.from(form.querySelectorAll('input[name="create-post-topic"]'));
     const topicLabels = Array.from(form.querySelectorAll('label[for^="create-post-topic-"]'));
 
     // Function to update checkbox states
     function updateCheckboxStates() {
       const checkedCount = topicCheckboxes.filter(cb => cb.checked).length;
       
       if (checkedCount >= 3) {
         // If 3+ checked, disable and blur unselected checkboxes
         topicCheckboxes.forEach((checkbox, index) => {
           if (!checkbox.checked) {
             checkbox.disabled = true;
             if (topicLabels[index]) {
               topicLabels[index].style.opacity = '0.5';
               topicLabels[index].style.filter = 'blur(1px)';
               topicLabels[index].style.pointerEvents = 'none';
             }
           }
         });
       } else {
         // If less than 3 checked, enable all checkboxes
         topicCheckboxes.forEach((checkbox, index) => {
           checkbox.disabled = false;
           if (topicLabels[index]) {
             topicLabels[index].style.opacity = '1';
             topicLabels[index].style.filter = 'none';
             topicLabels[index].style.pointerEvents = 'auto';
           }
         });
       }
     }
 
     // Add event listeners to all checkboxes
     topicCheckboxes.forEach(checkbox => {
       checkbox.addEventListener('change', updateCheckboxStates);
     });
 
     // Initialize the state
     updateCheckboxStates();
 
     // Clear validation errors on input
     const inputs = form.querySelectorAll('input[type="text"], textarea, input[type="checkbox"]');
     inputs.forEach(input => {
       input.addEventListener('input', () => {
         const errorContainer = form.querySelector('.validation-errors');
         if (errorContainer) errorContainer.style.display = 'none';
       });
     });
 
     // Form validation
     form.addEventListener('submit', (e) => {
       e.preventDefault();
 
       const title = form.querySelector('#input-create-post-title').value.trim();
       const content = form.querySelector('#textarea-create-post-content').value.trim();
       const checkedTopics = topicCheckboxes.filter(cb => cb.checked);
 
       let errors = [];
       if (title.length < 10) errors.push("Title must be at least 10 characters long.");
       if (checkedTopics.length < 3) errors.push("Select at least 3 topics.");
       if (content.length < 20) errors.push("Content must be at least 20 characters long.");
 
       const errorContainer = form.querySelector('.validation-errors');
       if (errors.length > 0) {
         errorContainer.innerHTML = '';
         const errorList = document.createElement('ul');
         errorList.classList.add('error-list');
         errors.forEach(error => {
           const li = document.createElement('li');
           li.textContent = error;
           errorList.appendChild(li);
         });
         errorContainer.appendChild(errorList);
         errorContainer.style.display = 'block';
       } else {
         console.log("Form submitted successfully!", { 
           title, 
           content, 
           topics: checkedTopics.map(cb => cb.value) 
         });
         currentModal.remove();
         currentModal = null;
       }
     });
   }
 
   function handleCreatePostClick(e) {
     e.preventDefault();
     
     const template = document.getElementById('template-create-post-modal');
     if (!template) return;
 
     currentModal = document.createElement('div');
     currentModal.classList.add('modal-overlay');
     currentModal.appendChild(template.content.cloneNode(true));
     document.body.appendChild(currentModal);
 
     setupModalCloseHandlers();
     setupCreatePostForm();
   }
 
   // Initialize create post functionality
   document.addEventListener('DOMContentLoaded', () => {
     // Find all create post buttons/links
     const createPostTriggers = document.querySelectorAll('[data-page="template-create-post-modal"]');
     
     createPostTriggers.forEach(trigger => {
       trigger.addEventListener('click', handleCreatePostClick);
     });
   });
 })();
