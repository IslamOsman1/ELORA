# ELORA Dental Care

Full-stack dental clinic website with:
- `client`: React + Vite frontend
- `server`: Express + MongoDB API
- Admin dashboard for doctors, services, bookings, messages, and image uploads to Cloudinary

## Local Development

### Server
```bash
cd server
npm install
npm run dev
```

Required `server/.env`:
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/elora_dental
JWT_SECRET=replace_with_long_random_secret
CLIENT_URL=http://localhost:5173
ADMIN_EMAIL=admin@elora.com
ADMIN_PASSWORD=Admin@12345
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### Client
```bash
cd client
npm install
npm run dev
```

Required `client/.env`:
```env
VITE_API_URL=http://localhost:5000/api
```

## Deploy to Render

This repo includes [render.yaml](./render.yaml) for the backend.

### Render service settings
- Service type: `Web Service`
- Root directory: `server`
- Build command: `npm install`
- Start command: `npm start`
- Health check path: `/api/health`

### Render environment variables
```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_long_random_secret
CLIENT_URL=https://your-vercel-domain.vercel.app
ADMIN_EMAIL=admin@elora.com
ADMIN_PASSWORD=your_admin_password
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

## Deploy to Vercel

This repo includes [vercel.json](./vercel.json) for the frontend.

### Vercel project settings
- Framework: `Vite`
- Root directory: repository root
- Install command: `npm install --prefix client`
- Build command: `npm run build --prefix client`
- Output directory: `client/dist`

### Vercel environment variables
```env
VITE_API_URL=https://your-render-service.onrender.com/api
```

The included `vercel.json` also rewrites all routes to `index.html`, so React Router pages like `/about`, `/doctors`, and `/admin/login` work correctly after refresh.

## Production Checklist

1. Deploy backend to Render.
2. Copy the Render backend URL.
3. Set `VITE_API_URL` in Vercel to `https://your-render-service.onrender.com/api`.
4. Set `CLIENT_URL` in Render to your Vercel domain.
5. Redeploy both services after environment variables are added.

## Admin Login

- Email: `admin@elora.com`
- Password: value from `ADMIN_PASSWORD`
