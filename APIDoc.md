# Mindora API Documentation

## Base URL
```
http://localhost:3000/api/v1
```

## Authentication

Most endpoints require Bearer token authentication. Include the token in the Authorization header:

```javascript
headers: {
  'Authorization': 'Bearer YOUR_ACCESS_TOKEN'
}
```

## API Endpoints

### 🏥 Health Check

#### GET /healthcheck/
- **Method**: GET
- **Auth**: None
- **Description**: Check API status

---

### 👤 Users

#### POST /users/register
- **Method**: POST
- **Auth**: None
- **Content-Type**: multipart/form-data
- **Body**:
  ```
  username: string (required)
  fullName: string (required)
  email: string (required)
  password: string (required)
  avatar: file (optional)
  coverImage: file (optional)
  ```

#### POST /users/login
- **Method**: POST
- **Auth**: None
- **Content-Type**: application/json
- **Body**:
  ```json
  {
    "username": "string",
    "email": "string", 
    "password": "string"
  }
  ```

#### POST /users/refresh-token
- **Method**: POST
- **Auth**: Required (Bearer token)
- **Body**: Empty

#### POST /users/change-password
- **Method**: POST
- **Auth**: Required (Bearer token)
- **Content-Type**: application/json
- **Body**:
  ```json
  {
    "oldPassword": "string",
    "newPassword": "string"
  }
  ```

#### GET /users/current-user
- **Method**: GET
- **Auth**: Required (Bearer token)

#### PATCH /users/cover-image
- **Method**: PATCH
- **Auth**: Required (Bearer token)
- **Content-Type**: multipart/form-data
- **Body**:
  ```
  coverImage: file (required)
  ```

#### GET /users/history
- **Method**: GET
- **Auth**: Required (Bearer token)

#### GET /users/c/{username}
- **Method**: GET
- **Auth**: Required (Bearer token)
- **URL Params**: 
  - `username` (string): Channel username

---

### 🐦 Tweets

#### GET /tweets/user/{userId}
- **Method**: GET
- **Auth**: Required (Bearer token)
- **URL Params**:
  - `userId` (string): User ID

#### GET /tweets/
- **Method**: GET
- **Auth**: Required (Bearer token)

#### POST /tweets/
- **Method**: POST
- **Auth**: Required (Bearer token)
- **Content-Type**: application/json
- **Body**:
  ```json
  {
    "content": "string"
  }
  ```

#### PATCH /tweets/{tweetId}
- **Method**: PATCH
- **Auth**: Required (Bearer token)
- **URL Params**:
  - `tweetId` (string): Tweet ID
- **Content-Type**: application/json
- **Body**:
  ```json
  {
    "content": "string"
  }
  ```

#### DELETE /tweets/{tweetId}
- **Method**: DELETE
- **Auth**: Required (Bearer token)
- **URL Params**:
  - `tweetId` (string): Tweet ID

---

### 📺 Videos

#### GET /videos/
- **Method**: GET
- **Auth**: Required (Bearer token)
- **Query Parameters**:
  - `page` (number): Page number (default: 1)
  - `limit` (number): Items per page (default: 10)
  - `query` (string): Search query
  - `sortBy` (string): Sort field ("createdAt" | "title" | "views" | "duration")
  - `userId` (string): Filter by user ID
  - `sortType` (string): Sort direction ("asc" or "desc")

#### POST /videos/
- **Method**: POST
- **Auth**: Required (Bearer token)
- **Content-Type**: multipart/form-data
- **Body**:
  ```
  title: string (required)
  description: string (required)
  videoFile: file (required)
  thumbnail: file (required)
  ```

#### GET /videos/{videoId}
- **Method**: GET
- **Auth**: Required (Bearer token)
- **URL Params**:
  - `videoId` (string): Video ID

#### PATCH /videos/{videoId}
- **Method**: PATCH
- **Auth**: Required (Bearer token)
- **URL Params**:
  - `videoId` (string): Video ID
- **Content-Type**: multipart/form-data
- **Body**:
  ```
  title: string (optional)
  description: string (optional)
  thumbnail: file (optional)
  ```

#### DELETE /videos/{videoId}
- **Method**: DELETE
- **Auth**: Required (Bearer token)
- **URL Params**:
  - `videoId` (string): Video ID

#### PATCH /videos/toggle/publish/{videoId}
- **Method**: PATCH
- **Auth**: Required (Bearer token)
- **URL Params**:
  - `videoId` (string): Video ID

---

### 💬 Comments

#### POST /comments/{videoId}
- **Method**: POST
- **Auth**: Required (Bearer token)
- **URL Params**:
  - `videoId` (string): Video ID
- **Content-Type**: application/json
- **Body**:
  ```json
  {
    "content": "string",
    "userId": "string"
  }
  ```

#### GET /comments/{videoId}
- **Method**: GET
- **Auth**: Required (Bearer token)
- **URL Params**:
  - `videoId` (string): Video ID

#### GET /comments/u/{userId}
- **Method**: GET
- **Auth**: Required (Bearer token)
- **URL Params**:
  - `userId` (string): User ID

