import jwt from 'jsonwebtoken';


const protect = (req, res , next) => {
    const {authorization : tokenWithBearer} = req.headers ;
    if(!tokenWithBearer) return res.status(401).json({error : 'No token provided'});
    const token = tokenWithBearer.split(' ')[1];

    try{
        const decodedUser = jwt.verify(token , process.env.JWT_SECRET_KEY);
        req.user = decodedUser;
        next();
    }
    catch(err){
        console.error(err);
        return res.status(401).json({error : 'bad/ expired token'});
    }
}

export default protect;