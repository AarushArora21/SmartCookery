# 🍲 Smart Cookery

> AI-powered personalized cooking assistant + recipe social platform

Built with **React + Vite + TailwindCSS** on the frontend and **Node.js + Express + MongoDB** on the backend.

![Smart Cookery](https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200&auto=format&fit=crop)

---

## ✨ Features

### 🔐 Authentication
- Register / Login with JWT
- Password hashing with bcrypt
- Role-based access (User / Admin)
- Edit profile (name, bio, avatar)
- Change password

### 🍽️ Recipe Management
- Add / Edit / Delete recipes (4-step form)
- Image upload via Cloudinary
- Rich recipe cards with hover effects
- View count tracking
- Recipe detail page

### 🔍 Search & Discovery
- Real-time debounced search
- Filter by category, diet type, difficulty
- Sort by newest, most viewed, top rated
- Pagination
- Trending recipes section

### ❤️ Social Features
- Like / Unlike recipes
- Save / Unsave recipes
- Comment on recipes
- Rate recipes (1-5 stars)
- Follow / Unfollow users
- Public user profiles
- Share recipe link

### 🤖 AI Features (Powered by Groq)
- **AI Recipe Generator** — enter ingredients, get full recipe instantly
- **Chef Chatbot** — floating chat bubble, ask anything about cooking
- **Recipe from Photo** — upload food photo, AI identifies dish and generates recipe
- **Nutrition Goal Planner** — set health goal, get personalised 7-day meal plan
- **Ingredient Substitution** — find alternatives for any ingredient

### 👨‍🍳 Cook Mode
- Full screen cooking mode
- Step-by-step instructions with countdown timers
- Voice readout of each step (Web Speech API)
- Screen stays awake (WakeLock API)
- Mark steps as done

### 📏 Recipe Scaling
- Adjust servings with +/- buttons
- Quick multipliers (½x, 1x, 2x, 3x)
- All ingredient quantities auto-scale
- Animated quantity changes

### 📅 Meal Planner
- Weekly planner (Monday to Sunday)
- Add Breakfast, Lunch, Dinner, Snack per day
- Weekly summary stats
- Save plan to account

### 🛒 Grocery List
- Add / remove items
- Check off items as bought
- Progress bar
- Save list to account

### 📚 Collections
- Create recipe folders with custom emoji
- Add recipes to collections
- Public or private collections

### 🏆 Badges System
- 🍳 First Recipe
- 👨‍🍳 Home Chef (5 recipes)
- 🌟 Star Chef (10 recipes)
- 👑 Top Chef (50 recipes)
- 🔥 Popular Creator (100+ followers)
- 🤝 Social Butterfly
- 🔖 Recipe Collector
- 🌱 Early Adopter

### 🎨 UI / UX
- Dark mode / Light mode
- Fully responsive (mobile, tablet, desktop)
- Framer Motion animations
- Skeleton loaders
- Toast notifications
- PWA (installable on mobile)

### 🔒 Security
- Rate limiting (100 req/15min general, 10 req/15min for auth)
- Helmet (secure HTTP headers)
- XSS protection
- MongoDB injection prevention
- HTTP parameter pollution prevention
- Input validation
- Secure file upload validation
- CORS restriction

---

## 🏗️ Tech Stack

### Frontend
- React.js (Vite)
- Tailwind CSS
- Redux Toolkit
- Axios
- Framer Motion
- React Router DOM
- React Hot Toast
- React Icons

### Backend
- Node.js + Express.js
- MongoDB + Mongoose
- JWT Authentication
- bcryptjs
- Cloudinary (image storage)
- Multer (file upload)
- Helmet, XSS-Clean, HPP (security)
- Express Rate Limit
- Express Mongo Sanitize

### AI
- Groq API (llama-3.3-70b-versatile)
- 14,400 free requests/day

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- MongoDB (local) or MongoDB Atlas
- Cloudinary account (free)
- Groq API key (free at console.groq.com)

---

## ⚙️ Backend Setup

```bash
cd backend
npm install
cp .env.example .env
```

Fill in `backend/.env`:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/smart-cookery
JWT_SECRET=your_long_random_secret_minimum_32_characters
JWT_EXPIRE=7d

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

GROQ_API_KEY=gsk_your_groq_key_here

