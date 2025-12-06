# Railway Deployment Guide for Llyods Shipping Tracker

## Issues Fixed

### 1. Missing Start Script
✅ **FIXED** - Added `"start": "node server.js"` to package.json

### 2. Missing Build Configuration
✅ **FIXED** - Created `nixpacks.toml` to ensure frontend builds before deployment

## Railway Configuration Steps

### Step 1: Environment Variables
In your Railway project dashboard, go to **Variables** and ensure these are set:

```
DATABASE_URL=<your_railway_postgresql_connection_string>
PORT=<will_be_set_automatically_by_railway>
NODE_ENV=production
```

**IMPORTANT:** Railway automatically provides `PORT` and `DATABASE_URL` if you have a PostgreSQL database attached.

### Step 2: Build & Deploy Settings
Railway will automatically:
1. Run `npm ci` to install dependencies
2. Run `npm run build` to build the Vite frontend
3. Run `npm start` to start the Express server

### Step 3: Verify Deployment

After deployment, test these endpoints on your Railway URL:

1. **Health Check:**
   ```
   GET https://your-app.railway.app/api/health
   ```

2. **Diagnostics:**
   ```
   GET https://your-app.railway.app/api/diagnostics
   ```

3. **Test Tracking:**
   ```
   POST https://your-app.railway.app/api/track
   Content-Type: application/json

   {
     "trackingNumber": "30944SX22STP885"
   }
   ```

4. **Frontend:**
   ```
   GET https://your-app.railway.app/
   ```

### Step 4: Common Issues & Solutions

#### Issue: "Application failed to respond"
**Solution:** Check Railway logs to ensure:
- Database connection is successful
- Frontend build completed
- Server started on the correct PORT

#### Issue: "Cannot GET /api/track"
**Solution:**
- Verify the tracking endpoint accepts POST requests, not GET
- Check that the request has proper Content-Type header

#### Issue: Tracking doesn't show up in frontend
**Solution:**
- Open browser DevTools > Network tab
- Submit a tracking number
- Check if the API call to `/api/track` returns 200 OK
- Verify the response contains tracking data

## Files Modified/Created

1. ✅ `package.json` - Added "start" script
2. ✅ `nixpacks.toml` - Created build configuration for Railway
3. ✅ `RAILWAY_DEPLOYMENT.md` - This guide

## Next Steps

1. Commit all changes:
   ```bash
   git add package.json nixpacks.toml RAILWAY_DEPLOYMENT.md
   git commit -m "Fix Railway deployment configuration for tracking service"
   git push
   ```

2. Railway will automatically redeploy

3. Test the tracking functionality on your live Railway URL

4. Monitor Railway logs for any errors

## Testing Checklist

After deployment, verify:
- [ ] Homepage loads correctly
- [ ] Tracking page is accessible
- [ ] Submitting tracking number "30944SX22STP885" returns shipment details
- [ ] Contact form works and saves to database
- [ ] All navigation links work
- [ ] Mobile responsive design works

## Support

If issues persist, check:
1. Railway deployment logs
2. Browser console for JavaScript errors
3. Network tab for failed API calls
4. Database connection in Railway dashboard
