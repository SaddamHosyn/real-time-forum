// main.js or a separate slider.js file
let currentIndex = 0;

function moveSlider(direction) {
  const slider = document.querySelector(".slider");
  const posts = document.querySelectorAll(".post");
  const totalPosts = posts.length;
  const postWidth = posts[0].offsetWidth + 20; // Include margin

  currentIndex += direction;

  // Handle boundary cases
  if (currentIndex < 0) {
    currentIndex = totalPosts - 1;
  } else if (currentIndex >= totalPosts) {
    currentIndex = 0;
  }

  // Move the slider
  slider.style.transform = `translateX(${-currentIndex * postWidth}px)`;
}
