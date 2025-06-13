import {pool} from '../db';
import {Member, DriverSummary, SignUpCredentials, ReturnedSignupCredentials, DriverMember} from '..'


export async function acceptterms(userid:string):Promise<string|null>{
  const update = `UPDATE driver 
  SET data = jsonb_set(data, '{acceptedterms}', to_jsonb(true))
  WHERE id = $1
  RETURNING id`

  const query = {
    text: update,
    values: [userid]
  }
  const {rows} = await pool.query(query)

  if (rows.length == 0){
    return null
  }
  else{
    return rows[0].id
  }

}

export async function checkterms(userid:string):Promise<boolean|null>{
  const select = `SELECT id, data from driver
  WHERE id = $1
  `


  const query = {
    text: select,
    values: [userid]
  }

  const {rows} = await pool.query(query)
  console.log("fnewjlfhejwlngjeng",rows)

  return rows[0].data.acceptedterms
}

export async function declineterms(userid:string):Promise<boolean|null>{
  const deleteQuery = `
    DELETE FROM driver 
    WHERE id = $1
  `;

  const query = {
    text: deleteQuery,
    values: [userid]
  };

  const result = await pool.query(query);

  // result.rowCount === 1 means a row was deleted
  return result.rowCount === 1;
}


export async function signup(credentials:SignUpCredentials): Promise<ReturnedSignupCredentials|null>{
  /*const insert = `INSERT INTO driver(data) VALUES ($1)
  SELECT * FROM driver WHERE NOT EXISTS(
  SELECT * FROM driver WHERE data->>'email' = $2)` */
  const insert = `INSERT INTO driver(data)
  SELECT jsonb_set(($1::jsonb), '{pwhash}',
  to_jsonb(crypt($2, gen_salt('bf')))) 
  WHERE NOT EXISTS (SELECT * FROM driver 
    WHERE data->>'email' = $3
  )
  RETURNING *`

  /*const data = {roles :['driver'],
  suspended: 'false',
  acceptedterms: 'false',
  ...credentials
  }*/
  const data = {
    name: credentials.name,
    email: credentials.email,
    roles: ['driver'],
    suspended: false,
    acceptedterms: true
  };
  const password = credentials.password
  const email = credentials.email

  const query = {
    text: insert,
    values: [data, password,email]
  }
  const {rows} = await pool.query(query)
  if (rows.length === 0) {
    return null; 
  }
  return {
    id: rows[0].id,
    name: rows[0].data.name,
    email: rows[0].data.email,
    suspended: rows[0].data.suspended,
    acceptedterms: rows[0].data.acceptedterms,
    pwhash: rows[0].data.pwhash,
  }
}


export async function finduseremaildriver(email: string, password: string): Promise<DriverMember|null> {
  const select = `SELECT id, data
  FROM driver
  WHERE data->>'email' = $1
  AND crypt($2, data->>'pwhash') = data->>'pwhash'`;

  const values = [email, password];

  const query = {
    text: select,
    values: values,
  };

    const {rows} = await pool.query(query);

    if (rows.length === 0) {
      return null;
    }

    return {
      id: rows[0].id,
      ...rows[0].data
    };
}

