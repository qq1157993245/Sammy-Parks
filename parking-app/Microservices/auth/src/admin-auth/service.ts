import * as jwt from "jsonwebtoken"

import { Credentials, Authenticated } from '..'
import { finduseremailadmin } from "./authdb"

export class AdminAuthService {
  public async adminlogin(credentials: Credentials): Promise<Authenticated|undefined>  {
    const user = await finduseremailadmin(credentials.email, credentials.password)

    if (user) {
      const accessToken = jwt.sign({id: user.id, roles: 'admin'},
        `${process.env.MASTER_SECRET}`, {
          expiresIn: '30m',
          algorithm: 'HS256'
        })
      return {name: user.name, accessToken: accessToken}
    } else {
      return undefined
    }
  }


  /*public async admincheck(authHeader?: string, scopes?: string[]): Promise<SessionUser>{
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

              const user = await findbyidadmin(uid.id)
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
