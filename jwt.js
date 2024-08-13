const jwt = require('jsonwebtoken');

//cponstructing the jwt authentication middleware
const jwtAuthMiddleware = (req, res, next) => {

    //first check the request headers are authorized or not
    const authorization = req.headers.authorization;
    if (!authorization) return res.status(401).json({error: 'Token not found'}) //if there is no authorization

    //extract jwt token from the request headers
    const token = req.headers.authorization.split(' ')[1];
    if (!token) return res.status(401).json({error: 'unauthorized'}); //if there is no token found

    try {
        //verify the jwt token that was generated
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        //attach user information to the request object
        req.userData = decoded;
        next();

    } catch (error) {
        console.log(error);
        res.status(401).json({error: 'Invalid token'})
    }
}

const generateToken = (userData) => {
    //generate a new jwt token using user data
    jwt.sign(userData, process.env.JWT_SECRET, {expiresIn: 30000})
}

module.exports = { jwtAuthMiddleware, generateToken }