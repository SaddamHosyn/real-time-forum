async function loadSinglePost(postId) {
  try {
    // 1. Fetch the post
    const postResponse = await fetch(`/api/posts/${postId}`);
    
    if (!postResponse.ok) {
      console.error('Failed to fetch post:', postResponse.status);
      alert('Post not found or server error. Please try again.');
      return;
    }
    
    const data = await postResponse.json();
    
    // Extract post data from the response structure
    const post = data.post;
    const comments = data.comments || [];
 
    // 2. Render the post
    const postTemplate = document.getElementById('single-post-template');
    if (!postTemplate) {
      console.error('single-post-template not found');
      alert('Post template not found. Please refresh the page.');
      return;
    }
    
    const postElement = postTemplate.content.cloneNode(true);
    
    // Fill post details - Updated to match backend response
    postElement.querySelector('.post-title').textContent = post.title;
    postElement.querySelector('.post-author').textContent = `By ${post.author}`;
    postElement.querySelector('.post-date').textContent = new Date(post.date).toLocaleString();
    postElement.querySelector('.post-content').textContent = post.content;
    
    // Update comment count
    postElement.querySelector('.comment-count').textContent = comments.length;
 
    // 3. Set up comment form
    const commentForm = postElement.querySelector('.add-comment-form');
    if (commentForm) {
      commentForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const commentText = commentForm.querySelector('textarea').value.trim();
        
        if (commentText) {
          await addComment(postId, commentText);
          commentForm.querySelector('textarea').value = ''; // Clear input
          loadComments(postId); // Refresh comments
        }
      });
    }

    // 4. Display in app content area FIRST
    const appContent = document.getElementById('app-content');
    
    // Clear app content and append new template
    while (appContent.firstChild) {
      appContent.removeChild(appContent.firstChild);
    }
    appContent.appendChild(postElement);

    // ✅ FIXED: Multiple approaches to make back button work
    setTimeout(() => {
      const backButton = document.getElementById('back-to-feed-btn');
      console.log('Looking for back button:', backButton);
      
      if (backButton) {
        console.log('Back button found, setting up event listener');
        
        // Remove any existing event listeners
        const newBackButton = backButton.cloneNode(true);
        backButton.parentNode.replaceChild(newBackButton, backButton);
        
        newBackButton.addEventListener('click', function(e) {
          e.preventDefault();
          e.stopPropagation();
          console.log('Back button clicked!');
          
          // ✅ TRY MULTIPLE METHODS
          console.log('window.navigateTo exists:', typeof window.navigateTo);
          
          // Method 1: Try navigateTo
          if (window.navigateTo && typeof window.navigateTo === 'function') {
            console.log('Using window.navigateTo');
            window.navigateTo('feed');
          } 
          // Method 2: Direct hash change
          else {
            console.log('Using direct hash change');
            window.location.hash = '#/feed';
          }
          
          // Method 3: Force reload if nothing works
          setTimeout(() => {
            if (window.location.hash !== '#/feed') {
              console.log('Forcing hash change');
              window.location.hash = '#/feed';
              window.location.reload();
            }
          }, 500);
        });
        
        console.log('Event listener attached to back button');
      } else {
        console.error('Back button not found in DOM');
        
        // ✅ FALLBACK: Use event delegation on the parent
        appContent.addEventListener('click', function(e) {
          if (e.target.id === 'back-to-feed-btn' || e.target.closest('#back-to-feed-btn')) {
            e.preventDefault();
            console.log('Back button clicked via delegation');
            
            if (window.navigateTo) {
              window.navigateTo('feed');
            } else {
              window.location.hash = '#/feed';
            }
          }
        });
      }
    }, 100);
 
    // 5. Load comments immediately from the fetched data
    displayComments(comments);
    
  } catch (error) {
    console.error('Error loading single post:', error);
    alert('Failed to load post. Please try again.');
  }
}

// Rest of your functions remain the same...
function displayComments(comments) {
  const commentsList = document.querySelector('.comments-list');
  if (!commentsList) return;
  
  commentsList.innerHTML = '';
  
  const commentTemplate = document.getElementById('single-comment-template');
  if (!commentTemplate) {
    console.error('single-comment-template not found');
    return;
  }
  
  comments.forEach(comment => {
    const commentElement = commentTemplate.content.cloneNode(true);
    commentElement.querySelector('.comment-author').textContent = comment.author;
    commentElement.querySelector('.comment-date').textContent = new Date(comment.created_at).toLocaleString();
    commentElement.querySelector('.comment-content').textContent = comment.content;
    commentsList.appendChild(commentElement);
  });
}

async function loadComments(postId) {
  try {
    const response = await fetch(`/api/posts/${postId}`);
    if (!response.ok) return;
    
    const data = await response.json();
    const comments = data.comments || [];
    
    displayComments(comments);
    
    const commentCount = document.querySelector('.comment-count');
    if (commentCount) {
      commentCount.textContent = comments.length;
    }
  } catch (error) {
    console.error('Error loading comments:', error);
  }
}

async function addComment(postId, commentText) {
  try {
    const response = await fetch('/api/comments/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({
        post_id: postId,
        content: commentText
      })
    });
    
    if (!response.ok) {
      throw new Error('Failed to post comment');
    }
    
    const result = await response.json();
    if (result.success) {
      console.log('Comment posted successfully');
    }
  } catch (error) {
    console.error('Error posting comment:', error);
    alert('Failed to post comment. Please try again.');
  }
}

window.loadSinglePost = loadSinglePost;
