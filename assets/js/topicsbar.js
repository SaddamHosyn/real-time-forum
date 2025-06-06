// topicsbar.js

// Global function for HTML onclick
window.navigateToTopic = function(topicSlug) {
  console.log(`Navigating to topic: ${topicSlug}`);
  if (window.navigateTo) {
    window.navigateTo(`topic/${topicSlug}`);
  } else {
    window.location.hash = `/topic/${topicSlug}`;
  }
};

// Topic mapping for backend API calls
const TOPIC_MAP = {
  'daily-essentials': 1,
  'home-lifestyle': 2,
  'personal-well-being': 3,
  'technology-innovation': 4,
  'leisure-entertainment': 5,
  'commerce-shopping': 6,
  'mobility-transportation': 7,
  'services-support': 8,
  'culture-community': 9,
  'information-learning': 10,
  'quick-recipes': 11,
  'nutrition-insights': 12
};

// Global function for router
window.initializeTopicsBarPage = function() {
  console.log('TopicsBar page initialized');
};

// Global function for rendering topic posts
window.renderPostsForTopic = function(topicSlug) {
  const appContent = document.getElementById('app-content');
  const template = document.getElementById('topic-posts-template');

  if (!appContent || !template) {
    console.error('Required elements not found');
    return;
  }

  const clone = document.importNode(template.content, true);
  const titleElement = clone.querySelector('.topic-posts-title');
  const contentElement = clone.querySelector('.topic-posts-content');
  const backButton = clone.querySelector('.btn-back-to-topics');

  const topicTitle = topicSlug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  titleElement.textContent = `Posts in: ${topicTitle}`;

  // Clear content and show loading using DOM methods
  while (contentElement.firstChild) {
    contentElement.removeChild(contentElement.firstChild);
  }
  
  const loadingWrapper = document.createElement('div');
  loadingWrapper.className = 'text-center';

  const spinner = document.createElement('div');
  spinner.className = 'spinner-border';
  spinner.setAttribute('role', 'status');

  const span = document.createElement('span');
  span.className = 'visually-hidden';
  span.textContent = 'Loading...';

  const message = document.createElement('p');
  message.className = 'mt-2';
  message.textContent = 'Loading posts...';

  spinner.appendChild(span);
  loadingWrapper.appendChild(spinner);
  loadingWrapper.appendChild(message);
  contentElement.appendChild(loadingWrapper);

  backButton.onclick = function() {
    if (window.navigateTo) {
      window.navigateTo('topicsbar');
    } else {
      window.location.hash = '/topicsbar';
    }
  };

  // Clear app content and append new template
  while (appContent.firstChild) {
    appContent.removeChild(appContent.firstChild);
  }
  appContent.appendChild(clone);

  const topicId = TOPIC_MAP[topicSlug];
  if (!topicId) {
    showTopicNotFound(topicSlug);
    return;
  }

  // Fetch posts
  fetch(`/api/posts/topic/${topicId}`, {
    method: 'GET',
    credentials: 'include'
  })
  .then(response => {
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
  })
  .then(data => {
    const posts = data.posts || [];
    renderTopicPostsHTML(posts);
  })
  .catch(error => {
    console.error('Error fetching posts:', error);
    showErrorMessage(error.message);
  });
};

