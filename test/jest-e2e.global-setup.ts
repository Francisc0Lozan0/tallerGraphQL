import { Client } from 'pg';

module.exports = async () => {
  process.env.NODE_ENV = 'test';
  process.env.DB_HOST = process.env.DB_HOST || 'localhost';
  process.env.DB_PORT = process.env.DB_PORT || '5432';
  process.env.DB_USERNAME = process.env.DB_USERNAME || 'postgres';
  process.env.DB_PASSWORD = process.env.DB_PASSWORD || 'postgres';
  process.env.DB_NAME = process.env.DB_NAME || 'alacena_test';
  process.env.DB_SSL = process.env.DB_SSL || 'false';
  process.env.JWT_SECRET =
    process.env.JWT_SECRET || 'test_jwt_secret_change_me';

  const adminClient = new Client({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: 'postgres',
    ssl: false,
  });

  await adminClient.connect();

  const result = await adminClient.query(
    'SELECT 1 FROM pg_database WHERE datname = $1',
    [process.env.DB_NAME],
  );

  if (result.rowCount === 0) {
    await adminClient.query(`CREATE DATABASE ${process.env.DB_NAME}`);
  }

  await adminClient.end();
};
