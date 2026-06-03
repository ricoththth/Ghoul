# GHOUL Backend API

Backend Node.js + Express API for the GHOUL e-commerce platform with user authentication, shopping cart, and order management.

## Prerequisites

- Node.js 16+ (download from [nodejs.org](https://nodejs.org))
- PostgreSQL 12+ (download from [postgresql.org](https://www.postgresql.org/download/))
- npm or yarn (comes with Node.js)

## Installation

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Set Up PostgreSQL Database

Create a new PostgreSQL database:

```bash
createdb ghoul_db
```

Or via psql:

```sql
CREATE DATABASE ghoul_db;
```

### 3. Configure Environment Variables

Copy `.env.example` to `.env` and update with your settings:

```bash
cp .env.example .env
```

Edit `.env` with your database credentials and other settings:

```
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=ghoul_db
DATABASE_USER=postgres
DATABASE_PASSWORD=your_password

JWT_SECRET=your_super_secret_key_32_chars_minimum
JWT_EXPIRY=7d

EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=app_password_16_chars
EMAIL_FROM=noreply@ghoul.com

PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

### 4. Initialize Database Schema

```bash
# Using psql
psql -U postgres -d ghoul_db -f migrations/init.sql

# Or using Node.js
node -e "const pool = require('./config/database'); pool.query(require('fs').readFileSync('./migrations/init.sql', 'utf8'), (err) => { if (err) console.error(err); else console.log('✓ Database initialized'); process.exit(); });"
```

### 5. Seed Database with Products

```bash
node seed.js
```

## Running the Server

### Development Mode (with auto-reload)

```bash
npm run dev
```

### Production Mode

```bash
npm start
```

Server will start on `http://localhost:5000`

## API Endpoints

### Authentication (`/api/auth`)

- `POST /api/auth/register` — Create account
  ```json
  { "email": "user@example.com", "password": "Password123", "nombre": "Juan", "apellido": "Pérez" }
  ```

- `POST /api/auth/login` — Login
  ```json
  { "email": "user@example.com", "password": "Password123" }
  ```

- `POST /api/auth/verify-email` — Verify email (requires auth token)

- `GET /api/auth/me` — Get current user (requires auth token)

- `POST /api/auth/logout` — Logout

### Products (`/api/products`)

- `GET /api/products` — List all products with pagination
  - Query params: `limit=20&offset=0`

- `GET /api/products/:id` — Get single product

- `POST /api/products` — Create product (admin only)
  ```json
  { "sku": "TS-01", "nombre": "T-Shirt", "precio": 89000, "descripcion": "...", "inventory": 50 }
  ```

### Cart (`/api/cart`) - Requires Authentication

- `GET /api/cart` — Get user's cart items

- `POST /api/cart` — Add item to cart
  ```json
  { "product_id": 1, "talla": "M", "cantidad": 1 }
  ```

- `PUT /api/cart/:cartItemId` — Update quantity
  ```json
  { "cantidad": 2 }
  ```

- `DELETE /api/cart/:cartItemId` — Remove item

- `DELETE /api/cart` — Clear entire cart

### Orders (`/api/orders`) - Requires Authentication

- `POST /api/orders` — Create order from cart
  ```json
  {
    "nombre_envio": "Juan",
    "apellido_envio": "Pérez",
    "direccion_envio": "Calle 72 #10-34",
    "ciudad": "Bogotá",
    "departamento": "Cundinamarca",
    "codigo_postal": "110111",
    "pais": "Colombia",
    "email_envio": "juan@example.com",
    "metodo_pago": "tarjeta"
  }
  ```

- `GET /api/orders` — Get order history

- `GET /api/orders/:orderId` — Get order details

- `PUT /api/orders/:orderId` — Update order status (admin)

### Users (`/api/users`) - Requires Authentication

- `GET /api/users/profile` — Get user profile

- `PUT /api/users/profile` — Update profile
  ```json
  { "nombre": "Juan", "apellido": "Pérez" }
  ```

## Testing with Curl

### Register a User

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

### Login

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Password123"
  }'
```

### Get Products (No Auth Required)

```bash
curl http://localhost:5000/api/products
```

### Add to Cart (Requires Token)

```bash
curl -X POST http://localhost:5000/api/cart \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "product_id": 1,
    "talla": "M",
    "cantidad": 1
  }'
```

## Authentication

The API uses JWT (JSON Web Tokens) for authentication. After login/register, you receive a token that should be sent in the `Authorization` header:

```
Authorization: Bearer YOUR_TOKEN_HERE
```

Store the token in localStorage on the client:

```javascript
localStorage.setItem('ghoul_auth_token', response.data.token);
```

## Database Schema

- **users** — User accounts with hashed passwords
- **products** — Product catalog with SKU, name, price, inventory
- **carts** — Shopping cart items per user
- **orders** — Order records with shipping address
- **order_items** — Individual items in each order

## Email Configuration

The backend uses Nodemailer with Gmail. To enable email:

1. Create a Gmail app password (not your regular password):
   - Go to [myaccount.google.com/security](https://myaccount.google.com/security)
   - Enable 2-Step Verification
   - Generate App Passwords
   - Copy the 16-character password

2. Set in `.env`:
   ```
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASSWORD=your_16_char_app_password
   ```

## Deployment

### Heroku

1. Create Heroku app:
   ```bash
   heroku create ghoul-api
   ```

2. Add PostgreSQL:
   ```bash
   heroku addons:create heroku-postgresql:hobby-dev
   ```

3. Set environment variables:
   ```bash
   heroku config:set JWT_SECRET=your_secret_key
   heroku config:set EMAIL_USER=your-email@gmail.com
   heroku config:set EMAIL_PASSWORD=app_password
   ```

4. Deploy:
   ```bash
   git push heroku main
   ```

### Other Platforms

- **Railway.app** — Simple deployment with PostgreSQL
- **Render** — Free tier available with PostgreSQL
- **Vercel** — Serverless deployment with Postgres

## Troubleshooting

### "Connection refused" on Database

- Ensure PostgreSQL is running: `brew services start postgresql` (Mac)
- Check connection settings in `.env`
- Create the database: `createdb ghoul_db`

### "Cannot find module" Errors

```bash
rm -rf node_modules package-lock.json
npm install
```

### Email Not Sending

- Check `.env` EMAIL settings
- Verify app password (not regular Gmail password)
- Check spam folder
- Enable "Less secure app access" in Gmail settings (legacy)

### Port Already in Use

Change PORT in `.env` to 5001, 5002, etc.

## Support

For issues or questions, refer to the documentation or open an issue on the project repository.
