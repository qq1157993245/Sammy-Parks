import * as jwt from "jsonwebtoken"

import {Credentials, Authenticated} from '..'
import { finduseremailenforcement, updateEnforcerSuspended, getAllEnforcers } from "./authdb"
import { EnforcerSummary } from ".."

export class EnforceAuthService {
  public async enforcementlogin(credentials: Credentials): Promise<Authenticated|undefined>  {
    const user = await finduseremailenforcement(credentials.email, credentials.password)

    if (user?.suspended === true) {
      return undefined; // triggers 401 in the controller
    }

    if (user) {
      const accessToken = jwt.sign({id: user.id, roles: 'enforcement'},
        `${process.env.MASTER_SECRET}`, {
          expiresIn: '30m',
          algorithm: 'HS256'
        })
      return {name: user.name, accessToken: accessToken}
    } else {
      return undefined
    }
  }

  public async setSuspended(id: string, suspend: boolean): Promise<void> {
      await updateEnforcerSuspended(id, suspend);
    }
  
    public async listEnforcers(): Promise<EnforcerSummary[]> {
      return await getAllEnforcers();
    }

  /*public async enforcementcheck(authHeader?: string, scopes?: string[]): Promise<SessionUser>{
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
                reject(err)
            } else{
             
              const user = await findbyidenforcement(uid.id)
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
}*/
}
