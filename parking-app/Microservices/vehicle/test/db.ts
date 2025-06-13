import { Pool } from 'pg'
import path from 'path'
import * as fs from 'fs'

import dotenv from 'dotenv'

dotenv.config({ path: path.resolve(__dirname, '../.env') });

if (!process.env.POSTGRES_DB_VEHICLE) process.env.POSTGRES_DB_VEHICLE = 'test';
if (!process.env.POSTGRES_HOST) process.env.POSTGRES_HOST = 'localhost';
if (!process.env.POSTGRES_PORT) process.env.POSTGRES_PORT = '5435';

const pool = new Pool({
  host: process.env.POSTGRES_HOST || 'localhost',
  port: parseInt(process.env.POSTGRES_PORT || '5435', 10),
  database: process.env.POSTGRES_DB_VEHICLE,
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
})

const run = async (file: string) => {
  const content = fs.readFileSync(file, 'utf8')
  const lines = content.split(/\r?\n/)
  let statement = ''
  for (let line of lines) {
    line = line.trim()
    if (!line.startsWith('--')) {
      statement += ' ' + line + '\n'
      if (line.endsWith(';')) {
        await pool.query(statement)
        statement = ''
      }
    }
  }
}

const reset = async () => {
  await run('sql/schema.sql')
}

const shutdown = () => {
  pool.end()
}

export { reset, shutdown }
