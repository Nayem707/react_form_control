# Social Media API Documentation

## Overview

This is a complete RESTful API for a social media application built with Node.js, Express, PostgreSQL, and Drizzle ORM.

## Base URL

```
http://localhost:5000/api
```

## Authentication

All endpoints (except auth endpoints) require a Bearer token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

## Error Response Format

```json
{
  "error": "Error type",
  "message": "Detailed error message"
}
```

## Success Response Format

```json
{
  "message": "Success message",
  "data": {}
}
```

## Health Check

### Server Health

- **GET** `/health`
- **Access:** Public
- **Response:** Server status and timestamp

---

## Authentication Endpoints

### Register User

- **POST** `/auth/register`
- **Access:** Public
- **Content-Type:** `multipart/form-data`
- **Body:**
  - `name`: string (required) - Full name
  - `username`: string (required) - Unique username
  - `email`: string (required) - Valid email address
  - `password`: string (required) - Password
  - `profileImage`: file (optional) - Profile picture
- **Response:** User object + JWT token

### Login User

- **POST** `/auth/login`
- **Access:** Public
- **Body:**
  ```json
  {
    "email": "string",
    "password": "string"
  }
  ```
- **Response:** User object + JWT token

### Get Current User

- **GET** `/auth/me`
- **Access:** Private
- **Headers:** Authorization: Bearer token
- **Response:** Current user profile

### Update Profile Image

- **PUT** `/auth/profile-image`
- **Access:** Private
- **Content-Type:** `multipart/form-data`
- **Body:**
  - `profileImage`: file (required) - New profile picture
- **Response:** Updated user with new profile image URL

### Get All Users

- **GET** `/auth/users`
- **Access:** Private
- **Response:** Array of all registered users (admin endpoint)

---

## User Management Endpoints

### Get Current User Profile

- **GET** `/users/profile`
- **Access:** Private
- **Response:** Current user's complete profile with follow counts

### Get User by ID

- **GET** `/users/:id`
- **Access:** Private
- **Parameters:**
  - `id`: User ID (number)
- **Response:** User profile with follow status and counts

### Update User Profile

- **PUT** `/users/profile`
- **Access:** Private
- **Content-Type:** `multipart/form-data`
- **Body:**
  - `fullName`: string (optional) - Full display name
  - `bio`: string (optional) - User biography
  - `profilePicture`: file (optional) - Profile picture file
- **Response:** Updated user profile

### Search Users

- **GET** `/users/search`
- **Access:** Private
- **Query Parameters:**
  - `q`: string (required) - Search query
  - `page`: number (optional, default: 1) - Page number
  - `limit`: number (optional, default: 20) - Results per page
- **Response:** Array of users matching search with follow status

### Get User Posts

- **GET** `/users/:id/posts`
- **Access:** Private
- **Parameters:**
  - `id`: User ID (number)
- **Query Parameters:**
  - `page`: number (optional, default: 1) - Page number
  - `limit`: number (optional, default: 20) - Posts per page
- **Response:** Array of posts by specific user with metadata

---

## Post Management Endpoints

### Create Post

- **POST** `/posts`
- **Access:** Private
- **Content-Type:** `multipart/form-data`
- **Body:**
  - `content`: string (required) - Post content/text
  - `images`: files[] (optional, max 4 images) - Post images
- **Response:** Created post object with user information

### Get All Posts (Feed)

- **GET** `/posts`
- **Access:** Private
- **Query Parameters:**
  - `page`: number (optional, default: 1) - Page number
  - `limit`: number (optional, default: 20) - Posts per page
- **Response:** Array of posts with like counts and user like status

### Get Post by ID

- **GET** `/posts/:id`
- **Access:** Private
- **Parameters:**
  - `id`: Post ID (number)
- **Response:** Single post with comments, likes, and user interactions

### Get Posts by User ID

- **GET** `/posts/user/:userId`
- **Access:** Private
- **Parameters:**
  - `userId`: User ID (number)
- **Query Parameters:**
  - `page`: number (optional, default: 1) - Page number
  - `limit`: number (optional, default: 20) - Posts per page
- **Response:** Array of posts by specific user with statistics

### Update Post

- **PUT** `/posts/:id`
- **Access:** Private (Post owner only)
- **Parameters:**
  - `id`: Post ID (number)
- **Body:**
  ```json
  {
    "content": "string"
  }
  ```
- **Response:** Updated post object

### Delete Post

