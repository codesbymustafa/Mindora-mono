<div align="center">

# 🎓 Mindora

### _Where students learn and teachers teach._

A full-stack, MERN-powered video learning platform that blends the discovery of a
streaming service with the community of a social network — built for educators and
learners to create, share, and grow together.

[**🌐 Live Demo →**](https://mindora-amber.vercel.app)

![Stack](https://img.shields.io/badge/stack-MERN-3FB950)
![Backend](https://img.shields.io/badge/backend-Node%20%2B%20Express%205-339933)
![Frontend](https://img.shields.io/badge/frontend-React%2018%20%2B%20Vite-61DAFB)
![Tests](https://img.shields.io/badge/tests-218%20passing-success)
![CI](https://img.shields.io/badge/CI-GitHub%20Actions-2088FF)
![License](https://img.shields.io/badge/license-MIT-blue)

</div>

---

## ✨ Features

Mindora isn't just a video uploader — it's a complete learning ecosystem.

### 🎬 Video Streaming & Discovery
- **Cloud-native uploads** — videos and thumbnails stream straight to Cloudinary with automatic thumbnail generation when you don't supply one.
- **Powerful discovery engine** — full-text search, owner filtering, and multi-field sorting (newest, title, views, duration) with cursor-friendly pagination for libraries of any size.
- **Smart view tracking** — unique, per-user view counting so creators see real engagement, not inflated refreshes.
- **Watch history** — every video you open is remembered, ready to pick up where you left off.

### 👥 Channels & Community
- **Creator channels** — rich public profiles with avatars, cover images, subscriber counts, and subscription state baked into every response.
- **One-tap subscriptions** — follow your favorite teachers and see exactly who follows you.
- **Tweets** — lightweight microblogging for quick updates, announcements, and thoughts between videos.
- **Threaded comments & likes** — discuss videos, comment threads, and tweets; like anything, anywhere, with live like counts and per-user like state.
- **Playlists & collections** — curate videos into named, shareable collections and reorder your learning path.

### 🔔 Engagement & Insight
- **Real-time-style notifications** — get notified on new subscribers, comments, likes, and more, with unread badges, bulk mark-as-read, and pagination.
- **Creator analytics dashboard** — at-a-glance channel stats: total views, subscribers, videos, likes, and comments earned.
- **Liked-videos library** — a personal, auto-curated feed of everything you've ever loved.

### 🔐 Security & UX
- **JWT auth done right** — short-lived access tokens paired with rotating refresh tokens, delivered via secure HTTP-only cookies.
- **Bcrypt-hashed passwords** and Mongoose-enforced data integrity throughout.
- **Rate limiting** to keep the API resilient against abuse.
- **Personalized theming** — server-persisted light/dark mode that follows you across devices.
- **Responsive, modern UI** — a Tailwind-crafted interface with toast notifications that feels great on phone, tablet, and desktop.

---

## 🏗️ Architecture

A clean two-package monorepo:

```
Mindora-mono/
├── Backend/        # Node + Express 5 REST API (MongoDB, Cloudinary, JWT)
│   ├── src/
│   │   ├── controllers/   # Request handlers
│   │   ├── models/        # Mongoose schemas
│   │   ├── routes/        # API route definitions (/api/v1/*)
│   │   ├── middlewares/   # Auth, uploads, rate limiting
│   │   ├── db/            # Database connection
│   │   ├── utils/         # Cloudinary, async handler, API helpers
│   │   └── app.js         # Express app
│   ├── tests/             # Jest + Supertest suites
│   └── readme.md          # 📘 Full REST API reference
├── frontend/       # React 18 + Vite + TailwindCSS SPA
│   ├── src/
│   │   ├── pages/         # Home, Dashboard, VideoDetail, Notifications, …
│   │   ├── components/    # Reusable UI
│   │   ├── context/       # Global state (auth, theme)
│   │   ├── hooks/         # Custom React hooks
│   │   ├── api/           # Axios API client
│   │   └── App.jsx
│   ├── cypress/           # End-to-end tests
│   └── README.md          # Frontend / product overview
├── TESTING.md      # 🧪 Testing strategy across all three layers
└── .github/        # CI workflow
```

### Tech Stack

| Layer       | Technologies |
|-------------|--------------|
| **Frontend** | React 18, Vite, TailwindCSS, React Router, Axios, React Hot Toast, React Icons |
| **Backend**  | Node.js, Express 5, MongoDB + Mongoose, JWT, Multer, Cloudinary, Winston, Morgan |
| **Testing**  | Jest, Supertest, `mongodb-memory-server`, Cypress |
| **CI/CD**    | GitHub Actions, Vercel (deployment) |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- A MongoDB instance (local or Atlas)
- A Cloudinary account (for media uploads)

### 1. Backend

```bash
cd Backend
npm install
```

Create a `Backend/.env`:

```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017
CORS_ORIGIN=http://localhost:5173
ACCESS_TOKEN_SECRET=your_access_secret
ACCESS_TOKEN_EXPIRY=1d
REFRESH_TOKEN_SECRET=your_refresh_secret
REFRESH_TOKEN_EXPIRY=10d
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

```bash
npm run dev        # start the API on http://localhost:3000
```

### 2. Frontend

```bash
cd frontend
npm install
npm run dev        # start the app on http://localhost:5173
```

To route API calls through the Vite dev proxy (recommended — avoids CORS), create
`frontend/.env.development.local`:

```env
VITE_API_URL=/api/v1
```

---

## 📡 API

The API is versioned under `/api/v1` and covers users, videos, comments, likes,
playlists, subscriptions, tweets, notifications, and a creator dashboard.

See the **[full REST API reference →](./Backend/readme.md)** for every endpoint,
request shape, and response schema.

---

## 🧪 Testing

Mindora is tested across all three layers of the test pyramid — **218 backend
tests** (Jest + Supertest against an in-memory MongoDB) and **Cypress** E2E flows
in a real browser, with the backend suite running in CI on every push.

```bash
cd Backend && npm test            # run the backend suite
cd Backend && npm run test:coverage
cd frontend && npm run cy:open    # interactive E2E (needs the stack running)
```

See **[TESTING.md](./TESTING.md)** for the full strategy.

---

## 📄 License

Licensed under the **MIT License** — see [LICENSE](./Backend/LICENSE).

---

<div align="center">

**Author:** Mustafa Koser · [@codesbymustafa](https://github.com/codesbymustafa)

_Made with ❤️ for the learning community._

</div>
