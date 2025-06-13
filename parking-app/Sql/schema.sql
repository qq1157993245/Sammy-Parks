\connect auth
CREATE EXTENSION IF NOT EXISTS pgcrypto;
DROP TABLE IF EXISTS driver CASCADE;
CREATE TABLE driver(id UUID UNIQUE PRIMARY KEY DEFAULT gen_random_uuid(), data jsonb);

DROP TABLE IF EXISTS administrator CASCADE;
CREATE TABLE administrator(id UUID UNIQUE PRIMARY KEY DEFAULT gen_random_uuid(), data jsonb);

DROP TABLE IF EXISTS enforcement CASCADE;
CREATE TABLE enforcement(id UUID UNIQUE PRIMARY KEY DEFAULT gen_random_uuid(), data jsonb);

DROP TABLE IF EXISTS police_api CASCADE;
CREATE TABLE police_api(
    id UUID UNIQUE PRIMARY KEY DEFAULT gen_random_uuid(),
    data jsonb
);

DROP TABLE IF EXISTS registrar_api CASCADE;
CREATE TABLE registrar_api(
    id UUID UNIQUE PRIMARY KEY DEFAULT gen_random_uuid(),
    data jsonb
);


\connect permit
DROP TABLE IF EXISTS zone_type CASCADE;
CREATE TABLE zone_type (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  data JSONB
);

DROP TABLE IF EXISTS permit_type CASCADE;
CREATE TABLE permit_type (
	id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
	data JSONB
);

DROP TABLE IF EXISTS permit CASCADE;
CREATE TABLE permit (
	id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    permit_type_id UUID,
	zone_type_id UUID,
	driver_id UUID,
	vehicle_id UUID,
	data JSONB
);


\connect ticket
DROP TABLE IF EXISTS ticket_type CASCADE;
CREATE TABLE ticket_type (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  data JSONB
);

DROP TABLE IF EXISTS ticket CASCADE;
CREATE TABLE IF NOT EXISTS ticket (
  id UUID UNIQUE PRIMARY KEY DEFAULT gen_random_uuid(),
  data JSONB NOT NULL
);


\connect vehicle
DROP TABLE IF EXISTS vehicle CASCADE;
CREATE TABLE vehicle (
    id UUID UNIQUE PRIMARY KEY DEFAULT gen_random_uuid(),
    driver UUID NOT NULL,
    data jsonb
);



