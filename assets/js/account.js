// account.js
/*
document.addEventListener("DOMContentLoaded", () => {
    console.log("Account.js loaded on DOMContentLoaded");
});

function initializeAccountPage() {
    console.log("Initializing account page");
    const user = JSON.parse(localStorage.getItem("user"));

    if (!user) {
        console.log("No user found in initializeAccountPage, redirecting to login");
        navigateTo("signin");
        return;
    }

    // Populate user info
    const usernameElement = document.getElementById("account-username");
    const emailElement = document.getElementById("account-email");
    if (usernameElement) usernameElement.textContent = user.username;
    if (emailElement) emailElement.textContent = user.email;
    console.log("User info populated:", user.username, user.email);

    // Load posts and comments
    fetchUserPosts();
    fetchUserComments();
}

async function fetchUserPosts() {
    console.log("Fetching user posts");
    
    const container = document.getElementById("user-posts-list");
    const postsCountBadge = document.getElementById("posts-count"); // ✅ ADD THIS LINE
    
    try {
        const res = await fetch("/api/user/posts", { credentials: "include" });
        const posts = await res.json();
        
        if (container) {
            clearContainer(container);
            
            // ✅ ADD THIS - Update posts count
            if (postsCountBadge) {
                postsCountBadge.textContent = posts.length;
            }
            
            if (posts.length === 0) {
                container.textContent = "You have not created any posts yet.";
                return;
            }
            
            posts.forEach((post) => {
                const div = document.createElement("div");
                div.className = "post-item";

                const title = document.createElement("h4");
                const link = document.createElement("a");
                link.href = `#/post/${post.id}`;
                link.textContent = post.title;
                title.appendChild(link);

                const meta = document.createElement("p");
                meta.className = "post-meta";
                meta.textContent = `Posted on ${new Date(post.created_at).toLocaleDateString()}`;

                const excerpt = document.createElement("p");
                excerpt.className = "post-excerpt";
                excerpt.textContent = post.content.slice(0, 100) + "...";

                div.appendChild(title);
                div.appendChild(meta);
                div.appendChild(excerpt);
                container.appendChild(div);
            });
        } else {
            console.warn("User posts list container not found");
        }
    } catch (err) {
        console.error("Failed to load posts", err);
        
        // ✅ ADD THIS - Set count to 0 on error
        if (postsCountBadge) {
            postsCountBadge.textContent = "0";
        }
    }
}

async function fetchUserComments() {
    console.log("Fetching user comments");
    
    const container = document.getElementById("user-comments-list");
    const commentsCountBadge = document.getElementById("comments-count");
    
    if (!container) {
        console.warn("User comments list container not found");
        return;
    }

    try {
        const response = await fetch("/api/user/comments", { 
            credentials: "include" 
        });
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const comments = await response.json();
        
        console.log("Fetched comments:", comments);
        console.log("Number of comments:", comments.length);
        
        // Clear loading spinner
        clearContainer(container);
        
        // Update comments count
        if (commentsCountBadge) {
            commentsCountBadge.textContent = comments.length;
        }

        if (comments.length === 0) {
            showNoComments(container);
            return;
        }

        // Render comments using DOM creation (not templates for now)
        comments.forEach(comment => {
            const commentElement = createCommentElement(comment);
            container.appendChild(commentElement);
        });

    } catch (error) {
        console.error("Failed to load comments:", error);
        clearContainer(container);
        showError(container, "Failed to load comments");
    }
}

// ✅ ADD THESE MISSING FUNCTIONS:

function clearContainer(container) {
    while (container.firstChild) {
        container.removeChild(container.firstChild);
    }
}

function showNoComments(container) {
    const message = document.createElement("p");
    message.className = "text-muted text-center";
    message.textContent = "You have not made any comments yet.";
    container.appendChild(message);
}

function showError(container, message) {
    const errorDiv = document.createElement("div");
    errorDiv.className = "alert alert-danger";
    errorDiv.textContent = message;
    container.appendChild(errorDiv);
}

function createCommentElement(comment) {
    const div = document.createElement("div");
    div.className = "comment-item border-bottom pb-3 mb-3";

    const content = document.createElement("p");
    content.className = "comment-content mb-2";
    content.textContent = comment.content;

    const meta = document.createElement("p");
    meta.className = "text-muted small comment-meta";
    meta.textContent = `Posted on ${formatDate(comment.created_at)} in "${comment.post_title || 'Unknown Post'}"`;

    div.appendChild(content);
    div.appendChild(meta);
    
    return div;
}

function formatDate(dateString) {
    if (!dateString) return 'Unknown date';
    return new Date(dateString).toLocaleDateString();
}

window.initializeAccountPage = initializeAccountPage;
 

*/
 

// account.js - FIXED VERSION WITH NULL SAFETY

document.addEventListener("DOMContentLoaded", () => {
    console.log("Account.js loaded on DOMContentLoaded");
});

