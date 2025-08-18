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

2. **Install Node.js dependencies**

   ```bash
   npm install
   ```

3. **Start everything with one command**

   ```bash
   npm run dev:services
   ```

   This command will:

   - Start PostgreSQL database
   - Start Redis cache
   - Start Ollama AI service
   - Download the required LLM model
   - Start the Next.js development server

4. **Open your browser**
   Navigate to `http://localhost:3000`

### Alternative Docker Commands

```bash
# Start only database services (no AI)
npm run dev:docker

# Start all services manually
npm run docker:up && npm run dev

# Start services and download model separately
npm run docker:up
docker exec icp_ollama ollama pull llama3.2:3b-instruct-q4_K_M
npm run dev
```

### 🔧 Manual Setup (Alternative)

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd icp
   ```

2. **Set up environment variables**

   ```bash
   # Copy the example environment file
   cp .env.example .env.local

   # Edit .env.local with your actual values
   # IMPORTANT: Never commit .env.local to git!
   ```

3. **Install dependencies**

   ```bash
   npm install
   ```

   ```

   ```

4. **Install dependencies**

   ```bash
   npm install
   ```

5. **Set up PostgreSQL**

   - Install PostgreSQL 15+
   - Create database: `icp_builder`
     - Create user: `icp_user` with password `your_secure_password_here`

6. **Set up Redis**

   - Install Redis 7+
   - Start Redis service

7. **Install Ollama**

   - Download from [ollama.ai](https://ollama.ai)
   - Pull the model: `ollama pull llama3.2:3b-instruct-q4_K_M`

8. **Configure environment**
   Create `.env.local`:

   ```env
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=icp_builder
   DB_USER=icp_user
       DB_PASSWORD=your_secure_password_here
   DB_SSL=false
   TEST_USER_ID=11111111-1111-1111-1111-111111111111
   OPENAI_BASE_URL=http://localhost:11434
       OPENAI_API_KEY=your_openai_api_key_here
   OLLAMA_MODEL=llama3.2:3b-instruct-q4_K_M
   REDIS_URL=redis://localhost:6379
   ```

9. **Start the development server**

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

# Docker Development (Recommended)
npm run dev:full         # Start all Docker services + dev server
npm run dev:docker       # Start PostgreSQL + Redis + dev server
npm run dev:services     # Start PostgreSQL + Redis + Ollama + dev server

# Manual Docker Commands
npm run docker:up        # Start all Docker services
npm run docker:down      # Stop all Docker services
npm run docker:logs      # View service logs

# Database
npm run db:migrate       # Run database migrations
npm run db:seed          # Seed database with sample data

# Type checking
npm run type-check       # Run TypeScript type checking
npm run lint             # Run ESLint
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

**⚠️ Security Warning**: Never commit `.env.local` to git! Use `.env.example` as a template.

```bash
# Copy the example file and edit with your values
cp .env.example .env.local
```

**Required Variables**:

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=icp_builder
DB_USER=icp_user
DB_PASSWORD=your_secure_password_here
DB_SSL=false

# Redis
REDIS_URL=redis://localhost:6379

# AI/LLM
OPENAI_BASE_URL=http://localhost:11434
OPENAI_API_KEY=your_openai_api_key_here
OLLAMA_MODEL=llama3.2:3b-instruct-q4_K_M

# External APIs
VITE_APIFY_API_TOKEN=your_apify_api_token_here

# Development
TEST_USER_ID=11111111-1111-1111-1111-111111111111
NODE_ENV=development

# Docker PostgreSQL
POSTGRES_PASSWORD=your_secure_postgres_password_here
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
- **Environment Security**: Sensitive data stored in `.env.local` (not committed to git)
- **API Key Protection**: All API keys and passwords in environment variables

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
