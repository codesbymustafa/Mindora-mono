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

#### healthcheck
#### GET /healthcheck/

- **Method**: GET
- **Auth**: None
- **Description**: Check API status

- **Response**:
  ```json
    {
      "statusCode": Number,
      "data": String ("OK"),
      "message": String,
      "success": Boolean
    }
  ```

---

### 👤 Users

registerUser
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
  avatar: file (required)
  coverImage: file (optional)
  ```

- **Response**:
  ```json
  {
    "statusCode": Number,
    "message": String,
    "data": {
        "_id": User ID,
        "username": String,
        "email": String,
        "fullName": String,
        "avatar": link to image src,
        "coverImage": link to image src,
        "watchHistory": [
          (Video ID)
        ],
        "prefferedTheme": String,
        "createdAt": Date,
        "updatedAt": Date,
        "__v": Number
    },
    "success": Boolean
  }
  ```
  (when no cover image was passed else there would have been a path for cover image also)

loginUser
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

- **Response**:
  ```json
  {
    "statusCode": Number,
    "data": {
        "user": {
            "_id": User ID,
            "username": String,
            "email": Email,
            "fullName": String,
            "avatar": link to image src,
            "coverImage": link to image src,
            "watchHistory": [
              (Video ID)
            ],
            "prefferedTheme": "light" | "dark" ,
            "createdAt": Date,
            "updatedAt": Date,
            "__v": Number
        },
        "accessToken": "JWT",
        "refreshToken": "JWT"
    },
    "message": String,
    "success": Boolean
}
  ```

logoutUser
#### POST /users/logout

- **Method**: POST
- **Auth**: Required (Bearer token)

- **Response**:
  ```json
  {
    "statusCode": Number,
    "data": {},
    "message": String,
    "success": Boolean
    }
  ```

refreshAccessToken
#### POST /users/refresh-token

- **Method**: POST
- **Auth**: Required (Bearer token)
- **Body**: Empty

- **Response**:
  ```json
  {
    "statusCode": Number,
    "data": {
        "accessToken": "JWT",
        "user": {
            "_id": User ID,
            "username": String,
            "email": Email,
            "fullName": String,
            "avatar": link to image src,
            "coverImage": link to image src,
            "watchHistory": [
              (Video ID)
            ],
            "prefferedTheme": "light" | "dark" ,
            "createdAt": Date,
            "updatedAt": Date,
            "refreshToken": "JWT"
        }
    },
    "message": "Token refreshed successfully",
    "success": true
}
  ```

changeCurrentPassword
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

- **Response**:
  ```json
  {
    "statusCode": Number,
    "data": {},
    "message": String,
    "success": Boolean
}
  ```

getCurrentUser
#### GET /users/current-user

- **Method**: GET
- **Auth**: Required (Bearer token)

- **Response**:
  ```json
  {
    "statusCode": Number,
    "data": {
        "_id": User ID,
        "username": String,
        "email": Email,
        "fullName": String,
        "avatar": link to image src,
        "coverImage": link to image src,
        "watchHistory": [],
        "prefferedTheme": "light" | "dark",
        "createdAt": Date,
        "updatedAt": Date,
        "__v": Number
    },
    "message": String,
    "success": Boolean
}
  ```

updateAccountDetails
#### PATCH /users/update-account

- **Method**: PATCH
- **Auth**: Required (Bearer token)
- **Content-Type**: application/json
- **Body**:
  ```json
  {
    "fullName": "string" (required),
    "email": "string" (required)
  }
  ```

- **Response**:
  ```json
  {
    "statusCode": Number,
    "data": {
        "_id": User ID,
        "username": String,
        "email": Email,
        "fullName": String,
        "avatar": link to image src,
        "coverImage": link to image src,
        "watchHistory": [
          Video ID
        ],
        "prefferedTheme": "light" | "dark",
        "createdAt": Date,
        "updatedAt": Date,
        "__v": Number
    },
    "message": String,
    "success": Boolean
}
  ```

updateUserCoverImage
#### PATCH /users/cover-image

- **Method**: PATCH
- **Auth**: Required (Bearer token)
- **Content-Type**: multipart/form-data
- **Body**:
  ```
  coverImage: file (required)
  ```

- **Response**:
  ```json
  {
    "statusCode": Number,
    "data": {
        "_id": User ID,
        "username": String,
        "email": Email,
        "fullName": String,
        "avatar": link to image src,
        "coverImage": link to image src,
        "watchHistory": [
          Video ID
        ],
        "prefferedTheme": "light" | "dark",
        "createdAt": Date,
        "updatedAt": Date,
        "__v": Number
    },
    "message": String,
    "success": Boolean
}
  ```

updateUserAvatar
#### PATCH /users/avatar

- **Method**: PATCH
- **Auth**: Required (Bearer token)
- **Content-Type**: multipart/form-data
- **Body**:
  ```
  avatar: file (required)
  ```

- **Response**:
  ```json
  {
    "statusCode": Number,
    "data": {
        "_id": User ID,
        "username": String,
        "email": Email,
        "fullName": String,
        "avatar": link to image src,
        "coverImage": link to image src,
        "watchHistory": [
          Video ID
        ],
        "prefferedTheme": "light" | "dark",
        "createdAt": Date,
        "updatedAt": Date,
        "__v": Number
    },
    "message": String,
    "success": Boolean
}
  ```

getWatchHistory
#### GET /users/history

- **Method**: GET
- **Auth**: Required (Bearer token)

- **Response**:
  ```json
  {
    "statusCode": Number,
    "data": [
        {
            "_id": Video ID,
            "videoFile": link to video src,
            "thumbnail": link to image src,
            "title": String,
            "description": String,
            "views": Number,
            "duration": Number,
            "isPublished": Boolean,
            "owner": {
                "_id": User ID,
                "username": String,
                "fullName": String,
                "avatar": link to image src
            },
            "createdAt": Date,
            "updatedAt": Date,
            "__v": Number
        }
    ],
    "message": String,
    "success": Boolean
}
  ```

addToWatchHistory
#### PATCH /users/history/add/{videoId}

- **Method**: PATCH
- **Auth**: Required (Bearer token)
- **URL Params**:
  - `videoId` (string): Video ID

- **Response**:
  ```json
  {
    "statusCode": Number,
    "data": {},
    "message": String,
    "success": Boolean
}
  ```

getUserChannelProfile
#### GET /users/c/{username}

- **Method**: GET
- **Auth**: Required (Bearer token)
- **URL Params**:
  - `username` (string): User username

- **Response**:
  ```json
  {
    "statusCode": Number,
    "data": {
        "_id": User ID,
        "username": String,
        "email": Email,
        "fullName": String,
        "avatar": link to image src,
        "coverImage": link to image src,
        "subscribersCount": 0,
        "channelsSubscribedToCount": 1,
        "isSubscribed": false
    },
    "message": String,
    "success": Boolean
}
  ```

getUserById
#### GET /users/u/{userId}

- **Method**: GET
- **Auth**: Required (Bearer token)
- **URL Params**:
  - `userId` (string): User ID

- **Response**:
  ```json
  {
    "statusCode": Number,
    "data": {
        "_id": User ID,
        "username": String,
        "fullName": String,
        "avatar": link to image src,
        "coverImage": link to image src
    },
    "message": String,
    "success": Boolean
}
  ```

getTheme
#### GET /users/theme

- **Method**: GET
- **Auth**: Required (Bearer token)

- **Response**:
  ```json
  {
    "statusCode": Number,
    "data": {
        "prefferedTheme": "light" | "dark"
    },
    "message": String,
    "success": Boolean
}
  ```

toggleTheme
#### PATCH /users/theme

- **Method**: PATCH
- **Auth**: Required (Bearer token)

- **Response**:
  ```json
  {
    "statusCode": Number,
    "data": {
        "prefferedTheme": "dark" | "light"
    },
    "message": String,
    "success": Boolean
}
  ```


---

### 🐦 Tweets

getUserTweets
#### GET /tweets/user/{userId}

- **Method**: GET
- **Auth**: Required (Bearer token)
- **URL Params**:
  - `userId` (string): User ID

- **Response**:
  ```json
  {
    "statusCode": Number,
    "data": [
        {
            "_id": Tweet ID,
            "content": String,
            "owner": User ID,
            "createdAt": Date,
            "updatedAt": Date,
            "__v": Number
        }
    ],
    "message": String,
    "success": Boolean
}
  ```

getAllTweets
#### GET /tweets/

- **Method**: GET
- **Auth**: Required (Bearer token)

- **Response**:
  ```json
  {
    "statusCode": Number,
    "data": [
        {
            "_id": Tweet ID,
            "content": String,
            "owner": User ID,
            "createdAt": Date,
            "updatedAt": Date,
            "__v": Number
        }        
    ],
    "message": String,
    "success": Boolean
}
  ```

getTweetById
#### GET /tweets/

- **Method**: GET
- **Auth**: Required (Bearer token)
- **URL Params**:
  - `tweetId` (string): Tweet ID

- **Response**:
  ```json
  {
    "statusCode": Number,
    "data": [
        {
            "_id": Tweet ID,
            "content": String,
            "owner": {
                "_id": "string",
                "username": "string",
                "fullName": "string",
                "avatar": "string (URL)"
            },
            likes : Number,
            isLikedByUser : Boolean,
            "createdAt": Date,
            "updatedAt": Date,
            "__v": Number
        }        
    ],
    "message": String,
    "success": Boolean
}
  ```

createTweet
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

- **Response**:
  ```json
  {
    "statusCode": Number,
    "data": {
        "content": String,
        "owner": User ID,
        "_id": Tweet ID,
        "createdAt": Date,
        "updatedAt": Date,
        "__v": Number
    },
    "message": String,
    "success": Boolean
}
  ```

updateTweet
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

- **Response**:
  ```json
  {
    "statusCode": Number,
    "data": {
        "_id": Tweet ID,
        "content": String,
        "owner": User ID,
        "createdAt": Date,
        "updatedAt": Date,
        "__v": Number
    },
    "message": String,
    "success": Boolean
}
  ```

deleteTweet
#### DELETE /tweets/{tweetId}

- **Method**: DELETE
- **Auth**: Required (Bearer token)
- **URL Params**:
  - `tweetId` (string): Tweet ID

- **Response**:
  ```json
  {
    "statusCode": Number,
    "data": null,
    "message": String,
    "success": Boolean
}
  ```

---

### 📺 Videos

getAllVideos
#### GET /videos/

- **Method**: GET
- **Auth**: Required (Bearer token)
- **Query Parameters**:
  - `page` (number): Page number (default: 1)
  - `limit` (number): Items per page (default: 10)
  - `query` (string): Search query (leave empty if not)
  - `userId` (string): Filter by user ID (leave empty if not)
  - `sortBy` (string): Sort field ("createdAt" | "title" | "views" | "duration") (default : createdAt)
  - `sortType` (string): Sort direction ("asc" or "desc") 

- **Response**:
  ```json
  {
    "statusCode": Number,
    "data": {
        "success": Boolean,
        "message": String,
        "data": [
            {
                "_id": String(Video ID),
                "videoFile": String (URL),
                "thumbnail": String (URL),
                "title": String,
                "description": String,
                "views": Number | Array<String> (User IDs) (when the UserId query param is same as the logged in user),
                "duration": Number,
                "isPublished": Boolean,
                "owner": {
                  _id: String (User ID),
                  fullName: String,
                  username: String,
                  avatar: String (URL),
                },
                "createdAt": Date,
                "updatedAt": Date,
                "__v": Number
            }
        ],
        "pagination": {
            "totalDocs": Number,
            "limit": Number,
            "page": Number,
            "totalPages": Number,
            "hasNextPage": Boolean,
            "hasPrevPage": Boolean
        }
    },
    "message": String,
    "success": Boolean
}
  ```

publishAVideo
#### POST /videos/

- **Method**: POST
- **Auth**: Required (Bearer token)
- **Content-Type**: multipart/form-data
- **Body**:
  ```
  title: string (required)
  description: string (required)
  videoFile: file (required)
  thumbnail: file (if not then thumbnail will be generated from video)
  ```

- **Response**:
  ```json
  {
    "statusCode": Number,
    "message": String,
    "data": {
        "_id": String (Video Id),
        "videoFile": String (URL),
        "thumbnail": String (URL),
        "title": String,
        "description": String,
        "views": Array<String> (User IDs),
        "duration": Number,
        "isPublished": Boolean,
        "owner": String (User ID),
        "createdAt": Date,
        "updatedAt": Date,
        "__v": Number
    },
    "success": Boolean
}
  ```


getVideoById
#### GET /videos/{videoId}

- **Method**: GET
- **Auth**: Required (Bearer token)
- **URL Params**:
  - `videoId` (string): Video ID

- **Response**:
  ```json
  {
    "statusCode": Number,
    "message": String,
    "data": {
        "_id": String,
        "videoFile": String (URL),
        "thumbnail": String (URL),
        "title": String,
        "description": String,
        "views": Number,
        "duration": Number,
        "isPublished": Boolean,
        "owner": {
          _id: String (User ID),
          fullName: String,
          username: String,
          avatar: String (URL),
        },
        "isUserSubscribed": Boolean,
        "likes": Number,
        "isLikedByUser": Boolean,
        "createdAt": Date,
        "updatedAt": Date,
        "__v": Number
    },
    "success": Boolean
}
  ```
updateVideo
#### PATCH /videos/{videoId}

- **Method**: PATCH
- **Auth**: Required (Bearer token)
- **URL Params**:
  - `videoId` (string): Video ID
- **Content-Type**: multipart/form-data
- **Body**:
  ```
  title: string (required)
  description: string (required)
  thumbnail: file (optional)
  ```

- **Response**:
  ```json
  {
    "statusCode": Number,
    "message": String,
    "data": {
        "_id": String,
        "videoFile": String (URL),
        "thumbnail": String (URL),
        "title": String,
        "description": String,
        "views": Array<String> (User IDs),
        "duration": Number,
        "isPublished": Boolean,
        "owner": String (User ID),
        "createdAt": Date,
        "updatedAt": Date,
        "__v": Number
    },
    "success": Boolean
}
  ```
deleteVideo
#### DELETE /videos/{videoId}

- **Method**: DELETE
- **Auth**: Required (Bearer token)
- **URL Params**:
  - `videoId` (string): Video ID

- **Response**:
  ```json
  {
    "statusCode": Number,
    "message": String,
    "data": null,
    "success": Boolean
}
  ```
togglePublishStatus
#### PATCH /videos/toggle/publish/{videoId}

- **Method**: PATCH
- **Auth**: Required (Bearer token)
- **URL Params**:
  - `videoId` (string): Video ID

- **Response**:
  ```json
  {
    "statusCode": Number,
    "message": String,
    "data": {
        "_id": String,
        "videoFile": String (URL),
        "thumbnail": String (URL),
        "title": String,
        "description": String,
        "views": Array<String> (User IDs),
        "duration": Number,
        "isPublished": Boolean,
        "owner": String (User ID),
        "createdAt": Date,
        "updatedAt": Date,
        "__v": Number
    },
    "success": Boolean
}
  ```
increaseViewCount
#### PATCH /videos/views/{videoId}

- **Method**: PATCH
- **Auth**: Required (Bearer token)
- **URL Params**:
  - `videoId` (string): Video ID

- **Response**:
  ```json
  {
    "statusCode": Number,
    "data": {
        "views": Number
    },
    "message": String,
    "success": Boolean
}
  ```
getViewCount
#### GET /videos/views/{videoId}

- **Method**: GET
- **Auth**: Required (Bearer token)
- **URL Params**:
  - `videoId` (string): Video ID

- **Response**:
  ```json
  {
    "statusCode": Number,
    "data": {
        "views": Number
    },
    "message": String,
    "success": Boolean
}
  ```

---

### 💬 Comments

addComment
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

- **Response**:
  ```json
  {
    "statusCode": Number,
    "message": String,
    "data": {
        "content": String,
        "video": String (Video ID),
        "owner": String (User ID),
        "_id": String,
        "createdAt": Date,
        "updatedAt": Date,
        "__v": Number
    },
    "success": Boolean
}
  ```
getVideoComments
#### GET /comments/{videoId}

- **Method**: GET
- **Auth**: Required (Bearer token)
- **URL Params**:
  - `videoId` (string): Video ID

- **Response**:
  ```json
  {
    "statusCode": Number,
    "message": String,
    "data": {
        "page": Number,
        "limit": Number,
        "total": Number,
        "totalPages": Number,
        "result": [
          {
            "_id": "string",
            "content": "string",
            "video": "string",
            "owner": {
              "_id": "string",
              "username": "string",
              "fullName": "string",
              "avatar": "string (URL)"
            },
            "likesCount": 0,
            "isLikedByUser": false,
            "createdAt": "Date",
            "updatedAt": "Date"
          }
        ]
    },
    "success": Boolean
}
  ```
usersComments
#### GET /comments/u/comments

- **Method**: GET
- **Auth**: Required (Bearer token)

- **Response**:
  ```json
  {
    "statusCode": Number,
    "data": [
        {
            "_id": String,
            "content": String,
            "video": String (Video ID),
            "owner": String (User ID),
            "createdAt": Date,
            "updatedAt": Date,
            "__v": Number
        }
    ],
    "message": String,
    "success": Boolean
}
  ```
updateComment
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

- **Response**:
  ```json
  {
    "statusCode": Number,
    "message": String,
    "data": {
        "_id": String,
        "content": String,
        "video": String (Video ID),
        "owner": String (User ID),
        "createdAt": Date,
        "updatedAt": Date,
        "__v": Number
    },
    "success": Boolean
}
  ```
deleteComment
#### DELETE /comments/c/{commentId}

- **Method**: DELETE
- **Auth**: Required (Bearer token)
- **URL Params**:
  - `commentId` (string): Comment ID

- **Response**:
  ```json
  {
    "statusCode": Number,
    "message": String,
    "data": null,
    "success": Boolean
}
  ```

---

### 👍 Likes
toggleVideoLike
#### POST /like/v/{videoId}

- **Method**: POST
- **Auth**: Required (Bearer token)
- **URL Params**:
  - `videoId` (string): Video ID

- **Response** (like):
  ```json
  {
    "statusCode": Number,
    "message": String,
    "data": {
        "totalLikes": Number,
        "isLikedbyUser": Boolean
    },
    "success": Boolean
}
  ```
- **Response** (unlike):
  ```json
  {
    "statusCode": Number,
    "message": String,
    "data": {
        "totalLikes": Number,
        "isLikedbyUser": Boolean
    },
    "success": Boolean
}
  ```
getVideoLikes
#### GET /like/v/{videoId}

- **Method**: GET
- **Auth**: Required (Bearer token)
- **URL Params**:
  - `videoId` (string): Video ID

- **Response**:
  ```json
  {
    "statusCode": Number,
    "message": String,
    "data": {
        "totalLikes": Number,
        "isLikedbyUser": Boolean
    },
    "success": Boolean
}
  ```
toggleCommentLike
#### POST /like/c/{commentId}

- **Method**: POST
- **Auth**: Required (Bearer token)
- **URL Params**:
  - `commentId` (string): Comment ID

- **Response** (like):
  ```json
  {
    "statusCode": Number,
    "message": String,
    "data": {
        "totalLikes": Number,
        "isLikedbyUser": Boolean
    },
    "success": Boolean
}
  ```
- **Response** (unlike):
  ```json
  {
    "statusCode": Number,
    "message": String,
    "data": {
        "totalLikes": Number,
        "isLikedbyUser": Boolean
    },
    "success": Boolean
}
  ```
getCommentLikes
#### GET /like/c/{commentId}

- **Method**: GET
- **Auth**: Required (Bearer token)
- **URL Params**:
  - `commentId` (string): Comment ID

- **Response**:
  ```json
  {
    "statusCode": Number,
    "message": String,
    "data": {
        "totalLikes": Number,
        "isLikedbyUser": Boolean
    },
    "success": Boolean
}
  ```
toggleTweetLike
#### POST /like/t/{tweetId}

- **Method**: POST
- **Auth**: Required (Bearer token)
- **URL Params**:
  - `tweetId` (string): Tweet ID

- **Response** (like):
  ```json
  {
    "statusCode": Number,
    "message": String,
    "data": {
        "totalLikes": Number,
        "isLikedbyUser": Boolean
    },
    "success": Boolean
}
  ```
- **Response** (unlike):
  ```json
  {
    "statusCode": Number,
    "message": String,
    "data": {
        "totalLikes": Number,
        "isLikedbyUser": Boolean
    },
    "success": Boolean
}
  ```
getTweetLikes
#### GET /like/t/{tweetId}

- **Method**: GET
- **Auth**: Required (Bearer token)
- **URL Params**:
  - `tweetId` (string): Tweet ID

- **Response**:
  ```json
  {
    "statusCode": Number,
    "message": String,
    "data": {
        "totalLikes": Number,
        "isLikedbyUser": Boolean
    },
    "success": Boolean
}
  ```
getLikedVideos
#### GET /like/videos

- **Method**: GET
- **Auth**: Required (Bearer token)

- **Response**:
  ```json
  {
    "statusCode": Number,
    "message": String,
    "data": {
        "likedVideos": [
            {
                "_id": String,
                "videoFile": String (URL),
                "thumbnail": String (URL),
                "title": String,
                "description": String,
                "views": Number,
                "duration": Number,
                "isPublished": Boolean,
                "owner": String (User ID),
                "createdAt": Date,
                "updatedAt": Date,
                "__v": Number
            }
        ]
    },
    "success": Boolean
}
  ```

---

### 📋 Playlists
createPlaylist
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

- **Response**:
  ```json
  {
    "statusCode": Number,
    "message": String,
    "data": {
        "name": String,
        "description": String,
        "videos": Array<String> (Video IDs),
        "owner": String (User ID),
        "_id": String,
        "createdAt": Date,
        "updatedAt": Date,
        "__v": Number
    },
    "success": Boolean
}
  ```
getPlaylistById
#### GET /playlist/{playlistId}

- **Method**: GET
- **Auth**: Required (Bearer token)
- **URL Params**:
  - `playlistId` (string): Playlist ID

- **Response**:
  ```json
  {
    "statusCode": Number,
    "data": {
        "playlistData": {
            "_id": String,
            "name": String,
            "description": String,
            "videos": Array<String> (Video IDs),
            "owner": String (User ID),
            "createdAt": Date,
            "updatedAt": Date,
            "__v": Number
        },
        "videos": [
            {
                "_id": String,
                "thumbnail": String (URL),
                "title": String,
                "duration": Number,
                "owner": String (User ID),
                "createdAt": Date
            }
        ]
    },
    "message": String,
    "success": Boolean
}
  ```
updatePlaylist
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

- **Response**:
  ```json
  {
    "statusCode": Number,
    "message": String,
    "data": {
        "_id": String,
        "name": String,
        "description": String,
        "videos": Array<String> (Video IDs),
        "owner": String (User ID),
        "createdAt": Date,
        "updatedAt": Date,
        "__v": Number
    },
    "success": Boolean
}
  ```
deletePlaylist
#### DELETE /playlist/{playlistId}

- **Method**: DELETE
- **Auth**: Required (Bearer token)
- **URL Params**:
  - `playlistId` (string): Playlist ID

- **Response**:
  ```json
  {
    "statusCode": Number,
    "data": String,
    "message": String,
    "success": Boolean
}
  ```
addVideoToPlaylist
#### PATCH /playlist/add/{videoId}/{playlistId}

- **Method**: PATCH
- **Auth**: Required (Bearer token)
- **URL Params**:
  - `videoId` (string): Video ID
  - `playlistId` (string): Playlist ID

- **Response**:
  ```json
  {
    "statusCode": Number,
    "message": String,
    "data": {
        "_id": String,
        "name": String,
        "description": String,
        "videos": Array<String> (Video IDs),
        "owner": String (User ID),
        "createdAt": Date,
        "updatedAt": Date,
        "__v": Number
    },
    "success": Boolean
}
  ```
removeVideoFromPlaylist
#### PATCH /playlist/remove/{videoId}/{playlistId}

- **Method**: PATCH
- **Auth**: Required (Bearer token)
- **URL Params**:
  - `videoId` (string): Video ID
  - `playlistId` (string): Playlist ID

- **Response**:
  ```json
  {
    "statusCode": Number,
    "message": String,
    "data": {
        "_id": String,
        "name": String,
        "description": String,
        "videos": Array<String> (Video IDs),
        "owner": String (User ID),
        "createdAt": Date,
        "updatedAt": Date,
        "__v": Number
    },
    "success": Boolean
}
  ```
getUserPlaylists
#### GET /playlist/user/{userId}

- **Method**: GET
- **Auth**: Required (Bearer token)
- **URL Params**:
  - `userId` (string): User ID

- **Response**:
  ```json
  {
    "statusCode": Number,
    "message": String,
    "data": [
        {
            "_id": String,
            "name": String,
            "description": String,
            "videos": Array<String> (Video IDs),
            "owner": String (User ID),
            "createdAt": Date,
            "updatedAt": Date,
            "__v": Number
        }
    ],
    "success": Boolean
}
  ```

---

### 📊 Subscriptions
toggleSubscription
#### POST /subscriptions/c/{channelId}

- **Method**: POST
- **Auth**: Required (Bearer token)
- **URL Params**:
  - `channelId` (string): Channel ID

- **Response** (subscribe):
  ```json
  {
    "statusCode": Number,
    "data": {
        "subscriber": String (User ID),
        "channel": String (User ID),
        "_id": String,
        "createdAt": Date,
        "updatedAt": Date,
        "__v": Number
    },
    "message": String,
    "success": Boolean
}
  ```
- **Response** (unsubscribe):
  ```json
  {
    "statusCode": Number,
    "data": {
        "subscriberId": String (User ID),
        "channelId": String (User ID)
    },
    "message": String,
    "success": Boolean
}
  ```
getChannelSubscribers
#### GET /subscriptions/c

- **Method**: GET
- **Auth**: Required (Bearer token)

- **Response**:
  ```json
  {
    "statusCode": Number,
    "message": String,
    "data": {
        "totalSubscribers": Number,
        "subscribers": [
            {
                "name": String,
                "email": String,
                "avatar": String (URL),
                "subscribedAt": Date
            }
        ]
    },
    "success": Boolean
}
  ```
getSubscribedChannels
#### GET /subscriptions/u

- **Method**: GET
- **Auth**: Required (Bearer token)

- **Response**:
  ```json
  {
    "statusCode": Number,
    "message": String,
    "data": {
        "totalSubscriptions": Number,
        "subscriptions": [
            {
                "name": String,
                "avatar": String (URL),
                "subscribedAt": Date
            }
        ]
    },
    "success": Boolean
}
  ```

---

### 📈 Dashboard
getChannelVideos
#### GET /dashboard/videos

- **Method**: GET
- **Auth**: Required (Bearer token)

- **Response**:
  ```json
  {
    "statusCode": Number,
    "message": String,
    "data": [
        {
            "_id": String,
            "videoFile": String (URL),
            "thumbnail": String (URL),
            "title": String,
            "description": String,
            "views": Array<String> (User IDs),
            "duration": Number,
            "isPublished": Boolean,
            "owner": String (User ID),
            "createdAt": Date,
            "updatedAt": Date,
            "__v": Number
        }
    ],
    "success": Boolean
}
  ```
getChannelStats
#### GET /dashboard/stats

- **Method**: GET
- **Auth**: Required (Bearer token)

- **Response**:
  ```json
  {
    "statusCode": Number, 
    "message": String,
    "data": {
        "subscribersCount": Number,
        "totalVideosCount": Number,
        "totalViewsGotCount": Number,
        "totalLikesGotCount": Number,
        "totalCommentsGotCount": Number
    },
    "success": Boolean
}
  ```

---

### 🔔 Notifications

getNotifications
#### GET /notifications/

- Method: GET
- Auth: Required (Bearer token)
- Query Parameters:
  - `page` (number): Page number (default: 1)
  - `limit` (number): Items per page (default: 20, max: 50)
  - `unreadOnly` (string): "true" to return only unread

- Response:
  ```json
  {
  "statusCode": Number,
  "data": {
    "notifications": [
      {
        "_id": String,
        "recipient": String (User ID),
        "sender": {
          "_id": String (User ID),
          "username": String,
          "fullName": String,
          "avatar": String (URL)
        },
        "type": String,
        "message": String,
        "relatedVideo": String (Video ID) | null,
        "relatedComment": String (Comment ID) | null,
        "relatedTweet": String (Tweet ID) | null,
        "isRead": Boolean,
        "createdAt": Date,
        "updatedAt": Date,
        "__v": Number
      }
    ],
    "unreadCount": Number,
    "pagination": {
      "page": Number,
      "limit": Number,
      "totalDocs": Number,
      "totalPages": Number
    }
  },
  "message": String,
  "success": Boolean
  }
  ```

getUnreadCount
#### GET /notifications/unread-count

- Method: GET
- Auth: Required (Bearer token)

- Response:
  ```json
  {
    "statusCode": Number,
    "data": {
        "unreadCount": Number
    },
    "message": String,
    "success": Boolean
  }
  ```

markAsRead
#### PATCH /notifications/read

- Method: PATCH
- Auth: Required (Bearer token)
- Content-Type: application/json
- Body:
  ```json
  {
    "notificationIds": [
      "6929ef3626e038a2dec3134b"
    ]
  }
  ```

- Response:
  ```json
  {
    "statusCode": Number,
    "data": {
        "modifiedCount": Number
    },
    "message": String,
    "success": Boolean
  }
  ```

deleteNotification
#### DELETE /notifications/delete/{notificationId}

- Method: DELETE
- Auth: Required (Bearer token)
- URL Params:
  - `notificationId` (string): Notification ID

- Response:
  ```json
  {
    "statusCode": Number,
    "data": null,
    "message": String,
    "success": Boolean
  }
  ```

## Implementation Examples

### Login and Token Management

```javascript
// Login
const loginResponse = await fetch("http://localhost:3000/api/v1/users/login", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    username: "your_username",
    email: "your_email@example.com",
    password: "your_password",
  }),
});

const { accessToken } = await loginResponse.json();

// Use token for authenticated requests
const userResponse = await fetch(
  "http://localhost:3000/api/v1/users/current-user",
  {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  }
);
```

### File Upload Example

```javascript
// Upload video with thumbnail
const formData = new FormData();
formData.append("title", "My Video Title");
formData.append("description", "Video description");
formData.append("videoFile", videoFile); // File object
formData.append("thumbnail", thumbnailFile); // File object

const response = await fetch("http://localhost:3000/api/v1/videos/", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${accessToken}`,
  },
  body: formData,
});
```

### Query Parameters Example

```javascript
// Get videos with pagination and search
const params = new URLSearchParams({
  page: "1",
  limit: "10",
  query: "search term",
  userId: "",
  sortBy: "createdAt",
  sortType: "desc",
});

const response = await fetch(`http://localhost:3000/api/v1/videos/?${params}`, {
  headers: {
    Authorization: `Bearer ${accessToken}`,
  },
});
```

## Notes

- All file uploads use `multipart/form-data` encoding
- Authentication tokens should be stored securely and refreshed when needed
- Most endpoints require authentication except registration, login, and health check
- File uploads support common image formats for thumbnails/avatars and video formats for video files
- Always check response status codes and handle errors appropriately
