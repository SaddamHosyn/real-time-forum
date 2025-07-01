// feed.js

class FeedManager {
  constructor() {
    this.currentPage = 1;
    this.postsPerPage = 10;
    this.isLoading = false;
    this.hasMorePosts = true;
    this.posts = [];
  }

  async initializeFeedPage() {
    console.log('Initializing feed page');
    this.setupInfiniteScroll();
    await this.loadInitialPosts();
  }

  async loadInitialPosts() {
    try {
      this.showLoading(true);
      const posts = await this.fetchPosts(1, this.postsPerPage);
      this.posts = posts;
      this.renderPosts(posts, true);
      this.setupLoadMoreButton();
    } catch (error) {
      console.error('Error loading initial posts:', error);
      this.showError('Failed to load posts. Please try again later.');
    } finally {
      this.showLoading(false);
    }
  }

  async loadMorePosts() {
    if (this.isLoading || !this.hasMorePosts) return;

    try {
      this.isLoading = true;
      this.showLoadMoreLoading(true);

      this.currentPage++;
      const newPosts = await this.fetchPosts(this.currentPage, this.postsPerPage);

      if (newPosts.length === 0) {
        this.hasMorePosts = false;
        this.showEndOfPosts();
      } else {
        this.posts = [...this.posts, ...newPosts];
        this.renderPosts(newPosts, false);
      }
    } catch (error) {
      console.error('Error loading more posts:', error);
      this.currentPage--; // Revert page increment
    } finally {
      this.isLoading = false;
      this.showLoadMoreLoading(false);
    }
  }

