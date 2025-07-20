import type { Express } from "express";
import { createServer, type Server } from "http";
import { Server as SocketIOServer } from "socket.io";
import express from "express";
import multer from "multer";
import fs from "fs/promises";
import path from "path";
import { storage } from "./storage";
import { 
  authenticateJWT, 
  optionalJWT,
  authorize,
  generateTokens,
  hashPassword,
  comparePassword,
  verifyToken,
  authLimiter,
  setTokenCookies,
  clearTokenCookies,
  generateRandomToken
} from "./auth";
import { insertPropertySchema, insertMessageSchema } from "@shared/schema";
import { z } from "zod";
import { v4 as uuidv4 } from 'uuid';

// Configure multer for file uploads
const storage_multer = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), 'uploads', 'properties');
    try {
      await fs.mkdir(uploadDir, { recursive: true });
      cb(null, uploadDir);
    } catch (error) {
      cb(error as Error, '');
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage_multer,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  }
});

// Validation schemas
const registerSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  phone: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(1, "Password is required"),
});

const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, "Refresh token is required"),
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Serve uploaded files
  app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

  // Auth routes with rate limiting
  app.post('/api/auth/register', authLimiter, async (req, res) => {
    try {
      const validatedData = registerSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(validatedData.email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists with this email" });
      }

      // Hash password
      const hashedPassword = await hashPassword(validatedData.password);
      
      // Create user
      const userId = uuidv4();
      const user = await storage.createUser({
        id: userId,
        email: validatedData.email,
        password: hashedPassword,
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
        phone: validatedData.phone,
        emailVerified: false,
      });

      // Generate tokens (role will be managed client-side)
      const { accessToken, refreshToken } = generateTokens(user.id, user.email!, "buyer");
      
      // Store refresh token
      const refreshTokenExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
      await storage.updateRefreshToken(user.id, refreshToken, refreshTokenExpiry);

      // Set cookies
      setTokenCookies(res, accessToken, refreshToken);

      // Return user data (without password) with default role
      const { password: _, refreshToken: __, ...userResponse } = user;
      res.status(201).json({
        message: "User registered successfully",
        user: { ...userResponse, role: "buyer" }, // Default to buyer, can be changed client-side
        accessToken,
      });
    } catch (error) {
      console.error("Registration error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Registration failed" });
    }
  });

  app.post('/api/auth/login', authLimiter, async (req, res) => {
    try {
      const validatedData = loginSchema.parse(req.body);
      
      // Find user by email
      const user = await storage.getUserByEmail(validatedData.email);
      if (!user || !user.password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Verify password
      const isValidPassword = await comparePassword(validatedData.password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Generate tokens (role will be managed client-side)
      const { accessToken, refreshToken } = generateTokens(user.id, user.email!, "buyer");
      
      // Store refresh token
      const refreshTokenExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
      await storage.updateRefreshToken(user.id, refreshToken, refreshTokenExpiry);

      // Set cookies
      setTokenCookies(res, accessToken, refreshToken);

      // Return user data (without password) with default role
      const { password: _, refreshToken: __, ...userResponse } = user;
      res.json({
        message: "Login successful",
        user: { ...userResponse, role: "buyer" }, // Default to buyer, can be changed client-side
        accessToken,
      });
    } catch (error) {
      console.error("Login error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Login failed" });
    }
  });

  app.post('/api/auth/refresh', async (req, res) => {
    try {
      const refreshToken = req.cookies.refreshToken || req.body.refreshToken;
      
      if (!refreshToken) {
        return res.status(401).json({ message: "Refresh token required" });
      }

      const payload = verifyToken(refreshToken);
      if (!payload || payload.type !== 'refresh') {
        return res.status(401).json({ message: "Invalid refresh token" });
      }

      // Get user and verify refresh token
      const user = await storage.getUser(payload.userId);
      if (!user || user.refreshToken !== refreshToken) {
        return res.status(401).json({ message: "Invalid refresh token" });
      }

      // Check if refresh token is expired
      if (user.refreshTokenExpiry && user.refreshTokenExpiry < new Date()) {
        return res.status(401).json({ message: "Refresh token expired" });
      }

      // Generate new tokens with default role as buyer
      const { accessToken, refreshToken: newRefreshToken } = generateTokens(user.id, user.email!, "buyer");
      
      // Update refresh token in database
      const refreshTokenExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      await storage.updateRefreshToken(user.id, newRefreshToken, refreshTokenExpiry);

      // Set new cookies
      setTokenCookies(res, accessToken, newRefreshToken);

      res.json({
        message: "Token refreshed successfully",
        accessToken,
      });
    } catch (error) {
      console.error("Token refresh error:", error);
      res.status(401).json({ message: "Token refresh failed" });
    }
  });

  app.post('/api/auth/logout', authenticateJWT, async (req, res) => {
    try {
      const user = (req as any).user;
      
      // Clear refresh token from database
      await storage.updateRefreshToken(user.id, null, null);
      
      // Clear cookies
      clearTokenCookies(res);

      res.json({ message: "Logout successful" });
    } catch (error) {
      console.error("Logout error:", error);
      res.status(500).json({ message: "Logout failed" });
    }
  });

  // Get current user
  app.get('/api/auth/user', authenticateJWT, async (req: any, res) => {
    try {
      const user = req.user;
      const { password: _, refreshToken: __, ...userResponse } = user;
      
      // Get role from request headers (set by frontend)
      const clientRole = req.headers['x-user-role'] as string;
      const role = clientRole && ["buyer", "seller", "broker"].includes(clientRole) 
        ? clientRole 
        : "buyer"; // fallback to buyer
      
      console.log("API /auth/user - Client role from headers:", clientRole);
      console.log("API /auth/user - Final role:", role);
      
      res.json({ ...userResponse, role });
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // User stats endpoint
  app.get('/api/user/stats', authenticateJWT, async (req: any, res) => {
    try {
      const userId = req.user.id;
      console.log('User stats requested for userId:', userId);
      
      // Get user's properties count
      const userProperties = await storage.getProperties({ ownerId: userId, status: 'active' });
      const activeListings = userProperties.length;
      console.log('Found', activeListings, 'active listings for user', userId);
      
      // Get user's favorites count
      const favorites = await storage.getUserFavorites(userId);
      const favoritesCount = favorites.length;
      console.log('Found', favoritesCount, 'favorites for user', userId);
      
      // For now, we'll use placeholder values for other stats
      const stats = {
        activeListings,
        totalViews: 0, // Placeholder - would need view tracking
        favoriteProperties: favoritesCount,
        totalEarnings: 0, // Placeholder - would need transaction tracking
      };
      
      console.log('Returning stats:', stats);
      res.json(stats);
    } catch (error) {
      console.error('Error fetching user stats:', error);
      res.status(500).json({ message: 'Failed to fetch user stats' });
    }
  });

  // User profile routes (removed role since it's not stored in DB)
  app.put('/api/profile', authenticateJWT, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { phone, bio } = req.body;
      
      const updatedUser = await storage.updateUserProfile(userId, {
        phone,
        bio,
      });
      
      // Get role from request headers (set by frontend)
      const clientRole = req.headers['x-user-role'] as string;
      const role = clientRole && ["buyer", "seller", "broker"].includes(clientRole) 
        ? clientRole 
        : "buyer"; // fallback to buyer
      
      res.json({ ...updatedUser, role });
    } catch (error) {
      console.error("Error updating profile:", error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });



  // Property image upload
  app.post('/api/properties/upload-images', authenticateJWT, upload.array('images', 10), async (req: any, res) => {
    try {
      console.log('=== UPLOAD REQUEST START ===');
      console.log('Upload request received, user:', req.user?.id);
      console.log('Files received:', req.files?.length);
      console.log('Request content-type:', req.headers['content-type']);
      
      if (!req.files || req.files.length === 0) {
        console.log('No files in request');
        return res.status(400).json({ message: "No images uploaded" });
      }

      const imageUrls = (req.files as Express.Multer.File[]).map(file => {
        console.log('Processing file:', file.filename, 'size:', file.size);
        return `/uploads/properties/${file.filename}`;
      });

      console.log('Generated image URLs:', imageUrls);
      console.log('=== UPLOAD REQUEST END ===');
      res.json({ imageUrls });
    } catch (error) {
      console.error("Error uploading images:", error);
      res.status(500).json({ message: "Failed to upload images", error: error.message });
    }
  });

  // Delete property image
  app.delete('/api/properties/images', authenticateJWT, async (req: any, res) => {
    try {
      const { imageUrl } = req.body;
      
      if (!imageUrl) {
        return res.status(400).json({ message: "Image URL is required" });
      }

      // Extract filename from URL
      const filename = path.basename(imageUrl);
      const filePath = path.join(process.cwd(), 'uploads', 'properties', filename);

      try {
        await fs.unlink(filePath);
        res.json({ message: "Image deleted successfully" });
      } catch (error) {
        // File might not exist, but that's okay
        res.json({ message: "Image deleted successfully" });
      }
    } catch (error) {
      console.error("Error deleting image:", error);
      res.status(500).json({ message: "Failed to delete image" });
    }
  });

  // Property routes
  app.get('/api/properties', optionalJWT, async (req, res) => {
    try {
      console.log("Properties API called with query:", req.query);
      
      const filters = {
        city: req.query.city as string,
        state: req.query.state as string,
        propertyType: req.query.propertyType as string,
        minPrice: req.query.minPrice ? parseFloat(req.query.minPrice as string) : undefined,
        maxPrice: req.query.maxPrice ? parseFloat(req.query.maxPrice as string) : undefined,
        minBedrooms: req.query.minBedrooms ? parseInt(req.query.minBedrooms as string) : undefined,
        status: req.query.status as string || "active",
        ownerId: req.query.ownerId as string,
      };

      console.log("Parsed filters:", filters);

      // Remove undefined and empty values
      const cleanFilters = Object.fromEntries(
        Object.entries(filters).filter(([_, value]) => 
          value !== undefined && value !== null && value !== ""
        )
      );

      console.log("Clean filters passed to storage:", cleanFilters);

      const properties = await storage.getProperties(cleanFilters);
      
      console.log(`Found ${properties.length} properties`);
      
      res.json(properties);
    } catch (error) {
      console.error("Error fetching properties:", error);
      res.status(500).json({ message: "Failed to fetch properties" });
    }
  });

  app.get('/api/properties/:id', async (req, res) => {
    try {
      const propertyId = parseInt(req.params.id);
      const property = await storage.getProperty(propertyId);
      
      if (!property) {
        return res.status(404).json({ message: "Property not found" });
      }
      
      res.json(property);
    } catch (error) {
      console.error("Error fetching property:", error);
      res.status(500).json({ message: "Failed to fetch property" });
    }
  });

  app.post('/api/properties', authenticateJWT, authorize(['seller', 'broker']), async (req: any, res) => {
    try {
      console.log('=== CREATE PROPERTY API CALLED ===');
      console.log('User:', req.user?.id);
      console.log('Request body:', JSON.stringify(req.body, null, 2));

      const userId = req.user.id;
      console.log('Setting owner ID:', userId);
      
      // Create property data with ownerId, then validate
      const propertyDataWithOwner = {
        ...req.body,
        ownerId: userId,
      };
      
      console.log('Property data before validation:', propertyDataWithOwner);
      
      // Now validate the complete data including ownerId
      const propertyData = insertPropertySchema.parse(propertyDataWithOwner);
      
      console.log('Final property data for storage:', propertyData);

      console.log('Validation successful, creating property...');
      const property = await storage.createProperty(propertyData);
      console.log('Property created successfully:', property.id);
      res.status(201).json(property);
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.error('Validation error:', error.errors);
        return res.status(400).json({ message: "Invalid property data", errors: error.errors });
      }
      console.error("Error creating property:", error);
      res.status(500).json({ message: "Failed to create property", error: error.message });
    }
  });

  app.put('/api/properties/:id', authenticateJWT, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const propertyId = parseInt(req.params.id);
      
      // Check if user owns the property
      const existingProperty = await storage.getProperty(propertyId);
      if (!existingProperty) {
        return res.status(404).json({ message: "Property not found" });
      }
      
      if (existingProperty.ownerId !== userId) {
        return res.status(403).json({ message: "Not authorized to update this property" });
      }

      const updateData = insertPropertySchema.partial().parse(req.body);
      const updatedProperty = await storage.updateProperty(propertyId, updateData);
      
      res.json(updatedProperty);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid property data", errors: error.errors });
      }
      console.error("Error updating property:", error);
      res.status(500).json({ message: "Failed to update property" });
    }
  });

  app.delete('/api/properties/:id', authenticateJWT, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const propertyId = parseInt(req.params.id);
      
      // Check if user owns the property
      const existingProperty = await storage.getProperty(propertyId);
      if (!existingProperty) {
        return res.status(404).json({ message: "Property not found" });
      }
      
      if (existingProperty.ownerId !== userId) {
        return res.status(403).json({ message: "Not authorized to delete this property" });
      }

      await storage.deleteProperty(propertyId);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting property:", error);
      res.status(500).json({ message: "Failed to delete property" });
    }
  });

  // Favorites routes
  app.get('/api/favorites', authenticateJWT, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const favorites = await storage.getUserFavorites(userId);
      res.json(favorites);
    } catch (error) {
      console.error("Error fetching favorites:", error);
      res.status(500).json({ message: "Failed to fetch favorites" });
    }
  });

  app.post('/api/favorites/:propertyId', authenticateJWT, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const propertyId = parseInt(req.params.propertyId);
      
      const favorite = await storage.addFavorite(userId, propertyId);
      res.status(201).json(favorite);
    } catch (error) {
      console.error("Error adding favorite:", error);
      res.status(500).json({ message: "Failed to add favorite" });
    }
  });

  app.delete('/api/favorites/:propertyId', authenticateJWT, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const propertyId = parseInt(req.params.propertyId);
      
      await storage.removeFavorite(userId, propertyId);
      res.status(204).send();
    } catch (error) {
      console.error("Error removing favorite:", error);
      res.status(500).json({ message: "Failed to remove favorite" });
    }
  });

  // Messaging routes
  app.get('/api/conversations', authenticateJWT, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const conversations = await storage.getUserConversations(userId);
      res.json(conversations);
    } catch (error) {
      console.error("Error fetching conversations:", error);
      res.status(500).json({ message: "Failed to fetch conversations" });
    }
  });

  app.get('/api/conversations/:id/messages', authenticateJWT, async (req: any, res) => {
    try {
      const conversationId = parseInt(req.params.id);
      const userId = req.user.id;
      
      const messages = await storage.getConversationMessages(conversationId);
      
      // Mark messages as read
      await storage.markMessagesAsRead(conversationId, userId);
      
      res.json(messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  app.post('/api/conversations', authenticateJWT, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { participantId, propertyId } = req.body;
      
      const conversation = await storage.getOrCreateConversation(
        userId,
        participantId,
        propertyId ? parseInt(propertyId) : undefined
      );
      
      res.json(conversation);
    } catch (error) {
      console.error("Error creating conversation:", error);
      res.status(500).json({ message: "Failed to create conversation" });
    }
  });

  const httpServer = createServer(app);
  
  // Setup WebSocket for real-time messaging
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('join-conversation', (conversationId: string) => {
      socket.join(`conversation-${conversationId}`);
    });

    socket.on('send-message', async (data) => {
      try {
        const { conversationId, senderId, content } = data;
        
        const messageData = insertMessageSchema.parse({
          conversationId: parseInt(conversationId),
          senderId,
          content,
          isRead: false,
        });

        const message = await storage.createMessage(messageData);
        
        // Broadcast to all users in the conversation
        io.to(`conversation-${conversationId}`).emit('new-message', message);
      } catch (error) {
        console.error('Error sending message:', error);
        socket.emit('message-error', { error: 'Failed to send message' });
      }
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
    });
  });

  return httpServer;
}
