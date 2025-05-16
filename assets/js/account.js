document.addEventListener("DOMContentLoaded", () => {
  const user = JSON.parse(localStorage.getItem("user"));
  if (!user) return;

  // Render the account section from the template
  const template = document.getElementById("account-template");
  const clone = template.content.cloneNode(true);
  document.body.appendChild(clone); // Replace with a specific container if desired

  // Populate user info
  document.getElementById("account-username").textContent = user.username;
  document.getElementById("account-email").textContent = user.email;

  // Load posts and comments
  fetchUserPosts();
  fetchUserComments();
});

async function fetchUserPosts() {
  try {
    const res = await fetch("/api/user/posts", { credentials: "same-origin" });
    const posts = await res.json();
    const container = document.getElementById("user-posts-list");
    container.innerHTML = "";

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
  } catch (err) {
    console.error("Failed to load posts", err);
  }
}

async function fetchUserComments() {
  try {
    const res = await fetch("/api/user/comments", { credentials: "same-origin" });
    const comments = await res.json();
    const container = document.getElementById("user-comments-list");
    container.innerHTML = "";

    if (comments.length === 0) {
      container.textContent = "You have not made any comments yet.";
      return;
    }

    comments.forEach((comment) => {
      const div = document.createElement("div");
      div.className = "comment-item";

      const content = document.createElement("p");
      content.className = "comment-content";
      content.textContent = comment.content;

      const meta = document.createElement("p");
      meta.className = "comment-meta";

      const link = document.createElement("a");
      link.href = `#/post/${comment.post_id}`;
      link.textContent = "post";

      meta.append(
        `Posted on ${new Date(comment.created_at).toLocaleDateString()} in `,
        link
      );

      div.appendChild(content);
      div.appendChild(meta);
      container.appendChild(div);
    });
  } catch (err) {
    console.error("Failed to load comments", err);
  }
}
