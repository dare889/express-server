const { Pool } = require('pg');

// Create a new pool instance
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'expressdb',
  password: 'password',
  port: 5432, // Default PostgreSQL port
});

// Export the pool instance for use in other files
module.exports = pool;
