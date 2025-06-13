CREATE DATABASE auth;
\connect auth
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE DATABASE permit;
\connect permit
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE DATABASE ticket;
\connect ticket
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE DATABASE vehicle;
\connect vehicle
CREATE EXTENSION IF NOT EXISTS pgcrypto;
