import { pool } from '../db';
import { Ticket, TicketData, TicketType } from './schema';
import { sendTicketEmail } from '../mail/mail';

// Get all tickets
export async function getTickets(): Promise<Ticket[]> {
  const result = await pool.query(`SELECT id, data FROM ticket`);
  return result.rows;
}

// Get all ticket types
export async function getTicketTypes(): Promise<TicketType[]> {
  const result = await pool.query(`SELECT id, data->>'price' price, data->>'violation' violation FROM ticket_type`);
  return result.rows;
}

// Get a ticket by ID or throw
export async function getTicketOrFail(id: string): Promise<Ticket> {
  const result = await pool.query(`SELECT id, data
  FROM ticket
  WHERE id = $1`, [id]);
  
  if (result.rows.length === 0) {
    console.error(`Ticket with ID ${id} not found`); 
    throw new Error('Ticket not found');
  }
  return result.rows[0];
}

// Get tickets by driver (not overridden)
export async function getTicketsByDriver(driverId: string): Promise<Ticket[]> {
  const result = await pool.query(
    `SELECT id, data
    FROM ticket
    WHERE data->>'driverId' = $1 AND (data->>'overridden')::boolean = false`,
    [driverId]
  );
  return result.rows;
}

// Create a new ticket
export async function createTicket(type: string | undefined, data: TicketData): Promise<Ticket> {
  const result = await pool.query(
    `SELECT data->>'violation' violation, data->>'price' price
    FROM ticket_type
    WHERE id = $1`, [type]
  );
  data.price = result.rows[0].price;
  data.violation = result.rows[0].violation;
  const result2 = await pool.query(
    `INSERT INTO ticket(data) VALUES($1) RETURNING *`, [data]
  );

  // Get the driver's email
  const driverResult = await fetch('http://localhost:5200/api/v0/get-email',{
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
      },
      body: JSON.stringify({
          driverId: data.driverId
      }),
  });

  const email = await driverResult.json()
  if (email) {
    // Send ticket email
    sendTicketEmail(new Date().toISOString(), result.rows[0].price, result.rows[0].violation, email);
  }

  return result2.rows[0];
}

export async function setPrice(id: string, price: number): Promise<TicketType> {
  const result = await pool.query(
    `UPDATE ticket_type
    SET data = jsonb_set(data, '{price}', to_jsonb($1::int))
    WHERE id = $2
    RETURNING *`, [price, id]
  );
  const response = result.rows[0];
  response.price = response.data.price;
  response.violation = response.data.violation;
  delete response.data;
  return response;
}

// Mark ticket as overridden
export async function overrideTicket(id: string): Promise<Ticket> {
  const result = await pool.query(
    `UPDATE ticket
    SET data = jsonb_set(data, '{overridden}', 'true', true)
    WHERE id = $1
    RETURNING id, data`,
    [id]
  );
  return result.rows[0];
}

// Mark ticket as paid
export async function payTicket(id: string): Promise<Ticket> {
  const result = await pool.query(
    `UPDATE ticket
    SET data = jsonb_set(data, '{paid}', 'true', true)
    WHERE id = $1
    RETURNING id, data`,
    [id]
  );
  return result.rows[0];
}

// Challenge a ticket
export async function challengeTicket(id: string, message: string): Promise<Ticket> {
  const result = await pool.query(
    `UPDATE ticket
    SET data = jsonb_set(
      jsonb_set(data, '{challenged}', 'true', true),
      '{challengeMessage}', to_jsonb($2::text), true
    )
    WHERE id = $1
    RETURNING id, data`,
    [id, message]
  );
  return result.rows[0];
}

// Accept a challenged ticket (mark overridden)
export async function acceptChallenge(id: string): Promise<Ticket> {
  const result = await pool.query(
    `UPDATE ticket
    SET data = jsonb_set(
      jsonb_set(
        jsonb_set(
          jsonb_set(data, '{challenged}', 'false', true),
          '{challengeAccepted}', 'true', true
        ),
        '{price}', ceil(COALESCE(data->>'price', '0')::int / 2.0)::text::jsonb
      ),
      '{challengeMessage}', '""'
    )
    WHERE id = $1
    RETURNING id, data`,
    [id]
  );
  return result.rows[0];
}

// Deny a challenged ticket (just unmark as challenged and set challengeDenied to true)
export async function denyChallenge(id: string): Promise<Ticket> {
  const result = await pool.query(
    `UPDATE ticket
    SET data = jsonb_set(
      jsonb_set(
        jsonb_set(data, '{challenged}', 'false', true),
        '{challengeDenied}', 'true', true
      ),
      '{challengeMessage}', '""'
    )
    WHERE id = $1
    RETURNING id, data`,
    [id]
  );
  return result.rows[0];
}
