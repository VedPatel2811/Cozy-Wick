import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import authRouters from './routes/auth';

dotenv.config();
const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: process.env.ORIGIN,
    credentials: true,
}));

app.use('/auth', authRouters);

app.listen(process.env.PORT, () => {
    console.log(`Auth server running on port ${process.env.PORT}`);
});