export async function findoauth(oauthid: string, email: string, name: string) {
  // Try to find by oauthid
  const select = `SELECT id, data 
  FROM driver 
  WHERE data->>'oauth' = $1`;
  const values = [oauthid];

  const query = {
    text: select,
    values: values
  };

  const { rows } = await pool.query(query);

  // Found user by oauthid
  if (rows.length > 0) {
    return {
      id: rows[0].id,
      ...rows[0].data
    };
  }

  // Try to find by email
  const emailSelect = `SELECT id, data 
  FROM driver 
  WHERE data->>'email' = $1`;
  const emailQuery = {
    text: emailSelect,
    values: [email]
  };

  const emailRows = await pool.query(emailQuery);

  // Found user by email, update with oauthid (combine the data when emails are the same)
  if (emailRows.rows.length > 0) {
    const existingId = emailRows.rows[0].id;
    const existingData = emailRows.rows[0].data;
    existingData.oauth = oauthid;

    const update = `UPDATE driver SET data = $1 WHERE id = $2`;
    const updateQuery = {
      text: update,
      values: [existingData, existingId]
    };

    await pool.query(updateQuery);

    return {
      id: existingId,
      ...existingData
    };
  }

  // Step 3: Create new user
  const data = {
    oauth: oauthid,
    suspended: false,
    roles: ["driver"],
    acceptedterms: false,
    email: email,
    name: name
  };

  const insert = `
    INSERT INTO driver(data) 
    VALUES ($1)
    RETURNING id, 
              data->>'oauth' AS oauth, 
              data->>'suspended' AS suspended,
              data->>'roles' AS roles
  `;

  const query2 = {
    text: insert,
    values: [data]
  };

  const newrows = await pool.query(query2);
  const row = newrows.rows[0];

  return {
    id: row.id,
    oauth: row.oauth,
    suspended: row.suspended,
    roles: row.roles
  };
}

// export async function findoauth(oauthid:string, email:string, name: string){
//   // console.log("fewjl;kj;fewkjrwkjgwrkljtrklwejkewjtkl;wrejtklewjrk")
//   const select = `SELECT id, data 
//   FROM driver 
//   WHERE data->>'oauth' = $1`
//   const values = [oauthid]

//   const query = {
//     text: select,
//     values: values
//   }
//   const {rows} = await pool.query(query)
//   if (rows.length === 0){
//     const data = {
//       oauth: oauthid,
//       suspended: false,
//       roles : ["driver"],
//       acceptedterms: false,
//       email: email,
//       name: name
//     }
//     // const insert = `INSERT INTO driver(data) VALUES ($1) RETURNING id, data`
//     const insert = `
//           INSERT INTO driver(data) 
//           VALUES ($1)
//           RETURNING id, 
//                     data->>'oauth' AS oauth, 
//                     data->>'suspended' AS suspended,
//                     data->>'roles' AS roles
//         `;

//     const query2 = {
//       text: insert,
//       values: [data]
//     }
//     const newrows = await pool.query(query2)


//     /* return {
//       id: newrows.rows[0].id,
//       ...newrows.rows[0].data
//     }; */
//     const row = newrows.rows[0];
// return {
//   id: row.id,
//   oauth: row.oauth,
//   suspended: row.suspended,  // if boolean expected
//   roles: row.roles          // parse roles if stored as JSON string
// };

//   }
//   else{
//     // console.log("DEBUG data:", rows[0].data);


//     return {
//       id: rows[0].id,
//       ...rows[0].data
//     };
//   }
// }

export async function findbyiddriver(id: string): Promise<Member|null> {
  // console.log("guh;irwhgiorwjgirwjgijrwoigjrwijtirwjtirwejtirwjtirwj")
  const result = await pool.query(
    'SELECT id, data FROM driver WHERE id = $1',
    [id]
  );

  if (result.rows.length === 0) {
    return null;
  }

  const userData = result.rows[0].data;
  
  if (userData.roles && typeof userData.roles === 'string') {
    userData.roles = JSON.parse(userData.roles);
  }
  //console.log("authdb.ts check",result.rows[0].id,userData)
  return {
    id: result.rows[0].id,
    ...userData
  };
}

    /* suspend accounts*/

export async function updateDriverSuspended(id: string, suspend: boolean): Promise<void> {
  const updateQuery = `
    UPDATE driver
    SET data = jsonb_set(data, '{suspended}', $2::text::jsonb, true)
    WHERE id = $1
  `;

  await pool.query(updateQuery, [id, suspend]);
}

export async function getAllDrivers(): Promise<DriverSummary[]> {
  const result = await pool.query(`
    SELECT id, data
    FROM driver
  `);

  return result.rows.map(row => ({
    id: row.id,
    name: row.data.name,
    email: row.data.email,
    suspended: row.data.suspended ?? false
  }));
}