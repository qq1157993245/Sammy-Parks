
import {test, beforeAll, afterAll, expect} from 'vitest'
import supertest from 'supertest'
import * as http from 'http'

import app from '../src/app'

let server: http.Server<
  typeof http.IncomingMessage,
  typeof http.ServerResponse
>

beforeAll(async () => {
  server = http.createServer(app)
  server.listen()
})

afterAll(() => {
  server.close()
})


test('Fetch docs', async () => {
  await supertest(server)
    .post('/api/v0/docs')
    .expect(200)
})

test('Receieve 500 from negative amount', async () => {
  await supertest(server)
    .post('/api/v0/payment/create-session')
    .send({
      amount: -1000,
      currency: 'usd',
      productName: 'Test Product',
      url: 'https://example.com/return'
    })
    .expect(500)
})

test('Receieve 404 from no product name', async () => {
  await supertest(server)
    .post('/api/v0/payment/create-session')
    .send({
      amount: 1000,
      currency: 'usd',
      productName: '',
      url: 'https://example.com/return'
    })
    .expect(404)
})

test('Receieve 404 from bad url', async () => {
  await supertest(server)
    .post('/api/v0/payment/create-session')
    .send({
      amount: 1000,
      currency: 'usd',
      productName: 'Test Product',
      url: 'invalid-url'
    })
    .expect(404)
})

test('Receieve 201', async () => {
  await supertest(server)
    .post('/api/v0/payment/create-session')
    .send({
      amount: 1000,
      currency: 'usd',
      productName: 'Test Product',
      url: 'https://www.example.com/return?test=true'
    })
    .expect(201)
})

test('Returns client secret', async () => {
  await supertest(server)
    .post('/api/v0/payment/create-session')
    .send({
      amount: 1000,
      currency: 'usd',
      productName: 'Test Product',
      url: 'http://localhost:3050/driver/permits'
    })
    .then((res) => {
      expect(res.body.url).toBeDefined()
    })
})

