export type did = string;
export type ptid = string;
export type pid = string;
export type vid = string;
export type ztid = string;
export type int = number;
export type datetime = string;

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
