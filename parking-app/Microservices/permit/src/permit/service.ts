import { BuyPermitArgs, Permit, PermitType, ZoneType } from "./schema";
import { pool } from "../db";
import { ptid } from "..";
import { sendPermitReceipt } from "../mail/mail";

export class PermitService{
    public async getPermitTypes () : Promise<PermitType[]>{
        const result = await pool.query(`SELECT * FROM permit_type ORDER BY data->>'price'`);
        const types = [];
        for (const row of result.rows) {
            types.push({
                id: row.id,
                type: row.data.type,
                day_duration: row.data.day_duration,
                month_duration: row.data.month_duration,
                price: row.data.price,
                totalAmount: row.data.total_amount
            });
        }
        return types;
    }

    public async getPermits (permitTypeId: ptid) : Promise<Permit[]>{
        const permits = [];
        const result = await pool.query(
            `SELECT * FROM permit WHERE permit_type_id = $1`,
            [permitTypeId]
        );

        for (const row of result.rows) {
            permits.push({
                id: row.id,
                permitTypeId: row.permit_type_id,
                driverId: row.driver_id,
                vehicleId: row.vehicle_id,
                startTime: row.data.start_time,
                endTime: row.data.end_time,
                plate: row.data.plate,
                zone: row.data.zone 
            });
        }

        return permits;
    }

    public async getPermitsByDriver (driverId: string): Promise<Permit[]> {
        const select = `SELECT * FROM permit WHERE driver_id = $1;`
        const query = {
            text: select,
            values: [`${driverId}`]
        }
        const {rows} = await pool.query(query)
        return rows.map(row => ({
            id: row.id,
            permitTypeId: row.permit_type_id,
            driverId: row.driver_id,
            vehicleId: row.vehicle_id,
            startTime: row.data.start_time,
            endTime: row.data.end_time,
            plate: row.data.plate,
            zone: row.data.zone
        }))
    }

