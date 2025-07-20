# PropertyHub - Next.js Version

A modern real estate platform built with Next.js, TypeScript, and Tailwind CSS.

## Features

- 🔐 Authentication with JWT
- 🏠 Property listings and search
- 💬 Real-time messaging
- 📱 Responsive design
- 🎨 Modern UI with shadcn/ui components
- 🗄️ Database with Drizzle ORM
- ☁️ File uploads with AWS S3

## Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: JWT with bcrypt
- **File Storage**: AWS S3
- **State Management**: TanStack Query
- **Real-time**: Socket.io

## Getting Started

### Prerequisites

- Node.js 18+ 
- PostgreSQL database
- AWS S3 bucket (for file uploads)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd PropertyHub
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env.local` file in the root directory:

```env
# Database
DATABASE_URL="your-database-url-here"

# JWT
JWT_SECRET="your-super-secret-jwt-key-change-in-production"

# AWS S3
AWS_ACCESS_KEY_ID="your-aws-access-key"
AWS_SECRET_ACCESS_KEY="your-aws-secret-key"
AWS_REGION="your-aws-region"
S3_BUCKET_NAME="your-s3-bucket-name"

# Next.js
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-nextauth-secret"
```

4. Set up the database:
```bash
npm run db:generate
npm run db:migrate
```

5. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

```
src/
├── app/                    # Next.js app router
│   ├── api/               # API routes
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── layout/           # Layout components
│   ├── pages/            # Page components
│   ├── property/         # Property-related components
│   └── ui/               # UI components (shadcn/ui)
├── hooks/                # Custom React hooks
├── lib/                  # Utility libraries
│   ├── auth.ts           # Authentication utilities
│   ├── db.ts             # Database configuration
│   ├── storage.ts        # Database operations
│   └── s3.ts             # S3 file upload utilities
└── middleware.ts         # Next.js middleware
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run db:generate` - Generate database migrations
- `npm run db:migrate` - Run database migrations
- `npm run db:studio` - Open Drizzle Studio

## API Routes

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/user` - Get current user
- `GET /api/properties` - Get properties with filters
- `POST /api/properties` - Create new property
- `GET /api/properties/[id]` - Get property by ID
- `PUT /api/properties/[id]` - Update property
- `DELETE /api/properties/[id]` - Delete property

## Deployment

The project is configured for deployment on Vercel. Simply connect your repository to Vercel and set up the environment variables.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request