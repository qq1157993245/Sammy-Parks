import { Field, ObjectType, InputType, ArgsType } from "type-graphql"
import { IsUUID } from "class-validator"

@ObjectType()
@InputType("Vehicle")
export class Vehicle {
  @Field()
  @IsUUID()
  id!: string
  @Field()
  driverId?: string
  @Field()
  plate!: string
  @Field({ nullable: true })
  state?: string 
}

// TODO: Add ownership
@ArgsType()
@InputType("NewVehicle")
export class NewVehicle {
  @Field()
  plate!: string
  @Field()
  state!: string
}