// profile.js
document.addEventListener('DOMContentLoaded', () => {
  // Only run on profile pages
  if (document.getElementById('account-template')) {
    loadUserProfile();
  }
});

async function loadUserProfile() {
  try {
    // 1. Get current user data
    const user = await fetchCurrentUser();
    
    // 2. Update profile section
    document.getElementById('account-username').textContent = user.username;
    document.getElementById('account-email').textContent = user.email;
    document.querySelector('.profile-card img').src = user.avatar || 'https://via.placeholder.com/150';
    
    // 3. Load stats
    document.getElementById('post-count').textContent = user.stats.posts;
    document.getElementById('comment-count').textContent = user.stats.comments;
    document.getElementById('like-count').textContent = user.stats.likes;
    document.getElementById('dislike-count').textContent = user.stats.dislikes;
    
    // 4. Load initial tab content (My Posts)
    loadTabContent('posts');
    
    // 5. Set up tab click handlers
    setupProfileTabs();
    
  } catch (error) {
    console.error('Failed to load profile:', error);
    // Show error message to user
  }
}

async function fetchCurrentUser() {
  const response = await fetch('/api/user/me', {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
  });
  return await response.json();
}

function setupProfileTabs() {
  const tabs = document.querySelectorAll('#accountTabs .nav-link');
  
  tabs.forEach(tab => {
    tab.addEventListener('click', (e) => {
      const tabId = e.target.id.replace('-tab', '');
      loadTabContent(tabId);
    });
  });
}

async function loadTabContent(tabName) {
  const spinner = `<div class="text-center py-4">
    <div class="spinner-border text-primary" role="status">
      <span class="visually-hidden">Loading...</span>
    </div>
  </div>`;
  
  const contentArea = document.getElementById(`${tabName}-content`);
  contentArea.innerHTML = spinner;
  
  try {
    const data = await fetch(`/api/user/${tabName}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    }).then(res => res.json());
    
    renderTabContent(tabName, data);
  } catch (error) {
    contentArea.innerHTML = `<div class="alert alert-danger">Failed to load ${tabName}</div>`;
  }
}

function renderTabContent(tabName, items) {
  const contentArea = document.getElementById(`${tabName}-content`);
  const listElement = contentArea.querySelector('.list-group') || contentArea;
  
  if (items.length === 0) {
    listElement.innerHTML = `<div class="alert alert-info">No ${tabName} found</div>`;
    return;
  }
  
  listElement.innerHTML = '';
  
  items.forEach(item => {
    const element = createListItem(tabName, item);
    listElement.appendChild(element);
  });
}

function createListItem(type, data) {
  const item = document.createElement('div');
  item.className = 'list-group-item';
  
  switch(type) {
    case 'posts':
      item.innerHTML = `
        <h5>${data.title}</h5>
        <p>${data.content.substring(0, 100)}...</p>
        <small class="text-muted">Posted on ${new Date(data.date).toLocaleDateString()}</small>
      `;
      break;
      
    case 'comments':
      item.innerHTML = `
        <p>${data.content}</p>
        <small class="text-muted">On post: ${data.postTitle}</small>
        <small class="text-muted d-block">Posted on ${new Date(data.date).toLocaleDateString()}</small>
      `;
      break;
      
    // Add cases for likes, dislikes, saved items
    default:
      item.textContent = JSON.stringify(data);
  }
  
  return item;
}
