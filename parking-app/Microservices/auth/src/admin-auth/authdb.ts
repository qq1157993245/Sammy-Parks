import {pool} from '../db';
import {Member} from '..'

export async function finduseremailadmin(email: string, password: string): Promise<Member|null> {
  const select = `SELECT id, data
  FROM administrator
  WHERE data->>'email' = $1
  AND crypt($2, data->>'pwhash') = data->>'pwhash'`;

  const values = [email, password];

  const query = {
    text: select,
    values: values,
  };

  try {
    const {rows} = await pool.query(query);

    if (rows.length === 0) {
      return null;
    }

    return {
      id: rows[0].id,
      ...rows[0].data
    };
  } catch (error) {
    console.error("Database query error:", error);
    throw error;
  }
}

export async function findbyidadmin(id: string): Promise<Member|null> {
  const result = await pool.query(
    'SELECT id, data FROM administrator WHERE id = $1',
    [id]
  );

  if (result.rows.length === 0) {
    return null;
  }

  const userData = result.rows[0].data;

  if (userData.roles && typeof userData.roles === 'string') {
    userData.roles = JSON.parse(userData.roles);
  }

  return {
    id: result.rows[0].id,
    ...userData
  };
}
