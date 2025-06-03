// createpost.js
(function () {
  console.log('Create Post module loaded');

  if (!window.posts) window.posts = [];

  window.initializeCreatePostPage = function() {
    console.log('Initializing create post page');
    setupCreatePostForm();
  };

  function setupCreatePostForm() {
    const appContainer = document.getElementById('app-content');
    if (!appContainer) {
      console.error('App container element not found in setupCreatePostForm!');
      return;
    }

    const form = appContainer.querySelector('#form-create-post');
    if (!form) {
      console.error('Create post form not found!');
      return;
    }

    const closeBtn = appContainer.querySelector('.btn-close-create-post');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        window.navigateTo('home');
      });
    }

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
    updateCheckboxStates();

    const inputs = form.querySelectorAll('input[type="text"], textarea, input[type="checkbox"]');
    inputs.forEach(input => {
      input.addEventListener('input', () => {
        const errorContainer = form.querySelector('.validation-errors');
        if (errorContainer) errorContainer.style.display = 'none';
      });
    });

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
        return;
      }

      const newPost = {
        title,
        content,
        topics: checkedTopics.map(cb => parseInt(cb.value, 10)),
        createdAt: new Date().toISOString()
      };

      fetch('/api/create-post', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include', // include session_token cookie
        body: JSON.stringify(newPost)
      })
      .then(response => {
        if (!response.ok) {
          // If the server returned 401 (or any other error), read it as text
          return response.text().then(errText => {
            throw new Error(errText || `HTTP ${response.status}`);
          });
        }
        // Otherwise parse JSON normally
        return response.json();
      })
      .then(data => {
        // At this point data is guaranteed to be a parsed JSON object
        if (data.success) {
          console.log("Post created successfully in DB:", data);
          window.navigateTo('home');
        } else {
          // In case your handler ever returns { success: false, errors: [...] }
          throw new Error(data.errors ? data.errors.join(', ') : data.message || "Unknown error");
        }
      })
      .catch(err => {
        console.error("Error creating post:", err);
        const errorContainer = form.querySelector('.validation-errors');
        errorContainer.innerHTML = `<p class="error">Failed to create post: ${err.message}</p>`;
        errorContainer.style.display = 'block';
      });
    });
  }
})();
