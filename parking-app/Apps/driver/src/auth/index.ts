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

export interface Credentials {
  name?: string,
  email: string,
  password: string,
  confirmPassword?: string
}

export interface Authenticated {
  name: string,
  accessToken: string
}

export interface User {
  name: string
}

export interface SessionUser {
  id: string
}

declare global {
// eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    export interface Request {
      user?: SessionUser
    }
  }
}
