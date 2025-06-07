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
    const container = document.getElementById('posts-container');
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
    const template = document.getElementById('post-item-template');
    if (!template) {
      console.error('Post item template not found');
      return null;
    }

    const clone = document.importNode(template.content, true);

    // Fill post data with null checks
    const authorName = clone.querySelector('.author-name');
    if (authorName) authorName.textContent = post.author || 'Unknown Author';

    const postDate = clone.querySelector('.post-date');
    if (postDate) postDate.textContent = this.formatDate(post.created_at);

    const postTitle = clone.querySelector('.post-title');
    if (postTitle) postTitle.textContent = post.title || 'Untitled';

    const postBody = clone.querySelector('.post-body');
    if (postBody) {
      const content = post.content || '';
      postBody.textContent = content.length > 200 ? content.substring(0, 200) + '...' : content;
    }

    // Update comment count only
    const commentCount = clone.querySelector('.comment-count .count');
    if (commentCount) commentCount.textContent = post.comments_count || 0;

    // Add topics
    const topicsContainer = clone.querySelector('.post-topics');
    if (topicsContainer && post.topics && Array.isArray(post.topics)) {
      post.topics.forEach(topic => {
        const badge = this.createTopicBadge(topic);
        if (badge) {
          topicsContainer.appendChild(badge);
        }
      });
    }

    // Setup comments section
    this.setupCommentsSection(clone, post);

    // Setup event listeners
    this.setupPostEventListeners(clone, post);

    return clone;
  }

  createTopicBadge(topicText) {
    const template = document.getElementById('topic-badge-template');
    if (!template) {
      console.error('Topic badge template not found');
      return null;
    }

    const clone = document.importNode(template.content, true);
    const badge = clone.querySelector('.topic-badge');
    if (badge) {
      badge.textContent = topicText;
    }
    return clone;
  }

setupCommentsSection(postElement, post) {
  const commentsSection = postElement.querySelector('.comments-section');
  if (!commentsSection) return;

  const commentsList = commentsSection.querySelector('.comments-list');
  
  // Render existing comments
  const comments = post.comments || post.recent_comments || [];
  if (commentsList && Array.isArray(comments)) {
    comments.slice(0, 5).forEach(comment => { // Show first 5 comments
      const commentElement = this.createCommentElement(comment);
      if (commentElement) {
        commentsList.appendChild(commentElement);
      }
    });

    // Show "Load More Comments" if there are more than 5 comments
    if (comments.length > 5) {
      const loadMoreSection = commentsSection.querySelector('.load-more-comments');
      if (loadMoreSection) {
        loadMoreSection.classList.remove('d-none');
      }
    }
  }
}

  createCommentElement(comment) {
    const template = document.getElementById('comment-item-template');
    if (!template) {
      console.error('Comment item template not found');
      return null;
    }

    const clone = document.importNode(template.content, true);

    const commentAuthor = clone.querySelector('.comment-author');
    if (commentAuthor) {
      commentAuthor.textContent = comment.author || 'Anonymous';
    }

    const commentDate = clone.querySelector('.comment-date');
    if (commentDate) {
      commentDate.textContent = this.formatDate(comment.created_at);
    }

    const commentText = clone.querySelector('.comment-text');
    if (commentText) {
      commentText.textContent = comment.content || '';
    }

    return clone;
  }





setupPostEventListeners(postElement, post) {
  // Toggle comments
  const toggleCommentsBtn = postElement.querySelector('.toggle-comments');
  const commentsSection = postElement.querySelector('.comments-section');
  
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

// Update the createCommentElement method
createCommentElement(comment) {
  const template = document.getElementById('comment-item-template');
  if (!template) {
    console.error('Comment item template not found');
    return null;
  }

  const clone = document.importNode(template.content, true);

  const commentAuthor = clone.querySelector('.comment-author');
  if (commentAuthor) {
    commentAuthor.textContent = comment.author || 'Anonymous';
  }

  const commentDate = clone.querySelector('.comment-date');
  if (commentDate) {
    commentDate.textContent = this.formatDate(comment.created_at);
  }

  const commentText = clone.querySelector('.comment-text');
  if (commentText) {
    commentText.textContent = comment.content || '';
  }

  return clone;
}







  async handlePostComment(postId, commentInput, postElement) {
    const content = commentInput.value.trim();
    if (!content) return;

    try {
      const response = await fetch('/api/comments/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ post_id: postId, content })
      });

      if (!response.ok) {
        throw new Error('Failed to post comment');
      }

      const result = await response.json();
      
      if (result.success) {
        const newComment = {
          id: result.comment_id,
          content: content,
          author: window.appState.user?.username || 'Current User',
          created_at: new Date().toISOString()
        };

        const commentsList = postElement.querySelector('.comments-list');
        if (commentsList) {
          const commentElement = this.createCommentElement(newComment);
          if (commentElement) {
            commentsList.appendChild(commentElement);
          }
        }

        const commentCountElement = postElement.querySelector('.comment-count .count');
        if (commentCountElement) {
          const currentCount = parseInt(commentCountElement.textContent) || 0;
          commentCountElement.textContent = currentCount + 1;
        }

        commentInput.value = '';
      }

    } catch (error) {
      console.error('Error posting comment:', error);
      alert('Failed to post comment. Please try again.');
    }
  }

  setupLoadMoreButton() {
    const loadMoreBtn = document.getElementById('load-more-btn');
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
    const loadMoreSection = document.getElementById('load-more-section');
    if (loadMoreSection) {
      if (this.hasMorePosts && this.posts.length > 0) {
        loadMoreSection.classList.remove('d-none');
      } else {
        loadMoreSection.classList.add('d-none');
      }
    }
  }

  showLoading(show) {
    const loadingElement = document.getElementById('feed-loading');
    if (loadingElement) {
      loadingElement.style.display = show ? 'block' : 'none';
    }
  }

  showLoadMoreLoading(show) {
    const loadMoreLoading = document.getElementById('load-more-loading');
    const loadMoreBtn = document.getElementById('load-more-btn');
    
    if (loadMoreLoading && loadMoreBtn) {
      loadMoreLoading.classList.toggle('d-none', !show);
      loadMoreBtn.style.display = show ? 'none' : 'block';
    }
  }

  showEndOfPosts() {
    const endElement = document.getElementById('end-of-posts');
    const loadMoreSection = document.getElementById('load-more-section');
    
    if (endElement) {
      endElement.classList.remove('d-none');
    }
    if (loadMoreSection) {
      loadMoreSection.classList.add('d-none');
    }
  }

  showError(message) {
    const container = document.getElementById('posts-container');
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
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        return 'Yesterday';
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
