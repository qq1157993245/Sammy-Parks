import {test, beforeAll, afterAll, expect} from 'vitest'
import supertest from 'supertest'
import * as http from 'http'

import * as db from './db'
import app from '../src/app'

let server: http.Server<
  typeof http.IncomingMessage,
  typeof http.ServerResponse
>

beforeAll(async () => {
  server = http.createServer(app)
  server.listen()
  return db.reset()
})

afterAll(() => {
  //db.shutdown()
  server.close()
})

test('swagger UI HTML loads', async () => {
    const res = await supertest(app).get('/api/v0/docs/')
    expect(res.status).toBe(200)
    expect(res.text).toContain('<!DOCTYPE html>') 
  })
  
  