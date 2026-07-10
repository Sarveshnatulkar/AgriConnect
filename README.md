# AgriConnect

A full-stack MERN platform connecting Farmers, Buyers, Transporters, and Admins in one ecosystem.

## Tech Stack

- **Frontend:** React (Vite), React Router, Axios, Tailwind CSS
- **Backend:** Node.js, Express.js
- **Database:** MongoDB Atlas + Mongoose
- **Auth:** JWT + HTTP-only Cookies + bcrypt
- **Storage:** Cloudinary
- **Real-time:** Socket.io
- **Maps:** Leaflet
- **Deployment:** Vercel (client) + Render (server)

## Project Structure

```
AgriConnect/
├── client/   # React frontend
└── server/   # Node.js + Express backend
```

## Getting Started

### Backend

```bash
cd server
npm install
cp .env.example .env   # fill in your values
npm run dev
```

### Frontend

```bash
cd client
npm install
npm run dev
```

## Environment Variables

See `server/.env.example` for required backend variables.

## Development Roadmap

- Phase 1: Project Setup ✅
- Phase 2: Authentication
- Phase 3: Crop Marketplace CRUD
- Phase 4: Search, Filters, Pagination
- Phase 5: Farmer Dashboard
- Phase 6: Buyer Dashboard
- Phase 7: Order Management
- Phase 8: Transport Module
- Phase 9: Real-time Chat
- Phase 10: Notifications
- Phase 11: Weather & Market Price APIs
- Phase 12: Maps
- Phase 13: Reviews & Ratings
- Phase 14: Admin Panel
- Phase 15: Testing
- Phase 16: Deployment
