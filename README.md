# Lumina 🎥

A real-time video conferencing application built with the MERN stack, featuring WebRTC for peer-to-peer connections and Socket.IO for real-time communication.

## ✨ Features

- **Video Conferencing**: High-quality peer-to-peer video calls using WebRTC
- **Real-time Chat**: Built-in chat functionality during video calls
- **Screen Sharing**: Share your screen with other participants
- **Audio/Video Controls**: Toggle camera and microphone on/off
- **Meeting History**: Track all your past meetings
- **User Authentication**: Secure login and registration system
- **Responsive Design**: Works seamlessly across different devices

## 🛠️ Tech Stack

### Frontend
- React.js
- Material-UI (MUI)
- Socket.IO Client
- WebRTC API

### Backend
- Node.js
- Express.js
- MongoDB
- Socket.IO
- bcrypt (for password hashing)

## 📋 Prerequisites

Before running this project, make sure you have:

- Node.js (v14 or higher)
- MongoDB installed and running
- npm or yarn package manager

## 🚀 Installation

### 1. Clone the repository
```bash
git clone https://github.com/yourusername/lumina.git
cd lumina
```

### 2. Install Backend Dependencies
```bash
cd server
npm install
```

### 3. Install Frontend Dependencies
```bash
cd ../client
npm install
```

### 4. Environment Variables

Create a `.env` file in the server directory:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/lumina
```

Create a `.env` file in the client directory (if needed):

```env
REACT_APP_SERVER_URL=http://localhost:5000
```

## 🏃‍♂️ Running the Application

### Start the Backend Server
```bash
cd server
npm start
```

### Start the Frontend Development Server
```bash
cd client
npm start
```

The application will be available at `http://localhost:3000`

## 📁 Project Structure

```
lumina/
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Authentication.jsx
│   │   │   ├── Home.jsx
│   │   │   ├── History.jsx
│   │   │   ├── Landing.jsx
│   │   │   └── VideoMeet.jsx
│   │   ├── contexts/
│   │   │   └── AuthContext.jsx
│   │   ├── utils/
│   │   └── App.js
│   └── package.json
├── server/
│   ├── controllers/
│   │   └── userControllers.js
│   ├── models/
│   │   ├── userModel.js
│   │   └── meetingModel.js
│   ├── routes/
│   ├── socketManager.js
│   └── server.js
└── README.md
```

## 🎯 How to Use

1. **Register/Login**: Create an account or login with existing credentials
2. **Join Meeting**: Enter a meeting code or create a new meeting room
3. **Controls**: 
   - Click the camera icon to toggle video
   - Click the microphone icon to toggle audio
   - Click the screen share icon to share your screen
   - Click the chat icon to open the chat panel
   - Click the red phone icon to end the call
4. **View History**: Access your meeting history from the home page

## 🔧 Key Features Explained

### WebRTC Implementation
The application uses WebRTC for peer-to-peer video/audio streaming, ensuring low latency and high-quality communication.

### Socket.IO Integration
Real-time signaling for WebRTC connections and chat messaging is handled through Socket.IO, enabling:
- User join/leave notifications
- SDP offer/answer exchange
- ICE candidate sharing
- Real-time chat messages

### Security
- Passwords are hashed using bcrypt
- Token-based authentication
- Secure Socket.IO connections

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration

### Meeting History
- `GET /api/meeting/history` - Get user's meeting history
- `POST /api/meeting/add` - Add meeting to history

## 🐛 Known Issues

- Screen sharing requires HTTPS in production
- STUN server configuration may need adjustment based on network

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👨‍💻 Author

Your Name - [Aryan Yadav](https://github.com/Aryan-Yadav2004)

## 🙏 Acknowledgments

- WebRTC for real-time communication capabilities
- Socket.IO for real-time event-based communication
- Material-UI for the beautiful component library
- MongoDB for flexible data storage

## 📧 Contact

For any queries or suggestions, feel free to reach out:
- Email: yadavaryan122004@gmail.com
- Project Link: [Lumina](https://github.com/Aryan-Yadav2004/Lumina)

---

Made with ❤️ using MERN Stack
