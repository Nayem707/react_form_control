# Cloudinary Integration Guide

## 📋 Overview

This project now uses **Cloudinary** for cloud-based image storage instead of local file storage. Images are uploaded directly to Cloudinary and URLs are stored in the PostgreSQL database.

## ✅ What's Configured

### Backend Setup

1. **Cloudinary SDK** - Installed and configured
2. **Streamifier** - Converts buffers to streams for Cloudinary uploads
3. **Multer** - Uses memory storage (no local files saved)
4. **Middleware** - Custom Cloudinary upload middleware created

### Files Created/Modified

#### Created Files:

- `src/config/cloudinary.js` - Cloudinary SDK configuration
- `src/middleware/cloudinaryUpload.js` - Upload middleware with helper functions

#### Modified Files:

- `src/routes/posts.route.js` - POST endpoint uses Cloudinary for post images
- `src/routes/users.route.js` - PUT /profile endpoint uses Cloudinary for profile pictures

## 🔧 Configuration

### Environment Variables (Already Set)

```env
CLOUDINARY_CLOUD_NAME=dx35lq9z3
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### Folder Structure on Cloudinary

```
cloudinary://
├── social-media/
│   ├── posts/          # Post images
│   └── profiles/       # Profile pictures
```

## 📦 Database Schema

### Users Table

```javascript
profileImage: text('profile_image'); // Stores Cloudinary URL
```

### Posts Table

```javascript
images: text('images'); // Stores JSON stringified array of Cloudinary URLs
```

**Note:** The existing `text` columns can store full Cloudinary URLs (no migration needed).

Example Cloudinary URL:

```
https://res.cloudinary.com/dx35lq9z3/image/upload/v1234567890/social-media/posts/abc123.jpg
```

## 🚀 API Endpoints

### Create Post with Images

```http
POST /api/posts
Content-Type: multipart/form-data
Authorization: Bearer <token>

