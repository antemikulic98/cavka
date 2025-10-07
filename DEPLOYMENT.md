# Deployment Guide for Cavka Application

## Environment Variables Required

Your application requires the following environment variables to be set in production:

### Database Configuration

```
MONGODB_URI=mongodb://localhost:27017/cavka
```

- **Development**: `mongodb://localhost:27017/cavka`
- **Production**: Use your MongoDB Atlas or hosted MongoDB URI

### Authentication

```
JWT_SECRET=your-super-secure-jwt-secret-change-this-in-production
```

- Generate a secure random string: `openssl rand -base64 32`
- **Critical**: Change this from the default value in production

### DigitalOcean Spaces (File Storage)

```
DO_SPACES_REGION=fra1
DO_SPACES_KEY=your-digitalocean-spaces-access-key
DO_SPACES_SECRET=your-digitalocean-spaces-secret-key
DO_SPACES_BUCKET=your-bucket-name
```

- Get credentials from your DigitalOcean control panel
- Regions: `fra1`, `nyc3`, `sfo3`, etc.

## Production Deployment Steps

### 1. Set Environment Variables

Configure all required environment variables in your hosting platform:

- Vercel: Project Settings → Environment Variables
- Netlify: Site Settings → Environment Variables
- DigitalOcean App Platform: App → Settings → Environment
- Railway: Project → Variables tab

### 2. Build Commands

```bash
# Development
yarn dev

# Production build
yarn build
yarn start
```

### 3. Verification Checklist

- [ ] All environment variables are set
- [ ] MongoDB connection is accessible from production
- [ ] DigitalOcean Spaces credentials are valid
- [ ] JWT_SECRET is secure and unique
- [ ] Build completes successfully
- [ ] Application starts without errors

## Common Issues

### "Application could not be served" Error

This usually indicates missing environment variables. Check:

1. `MONGODB_URI` is set and accessible
2. All DigitalOcean Spaces variables are configured
3. No typos in environment variable names

### Database Connection Issues

- Ensure MongoDB URI includes authentication if required
- Check IP whitelist settings for MongoDB Atlas
- Verify network connectivity from production environment

### File Upload Issues

- Confirm DigitalOcean Spaces credentials are correct
- Check bucket permissions and CORS settings
- Verify region matches your bucket location

## Local Development Setup

1. Copy environment template:

```bash
# Create your local environment file
cp .env.example .env.local
```

2. Update values in `.env.local`:

```env
MONGODB_URI=mongodb://localhost:27017/cavka
JWT_SECRET=your-development-secret
DO_SPACES_REGION=fra1
DO_SPACES_KEY=your-dev-key
DO_SPACES_SECRET=your-dev-secret
DO_SPACES_BUCKET=your-dev-bucket
```

3. Install and run:

```bash
yarn install
yarn dev
```
