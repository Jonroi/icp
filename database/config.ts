import { Pool, PoolConfig } from 'pg';

export interface DatabaseConfig {
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
  ssl?: boolean;
  max?: number;
  idleTimeoutMillis?: number;
  connectionTimeoutMillis?: number;
}

export class DatabaseManager {
  private static instance: DatabaseManager;
  private pool: Pool | null = null;
  private isInitialized = false;

  private constructor() {}

  static getInstance(): DatabaseManager {
    if (!DatabaseManager.instance) {
      DatabaseManager.instance = new DatabaseManager();
    }
    return DatabaseManager.instance;
  }

  /**
   * Initialize database connection
   */
  async initialize(config: DatabaseConfig): Promise<void> {
    if (this.isInitialized && this.pool) {
      return;
    }

    const poolConfig: PoolConfig = {
      host: config.host,
      port: config.port,
      database: config.database,
      user: config.user,
      password: config.password,
      ssl: config.ssl || false,
      max: config.max || 20,
      idleTimeoutMillis: config.idleTimeoutMillis || 30000,
      connectionTimeoutMillis: config.connectionTimeoutMillis || 2000,
    };

    this.pool = new Pool(poolConfig);

    // Test the connection
    try {
      const client = await this.pool.connect();
      console.log('✅ PostgreSQL connection established');
      client.release();
      this.isInitialized = true;
    } catch (error) {
      console.error('❌ Failed to connect to PostgreSQL:', error);
      this.pool = null;
      this.isInitialized = false;
      throw error;
    }
  }

  /**
   * Get database pool
   */
  getPool(): Pool {
    if (!this.pool) {
      throw new Error('Database not initialized. Call initialize() first.');
    }
    return this.pool;
  }

  /**
   * Close database connection
   */
  async close(): Promise<void> {
    if (this.pool) {
      await this.pool.end();
      this.pool = null;
      this.isInitialized = false;
      console.log('✅ Database connection closed');
    }
  }

  /**
   * Run a query with parameters
   */
  async query(text: string, params?: any[]): Promise<any> {
    if (!this.pool || !this.isInitialized) {
      throw new Error('Database not initialized');
    }

    try {
      return await this.pool.query(text, params);
    } catch (error) {
      console.error('Database query error:', error);
      throw error;
    }
  }

  /**
   * Get a client from the pool
   */
  async getClient(): Promise<any> {
    if (!this.pool || !this.isInitialized) {
      throw new Error('Database not initialized');
    }
    return this.pool.connect();
  }

  /**
   * Check if database is initialized
   */
  isReady(): boolean {
    return this.isInitialized && this.pool !== null;
  }
}

// Environment-based configuration
export function getDatabaseConfig(): DatabaseConfig {
  return {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'icp_builder',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
    ssl: process.env.DB_SSL === 'true',
    max: parseInt(process.env.DB_MAX_CONNECTIONS || '20'),
    idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT || '30000'),
    connectionTimeoutMillis: parseInt(
      process.env.DB_CONNECTION_TIMEOUT || '2000',
    ),
  };
}

// Migration utilities
export class DatabaseMigration {
  private db: DatabaseManager;

  constructor() {
    this.db = DatabaseManager.getInstance();
  }

  /**
   * Run database migrations
   */
  async runMigrations(): Promise<void> {
    const client = await this.db.getClient();
    try {
      // Check if database is already initialized with v4 schema
      const checkResult = await client.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.columns 
          WHERE table_schema = 'public' 
          AND table_name = 'companies'
          AND column_name = 'id'
          AND data_type = 'integer'
        );
      `);

      if (checkResult.rows[0].exists) {
        console.log(
          '✅ Database already initialized with v4 schema, skipping migrations',
        );
        return;
      }

      // Serialize migrations across concurrent requests using an advisory lock
      const LOCK_KEY = 792347923; // arbitrary app-specific key
      await client.query('SELECT pg_advisory_lock($1)', [LOCK_KEY]);
      await client.query('BEGIN');

      // Read and execute schema-v4.sql
      const fs = require('fs').promises;
      const path = require('path');
      let schemaPath = path.join(__dirname, 'schema-v4.sql');
      try {
        await fs.access(schemaPath);
      } catch (_) {
        // Fallback to repository path during Next.js runtime
        schemaPath = path.join(process.cwd(), 'database', 'schema-v4.sql');
      }
      const schema = await fs.readFile(schemaPath, 'utf-8');

      // Execute full schema in one go to preserve function bodies and triggers
      await client.query(schema);

      await client.query('COMMIT');
      console.log('✅ Database migrations completed successfully');
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('❌ Database migration failed:', error);
      throw error;
    } finally {
      try {
        const LOCK_KEY = 792347923;
        await client.query('SELECT pg_advisory_unlock($1)', [LOCK_KEY]);
      } catch (_) {}
      client.release();
    }
  }

  /**
   * Check if database is ready
   */
  async checkConnection(): Promise<boolean> {
    try {
      const result = await this.db.query('SELECT NOW()');
      return result.rows.length > 0;
    } catch (error) {
      console.error('Database connection check failed:', error);
      return false;
    }
  }
}

// Export singleton instance
export const databaseManager = DatabaseManager.getInstance();
