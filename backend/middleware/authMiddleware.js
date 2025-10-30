import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';

export const protect = async (req, res, next) => {
  try {
    console.log('==== AUTH MIDDLEWARE EXECUTING ====');
    console.log('Request cookies:', req.cookies);
    console.log('Authorization header:', req.headers.authorization);
    
    let token;

    // Check for token in cookies (web app)
    if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
      console.log('==== TOKEN FOUND IN COOKIE ====');
    }
    // Check for token in Authorization header (mobile app)
    else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
      console.log('==== TOKEN FOUND IN HEADER ====');
    }

    if (!token) {
      console.log('==== NO TOKEN PROVIDED ====');
      return res.status(401).json({ message: 'Not authorized, no token provided' });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('==== TOKEN VERIFIED ====');

      // Get user from token (exclude password)
      req.user = await User.findById(decoded.id).select('-password');
      console.log('==== USER FOUND ====:', req.user ? req.user._id : 'No user');
      
      if (!req.user) {
        return res.status(401).json({ message: 'Not authorized, user not found' });
      }

      next();
    } catch (error) {
      console.error('==== AUTH ERROR ====', error);
      return res.status(401).json({ message: 'Not authorized, invalid token' });
    }
  } catch (error) {
    console.error('==== AUTH MIDDLEWARE ERROR ====', error);
    return res.status(500).json({ message: 'Server error' });
  }
};