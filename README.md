# Movie-Booking-System Project

## Description
This repository contains the source code for a full-stack E-commerce application. The project is divided into two main parts: the backend (Flask API) and the frontend (React.js app). Below is the detailed file structure and description of the project.

## Project Structure
BOOKLEGION/
├── 📁 backend/                          # Flask Backend Server
│   ├── 🐍 app.py                        # Main Flask application entry point
│   ├── ⚙️ config.py                     # Database configuration (MySQL)
│   ├── 🗄️ db.py                         # Database connection handler
│   ├── 📋 requirements.txt              # Python dependencies
│   ├── 🗃️ movie_booking.db             # SQLite database (backup)
│   ├── 🔧 setup_sqlite_db.py           # SQLite setup script
│   ├── 📁 __pycache__/                 # Python bytecode cache
│   └── 📁 models/                       # API Route Handlers (Blueprints)
│       ├── 🐍 __init__.py              # Models package initialization
│       ├── 🎬 movies.py                # Movie CRUD operations
│       ├── 👤 users.py                 # User management
│       ├── 🔐 login.py                 # Authentication login
│       ├── 📝 signup.py                # User registration
│       ├── 🛒 watchlist.py             # Cart/Watchlist management
│       ├── 🎫 bookings.py              # Booking operations
│       ├── 💳 payments.py              # Payment processing
│       ├── ⭐ reviews.py               # Movie reviews
│       └── 🎭 genres.py                # Genre management
│
├── 📁 frontend/                         # React Frontend Application
│   ├── 📦 package.json                 # Node.js dependencies
│   ├── 📦 package-lock.json            # Dependency lock file
│   ├── 📁 node_modules/                # Installed packages
│   ├── 📁 public/                      # Static assets
│   │   └── 🌐 index.html               # Main HTML template
│   └── 📁 src/                         # React source code
│       ├── 🎯 index.js                 # React app entry point
│       ├── 🎨 App.js                   # Main App component
│       ├── 🎨 App.css                  # Global styles + Seat Selection styles
│       ├── 📁 api/                     # API Communication
│       │   └── 🌐 api.js               # API endpoints & functions
│       ├── 📁 components/              # Reusable UI Components
│       │   ├── 🎬 ProductCard.js       # Movie card component
│       │   ├── 🔒 ProtectedRoute.js    # Route protection
│       │   └── 🪑 SeatSelection.js     # NEW: Seat selection modal
│       ├── 📁 pages/                   # Page Components
│       │   ├── 🏠 Home.js              # Movie listing page
│       │   ├── 🔐 Login.js             # Login page
│       │   ├── 📝 Signup.js            # Registration page
│       │   ├── 🛒 Watchlist.js         # Cart/Watchlist page
│       │   ├── 💳 Checkout.js          # Checkout page
│       │   ├── 💰 Payment.js           # Payment page
│       │   └── 📁 admin/               # Admin panel pages
│       │       ├── 🎬 ManageMovies.js  # Movie management
│       │       ├── 👥 ManageUsers.js   # User management
│       │       └── 🎭 ManageGenres.js  # Genre management
│       ├── 📁 context/                 # React Context
│       │   └── 🔐 AuthContext.js       # Authentication state
│       └── 📁 constants/              # App Constants
│           └── 🌐 apiEndpoints.js      # API endpoint URLs
│
├── 📁 database/                        # Database Schema
│   └── 🗄️ schema.sql                   # MySQL database structure
│
├── 📄 README.md                        # Project documentation
├── 📋 requirements-dev.txt             # Development dependencies
└── 🔧 .gitignore                       # Git ignore rules
```

## Features
- User authentication and authorization
- Movie catalog with search and filtering
- Cart functionality
- Order management
- Payment processing
- Admin dashboard
- Responsive design

## Technologies Used
- Frontend: React.js
- Backend: Flask
- Database: MySQL

## Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/Movie-Booking-System.git
cd Movie-Booking-System
```

2. Install backend dependencies
```bash
cd backend
pip install -r requirements.txt
```

3. Install frontend dependencies
```bash
cd ../frontend
npm install
```

4. Run the backend server
```bash
cd ../backend
python app.py
```

5. Run the frontend application
```bash
cd ../frontend
npm start
```

## Usage
1. Visit `http://localhost:3000`
2. Create an account or log in
3. Browse products and add items to cart
4. Proceed to checkout

## Contributing
1. Fork the project
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request
