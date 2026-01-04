# GameSnap Deployment Guide

## 🚀 Quick Deploy to Vercel

### Option 1: One-Click Deploy (Recommended)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/pduddumpudi/gamesnap)

**Steps:**
1. Click the "Deploy with Vercel" button above
2. Sign in with your GitHub account
3. Click "Create" to deploy
4. Once deployed, add environment variables (see below)

### Option 2: Manual Vercel Deployment

1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel:**
   ```bash
   vercel login
   ```

3. **Deploy:**
   ```bash
   cd gamesnap
   vercel
   ```

4. **Follow prompts:**
   - Set up and deploy? **Y**
   - Which scope? Choose your account
   - Link to existing project? **N**
   - Project name? **gamesnap** (or your choice)
   - Directory? **./
   - Override settings? **N**

5. **Production deployment:**
   ```bash
   vercel --prod
   ```

---

## 🔐 Environment Variables Setup

After deployment, add these environment variables in your Vercel dashboard:

### Required for Full Functionality:

```env
# Supabase (for user data & handwriting profiles)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Google Cloud Vision (for OCR)
GOOGLE_CLOUD_API_KEY=your_google_cloud_api_key

# Lichess OAuth (for direct export)
LICHESS_CLIENT_ID=your_lichess_client_id
LICHESS_CLIENT_SECRET=your_lichess_client_secret

# Chess.com OAuth (for direct export)
CHESSCOM_CLIENT_ID=your_chesscom_client_id
CHESSCOM_CLIENT_SECRET=your_chesscom_client_secret

# App URL
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

### How to Add Environment Variables:

1. Go to your Vercel dashboard: https://vercel.com/dashboard
2. Select your `gamesnap` project
3. Go to **Settings** → **Environment Variables**
4. Add each variable one by one
5. Redeploy after adding all variables

---

## 📋 Service Setup Checklist

### 1. Supabase Setup

1. Go to [https://supabase.com](https://supabase.com)
2. Create a new project
3. Go to **Settings** → **API**
4. Copy:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - anon/public key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - service_role key → `SUPABASE_SERVICE_ROLE_KEY`

5. **Create database tables:**
   Go to **SQL Editor** and run:

```sql
-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users,
  email TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Saved games
CREATE TABLE games (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users,
  pgn TEXT NOT NULL,
  white_player TEXT,
  black_player TEXT,
  result TEXT,
  event_name TEXT,
  date_played DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Handwriting profiles
CREATE TABLE handwriting_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users UNIQUE,
  char_mappings JSONB DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- OAuth tokens
CREATE TABLE oauth_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users,
  provider TEXT NOT NULL,
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  expires_at TIMESTAMPTZ,
  UNIQUE(user_id, provider)
);
```

### 2. Google Cloud Vision API Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing
3. Enable **Cloud Vision API**
4. Go to **APIs & Services** → **Credentials**
5. Create **API Key**
6. Copy the key → `GOOGLE_CLOUD_API_KEY`
7. (Optional) Restrict the key to Cloud Vision API only

### 3. Lichess OAuth Setup

1. Go to [https://lichess.org/account/oauth/app](https://lichess.org/account/oauth/app)
2. Click **New OAuth App**
3. Fill in:
   - **Name:** GameSnap
   - **Redirect URI:** `https://your-app.vercel.app/api/auth/lichess/callback`
   - **Scopes:** Check `study:write` and `puzzle:write`
4. Copy:
   - Client ID → `LICHESS_CLIENT_ID`
   - Client Secret → `LICHESS_CLIENT_SECRET`

### 4. Chess.com OAuth Setup

1. Go to [https://www.chess.com/clubs/forum/view/developer-community](https://www.chess.com/clubs/forum/view/developer-community)
2. Request developer access (may take a few days)
3. Once approved, create OAuth application
4. Copy:
   - Client ID → `CHESSCOM_CLIENT_ID`
   - Client Secret → `CHESSCOM_CLIENT_SECRET`

---

## 🌐 Custom Domain (Optional)

1. In Vercel dashboard, go to **Settings** → **Domains**
2. Add your custom domain (e.g., `gamesnap.io`)
3. Follow DNS configuration instructions
4. Update `NEXT_PUBLIC_APP_URL` to your custom domain

---

## 🔄 Continuous Deployment

Every push to the `main` branch will automatically deploy to Vercel.

**Deploy a specific branch:**
```bash
git push origin your-branch
```
Then go to Vercel dashboard and promote the deployment to production.

---

## 📊 Monitoring & Analytics

**Vercel Dashboard:**
- View deployment logs
- Monitor function executions
- Check error rates
- View bandwidth usage

**Recommended additions:**
- Add **Vercel Analytics** for performance monitoring
- Set up **Sentry** for error tracking (optional)

---

## 🐛 Troubleshooting

### Build fails?
- Check Node.js version (should be 18+)
- Verify all dependencies are in `package.json`
- Check build logs in Vercel dashboard

### API routes not working?
- Verify environment variables are set
- Check API route logs in Vercel dashboard
- Ensure Google Cloud Vision API is enabled

### OCR not working?
- Verify `GOOGLE_CLOUD_API_KEY` is correct
- Check Google Cloud billing is enabled
- Ensure API key has Cloud Vision permissions

---

## 📈 Next Steps After Deployment

1. Test camera capture on mobile
2. Upload a test scoresheet image
3. Verify OCR is working
4. Test Lichess export (if OAuth configured)
5. Monitor error logs for first week
6. Gather user feedback

---

## 💰 Cost Estimates

**Free Tier:**
- Vercel: Free for hobby projects
- Supabase: 500MB database, 2GB bandwidth/month
- Google Vision: $1.50/1000 images (first 1000/month free)

**Expected costs (100 users/month):**
- Vercel: $0 (within free tier)
- Supabase: $0 (within free tier)
- Google Vision: ~$10-20/month (depending on usage)

---

## 🔗 Useful Links

- **Live Site:** https://gamesnap.vercel.app (after deployment)
- **GitHub Repo:** https://github.com/pduddumpudi/gamesnap
- **Vercel Dashboard:** https://vercel.com/dashboard
- **Supabase Dashboard:** https://app.supabase.com
- **Google Cloud Console:** https://console.cloud.google.com

---

🎉 **Congratulations!** Your GameSnap deployment is ready to go!
