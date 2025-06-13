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

export interface Member {
  email: string
  password: string
  name: string
}

export const molly = {
  email: 'molly@books.com',
  password: 'mollymember',
  name: "Molly Member"
}

export const ethan ={
  email: 'ethan@books.com',
  name: 'Ethan Enforcement',
  password: 'ethanenforcement'
}
export const badanna = {
    email: 'anna@books.com',
    password: 'lol',
    name: "Anna Admin"
  }

  export const anna = {
    email: 'anna@books.com',
    password: 'annaadmin',
    name: "Anna Admin"
  }

export async function enforcementloginAs(member: Member): Promise<string |undefined> {
  let accessToken
  await supertest(server)
    .post('/api/v0/enforcement-login')
    .send({
      email: member.email,
      password: member.password
    })
    .expect(200)
    .then((res) =>{
      accessToken = res.body.accessToken
    })
    return accessToken
}
export async function badenforcementloginAs(member: Member): Promise<string |undefined> {
  let accessToken
  await supertest(server)
    .post('/api/v0/enforcement-login')
    .send({
      email: member.email,
      password: "blah"
    })
    .expect(401)
    .then((res) =>{
      accessToken = res.body.accessToken
    })
    return accessToken
}

export async function driverloginAs(member: Member): Promise<string | undefined> {
  let accessToken
  await supertest(server)
    .post('/api/v0/driver-login')
    .send({
      email: member.email,
      password: member.password
    })
    .expect(200)
    .then((res) => {
      accessToken = res.body.accessToken
    })
  return accessToken
}
async function adminloginAs(member: Member): Promise<string | undefined> {
  let accessToken
  await supertest(server)
    .post('/api/v0/admin-login')
    .send({
      email: member.email,
      password: member.password
    })
    .expect(200)
    .then((res) => {
      accessToken = res.body.accessToken
    })
  return accessToken
}

export async function baddriverloginAs(member: Member): Promise<undefined> {
  let accessToken
  await supertest(server)
    .post('/api/v0/driver-login')
    .send({
      email: member.email,
      password: member.password
    })
    .expect(401)
}



test('check admin', async() =>{
  const token = await adminloginAs(anna)
  const check = await supertest(server)
    .get('/api/v0/check')
    .set('Authorization', `Bearer ${token}`)
    .send()
    .expect(200)
})


test('check enforcement', async() =>{
  const token = await enforcementloginAs(ethan)
  const check = await supertest(server)
    .get('/api/v0/check')
    .set('Authorization', `Bearer ${token}`)
    .send()
    .expect(200)
})

test('check driver ', async() =>{
  const token = await driverloginAs(molly)
  const check = await supertest(server)
    .get('/api/v0/check')
    .set('Authorization', `Bearer ${token}`)
    .send()
    .expect(200)
})



test('check bad', async() =>{
  const check = await supertest(server)
    .get('/api/v0/check')
    .set('Authorization', `Bearer fuheq`)
    .send()
    .expect(401)
})


