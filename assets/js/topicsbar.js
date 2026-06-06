// topicsbar.js

// Global function for HTML onclick
window.navigateToTopic = function (topicSlug) {
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
window.initializeTopicsBarPage = function () {
  console.log('TopicsBar page initialized');
};

// Global function for rendering topic posts
window.renderPostsForTopic = function (topicSlug) {
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

  backButton.onclick = function () {
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

    commentsButton.onclick = function () {
      if (commentsContainer.style.display === 'none') {
        commentsContainer.style.display = 'block';
        commentsButton.textContent = 'Hide Comments';

        // Clear container
        while (commentsContainer.firstChild) {
          commentsContainer.removeChild(commentsContainer.firstChild);
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
                const template = document.getElementById('reply-item-template');
                if (template) {
                  const clone = document.importNode(template.content, true);

                  const commentText = clone.querySelector('.reply-message');
                  if (commentText) {
                    commentText.innerHTML = '';
                    commentText.textContent = comment.content;
                  }

                  const commentAuthor = clone.querySelector('.reply-author');
                  if (commentAuthor) {
                    commentAuthor.textContent = comment.author || 'Anonymous';
                  }

                  const commentDate = clone.querySelector('.reply-timestamp');
                  if (commentDate) {
                    commentDate.textContent = formatDate(comment.created_at);
                  }

                  commentsListDiv.appendChild(clone);
                } else {
                  const commentDiv = document.createElement('div');
                  commentDiv.className = 'reply-bubble p-2 bg-light rounded mb-2 border';

                  const metaDiv = document.createElement('div');
                  metaDiv.className = 'd-flex justify-content-between align-items-start mb-1';

                  const authorSpan = document.createElement('strong');
                  authorSpan.className = 'reply-author text-dark';
                  authorSpan.textContent = comment.author;

                  const dateSpan = document.createElement('small');
                  dateSpan.className = 'reply-timestamp text-muted ms-2';
                  dateSpan.textContent = formatDate(comment.created_at);

                  metaDiv.appendChild(authorSpan);
                  metaDiv.appendChild(dateSpan);

                  const contentP = document.createElement('p');
                  contentP.className = 'reply-message mb-0 text-dark';
                  contentP.textContent = comment.content;

                  commentDiv.appendChild(metaDiv);
                  commentDiv.appendChild(contentP);
                  commentsListDiv.appendChild(commentDiv);
                }
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
