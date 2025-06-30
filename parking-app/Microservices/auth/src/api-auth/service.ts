import * as jwt from "jsonwebtoken"

import { pool } from '../db';
import { ApiKey, Member } from '.'
import { uploadFile } from "../s3Service";

export class ApiService {
  public async verifyPoliceApiKey(
    key: string
  ): Promise<ApiKey | undefined> {
    const select = `
      SELECT id, DATA
      FROM police_api
      WHERE DATA->>'api_key' = $1;
    `;
    const query = {
      text: select,
      values: [key],
    }
    const { rows } = await pool.query(query)
    if (rows.length === 0) {
      return undefined
    }

    return {
      id: rows[0].id,
      key: rows[0].data.api_key,
      createdAt: new Date(rows[0].data.created_at),
      name: rows[0].data.name,
    }
  }

  public async verifyRegistrarApiKey(
    key: string
  ): Promise<ApiKey | undefined> {
    const select = `
      SELECT id, DATA
      FROM registrar_api
      WHERE DATA->>'api_key' = $1;
    `;
    const query = {
      text: select,
      values: [key],
    }
    const { rows } = await pool.query(query)
    if (rows.length === 0) {
      return undefined
    }

    return {
      id: rows[0].id,
      key: rows[0].data.api_key,
      createdAt: new Date(rows[0].data.created_at),
      name: rows[0].data.name,
    }
  }

  public async getEmailById(driverId: string): Promise<string | undefined> {
    const result = await pool.query(
      `SELECT data ->> 'email' AS email FROM driver WHERE id = $1`,
      [driverId]
    )

    if (result.rowCount as number <= 0) {
      return undefined
    }

    return result.rows[0].email
  }

  public async getDriverIdByEmail(
    email: string
  ): Promise<Member | undefined> {
    const select = `
      SELECT id, data
      FROM driver
      WHERE data->>'email' = $1;
    `;
    const query = {
      text: select,
      values: [email],
    }
    const { rows } = await pool.query(query)
    if (rows.length === 0) {
      return undefined
    }

    const accessToken = jwt.sign({ id: rows[0].id, roles: 'driver' },
      `${process.env.MASTER_SECRET}`, {
      expiresIn: '30m',
      algorithm: 'HS256'
    })

    return {
      id: rows[0].id,
      name: rows[0].data.name,
      accessToken: accessToken
    }
  }

  public async uploadImage(userId: string, file: Express.Multer.File) : Promise<string>{
    const url = await uploadFile(file);
    await pool.query(
      `UPDATE driver
      SET data = jsonb_set(data, '{image}', to_jsonb($1::text))
      WHERE id = $2`, [url, userId]
    );
    return url;
  }

  public async getImage(userId: string) : Promise<string>{
    const driverResult = await pool.query(
      `SELECT data ->> 'image' AS image FROM driver WHERE id = $1`,
      [userId]
    );
    return driverResult.rows[0].image;
  }
}
