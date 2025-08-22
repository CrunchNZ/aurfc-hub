# 🚀 AURFC Hub - Production Deployment Guide

This guide will walk you through deploying the AURFC Hub to production for testing with a small group.

## 📋 **Prerequisites**

Before starting deployment, ensure you have:

- ✅ Node.js 18+ installed
- ✅ Firebase CLI installed (`npm install -g firebase-tools`)
- ✅ A Firebase project set up for production
- ✅ Access to a hosting platform (Firebase Hosting, Vercel, Netlify, etc.)
- ✅ Domain name (optional but recommended)

## 🔧 **Step 1: Environment Setup**

### 1.1 Create Production Environment File

```bash
# Copy the production environment template
cp production-env.template .env.production

# Edit the file with your production Firebase credentials
nano .env.production
```

### 1.2 Configure Production Firebase

1. **Go to [Firebase Console](https://console.firebase.google.com/)**
2. **Create a new project** (e.g., `aurfc-prod`) or use existing
3. **Enable services**:
   - Authentication (Email/Password, Google)
   - Firestore Database
   - Storage
   - Hosting (if using Firebase Hosting)

4. **Get your configuration**:
   - Project Settings → General → Your apps
   - Copy the config values to `.env.production`

### 1.3 Update Environment Variables

Edit `.env.production` with your actual values:

```bash
# Production Firebase Configuration
VITE_FIREBASE_PROD_API_KEY=AIzaSyYourActualKeyHere
VITE_FIREBASE_PROD_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROD_PROJECT_ID=your-project-id
VITE_FIREBASE_PROD_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_PROD_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_PROD_APP_ID=1:123456789:web:abcdef123456
VITE_FIREBASE_PROD_MEASUREMENT_ID=G-ABCDEF1234
```

## 🏗️ **Step 2: Production Build**

### 2.1 Run Production Build Script

```bash
# Make script executable (if not already done)
chmod +x scripts/build-production.sh

# Run the production build
./scripts/build-production.sh
```

The script will:
- ✅ Validate environment variables
- ✅ Clean previous builds
- ✅ Install production dependencies
- ✅ Run tests
- ✅ Build optimized production bundle
- ✅ Generate build report
- ✅ Create deployment package

### 2.2 Verify Build Output

```bash
# Check build directory
ls -la dist/

# Test production build locally
npm run preview

# Open http://localhost:4173 to test
```

## 🌐 **Step 3: Choose Hosting Platform**

### Option A: Firebase Hosting (Recommended)

#### 3.1 Initialize Firebase Hosting

```bash
# Login to Firebase
firebase login

# Initialize hosting in your project
firebase init hosting

# Select your production project
# Set public directory to: dist
# Configure as single-page app: Yes
# Don't overwrite index.html: No
```

#### 3.2 Deploy to Firebase

```bash
# Deploy to production
firebase deploy --only hosting

# Your app will be available at:
# https://your-project-id.web.app
```

### Option B: Vercel

#### 3.1 Install Vercel CLI

```bash
npm install -g vercel
```

#### 3.2 Deploy to Vercel

```bash
# Deploy from dist directory
cd dist
vercel --prod

# Follow prompts to configure
# Your app will be available at the provided URL
```

### Option C: Netlify

#### 3.1 Deploy to Netlify

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy from dist directory
cd dist
netlify deploy --prod --dir=.

# Follow prompts to configure
# Your app will be available at the provided URL
```

## 🔒 **Step 4: Security & Configuration**

### 4.1 Firebase Security Rules

Update your Firestore security rules for production:

```javascript
// firestore.rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only access their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Team data - coaches and admins can manage
    match /teams/{teamId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        (get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['admin', 'coach']);
    }
    
    // Lineups - team members can view, coaches can manage
    match /teamLineups/{lineupId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        (get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['admin', 'coach']);
    }
  }
}
```

### 4.2 Deploy Security Rules

```bash
# Deploy Firestore rules
firebase deploy --only firestore:rules

