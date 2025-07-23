
# AURFC App Architecture

## Overview
This is a React-based Progressive Web App (PWA) built with Vite, integrated with Firebase for backend services. The app supports user roles (admins, coaches, players, parents) with RBAC, offline capabilities, and modular components. Environments: dev (verbose logging/hot-reload), test (strict testing), prod (optimized/minimal logging).

## Key Components
- **Frontend**: React components in src/components/ (e.g., Login, JuniorPortal). Routing via react-router-dom.
- **Services**: Firebase wrappers in src/services/ (e.g., auth.js for sign-up/login).
- **Backend**: Firebase (Firestore for data, Auth for users, Storage for uploads, Analytics/Crashlytics for monitoring).

## Data Flow
- User auth → Role check (Firebase Rules) → Access to features (e.g., coaches edit rosters in Firestore).
- Real-time: Firestore listeners for chats/notifications.
- Offline: PWA service worker caches data; sync on reconnect.

## Security
- RBAC via Firebase Security Rules.
- Consent/Privacy: UI prompts stored in Firestore.

## Environments
- Dev: .env.development with debug flags.
- Test: Automated tests via Jest.
- Prod: Optimized build, minimal logs.

## Diagrams
(TODO: Add simple ASCII diagrams if needed, e.g., component hierarchy.)

