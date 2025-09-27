import sql from 'mssql';

const config: sql.config = {
  user: process.env.DB_USER || 'sa',
  password: process.env.DB_PASSWORD || 'YourPassword123',
  server: process.env.DB_SERVER || 'localhost',
  database: process.env.DB_DATABASE || 'stsm_mains',
  port: parseInt(process.env.DB_PORT || '1433'),
  options: {
    encrypt: process.env.DB_ENCRYPT === 'true', // Use encryption for Azure
    trustServerCertificate: process.env.DB_TRUST_CERT !== 'false', // Trust self-signed certificates
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000
  }
};

let pool: sql.ConnectionPool;

export const getConnection = async (): Promise<sql.ConnectionPool> => {
  if (!pool) {
    pool = new sql.ConnectionPool(config);
    await pool.connect();
  }
  return pool;
};

export default { getConnection };
