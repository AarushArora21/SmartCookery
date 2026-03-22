# 🍲 Smart Cookery

> AI-powered personalized cooking assistant + recipe social platform

Built with **React + Vite + TailwindCSS** on the frontend and **Node.js + Express + MongoDB** on the backend.

---

## 🚀 Getting Started

### Prerequisites

- Node.js v18+
- MongoDB Atlas account (free tier)
- Cloudinary account (free tier)
- Gemini API key (optional, for AI recipe generation)

---

## ⚙️ Backend Setup

```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env` and fill in:

```env
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/smart-cookery
JWT_SECRET=your_long_random_secret_here
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_key
CLOUDINARY_API_SECRET=your_secret
GEMINI_API_KEY=your_gemini_key   # optional
CLIENT_URL=http://localhost:5173
```

Start the backend:

```bash
npm run dev       # development (nodemon)
npm start         # production
```

Backend runs on **http://localhost:5000**

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

Start the frontend:

```bash
npm run dev       # development
npm run build     # production build
```

Frontend runs on **http://localhost:5173**

---

## 📁 Project Structure

```
smart-cookery/
├── backend/
│   ├── controllers/       # Auth, Recipe, User, AI logic
│   ├── routes/            # Express route definitions
│   ├── models/            # Mongoose schemas (User, Recipe)
│   ├── middleware/        # JWT auth, admin guard
│   ├── config/            # Cloudinary config
│   └── server.js          # App entry point
│
└── frontend/
    ├── src/
    │   ├── components/    # Navbar, Footer, RecipeCard, Forms
    │   ├── pages/         # All 12 page components
    │   ├── redux/         # Store + slices (auth, recipes, ui)
    │   └── utils/         # API client, helpers
    └── index.html
```

---

## 🌐 Deployment

### Deploy Frontend → Vercel

1. Push code to GitHub
2. Go to [vercel.com](https://vercel.com) → New Project → Import repo
3. Set **Root Directory** to `frontend`
4. Add environment variable: `VITE_API_URL=https://your-backend.onrender.com/api`
5. Deploy

### Deploy Backend → Render

1. Go to [render.com](https://render.com) → New Web Service
2. Connect your GitHub repo
3. Set **Root Directory** to `backend`
4. **Build Command**: `npm install`
5. **Start Command**: `node server.js`
6. Add all environment variables from `.env`
7. Deploy

### Database → MongoDB Atlas

1. Go to [mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Create free M0 cluster
3. Add DB user → copy connection string into `MONGODB_URI`
4. Whitelist IP: `0.0.0.0/0` (for Render)

---

## 🔌 API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | No | Register user |
| POST | `/api/auth/login` | No | Login |
| GET | `/api/auth/me` | Yes | Get current user |
| GET | `/api/recipes` | No | List recipes (filter/search/paginate) |
| POST | `/api/recipes` | Yes | Create recipe |
| PUT | `/api/recipes/:id` | Yes | Update recipe |
| DELETE | `/api/recipes/:id` | Yes | Delete recipe |
| POST | `/api/recipes/:id/like` | Yes | Like/unlike |
| POST | `/api/recipes/:id/save` | Yes | Save/unsave |
| POST | `/api/recipes/:id/comment` | Yes | Add comment |
| POST | `/api/recipes/:id/rate` | Yes | Rate recipe |
| GET | `/api/recipes/trending` | No | Trending recipes |
| GET | `/api/user/profile` | Yes | User profile |
| PUT | `/api/user/meal-plan` | Yes | Update meal plan |
| PUT | `/api/user/grocery-list` | Yes | Update grocery list |
| POST | `/api/ai/generate` | Yes | AI recipe generation |

---

## 🧪 Push to GitHub

```bash
git init
git add .
git commit -m "feat: initial Smart Cookery project"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/smart-cookery.git
git push -u origin main
```

---

## ✨ Features

- 🔐 JWT Authentication with bcrypt
- 🍽️ Full Recipe CRUD with image upload (Cloudinary)
- 🔍 Real-time debounced search + filters
- ❤️ Like, Save, Comment, Rate recipes
- 🤖 AI Recipe Generator (Gemini API)
- 📅 Weekly Meal Planner
- 🛒 Smart Grocery List
- 👤 User profiles + Follow system
- 🌙 Dark mode
- 📱 Fully responsive (mobile-first)
- ⚡ Redux Toolkit state management
- 🎨 Framer Motion animations
