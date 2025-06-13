import {test, beforeAll, afterAll, expect, beforeEach} from 'vitest'
import supertest from 'supertest'
import * as http from 'http'
import * as db from './db'
import app from '../src/app'
import { enforcementloginAs } from './check.test'


let server : http.Server<
typeof http.IncomingMessage,
typeof http.ServerResponse>

beforeAll( async()=>{
    server = http.createServer(app)
    server.listen()
    return db.reset()
})

afterAll(()=>{
     //db.shutdown()
     server.close()
})
beforeEach(async () => {

  return db.reset()
})
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

async function adminloginAs(member: { email: any; password: any }): Promise<string | undefined> {
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
    export async function badenforcementloginAs(member: { email: string}): Promise<string |undefined> {
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
test("admin suspends enforcer", async()=>{
    const token = await adminloginAs(anna)

    await supertest(server)
        .post('/api/v0/suspend-enforcer')
        .set('Authorization', `Bearer ${token}`)
        .send({ id: '60dd71da-4879-4257-808d-58a90c74b632', suspend: true })
        .expect(200)
    })
test("malformed request", async()=>{
        const token = await adminloginAs(anna)
    
        await supertest(server)
            .post('/api/v0/suspend-enforcer')
            .set('Authorization', `Bearer ${token}`)
            .send({ ifnjed: '60dd71da-4879-4257-808d-58a90c74b632', suspend: true })
            .expect(400)
        

        const token2 = await badenforcementloginAs(ethan)
        await supertest(server)
        .post('/api/v0/suspend-enforcer')
        .set('Authorization', `Bearer ${token}`)
        .send({ ifnjed: '60dd71da-4879-4257-808d-58a90c74b632', suspend: false })
        .expect(400)

})


test("admin suspends enforcer and enforcer cannot log in", async()=>{
  const token = await adminloginAs(anna)

  await supertest(server)
      .post('/api/v0/suspend-enforcer')
      .set('Authorization', `Bearer ${token}`)
      .send({ id: '60dd71da-4879-4257-808d-58a90c74b632', suspend: true })
      .expect(200)
  


  let accessToken
  await supertest(server)
          .post('/api/v0/enforcement-login')
          .send({
            email: 'ethan@books.com',
            password: "ethanenforcement"
          })
          .expect(401)
          .then((res) =>{
            accessToken = res.body.accessToken
          })
          return accessToken
      
    
  })



  test("admin suspends driver and driver cannot log in", async()=>{
    const token = await adminloginAs(anna)
  
    await supertest(server)
        .post('/api/v0/suspend-driver')
        .set('Authorization', `Bearer ${token}`)
        .send({ id: '10ff51da-4879-4257-808d-58a90c74b632', suspend: true })
        .expect(200)
    
  
  
    let accessToken
    await supertest(server)
            .post('/api/v0/driver-login')
            .send({
              email: 'molly@books.com',
              password: "mollymember"
            })
            .expect(401)
            .then((res) =>{
              accessToken = res.body.accessToken
            })
            return accessToken
        
      
    })
  
  