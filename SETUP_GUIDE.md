# GHOUL E-commerce Platform - Complete Setup Guide

## 📋 Project Overview

This document guides you through setting up the complete GHOUL e-commerce platform with both frontend and backend.

### What's Included

✅ **Frontend** (Already Complete)
- 8 fully responsive HTML pages with CSS3 styling
- Product catalog, shopping cart, and checkout flows
- Product detail pages with image galleries
- Archive and blog sections

✅ **Backend** (Newly Implemented)
- Node.js + Express REST API
- PostgreSQL database with relational schema
- JWT authentication with email verification
- Shopping cart persistence
- Order management system
- Email notifications (registration, orders)
- Complete API client for frontend integration

---

## 🚀 Step-by-Step Setup

### Phase 1: Frontend Setup (Already Done)

Frontend files are ready in the root directory:
- `index.html` — Landing page
- `tienda.html` — Product listing
- `producto.html` — Product detail
- `carrito.html` — Shopping cart
- `checkout.html` — Checkout/Payment
- `blog.html`, `lookbook.html`, `archivo.html` — Content pages
- `css/` — All styling
- `js/` — Frontend scripts

### Phase 2: Database Setup

#### 2.1 Install PostgreSQL

**Mac (Homebrew):**
```bash
brew install postgresql
brew services start postgresql
```

