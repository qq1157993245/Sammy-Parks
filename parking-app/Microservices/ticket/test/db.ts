import { Pool } from 'pg'
import * as fs from 'fs'
import path from 'path';

import dotenv from 'dotenv';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

if (!process.env.POSTGRES_DB_TICKET || process.env.POSTGRES_DB_TICKET === '') process.env.POSTGRES_DB_TICKET = 'test';
if (!process.env.POSTGRES_HOST) process.env.POSTGRES_HOST = 'localhost';
if (!process.env.POSTGRES_PORT) process.env.POSTGRES_PORT = '5434';

const pool = new Pool({
  host: process.env.POSTGRES_HOST || 'localhost',
  port: parseInt(process.env.POSTGRES_PORT || '5434', 10),
  database: process.env.POSTGRES_DB_TICKET || 'test',
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
});

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
  await run('sql/data.sql')
}

const shutdown = () => {
  pool.end()
}

export { reset, shutdown }
