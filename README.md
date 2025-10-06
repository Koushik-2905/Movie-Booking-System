# E-commerce Project

## Description
This repository contains the source code for a full-stack E-commerce application. The project is divided into two main parts: the backend (Flask API) and the frontend (React.js app). Below is the detailed file structure and description of the project.

## Project Structure
```
ecommerce-project/
│
├── backend/                     # Flask + MySQL (DB layer)
│   ├── app.py                   # Main Flask app with routes
│   ├── db.py                    # DB connection (MySQL)
│   ├── models/                  # Query functions
│   │   ├── customers.py
│   │   ├── products.py
│   │   ├── cart.py
│   │   ├── orders.py
│   │   ├── payments.py
│   │   ├── reviews.py
│   │   ├── categories.py
│   │   ├── login.py             # Login-related queries
│   │   └── signup.py            # Signup-related queries
│   ├── requirements.txt         # Flask, mysql-connector, etc.
│   └── config.py                # DB credentials
│
├── frontend/                    # React.js (UI layer)
│   ├── package.json             # React dependencies
│   ├── public/
│   │   └── index.html
│   └── src/
│       ├── App.js               # React Router
│       ├── index.js
│       ├── pages/               # Pages in flow
│       │   ├── Login.js
│       │   ├── Signup.js
│       │   ├── Home.js
│       │   ├── Cart.js
│       │   ├── Checkout.js
│       │   ├── Payment.js
│       │   ├── Review.js
│       │   └── Admin.js
│       └── components/          # Small reusable UI
│           ├── Navbar.js
│           ├── ProductCard.js
│           ├── CartItem.js
│           └── ProtectedRoute.js
│
└── database/
    └── schema.sql               # SQL CREATE TABLEs
```

## Features
- User authentication and authorization
- Product catalog with search and filtering
- Shopping cart functionality
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
git clone https://github.com/yourusername/ecommerce-project.git
cd ecommerce-project
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
