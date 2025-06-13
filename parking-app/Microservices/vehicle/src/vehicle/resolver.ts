
import { Resolver, Query, Mutation, Arg, Ctx } from "type-graphql"
import { Request } from "express"

import { Vehicle, NewVehicle } from "./schema"
import { VehicleService } from "./service"
import { check } from "../auth/service"

@Resolver()
export class VehicleResolver {
  @Query(() => [Vehicle])
  async vehicle(
    @Ctx() request: Request
  ) {
    let jwt = request.headers.authorization
    if (!jwt) {
      throw new Error("No JWT provided")
    }
    jwt = jwt.split(" ")[1]

    const decoded = await check(jwt)

    return new VehicleService().getVehicleByDriverId(decoded)
      .then((res) => {
        return res
      })
  }

  @Mutation(() => Vehicle)
  async addVehicle(
    @Arg('vehicle') vehicle: NewVehicle,
    @Ctx() request: Request
  ): Promise<Vehicle> {
    let jwt = request.headers.authorization
    if (!jwt) {
      throw new Error("No JWT provided")
    }
    jwt = jwt.split(" ")[1]

    const decoded = await check(jwt)
    return new VehicleService().addVehicle(decoded, vehicle)
      .then((res) => {
        return res
      })
  }

  @Query(() => Vehicle)
  async vehicleById(
    @Arg('id') id: string,
  ): Promise<Vehicle> {
    return new VehicleService().getVehicleById(id)
      .then((res) => {
        if (res) {
          return res
        } else {
          throw new Error("Vehicle not found")
        }
      })
  }

  @Query(() => Vehicle)
  async getVehicleByPlate(
    @Ctx() request: Request,
    @Arg('plate') plate: string,
  ): Promise<Vehicle> {
    let jwt = request.headers.authorization
    if (!jwt) {
      throw new Error("No JWT provided")
    }
    jwt = jwt.split(" ")[1]
    await check(jwt)

    return await new VehicleService().getVehicleByPlate(plate);
  }

  @Query(() => Vehicle, { nullable: true })
  async vehicleByDriverId(
    @Arg('driverId') driverId: string,
  ): Promise<Vehicle | null> {
    const vehicles = await new VehicleService().getVehicleByDriverId(driverId);
    return vehicles.length > 0 ? vehicles[0] : null;
  }
}