NODE_ENV=development
CLIENT_URL=http://localhost:5173
```

Start backend:
```bash
npm run dev      # development (nodemon)
npm start        # production
```
Runs on **http://localhost:5000**

---

## 🎨 Frontend Setup

```bash
cd frontend
npm install
```

Create `frontend/.env`:
```env
VITE_API_URL=http://localhost:5000/api
```

Start frontend:
```bash
npm run dev      # development
npm run build    # production build
```
Runs on **http://localhost:5173**

---

## 📁 Project Structure

```
smart-cookery/
│
├── backend/
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── recipeController.js
│   │   ├── userController.js
│   │   ├── aiController.js
│   │   └── collectionController.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── recipes.js
│   │   ├── user.js
│   │   ├── ai.js
│   │   ├── nutrition.js
│   │   └── collections.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Recipe.js
│   │   └── Collection.js
│   ├── middleware/
│   │   └── auth.js
│   ├── config/
│   │   └── cloudinary.js
│   └── server.js
│
└── frontend/
    └── src/
        ├── components/
        │   ├── common/
        │   │   ├── ChefChatbot.jsx
        │   │   ├── LoadingSpinner.jsx
        │   │   └── Skeletons.jsx
        │   ├── layout/
        │   │   ├── Navbar.jsx
        │   │   └── Footer.jsx
        │   └── recipe/
        │       ├── RecipeCard.jsx
        │       ├── RecipeForm.jsx
        │       ├── ScalingIngredients.jsx
        │       ├── CookMode.jsx
        │       └── SubstitutionFinder.jsx
        ├── pages/
        │   ├── HomePage.jsx
        │   ├── SearchPage.jsx
        │   ├── RecipeDetailPage.jsx
        │   ├── AddRecipePage.jsx
        │   ├── EditRecipePage.jsx
        │   ├── DashboardPage.jsx
        │   ├── LoginPage.jsx
        │   ├── RegisterPage.jsx
        │   ├── AIGeneratorPage.jsx
        │   ├── MealPlannerPage.jsx
        │   ├── GroceryListPage.jsx
        │   ├── ProfilePage.jsx
        │   ├── CollectionsPage.jsx
        │   ├── RecipeFromPhotoPage.jsx
        │   ├── NutritionPlannerPage.jsx
        │   └── NotFoundPage.jsx
        ├── redux/
        │   ├── store.js
        │   └── slices/
        │       ├── authSlice.js
        │       ├── recipeSlice.js
        │       └── uiSlice.js
        └── utils/
            ├── api.js
            ├── helpers.js
            └── badges.js
```

---

## 🔌 API Endpoints

### Auth
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | No | Register user |
| POST | `/api/auth/login` | No | Login |
| GET | `/api/auth/me` | Yes | Get current user |
| PUT | `/api/auth/profile` | Yes | Update profile |
| PUT | `/api/auth/change-password` | Yes | Change password |

### Recipes
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/recipes` | No | List recipes |
| GET | `/api/recipes/trending` | No | Trending recipes |
| GET | `/api/recipes/:id` | No | Get recipe |
| POST | `/api/recipes` | Yes | Create recipe |
| PUT | `/api/recipes/:id` | Yes | Update recipe |
| DELETE | `/api/recipes/:id` | Yes | Delete recipe |
| POST | `/api/recipes/:id/like` | Yes | Like/unlike |
| POST | `/api/recipes/:id/save` | Yes | Save/unsave |
| POST | `/api/recipes/:id/comment` | Yes | Add comment |
| POST | `/api/recipes/:id/rate` | Yes | Rate recipe |

### User
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/user/profile` | Yes | Get profile |
| GET | `/api/user/saved` | Yes | Saved recipes |
| GET | `/api/user/meal-plan` | Yes | Get meal plan |
| PUT | `/api/user/meal-plan` | Yes | Update meal plan |
| GET | `/api/user/grocery-list` | Yes | Get grocery list |
| PUT | `/api/user/grocery-list` | Yes | Update grocery list |
| GET | `/api/user/:userId` | No | Public profile |
| POST | `/api/user/:userId/follow` | Yes | Follow/unfollow |

### AI
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/ai/generate` | Yes | Generate recipe |
| POST | `/api/ai/chat` | Yes | Chef chatbot |
| POST | `/api/ai/recipe-from-photo` | Yes | Recipe from photo |
| POST | `/api/ai/nutrition-plan` | Yes | Nutrition plan |
| POST | `/api/ai/substitute` | Yes | Find substitutions |

### Collections
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/collections` | Yes | My collections |
| POST | `/api/collections` | Yes | Create collection |
| POST | `/api/collections/:id/add` | Yes | Add recipe |
| DELETE | `/api/collections/:id` | Yes | Delete collection |

---

## 🌐 Deployment

### Frontend → Vercel
1. Push code to GitHub
2. Go to [vercel.com](https://vercel.com) → New Project
3. Set root directory to `frontend`
4. Add env variable: `VITE_API_URL=https://your-backend.onrender.com/api`
5. Deploy

### Backend → Render
1. Go to [render.com](https://render.com) → New Web Service
2. Connect GitHub repo
3. Root directory: `backend`
4. Build command: `npm install`
5. Start command: `node server.js`
6. Add all `.env` variables
7. Deploy

### Database → MongoDB Atlas
1. Create free M0 cluster at [mongodb.com/atlas](https://mongodb.com/atlas)
2. Add DB user and whitelist `0.0.0.0/0`
3. Copy connection string to `MONGODB_URI`

---

## 📤 Push to GitHub

```bash
git init
git add .
git commit -m "feat: Smart Cookery - AI powered recipe platform"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/smart-cookery.git
git push -u origin main
```

---

## 🔒 Security Features
- Rate limiting on all routes
- Brute force protection on auth routes
- Helmet.js secure headers
- XSS attack prevention
- MongoDB injection prevention
- HTTP parameter pollution prevention
- Secure file upload validation
- JWT token authentication
- Password hashing with bcrypt (salt rounds: 12)
- CORS origin restriction

---

## 👨‍💻 Author
Built with ❤️ using React + Node.js + AI