import jwt from 'jsonwebtoken';

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Set cache control headers
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  const { method, url } = req;
  console.log('API Request:', { method, url, body: req.body });

  // Handle test endpoint
  if (method === 'GET' && (!url || url === '/' || url.includes('/test'))) {
    res.json({
      message: "PropertyHub API is working!",
      timestamp: new Date().toISOString(),
      method: req.method,
      url: req.url
    });
    return;
  }

  // Handle login
  if (method === 'POST' && (url?.includes('/login') || req.query?.action === 'login')) {
    try {
      const { email, password } = req.body;
      console.log('Login attempt:', { email });

      if (email === 'kavindasenarathne94@gmail.com') {
        const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
        const accessToken = jwt.sign(
          { userId: 'mock-user-id', email, role: 'buyer', type: 'access' },
          JWT_SECRET,
          { expiresIn: '24h' }
        );

        const user = {
          id: 'mock-user-id',
          email: 'kavindasenarathne94@gmail.com',
          firstName: 'Kavinda',
          lastName: 'Senarathne',
          phone: '+94 71 234 5678',
          profileImageUrl: null,
          bio: 'Real estate enthusiast',
          emailVerified: true,
          role: 'buyer',
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        console.log('Login successful for:', email);
        res.json({
          message: "Login successful",
          user,
          accessToken,
        });
      } else {
        console.log('Login failed for:', email);
        return res.status(401).json({ message: "Invalid credentials" });
      }
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Login failed" });
    }
    return;
  }

  // Handle user data fetch
  if (method === 'GET' && (url?.includes('/user') || req.query?.action === 'user')) {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        console.log('No token provided');
        return res.status(401).json({ message: 'No token provided' });
      }

      const token = authHeader.substring(7);
      const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';

      const decoded = jwt.verify(token, JWT_SECRET);
      
      if (!decoded || !decoded.email) {
        console.log('Invalid token');
        return res.status(401).json({ message: 'Invalid token' });
      }

      const user = {
        id: decoded.userId || 'mock-user-id',
        email: decoded.email,
        firstName: 'Kavinda',
        lastName: 'Senarathne',
        phone: '+94 71 234 5678',
        profileImageUrl: null,
        bio: 'Real estate enthusiast',
        emailVerified: true,
        role: decoded.role || 'buyer',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      console.log('User data returned for:', decoded.email);
      res.json(user);
    } catch (error) {
      console.error("User fetch error:", error);
      res.status(401).json({ message: "Invalid token" });
    }
    return;
  }

  // Handle unknown routes
  console.log('Unknown route:', { method, url });
  res.status(404).json({ message: 'Not found' });
} 