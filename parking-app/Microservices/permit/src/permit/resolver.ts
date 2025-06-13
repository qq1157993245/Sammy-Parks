import { Arg, Args, Authorized, Ctx, Int, Mutation, Query, Resolver } from 'type-graphql';
import { BuyPermitArgs, Permit, PermitType, ZoneType } from './schema';
import { PermitService } from './service';
import { ptid, SessionUser } from '..';

@Resolver()
export class PermitResolver {
    @Query(()=>[PermitType])
    public async getPermitTypes () : Promise<PermitType[]>{
        return new PermitService().getPermitTypes();
    }

    @Query(()=>[ZoneType])
    public async getZoneTypes(): Promise<ZoneType[]>{
        return new PermitService().getZoneTypes();
    }

    @Query(()=>[Permit])
    public async getPermits (
        @Arg('permitTypeId', () => String) permitTypeId: ptid
    ) : Promise<Permit[]>{
        return new PermitService().getPermits(permitTypeId);
    }

    @Authorized("enforcement","admin", "driver")
    @Query(()=>[Permit])
    public async getPermitsByDriver(
        @Ctx() context: {user: SessionUser}
    ): Promise<Permit[]>{
        return new PermitService().getPermitsByDriver(context.user.id)
    }

    @Authorized("enforcement")
    @Query(()=>Permit)
    public async getPermitByVehicle(
        @Arg('vehicleId', () => String) vehicleId: string
    ): Promise<Permit>{
        return new PermitService().getPermitByVehicle(vehicleId)
    }

    @Authorized("enforcement")
    @Query(()=>Permit)
    public async getPermitByPlate(
        @Arg('plate', () => String) plate: string
    ): Promise<Permit>{
        return new PermitService().getPermitByPlate(plate)
    }

    @Authorized("driver")
    @Mutation(()=>Permit)
    public async buyPermit (
        @Args() buyPermitArgs: BuyPermitArgs,
        @Ctx() context: {user: SessionUser}
    ) : Promise<Permit>{
        return new PermitService().buyPermit(buyPermitArgs, context.user.id);
    }

    @Authorized("admin")
    @Query(() => Number, { nullable: true })
    public async getZoneMaxPermits(
        @Arg('zone', () => String) zone: string
    ): Promise<number | null> {
        return  new PermitService().getZoneMaxPermits(zone);
    }


    @Authorized("admin")
    @Mutation(() => Boolean)
    public async setZoneMaxPermits(
        @Arg('zone', () => String) zone: string,
        @Arg('limit', () => Int) limit: number,
    ): Promise<boolean> {
        return new PermitService().setZoneMaxPermits(zone, limit);
    }

    @Authorized("admin", "driver", "enforcement")
    @Query(() => Int)
    public async getPermitCountInZone(
        @Arg("zone", () => String) zone: string,
    ): Promise<number> {
        return new PermitService().getPermitCountInZone(zone);
    }

    @Query(()=>Permit)
    public async policeGetPermit(
        @Arg('plate', () => String) plate: string
    ): Promise<Permit>{
        return new PermitService().getPermitByPlate(plate)
    }
}
