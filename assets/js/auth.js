// Login Handler
document.getElementById('login-form').addEventListener('submit', function (e) {
    e.preventDefault();

    const formData = new FormData(this);
    const errorElement = document.getElementById('login-error');

    fetch('/api/login', {
        method: 'POST',
        body: formData,
        credentials: 'include', // if using cookies/sessions
    })
        .then(response => {
            if (response.ok) {
                // Update SPA view instead of reload
                window.location.hash = '#/home'; // Or call renderHomePage()
            } else {
                return response.text().then(text => {
                    throw new Error(text || 'Login failed');
                });
            }
        })
        .catch(error => {
            console.error('Error:', error);
            errorElement.textContent = error.message || 'An error occurred. Please try again.';
            errorElement.style.display = 'block';
        });
});

// Register Handler
document.getElementById('register-form').addEventListener('submit', function (e) {
    e.preventDefault();

    const formData = new FormData(this);
    const errorElement = document.getElementById('register-error');

    fetch('/api/register', {
        method: 'POST',
        body: formData,
    })
        .then(response => {
            if (response.ok) {
                window.location.hash = '#/login'; // Go to login page view
            } else {
                return response.text().then(text => {
                    throw new Error(text || 'Registration failed');
                });
            }
        })
        .catch(error => {
            console.error('Error:', error);
            errorElement.textContent = error.message;
            errorElement.style.display = 'block';
        });
});
