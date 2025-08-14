# Migration from Vite to Next.js

This project has been successfully migrated from Vite to Next.js.

## Key Changes Made

### 1. Project Structure

- **New**: `app/` directory for Next.js App Router
- **New**: `app/layout.tsx` - Root layout component
- **New**: `app/page.tsx` - Main page component
- **New**: `app/api/` - API routes for Next.js

### 2. Configuration Files

- **Updated**: `package.json` - Next.js scripts and dependencies
- **Updated**: `tsconfig.json` - Next.js TypeScript configuration
- **Updated**: `tailwind.config.js` - Next.js content paths
- **New**: `next.config.js` - Next.js configuration
- **New**: `.eslintrc.json` - Next.js ESLint configuration

### 3. API Routes

- **New**: `app/api/readability/route.ts` - Website readability endpoint

### 4. AI Integration

- Chat/assistant components and Vercel AI SDK usage have been removed in the reset

## Benefits of Next.js Migration

1. **Better AI SDK Integration**: Native support for Vercel AI SDK
2. **Streaming Responses**: Real-time chat responses with proper streaming
3. **API Routes**: Built-in API route handling
4. **Better Performance**: Next.js optimizations and caching
5. **Type Safety**: Improved TypeScript integration

## Setup Instructions

1. **Install Dependencies**:

   ```bash
   npm install
   ```

2. **Start Development Server**:

   ```bash
   npm run dev
   ```

3. **Build for Production**:

   ```bash
   npm run build
   npm start
   ```

## API Endpoints

- **Readability**: `GET /api/readability?url=<url>` - Website content extraction

## Environment Variables

Make sure your `.env.local` file includes:

```bash
OLLAMA_HOST=http://localhost:11434
```

## Local Ollama Setup

Ensure Ollama is running locally with the required model:

```bash
ollama pull llama3.2:3b-instruct-q4_K_M
ollama serve
```

## Migration Notes

- All existing components have been preserved
- Chat functionality now uses Vercel AI SDK streaming
- API routes are now Next.js API routes instead of Express
- TypeScript configuration optimized for Next.js
- Tailwind CSS configuration updated for Next.js paths
