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