function renderTopicPostsHTML(posts) {
  const contentElement = document.querySelector('.topic-posts-content');
  
  // Clear content using DOM methods
  while (contentElement.firstChild) {
    contentElement.removeChild(contentElement.firstChild);
  }


if (posts.length === 0) {
  const alert = document.createElement('div');
  alert.className = 'alert alert-info';

  const heading = document.createElement('h5');
  heading.textContent = 'No posts found';

  const paragraph = document.createElement('p');
  paragraph.textContent = 'No posts available in this topic yet.';

  alert.appendChild(heading);
  alert.appendChild(paragraph);
  contentElement.appendChild(alert);
  return;
}






  posts.forEach(post => {
    const card = document.createElement('div');
    card.className = 'post-card mb-3';

    const header = document.createElement('div');
    header.className = 'post-header';

    const title = document.createElement('h5');
    title.className = 'post-title';
    title.textContent = post.title;
    header.appendChild(title);

    const meta = document.createElement('div');
    meta.className = 'post-meta';

    const author = document.createElement('span');
    author.className = 'post-author';
    author.textContent = `By: ${post.author || 'Unknown'}`;

    const date = document.createElement('span');
    date.className = 'post-date';
    date.textContent = formatDate(post.created_at);

    meta.appendChild(author);
    meta.appendChild(date);
    header.appendChild(meta);
    card.appendChild(header);

    const body = document.createElement('div');
    body.className = 'post-content';

    const content = document.createElement('p');
    content.textContent = post.content;
    body.appendChild(content);
    card.appendChild(body);

    const topicsDiv = document.createElement('div');
    topicsDiv.className = 'post-topics';
    
    if (post.topics && post.topics.length > 0) {
      post.topics.forEach(topic => {
        const badge = document.createElement('span');
        badge.className = 'topic-badge';
        badge.textContent = topic;
        topicsDiv.appendChild(badge);
      });
    }

    card.appendChild(topicsDiv);

    // ADD COMMENT SECTION - SIMPLE VERSION
    const commentsSection = document.createElement('div');
    commentsSection.className = 'comments-section mt-3';
    
    const commentsButton = document.createElement('button');
    commentsButton.className = 'btn btn-sm btn-outline-primary';
    commentsButton.textContent = 'Show Comments';
    
    const commentsContainer = document.createElement('div');
    commentsContainer.style.display = 'none';
    commentsContainer.className = 'mt-2';
    
 commentsButton.onclick = function() {
  if (commentsContainer.style.display === 'none') {
    commentsContainer.style.display = 'block';
    commentsButton.textContent = 'Hide Comments';
    
    // Clear container
    while (commentsContainer.firstChild) {
      commentsContainer.removeChild(commentsContainer.firstChild);
    }
    
    // Add comment form (only if logged in)
    if (window.appState && window.appState.isAuthenticated) {
      const commentForm = document.createElement('form');
      commentForm.className = 'mb-3';
      
      const textarea = document.createElement('textarea');
      textarea.className = 'form-control mb-2';
      textarea.placeholder = 'Write a comment...';
      textarea.rows = 3;
      
      const submitBtn = document.createElement('button');
      submitBtn.type = 'submit';
      submitBtn.className = 'btn btn-primary btn-sm';
      submitBtn.textContent = 'Post Comment';
      
      commentForm.appendChild(textarea);
      commentForm.appendChild(submitBtn);
      
      commentForm.onsubmit = function(e) {
        e.preventDefault();
        const content = textarea.value.trim();
        
        if (content.length === 0) {
          alert('Comment cannot be empty');
          return;
        }
        
        submitBtn.disabled = true;
        submitBtn.textContent = 'Posting...';
        
        fetch('/api/comments/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ content: content, post_id: post.id })
        })
        .then(response => {
          if (!response.ok) throw new Error(`HTTP ${response.status}`);
          return response.json();
        })
        .then(data => {
          if (data.success) {
            textarea.value = '';
            alert('Comment posted successfully!');
            // Reload comments section
            commentsButton.click(); // This will refresh the comments
            commentsButton.click(); // And show them again
          }
        })
        .catch(error => {
          console.error('Error posting comment:', error);
          alert('Error posting comment');
        })
        .finally(() => {
          submitBtn.disabled = false;
          submitBtn.textContent = 'Post Comment';
        });
      };
      
      commentsContainer.appendChild(commentForm);
    } else {
      const loginMsg = document.createElement('p');
      loginMsg.className = 'text-muted';
      loginMsg.textContent = 'Please log in to post comments.';
      commentsContainer.appendChild(loginMsg);
    }
    
    // Add existing comments section
    const commentsListDiv = document.createElement('div');
    commentsListDiv.textContent = 'Loading existing comments...';
    commentsContainer.appendChild(commentsListDiv);
    
    // Fetch existing comments
    fetch(`/api/posts/${post.id}/comments`, {
      method: 'GET',
      credentials: 'include'
    })
    .then(response => {
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return response.json();
    })
    .then(data => {
      const comments = data.comments || [];
      commentsListDiv.textContent = '';
      
      if (comments.length === 0) {
        commentsListDiv.textContent = 'No comments yet. Be the first to comment!';
      } else {
        comments.forEach(comment => {
          const commentDiv = document.createElement('div');
          commentDiv.className = 'border-start border-3 ps-3 mb-2';
          commentDiv.style.borderColor = '#007bff';
          
          const authorSpan = document.createElement('small');
          authorSpan.className = 'text-muted fw-bold';
          authorSpan.textContent = comment.author;
          
          const dateSpan = document.createElement('small');
          dateSpan.className = 'text-muted ms-2';
          dateSpan.textContent = formatDate(comment.created_at);
          
          const contentP = document.createElement('p');
          contentP.className = 'mb-1';
          contentP.textContent = comment.content;
          
          commentDiv.appendChild(authorSpan);
          commentDiv.appendChild(dateSpan);
          commentDiv.appendChild(contentP);
          commentsListDiv.appendChild(commentDiv);
        });
      }
    })
    .catch(error => {
      console.error('Error loading comments:', error);
      commentsListDiv.textContent = 'Error loading comments';
    });
    
  } else {
    commentsContainer.style.display = 'none';
    commentsButton.textContent = 'Show Comments';
  }
};

    
    commentsSection.appendChild(commentsButton);
    commentsSection.appendChild(commentsContainer);
    card.appendChild(commentsSection);

    contentElement.appendChild(card);
  });
}

function showTopicNotFound(topicSlug) {
  const contentElement = document.querySelector('.topic-posts-content');
  
  while (contentElement.firstChild) {
    contentElement.removeChild(contentElement.firstChild);
  }

  const alert = document.createElement('div');
  alert.className = 'alert alert-warning';

  const heading = document.createElement('h5');
  heading.textContent = 'Topic Not Found';

  const paragraph = document.createElement('p');
  paragraph.textContent = `The requested topic "${topicSlug}" was not found.`;

  alert.appendChild(heading);
  alert.appendChild(paragraph);
  contentElement.appendChild(alert);
}

function showErrorMessage(message) {
  const contentElement = document.querySelector('.topic-posts-content');
  
  while (contentElement.firstChild) {
    contentElement.removeChild(contentElement.firstChild);
  }

  const alert = document.createElement('div');
  alert.className = 'alert alert-danger';

  const heading = document.createElement('h5');
  heading.textContent = 'Error Loading Posts';

  const paragraph = document.createElement('p');
  paragraph.textContent = message;

  alert.appendChild(heading);
  alert.appendChild(paragraph);
  contentElement.appendChild(alert);
}

function formatDate(dateString) {
  if (!dateString) return 'Unknown date';
  return new Date(dateString).toLocaleDateString();
}
