# 🌾 AgriConnect

A full-stack MERN-based agricultural marketplace that connects **Farmers**, **Buyers**, **Transporters**, and **Admins** on a single platform for seamless crop trading and logistics management.

AgriConnect simplifies the agricultural supply chain by enabling farmers to list crops, buyers to place orders, transporters to manage deliveries, and administrators to oversee the entire platform.

---

## 🚀 Live Demo

Frontend: _Coming Soon_

Backend API: _Coming Soon_

---

# 📸 Screenshots

## 🏠 Home Page

![Home Page](./screenshots/home.png)

---

## 🌾 Marketplace

![Marketplace](./screenshots/marketplace.png)

---

## 👨‍🌾 Farmer Dashboard

![Farmer Dashboard](./screenshots/farmer-dashboard.png)

---

## 🛒 Buyer Dashboard

![Buyer Dashboard](./screenshots/buyer-dashboard.png)

---

## 🚚 Transport Dashboard

![Transport Dashboard](./screenshots/transporter-dashboard.png)

---

## 👨‍💼 Admin Dashboard

![Admin Dashboard](./screenshots/admin-dashboard.png)

---

## 🌱 Crop Details

![Crop Details](./screenshots/crop-details.png)

---

## 📦 Orders

![Orders](./screenshots/orders.png)

---

# ✨ Features

## 👨‍🌾 Farmer

- Register & Login
- Create crop listings
- Upload crop images using Cloudinary
- Edit crop details
- Delete crop listings
- Manage personal listings
- View received orders
- Accept or reject orders
- Profile management

---

## 🛒 Buyer

- Browse marketplace
- Search crops
- Filter crops
- Sort listings
- Wishlist management
- View crop details
- Contact farmers
- Place orders
- Track orders
- Profile management

---

## 🚚 Transporter

- View transport requests
- Accept deliveries
- Manage assigned deliveries
- Update delivery status
- Profile management

---

## 👨‍💼 Admin

- Dashboard analytics
- User management
- Crop management
- Order management
- Transport management
- Search & filtering
- Platform monitoring

---

# 🔐 Authentication & Security

- JWT Authentication
- HTTP-only Cookies
- Protected Routes
- Role-Based Authorization
- Password Hashing using bcrypt
- Secure API Access
- Input Validation
- Error Handling

---

# 🔎 Marketplace Features

- Featured Crops
- Category Browsing
- Search
- Category Filters
- Price Sorting
- Pagination
- Responsive Cards
- Wishlist
- Crop Details

---

# 📦 Order Workflow

Farmer Lists Crop

↓

Buyer Places Order

↓

Farmer Accepts Order

↓

Transport Request Created

↓

Transporter Accepts Delivery

↓

Order Completed

---

# 🛠 Tech Stack

## Frontend

- React.js
- React Router
- Context API
- Axios
- Tailwind CSS
- React Hot Toast

## Backend

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT
- bcrypt
- Cookie Parser
- Multer
- Cloudinary

## Database

- MongoDB Atlas

## Deployment

- Vercel
- Render
- Cloudinary

---

# 📂 Project Structure

```
AgriConnect
│
├── client
│   ├── components
│   ├── pages
│   ├── context
│   ├── services
│   ├── hooks
│   ├── layouts
│   └── utils
│
├── server
│   ├── controllers
│   ├── models
│   ├── routes
│   ├── middlewares
│   ├── config
│   ├── utils
│   └── uploads
│
└── README.md
```

---

# ⚙️ Installation

## Clone Repository

```bash
git clone https://github.com/yourusername/AgriConnect.git
```

---

## Backend

```bash
cd server
npm install
npm run dev
```

---

## Frontend

```bash
cd client
npm install
npm run dev
```

---

# 🌿 Environment Variables

### Server (.env)

```env
PORT=5000

MONGO_URI=

JWT_SECRET=

JWT_EXPIRES_IN=7d

CLOUDINARY_CLOUD_NAME=

CLOUDINARY_API_KEY=

CLOUDINARY_API_SECRET=

CLIENT_URL=http://localhost:5173
```

---

### Client (.env)

```env
VITE_API_BASE_URL=/api/v1

VITE_CLOUDINARY_CLOUD_NAME=

VITE_CLOUDINARY_UPLOAD_PRESET=
```

---

# 📊 Core Modules

- Authentication
- Marketplace
- Farmer Dashboard
- Buyer Dashboard
- Transport Dashboard
- Admin Dashboard
- Crop Management
- Orders
- Wishlist
- Profile Management
- Search & Filtering
- Image Upload
- Role-Based Access

---

# 🎯 Learning Outcomes

This project helped in understanding:

- Full Stack MERN Development
- REST API Design
- Authentication & Authorization
- Cloudinary Integration
- MongoDB Relationships
- State Management
- File Uploads
- Protected Routes
- Responsive UI Design
- Real-world Marketplace Architecture

---

# 🔮 Future Enhancements

- AI-powered crop recommendations
- Weather integration
- Real-time notifications
- Payment gateway
- Multi-language support
- Mobile application

---

# 👨‍💻 Author

**Sarvesh Shamrao Natulkar**

- GitHub: https://github.com/Sarveshnatulkar

---

# ⭐ If you like this project

Give it a ⭐ on GitHub!