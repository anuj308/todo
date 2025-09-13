import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';

export const protect = async (req, res, next) => {
  try {
    console.log('==== AUTH MIDDLEWARE EXECUTING ====');
    console.log('Request headers:', req.headers);
    
    let token;

    // Check for token in Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      try {
        // Get token from header (format: "Bearer token")
        token = req.headers.authorization.split(' ')[1];
        // console.log('==== TOKEN FOUND ====:', token.substring(0, 15) + '...');
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log('==== TOKEN VERIFIED ====');

        // Get user from token (exclude password)
        req.user = await User.findById(decoded.id).select('-password');
        // console.log('==== USER FOUND ====:', req.user ? req.user._id : 'No user');
        if (!req.user) {
          return res.status(401).json({ message: 'Not authorized, user not found' });
        }

        next();
      } catch (error) {
        console.error('==== AUTH ERROR ====', error);
        return res.status(401).json({ message: 'Not authorized, invalid token' });
      }
    }

    if (!token) {
      console.log('==== NO TOKEN PROVIDED ====');
      return res.status(401).json({ message: 'Not authorized, no token provided' });
    }
  } catch (error) {
    console.error('==== AUTH MIDDLEWARE ERROR ====', error);
    return res.status(500).json({ message: 'Server error' });
  }
};