# Deploy Storage rules (if using)
firebase deploy --only storage
```

### 4.3 Environment Variables

Ensure your hosting platform has the production environment variables:

- **Firebase Hosting**: Use `.env.production` (automatically handled)
- **Vercel**: Add in Vercel dashboard → Settings → Environment Variables
- **Netlify**: Add in Netlify dashboard → Site settings → Environment variables

## 🧪 **Step 5: Testing & Validation**

### 5.1 Functional Testing

Test these key features in production:

- ✅ User registration and login
- ✅ Team management
- ✅ Calendar integration
- ✅ Team builder
- ✅ Chat functionality
- ✅ Store operations

### 5.2 Performance Testing

```bash
# Test build size
du -sh dist/

# Check bundle analysis
npm run build -- --analyze

# Test loading performance
# Use browser DevTools → Network tab
# Use Lighthouse for performance audit
```

### 5.3 Security Testing

- ✅ Authentication flows
- ✅ Role-based access control
- ✅ Data isolation between users
- ✅ API endpoint security

## 📊 **Step 6: Monitoring & Analytics**

### 6.1 Enable Firebase Analytics

```bash
# Analytics are automatically enabled in production
# View data in Firebase Console → Analytics
```

### 6.2 Error Monitoring

```bash
# Firebase Crashlytics (if enabled)
# View crashes in Firebase Console → Crashlytics
```

### 6.3 Performance Monitoring

```bash
# Firebase Performance (if enabled)
# View performance data in Firebase Console → Performance
```

## 🔄 **Step 7: Continuous Deployment**

### 7.1 GitHub Actions (Optional)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
      - run: npm run test
      - uses: FirebaseExtended/action-hosting-deploy@v0
        with:
          repoToken: '${{ secrets.GITHUB_TOKEN }}'
          firebaseServiceAccount: '${{ secrets.FIREBASE_SERVICE_ACCOUNT }}'
          channelId: live
          projectId: your-project-id
```

## 🚨 **Troubleshooting**

### Common Issues

1. **Build Fails**
   ```bash
   # Check environment variables
   cat .env.production
   
   # Clear cache and rebuild
   rm -rf node_modules package-lock.json
   npm install
   npm run build
   ```

2. **Firebase Connection Issues**
   ```bash
   # Verify Firebase config
   firebase projects:list
   firebase use your-project-id
   
   # Check rules deployment
   firebase deploy --only firestore:rules
   ```

3. **Environment Variables Not Loading**
   ```bash
   # Verify .env.production exists
   ls -la .env.production
   
   # Check variable names (must start with VITE_)
   grep VITE_ .env.production
   ```

### Performance Issues

1. **Large Bundle Size**
   ```bash
   # Analyze bundle
   npm run build -- --analyze
   
   # Check for duplicate dependencies
   npm ls
   ```

2. **Slow Loading**
   - Enable compression in hosting
   - Use CDN for static assets
   - Implement lazy loading

## 📱 **Step 8: User Onboarding**

### 8.1 Create Test Users

1. **Admin Account**: Full access to all features
2. **Coach Account**: Team management and lineup creation
3. **Player Account**: Basic player features
4. **Parent Account**: Family management features

### 8.2 Test Scenarios

- ✅ User registration flow
- ✅ Role assignment
- ✅ Feature access based on roles
- ✅ Data creation and management
- ✅ Cross-user interactions

## 🎯 **Next Steps After Deployment**

1. **Monitor Performance**: Watch for errors and performance issues
2. **Gather Feedback**: Collect user feedback on usability
3. **Iterate**: Make improvements based on real usage
4. **Scale**: Prepare for larger user groups
5. **Backup**: Set up regular data backups

## 📞 **Support & Resources**

- **Firebase Documentation**: [firebase.google.com/docs](https://firebase.google.com/docs)
- **Vite Documentation**: [vitejs.dev](https://vitejs.dev)
- **React Documentation**: [react.dev](https://react.dev)
- **Tailwind CSS**: [tailwindcss.com](https://tailwindcss.com)

---

**🎉 Congratulations!** Your AURFC Hub is now ready for production testing.

**Remember**: Start with a small group, gather feedback, and iterate before scaling up.

**Happy Deploying! 🏉**
