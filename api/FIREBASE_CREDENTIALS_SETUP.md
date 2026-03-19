# Firebase Service Account Setup

## Important Security Notice

The `firebase-service-account.json.json` file contains sensitive credentials and should NEVER be committed to version control.

## Setup Instructions

1. Download your Firebase service account key from the Firebase Console:
   - Go to Firebase Console → Project Settings → Service Accounts
   - Click "Generate new private key"
   - Rename the downloaded file to `firebase-service-account.json.json`

2. Place the file in this directory (`api/`)

3. The file is already added to `.gitignore` to prevent accidental commits

## File Structure

Use `firebase-service-account.json.template` as a reference for the expected structure.

## Environment Variables Alternative

For better security, consider using environment variables instead of a JSON file:

- `FIREBASE_PRIVATE_KEY`
- `FIREBASE_CLIENT_EMAIL`
- `FIREBASE_PROJECT_ID`
- etc.
