# Rejump Relay Server

WebSocket relay server for Rejump multiplayer gameplay.

## Deploy to Render.com

### Step 1: Push to GitHub (or use Render's Git)

1. Create new GitHub repository
2. Upload `relay-server` folder contents
3. Push to GitHub

OR use Render's built-in Git (easier)

### Step 2: Deploy on Render

1. Go to Render.com dashboard
2. Click **"New +"** → **"Web Service"**
3. Choose deployment method:
   - **Option A:** Connect your GitHub repo
   - **Option B:** Use "Public Git repository" → Paste GitHub URL
4. Configure:
   - **Name:** `rejump-relay`
   - **Environment:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Plan:** `Free`
5. Click **"Create Web Service"**

### Step 3: Get Your WebSocket URL

After deployment (takes 2-3 minutes):
- Your service URL: `https://rejump-relay.onrender.com`
- WebSocket URL: `wss://rejump-relay.onrender.com`

Copy the WebSocket URL - you'll need it in Godot!

## Test Server

Visit your HTTPS URL in browser - should show:
```
Rejump Relay Server is running!
```

## Local Testing

```bash
cd relay-server
npm install
npm start
```

Server runs on: `ws://localhost:8080`
