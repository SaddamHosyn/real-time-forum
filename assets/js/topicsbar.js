// topicsbar.js

document.addEventListener('DOMContentLoaded', () => {
   // Ensure we're on the topicsbar route before executing logic
   const currentHash = window.location.hash;
   if (!currentHash.includes('topicsbar')) return;
 
   // Optionally, log or handle loading state
   console.log('TopicsBar page loaded.');
 
   // Initialize dynamic functionality for topic cards if needed
   initializeTopicCards();
 });
 
 // Example: Add hover effect or click listeners
 function initializeTopicCards() {
   const topicCards = document.querySelectorAll('.topic-card');
   topicCards.forEach(card => {
     card.addEventListener('mouseenter', () => {
       card.classList.add('shadow-lg');
     });
     card.addEventListener('mouseleave', () => {
       card.classList.remove('shadow-lg');
     });
 
     // add click behavior
      card.addEventListener('click', () => {
        alert(`You selected: ${card.querySelector('h3').innerText}`);
      });
   });
 }
 