function initializeAccountPage() {
    console.log("Initializing account page");
    const user = JSON.parse(localStorage.getItem("user"));

    if (!user) {
        console.log("No user found in initializeAccountPage, redirecting to login");
        if (window.navigateTo) {
            window.navigateTo("signin");
        } else {
            window.location.hash = '#/signin';
        }
        return;
    }

    // Populate user info
    const usernameElement = document.getElementById("account-username");
    const emailElement = document.getElementById("account-email");
    if (usernameElement) usernameElement.textContent = user.username;
    if (emailElement) emailElement.textContent = user.email;
    console.log("User info populated:", user.username, user.email);

    // Load posts and comments
    fetchUserPosts();
    fetchUserComments();
}

async function fetchUserPosts() {
    console.log("Fetching user posts");
    
    const container = document.getElementById("user-posts-list");
    const postsCountBadge = document.getElementById("posts-count");
    
    if (!container) {
        console.warn("User posts list container not found");
        return;
    }
    
    try {
        const res = await fetch("/api/user/posts", { credentials: "include" });
        
        if (!res.ok) {
            throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        }
        
        const responseData = await res.json();
        
        // ✅ FIX: Ensure we have an array, not null
        const posts = Array.isArray(responseData) ? responseData : [];
        
        console.log("Fetched posts:", posts);
        
        clearContainer(container);
        
        // Update posts count
        if (postsCountBadge) {
            postsCountBadge.textContent = posts.length;
        }
        
        if (posts.length === 0) {
            showNoPosts(container);
            return;
        }
        
        posts.forEach((post) => {
            const div = document.createElement("div");
            div.className = "post-item border-bottom pb-3 mb-3";

            const title = document.createElement("h4");
            const link = document.createElement("a");
            link.href = `#/post/${post.id}`;
            link.textContent = post.title || 'Untitled Post';
            title.appendChild(link);

            const meta = document.createElement("p");
            meta.className = "post-meta text-muted small";
            meta.textContent = `Posted on ${formatDate(post.created_at)}`;

            const excerpt = document.createElement("p");
            excerpt.className = "post-excerpt";
            const content = post.content || '';
            excerpt.textContent = content.length > 100 ? content.slice(0, 100) + "..." : content;

            div.appendChild(title);
            div.appendChild(meta);
            div.appendChild(excerpt);
            container.appendChild(div);
        });
        
    } catch (err) {
        console.error("Failed to load posts:", err);
        
        clearContainer(container);
        showError(container, "Failed to load your posts. Please try again later.");
        
        // Set count to 0 on error
        if (postsCountBadge) {
            postsCountBadge.textContent = "0";
        }
    }
}

async function fetchUserComments() {
    console.log("Fetching user comments");
    
    const container = document.getElementById("user-comments-list");
    const commentsCountBadge = document.getElementById("comments-count");
    
    if (!container) {
        console.warn("User comments list container not found");
        return;
    }

    try {
        const response = await fetch("/api/user/comments", { 
            credentials: "include" 
        });
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const responseData = await response.json();
        
        // ✅ FIX: Ensure we have an array, not null
        const comments = Array.isArray(responseData) ? responseData : [];
        
        console.log("Fetched comments:", comments);
        console.log("Number of comments:", comments.length);
        
        // Clear loading spinner
        clearContainer(container);
        
        // Update comments count
        if (commentsCountBadge) {
            commentsCountBadge.textContent = comments.length;
        }

        if (comments.length === 0) {
            showNoComments(container);
            return;
        }

        // Render comments
        comments.forEach(comment => {
            const commentElement = createCommentElement(comment);
            container.appendChild(commentElement);
        });

    } catch (error) {
        console.error("Failed to load comments:", error);
        clearContainer(container);
        showError(container, "Failed to load your comments. Please try again later.");
        
        // Set count to 0 on error
        if (commentsCountBadge) {
            commentsCountBadge.textContent = "0";
        }
    }
}

// ✅ UTILITY FUNCTIONS

function clearContainer(container) {
    if (container) {
        container.innerHTML = '';
    }
}

function showNoPosts(container) {
    const message = document.createElement("p");
    message.className = "text-muted text-center py-4";
    message.textContent = "You have not created any posts yet.";
    container.appendChild(message);
}

function showNoComments(container) {
    const message = document.createElement("p");
    message.className = "text-muted text-center py-4";
    message.textContent = "You have not made any comments yet.";
    container.appendChild(message);
}

function showError(container, message) {
    const errorDiv = document.createElement("div");
    errorDiv.className = "alert alert-danger";
    errorDiv.textContent = message;
    container.appendChild(errorDiv);
}

function createCommentElement(comment) {
    const div = document.createElement("div");
    div.className = "comment-item border-bottom pb-3 mb-3";

    const content = document.createElement("p");
    content.className = "comment-content mb-2";
    content.textContent = comment.content || 'No content';

    const meta = document.createElement("p");
    meta.className = "text-muted small comment-meta";
    meta.textContent = `Posted on ${formatDate(comment.created_at)} in "${comment.post_title || 'Unknown Post'}"`;

    div.appendChild(content);
    div.appendChild(meta);
    
    return div;
}

function formatDate(dateString) {
    if (!dateString) return 'Unknown date';
    try {
        return new Date(dateString).toLocaleDateString();
    } catch (e) {
        return 'Invalid date';
    }
}

// ✅ EXPOSE GLOBALLY
window.initializeAccountPage = initializeAccountPage;
