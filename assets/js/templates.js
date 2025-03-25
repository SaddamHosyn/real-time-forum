// assets/js/templates.js
import { formField } from './utils/formHelpers.js';
// assets/js/templates.js

// 1. Template Types Constants
export const TEMPLATES = {
  // Page Templates
  HOME: 'home',
  TOPICS: 'topics',
  CREATE_POST: 'create-post',
  CATEGORY: 'category',
  NOT_FOUND: 'not-found',
  
  // Modal Templates
  LOGIN_MODAL: 'login-modal',
  REGISTER_MODAL: 'register-modal'
};

export const COMPONENTS = {
  HEADER: 'header',
  FOOTER: 'footer'
};

// 2. Category Constants
export const CATEGORIES = {
  FOOD_DINING: 'food-dining',
  TECHNOLOGY: 'technology',
  FASHION: 'fashion',
  HOME_LIVING: 'home-living',
  HEALTH_BEAUTY: 'health-beauty',
  AUTOMOTIVE: 'automotive',
  SPORTS_FITNESS: 'sports-fitness',
  TRAVEL_LEISURE: 'travel-leisure',
  SERVICES: 'services',
  MISCELLANEOUS: 'miscellaneous'
};

// 3. Template Contents
export const templates = {
  // ===== COMPONENTS =====
  [COMPONENTS.HEADER]: (isLoggedIn = false, user = { username: 'Guest' }) => `
    <header>
      <div class="header-container">
        <div class="logo">
          <a href="/" data-link>BudgetBuzz</a>
        </div>
        <nav>
          <ul>
            ${isLoggedIn ? `
              <li><a href="/profile" data-link>Welcome, ${user.username}!</a></li>
              <li><a href="/" data-link id="homepage">[ Home ]</a></li>
              <li><a href="/newpost" data-link id="new-post">[ New Post ]</a></li>
              <li><a href="/logout" id="nav-logout">[ Logout ]</a></li>
            ` : `
              <li><a href="#" id="nav-login">[ Login ]</a></li>
              <li><a href="#" id="nav-register">[ Register ]</a></li>
            `}
          </ul>
        </nav>
      </div>
    </header>
  `,

  [COMPONENTS.FOOTER]: `
    <footer class="main-footer">
      <div class="footer-content">
        <p>
          <img src="assets/images/copyright.svg" alt="copyright" class="copyright-icon" />
          2025 BudgetBuzz | Created with ❤️ by
          <a href="https://github.com/SaddamHosyn" target="_blank" rel="noopener">
            Saddam
            <img src="assets/images/deliverytruck.svg" alt="Saddam's icon" class="creator-icon" />
          </a>
          &
          <a href="https://github.com/Richard-AungKhantMin" target="_blank" rel="noopener">
            Richard
            <img src="assets/images/barcode.svg" alt="Richard's icon" class="creator-icon" />
          </a>
        </p>
      </div>
    </footer>
  `,

  // ===== MODALS =====
  [TEMPLATES.LOGIN_MODAL]: `
    <div class="auth-modal" id="login-modal">
      <div class="auth-modal-content">
        <span class="close-modal" id="close-login">&times;</span>
        <h3>Sign In</h3>
        <form id="login-form">
          <div class="form-group">
            <label for="login-username">Username or Email</label>
            <input type="text" id="login-username" name="usernameoremail" placeholder="Username or Email" required />
          </div>
          <div class="form-group">
            <label for="login-password">Password</label>
            <input type="password" id="login-password" name="password" placeholder="Password" required />
          </div>
          <button type="submit" class="auth-btn">Sign In</button>
        </form>
        <div class="auth-links">
          <p>Don't have an account? <a href="#" id="show-register">Create Account</a></p>
          <p><a href="/forgot-password" data-link>Forgot Password?</a></p>
        </div>
      </div>
    </div>
  `,

  [TEMPLATES.REGISTER_MODAL]: `
    <div class="auth-modal" id="register-modal">
      <div class="auth-modal-content">
        <span class="close-modal" id="close-register">&times;</span>
        <h2>Register</h2>
        <form id="register-form">
          ${formField('reg-username', 'Username', 'text')}
          ${formField('reg-email', 'Email', 'email')}
          ${formField('reg-password', 'Password', 'password')}
          ${formField('reg-age', 'Age', 'number')}
          
          <div class="form-group">
            <label for="reg-gender">Gender</label>
            <select id="reg-gender" name="gender" required>
              <option value="">Select Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
          
          ${formField('reg-first-name', 'First Name')}
          ${formField('reg-last-name', 'Last Name')}
          
          <button type="submit" class="auth-btn">Register</button>
        </form>
        <div class="auth-links">
          <p>Already have an account? <a href="#" id="show-login">Sign In</a></p>
        </div>
      </div>
    </div>
  `,

  // ===== PAGE TEMPLATES =====
  [TEMPLATES.HOME]: `
    <div class="home-view">
      <h1>Welcome to BudgetBuzz</h1>
      <p>Discover the best deals and discounts!</p>
      <button data-link="/topics">View topics</button>
    </div>
  `,

  [TEMPLATES.TOPICS]: `
    <div class="topics-view">
      <h2>Topics</h2>
      <p>Browse topics here...</p>
    </div>
  `,

  [TEMPLATES.CREATE_POST]: `
    <div class="create-post-container">
      <h2>Create a New Post</h2>
      <form id="create-post-form">
        <!-- ... form fields ... -->
      </form>
    </div>
  `,

  [TEMPLATES.CATEGORY]: `
    <div class="category-view">
      <h2 class="category-title">{{category}}</h2>
      <div class="category-content">
        <div class="posts-container"></div>
      </div>
    </div>
  `,

  [TEMPLATES.NOT_FOUND]: `
    <div class="not-found-view">
      <h2>404 - Page Not Found</h2>
      <p>The page you're looking for doesn't exist.</p>
      <a href="/" data-link>Return to Home</a>
    </div>
  `
};


