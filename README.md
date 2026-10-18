# Mandi Fresh

A small marketplace with two sides:

- **Vendors** (mandi stall owners) log in and update the price of each vegetable every day.
- **Customers** compare vendors and prices per vegetable, pick what they want from each vendor, and place an order. One cart can span several vendors; the server splits it into one order per vendor.

**Stack:** React (Vite) + Tailwind, Node + Express, MongoDB (Mongoose), JWT auth.

Why MongoDB: the data is simple documents (users, listings, orders) and it fits the MERN flow you already know. Postgres would also work, but it adds nothing for this scope.

## Run it

You need Node 18+ and a MongoDB instance (local, or a free Atlas cluster).

```bash
# 1. API
cd server
cp .env.example .env        # set MONGO_URI and JWT_SECRET
npm install
npm run seed                # optional: demo vendors, prices, one customer
npm run dev                 # http://localhost:5000

# 2. Web app (new terminal)
cd client
npm install
npm run dev                 # http://localhost:5173 (proxies /api to :5000)
```

Demo logins after seeding (password for all: `password123`):

| Role | Email |
|---|---|
| Vendor | ramesh@mandi.test, sunita@mandi.test, imran@mandi.test, lakshmi@mandi.test |
| Customer | asha@mandi.test |

## How it fits together

```
server/src
  index.js            Express app, CORS, routes
  models/             User, Listing (one vegetable price per vendor), Order
  middleware/auth.js  JWT check + role guard
  routes/             auth, vendors, listings (+ produce comparison), orders
  seed.js             demo data
client/src
  pages/              Home, Produce (price comparison), Vendors, VendorPage,
                      Cart, Orders, Login, Register, Dashboard (vendor)
  context/            Auth and Cart (cart is kept in localStorage)
```

Key API routes:

| Method | Route | Who |
|---|---|---|
| POST | /api/auth/register, /api/auth/login | anyone |
| GET | /api/produce, /api/produce/:key | anyone (grouped by vegetable, offers sorted by price) |
| GET | /api/vendors, /api/vendors/:id | anyone |
| GET/POST/PATCH/DELETE | /api/listings (/mine, /:id) | vendor |
| POST | /api/orders | customer (prices are re-read from the DB, never trusted from the client) |
| GET | /api/orders/mine | customer |
| GET, PATCH | /api/orders/vendor, /api/orders/:id/status | vendor |

## Deploying

- Client: Vercel (set `VITE_API_URL` to your API URL, e.g. `https://your-api.onrender.com/api`).
- API: Render / Railway. Set `MONGO_URI`, `JWT_SECRET`, `CLIENT_ORIGIN`.
- Database: MongoDB Atlas free tier.

## Ideas for next

Delivery slots, vendor ratings, price history per vegetable, WhatsApp order alerts, payments (Razorpay).
