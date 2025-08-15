# ICP Builder

A modern React/TypeScript application that generates Ideal Customer Profiles (ICPs) using AI analysis. Built with Next.js, tRPC, PostgreSQL, and Redis for optimal performance and type safety.

## 🚀 Features

- **AI-Powered ICP Generation**: Uses Ollama LLM for intelligent customer profile creation
- **Type-Safe API**: Full end-to-end type safety with tRPC
- **Redis Caching**: High-performance caching for companies, ICPs, and application state
- **PostgreSQL Database**: Robust data persistence with proper schema management
- **Step-by-Step Generation**: Reliable AI response parsing with individual component generation
- **Company Management**: Create, update, and manage multiple companies
- **Campaign Design**: Design marketing campaigns based on generated ICPs
- **Modern UI**: Built with Radix UI primitives and Tailwind CSS

## 🏗️ Architecture

### Tech Stack

- **Frontend**: React 18, TypeScript, Next.js 14
- **Backend**: tRPC, Node.js
- **Database**: PostgreSQL 15
- **Cache**: Redis 7
- **AI**: Ollama (local LLM)
- **UI**: Radix UI, Tailwind CSS
- **State Management**: React Query + tRPC

### Key Components

- **tRPC Routers**: Type-safe API endpoints for companies, ICPs, and data management
- **Redis Service**: Caching layer for performance optimization
- **AI Service**: Step-by-step ICP generation with robust error handling
- **Database Layer**: PostgreSQL with proper schema and migrations

## 📦 Installation

### Prerequisites

- Node.js 18+
- Docker & Docker Compose
- PostgreSQL (or use Docker)
- Redis (or use Docker)

### Quick Start with Docker

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd icp
   ```

2. **Start infrastructure services**

   ```bash
   docker-compose up -d postgres redis
   ```

3. **Install dependencies**

   ```bash
   npm install
   ```

4. **Set up environment variables**
   Create `.env.local`:

   ```env
   DATABASE_URL=postgresql://icp_user:icp_password@localhost:5432/icp_builder
   REDIS_URL=redis://localhost:6379
   NODE_ENV=development
   ```

5. **Run database migrations**

   ```bash
   npm run db:migrate
   ```

6. **Start the development server**
   ```bash
   npm run dev
   ```

### Manual Setup

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Set up PostgreSQL**

   - Create database: `icp_builder`
   - Run schema: `database/schema.sql`

3. **Set up Redis**

   - Install Redis locally or use cloud service
   - Update `REDIS_URL` in environment variables

4. **Start development server**
   ```bash
   npm run dev
   ```

## 🔧 Development

### Project Structure

```
src/
├── components/          # React components
│   ├── icp/            # ICP-related components
│   ├── campaign/       # Campaign components
│   ├── ui/             # Reusable UI components
│   └── providers/      # Context providers
├── server/             # tRPC server
│   ├── routers/        # API route handlers
│   └── trpc.ts         # tRPC configuration
├── services/           # Business logic
│   ├── ai/             # AI/LLM services
│   └── redis-service.ts # Redis caching
├── hooks/              # Custom React hooks
└── lib/                # Utilities and configurations
```

### Key Features

#### tRPC API Endpoints

- `company.*` - Company management (CRUD operations)
- `companyData.*` - Form data management
- `icp.*` - ICP generation and management

#### Redis Caching Strategy

- **Company Cache**: 1-hour TTL for company data
- **ICP Cache**: 2-hour TTL for generated profiles
- **State Cache**: 24-hour TTL for application state
- **Session Cache**: 30-minute TTL for user sessions

#### AI Processing

- **Step-by-Step Generation**: Individual ICP components generated separately
- **Robust Error Handling**: No fallback patterns, explicit error throwing
- **Type Safety**: Full TypeScript support throughout the pipeline

## 🚀 Usage

### 1. Company Setup

1. Navigate to "ICP Generator" tab
2. Fill in your company information
3. Save the company data

### 2. ICP Generation

1. Select your company from the dropdown
2. Click "Generate ICPs"
3. Wait for AI processing (typically 30-60 seconds)
4. View generated profiles in "ICP Profiles" tab

### 3. Campaign Design

1. Use generated ICPs to design targeted campaigns
2. Access campaign templates and ideas
3. Export campaign data

## 🔍 API Documentation

### Company Endpoints

```typescript
// List all companies
trpc.company.list.query();

// Get company by ID
trpc.company.getById.query({ id: string });

// Create company
trpc.company.create.mutate(companyData);

// Update company field
trpc.company.updateField.mutate({ id, field, value });

// Delete company
trpc.company.delete.mutate({ id: string });
```

### ICP Endpoints

```typescript
// Generate ICPs
trpc.icp.generate.mutate({ companyId: string });

// Get ICPs by company
trpc.icp.getByCompany.query({ companyId: string });

// Get all ICPs (active company)
trpc.icp.getAll.query();

// Generate more ICPs
trpc.icp.generateMore.mutate({ companyId: string });
```

## 🛠️ Development Commands

```bash
# Development
npm run dev              # Start development server
npm run build            # Build for production
npm run start            # Start production server

# Database
npm run db:migrate       # Run database migrations
npm run db:seed          # Seed database with sample data

# Type checking
npm run type-check       # Run TypeScript type checking
npm run lint             # Run ESLint

# Docker
docker-compose up -d     # Start all services
docker-compose down      # Stop all services
```

## 🔧 Configuration

### Environment Variables

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/icp_builder

# Redis
REDIS_URL=redis://localhost:6379

# Development
NODE_ENV=development
```

### Redis Configuration

- **Default TTL**: 1 hour for companies, 2 hours for ICPs
- **Persistence**: AOF (Append Only File) enabled
- **Connection**: Automatic retry with failover support

## 🚨 Error Handling

The application follows strict error handling principles:

- **No Fallback Patterns**: Explicit error throwing instead of graceful degradation
- **Type Safety**: Full TypeScript coverage prevents runtime errors
- **Validation**: Zod schemas validate all inputs
- **Logging**: Comprehensive error logging for debugging

## 🔒 Security & Performance

- **Type Safety**: End-to-end type safety with tRPC
- **Input Validation**: Zod schema validation on all inputs
- **Caching**: Redis-based caching for improved performance
- **Database**: Prepared statements and proper indexing
- **Error Handling**: No sensitive data in error messages

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:

- Check the documentation
- Review existing issues
- Create a new issue with detailed information

---

**Built with ❤️ using modern web technologies**
