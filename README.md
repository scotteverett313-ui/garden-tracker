# 🌿 Plant Tracker

Track seeds and plants across your Basement Grow Station, Greenhouse, Raised Beds, and In-Ground Beds.

---

## Deploy in 3 Steps

### Step 1 — Push to GitHub

1. Go to github.com and create a **New Repository**
   - Name it: `garden-tracker`
   - Set to Public
   - Don't add README (you have one)
   - Click **Create repository**

2. On your computer, open Terminal in this folder and run:
```bash
npm install
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/garden-tracker.git
git push -u origin main
```

---

### Step 2 — Deploy on Vercel

1. Go to vercel.com and sign up (free) — use your GitHub account
2. Click **Add New Project**
3. Import your `garden-tracker` repository
4. Leave all settings as default — Vercel auto-detects Vite
5. Click **Deploy**

Your app will be live at: `https://garden-tracker-YOUR_USERNAME.vercel.app`

---

### Step 3 — Add to iPhone Home Screen

1. Open Safari on your iPhone
2. Go to your Vercel URL
3. Tap the **Share** button (box with arrow)
4. Tap **Add to Home Screen**
5. Name it "Plant Tracker" → tap **Add**

It will appear on your home screen and launch like a native app.

---

## Local Development

```bash
npm install
npm run dev
```

Open http://localhost:5173

---

## Tech Stack
- React 18
- Vite
- localStorage (data stays on your device)
- No backend required
