# 🧾 Product Requirements Document (PRD)

## 🎯 Goal
Build a **Mini E-Commerce Store** using **Angular + RxJS + Fake Store API**.  
The project is **educational**, focusing on applying **best practices** in frontend development such as:
- Clean architecture  
- Reactive programming (RxJS)  
- Localization (AR/EN)  
- Reusable and modular components  

---

## 👥 Target Users
- **Developers or students** learning Angular and RxJS.  
- **End users** (example scenario):  
  Users who can log in, browse products, add to cart, and complete checkout.

---

## 🧩 Pages

### 1. Landing Page
- Show promotional products (optional 3D or animated images).  
- Include catchy marketing text.  
- Prominent **“Know More”** button → navigates to the **Products (Home)** page.  
- Dark theme layout using red (#D72638), black, and white.

---

### 2. Login Page
- Fields: Username & Password.  
- Use endpoint: `POST /auth/login` to authenticate user.  
- On success → store JWT token and redirect to **Home (Products)** page.

---

### 3. Home Page (Products)
- **Header:**  
  - Welcome message (e.g., *“Hello Abdulrahman”*)  
  - Settings icon  
  - Language switch (AR/EN)  
  - Dark Mode toggle  
- **Sidebar:**  
  - Home, Cart, Profile, Orders  
- **Product Grid:**  
  - Show product image, title, price, rating.  
  - Filtering by category.  
  - Search functionality using **RxJS debounceTime** for real-time results.

---

### 4. Product Details Page
- Display product details from `GET /products/:id`.  
- Show:
  - Image, title, description, price, rating.  
  - Button: **Add to Cart**.  
  - Section: “You may also like” → products from the same category.

---

### 5. Cart Page
- Manage items in real-time:
  - Add, remove, or update quantity.  
  - Display total price reactively using **BehaviorSubject**.  
- Checkout button redirects to **Checkout Page**.

---

### 6. Checkout Page
- Built using **Reactive Forms**.  
- Fields:
  - Full Name  
  - Address  
  - Phone Number  
- Apply form validators for required fields and proper patterns.

---

## 🌐 Localization
- The application supports **both Arabic and English**.  
- All static text is stored in localization files:
  - `/assets/i18n/en.json`
  - `/assets/i18n/ar.json`
- ❌ No hardcoded text inside components.  
- Use **ngx-translate** or **Angular i18n** for translation management.

---

## 🔌 APIs Used — Fake Store API
**Base URL:** https://fakestoreapi.com  

### 🔑 Auth
- `POST /auth/login` → Authenticate user, returns JWT token.

### 👤 Users
- `GET /users/:id` → Fetch user details (for welcome message in header).

### 🛍️ Products
- `GET /products` → Fetch all products.  
- `GET /products/:id` → Get product details.  
- `GET /products/categories` → Get all categories.  
- `GET /products/category/:category` → Get products by category.

### 🧾 Carts
- `POST /carts` → Add a new cart.  
- `PUT /carts/:id` → Update cart.  
- `DELETE /carts/:id` → Delete cart.

---

## 🧰 Tech Stack
- **Frontend:** Angular (Standalone Components), SCSS  
- **State Management:** RxJS BehaviorSubject  
- **HTTP Client:** Angular HttpClient  
- **UI Library:** Angular Material / Tailwind / custom SCSS  
- **Localization:** ngx-translate or Angular i18n  
- **API:** Fake Store API (public)  

---

## 🗺️ Roadmap
1. ✅ Login (Auth)
2. 🚀 Landing Page (Promotions + Know More)
3. 🏬 Home Page (Products + Filter + Search)
4. 📦 Product Details Page
5. 🛒 Cart (Reactive State + BehaviorSubject)
6. 💳 Checkout (Reactive Form)
7. 🌐 Localization (AR/EN)
8. ✨ Enhancements (Dark Mode, Sidebar, UI polish)

---

## 📘 Notes
- Follow **clean and modular folder structure** (`core`, `shared`, `features`).  
- Use **BehaviorSubject** to maintain shared cart and auth states.  
- Integrate **global SCSS variables** for colors and theme consistency.  
- Ensure **fully responsive design** with mobile optimization.  

---

> This PRD is referenced by `.github/copilot-instructions.md` to guide Copilot and developers during implementation.