Body:
- content: "Post content here"
- images: [file1, file2, file3, file4]  # Max 4 images
```

**Response:**

```json
{
  "message": "Post created successfully",
  "post": {
    "id": 1,
    "userId": 1,
    "content": "Post content",
    "images": "[\"https://res.cloudinary.com/...\", \"https://res.cloudinary.com/...\"]",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### Update Profile Picture

```http
PUT /api/users/profile
Content-Type: multipart/form-data
Authorization: Bearer <token>

Body:
- profilePicture: <file>
- fullName: "Updated Name" (optional)
- bio: "Updated bio" (optional)
```

**Response:**

```json
{
  "message": "Profile updated successfully",
  "user": {
    "id": 1,
    "username": "johndoe",
    "email": "john@example.com",
    "fullName": "John Doe",
    "bio": "Software Developer",
    "profilePicture": "https://res.cloudinary.com/dx35lq9z3/image/upload/v1234567890/social-media/profiles/xyz789.jpg",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

## 🛠️ Middleware Functions

### `cloudinaryUploadMiddleware(options)`

Uploads files to Cloudinary after Multer processes them.

**Options:**

- `folder` (string) - Cloudinary folder path (e.g., 'social-media/posts')
- `maxFiles` (number, optional) - Max files to upload (default: no limit)

**Usage:**

```javascript
router.post(
  '/api/posts',
  authenticateToken,
  upload.array('images', 4), // Multer processes files into memory
  cloudinaryUploadMiddleware({ folder: 'social-media/posts' }), // Upload to Cloudinary
  handleMulterError,
  async (req, res) => {
    // req.files[0].cloudinaryUrl is now available
  }
);
```

### Helper Functions

#### `uploadToCloudinary(buffer, options)`

Uploads a single buffer to Cloudinary.

```javascript
const result = await uploadToCloudinary(fileBuffer, {
  folder: 'social-media/posts',
  resource_type: 'image',
});
// Returns: { secure_url, public_id, ... }
```

#### `deleteFromCloudinary(publicId)`

Deletes an image from Cloudinary.

```javascript
await deleteFromCloudinary('social-media/posts/abc123');
```

#### `extractPublicId(cloudinaryUrl)`

Extracts public_id from a Cloudinary URL.

```javascript
const publicId = extractPublicId(
  'https://res.cloudinary.com/.../social-media/posts/abc123.jpg'
);
// Returns: 'social-media/posts/abc123'
```

## 🧪 Testing

### Test Post Creation with Postman

1. **Create a POST request:**

   ```
   POST http://localhost:5000/api/posts
   ```

2. **Headers:**

   ```
   Authorization: Bearer <your_jwt_token>
   ```

3. **Body (form-data):**

   ```
   content: "Testing Cloudinary upload!"
   images: [Select files...]
   ```

4. **Expected Response:**
   ```json
   {
     "message": "Post created successfully",
     "post": {
       "id": 1,
       "content": "Testing Cloudinary upload!",
       "images": "[\"https://res.cloudinary.com/dx35lq9z3/image/upload/v.../social-media/posts/file1.jpg\"]"
     }
   }
   ```

### Test Profile Picture Update

1. **Create a PUT request:**

   ```
   PUT http://localhost:5000/api/users/profile
   ```

2. **Headers:**

   ```
   Authorization: Bearer <your_jwt_token>
   ```

3. **Body (form-data):**

   ```
   profilePicture: [Select file...]
   fullName: "John Doe"
   bio: "Software Engineer"
   ```

4. **Expected Response:**
   ```json
   {
     "message": "Profile updated successfully",
     "user": {
       "profilePicture": "https://res.cloudinary.com/dx35lq9z3/image/upload/v.../social-media/profiles/profile1.jpg"
     }
   }
   ```

## 📄 Frontend Usage

The existing `PostForm.jsx` component will work without changes! It already uses `FormData` correctly:

```javascript
const formData = new FormData();
formData.append('content', content);

if (selectedFiles) {
  Array.from(selectedFiles).forEach((file) => {
    formData.append('images', file);
  });
}

const res = await axios.post('http://localhost:5000/api/posts', formData, {
  headers: {
    'Content-Type': 'multipart/form-data',
    Authorization: `Bearer ${token}`,
  },
});

// Response will now contain Cloudinary URLs in res.data.post.images
```

### Displaying Images from Cloudinary

Parse the JSON array and display:

```javascript
const images = JSON.parse(post.images);

return (
  <div>
    {images.map((url, index) => (
      <img key={index} src={url} alt={`Post image ${index + 1}`} />
    ))}
  </div>
);
```

## 🔒 Security Notes

1. **API Keys** - Never commit `.env` file to version control
2. **Upload Limits** - Multer restricts file size to 10MB per file
3. **File Types** - Only image files are accepted (enforced by Multer)
4. **Authentication** - All upload endpoints require JWT token

## 📊 Cloudinary Features Available

### Image Transformations

Cloudinary automatically provides image transformation capabilities:

```javascript
// Original image
https://res.cloudinary.com/dx35lq9z3/image/upload/v123/social-media/posts/abc.jpg

// Thumbnail (200x200, cropped)
https://res.cloudinary.com/dx35lq9z3/image/upload/w_200,h_200,c_fill/v123/social-media/posts/abc.jpg

// Optimized quality
https://res.cloudinary.com/dx35lq9z3/image/upload/q_auto,f_auto/v123/social-media/posts/abc.jpg
```

### Recommended Transformations

- **Profile Pictures**: `w_300,h_300,c_fill,g_face,q_auto,f_auto`
- **Post Thumbnails**: `w_500,h_500,c_limit,q_auto,f_auto`
- **Full Size**: `q_auto,f_auto` (auto quality and format)

## 🐛 Troubleshooting

### "Invalid API credentials"

- Check `.env` file has correct `CLOUDINARY_API_KEY` and `CLOUDINARY_API_SECRET`
- Restart the server after updating `.env`

### "File upload failed"

- Verify Multer is processing files into memory (check `req.files` exists)
- Check file size is under 10MB
- Ensure file is an image type

### "Cloudinary URL not returned"

- Ensure `cloudinaryUploadMiddleware` is called AFTER `upload.array()` or `upload.single()`
- Check `req.file.cloudinaryUrl` or `req.files[0].cloudinaryUrl` exists

### Images not displaying in browser

- Verify the Cloudinary URL is valid (copy-paste into browser)
- Check CORS settings if loading from different domain
- Parse JSON array for post images: `JSON.parse(post.images)`

## 🎯 Next Steps

1. ✅ **Backend** - Fully integrated with Cloudinary
2. ✅ **Database** - Already supports text URLs (no migration needed)
3. ⏳ **Frontend** - `PostForm.jsx` works as-is, but add image preview for uploaded Cloudinary URLs
4. ⏳ **Optimization** - Implement Cloudinary transformations for thumbnails
5. ⏳ **Cleanup** - Add deletion logic when posts/users are deleted

## 📞 Support

For Cloudinary-specific issues, check:

- [Cloudinary Documentation](https://cloudinary.com/documentation)
- [Node.js SDK Guide](https://cloudinary.com/documentation/node_integration)

For project-specific issues, check the route handlers in:

- `src/routes/posts.route.js`
- `src/routes/users.route.js`
- `src/middleware/cloudinaryUpload.js`
