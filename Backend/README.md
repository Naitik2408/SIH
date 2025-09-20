# SIH Transportation Analytics Backend

Backend API for the Smart India Hackathon Transportation Analytics Platform.

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Start the server:**
   ```bash
   # Development mode with hot reload
   npm run dev
   
   # Production mode
   npm start
   ```

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/        # Database and app configuration
│   │   └── db.js      # MongoDB connection
│   ├── models/        # Mongoose schemas
│   ├── routes/        # Express routes
│   ├── controllers/   # Route handlers/business logic
│   ├── middleware/    # Authentication and other middlewares
│   └── server.js      # Entry point
├── .env               # Environment variables
├── package.json       # Dependencies and scripts
└── README.md          # This file
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `5000` |
| `NODE_ENV` | Environment mode | `development` |
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/sih_transportation_db` |
| `JWT_SECRET` | JWT signing secret | Required |
| `JWT_EXPIRE` | JWT expiration time | `30d` |
| `CLIENT_URL` | Frontend URL for CORS | `http://localhost:3000` |

## 📡 API Endpoints

### Health Check
- **GET** `/api/health` - Check server status

### API Info
- **GET** `/api` - Get API information and available endpoints

## 🛠 Development

### Scripts
- `npm run dev` - Start development server with nodemon
- `npm start` - Start production server
- `npm test` - Run tests (to be implemented)

### Database
The application uses MongoDB with Mongoose ODM. Make sure MongoDB is running locally or provide a cloud MongoDB URI in the environment variables.

## 📦 Dependencies

### Production
- **express** - Web framework
- **mongoose** - MongoDB ODM
- **cors** - Cross-origin resource sharing
- **dotenv** - Environment variable management
- **bcryptjs** - Password hashing
- **jsonwebtoken** - JWT authentication

### Development
- **nodemon** - Development server with hot reload

## 🚦 Status

- ✅ Project structure setup
- ✅ Express server configuration
- ✅ MongoDB connection setup
- ✅ Basic middleware configuration
- ✅ Health check endpoint
- ⏳ Authentication system (planned)
- ⏳ User management (planned)
- ⏳ Report generation API (planned)
- ⏳ Analytics endpoints (planned)

## 📝 License

ISC License
