import { ArgsType, Field, Int, ObjectType } from "type-graphql"
import { datetime, int, pid, ptid, did, vid, ztid } from ".."
import { IsInt } from 'class-validator';

@ObjectType()
export class PermitType{
    @Field(()=>String)
    id!: pid

    @Field()
    type!: string

    @Field(()=>Int)
    @IsInt()
    day_duration!: int

    @Field(()=>Int)
    @IsInt()
    month_duration!: int

    @Field()
    price!: number

    @Field(()=>Int)
    @IsInt()
    totalAmount!: int
}

@ObjectType()
export class Permit{
    @Field(()=>String)
    id!: pid

    @Field(()=>String)
    permitTypeId!: ptid

    @Field(()=>String)
    driverId!: did

    @Field(()=>String)
    vehicleId!: vid

    @Field(()=>String)
    startTime!: datetime

    @Field(()=>String)
    endTime!: datetime

    @Field(()=>String)
    plate!: string

    @Field(()=>String)
    zone!: string
}


@ObjectType()
export class ZoneType {
    @Field(()=>String)
    id!: ztid

    @Field(()=>String)
    zone!: string

    @Field(()=>Int)
    @IsInt()
    maxPermits!: int 
}

@ArgsType()
export class BuyPermitArgs{
    @Field(()=>String)
    permitTypeId!: ptid

    @Field(()=>String)
    vehicleId!: vid

    @Field(()=>String)
    zoneTypeId!: ztid
}

@ArgsType()
export class SetZoneLimitArgs {
  @Field(() => String)
  zone!: string

  @Field(() => Int)
  @IsInt()
  limit!: int
}