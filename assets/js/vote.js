document.addEventListener("DOMContentLoaded", () => {
   console.log("Vote script loaded."); // ✅ Debugging

   // Post Voting
   document.querySelectorAll(".like-button, .dislike-button").forEach(button => {
       button.addEventListener("click", function () {
           const postId = this.dataset.postId;
           console.log("Post Vote Clicked:", postId); // ✅ Debugging
           let vote;

           // Determine the vote value
           if (this.classList.contains("active")) {
               vote = 0; // Neutral state (removing the vote)
           } else {
               vote = this.classList.contains("like-button") ? 1 : -1;
           }


           fetch("/vote", {
               method: "POST",
               headers: { "Content-Type": "application/x-www-form-urlencoded" },
               body: `post_id=${postId}&vote=${vote}`
           })
           .then(response => {
               if (response.ok) {
                   location.reload();
               } else {
                   alert("Error processing your vote.");
               }
           })
           .catch(error => console.error("Error:", error));
       });
   });

   // Comment Voting
   document.querySelectorAll(".comment-like-button, .comment-dislike-button").forEach(button => {
       button.addEventListener("click", function () {
           const commentId = this.dataset.commentId;
           console.log("Comment Vote Clicked:", commentId); // ✅ Debugging

           let vote;

           if (this.classList.contains("active")) {
               vote = 0; // Neutral state (removing the vote)
           } else {
               vote = this.classList.contains("comment-like-button") ? 1 : -1;
           }
           
           fetch("/vote-comment", {
               method: "POST",
               headers: { "Content-Type": "application/x-www-form-urlencoded" },
               body: `comment_id=${commentId}&vote=${vote}`
           })
           .then(response => {
               if (response.ok) {
                   location.reload();
               } else {
                   alert("Error processing your vote.");
               }
           })
           .catch(error => console.error("Error:", error));
       });
   });
});
