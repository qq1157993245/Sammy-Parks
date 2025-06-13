import {test, beforeAll, afterAll, expect, vi} from 'vitest'
import supertest from 'supertest'
import * as http from 'http'

import * as db from './db'
import app from '../src/app'
import { pool } from '../src/db'
import * as jwt from 'jsonwebtoken'
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
  db.shutdown()
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
export async function badadminloginAs(member: Member): Promise<undefined> {
  let accessToken
  await supertest(server)
    .post('/api/v0/admin-login')
    .send({
      email: member.email,
      password: "gurwehfioehgihwreiofhewioghirwohgiowrhguoerhgiorwhgiorwh"
    })
    .expect(401)
}

test('Molly logs in', async () => {
  const accessToken = await driverloginAs(molly)
})

test('Anna gets password wrong', async () => {
  const accessToken = await baddriverloginAs(badanna)
})


test('Anna gets password correct', async () => {
  const accessToken = await adminloginAs(anna)
})




test('Check session with valid token', async () => {
  const token = await driverloginAs(molly);
  await supertest(server)
    .get('/api/v0/check')
    .set('Authorization', `Bearer ${token}`)
    .expect(200)
    .then((res) => {
      expect(res.body.id);
    });
});



test('Get all drivers as admin', async () => {
  const adminToken = await adminloginAs(anna);
  await supertest(server)
    .get('/api/v0/drivers')
    .set('Authorization', `Bearer ${adminToken}`)
    .expect(200)
    .then((res) => {
      expect(Array.isArray(res.body)).toBe(true);
    });
});



test('Get all enforcers as admin', async () => {
  const adminToken = await adminloginAs(anna);
  await supertest(server)
    .get('/api/v0/Enforcers')
    .set('Authorization', `Bearer ${adminToken}`)
    .expect(200)
    .then((res) => {
      expect(Array.isArray(res.body)).toBe(true);
    });
});

test('Admin suspends driver', async () => {
  const token = await adminloginAs(anna)
  const driverRes = await supertest(server)
    .get('/api/v0/drivers')
    .set('Authorization', `Bearer ${token}`)
    .expect(200)
  const mollyDriver = driverRes.body.find((d: any) => d.email === molly.email)
  expect(mollyDriver).toBeDefined()

  await supertest(server)
    .post('/api/v0/suspend-driver')
    .set('Authorization', `Bearer ${token}`)
    .send({ id: mollyDriver.id, suspend: true }) 
    .expect(200)
})

test('Enforcement logs in', async() =>{
  const token = await enforcementloginAs(ethan)

})

test('Enforcement incorrectly tries to log in', async() =>{
  const token = await badenforcementloginAs(ethan)

})

test('Admin gets all enforcers', async() => {
  const token = await adminloginAs(anna)
  const enforceRes = await supertest(server)
    .get('/api/v0/Enforcers')
    .set('Authorization', `Bearer ${token}`)
    .send()
    .expect(200)
})


test('check', async() =>{
  const token = await adminloginAs(anna)
  const check = await supertest(server)
    .get('/api/v0/check')
    .set('Authorization', `Bearer ${token}`)
    .send()
    .expect(200)
})

test("bad admin login", async() =>{
  const token = await badadminloginAs(anna)
})




test('OAuth login creates user if ID does not exist', async () => {
  await supertest(server)
    .post('/api/v0/oauth-driver-login')
    .send({ id: '123456789012345678901' , email: "helloworld@mail.com", name:"Hello World"})
    .expect(200); 
  await supertest(server)
    .post('/api/v0/oauth-driver-login')
    .send({ id: '123456789012345678901' , email: "helloworld@mail.com", name:"Hello World"})
    .expect(200); 
});


test('OAuth login creates user if ID does not exist', async () => {
  await supertest(server)
    .post('/api/v0/oauth-driver-login')
    .send({ id: 809 , email: "helloworld@mail.com", name:"Hello World"})
    .expect(400); 

});

const validAdmin = {
  email: 'anna@books.com',
  password: 'annaadmin',
}

test('admin login fails for unknown email', async () => {
  await supertest(server)
    .post('/api/v0/admin-login')
    .send({ email: 'doesnotexist@books.com', password: 'irrelevant' })
    .expect(401)
})

test('admin login fails for wrong password', async () => {
  await supertest(server)
    .post('/api/v0/admin-login')
    .send({ email: validAdmin.email, password: 'wrongpassword' })
    .expect(401)
})




test('admin login handles DB error in finduseremailadmin', async () => {
  const spy = vi.spyOn(pool, 'query').mockRejectedValueOnce(new Error('Forced DB error'))

  await supertest(server)
    .post('/api/v0/admin-login')
    .send(validAdmin)
    .expect(500)

  spy.mockRestore()
})










