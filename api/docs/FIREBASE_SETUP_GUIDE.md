# Firebase Storage + HEIC/HEIF Conversion Setup Guide

## 🎯 What Was Upgraded

Your existing Multer file upload system has been upgraded with:

1. ✅ **Memory Storage** - Files stored in memory instead of disk
2. ✅ **HEIC/HEIF Conversion** - Automatic conversion to JPEG using `heic-convert`
3. ✅ **Firebase Storage Integration** - Files uploaded to Firebase Cloud Storage
4. ✅ **Public URLs** - Get instant public URLs for uploaded files
5. ✅ **Modular Architecture** - Clean, maintainable code structure

---

## 📁 New File Structure

```
api/
├── src/
│   ├── config/
│   │   └── firebase.js                 # ✨ NEW: Firebase Admin SDK config
│   ├── middleware/
│   │   └── heicConversion.js           # ✨ NEW: HEIC→JPEG conversion
│   ├── utils/
│   │   ├── fileUpload.js               # ✅ UPGRADED: Memory storage
│   │   └── firebaseUpload.js           # ✨ NEW: Firebase upload handler
│   └── routes/
│       ├── posts.js                    # ✅ UPDATED: Uses new middlewares
│       └── users.js                    # ✅ UPDATED: Uses new middlewares
└── firebase-service-account.json       # ⚠️  REQUIRED: Firebase credentials
```

---

## 🔧 Setup Instructions

### Step 1: Firebase Setup

1. **Go to Firebase Console**

   - Visit: https://console.firebase.google.com/
   - Select your project: `stuart-image-upload`

2. **Enable Cloud Storage**

   - Go to **Build** → **Storage**
   - Click **Get Started**
   - Choose **Start in production mode**
   - Select a location (e.g., `us-central1`)

3. **Update Storage Rules** (for public read access)

   ```javascript
   rules_version = '2';
   service firebase.storage {
     match /b/{bucket}/o {
       match /{allPaths=**} {
         allow read: if true;  // Public read
         allow write: if false;  // Only server can write
       }
     }
   }
   ```

4. **Download Service Account Key**
   - Go to **Project Settings** (gear icon)
   - Click **Service Accounts** tab
   - Click **Generate New Private Key**
   - Save the JSON file as: `api/firebase-service-account.json`

### Step 2: Install Dependencies

```bash
cd api
npm install firebase-admin heic-convert
```

### Step 3: Verify Firebase Connection

Create a test file to verify Firebase is working:

```bash
cd api
node -e "require('./src/config/firebase').initializeFirebase(); console.log('✅ Firebase connected!');"
```

If successful, you'll see: `✅ Firebase Admin initialized with service account`

---

## 🚀 How to Use in Your Routes

### Example 1: Single File Upload (Profile Picture)

```javascript
const express = require('express');
const { upload, handleMulterError } = require('../utils/fileUpload');
const { heicConversionMiddleware } = require('../middleware/heicConversion');
const { firebaseUploadMiddleware } = require('../utils/firebaseUpload');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.put(
  '/profile',
  authenticateToken,
  upload.single('profilePicture'), // Multer: Receive file
  heicConversionMiddleware({ quality: 92 }), // Convert HEIC→JPEG if needed
  firebaseUploadMiddleware({ folder: 'profiles' }), // Upload to Firebase
  handleMulterError,
  async (req, res) => {
    // req.file.firebaseUrl contains the public URL!

    if (req.file) {
      console.log('Uploaded to:', req.file.firebaseUrl);

      // Save to database
      await updateUserProfile(req.user.id, {
        profilePicture: req.file.firebaseUrl,
      });

      res.json({
        message: 'Profile updated successfully',
        profilePictureUrl: req.file.firebaseUrl,
      });
    } else {
      res.json({ message: 'No file uploaded' });
    }
  }
);
```

### Example 2: Multiple Files Upload (Post Images)

```javascript
router.post(
  '/posts',
  authenticateToken,
  upload.array('images', 4), // Multer: Up to 4 files
  heicConversionMiddleware({ quality: 92 }), // Convert HEIC→JPEG if needed
  firebaseUploadMiddleware({ folder: 'posts' }), // Upload to Firebase
  handleMulterError,
  async (req, res) => {
    // req.firebaseUrls contains array of public URLs!

    const { content } = req.body;

    const post = await createPost({
      userId: req.user.id,
      content,
      images: JSON.stringify(req.firebaseUrls), // Store URLs
    });

    res.status(201).json({
      message: 'Post created successfully',
      post,
      imageUrls: req.firebaseUrls, // Return URLs to client
    });
  }
);
```

---

## 📋 Middleware Flow

### Upload Pipeline

```
1. Client sends file
   ↓
2. Multer receives → stores in memory (req.file.buffer)
   ↓
3. HEIC Conversion Middleware
   - Detects HEIC/HEIF files
   - Converts to JPEG (if needed)
   - Updates req.file properties
   ↓
4. Firebase Upload Middleware
   - Uploads buffer to Firebase Storage
   - Makes file public
   - Adds req.file.firebaseUrl
   ↓
5. Your Route Handler
   - Access req.file.firebaseUrl
   - Save to database
   - Return URL to client
```

---

## 🔑 What Each File Does

### `src/config/firebase.js`

- Initializes Firebase Admin SDK
- Provides `getStorageBucket()` function
- Handles credentials (service account or env vars)

### `src/middleware/heicConversion.js`

- Middleware: `heicConversionMiddleware({ quality: 92 })`
- Detects HEIC/HEIF files automatically
- Converts to JPEG using `heic-convert`
- Updates file buffer and properties

