import {pool} from '../db';
import {EnforcerSummary, Member} from '..'

export async function finduseremailenforcement(email: string, password: string): Promise<Member|null> {
  const select = `SELECT id, data
  FROM enforcement
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

export async function findbyidenforcement(id: string): Promise<Member|null> {
  const result = await pool.query(
    'SELECT id, data FROM enforcement WHERE id = $1',
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


    /* suspend accounts*/

export async function updateEnforcerSuspended(id: string, suspend: boolean): Promise<void> {
  const updateQuery = `
    UPDATE enforcement
    SET data = jsonb_set(data, '{suspended}', $2::text::jsonb, true)
    WHERE id = $1
  `;

  await pool.query(updateQuery, [id, suspend]);
}

export async function getAllEnforcers(): Promise<EnforcerSummary[]> {
  const result = await pool.query(`
    SELECT id, data
    FROM enforcement
  `);

  return result.rows.map(row => ({
    id: row.id,
    name: row.data.name,
    email: row.data.email,
    suspended: row.data.suspended ?? false
  }));
}