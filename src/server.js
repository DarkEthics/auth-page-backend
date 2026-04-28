import express from 'express';
import dotenv from 'dotenv';
import pool from './db.js';
import router from './routes/auth.js';
import cors from 'cors';

const app = express();

const PORT = process.env.PORT || 5003;

// const res = await pool.query('SELECT NOW()');
// console.log(res.rows);

app.use(cors({
    origin: process.env.FRONTEND_URL
}));

app.use(express.json());

app.use('/auth',router);

app.listen(PORT, () => {
    console.log(`server started on port ${PORT}`);
})