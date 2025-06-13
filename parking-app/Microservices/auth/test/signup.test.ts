import {test, beforeAll, afterAll, expect, beforeEach} from 'vitest'
import supertest from 'supertest'
import * as http from 'http'

import * as db from './db'
import app from '../src/app'
import { Member } from '../src/api-auth'
import { enforcementloginAs } from './check.test'

let server: http.Server<
  typeof http.IncomingMessage,
  typeof http.ServerResponse
>

beforeAll(async () => {
  server = http.createServer(app)
  server.listen()
  return db.reset()
})
beforeEach(async () => {

    return db.reset()
  })

afterAll(() => {
  //db.shutdown()
  server.close()
})

export const Newtown = {
    email: 'newton@books.com',
    password: 'newtonnewmember',
    name: "New Newton"
  }
export async function signup(member):Promise<string>{
    let accessToken
    await supertest(server)
        .post('/api/v0/signup')
        .send(
            
member
              
        )
        .expect(200)
        .then((res)=>{
            accessToken = res.body.accessToken
        })
    return accessToken
}
export async function driverloginAs(member): Promise<string | undefined> {
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

test("signup", async() =>{
    return await signup(Newtown)
})

test("signup", async() =>{
     await signup(Newtown)
    const token = await driverloginAs(Newtown)



    await supertest(server)
        .get('/api/v0/check-terms')
        .set('Authorization', `Bearer ${token}`)
        .send()
        .expect(200)

})
test('Normal login combines with normal login', async () => {
    const hello = {
        email: 'helloworld@mail.com',
        password: 'helloworld',
        name: "Hello World"
      }
      await signup(hello)

    await supertest(server)
      .post('/api/v0/oauth-driver-login')
      .send({ id: '123456789012345678901' , email: "helloworld@mail.com", name:"Hello World"})
      .expect(200); 
    
  });
test("checking terms from new user, should be true since terms are accepted before sign in", async()=>{
    const hello = {
        email: 'helloworld@mail.com',
        password: 'helloworld',
        name: "Hello World"
      }
      await signup(hello)

    const token= await driverloginAs(hello)

    const response = await supertest(server)
      .get('/api/v0/check-terms')
      .set('Authorization', `Bearer ${token}`)
      .send()
      .expect(200)
    expect(response.body).toBe(true)
})
  
test("checking terms from new user, should be true since terms are accepted before sign in", async()=>{
    const borris = {
        email: 'borris@books.com',
        password: 'borris',
        name: "Borris Member"
      }

    const token= await driverloginAs(borris)

    const response = await supertest(server)
      .get('/api/v0/check-terms')
      .set('Authorization', `Bearer ${token}`)
      .send()
      .expect(200)
    expect(response.body).toBe(false)

    const accept = await supertest(server)
      .post('/api/v0/accept-terms')
      .set('Authorization', `Bearer ${token}`)
      .send()
      .expect(200)
    
    const response2 = await supertest(server)
      .get('/api/v0/check-terms')
      .set('Authorization', `Bearer ${token}`)
      .send()
      .expect(200)
    expect(response2.body).toBe(true)
})



test("checking terms from new user, should be true since terms are accepted before sign in", async()=>{
    const borris = {
        email: 'borris@books.com',
        password: 'borris',
        name: "Borris Member"
      }

    const token= await driverloginAs(borris)

    const response = await supertest(server)
      .get('/api/v0/check-terms')
      .set('Authorization', `Bearer ${token}`)
      .send()
      .expect(200)
    expect(response.body).toBe(false)

    const accept = await supertest(server)
      .post('/api/v0/decline-terms')
      .set('Authorization', `Bearer ${token}`)
      .send()
      .expect(200)

})


test("bad accept", async()=>{
    const ethan = {
        email: 'ethan@books.com',
        password: 'ethanenforcement',
        name: "Ethan Enforcement"
      }

    const token= await enforcementloginAs(ethan)



    const accept = await supertest(server)
      .post('/api/v0/accept-terms')
      .set('Authorization', `Bearer ${token}`)
      .send()
      .expect(200)
    

})