# 🚀 Production Deployment Guide

## Environment Variables Required for Production

### Essential Variables

```bash
# Required: Backend API URL (replace with your actual backend URL)
VITE_API_BASE=https://your-backend-api.herokuapp.com

# Required: MapTiler API Key
PUBLIC_MAPTILER_KEY=your_maptiler_api_key_here
```

## Deployment Platforms

### 🟢 Vercel Deployment

1. **Connect Repository**
   - Link your GitHub repository to Vercel
   - Vercel will auto-detect SvelteKit

2. **Set Environment Variables**

   ```bash
   # In Vercel Dashboard > Project Settings > Environment Variables
   VITE_API_BASE=https://your-backend-url.com
   PUBLIC_MAPTILER_KEY=your_maptiler_key
   ```

3. **Deploy**
   - Vercel will automatically build and deploy
   - Build Command: `npm run build`
   - Output Directory: `.svelte-kit` (auto-detected)

### 🟣 Render Deployment

1. **Create Web Service**
   - Connect GitHub repository
   - Environment: `Node.js`

2. **Build Settings**

   ```bash
   Build Command: npm ci && npm run build
   Start Command: node build
   ```

3. **Environment Variables**
   ```bash
   VITE_API_BASE=https://your-backend-url.com
   PUBLIC_MAPTILER_KEY=your_maptiler_key
   NODE_ENV=production
   ```

### 🔵 Netlify Deployment

1. **Build Settings**

   ```bash
   Build Command: npm run build
   Publish Directory: build
   ```

2. **Environment Variables**
   ```bash
   VITE_API_BASE=https://your-backend-url.com
   PUBLIC_MAPTILER_KEY=your_maptiler_key
   ```

## 🔐 Security Configurations

### Content Security Policy (CSP)

The app automatically configures environment-specific CSP:

- **Development**: Allows localhost connections
- **Production**: Only allows HTTPS connections

### API Security

- ✅ Input sanitization on all user inputs
- ✅ Rate limiting (20 requests/minute)
- ✅ CSRF protection headers
- ✅ URL validation to prevent SSRF attacks

## 🧪 Pre-Deployment Checklist

### 1. Environment Variables

- [ ] `VITE_API_BASE` points to production backend
- [ ] `PUBLIC_MAPTILER_KEY` is valid and active
- [ ] No hardcoded localhost URLs remain

### 2. Backend Integration

- [ ] Backend has CORS configured for frontend domain
- [ ] Backend API endpoints are accessible via HTTPS
- [ ] Backend returns proper JSON responses

### 3. Security

- [ ] API keys are stored as environment variables
- [ ] CSP headers are properly configured
- [ ] No sensitive data in client-side code

### 4. Testing

```bash
# Build locally to test for errors
npm run build

# Preview production build
npm run preview

# Run tests
npm run test
```

## 🔧 Troubleshooting

### Common Issues

1. **"VITE_API_BASE is required" Error**
   - Ensure `VITE_API_BASE` environment variable is set in production
   - Value should be your backend URL (e.g., `https://api.example.com`)

2. **CORS Errors**
   - Configure backend to allow your frontend domain
   - Ensure backend includes proper CORS headers

3. **CSP Violations**
   - Check browser console for CSP errors
   - Ensure all external resources are allowed in CSP

4. **Map Not Loading**
   - Verify `PUBLIC_MAPTILER_KEY` is correct
   - Check MapTiler dashboard for API usage/limits

### Development vs Production

| Environment | API Base         | Proxy  | CSP Localhost |
| ----------- | ---------------- | ------ | ------------- |
| Development | `/api` (proxied) | ✅ Yes | ✅ Allowed    |
| Production  | `VITE_API_BASE`  | ❌ No  | ❌ Blocked    |

## 📝 Example Production .env

Create `.env.local` for production:

```bash
# Production Environment Variables
VITE_API_BASE=https://ai-itinerary-backend.herokuapp.com
PUBLIC_MAPTILER_KEY=pk.ey1234567890abcdef
NODE_ENV=production
```

## 🚨 Security Notes

- **Never commit** `.env` files with real API keys
- **Use environment variables** for all sensitive configuration
- **Enable HTTPS** for all production deployments
- **Rotate API keys** regularly
- **Monitor CSP violations** in production

## 📞 Support

If you encounter issues:

1. Check browser console for errors
2. Verify all environment variables are set
3. Test API endpoints independently
4. Check platform-specific deployment logs
