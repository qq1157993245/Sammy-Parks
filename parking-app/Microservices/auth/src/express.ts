

import {Request} from "express"
import {AuthService} from './driver-auth/service'
import {SessionUser} from './express/index'


export function expressAuthentication(
 request: Request,
 securityName: string,
 scopes?: string[]
): Promise<SessionUser> {
 return new AuthService().check(request.headers.authorization, scopes)
}

