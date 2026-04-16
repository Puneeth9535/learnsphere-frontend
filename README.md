# 🎓 LearnSphere — Full Stack E-Learning Platform

A production-grade E-Learning web application built with the MERN Stack, featuring modern UI design inspired by Udemy/eDemy.

---

## 🚀 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite (SWC), React Router v6 |
| Backend | Node.js + Express.js |
| Database | MongoDB + Mongoose |
| Auth | JWT + bcryptjs |
| Styling | Custom CSS (dark theme) |
| Payments | Simulated (Stripe-ready) |

---

## 📁 Project Structure

```
learnsphere/
├── backend/
│   ├── models/         # MongoDB schemas
│   │   ├── User.js
│   │   ├── Course.js
│   │   ├── Module.js
│   │   ├── Video.js
│   │   ├── Enrollment.js
│   │   ├── Progress.js
│   │   └── Certificate.js
│   ├── routes/         # Express API routes
│   │   ├── auth.js
│   │   ├── courses.js
│   │   ├── modules.js
│   │   ├── videos.js
│   │   ├── enrollments.js
│   │   ├── progress.js
│   │   ├── certificates.js
│   │   ├── payments.js
│   │   └── admin.js
│   ├── middleware/
│   │   └── auth.js     # JWT middleware
│   ├── server.js
│   ├── seed.js         # Database seeder
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   └── Navbar.jsx
    │   ├── context/
    │   │   └── AuthContext.jsx
    │   ├── pages/
    │   │   ├── HomePage.jsx
    │   │   ├── CoursesPage.jsx
    │   │   ├── CourseDetailPage.jsx
    │   │   ├── LoginPage.jsx
    │   │   ├── RegisterPage.jsx
    │   │   ├── StudentDashboard.jsx
    │   │   ├── AdminDashboard.jsx
    │   │   ├── CoursePlayerPage.jsx
    │   │   └── CertificatePage.jsx
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css
    ├── index.html
    └── package.json
```

---

## ⚙️ Setup & Installation

### Prerequisites
- Node.js v18+
- MongoDB (local or [MongoDB Atlas](https://cloud.mongodb.com))

---

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd learnsphere
```

---

### 2. Setup Backend

```bash
cd backend
npm install
```

Create your `.env` file:

```bash
cp .env.example .env
```

Edit `.env`:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/learnsphere
JWT_SECRET=your_super_secret_key_change_this
JWT_EXPIRE=30d
CLIENT_URL=http://localhost:5173
```

**Seed the database** (creates sample courses + demo accounts):
```bash
npm run seed
```

**Start the backend:**
```bash
npm run dev
```
Backend runs at: `http://localhost:5000`

---

### 3. Setup Frontend

```bash
cd ../frontend
npm install
npm run dev
```
Frontend runs at: `http://localhost:5173`

---

## 🔑 Demo Accounts

| Role | Email | Password |
|---|---|---|
| Admin | admin@learnsphere.com | admin123 |
| Student | student@learnsphere.com | student123 |

---

## 🌐 API Endpoints

### Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | /api/auth/register | Register new user |
| POST | /api/auth/login | Login |
| GET | /api/auth/profile | Get user profile (protected) |

### Courses
| Method | Endpoint | Description |
|---|---|---|
| GET | /api/courses | Get all courses (with filters) |
| GET | /api/courses/:id | Get single course |
| POST | /api/courses | Create course (admin) |
| PUT | /api/courses/:id | Update course (admin) |
| DELETE | /api/courses/:id | Delete course (admin) |

### Modules & Videos
| Method | Endpoint | Description |
|---|---|---|
| POST | /api/modules | Add module to course (admin) |
| PUT | /api/modules/:id | Update module (admin) |
| DELETE | /api/modules/:id | Delete module (admin) |
| POST | /api/videos | Add video to module (admin) |
| PUT | /api/videos/:id | Update video (admin) |
| DELETE | /api/videos/:id | Delete video (admin) |

### Enrollment & Progress
| Method | Endpoint | Description |
|---|---|---|
| POST | /api/enrollments/enroll | Enroll in free course |
| GET | /api/enrollments/my | Get my enrollments |
| GET | /api/enrollments/check/:courseId | Check enrollment status |
| POST | /api/payments/checkout | Purchase paid course |
| GET | /api/progress/:courseId | Get course progress |
| POST | /api/progress/video/:videoId | Mark video complete |
| POST | /api/certificates/generate | Generate certificate |
| GET | /api/certificates/my | Get my certificates |

### Admin
| Method | Endpoint | Description |
|---|---|---|
| GET | /api/admin/stats | Platform statistics |
| GET | /api/admin/users | All users |
| GET | /api/enrollments/all | All enrollments |

---

## 🎨 Features

### Public / Home
- Hero section with animated gradient background
- Course search & category filters
- Featured courses grid
- Platform statistics

### Student Panel
- Dashboard with progress overview
- Course enrollment (free & paid)
- Video player with progress tracking
- **"Mark as Completed"** button for each video
- Progress bar: 0% → 100% based on videos completed
- Certificate generation & PDF download when 100% complete

### Admin Panel
- Dashboard with real-time stats (students, courses, revenue)
- Full CRUD for courses
- Add modules to courses
- Add videos to modules
- View all students & enrollments

### Third-Party / Buyer
- Browse course catalog
- View course details & curriculum
- Purchase courses with simulated payment
- Access course content after purchase

### Certificates
- Auto-generated on 100% course completion
- Unique certificate ID
- Downloadable as PDF
- Publicly shareable via URL

---

## 💳 Payment Notes

Currently uses **simulated payment** (no real charges). To enable real Stripe:

1. Install: `npm install stripe` (already in package.json)
2. Add `STRIPE_SECRET_KEY` to `.env`
3. Update `/api/payments/checkout` route to use real Stripe checkout session

---

## 🔧 Environment Variables

```env
# Backend (.env)
PORT=5000
MONGODB_URI=mongodb://localhost:27017/learnsphere
JWT_SECRET=change_this_to_random_string
JWT_EXPIRE=30d
CLIENT_URL=http://localhost:5173
STRIPE_SECRET_KEY=sk_test_... (optional for real payments)
```

---

## 📦 MongoDB Atlas (Cloud DB)

Replace `MONGODB_URI` with your Atlas connection string:
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/learnsphere
```

---

Built with ❤️ using the MERN Stack