    public async getPermitByVehicle (vehicleId: string): Promise<Permit> {
        const vehicleResult = await fetch('http://localhost:5150/graphql',{
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                query: `query GetVehicleById($vehicleId: String!) {
                    vehicleById(id: $vehicleId){
                        id
                        plate
                    }
                }`,
                variables: {
                    vehicleId: vehicleId
                }
            }),
        });
        const response = await vehicleResult.json();
        if (!response.data) {
            throw new Error('Invalid vehicle id');
        }

        const select = `SELECT * FROM permit WHERE vehicle_id = $1;`
        const query = {
            text: select,
            values: [`${vehicleId}`]
        }
        const permitResult = await pool.query(query)
        if (permitResult.rowCount as number <= 0) {
            throw new Error('Vehicle doesn\'t have a permit');
        }
        return {
            id: permitResult.rows[0].id,
            permitTypeId: permitResult.rows[0].permit_type_id,
            driverId: permitResult.rows[0].driver_id,
            vehicleId: permitResult.rows[0].vehicle_id,
            startTime: permitResult.rows[0].data.start_time,
            endTime: permitResult.rows[0].data.end_time,
            plate: permitResult.rows[0].data.plate,
            zone: permitResult.rows[0].data.zone
        }
    }

    public async getPermitByPlate (plate: string): Promise<Permit> {
        const permitResult = await pool.query(
            `SELECT * FROM permit WHERE data ->>'plate' = $1`,
            [`${plate}`]
        )
        if (permitResult.rowCount as number <= 0) {
            throw new Error('Vehicle doesn\'t have a permit');
        }
        return {
            id: permitResult.rows[0].id,
            permitTypeId: permitResult.rows[0].permit_type_id,
            driverId: permitResult.rows[0].driver_id,
            vehicleId: permitResult.rows[0].vehicle_id,
            startTime: permitResult.rows[0].data.start_time,
            endTime: permitResult.rows[0].data.end_time,
            plate: permitResult.rows[0].data.plate,
            zone: permitResult.rows[0].data.zone
        }
    }

    public async getZoneTypes(): Promise<ZoneType[]> {
        const zoneTypes = []
        const zoneTypeResult = await pool.query(`SELECT * FROM zone_type`);
        for (const zoneType of zoneTypeResult.rows) {
            zoneTypes.push({
                id: zoneType.id,
                zone: zoneType.data.zone,
                maxPermits: zoneType.data.max_permits
            });
        } 
        return zoneTypes;
    }

    public async buyPermit (buyPermitArgs: BuyPermitArgs, driverId: string) : Promise<Permit>{
        // Check permit type id
        const permitTypeResult = await pool.query(`SELECT * FROM permit_type WHERE id = $1`, [buyPermitArgs.permitTypeId]);
        if (permitTypeResult.rowCount === 0) {
            throw new Error('Invalid permit-type id');
        }

        // Check vehicle id
        const vehicleResult = await fetch('http://localhost:5150/graphql',{
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                query: `query GetVehicleById($vehicleId: String!) {
                    vehicleById(id: $vehicleId){
                        id
                        plate
                    }
                }`,
                variables: {
                    vehicleId: buyPermitArgs.vehicleId
                }
            }),
        });
        const response = await vehicleResult.json();
        if (!response.data) {
            throw new Error('Invalid vehicle id');
        }

        // Check zone type id
        const zoneTypeResult = await pool.query(
            `SELECT * FROM zone_type WHERE id = $1`,
            [buyPermitArgs.zoneTypeId]
        )
        if (zoneTypeResult.rowCount as number <= 0) {
            throw new Error('Invalid zone-type id');
        }
        // Check zone capacity
        if (zoneTypeResult.rows[0].data.max_permits <= 0) {
            throw new Error('This zone has no more permits available')
        }

        // Check if a vehicle already has a permit
        const permitResult = await pool.query(
            `SELECT * FROM permit WHERE driver_id = $1 AND vehicle_id = $2`,
            [driverId, buyPermitArgs.vehicleId]
        );
        if (permitResult.rowCount as number > 0) {
            throw new Error('This vehicle already has a permit');
        }

        // Insert a permit
        const day_duration = permitTypeResult.rows[0].data.day_duration;
        const month_duration = permitTypeResult.rows[0].data.month_duration;
        const now = new Date();
        const endDate = new Date(now);
        endDate.setDate(endDate.getDate() + day_duration)
        endDate.setMonth(endDate.getMonth() + month_duration);
        const result = await pool.query(
            `INSERT INTO permit(permit_type_id, driver_id, vehicle_id, zone_type_id, data) 
                VALUES($1, $2, $3, $4,
                jsonb_build_object(
                    'start_time', $5::text,
                    'end_time', $6::text,
                    'plate', $7::text,
                    'zone', $8::text
                )) RETURNING *`,
            [buyPermitArgs.permitTypeId, driverId, buyPermitArgs.vehicleId, buyPermitArgs.zoneTypeId,
                now.toISOString(), endDate.toISOString(), response.data.vehicleById.plate, zoneTypeResult.rows[0].data.zone]
        );
        await pool.query(
            `UPDATE zone_type SET data = 
                jsonb_set(data, '{max_permits}', to_jsonb((data->>'max_permits')::int - 1))
                WHERE id = $1`, [buyPermitArgs.zoneTypeId]);

        // Get the driver's email
        const driverResult = await fetch('http://localhost:5200/api/v0/get-email',{
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                driverId: driverId
            }),
        });

        const email = await driverResult.json()
        if (email) {
            // Send an email to the driver as the receipt
            sendPermitReceipt(
                response.data.vehicleById.plate,
                now.toISOString(),
                endDate.toISOString(),
                permitTypeResult.rows[0].data.price,
                zoneTypeResult.rows[0].data.zone,
                email
            );
        }

        return {
            id: result.rows[0].id,
            vehicleId: buyPermitArgs.vehicleId,
            permitTypeId: buyPermitArgs.permitTypeId,
            driverId: driverId,
            startTime: now.toISOString(),
            endTime: endDate.toISOString(),
            plate: response.data.vehicleById.plate,
            zone: zoneTypeResult.rows[0].data.zone
        };
    }

    public async getZoneMaxPermits(zoneCode: string): Promise<number | null> {
        const result = await pool.query(
            `SELECT data->>'max_permits' as max FROM zone_type WHERE data->>'zone' = $1`,
            [zoneCode]
        );
        if (result.rowCount === 0) return null;
        return parseInt(result.rows[0].max, 10);
    }

    public async setZoneMaxPermits(zoneCode: string, newLimit: number): Promise<boolean> {
        const result = await pool.query(
            `UPDATE zone_type
            SET data = jsonb_set(data, '{max_permits}', to_jsonb($1::int))
            WHERE data->>'zone' = $2`,
            [newLimit, zoneCode]
        );
        return (result.rowCount ?? 0) > 0;
    }

    public async getPermitCountInZone(zoneCode: string): Promise<number> {
        const result = await pool.query(
            `SELECT COUNT(*) FROM permit WHERE data->>'zone' = $1`,
            [zoneCode]
        );
        return parseInt(result.rows[0].count, 10);
    }

}
