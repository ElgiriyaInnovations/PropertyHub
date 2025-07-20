import "dotenv/config";
import express, { type Request, Response, NextFunction } from "express";
import path from "path";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

const app = express();
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: false, limit: '50mb' }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // Add a test endpoint to check if server is working
app.get('/test', (req, res) => {
  res.json({ 
    message: 'Server is working!', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    vercel: !!process.env.VERCEL
  });
});

// Serve static files for production (Vercel)
if (process.env.VERCEL || process.env.NODE_ENV === 'production') {
  console.log('Setting up production static file serving...');
  console.log('Current working directory:', process.cwd());
      console.log('Static files path:', path.join(process.cwd(), 'dist', 'public'));
  
  // Serve static files from the dist/public directory (built React app)
  app.use(express.static(path.join(process.cwd(), 'dist', 'public')));
  
  // Catch-all handler for SPA routing
  app.get('*', (req, res) => {
    console.log('Handling request for:', req.path);
    
    // Don't serve index.html for API routes
    if (req.path.startsWith('/api/')) {
      console.log('API route not found:', req.path);
      return res.status(404).json({ message: 'API endpoint not found' });
    }
    
          // For all other routes, serve index.html (SPA routing)
      const indexPath = path.join(process.cwd(), 'dist', 'public', 'index.html');
    console.log('Serving index.html from:', indexPath);
    
    // Check if the file exists
    const fs = require('fs');
    if (fs.existsSync(indexPath)) {
      res.sendFile(indexPath, (err) => {
        if (err) {
          console.error('Error serving index.html:', err);
          res.status(500).json({ message: 'Internal server error', error: err.message });
        } else {
          console.log('Successfully served index.html');
        }
      });
    } else {
      console.error('index.html not found at:', indexPath);
      res.status(404).json({ 
        message: 'Static files not found', 
        path: indexPath,
        cwd: process.cwd(),
        files: fs.readdirSync(process.cwd())
      });
    }
  });
}

  // Only start the server if not in Vercel environment
  if (!process.env.VERCEL) {
    // Serve the app on port 3000 for local development
    // this serves both the API and the client.
    const port = process.env.PORT || 3000;
    server.listen({
      port,
      host: "0.0.0.0",
      reusePort: true,
    }, () => {
      log(`serving on port ${port}`);
    });
  }
})();

// Export for Vercel serverless functions
export default app;