### `src/utils/firebaseUpload.js`

- Middleware: `firebaseUploadMiddleware({ folder: 'uploads' })`
- Uploads file buffers to Firebase Storage
- Makes files publicly accessible
- Adds `req.file.firebaseUrl` and `req.firebaseUrls`

### `src/utils/fileUpload.js`

- Exports configured Multer instance
- Uses **memory storage** (not disk)
- File validation and size limits
- Error handling middleware

---

## 🎨 Available Options

### heicConversionMiddleware Options

```javascript
heicConversionMiddleware({
  quality: 92, // JPEG quality 0-100 (default: 92)
});
```

### firebaseUploadMiddleware Options

```javascript
firebaseUploadMiddleware({
  folder: 'uploads', // Firebase Storage folder path
  makePublic: true, // Make files publicly accessible
  metadata: {
    // Custom metadata
    uploadedBy: 'user123',
  },
});
```

---

## 📊 Response Data Structure

### Single File Upload (req.file)

```javascript
{
  fieldname: 'profilePicture',
  originalname: 'photo.HEIC',     // Original name
  encoding: '7bit',
  mimetype: 'image/jpeg',          // Converted to JPEG
  buffer: <Buffer...>,
  size: 245678,

  // ✨ Added by Firebase middleware
  firebaseUrl: 'https://storage.googleapis.com/.../.../file.jpg',
  firebasePath: 'profile-pictures/profilePicture-1234567890-123.jpg',
  uploadResult: {
    success: true,
    fileName: 'profilePicture-1234567890-123.jpg',
    filePath: 'profile-pictures/profilePicture-1234567890-123.jpg',
    publicUrl: 'https://storage.googleapis.com/.../file.jpg',
    size: 245678,
    mimetype: 'image/jpeg'
  }
}
```

### Multiple Files Upload (req.files)

```javascript
req.files = [
  {
    /* file 1 */
  },
  {
    /* file 2 */
  },
];

req.firebaseUrls = [
  'https://storage.googleapis.com/.../file1.jpg',
  'https://storage.googleapis.com/.../file2.jpg',
];
```

---

## 🛡️ Error Handling

### Multer Errors

```javascript
// File too large
{
  "error": "File too large",
  "message": "Image size should not exceed 10MB per file"
}

// Invalid file type
{
  "error": "Invalid file type",
  "message": "Only image files are allowed. Supported: JPEG, PNG, WebP, GIF, HEIC..."
}
```

### HEIC Conversion Errors

```javascript
{
  "error": "Image processing failed",
  "message": "Failed to process HEIC/HEIF image: [details]"
}
```

### Firebase Upload Errors

```javascript
{
  "error": "File upload failed",
  "message": "Failed to upload to Firebase: [details]"
}
```

---

## 🔄 Migration Guide

### Before (Local Storage)

```javascript
router.post('/upload', upload.single('image'), (req, res) => {
  // File saved to disk
  const filePath = req.file.path; // "uploads/image-123.jpg"
  res.json({ path: filePath });
});
```

### After (Firebase Storage)

```javascript
router.post(
  '/upload',
  upload.single('image'),
  heicConversionMiddleware({ quality: 92 }),
  firebaseUploadMiddleware({ folder: 'uploads' }),
  (req, res) => {
    // File uploaded to Firebase
    const fileUrl = req.file.firebaseUrl; // Full public URL
    res.json({ url: fileUrl });
  }
);
```

---

## 🧪 Testing

### Test 1: Upload Regular Image

```bash
curl -X POST http://localhost:5000/api/posts \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "content=Test post" \
  -F "images=@test.jpg"
```

### Test 2: Upload HEIC Image (will auto-convert)

```bash
curl -X POST http://localhost:5000/api/posts \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "content=iPhone photo" \
  -F "images=@photo.HEIC"
```

### Expected Response

```json
{
  "message": "Post created successfully",
  "post": {
    "id": 123,
    "content": "Test post",
    "images": "[\"https://storage.googleapis.com/.../image.jpg\"]"
  },
  "imageUrls": ["https://storage.googleapis.com/.../image.jpg"]
}
```

---

## 📝 Environment Variables (Optional)

Instead of service account file, you can use environment variables:

```env
# .env
FIREBASE_PROJECT_ID=stuart-image-upload
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxx@stuart-image-upload.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_STORAGE_BUCKET=stuart-image-upload.firebasestorage.app
```

---

## 🎉 You're All Set!

Your upload system now:

- ✅ Accepts HEIC/HEIF from iPhones
- ✅ Automatically converts to JPEG
- ✅ Uploads to Firebase Cloud Storage
- ✅ Returns public URLs instantly
- ✅ Works on all browsers

**No more local file management!** All files are now stored securely in Firebase with public URLs ready for immediate use.

---

## 🆘 Troubleshooting

### "Firebase initialization failed"

- Ensure `firebase-service-account.json` exists in `api/` directory
- Check file has correct permissions
- Verify JSON is valid

### "HEIC conversion failed"

- Ensure `heic-convert` is installed: `npm install heic-convert`
- Check file is actually HEIC/HEIF format
- Try with a different HEIC file

### "Upload to Firebase failed"

- Verify Firebase Storage is enabled in console
- Check storage rules allow writes
- Ensure service account has Storage Admin role

### Files not appearing in Firebase Console

- Wait a few seconds and refresh
- Check correct bucket name
- Verify folder path in Firebase Storage UI

---

## 📞 Support

If you encounter issues:

1. Check server console for error messages
2. Verify Firebase credentials are correct
3. Ensure all npm packages are installed
4. Test with a simple non-HEIC image first
