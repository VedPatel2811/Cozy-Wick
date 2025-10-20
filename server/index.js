require('dotenv').config();

const express = require('express');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const connectDB = require('./config/db');

const app = express();
connectDB();

// Middlewares
app.use(helmet());
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: process.env.CLIENT_URL, // allow your Vite app origin
  credentials: true,
}));

// basic rate limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 100, // limit each IP
});
app.use(limiter);

// Routes
app.use('/api/auth', require('./routes/auth'));

// A protected test route
const auth = require('./middleware/auth');
app.get('/api/protected', auth, (req, res) => {
  res.json({ msg: `Hello user ${req.user.id}`, user: req.user });
});


app.listen(process.env.PORT, () => console.log(`Server running on ${process.env.PORT}`));
