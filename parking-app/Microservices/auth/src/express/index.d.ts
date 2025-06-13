/*
#######################################################################
#
# Copyright (C) 2025 David C. Harrison. All right reserved.
#
# You may not use, distribute, publish, or modify this code without
# the express written permission of the copyright holder.
#
#######################################################################
*/

export interface SessionUser {
  id: string
  roles: string[]
}

export interface SessionoauthUser {
  id: string
}
declare global {
  namespace Express {
    export interface Request {
      user?: SessionUser
    }
  }
}
export interface OAuthPayload {
  name: string,
  id: string,
  email:string
}

