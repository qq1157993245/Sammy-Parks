import * as jwt from "jsonwebtoken"

import {SessionUser, SessionoauthUser} from '../express/index'
import {Credentials, Authenticated, SignUpCredentials} from '..'
import { findbyiddriver, finduseremaildriver, updateDriverSuspended, getAllDrivers, findoauth, signup, acceptterms, checkterms, declineterms} from "./authdb"
import { findbyidadmin } from "../admin-auth/authdb"
import { findbyidenforcement } from "../enforcement-auth/authdb"
import {DriverSummary} from '..'


export class AuthService {
  public async driverlogin(credentials: Credentials): Promise<Authenticated|undefined>  {
    const user = await finduseremaildriver(credentials.email, credentials.password)

    if (user?.suspended === true) {
      return undefined; // triggers 401 in the controller
    }

    if (user) {
      const accessToken = jwt.sign({id: user.id, roles: 'driver'},
        `${process.env.MASTER_SECRET}`, {
          expiresIn: '30m',
          algorithm: 'HS256'
        })
      // console.log(accessToken)
      return {name: user.name, accessToken: accessToken}
    } else {
      return undefined
    }
  }
  public async driveroauthlogin(oauth: string, email:string, name: string): Promise<SessionoauthUser|undefined>  {
    const user = await findoauth(oauth, email, name)

    if (user?.suspended === true) {
      return undefined; // triggers 401 in the controller
    }

    if (user) {
      /*const accessToken = jwt.sign({id: user.id, roles: 'driver'},
        `${process.env.MASTER_SECRET}`, {
          expiresIn: '30m',
          algorithm: 'HS256'
        }) */
      return {id: user.id}
    } else {
      return undefined
    }
  }

      /* suspend accounts*/

  public async setSuspended(id: string, suspend: boolean): Promise<void> {
    await updateDriverSuspended(id, suspend);
  }

  public async listDrivers(): Promise<DriverSummary[]> {
    return await getAllDrivers();
  }




  public async check(authHeader?: string, scopes?: string[]): Promise<SessionUser>{
    return new Promise((resolve, reject) => {
        if (!authHeader){
            reject (new Error("Unauthorized"))
        }
        else{
            const token = authHeader.split(' ')[1]
            jwt.verify(token,`${process.env.MASTER_SECRET}`,
        async (err: jwt.VerifyErrors | null, decoded?: object | string) => {
            const uid = decoded as SessionUser
            if (err){
              console.log(err)
                reject(err)
            } else{

              let user;
              if (uid.roles.includes('driver')) {
                user = await findbyiddriver(uid.id)
              } else if (uid.roles.includes('admin')) {
                user = await findbyidadmin(uid.id)
              }
              else if (uid.roles.includes('enforcement')) {
                user = await findbyidenforcement(uid.id)
              }
              if (user) {
                if (scopes) {
                  for (const scope of scopes) {
                    if (!user.roles || !user.roles.includes(scope)) {
                      reject(new Error("Unauthorized"))
                      return;
                    }
                  }
                }
                resolve({id: user.id, roles: user.roles})
              }
              reject(new Error("Unauthorized"))
            }
        }
            )
        }
    })

}
  public async signup(signupcredentials:SignUpCredentials):Promise<Authenticated | null>{
    const user = await signup(signupcredentials)

    if (user) {
      const accessToken = jwt.sign({id: user.id, roles: 'driver'},
        `${process.env.MASTER_SECRET}`, {
          expiresIn: '30m',
          algorithm: 'HS256'
        })
      return {name: user.name, accessToken: accessToken} 
    } else {
      return null;
    }
  }

  public async acceptterms(id:string){
    return await acceptterms(id)
  }

  public async checkterms(id:string){
    return await checkterms(id)
  }

  public async declineterms(id:string){
    return await declineterms(id)
  }
}
