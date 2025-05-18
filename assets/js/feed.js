// feed.js

function initializeFeedPage() {
  console.log('Initializing feed page');
  loadFeedContent();
}

async function loadFeedContent() {
  try {
    // Get the posts container
    const postsContainer = document.getElementById('posts-container');
    if (!postsContainer) {
      console.error('Posts container not found');
      return;
    }

    // Clear any existing content
    postsContainer.innerHTML = '';

    // Fetch posts (in a real app this would be an API call)
    // For now, we'll use mock data
    const posts = await fetchMockPosts();
    
    if (posts.length === 0) {
      postsContainer.innerHTML = '<p class="text-center">No posts available yet.</p>';
      return;
    }

    // Render each post
    posts.forEach(post => {
      const postElement = createPostElement(post);
      postsContainer.appendChild(postElement);
    });

  } catch (error) {
    console.error('Error loading feed:', error);
    const postsContainer = document.getElementById('posts-container');
    if (postsContainer) {
      postsContainer.innerHTML = '<p class="text-center text-danger">Failed to load posts. Please try again later.</p>';
    }
  }
}

// Function to create a post element
function createPostElement(post) {
  const postDiv = document.createElement('div');
  postDiv.className = 'post-card';
  postDiv.dataset.postId = post.id;

  const postHeader = document.createElement('div');
  postHeader.className = 'post-header';

  const title = document.createElement('h3');
  title.className = 'post-title';
  const titleLink = document.createElement('a');
  titleLink.href = `#/post/${post.id}`;
  titleLink.textContent = post.title;
  title.appendChild(titleLink);

  const postMeta = document.createElement('div');
  postMeta.className = 'post-meta';
  postMeta.innerHTML = `
    <span class="post-author">Posted by ${post.author}</span>
    <span class="post-date">${formatDate(post.created_at)}</span>
  `;

  const postContent = document.createElement('div');
  postContent.className = 'post-content';
  postContent.textContent = post.content;

  const postFooter = document.createElement('div');
  postFooter.className = 'post-footer';
  postFooter.innerHTML = `
    <div class="post-stats">
      <span class="post-comments">${post.comment_count} comments</span>
      <span class="post-likes">${post.likes} likes</span>
    </div>
    <div class="post-actions">
      <button class="btn btn-sm btn-outline-primary">Like</button>
      <button class="btn btn-sm btn-outline-secondary">Comment</button>
      <button class="btn btn-sm btn-outline-info">Share</button>
    </div>
  `;

  // Assemble the post
  postHeader.appendChild(title);
  postHeader.appendChild(postMeta);
  postDiv.appendChild(postHeader);
  postDiv.appendChild(postContent);
  postDiv.appendChild(postFooter);

  return postDiv;
}

// Helper function to format dates
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString(undefined, { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

// Mock data function - replace with actual API call in production
async function fetchMockPosts() {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  return [
    {
      id: 1,
      title: 'Welcome to the Forum',
      author: 'admin',
      created_at: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
      content: 'Welcome to our new community forum! This is a place to discuss topics, share ideas, and connect with others. Feel free to introduce yourself.',
      comment_count: 5,
      likes: 12
    },
    {
      id: 2,
      title: 'How to use the forum features',
      author: 'moderator',
      created_at: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
      content: 'This post explains all the features available on our forum: how to create posts, comment, like content, and adjust your profile settings.',
      comment_count: 8,
      likes: 24
    },
    {
      id: 3,
      title: 'Weekend Discussion Thread',
      author: 'community_manager',
      created_at: new Date(Date.now() - 43200000).toISOString(), // 12 hours ago
      content: 'Use this thread to discuss anything that happened over the weekend or share your plans for the upcoming week!',
      comment_count: 15,
      likes: 7
    }
  ];
}

// Make the function available globally
window.initializeFeedPage = initializeFeedPage;
