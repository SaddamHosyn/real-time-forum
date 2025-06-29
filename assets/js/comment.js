


async function loadSinglePost(postId) {
   // 1. Fetch the post
   const postResponse = await fetch(`/api/posts/${postId}`);
   const post = await postResponse.json();
 
   // 2. Render the post
   const postTemplate = document.getElementById('single-post-template');
   const postElement = postTemplate.content.cloneNode(true);
   
   // Fill post details
   postElement.querySelector('.post-title').textContent = post.title;
   postElement.querySelector('.post-author').textContent = `By ${post.author}`;
   postElement.querySelector('.post-date').textContent = new Date(post.date).toLocaleString();
   postElement.querySelector('.post-content').textContent = post.content;
 
   // 3. Set up comment form
   const commentForm = postElement.querySelector('.add-comment-form');
   commentForm.addEventListener('submit', async (e) => {
     e.preventDefault();
     const commentText = commentForm.querySelector('textarea').value.trim();
     
     if (commentText) {
       await addComment(postId, commentText);
       commentForm.querySelector('textarea').value = ''; // Clear input
       loadComments(postId); // Refresh comments
     }
   });
 
   // 4. Display in app content area
   document.getElementById('app-content').innerHTML = '';
   document.getElementById('app-content').appendChild(postElement);
 
   // 5. Load comments
   loadComments(postId);
 }
 
 // Load comments for the post
 async function loadComments(postId) {
   const response = await fetch(`/api/posts/${postId}/comments`);
   const comments = await response.json();
 
   const commentsList = document.querySelector('.comments-list');
   commentsList.innerHTML = '';
 
   const commentTemplate = document.getElementById('single-comment-template');
 
   comments.forEach(comment => {
     const commentElement = commentTemplate.content.cloneNode(true);
     commentElement.querySelector('.comment-author').textContent = comment.author;
     commentElement.querySelector('.comment-date').textContent = new Date(comment.date).toLocaleString();
     commentElement.querySelector('.comment-content').textContent = comment.content;
     commentsList.appendChild(commentElement);
   });
 
   // Update comment count
   document.querySelector('.comment-count').textContent = comments.length;
 }
 
 // Submit a new comment
 async function addComment(postId, commentText) {
   await fetch(`/api/posts/${postId}/comments`, {
     method: 'POST',
     headers: {
       'Content-Type': 'application/json',
       'Authorization': `Bearer ${localStorage.getItem('token')}` // If using auth
     },
     body: JSON.stringify({
       content: commentText
     })
   });
 }
