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