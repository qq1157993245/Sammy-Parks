DROP TABLE IF EXISTS vehicle CASCADE;
CREATE TABLE vehicle (
    id UUID UNIQUE PRIMARY KEY DEFAULT gen_random_uuid(),
    driver UUID NOT NULL,
    data jsonb
);