- **DELETE** `/posts/:id`
- **Access:** Private (Post owner only)
- **Parameters:**
  - `id`: Post ID (number)
- **Response:** Success confirmation message

### Like/Unlike Post

- **POST** `/posts/:id/like`
- **Access:** Private
- **Parameters:**
  - `id`: Post ID (number)
- **Response:** Like status (liked/unliked) and updated count

---

## Comment Management Endpoints

### Create Comment

- **POST** `/comments`
- **Access:** Private
- **Body:**
  ```json
  {
    "postId": "number",
    "content": "string"
  }
  ```
- **Response:** Created comment object with user information

### Get Comment by ID

- **GET** `/comments/:id`
- **Access:** Private
- **Parameters:**
  - `id`: Comment ID (number)
- **Response:** Single comment with like status and user info

### Get Comments by Post

- **GET** `/comments/post/:postId`
- **Access:** Private
- **Parameters:**
  - `postId`: Post ID (number)
- **Query Parameters:**
  - `page`: number (optional, default: 1) - Page number
  - `limit`: number (optional, default: 50) - Comments per page
- **Response:** Array of comments for a specific post with user info and like counts

### Delete Comment

- **DELETE** `/comments/:id`
- **Access:** Private (Comment owner only)
- **Parameters:**
  - `id`: Comment ID (number)
- **Response:** Success confirmation message

### Like/Unlike Comment

- **POST** `/comments/:id/like`
- **Access:** Private
- **Parameters:**
  - `id`: Comment ID (number)
- **Response:** Like status (liked/unliked) and updated count

---

## Social Follow System Endpoints

### Follow/Unfollow User

- **POST** `/users/:id/follow`
- **Access:** Private
- **Parameters:**
  - `id`: Target User ID (number) - User to follow/unfollow
- **Response:** Follow status (following/not following) and updated follower counts
- **Note:** Automatically toggles between follow/unfollow based on current status

### Get User Followers

- **GET** `/users/:id/followers`
- **Access:** Private
- **Parameters:**
  - `id`: User ID (number)
- **Query Parameters:**
  - `page`: number (optional, default: 1) - Page number
  - `limit`: number (optional, default: 20) - Followers per page
- **Response:** Array of users following the specified user with follow status

### Get User Following

- **GET** `/users/:id/following`
- **Access:** Private
- **Parameters:**
  - `id`: User ID (number)
- **Query Parameters:**
  - `page`: number (optional, default: 1) - Page number
  - `limit`: number (optional, default: 20) - Following per page
- **Response:** Array of users that the specified user is following with mutual follow status

### Get Follow Status and Counts

- **GET** `/users/:id/follow-status`
- **Access:** Private
- **Parameters:**
  - `id`: Target User ID (number)
- **Response:** Current user's follow status for target user plus follower/following counts

---

## Complete API Endpoint Summary

### Authentication Routes (`/api/auth`)

- `POST /register` - Register new user with optional profile image
- `POST /login` - User authentication
- `GET /me` - Get current authenticated user profile
- `PUT /profile-image` - Update user profile image
- `GET /users` - Get all users (admin)

### User Management Routes (`/api/users`)

- `GET /profile` - Get current user profile with follow counts
- `GET /:id` - Get user profile by ID with follow status
- `PUT /profile` - Update user profile (name, bio, image)
- `GET /search` - Search users by username/name
- `GET /:id/posts` - Get posts by specific user

### Post Management Routes (`/api/posts`)

- `POST /` - Create new post with optional images (max 4)
- `GET /` - Get all posts (feed) with pagination
- `GET /:id` - Get single post with comments and likes
- `GET /user/:userId` - Get posts by user ID
- `PUT /:id` - Update post content (owner only)
- `DELETE /:id` - Delete post (owner only)
- `POST /:id/like` - Toggle like on post

### Comment Management Routes (`/api/comments`)

- `POST /` - Create comment on post
- `GET /:id` - Get comment by ID with like status
- `GET /post/:postId` - Get all comments for post
- `DELETE /:id` - Delete comment (owner only)
- `POST /:id/like` - Toggle like on comment

### Social Follow Routes (`/api/users`)

- `POST /:id/follow` - Follow/unfollow user
- `GET /:id/followers` - Get user's followers list
- `GET /:id/following` - Get users being followed
- `GET /:id/follow-status` - Get follow status and counts

### System Routes

- `GET /api/health` - Server health check

---

## Response Examples

### Post Object

