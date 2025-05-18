// createpost.js
(function () {
    console.log('Create Post module loaded');
    
    // ✅ Initialize posts array on window to ensure persistence
    if (!window.posts) window.posts = [];
    
    // ✅ This function will be called by router.js when the page is loaded
    window.initializeCreatePostPage = function() {
        console.log('Initializing create post page');
        setupCreatePostForm();
    };
    
    // ✅ Setup form functionality
    function setupCreatePostForm() {
        // Get container when we need it (not at initialization)
        const appContainer = document.getElementById('app-content');
        if (!appContainer) {
            console.error('App container element not found in setupCreatePostForm!');
            return;
        }
        
        // Get form - should be in the DOM after template injection by router
        const form = appContainer.querySelector('#form-create-post');
        if (!form) {
            console.error('Create post form not found!');
            return;
        }
        
        // ✅ Close button functionality
        const closeBtn = appContainer.querySelector('.btn-close-create-post');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                window.navigateTo('home');
            });
        }
        
        // ✅ Topic selection logic - limit to 3
        const topicCheckboxes = Array.from(form.querySelectorAll('input[name="create-post-topic"]'));
        const topicLabels = topicCheckboxes.map(cb => cb.closest('label'));
        
        function updateCheckboxStates() {
            const checkedCount = topicCheckboxes.filter(cb => cb.checked).length;
            
            topicCheckboxes.forEach((checkbox, index) => {
                if (!checkbox.checked && checkedCount >= 3) {
                    checkbox.disabled = true;
                    topicLabels[index].classList.add('disabled');
                } else {
                    checkbox.disabled = false;
                    topicLabels[index].classList.remove('disabled');
                }
            });
        }
        
        topicCheckboxes.forEach(cb => cb.addEventListener('change', updateCheckboxStates));
        updateCheckboxStates(); // Initialize state on load
        
        // Clear validation errors on input
        const inputs = form.querySelectorAll('input[type="text"], textarea, input[type="checkbox"]');
        inputs.forEach(input => {
            input.addEventListener('input', () => {
                const errorContainer = form.querySelector('.validation-errors');
                if (errorContainer) errorContainer.style.display = 'none';
            });
        });
        
        // Form submission
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const title = form.querySelector('#input-create-post-title').value.trim();
            const content = form.querySelector('#textarea-create-post-content').value.trim();
            const checkedTopics = topicCheckboxes.filter(cb => cb.checked);
            
            let errors = [];
            if (title.length < 10) errors.push("Title must be at least 10 characters long.");
            if (checkedTopics.length !== 3) errors.push("Select exactly 3 topics.");
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
                const newPost = {
                    title,
                    content,
                    topics: checkedTopics.map(cb => cb.value),
                    createdAt: new Date().toISOString()
                };
                
                window.posts.push(newPost);
                console.log("Post created:", newPost);
                window.navigateTo('home');
            }
        });
    }
    
    // ✅ REMOVE renderHome function completely - it's conflicting with router.js
    
    // We don't need a router here - the main router.js will handle this
})();