**Windows:**
Download and install from [postgresql.org](https://www.postgresql.org/download/windows/)

**Linux (Ubuntu):**
```bash
sudo apt-get install postgresql postgresql-contrib
sudo service postgresql start
```

#### 2.2 Create Database

```bash
# Via command line
createdb ghoul_db

# Or via psql shell
psql
CREATE DATABASE ghoul_db;
\q
```

#### 2.3 Run Database Schema

```bash
cd backend
psql -U postgres -d ghoul_db -f migrations/init.sql
```

Expected output:
```
DROP TABLE
CREATE TABLE
CREATE INDEX
... (multiple CREATE statements)
```

### Phase 3: Backend Setup

#### 3.1 Install Node.js

Download from [nodejs.org](https://nodejs.org) (LTS version recommended)

Verify installation:
```bash
node --version
npm --version
```

#### 3.2 Install Dependencies

```bash
cd backend
npm install
```

This installs:
- express (web framework)
- pg (PostgreSQL driver)
- jsonwebtoken (JWT authentication)
- bcryptjs (password hashing)
- dotenv (environment variables)
- nodemailer (email sending)
- cors (cross-origin requests)

#### 3.3 Configure Environment

The `.env` file is already created with default values. Update if needed:

```bash
# backend/.env
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=ghoul_db
DATABASE_USER=postgres
DATABASE_PASSWORD=postgres
JWT_SECRET=your_super_secret_key_here
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=app_password
```

#### 3.4 Seed Database with Products

```bash
cd backend
node seed.js
```

Output:
```
🌱 Starting database seed...
✓ Cleared existing products
✓ Added: Hoodie Oversize (HD-01)
✓ Added: T-Shirt GHOUL (TS-01)
... (more products)
✓ Successfully seeded 9 products
```

#### 3.5 Start Backend Server

```bash
cd backend
npm run dev
```

Expected output:
```
✓ GHOUL Backend running on http://localhost:5000
✓ Environment: development
```

Test health check:
```bash
curl http://localhost:5000/api/health
# Response: {"status":"API is running"}
```

### Phase 4: Frontend Integration (Next Steps)

The frontend is ready but not yet connected to the backend. You need to:

1. ✅ API client is ready (`js/api.js`)
2. ⏳ Wire up authentication (register/login forms)
3. ⏳ Connect shopping cart functionality
4. ⏳ Connect checkout/order creation

This will be implemented in the next phase.

### Phase 5: Testing

#### 5.1 Test Authentication

Register a user:
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Password123",
    "nombre": "Test",
    "apellido": "User"
  }'
```

Response:
```json
{
  "message": "Account created successfully. Check your email to verify.",
  "user": {
    "id": 1,
    "email": "test@example.com",
    "nombre": "Test",
    "apellido": "User",
    "email_verified": false
  },
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

#### 5.2 Test Products

Get all products:
```bash
curl http://localhost:5000/api/products
```

Get single product:
```bash
curl http://localhost:5000/api/products/1
```

#### 5.3 Test Cart (Requires Token)

Replace `YOUR_TOKEN` with the token from registration:

```bash
curl -X POST http://localhost:5000/api/cart \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "product_id": 1,
    "talla": "M",
    "cantidad": 1
  }'
```

---

## 📁 Project Structure

```
ghoul-web/
├── frontend/                    # Frontend files (HTML/CSS/JS)
│   ├── index.html
│   ├── tienda.html
│   ├── producto.html
│   ├── carrito.html
│   ├── checkout.html
│   ├── css/
│   │   ├── style.css
│   │   ├── carrito.css
│   │   └── checkout.css
│   └── js/
│       ├── main.js             # Frontend scripts
│       └── api.js              # API client (NEW)
│
├── backend/                     # Backend (NEW)
│   ├── server.js               # Express app entry
│   ├── package.json            # Dependencies
│   ├── .env                    # Environment config
│   ├── .env.example            # Config template
│   ├── seed.js                 # Product seeding
│   ├── config/
│   │   └── database.js         # PostgreSQL pool
│   ├── models/
│   │   ├── User.js
│   │   ├── Product.js
│   │   ├── Cart.js
│   │   └── Order.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── products.js
│   │   ├── cart.js
│   │   ├── orders.js
│   │   └── users.js
│   ├── middleware/
│   │   └── auth.js             # JWT middleware
│   ├── utils/
│   │   ├── mailer.js           # Email service
│   │   └── validators.js       # Input validation
│   ├── migrations/
│   │   └── init.sql            # Database schema
│   └── README.md               # Backend docs
│
├── SETUP_GUIDE.md              # This file
└── README.md                   # Project documentation
```

---

## 🔧 Troubleshooting

### Issue: "Cannot connect to database"

**Solution:**
```bash
# Check if PostgreSQL is running
psql -U postgres

# If not, start it
brew services start postgresql  # Mac
sudo service postgresql start   # Linux
# Windows: Use Service Manager
```

### Issue: "Database ghoul_db does not exist"

**Solution:**
```bash
createdb ghoul_db
psql -U postgres -d ghoul_db -f backend/migrations/init.sql
```

### Issue: "PORT 5000 already in use"

**Solution:**
```bash
# Edit backend/.env
PORT=5001

# Or kill process on port 5000
lsof -ti:5000 | xargs kill -9  # Mac/Linux
netstat -ano | findstr :5000   # Windows (find PID, then taskkill)
```

### Issue: "npm: command not found"

**Solution:**
- Install Node.js from [nodejs.org](https://nodejs.org)
- Restart terminal after installation

### Issue: "Cannot find module 'express'"

**Solution:**
```bash
cd backend
rm -rf node_modules package-lock.json
npm install
```

---

## 📚 API Documentation

Full API docs available in `backend/README.md`

### Key Endpoints

**Authentication:**
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/verify-email`
- `GET /api/auth/me`

**Products:**
- `GET /api/products`
- `GET /api/products/:id`

**Cart** (auth required):
- `GET /api/cart`
- `POST /api/cart`
- `PUT /api/cart/:id`
- `DELETE /api/cart/:id`

**Orders** (auth required):
- `POST /api/orders`
- `GET /api/orders`
- `GET /api/orders/:id`

**Profile** (auth required):
- `GET /api/users/profile`
- `PUT /api/users/profile`

---

## 🎯 Next Steps

1. ✅ **Backend Setup** — Completed
2. ⏳ **Frontend Integration** — Connect API client to HTML/JS
3. ⏳ **Authentication UI** — Register/login pages
4. ⏳ **Cart Integration** — Wire up shopping functionality
5. ⏳ **Checkout Integration** — Connect order creation
6. ⏳ **End-to-End Testing** — Full user flow testing

---

## 📞 Support

For detailed backend documentation, see `backend/README.md`

For issues:
1. Check troubleshooting section above
2. Review error messages in terminal
3. Check `.env` configuration
4. Ensure PostgreSQL is running
5. Verify database was created and seeded

---

**Version:** 1.0.0  
**Last Updated:** May 2026  
**Status:** Backend complete, Frontend integration in progress
