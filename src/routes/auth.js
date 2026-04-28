import pool from '../db.js';
import { Router } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import protect from '../middleware/auth.js';

const router = Router();


router.post('/signup', async (req, res) => {

    try {
        console.log('inside signup endpt');
        const { email , username , password} = req.body;
        const emailRes = await pool.query('SELECT * FROM users WHERE email = $1',[email]);
        if(emailRes.rowCount > 0 ){
            return res.status(400).json({ error :'email already registered'});
        }
        const usernameRes = await pool.query('SELECT * FROM users WHERE username = $1',[username]);
        if(usernameRes.rowCount > 0 ){
            return res.status(400).json({ error :'username already taken'});
        }

        const hashedPassword = await bcrypt.hash(password,10);

        const insertRes = await pool.query('INSERT INTO users ( email, username, password) \
            VALUES ($1 , $2 , $3) \
            RETURNING * ',[email,username,hashedPassword]);

        const insertedUser = insertRes.rows[0];

        return res.status(201).json({
            id : insertedUser.id,
            email : insertedUser.email,
            username : insertedUser.username
        })
    } catch (err) {
        console.error(err);
        return res.status(500).json({error : 'Internal server error'});
    }

})

router.post('/login', async (req,res) => {

    try {
        const { email , password} = req.body;
        const rowRes = await pool.query('SELECT * FROM users WHERE email= $1',[email]);
        if(rowRes.rowCount == 0){
            return res.status(404).json({error : 'user not found'});
        }
        const user = rowRes.rows[0];
        const  isOk = await bcrypt.compare(password, user.password);
        if(!isOk){
            return res.status(401).json({error : 'wrong password'}); 
        }

        const token = jwt.sign(
            { 
                id : user.id,
                email : user.email
            },
            process.env.JWT_SECRET_KEY,
            {expiresIn : '1h'}
        )

        return res.status(200).json({
            id : user.id,
            username : user.username,
            email : user.email,
            jwt : token
        })
    } 
    catch (err) {
        console.log(err);
        return res.status(500).json({ error : 'Internal server error'});
    }
})

router.get('/me',protect, async (req,res) => {
    try {
        const user = req.user;
        const fetchedUser = await pool.query('SELECT id, email, username FROM users WHERE id=$1',[user.id]);

        return res.status(200).json(fetchedUser.rows[0]);
    } catch (err) {
        console.log(err);
        return res.status(500).json({ error : 'Internal server error'});
    }

})


export default router;