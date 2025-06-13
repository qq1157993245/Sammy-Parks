import {IsEmail} from 'class-validator'

export interface Credentials {
  email: string;
  password: string;
}
export type JWT = string;
export interface Authenticated {
  name: string;
  accessToken: JWT;
}

export interface Member {
  id: string;
  name: string;
  email: string;
  pwhash: string;
  roles: string[];
  suspended?: boolean;
}

export interface DriverSummary {
  id: string;
  name: string;
  email: string;
  suspended: boolean;
}

export interface EnforcerSummary {
  id: string;
  name: string;
  email: string;
  suspended: boolean;
}

export interface SignUpCredentials{
  name: string;
  email: string;
  password: string
} 
export class signupvalidations{
  name!: string;


  @IsEmail()
  email!: string;
  password!: string
}

export interface ReturnedSignupCredentials{
  id: string;
  name: string;
  email: string;
  suspended: boolean;
  acceptedterms: boolean;
  pwhash: string,
}


export interface DriverMember {
  id: string;
  name: string;
  email: string;
  pwhash: string;
  roles: string[];
  suspended?: boolean;
  acceptedterms: boolean;
}