#### PATCH /comments/c/{commentId}
- **Method**: PATCH
- **Auth**: Required (Bearer token)
- **URL Params**:
  - `commentId` (string): Comment ID
- **Content-Type**: application/json
- **Body**:
  ```json
  {
    "newContent": "string"
  }
  ```

#### DELETE /comments/c/{commentId}
- **Method**: DELETE
- **Auth**: Required (Bearer token)
- **URL Params**:
  - `commentId` (string): Comment ID

---

### 👍 Likes

#### POST /like/toggle/v/{videoId}
- **Method**: POST
- **Auth**: Required (Bearer token)
- **URL Params**:
  - `videoId` (string): Video ID

#### POST /like/toggle/c/{commentId}
- **Method**: POST
- **Auth**: Required (Bearer token)
- **URL Params**:
  - `commentId` (string): Comment ID

#### POST /like/toggle/t/{tweetId}
- **Method**: POST
- **Auth**: Required (Bearer token)
- **URL Params**:
  - `tweetId` (string): Tweet ID

#### GET /like/videos
- **Method**: GET
- **Auth**: Required (Bearer token)

---

### 📋 Playlists

#### POST /playlist/
- **Method**: POST
- **Auth**: Required (Bearer token)
- **Content-Type**: application/json
- **Body**:
  ```json
  {
    "name": "string",
    "description": "string"
  }
  ```

#### GET /playlist/{playlistId}
- **Method**: GET
- **Auth**: Required (Bearer token)
- **URL Params**:
  - `playlistId` (string): Playlist ID

#### PATCH /playlist/{playlistId}
- **Method**: PATCH
- **Auth**: Required (Bearer token)
- **URL Params**:
  - `playlistId` (string): Playlist ID
- **Content-Type**: application/json
- **Body**:
  ```json
  {
    "name": "string",
    "description": "string"
  }
  ```

#### DELETE /playlist/{playlistId}
- **Method**: DELETE
- **Auth**: Required (Bearer token)
- **URL Params**:
  - `playlistId` (string): Playlist ID

#### PATCH /playlist/add/{videoId}/{playlistId}
- **Method**: PATCH
- **Auth**: Required (Bearer token)
- **URL Params**:
  - `videoId` (string): Video ID
  - `playlistId` (string): Playlist ID

#### PATCH /playlist/remove/{videoId}/{playlistId}
- **Method**: PATCH
- **Auth**: Required (Bearer token)
- **URL Params**:
  - `videoId` (string): Video ID
  - `playlistId` (string): Playlist ID

#### GET /playlist/user/{userId}
- **Method**: GET
- **Auth**: Required (Bearer token)
- **URL Params**:
  - `userId` (string): User ID

---

### 📊 Subscriptions

#### POST /subscriptions/c/{channelId}
- **Method**: POST
- **Auth**: Required (Bearer token)
- **URL Params**:
  - `channelId` (string): Channel ID

#### GET /subscriptions/c/{channelId}
- **Method**: GET
- **Auth**: Required (Bearer token)
- **URL Params**:
  - `channelId` (string): Channel ID

#### GET /subscriptions/u/{userId}
- **Method**: GET
- **Auth**: Required (Bearer token)
- **URL Params**:
  - `userId` (string): User ID

---

### 📈 Dashboard

#### GET /dashboard/videos
- **Method**: GET
- **Auth**: Required (Bearer token)

#### GET /dashboard/stats
- **Method**: GET
- **Auth**: Required (Bearer token)

---

## Implementation Examples

### Login and Token Management

```javascript
// Login
const loginResponse = await fetch('http://localhost:3000/api/v1/users/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    username: 'your_username',
    email: 'your_email@example.com',
    password: 'your_password'
  })
});

const { accessToken } = await loginResponse.json();

// Use token for authenticated requests
const userResponse = await fetch('http://localhost:3000/api/v1/users/current-user', {
  headers: {
    'Authorization': `Bearer ${accessToken}`
  }
});
```

### File Upload Example

```javascript
// Upload video with thumbnail
const formData = new FormData();
formData.append('title', 'My Video Title');
formData.append('description', 'Video description');
formData.append('videoFile', videoFile); // File object
formData.append('thumbnail', thumbnailFile); // File object

const response = await fetch('http://localhost:3000/api/v1/videos/', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${accessToken}`
  },
  body: formData
});
```

### Query Parameters Example

```javascript
// Get videos with pagination and search
const params = new URLSearchParams({
  page: '1',
  limit: '10',
  query: 'search term',
  sortBy: 'createdAt',
  sortType: 'desc'
});

const response = await fetch(`http://localhost:3000/api/v1/videos/?${params}`, {
  headers: {
    'Authorization': `Bearer ${accessToken}`
  }
});
```

## Notes

- All file uploads use `multipart/form-data` encoding
- Authentication tokens should be stored securely and refreshed when needed
- Most endpoints require authentication except registration, login, and health check
- File uploads support common image formats for thumbnails/avatars and video formats for video files
- Always check response status codes and handle errors appropriately
