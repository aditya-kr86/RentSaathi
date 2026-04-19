# 🏠 RentSaathi - Smart Flatmate Matching Platform

> Find your perfect flatmate with intelligent AI-powered compatibility matching

## 🎯 Milestone 1: Landing Page ✅

This milestone includes a stunning, fully-responsive landing page with:

### ✨ Features Implemented

#### Frontend (React + TypeScript)
- ✅ **Hero Section** - Eye-catching introduction with smooth animations
- ✅ **Problem Section** - 6 burning issues that flatmates face
- ✅ **Solution Section** - How RentSaathi solves each problem
- ✅ **Features Section** - 6 core features showcased
- ✅ **Stats Section** - Impressive metrics to build trust
- ✅ **Waitlist Form** - Email capture with validation
- ✅ **Day/Night Mode** - Full theme support with smooth transitions
- ✅ **Responsive Design** - Works perfectly on mobile, tablet, desktop
- ✅ **Smooth Scrolling** - Enhanced UX with scroll animations
- ✅ **Beautiful Gradients** - Modern, vibrant color scheme

#### Backend (FastAPI + Python)
- ✅ **Waitlist API** - POST endpoint to collect emails
- ✅ **Database** - SQLAlchemy models with SQLite
- ✅ **Email Validation** - Pydantic with email verification
- ✅ **CORS Setup** - Configured for frontend communication
- ✅ **Error Handling** - Comprehensive error responses
- ✅ **Health Check** - API status endpoint
- ✅ **Admin Endpoints** - View waitlist stats and emails

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ (for frontend)
- Python 3.8+ (for backend)
- npm or yarn

### Frontend Setup

```bash
cd rentsaathi

# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

Frontend will be available at `http://localhost:5173`

### Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run development server
python main.py
# Or: python -m uvicorn main:app --reload
```

Backend will be available at `http://localhost:8000`

**On Linux/Mac:**
```bash
chmod +x run.sh
./run.sh
```

**On Windows:**
```bash
run.bat
```

## 📂 Project Structure

```
RentSaathi/
├── rentsaathi/                 # Frontend (React + TypeScript)
│   ├── src/
│   │   ├── components/
│   │   │   ├── LandingPage.tsx    # Main landing page
│   │   │   ├── LandingPage.css    # Landing page styles
│   │   │   └── ThemeToggle.tsx    # Theme switcher
│   │   ├── App.tsx
│   │   ├── App.css
│   │   ├── index.css
│   │   └── main.tsx
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
│
├── backend/                    # Backend (FastAPI + Python)
│   ├── main.py                 # Main FastAPI application
│   ├── database.py             # Database setup & models
│   ├── schemas.py              # Pydantic schemas
│   ├── requirements.txt
│   ├── .env.example
│   ├── README.md
│   └── run.sh / run.bat
│
└── SRS.txt                      # Software Requirements Specification
```

## 🎨 Design Highlights

### Color Scheme
- **Primary**: Indigo (`#6366f1`)
- **Accent**: Pink (`#ec4899`)
- **Secondary**: Purple (`#8b5cf6`)
- **Dark Mode**: Slate background with silver text

### Typography
- **Headlines**: Bold, large, high impact
- **Body**: Clean, readable system fonts
- **Spacing**: Generous margins for breathing room

### Responsive Breakpoints
- Desktop: 1200px+
- Tablet: 768px - 1199px
- Mobile: < 768px

## 📊 Landing Page Sections

1. **Hero Section**
   - Headline: "Find Your Perfect Flatmate Match"
   - CTA Button: "Join the Waitlist"
   - Illustration: Sample match cards

2. **Problem Section**
   - 6 key problems flatmates face
   - Emoji icons for quick recognition
   - Hover animations

3. **Solution Section**
   - 4-step process explanation
   - 4 feature highlights with icons

4. **Features Section**
   - 6 detailed feature cards
   - Icon, title, description format

5. **Stats Section**
   - 4 impressive metrics
   - Builds credibility

