# SayHey 👋

A real-time chat application built with Node.js, Express.js, Socket.io, MongoDB and JWT authentication.

## 🚀 Features

- User registration and login
- JWT-based authentication
- One-to-one real-time messaging
- Socket.io integration
- Chat history stored in MongoDB
- Online/offline user status
- Last seen status
- Typing indicator
- New message notifications
- Unread message count
- Secure message handling
- Password hashing with bcryptjs
- Protected REST APIs

## 🛠️ Technologies Used

### Frontend
- HTML
- CSS
- JavaScript

### Backend
- Node.js
- Express.js
- TypeScript
- Socket.io

### Database
- MongoDB
- Mongoose

### Authentication & Security
- JSON Web Tokens (JWT)
- bcryptjs

### Tools
- Git
- GitHub
- Postman
- MongoDB Compass
- VS Code

## 📂 Project Structure

```text
Chat-Application/
│
├── public/
│   ├── index.html
│   ├── style.css
│   ├── script.js
│   ├── login.html
│   ├── login.js
│   ├── register.html
│   └── register.js
│
├── src/
│   ├── config/
│   │   └── db.ts
│   ├── controllers/
│   │   ├── authController.ts
│   │   └── messageController.ts
│   ├── middleware/
│   │   └── authMiddleware.ts
│   ├── models/
│   │   ├── Message.ts
│   │   └── User.ts
│   ├── routes/
│   │   ├── authRoutes.ts
│   │   └── messageRoutes.ts
│   ├── utils/
│   │   └── generateToken.ts
│   └── server.ts
│
├── .gitignore
├── package.json
├── package-lock.json
└── tsconfig.json

## 💡 Key Functionality

SayHey uses Socket.io to establish real-time communication between users. Messages are stored in MongoDB so that previous conversations can be retrieved when users open a chat.

JWT authentication is used to secure both REST API requests and Socket.io connections.

## 🔐 Security

- Passwords are hashed using bcryptjs.
- JWT is used for authentication.
- Protected REST API routes require a valid JWT.
- Socket.io connections require JWT authentication.
- Message sender identity is derived from the authenticated user.

## 👩‍💻 Author

Linsha Mary
B.Tech Computer Science and Engineering
