// middleware/auth.js
import dotenv from 'dotenv';
dotenv.config();

const basicAuth = (req, res, next) => {
  // Log headers for debugging
  console.log('Request headers:', req.headers);
  
  // Check if authorization header exists
  const authHeader = req.headers.authorization;
  console.log('Auth header:', authHeader ? authHeader : 'Missing');
  
  if (!authHeader || !authHeader.startsWith('Basic ')) {
    console.log('Missing or invalid auth header format');
    return res.status(401).json({ message: 'Authorization required' });
  }
  
  try {
    // Get credentials from header
    const base64Credentials = authHeader.substring(6); // Remove 'Basic ' prefix
    console.log('Base64 credentials:', base64Credentials);
    
    const credentials = Buffer.from(base64Credentials, 'base64').toString('utf8');
    console.log('Decoded credentials:', credentials);
    
    const [username, password] = credentials.split(':');
    
    console.log('Provided username:', username);
    console.log('Provided password:', password);
    console.log('Expected username:', process.env.AUTH_USERNAME);
    console.log('Expected password:', process.env.AUTH_PASSWORD);
    
    // Check credentials against environment variables
    if (
      username === process.env.AUTH_USERNAME && 
      password === process.env.AUTH_PASSWORD
    ) {
      console.log('Authentication successful');
      return next();
    }
    
    // Authentication failed
    console.log('Invalid credentials');
    return res.status(401).json({ message: 'Invalid credentials' });
  } catch (error) {
    console.error('Auth error:', error);
    return res.status(401).json({ message: 'Invalid authorization format' });
  }
};

export default basicAuth;