  async fetchPosts(page, limit) {
    const response = await fetch(`/api/feed/posts?page=${page}&limit=${limit}`, {
      credentials: 'include'
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();

    if (!data.success) {
      throw new Error('Failed to fetch posts');
    }

    this.hasMorePosts = data.has_more;
    return data.posts;
  }

  renderPosts(posts, clearContainer = false) {
    const container = document.getElementById('forum-posts-wrapper');
    if (!container) {
      console.error('Posts container not found');
      return;
    }

    if (clearContainer) {
      this.clearContainer(container);
    }

    posts.forEach(post => {
      const postElement = this.createPostElement(post);
      if (postElement) {
        container.appendChild(postElement);
      }
    });

    this.updateLoadMoreVisibility();
  }

  createPostElement(post) {
    const template = document.getElementById('forum-post-template');
    if (!template) {
      console.error('Post item template not found');
      return null;
    }

    const clone = document.importNode(template.content, true);

    // Set the post ID on the article element
    const articleElement = clone.querySelector('.forum-post-card');
    if (articleElement) {
      articleElement.setAttribute('data-post-id', post.id);
      
      // Make post clickable
      articleElement.style.cursor = 'pointer';
      articleElement.addEventListener('click', (e) => {
        // Prevent click if user clicked on buttons or interactive elements
        if (e.target.closest('button, .btn, .show-discussion')) {
          return;
        }
        
        // Load single post view
        if (window.loadSinglePost) {
          window.loadSinglePost(post.id);
        } else {
          console.error('loadSinglePost function not found');
        }
      });
    }

    // Fill post data with null checks
    const authorName = clone.querySelector('.post-creator-name');
    if (authorName) authorName.textContent = post.author || 'Unknown Author';

    const postDate = clone.querySelector('.post-timestamp');
    if (postDate) postDate.textContent = this.formatDate(post.created_at);

    const postTitle = clone.querySelector('.post-heading');
    if (postTitle) postTitle.textContent = post.title || 'Untitled';

    const postBody = clone.querySelector('.post-description');
    if (postBody) {
      const content = post.content || '';
      postBody.textContent = content.length > 200 ? content.substring(0, 200) + '...' : content;
    }

    // Update comment count only
    const commentCount = clone.querySelector('.discussion-count .total');
    if (commentCount) commentCount.textContent = post.comments_count || 0;

    // Add topics
    const topicsContainer = clone.querySelector('.post-categories');
    if (topicsContainer && post.topics && Array.isArray(post.topics)) {
      post.topics.forEach(topic => {
        const badge = this.createTopicBadge(topic);
        if (badge) {
          topicsContainer.appendChild(badge);
        }
      });
    }

    // Setup comments section (display only, no form)
    this.setupCommentsSection(clone, post);

    // Setup event listeners
    this.setupPostEventListeners(clone, post);

    return clone;
  }

  createTopicBadge(topicText) {
    const template = document.getElementById('category-label-template');
    if (!template) {
      console.error('Topic badge template not found');
      return null;
    }

    const clone = document.importNode(template.content, true);
    const badge = clone.querySelector('.category-tag');
    if (badge) {
      badge.textContent = topicText;
    }
    return clone;
  }

  setupCommentsSection(postElement, post) {
    const commentsSection = postElement.querySelector('.discussion-area');
    if (!commentsSection) return;

    const commentsList = commentsSection.querySelector('.discussion-thread');
    this.clearElement(commentsList);

    const comments = post.comments || [];
    
    console.log(`Setting up comments for post ${post.id}:`, comments.length, 'total comments');

    // Add all comments (display only)
    comments.forEach(comment => {
      const commentElement = this.createCommentElement(comment);
      if (commentElement) {
        commentsList.appendChild(commentElement);
      }
    });

    // ❌ REMOVED: Comment form functionality
  }

  createCommentElement(comment) {
    console.log('=== Creating comment element ===');
    console.log('Comment object:', comment);
    
    const template = document.getElementById('reply-item-template');
    if (!template) {
      console.error('Comment item template not found');
      return null;
    }

    const clone = document.importNode(template.content, true);
    
    // Set comment text
    const commentText = clone.querySelector('.reply-message');
    if (commentText) {
      const content = comment.content || '';
      console.log('Setting content:', content);
      
      // Clear any existing content and set new content
      commentText.innerHTML = '';
      commentText.textContent = content;
      
      // Force visibility
      commentText.style.display = 'block';
      commentText.style.visibility = 'visible';
      
      console.log('Content set successfully:', commentText.textContent);
    } else {
      console.error('Could not find .reply-message element');
      return null;
    }

    // Set author
    const commentAuthor = clone.querySelector('.reply-author');
    if (commentAuthor) {
      commentAuthor.textContent = comment.author || 'Anonymous';
    }

    // Set date  
    const commentDate = clone.querySelector('.reply-timestamp');
    if (commentDate) {
      commentDate.textContent = this.formatDate(comment.created_at);
    }

    return clone;
  }

  setupPostEventListeners(postElement, post) {
    // Toggle comments
    const toggleCommentsBtn = postElement.querySelector('.show-discussion');
    const commentsSection = postElement.querySelector('.discussion-area');

    if (toggleCommentsBtn && commentsSection) {
      toggleCommentsBtn.addEventListener('click', () => {
        commentsSection.classList.toggle('d-none');
        const isVisible = !commentsSection.classList.contains('d-none');

        this.clearElement(toggleCommentsBtn);
        const icon = document.createElement('i');
        icon.className = 'fas fa-comments me-1';
        const text = document.createTextNode(isVisible ? 'Hide Comments' : 'Comments');
        toggleCommentsBtn.appendChild(icon);
        toggleCommentsBtn.appendChild(text);
      });
    }
  }

  // ❌ REMOVED: addCommentForm method
  // ❌ REMOVED: handlePostComment method
  // ❌ REMOVED: findPostElementInDOM method (no longer needed for comments)

  setupLoadMoreButton() {
    const loadMoreBtn = document.getElementById('expand-feed-btn');
    if (loadMoreBtn) {
      const newBtn = loadMoreBtn.cloneNode(true);
      loadMoreBtn.parentNode.replaceChild(newBtn, loadMoreBtn);

      newBtn.addEventListener('click', () => {
        this.loadMorePosts();
      });
    }
  }

  setupInfiniteScroll() {
    window.addEventListener('scroll', () => {
      if (this.isLoading || !this.hasMorePosts) return;

      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight;
      const clientHeight = document.documentElement.clientHeight;

      if (scrollTop + clientHeight >= scrollHeight - 200) {
        this.loadMorePosts();
      }
    });
  }

  updateLoadMoreVisibility() {
    const loadMoreSection = document.getElementById('pagination-controls');
    if (loadMoreSection) {
      if (this.hasMorePosts && this.posts.length > 0) {
        loadMoreSection.classList.remove('d-none');
      } else {
        loadMoreSection.classList.add('d-none');
      }
    }
  }

  showLoading(show) {
    const loadingElement = document.getElementById('initial-loading');
    if (loadingElement) {
      loadingElement.style.display = show ? 'block' : 'none';
    }
  }

  showLoadMoreLoading(show) {
    const loadMoreLoading = document.getElementById('pagination-loading');
    const loadMoreBtn = document.getElementById('expand-feed-btn');

    if (loadMoreLoading && loadMoreBtn) {
      loadMoreLoading.classList.toggle('d-none', !show);
      loadMoreBtn.style.display = show ? 'none' : 'block';
    }
  }

  showEndOfPosts() {
    const endElement = document.getElementById('feed-end-message');
    const loadMoreSection = document.getElementById('pagination-controls');

    if (endElement) {
      endElement.classList.remove('d-none');
    }
    if (loadMoreSection) {
      loadMoreSection.classList.add('d-none');
    }
  }

  showError(message) {
    const container = document.getElementById('forum-posts-wrapper');
    if (container) {
      this.clearContainer(container);

      const alertDiv = document.createElement('div');
      alertDiv.className = 'alert alert-danger text-center';

      const icon = document.createElement('i');
      icon.className = 'fas fa-exclamation-triangle me-2';

      const text = document.createTextNode(message);

      alertDiv.appendChild(icon);
      alertDiv.appendChild(text);
      container.appendChild(alertDiv);
    }
  }

  clearContainer(container) {
    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }
  }

  clearElement(element) {
    while (element.firstChild) {
      element.removeChild(element.firstChild);
    }
  }

  formatDate(dateString) {
    if (!dateString) return 'Unknown date';

    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffTime = Math.abs(now - date);
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 0) {
        return 'today';
      } else if (diffDays === 1) {
        return '1 day ago';
      } else if (diffDays < 7) {
        return `${diffDays} days ago`;
      } else {
        return date.toLocaleDateString(undefined, {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        });
      }
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Unknown date';
    }
  }
}

// Initialize feed manager
const feedManager = new FeedManager();

function initializeFeedPage() {
  feedManager.initializeFeedPage();
}

function loadFeedContent() {
  feedManager.loadInitialPosts();
}

window.initializeFeedPage = initializeFeedPage;
window.loadFeedContent = loadFeedContent;
