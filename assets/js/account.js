// assets/js/account.js
document.addEventListener('DOMContentLoaded', () => {
  initializeAccountPage();
});

function initializeAccountPage() {
  console.log('Initializing account page');
  
  // Load user data
  loadUserData();
  
  // Set up tab switching
  setupAccountTabs();
  
  // Load user posts and comments
  loadUserPosts();
  loadUserComments();
  
  // Set up form submission
  setupAccountForm();
}

function loadUserData() {
  const user = JSON.parse(localStorage.getItem('user'));
  if (user) {
    document.getElementById('account-username').textContent = user.username;
    document.getElementById('account-email').textContent = user.email;
    document.getElementById('first-name').value = user.firstName || '';
    document.getElementById('last-name').value = user.lastName || '';
    document.getElementById('email').value = user.email || '';
  }
}

function setupAccountTabs() {
  const tabButtons = document.querySelectorAll('.tab-button');
  tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      // Remove active class from all buttons and content
      document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
      
      // Add active class to clicked button and corresponding content
      button.classList.add('active');
      const tabId = button.dataset.tab + '-tab';
      document.getElementById(tabId).classList.add('active');
    });
  });
}

async function loadUserPosts() {
  try {
    const response = await fetch('/api/user/posts', {
      credentials: 'same-origin'
    });
    
    if (response.ok) {
      const posts = await response.json();
      const postsList = document.getElementById('user-posts-list');
      postsList.innerHTML = '';
      
      if (posts.length === 0) {
        postsList.innerHTML = '<p>You have not created any posts yet.</p>';
        return;
      }
      
      posts.forEach(post => {
        const postElement = document.createElement('div');
        postElement.className = 'post-item';
        postElement.innerHTML = `
          <h4><a href="#/post/${post.id}">${post.title}</a></h4>
          <p class="post-meta">Posted on ${new Date(post.created_at).toLocaleDateString()}</p>
          <p class="post-excerpt">${post.content.substring(0, 100)}...</p>
        `;
        postsList.appendChild(postElement);
      });
    }
  } catch (error) {
    console.error('Error loading user posts:', error);
  }
}

async function loadUserComments() {
  try {
    const response = await fetch('/api/user/comments', {
      credentials: 'same-origin'
    });
    
    if (response.ok) {
      const comments = await response.json();
      const commentsList = document.getElementById('user-comments-list');
      commentsList.innerHTML = '';
      
      if (comments.length === 0) {
        commentsList.innerHTML = '<p>You have not made any comments yet.</p>';
        return;
      }
      
      comments.forEach(comment => {
        const commentElement = document.createElement('div');
        commentElement.className = 'comment-item';
        commentElement.innerHTML = `
          <p class="comment-content">${comment.content}</p>
          <p class="comment-meta">
            Posted on ${new Date(comment.created_at).toLocaleDateString()} 
            in <a href="#/post/${comment.post_id}">post</a>
          </p>
        `;
        commentsList.appendChild(commentElement);
      });
    }
  } catch (error) {
    console.error('Error loading user comments:', error);
  }
}

function setupAccountForm() {
  const form = document.getElementById('account-settings-form');
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const formData = {
        first_name: document.getElementById('first-name').value,
        last_name: document.getElementById('last-name').value,
        email: document.getElementById('email').value
      };
      
      try {
        const response = await fetch('/api/user/update', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          credentials: 'same-origin',
          body: JSON.stringify(formData)
        });
        
        if (response.ok) {
          alert('Account updated successfully!');
          // Update local storage with new data
          const user = JSON.parse(localStorage.getItem('user'));
          user.firstName = formData.first_name;
          user.lastName = formData.last_name;
          user.email = formData.email;
          localStorage.setItem('user', JSON.stringify(user));
        } else {
          const error = await response.json();
          alert(`Error: ${error.message}`);
        }
      } catch (error) {
        console.error('Error updating account:', error);
        alert('Failed to update account. Please try again.');
      }
    });
  }
}