```json
{
  "id": 1,
  "content": "Hello world!",
  "images": ["uploads/image1.jpg", "uploads/image2.jpg"],
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z",
  "userId": 1,
  "username": "johndoe",
  "fullName": "John Doe",
  "profilePicture": "uploads/profile.jpg",
  "likeCount": 5,
  "hasLiked": true
}
```

### User Object

```json
{
  "id": 1,
  "username": "johndoe",
  "email": "john@example.com",
  "fullName": "John Doe",
  "bio": "Software developer",
  "profilePicture": "uploads/profile.jpg",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "followerCount": 100,
  "followingCount": 50,
  "isFollowing": false
}
```

### Comment Object

```json
{
  "id": 1,
  "content": "Great post!",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "postId": 1,
  "userId": 2,
  "username": "janedoe",
  "fullName": "Jane Doe",
  "profilePicture": "uploads/jane.jpg",
  "likeCount": 2,
  "hasLiked": false
}
```

### Follow Response Object

```json
{
  "message": "User followed successfully",
  "isFollowing": true,
  "followCounts": {
    "followerCount": 101,
    "followingCount": 50
  }
}
```

### Authentication Response Object

```json
{
  "message": "User registered successfully",
  "user": {
    "id": 1,
    "username": "johndoe",
    "email": "john@example.com",
    "fullName": "John Doe",
    "profileImage": "uploads/profile.jpg",
    "createdAt": "2024-01-01T00:00:00.000Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Search Results Object

```json
{
  "message": "Search completed successfully",
  "users": [
    {
      "id": 2,
      "username": "janedoe",
      "fullName": "Jane Doe",
      "bio": "Designer and photographer",
      "profilePicture": "uploads/jane.jpg",
      "isFollowing": false,
      "followerCount": 89,
      "followingCount": 156
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "hasMore": true
  }
}
```

---

## File Upload Guidelines

### Profile Pictures

- **Max size:** 5MB
- **Formats:** JPG, PNG, GIF, WebP
- **Endpoint:** PUT `/users/profile`

### Post Images

- **Max files:** 4 per post
- **Max size per file:** 5MB
- **Formats:** JPG, PNG, GIF, WebP
- **Endpoint:** POST `/posts`

### Uploaded File URLs

Files are accessible at: `http://localhost:5000/uploads/filename`

---

## Pagination

Most list endpoints support pagination with these query parameters:

- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20, max: 100)

Response includes pagination info:

```json
{
  "pagination": {
    "page": 1,
    "limit": 20,
    "hasMore": true
  }
}
```

---

## Status Codes

- **200**: Success
- **201**: Created successfully
- **400**: Bad request / Validation error
- **401**: Unauthorized / Invalid token
- **404**: Resource not found
- **409**: Conflict (e.g., duplicate username)
- **500**: Internal server error

---

## Rate Limiting

Currently no rate limiting is implemented, but it's recommended to add rate limiting in production.

---

## CORS

CORS is enabled for all origins. In production, configure it to allow only your frontend domain.

---

## Environment Variables Required

```env
JWT_SECRET=your_jwt_secret_here
DATABASE_URL=your_postgres_connection_string
PORT=5000
NODE_ENV=development
```

---

## Testing the API

### Using cURL Examples

#### Register a new user:

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -F "name=John Doe" \
  -F "username=johndoe" \
  -F "email=john@example.com" \
  -F "password=password123" \
  -F "profileImage=@/path/to/image.jpg"
```

#### Login:

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "john@example.com", "password": "password123"}'
```

#### Create a post:

```bash
curl -X POST http://localhost:5000/api/posts \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "content=Hello, world!" \
  -F "images=@/path/to/image1.jpg" \
  -F "images=@/path/to/image2.jpg"
```

#### Get feed:

```bash
curl -X GET "http://localhost:5000/api/posts?page=1&limit=10" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### Follow a user:

```bash
curl -X POST http://localhost:5000/api/users/2/follow \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## Development Notes

### Database Schema

- Uses PostgreSQL with Drizzle ORM
- Automatic migrations with `drizzle-kit`
- Foreign key relationships ensure data integrity

### File Upload Handling

- Uses multer for multipart/form-data processing
- Files stored in `/uploads` directory
- Automatic file validation and error handling

### Security Features

- JWT token authentication
- Password hashing with bcrypt
- Input validation and sanitization
- CORS configuration for cross-origin requests

### Performance Considerations

- Pagination on all list endpoints
- Database indexes on frequently queried fields
- Efficient JOIN queries for user information
- Optimized image handling and storage
