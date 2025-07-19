# PropertyHub - replit.md

## Overview

PropertyHub is a full-stack web application that connects buyers, sellers, and brokers in the real estate market. The platform allows users to browse properties, manage listings, communicate through a messaging system, and maintain user profiles. Built with modern technologies, it provides a comprehensive solution for real estate transactions and networking.

## System Architecture

### Full-Stack Architecture
- **Frontend**: React with TypeScript, using Vite as the build tool
- **Backend**: Express.js server with TypeScript
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Authentication**: Replit Auth integration with OpenID Connect
- **UI Framework**: shadcn/ui components with Tailwind CSS for styling
- **Real-time Communication**: Socket.IO for messaging features

### Deployment Strategy
The application is configured for Replit's autoscale deployment with:
- Development mode running on port 5000
- Production build optimized with esbuild for the server
- Vite build for the client-side assets
- PostgreSQL database provisioning through Replit modules

## Key Components

### Database Schema (Drizzle ORM)
Located in `shared/schema.ts`, the database schema includes:
- **Users**: Authentication and profile management (buyers, sellers, brokers)
- **Properties**: Real estate listings with comprehensive metadata
- **Messages & Conversations**: Real-time messaging system
- **Property Favorites**: User wishlist functionality
- **Sessions**: Required for Replit Auth session management

### Authentication System
- Replit Auth integration in `server/replitAuth.ts`
- OpenID Connect strategy with Passport.js
- Session management using PostgreSQL store
- Role-based access control (buyer, seller, broker)

### API Structure
RESTful API endpoints in `server/routes.ts`:
- User authentication and profile management
- Property CRUD operations with filtering
- Messaging system with real-time updates
- Favorites management
- File upload handling for property images

### Frontend Components
- **Layout Components**: Header, Footer, Navigation
- **Property Components**: Cards, Search, Detail views, Add/Edit forms
- **Messaging Interface**: Real-time chat functionality
- **User Interface**: Profile management, authentication flows

### UI Design System
- shadcn/ui component library with Radix UI primitives
- Tailwind CSS with custom design tokens
- Responsive design optimized for mobile and desktop
- Dark mode support through CSS variables

## Data Flow

### User Authentication Flow
1. User clicks login → Redirected to Replit Auth
2. Authentication callback updates user session
3. User data synchronized with local database
4. Frontend receives user context through React Query

### Property Management Flow
1. Authenticated users can create/edit property listings
2. Properties are stored with comprehensive metadata (location, price, features)
3. Image uploads handled through the backend API
4. Properties displayed with filtering and search capabilities

### Messaging System
1. Users can initiate conversations about specific properties
2. Real-time messaging through Socket.IO integration
3. Message history persisted in PostgreSQL
4. Conversation management with user and property context

### Data Caching Strategy
- React Query for client-side state management and caching
- Automatic background refetching for real-time data
- Optimistic updates for better user experience

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL connection handling
- **drizzle-orm**: Type-safe database operations
- **@tanstack/react-query**: Client-side state management
- **socket.io**: Real-time communication
- **react-hook-form**: Form management with validation
- **zod**: Runtime type validation

### UI Dependencies
- **@radix-ui/***: Accessible UI primitives
- **tailwindcss**: Utility-first CSS framework
- **lucide-react**: Icon library
- **class-variance-authority**: Utility for component variants

### Authentication Dependencies
- **openid-client**: OpenID Connect implementation
- **passport**: Authentication middleware
- **express-session**: Session management
- **connect-pg-simple**: PostgreSQL session store

## Deployment Strategy

### Development Environment
- Replit environment with Node.js 20
- PostgreSQL 16 database module
- Hot reload development server
- Vite dev server for frontend assets

### Production Build
- Server bundled with esbuild for optimal performance
- Client assets built with Vite and served statically
- PostgreSQL database with connection pooling
- Session-based authentication with secure cookies

### Environment Configuration
- Database URL configuration for PostgreSQL connection
- Session secrets for authentication security
- OIDC configuration for Replit Auth integration

## Changelog
- June 23, 2025: Initial setup
- June 23, 2025: Implemented JWT and SSO authentication system with user registration, login, role-based access control, and secure token management
- June 23, 2025: Added role-based features and dashboard - buyers get market insights and messaging, sellers get listing tools and analytics, brokers get client management and portfolio features
- June 23, 2025: Updated application name from "RealEstate Hub" to "RealEstateHub" throughout the application
- June 23, 2025: Updated copyright notice to "2025 RealEstateHub Powered By Elgiriya Innovations"
- June 23, 2025: Implemented property image upload and delete functionality with multer file handling, image gallery display, and management interface
- June 23, 2025: Fixed authentication token inconsistency in image upload - corrected localStorage key from 'token' to 'accessToken' to match auth system
- June 23, 2025: Fixed property creation validation - resolved schema type mismatch for price field and form submission process
- June 23, 2025: Property creation system fully functional - fixed ownerId validation, token handling, and successful database storage with automatic redirect to property detail page
- June 23, 2025: Updated currency display from USD ($) to Sri Lankan Rupees (LKR) throughout the application
- June 24, 2025: Fixed complete search filtration system - resolved wouter router URL parameter issues, implemented proper form state persistence, and enabled working property filters by location, type, price range, and bedrooms
- June 26, 2025: Seeded database with comprehensive test property data including houses, apartments, townhouses, condos, and commercial properties across multiple cities (Colombo, Kandy, Galle, Negombo, Matara, Gampaha) with varied price ranges for complete search functionality testing
- June 26, 2025: Changed "Recent Listings" to "My Listings" in home page for sellers and brokers to better reflect ownership of displayed properties
- June 26, 2025: Improved home page layout with separated action buttons in grid format, fixed property card navigation to property detail pages, and enhanced property detail page with proper headers and footer integration
- June 26, 2025: Renamed application from "RealEstateHub" to "PropertyHub" and updated landing page with darker hero image for better text visibility
- June 26, 2025: Completed comprehensive rebranding - changed all instances of "RealEstateHub" to "PropertyHub" across all files including HTML title, auth pages, headers, footers, and copyright notices

## User Preferences

Preferred communication style: Simple, everyday language.
Authentication flow: Sign-up should redirect to sign-in page, then sign-in should redirect to home page.