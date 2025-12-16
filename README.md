<div align="center">
  <h1>Mindora</h1>
  <p><strong>Where students learn and teachers teach</strong></p>
  <p>A peer-to-peer learning platform connecting educators and learners through video content and interactive features</p>
  
  <p><a href="https://mindora-amber.vercel.app">🌐 Live Demo</a></p>
</div>

---

## About Mindora

**Mindora** is a modern video-sharing and learning platform where **students learn** and **teachers teach**. Built with the MERN stack, Mindora connects educators and learners in a feature-rich environment designed for sharing knowledge and growing together.

Whether you're a teacher sharing your expertise or a student exploring new concepts, Mindora provides the tools you need to create, discover, and engage with educational content.

**[Visit Mindora](https://mindora-amber.vercel.app)** - The platform is live and ready to use!

---

## Features

### Video Management
- **Upload & Share Videos**: Publish educational videos with auto-generated or custom thumbnails
- **Video Discovery**: Search, filter, and sort videos by various criteria
- **Watch History**: Keep track of videos you've watched
- **Video Analytics**: View counts and engagement metrics

### User Features
- **User Authentication**: Secure registration and login with JWT
- **User Profiles**: Customizable profiles with avatars and cover images
- **Channel Subscriptions**: Subscribe to your favorite content creators
- **Theme Preferences**: Light/Dark mode support

### Social Interaction
- **Tweets**: Share short updates and thoughts
- **Comments**: Engage in discussions on videos
- **Likes**: Show appreciation for content
- **Playlists**: Organize videos into collections

### Advanced Features
- **Pagination**: Efficient browsing of large content libraries
- **Search & Filter**: Find exactly what you're looking for
- **Responsive Design**: Seamless experience across all devices
- **Real-time Updates**: Stay connected with the latest content

---

## Tech Stack

### Frontend
- **React 18** - Modern UI library
- **Vite** - Lightning-fast build tool
- **TailwindCSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **React Hot Toast** - Beautiful notifications
- **React Icons** - Icon library

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database
- **JWT** - Authentication tokens
- **Multer** - File uploads
- **Cloudinary** - Media storage and optimization

---

## Live Platform

Mindora is **live and deployed** at [mindora-amber.vercel.app](https://mindora-amber.vercel.app)

No installation needed - just visit the site and start learning or teaching!

## Local Development

Want to contribute? Here's how to set up the project locally:

1. **Clone the repository**
   ```bash
   git clone https://github.com/codesbymustafa/Mindora.git
   cd Mindora
   ```

2. **Install dependencies**
   ```bash
   npm install
   cd frontend
   npm install
   cd ..
   ```

3. **Set up environment variables**
   
   Create `.env` files with your configuration (see `.env.example` if available)

4. **Run the development servers**
   ```bash
   npm run dev        # Backend
   cd frontend && npm run dev  # Frontend
   ```

---

## API Documentation

Mindora provides a comprehensive RESTful API. For detailed API documentation, see [`APIDoc.md`](./APIDoc.md).

### Main API Endpoints

- **Health Check**: `GET /api/v1/healthcheck`
- **Users**: `POST /api/v1/users/register`, `POST /api/v1/users/login`
- **Videos**: `GET /api/v1/videos`, `POST /api/v1/videos`
- **Tweets**: `GET /api/v1/tweets`, `POST /api/v1/tweets`
- **Comments**: `GET /api/v1/comments/:videoId`, `POST /api/v1/comments/:videoId`
- **Likes**: `POST /api/v1/likes/toggle/v/:videoId`
- **Subscriptions**: `POST /api/v1/subscriptions/c/:channelId`
- **Playlists**: `GET /api/v1/playlists`, `POST /api/v1/playlists`

---

## Project Structure

```
Mindora/
├── frontend/               # React frontend application
│   ├── src/
│   │   ├── components/    # Reusable React components
│   │   ├── pages/         # Page components
│   │   ├── utils/         # Utility functions
│   │   └── App.jsx        # Main app component
│   ├── public/            # Static assets
│   └── package.json       # Frontend dependencies
├── backend/               # Express backend (if separate)
│   ├── controllers/       # Route controllers
│   ├── models/            # MongoDB models
│   ├── routes/            # API routes
│   ├── middleware/        # Custom middleware
│   └── utils/             # Helper functions
├── APIDoc.md              # Complete API documentation
├── LICENSE                # MIT License
└── README.md              # This file
```

---

## Contributing

Contributions are welcome! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/AmazingFeature
   ```
3. **Commit your changes**
   ```bash
   git commit -m 'Add some AmazingFeature'
   ```
4. **Push to the branch**
   ```bash
   git push origin feature/AmazingFeature
   ```
5. **Open a Pull Request**

---

## License

This project is licensed under the **MIT License** - see the [LICENSE](./LICENSE) file for details.

---

## Author

**Mustafa Koser**

- GitHub: [@codesbymustafa](https://github.com/codesbymustafa)

---

## Acknowledgments

- Thanks to all contributors who help improve Mindora
- Built with love for the learning community

---

<div align="center">
  <p>Made with love by Mustafa Koser</p>
  <p>Star this repo if you find it helpful!</p>
</div>