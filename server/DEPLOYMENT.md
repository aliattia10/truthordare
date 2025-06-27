# Server Deployment Guide

## Deploy to Render

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click "New +" and select "Web Service"
3. Connect your GitHub repository
4. Configure the service:
   - **Name**: `couple-dare-date-server`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free

5. Click "Create Web Service"

## Environment Variables

The following environment variables will be automatically set:
- `NODE_ENV`: `production`

## After Deployment

Once deployed, update the `SOCKET_SERVER_URL` in `src/config/environment.ts` with your Render URL:

```typescript
export const SOCKET_SERVER_URL = isDevelopment 
  ? 'http://localhost:3001' 
  : 'https://your-render-app-name.onrender.com';
```

Then redeploy the frontend to Netlify:

```bash
npm run build
npx netlify-cli deploy --prod --dir=dist
```

## Testing

1. Open the Netlify URL: https://couple-dare-date.netlify.app
2. Click "Online Game"
3. Create a room and share the code with a partner
4. Test the multiplayer functionality

## Troubleshooting

- Check Render logs for server issues
- Check Netlify logs for frontend issues
- Ensure CORS is properly configured for your domain 