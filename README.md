# ICP Builder

A modern React/TypeScript application that generates Ideal Customer Profiles (ICPs) using AI analysis. Built with Next.js, tRPC, PostgreSQL, Redis, and Ollama for optimal performance and type safety.

## 🚀 Features

- **AI-Powered ICP Generation**: Uses Ollama LLM for intelligent customer profile creation
- **140+ ICP Templates**: Comprehensive library of B2B, B2C, and B2B2C customer profiles
- **Type-Safe API**: Full end-to-end type safety with tRPC
- **Redis Caching**: High-performance caching for companies, ICPs, and application state
- **PostgreSQL Database**: Robust data persistence with proper schema management
- **Single LLM Call Generation**: Efficient ICP generation with one call per profile
- **Company Management**: Create, update, and manage multiple companies
- **Campaign Design**: Design marketing campaigns based on generated ICPs
- **Modern UI**: Built with Radix UI primitives and Tailwind CSS
- **Docker Support**: Complete containerized setup for easy deployment

## 🏗️ Architecture

### Tech Stack

- **Frontend**: React 18, TypeScript, Next.js 14
- **Backend**: tRPC, Node.js
- **Database**: PostgreSQL 15
- **Cache**: Redis 7
- **AI**: Ollama (local LLM with llama3.2:3b-instruct-q4_K_M)
- **UI**: Radix UI, Tailwind CSS
- **State Management**: React Query + tRPC
- **Containerization**: Docker & Docker Compose

### Key Components

- **tRPC Routers**: Type-safe API endpoints for companies, ICPs, and data management
- **Redis Service**: Caching layer for performance optimization
- **AI Service**: Efficient ICP generation with single LLM call per profile
- **Database Layer**: PostgreSQL with proper schema and migrations
- **Ollama Integration**: Local LLM processing for privacy and performance

## 📦 Installation & Setup

### Prerequisites

- **Docker & Docker Compose** (recommended)
- **Node.js 18+** (for development)
- **Git**

### 🐳 Quick Start with Docker (Recommended)

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd icp
   ```

2. **Start all services with Docker**

   ```bash
   docker-compose up -d
   ```

3. **Download the LLM model** (required for ICP generation)

   ```bash
   docker exec icp_ollama ollama pull llama3.2:3b-instruct-q4_K_M
   ```

4. **Install Node.js dependencies**

   ```bash
   npm install
   ```

5. **Start the development server**

   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to `http://localhost:3000`

### 🔧 Manual Setup (Alternative)

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd icp
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up PostgreSQL**

   - Install PostgreSQL 15+
   - Create database: `icp_builder`
   - Create user: `icp_user` with password `P@ssw0rd123!`

4. **Set up Redis**

   - Install Redis 7+
   - Start Redis service

5. **Install Ollama**

   - Download from [ollama.ai](https://ollama.ai)
   - Pull the model: `ollama pull llama3.2:3b-instruct-q4_K_M`

6. **Configure environment**
   Create `.env.local`:

   ```env
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=icp_builder
   DB_USER=icp_user
   DB_PASSWORD=P@ssw0rd123!
   DB_SSL=false
   TEST_USER_ID=11111111-1111-1111-1111-111111111111
   OPENAI_BASE_URL=http://localhost:11434
   OPENAI_API_KEY=ollama
   OLLAMA_MODEL=llama3.2:3b-instruct-q4_K_M
   REDIS_URL=redis://localhost:6379
   ```

7. **Start the development server**

   ```bash
   npm run dev
   ```

## 🚀 Usage

### 1. Company Setup

1. Navigate to "ICP Generator" tab
2. Fill in your company information:
   - Company name and basic details
   - Industry and target market
   - Value proposition and offerings
   - Pricing model and competitive advantages
3. Click "Save" to store company data

### 2. ICP Generation

1. Select your company from the dropdown
2. Click "Generate ICPs"
3. Wait for AI processing (typically 30-60 seconds for 3 ICPs)
4. View generated profiles in "ICP Profiles" tab

### 3. ICP Analysis

Each generated ICP includes:

- **Customer Segments**: Target audience identification
- **Pain Points**: Key challenges and problems
- **Jobs to be Done**: What customers want to accomplish
- **Desired Outcomes**: Expected results and benefits
- **Buying Triggers**: Events that prompt purchases
- **Common Objections**: Potential sales barriers
- **Value Proposition**: Unique value alignment
- **Go-to-Market Strategy**: Channels, messages, and content ideas
- **Fit Scoring**: 0-100 score with ABM tiering

### 4. Campaign Design

1. Use generated ICPs to design targeted campaigns
2. Access campaign templates and ideas
3. Export campaign data for marketing tools

## 🔧 Development

### Project Structure

```text
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

- **Single LLM Call per ICP**: Efficient generation with one comprehensive prompt
- **140+ Template Library**: B2B, B2C, and B2B2C variations
- **Intelligent Selection**: AI-driven template selection based on company data
- **Robust Error Handling**: Fallback values and comprehensive error management

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
docker-compose logs      # View service logs
```

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

## 🔧 Configuration

### Environment Variables

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=icp_builder
DB_USER=icp_user
DB_PASSWORD=P@ssw0rd123!
DB_SSL=false

# Redis
REDIS_URL=redis://localhost:6379

# AI/LLM
OPENAI_BASE_URL=http://localhost:11434
OPENAI_API_KEY=ollama
OLLAMA_MODEL=llama3.2:3b-instruct-q4_K_M

# Development
TEST_USER_ID=11111111-1111-1111-1111-111111111111
NODE_ENV=development
```

### Docker Configuration

The `docker-compose.yml` includes:

- **PostgreSQL 15**: Database with persistent storage
- **Redis 7**: Caching layer
- **Ollama**: Local LLM server

## 🚨 Error Handling

The application follows strict error handling principles:

- **No Fallback Patterns**: Explicit error throwing instead of graceful degradation
- **Type Safety**: Full TypeScript coverage prevents runtime errors
- **Validation**: Zod schemas validate all inputs
- **Logging**: Comprehensive error logging for debugging
- **User Feedback**: Clear error messages and loading states

## 🔒 Security & Performance

- **Type Safety**: End-to-end type safety with tRPC
- **Input Validation**: Zod schema validation on all inputs
- **Caching**: Redis-based caching for improved performance
- **Database**: Prepared statements and proper indexing
- **Local AI**: All LLM processing happens locally with Ollama
- **No External APIs**: No data sent to external AI services

## 🐳 Docker Deployment

### Production Deployment

1. **Build the application**

   ```bash
   npm run build
   ```

2. **Start production services**

   ```bash
   docker-compose -f docker-compose.prod.yml up -d
   ```

3. **Access the application**
   Navigate to your server's IP address

### Docker Services

- **icp_postgres**: PostgreSQL database
- **icp_redis**: Redis cache
- **icp_ollama**: Local LLM server
- **icp_app**: Next.js application (development)

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

## 🎯 Performance Notes

- **ICP Generation**: 30-60 seconds for 3 ICPs
- **LLM Model**: 2GB llama3.2:3b-instruct-q4_K_M model
- **Memory Usage**: ~4GB RAM recommended for Docker setup
- **Storage**: ~5GB for Docker images and database

---
