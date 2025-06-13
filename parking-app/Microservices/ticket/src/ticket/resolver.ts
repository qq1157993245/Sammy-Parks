import { Arg, Int, Mutation, Query, Resolver, Ctx } from 'type-graphql';
import { Request } from 'express';
import {
  getTickets,
  getTicketTypes,
  getTicketsByDriver,
  getTicketOrFail,
  overrideTicket as overrideTicketService,
  createTicket,
  payTicket as payTicketService,
  challengeTicket as challengeTicketService,
  acceptChallenge,
  denyChallenge,
  setPrice
} from './service';
import { check } from '../auth/service';
import { Ticket, TicketData, TicketInput, TicketType } from './schema';

@Resolver()
export class TicketResolver {
  @Query(() => [Ticket])
  async tickets(@Ctx() request: Request): Promise<Ticket[]> {
    const jwt = extractJwt(request);
    const user = await check(jwt);
    if (!user.roles.includes("admin")){
      throw new Error("Unauthorized")
    }
    return await getTickets();
  }

  @Query(() => [TicketType])
  async ticketTypes(@Ctx() request: Request): Promise<TicketType[]> {
    const jwt = extractJwt(request);
    const user = await check(jwt);
    if (!user.roles.includes("admin") && !user.roles.includes("enforcement")) {
      throw new Error("Unauthorized")
    }
    return await getTicketTypes();
  }

  @Query(() => [Ticket])
  async ticketsByDriver(
    @Arg('driverId', () => String) driverId: string,
    @Ctx() request: Request
  ): Promise<Ticket[]> {
    const jwt = extractJwt(request);
    const user = await check(jwt);

    const isAdmin = user.roles.includes("admin");
    const isSelf = user.id === driverId && user.roles.includes("driver");

    if (!isAdmin && !isSelf) {
      throw new Error("Unauthorized");
    }

    return await getTicketsByDriver(driverId);
  }

  @Mutation(() => Ticket)
  async payTicket(
    @Arg('id', () => String) id: string,
    @Ctx() request: Request
  ): Promise<Ticket> {
    const jwt = extractJwt(request);
    const user = await check(jwt);
    if (!user.roles.includes("driver")){
      throw new Error("Unauthorized")
    }
    return await payTicketService(id);
  }

  @Mutation(() => Ticket)
  async overrideTicket(
    @Arg('id', () => String) id: string,
    @Ctx() request: Request
  ): Promise<Ticket> {
    const jwt = extractJwt(request);
    const user = await check(jwt);
    if (!user.roles.includes("admin")){
      throw new Error("Unauthorized")
    }

    await getTicketOrFail(id);
    return await overrideTicketService(id);
  }

  @Mutation(() => Ticket)
  async createTicket(
    @Arg('data', () => TicketInput) data: TicketInput,
    @Ctx() request: Request
  ): Promise<Ticket> {
    const jwt = extractJwt(request);
    const issuedBy = await check(jwt);
    if (!issuedBy.roles.includes("enforcement")){
      throw new Error("Unauthorized")
    }
    

    const ticket: TicketData = {
      driverId: data.driverId,
      issuedBy: issuedBy.id,
      createdAt: new Date().toISOString(),
      paid: false,
      overridden: false
    };

    return await createTicket(data.type, ticket);
  }
    
  @Mutation(() => TicketType)
  public async setViolationPrice(
      @Arg('id', () => String) id: string,
      @Arg('price', () => Int) price: number,
      @Ctx() request: Request
  ): Promise<TicketType> {
    const jwt = extractJwt(request);
    const issuedBy = await check(jwt);
    if (!issuedBy.roles.includes("admin")){
      throw new Error("Unauthorized")
    }

    return await setPrice(id, price);
  }

  @Mutation(() => Ticket)
  async challengeTicket(
    @Arg('id', () => String) id: string,
    @Arg('message', () => String) message: string,
    @Ctx() request: Request
  ): Promise<Ticket> {
    const jwt = extractJwt(request);
    const user = await check(jwt);
    if (!user.roles.includes("driver")) {
      throw new Error("Unauthorized");
    }
    return await challengeTicketService(id, message);
  }

  @Mutation(() => Ticket)
  async resolveChallenge(
    @Arg('id', () => String) id: string,
    @Arg('accept', () => Boolean) accept: boolean,
    @Ctx() request: Request
  ): Promise<Ticket> {
    const jwt = extractJwt(request);
    const user = await check(jwt);
    if (!user.roles.includes("admin")) {
      throw new Error("Unauthorized");
    }

    return accept ? await acceptChallenge(id) : await denyChallenge(id);
  }
}

//cleanly extract and check JWT
function extractJwt(request: Request): string {
  const auth = request.headers.authorization;
  if (!auth) throw new Error('No JWT provided');
  return auth.split(' ')[1];
}
