document.getElementById('register-form').addEventListener('submit', async (e) => {
   e.preventDefault();
   
   const formData = new FormData(e.target);
   const data = Object.fromEntries(formData.entries());
   data.age = parseInt(data.age);
 
   try {
     const response = await fetch('/register', {
       method: 'POST',
       headers: {
         'Content-Type': 'application/x-www-form-urlencoded',
       },
       body: new URLSearchParams(formData)
     });
 
     const result = await response.json();
     
     if (response.ok) {
       alert('Registration successful!');
       window.location.href = '/';
     } else {
       alert(`Error: ${result.error}`);
     }
   } catch (error) {
     console.error('Error:', error);
     alert('Network error - please try again');
   }
 });
