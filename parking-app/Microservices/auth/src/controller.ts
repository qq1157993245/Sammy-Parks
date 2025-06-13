
import {
  Body,
  Controller,
  Post,
  Get,
  Request,
  Response,
  Security,
  Route,
  Query,
  SuccessResponse
} from 'tsoa'

import * as express from 'express'

import { Credentials, Authenticated, signupvalidations } from '.'
import { SessionoauthUser, SessionUser, OAuthPayload } from './express/index'
import { AuthService } from './driver-auth/service'
import { AdminAuthService } from './admin-auth/service'
import { EnforceAuthService } from './enforcement-auth/service'
import { ApiService } from './api-auth/service'
import { DriverSummary, EnforcerSummary } from '.'
import { Member } from './api-auth'

@Route()
export class AuthController extends Controller {
  @Post('driver-login')
  @Response('401', 'Unauthorised')
  public async login(
    @Body() credentials: Credentials,
  ): Promise<Authenticated | undefined> {
    return new AuthService().driverlogin(credentials)
      .then(async (user: Authenticated | undefined): Promise<Authenticated | undefined> => {
        if (!user) {
          this.setStatus(401)
          return undefined
        }
        return user
      })
  }

  @Post('oauth-driver-login')
  @Response('401', 'Unauthorized')
  public async oauthlogin(@Body() id: OAuthPayload,): Promise<string | undefined> {
    return new AuthService().driveroauthlogin(id.id, id.email, id.name)
      .then(async (id: SessionoauthUser | undefined): Promise<string | undefined> => {
        if (!id) {
          this.setStatus(401)
          return undefined
        }
        return id.id
      })
  }

  @Get('check')
  @Security("jwt")
  @Response('401', 'Unauthorised')
  public async check(
    @Request() request: express.Request
  ): Promise<SessionUser | undefined> {
    return new Promise((resolve) => {
      resolve(request.user)
    })
  }
  @Post('admin-login')
  @Response('401', 'Unauthorised')
  public async adminlogin(
    @Body() credentials: Credentials,
  ): Promise<Authenticated | undefined> {
    return new AdminAuthService().adminlogin(credentials)
      .then(async (user: Authenticated | undefined): Promise<Authenticated | undefined> => {
        if (!user) {
          this.setStatus(401)
          return undefined
        }
        return user
      })
  }
  @Post('enforcement-login')
  @Response('401', 'Unauthorised')
  public async enforcelogin(
    @Body() credentials: Credentials,
  ): Promise<Authenticated | undefined> {
    return new EnforceAuthService().enforcementlogin(credentials)
      .then(async (user: Authenticated | undefined): Promise<Authenticated | undefined> => {
        if (!user) {
          this.setStatus(401)
          return undefined
        }
        return user
      })
  }

  /* suspend accounts*/
  @Post('suspend-driver')
  @Security('jwt', ['admin'])
  @Response('200', 'Suspension updated')
  @Response('400', 'Invalid input')
  @Response('401', 'Unauthorised')
  public async suspendDriver(
    @Body() body: { id: string, suspend: boolean }
  ): Promise<void> {
    try {
      await new AuthService().setSuspended(body.id, body.suspend);
      this.setStatus(200);
    } catch (error) {
      console.error('Error suspending driver:', error);
      this.setStatus(400);
    }
  }


  @Get('drivers')
  @Security('jwt', ['admin'])
  @Response('200', 'Returns all drivers')
  public async getDrivers(): Promise<DriverSummary[]> {
    return await new AuthService().listDrivers();
  }

  // enforcers

  @Post('suspend-enforcer')
  @Security('jwt', ['admin'])
  @Response('200', 'Suspension updated')
  @Response('400', 'Invalid input')
  @Response('401', 'Unauthorised')
  public async suspendEnforcer(
    @Body() body: { id: string, suspend: boolean }
  ): Promise<void> {
    try {
      await new EnforceAuthService().setSuspended(body.id, body.suspend);
      this.setStatus(200);
    } catch (error) {
      console.error('Error suspending Enforcer:', error);
      this.setStatus(400);
    }
  }


  @Get('Enforcers')
  @Security('jwt', ['admin'])
  @Response('200', 'Returns all Enforcers')
  public async getEnforcers(): Promise<EnforcerSummary[]> {
    return await new EnforceAuthService().listEnforcers();
  }

  @Get('check-police-key')
  @SuccessResponse('200', 'Key is verified')
  @Response('404', 'Unauthorized')
  public async verifyPoliceApiKey(
    @Query() key: string,
  ): Promise<boolean> {
    const hexRegex = /^[a-f0-9]{64}$/;
    if (!key || !hexRegex.test(key)) {
      throw new Error('Invalid API key format');
    }

    const res = await new ApiService().verifyPoliceApiKey(key)
    if (res) {
      this.setStatus(200)
      return true
    }
    this.setStatus(404)
    return false
  }

  @Get('check-registrar-key')
  @SuccessResponse('200', 'Key is verified')
  @Response('404', 'Unauthorized')
  public async verifyRegistrarApiKey(
    @Query() key: string,
  ): Promise<boolean> {
    const hexRegex = /^[a-f0-9]{64}$/;
    if (!key || !hexRegex.test(key)) {
      throw new Error('Invalid API key format');
    }

    const res = await new ApiService().verifyRegistrarApiKey(key)
    if (res) {
      this.setStatus(200)
      return true
    }
    this.setStatus(404)
    return false
  }

  @Get('get-id-by-email')
  @SuccessResponse('200', 'Successfully get driver id')
  @Response('404', 'Unauthorised')
  public async getIdByEmail(
    @Query() email: string,
  ): Promise<Member | undefined> {
    if (!email || !email.includes('@')) {
      this.setStatus(404)
      return undefined
    }

    return new ApiService().getDriverIdByEmail(email)
      .then(async (user: Member | undefined): Promise<Member | undefined> => {
        if (!user) {
          this.setStatus(404)
          return undefined
        }
        return user
      })
  }


  @Post('signup')
  @SuccessResponse('200', 'Account Created')
  @Response('401', 'Account Exists')
  @Response('401', 'invalid email')
  public async newsignup(@Body() body: signupvalidations){
    const result = await new AuthService().signup(body)
    if (!result) {
      this.setStatus(401)
      return { message: 'Account already exists' }
    }
    return result  
  }


  @Get('check-terms')
  @Security('jwt')
  @SuccessResponse('200', '')
  public async checkterms(@Request() request:express.Request){
    const userId = request.user?.id as string
    return new AuthService().checkterms(userId)
  }

  @Post('accept-terms')
  @Security('jwt')
  @SuccessResponse('200','')
  public async acceptterms(@Request() request:express.Request){
    const userId = request.user?.id as string
    return new AuthService().acceptterms(userId)
  }

  @Post('decline-terms')
  @Security('jwt')
  @SuccessResponse('200','')
  public async declineterms(@Request() request:express.Request){
    const userId = request.user?.id as string
    return new AuthService().declineterms(userId)
  }

  @Post('get-email')
  @SuccessResponse('200','Successfully get driver email')
  @Response('404', 'Email is not found')
  public async getEmailById(@Body() body: {driverId: string}): Promise<string | undefined>{
    const result = await new ApiService().getEmailById(body.driverId)
    if (!result) {
      this.setStatus(404)
      return result
    }
    return result
  }
}

