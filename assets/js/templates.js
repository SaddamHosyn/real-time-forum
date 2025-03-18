// templates.js
export const TEMPLATES = {
   HOME: `
     <template id="home-template">
       <h1>Welcome to BudgetBuzz</h1>
       <p>Discover the best deals and discounts!</p>
       <button onclick="navigateTo(event, '/products')">View Products</button>
     </template>
   `,
   PRODUCTS: `
     <template id="products-template">
       <h2>Products</h2>
       <p>Browse products here...</p>
     </template>
   `,
   LOGIN: `
     <template id="login-template">
       <h2>Login</h2>
       <p>Enter your credentials...</p>
       <button onclick="navigateTo(event, '/')">Go Home</button>
     </template>
   `,
   NOT_FOUND: `
     <template id="not-found-template">
       <h2>404 - Page Not Found</h2>
     </template>
   `,
 };
