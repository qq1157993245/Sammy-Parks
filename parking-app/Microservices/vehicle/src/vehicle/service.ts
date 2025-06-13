import { pool } from '../db'
import { Vehicle, NewVehicle } from "./schema"

export class VehicleService {
  /**
   * Adds a new vehicle to the database.
   * @param id driver ID
   * @param vehicle The vehicle to add.
   * @returns The added vehicle.
   */
  public async addVehicle(id: string, vehicle: NewVehicle): Promise<Vehicle> {
    const insert = `
      INSERT INTO vehicle (driver, data) VALUES (
      $1,
      jsonb_build_object('plate', $2::TEXT, 'state', $3::TEXT))
      RETURNING id, data;
    `
    const query = {
      text: insert,
      values: [id, vehicle.plate, vehicle.state]
    }
    const { rows } = await pool.query(query)

    return {
      id: rows[0].id,
      driverId: id,
      plate: rows[0].data.plate,
      state: rows[0].data.state
    }
  }

  /**
   * Retrieves a vehicle by its Driver ID.
   * @param id The ID of the driver to retrieve.
   * @returns The vehicles
   */
  public async getVehicleByDriverId(id: string): Promise<Vehicle[]> {
    const select = `
      SELECT id, data
      FROM vehicle
      WHERE driver = $1;
    `
    const query = {
      text: select,
      values: [id]
    }
    const { rows } = await pool.query(query)
    
    return rows.map((row) => ({
      id: row.id,
      driverId: id,
      plate: row.data.plate,
      state: row.data.state
    }))
  }

  /**
   * Retrieves a vehicle by its ID.
   * @param id The ID of the vehicle to retrieve.
   * @returns The vehicle, or an empty object if not found.
   */
  public async getVehicleById(id: string): Promise<Vehicle|undefined> {
    const select = `
      SELECT data
      FROM vehicle
      WHERE id = $1;
    `
    const query = {
      text: select,
      values: [id]
    }
    const { rows } = await pool.query(query)
    if (rows.length === 0) {
      return undefined
    }

    return {
      id: id,
      driverId: rows[0].driver,
      plate: rows[0].data.plate,
      state: rows[0].data.state
    }
  }

  /**
   * Retrieves a vehicle by a plate number.
   * @param plate The license plate of the vehicle to retrieve.
   * @returns The vehicle, or throw an error.
   */
  public async getVehicleByPlate(plate: string): Promise<Vehicle> {
    const vehicleResult = await pool.query(
      `SELECT * FROM vehicle WHERE data ->> 'plate' = $1`, 
      [plate]
    );
    if (vehicleResult.rowCount as number > 0) {
      return {
        id: vehicleResult.rows[0].id,
        driverId: vehicleResult.rows[0].driver,
        plate: plate,
        state: vehicleResult.rows[0].data.state}
    } else {
      throw new Error('Vehicle is not registered');
    }
  }
}