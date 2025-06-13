export interface Credentials {
  email: string,
  password: string,
  roles: string[]
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