6. **Waitlist Section**
   - Email input with validation
   - Success/error messages
   - Call to action

7. **Footer**
   - Navigation links
   - Copyright info

## 🛠 Tech Stack

### Frontend
- **Framework**: React 19
- **Language**: TypeScript
- **Build Tool**: Vite
- **Styling**: CSS3 with CSS Variables
- **State Management**: React Hooks

### Backend
- **Framework**: FastAPI
- **Database**: SQLAlchemy + SQLite (upgradeable to PostgreSQL)
- **Validation**: Pydantic
- **Server**: Uvicorn
- **API Documentation**: Swagger UI + ReDoc

## 📝 API Documentation

### Waitlist Endpoints

**Join Waitlist**
```http
POST /api/waitlist
Content-Type: application/json

{
  "email": "user@example.com"
}

Response:
{
  "id": 1,
  "email": "user@example.com",
  "created_at": "2026-04-19T12:34:56"
}
```

**Get Waitlist Count**
```http
GET /api/waitlist/count

Response:
{
  "count": 42
}
```

**Get All Emails** (Admin)
```http
GET /api/waitlist?skip=0&limit=100

Response:
[
  {
    "id": 1,
    "email": "user@example.com",
    "created_at": "2026-04-19T12:34:56"
  }
]
```

## 🔄 Frontend-Backend Communication

The frontend is configured to:
1. Validate email client-side
2. Send email to `http://localhost:8000/api/waitlist`
3. Handle success/error responses
4. Display user-friendly messages

## 🌙 Dark Mode

- **Toggle**: Fixed button in top-right corner
- **Storage**: Persisted in localStorage
- **Auto-detect**: Respects OS dark mode preference
- **Smooth**: CSS transitions between themes

## ✅ Testing

### Manual Testing
1. Start backend: `python main.py`
2. Start frontend: `npm run dev`
3. Visit `http://localhost:5173`
4. Test waitlist form with valid/invalid emails
5. Toggle theme and verify styling
6. Test on mobile using browser dev tools
7. Check API docs at `http://localhost:8000/docs`

### Email Validation Rules
- Must be valid email format
- No duplicates allowed
- Case-insensitive comparison

## 🚀 Deployment

### Frontend
- Deploy to: Vercel, Netlify, GitHub Pages
- Build command: `npm run build`
- Output directory: `dist/`

### Backend
- Deploy to: Render, Fly.io, Heroku, AWS
- Config: Update CORS origins for production URLs
- Database: Switch to PostgreSQL for production

## 📦 Environment Variables

### Frontend
`.env` (if needed):
```
VITE_API_URL=http://localhost:8000
```

### Backend
`.env`:
```
DATABASE_URL=sqlite:///./rentsaathi.db
FRONTEND_URL=http://localhost:5173
DEBUG=True
```

## 🐛 Troubleshooting

**Frontend won't connect to backend?**
- Ensure backend is running on port 8000
- Check CORS configuration in `main.py`
- Verify API URL in LandingPage.tsx

**Database error?**
- Delete `rentsaathi.db` and restart backend
- Check database permissions

**Email validation fails?**
- Ensure `email-validator` is installed: `pip install email-validator`

## 📈 Next Steps (Milestone 2+)

- [ ] Authentication system (sign up, login, JWT)
- [ ] User profile & questionnaire
- [ ] Matching algorithm
- [ ] Listings system
- [ ] Messaging system
- [ ] Payment integration
- [ ] Mobile app

## 📄 Documentation

- Full SRS: See `SRS.txt`
- Frontend README: `rentsaathi/README.md`
- Backend README: `backend/README.md`

## 👥 Contributing

This is an internal project. For development:

1. Create a feature branch
2. Make changes
3. Test thoroughly
4. Create a pull request

## 📞 Contact & Support

For issues or questions, check the project documentation or contact the development team.

---

**Status**: Milestone 1 ✅ Complete  
**Last Updated**: April 2026  
**Version**: 0.1.0
