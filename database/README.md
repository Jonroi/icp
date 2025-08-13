# Database Setup for ICP Builder

This directory contains the PostgreSQL database setup for the ICP Builder application.

## 🗄️ Database Schema

The application uses PostgreSQL with the following main tables:

- **`users`** - User authentication and profiles
- **`company_data`** - Individual company field values (key-value pairs)
- **`icp_profiles`** - Generated Ideal Customer Profiles
- **`campaigns`** - Marketing campaigns (future feature)

## 🚀 Quick Setup

### 1. Install PostgreSQL

**Windows:**

```bash
# Download from https://www.postgresql.org/download/windows/
# Or use Chocolatey:
choco install postgresql
```

**macOS:**

```bash
# Using Homebrew:
brew install postgresql
brew services start postgresql
```

**Linux (Ubuntu/Debian):**

```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### 2. Create Database

```bash
# Connect to PostgreSQL as superuser
sudo -u postgres psql

# Create database and user
CREATE DATABASE icp_builder;
CREATE USER icp_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE icp_builder TO icp_user;
\q
```

### 3. Run Schema Setup

```bash
# Connect to the database and run schema
psql -h localhost -U icp_user -d icp_builder -f database/schema.sql
```

### 4. Environment Variables

Create a `.env` file in your project root:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=icp_builder
DB_USER=icp_user
DB_PASSWORD=your_password
DB_SSL=false
DB_MAX_CONNECTIONS=20
DB_IDLE_TIMEOUT=30000
DB_CONNECTION_TIMEOUT=2000
```

## 📊 Database Structure

### Company Data Table

The `company_data` table uses a key-value structure for flexibility:

```sql
CREATE TABLE company_data (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    field_name VARCHAR(100),  -- e.g., 'name', 'location', 'industry'
    field_value TEXT,         -- The actual value
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    version INTEGER
);
```

**Benefits:**

- ✅ Easy to add new fields without schema changes
- ✅ Version tracking for each field
- ✅ Optimistic locking support
- ✅ Efficient querying with indexes

### Sample Data

The schema includes sample data for testing:

```sql
-- Test user
INSERT INTO users (id, email, name) VALUES
    ('test-user-123'::UUID, 'test@example.com', 'Test User');

-- Sample company data
INSERT INTO company_data (user_id, field_name, field_value) VALUES
    ('test-user-123'::UUID, 'name', 'Test Company'),
    ('test-user-123'::UUID, 'location', 'Test Location'),
    -- ... more fields
```

## 🔧 Database Utilities

### Migration System

```typescript
import { DatabaseMigration } from './database/config';

const migration = new DatabaseMigration();
await migration.runMigrations();
```

### Connection Management

```typescript
import { databaseManager, getDatabaseConfig } from './database/config';

// Initialize connection
await databaseManager.initialize(getDatabaseConfig());

// Run queries
const result = await databaseManager.query(
  'SELECT * FROM company_data WHERE user_id = $1',
  [userId],
);

// Close connection
await databaseManager.close();
```

## 🧪 Testing

### Test Database Connection

```bash
# Test connection
node -e "
const { databaseManager, getDatabaseConfig } = require('./database/config');
databaseManager.initialize(getDatabaseConfig())
  .then(() => console.log('✅ Database connected'))
  .catch(err => console.error('❌ Connection failed:', err))
  .finally(() => databaseManager.close());
"
```

### Test Data Operations

```bash
# Run the test script
node test-data-storage.js
```

## 🔄 Migration from File System

When you're ready to switch from file-based storage to PostgreSQL:

1. **Update the service:**

   ```typescript
   // In src/services/company-data-service.ts
   // Replace FileSystemCompanyDataService with PostgreSQLCompanyDataService
   ```

2. **Migrate existing data:**

   ```typescript
   // Use the DataManager to export file data
   const fileData = await DataManager.exportForICP();

   // Import to PostgreSQL
   await postgresService.importData(userId, fileData);
   ```

## 📈 Performance Considerations

### Indexes

The schema includes optimized indexes:

- `idx_company_data_user_id` - Fast user data retrieval
- `idx_company_data_field_name` - Field-specific queries
- `idx_company_data_updated_at` - Time-based queries

### Connection Pooling

The application uses connection pooling for better performance:

- **Max connections:** 20 (configurable)
- **Idle timeout:** 30 seconds
- **Connection timeout:** 2 seconds

### JSONB for Complex Data

ICP profiles and campaign data use JSONB for flexible schema:

```sql
-- ICP profiles with JSONB
CREATE TABLE icp_profiles (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    profile_data JSONB NOT NULL  -- Flexible ICP structure
);
```

## 🔒 Security

### Environment Variables

Never commit database credentials to version control:

```bash
# Add to .gitignore
.env
*.env
```

### Connection Security

- Use SSL in production
- Implement proper user authentication
- Use connection pooling to prevent DoS
- Regular database backups

## 🚀 Production Deployment

### Environment Setup

```bash
# Production environment variables
DB_HOST=your-production-host
DB_PORT=5432
DB_NAME=icp_builder_prod
DB_USER=icp_prod_user
DB_PASSWORD=secure_password
DB_SSL=true
```

### Backup Strategy

```bash
# Daily backups
pg_dump -h localhost -U icp_user -d icp_builder > backup_$(date +%Y%m%d).sql

# Restore
psql -h localhost -U icp_user -d icp_builder < backup_20240115.sql
```

## 📚 Additional Resources

- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Node.js pg Driver](https://node-postgres.com/)
- [Database Design Best Practices](https://www.postgresql.org/docs/current/ddl.html)
