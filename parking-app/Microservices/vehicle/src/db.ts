import { Pool } from 'pg';
import dotenv from 'dotenv'
import path from 'path'

if (process.env.NODE_ENV == 'production') {
  dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
} else {
  dotenv.config({ path: path.resolve(__dirname, '../.env') });
}

const pool = new Pool({
  host: process.env.POSTGRES_HOST || 'localhost',
  port: +(process.env.POSTGRES_PORT || 5435),
  database: process.env.POSTGRES_DB_VEHICLE,
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
})
console.log(pool)
export { pool }
