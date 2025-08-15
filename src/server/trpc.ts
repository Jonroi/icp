import { initTRPC } from '@trpc/server';
import { type CreateNextContextOptions } from '@trpc/server/adapters/next';
import { z } from 'zod';
import superjson from 'superjson';
import { redisService } from '@/services/redis-service';
import { databaseManager } from '../../database/config';

/**
 * 1. CONTEXT
 *
 * This section defines the "contexts" that are available in the backend API.
 */
interface CreateContextOptions {
  redis: typeof redisService;
  db: typeof databaseManager;
}

/**
 * This helper generates the "internals" for a tRPC context.
 */
const createInnerTRPCContext = (opts: CreateContextOptions) => {
  return {
    ...opts,
  };
};

/**
 * This is the actual context you will use in your router.
 */
export const createTRPCContext = async (opts: CreateNextContextOptions) => {
  const { req, res } = opts;

  return createInnerTRPCContext({
    redis: redisService,
    db: databaseManager,
  });
};

/**
 * 2. INITIALIZATION
 *
 * This is where the tRPC API is initialized, connecting the context and transformer.
 */
const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof z.ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

/**
 * 3. ROUTER & PROCEDURE
 *
 * These are the pieces you use to build your tRPC API.
 */

/**
 * This is how you create new routers and sub-routers in your tRPC API.
 */
export const createTRPCRouter = t.router;

/**
 * Public (unauthenticated) procedure
 *
 * This is the base piece you use to build new queries and mutations on your tRPC API.
 */
export const publicProcedure = t.procedure;
