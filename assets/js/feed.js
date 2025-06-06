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

// Update the fetchPosts function in your feed.js
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
  
  // Update hasMorePosts based on server response
  this.hasMorePosts = data.has_more;
  
  return data.posts;
}

  generateMockPosts(page, limit) {
    const posts = [];
    const startIndex = (page - 1) * limit;
    
    for (let i = 0; i < limit; i++) {
      const postIndex = startIndex + i + 1;
      if (postIndex > 50) break; // Simulate finite data
      
      posts.push({
        id: postIndex,
        title: `Interesting Discussion Topic #${postIndex}`,
        content: `This is the content of post #${postIndex}. It contains valuable information and sparks meaningful discussions among community members. The post covers various aspects of the topic and encourages engagement.`,
        author: `User${Math.floor(Math.random() * 100) + 1}`,
        created_at: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
        topics: this.getRandomTopics(),
        comments_count: Math.floor(Math.random() * 20),
        likes_count: Math.floor(Math.random() * 50),
        views_count: Math.floor(Math.random() * 200) + 50,
        comments: this.generateMockComments(Math.floor(Math.random() * 5) + 1)
      });
    }
    
    return posts;
  }

  generateMockComments(count) {
    const comments = [];
    for (let i = 0; i < count; i++) {
      comments.push({
        id: Math.random().toString(36).substr(2, 9),
        content: `This is a thoughtful comment #${i + 1} that adds value to the discussion.`,
        author: `Commenter${Math.floor(Math.random() * 50) + 1}`,
        created_at: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString(),
        likes_count: Math.floor(Math.random() * 10)
      });
    }
    return comments;
  }

  getRandomTopics() {
    const allTopics = [
      'Technology', 'Science', 'Programming', 'Health', 'Travel',
      'Food', 'Sports', 'Movies', 'Books', 'Music', 'Art', 'Politics'
    ];
    const count = Math.floor(Math.random() * 3) + 1;
    const shuffled = allTopics.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }

  renderPosts(posts, clearContainer = false) {
    const container = document.getElementById('posts-container');
    if (!container) return;

    if (clearContainer) {
      this.clearContainer(container);
    }

    posts.forEach(post => {
      const postElement = this.createPostElement(post);
      container.appendChild(postElement);
    });

    this.updateLoadMoreVisibility();
  }

  createPostElement(post) {
    const template = document.getElementById('post-item-template');
    const clone = document.importNode(template.content, true);

    // Fill post data
    clone.querySelector('.author-name').textContent = post.author;
    clone.querySelector('.post-date').textContent = this.formatDate(post.created_at);
    clone.querySelector('.post-title').textContent = post.title;
    clone.querySelector('.post-body').textContent = post.content;
    
    // Update stats
    clone.querySelector('.comment-count .count').textContent = post.comments_count;
    clone.querySelector('.like-count .count').textContent = post.likes_count;
    clone.querySelector('.view-count .count').textContent = post.views_count;
    
    // Add topics
    const topicsContainer = clone.querySelector('.post-topics');
    post.topics.forEach(topic => {
      const badge = this.createTopicBadge(topic);
      topicsContainer.appendChild(badge);
    });

    // Setup comments
    this.setupCommentsSection(clone, post);

    // Setup event listeners
    this.setupPostEventListeners(clone, post);

    return clone;
  }

  createTopicBadge(topicText) {
    const template = document.getElementById('topic-badge-template');
    const clone = document.importNode(template.content, true);
    clone.querySelector('.topic-badge').textContent = topicText;
    return clone;
  }

  setupCommentsSection(postElement, post) {
    const commentsSection = postElement.querySelector('.comments-section');
    const commentsList = commentsSection.querySelector('.comments-list');
    const commentsCountElement = commentsSection.querySelector('.comments-count');
    
    commentsCountElement.textContent = `${post.comments_count} comments`;

    // Render existing comments
    post.comments.slice(0, 3).forEach(comment => { // Show first 3 comments
      const commentElement = this.createCommentElement(comment);
      commentsList.appendChild(commentElement);
    });

    // Show "Load More Comments" if there are more than 3 comments
    if (post.comments.length > 3) {
      const loadMoreSection = commentsSection.querySelector('.load-more-comments');
      loadMoreSection.classList.remove('d-none');
    }
  }

  createCommentElement(comment) {
    const template = document.getElementById('comment-item-template');
    const clone = document.importNode(template.content, true);

    clone.querySelector('.comment-author').textContent = comment.author;
    clone.querySelector('.comment-date').textContent = this.formatDate(comment.created_at);
    clone.querySelector('.comment-text').textContent = comment.content;

    return clone;
  }

  setupPostEventListeners(postElement, post) {
    // Toggle comments
    const toggleCommentsBtn = postElement.querySelector('.toggle-comments');
    const commentsSection = postElement.querySelector('.comments-section');
    
    toggleCommentsBtn.addEventListener('click', () => {
      commentsSection.classList.toggle('d-none');
      const isVisible = !commentsSection.classList.contains('d-none');
      
      // Clear and rebuild button content using DOM methods
      this.clearElement(toggleCommentsBtn);
      const icon = document.createElement('i');
      icon.className = 'fas fa-comments me-1';
      const text = document.createTextNode(isVisible ? 'Hide Comments' : 'Comments');
      toggleCommentsBtn.appendChild(icon);
      toggleCommentsBtn.appendChild(text);
    });

    // Post comment
    const postCommentBtn = postElement.querySelector('.post-comment-btn');
    const commentInput = postElement.querySelector('.comment-input');
    
    postCommentBtn.addEventListener('click', () => {
      this.handlePostComment(post.id, commentInput, postElement);
    });

    // Like post
    const likeBtn = postElement.querySelector('.like-btn');
    likeBtn.addEventListener('click', () => {
      this.handleLikePost(post.id, likeBtn);
    });
  }

  async handlePostComment(postId, commentInput, postElement) {
    const content = commentInput.value.trim();
    if (!content) return;

    try {
      // TODO: Replace with actual API call
      // const response = await fetch('/api/comments/create', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   credentials: 'include',
      //   body: JSON.stringify({ post_id: postId, content })
      // });

      // Mock success for now
      const newComment = {
        id: Math.random().toString(36).substr(2, 9),
        content: content,
        author: window.appState.user?.username || 'Current User',
        created_at: new Date().toISOString(),
        likes_count: 0
      };

      // Add comment to UI
      const commentsList = postElement.querySelector('.comments-list');
      const commentElement = this.createCommentElement(newComment);
      commentsList.appendChild(commentElement);

      // Update comment count
      const commentCountElement = postElement.querySelector('.comment-count .count');
      const currentCount = parseInt(commentCountElement.textContent);
      commentCountElement.textContent = currentCount + 1;

      // Clear input
      commentInput.value = '';

    } catch (error) {
      console.error('Error posting comment:', error);
      alert('Failed to post comment. Please try again.');
    }
  }

  async handleLikePost(postId, likeBtn) {
    try {
      // TODO: Replace with actual API call
      // const response = await fetch(`/api/posts/${postId}/like`, {
      //   method: 'POST',
      //   credentials: 'include'
      // });

      // Mock like toggle for now
      const isLiked = likeBtn.classList.contains('liked');
      const likeCountElement = likeBtn.closest('.post-card').querySelector('.like-count .count');
      const currentCount = parseInt(likeCountElement.textContent);

      if (isLiked) {
        likeBtn.classList.remove('liked', 'btn-danger');
        likeBtn.classList.add('btn-outline-danger');
        
        // Clear and rebuild button content using DOM methods
        this.clearElement(likeBtn);
        const icon = document.createElement('i');
        icon.className = 'fas fa-heart me-1';
        const text = document.createTextNode('Like');
        likeBtn.appendChild(icon);
        likeBtn.appendChild(text);
        
        likeCountElement.textContent = currentCount - 1;
      } else {
        likeBtn.classList.add('liked', 'btn-danger');
        likeBtn.classList.remove('btn-outline-danger');
        
        // Clear and rebuild button content using DOM methods
        this.clearElement(likeBtn);
        const icon = document.createElement('i');
        icon.className = 'fas fa-heart me-1';
        const text = document.createTextNode('Liked');
        likeBtn.appendChild(icon);
        likeBtn.appendChild(text);
        
        likeCountElement.textContent = currentCount + 1;
      }

    } catch (error) {
      console.error('Error liking post:', error);
    }
  }

  setupLoadMoreButton() {
    const loadMoreBtn = document.getElementById('load-more-btn');
    if (loadMoreBtn) {
      loadMoreBtn.addEventListener('click', () => {
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

      // Trigger load more when user is 200px from bottom
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
      // Clear container using DOM methods
      this.clearContainer(container);
      
      // Create error message using DOM methods
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

  // Utility function to clear elements using DOM methods
  clearContainer(container) {
    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }
  }

  // Utility function to clear element content using DOM methods
  clearElement(element) {
    while (element.firstChild) {
      element.removeChild(element.firstChild);
    }
  }

  formatDate(dateString) {
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
  }
}

// Initialize feed manager
const feedManager = new FeedManager();

// Global functions
function initializeFeedPage() {
  feedManager.initializeFeedPage();
}

function loadFeedContent() {
  feedManager.loadInitialPosts();
}

// Make functions globally available
window.initializeFeedPage = initializeFeedPage;
window.loadFeedContent = loadFeedContent;
