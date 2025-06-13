\connect auth
INSERT INTO administrator(data) 
VALUES (
  jsonb_build_object(
    'email','anna@books.com',
    'name','Anna Admin',
    'pwhash',crypt('annaadmin',gen_salt('bf')),
    'roles','["admin"]'
  )
);
INSERT INTO driver(id,data) 
VALUES ('10ff51da-4879-4257-808d-58a90c74b632',
  jsonb_build_object(
    'email','molly@books.com',
    'name','Molly Member',
    'pwhash',crypt('mollymember',gen_salt('bf')),
    'roles','["driver"]',
    'suspended', false,
    'acceptedterms', true
  )
);
INSERT INTO driver(data) 
VALUES (
  jsonb_build_object(
    'email','borris@books.com',
    'name','Borris Member',
    'pwhash',crypt('borris',gen_salt('bf')),
    'roles','["driver"]',
    'suspended', false,
    'acceptedterms', false
  )
);

INSERT INTO enforcement(id,data) 
VALUES ('60dd71da-4879-4257-808d-58a90c74b632',
  jsonb_build_object(
    'email','ethan@books.com',
    'name','ethan enforcement',
    'pwhash',crypt('ethanenforcement',gen_salt('bf')),
    'roles','["enforcement"]',
    'suspended', false
  )
);
INSERT INTO enforcement(id,data) 
VALUES ('60dd71da-4879-4257-808d-58a90c74b111',
  jsonb_build_object(
    'email','bob@books.com',
    'name','bob enforcement',
    'pwhash',crypt('bobenforcement',gen_salt('bf')),
    'roles','["enforcement"]',
    'suspended', null
  )
);

INSERT INTO police_api(data) 
VALUES (
  jsonb_build_object(
    'api_key', encode(gen_random_bytes(32), 'hex'),
    'name', 'UCSC Force 1',
    'created_at', now()::text
  )
);

INSERT INTO police_api(data) 
VALUES (
  jsonb_build_object(
    'api_key', 'b31357e4e4b5178ef360b1e1c3b1b88c2fcce0b82eb7bf7d9b2a2555a7393d0f',
    'name', 'Testing Police',
    'created_at', now()::text
  )
);

INSERT INTO registrar_api(data) 
VALUES (
  jsonb_build_object(
    'api_key', encode(gen_random_bytes(32), 'hex'),
    'name', 'UCSC Registrar 1',
    'created_at', now()::text
  )
);

INSERT INTO registrar_api(data) 
VALUES (
  jsonb_build_object(
    'api_key', 'ca116f155eee62b9a99ad2045c92d6fcc0737b39256d7aefac9311bcaaad1c0b',
    'name', 'Tester Registrar Account',
    'created_at', now()::text
  )
);

\connect permit
INSERT INTO zone_type (id, data) VALUES
('b6d8e5f9-dad9-4f9b-9588-94bc2ee670ab', jsonb_build_object('zone', 'A', 'max_permits', 80, 'description', 'Main lots')),
('3adecb67-d309-4d69-9acf-89384a6baf24', jsonb_build_object('zone', 'R', 'max_permits', 60, 'description', 'Remote lots')),
('e74f1e80-17ec-4c20-a655-7c6b0348a772', jsonb_build_object('zone', 'MC', 'max_permits', 50, 'description', 'Motorcycle spots'));

INSERT INTO permit_type(id, data) VALUES
('93f9770b-64fd-4064-aeb2-8616b5c465fe', jsonb_build_object('price', 10, 'type', 'One Day', 'day_duration', 1, 'month_duration', 0)),
('8e159fb1-cb6c-4c75-8c98-d5b2d94c4126', jsonb_build_object('price', 200, 'type', 'Three Months', 'day_duration', 0, 'month_duration', 3)),
('70693529-cd45-47f2-b7bc-b07be99aa93a', jsonb_build_object('price', 300, 'type', 'Six Months', 'day_duration', 0, 'month_duration', 6)),
('acb3da7b-a8aa-4e15-8208-544bdc78125f', jsonb_build_object('price', 400, 'type', 'Nine Months', 'day_duration', 0, 'month_duration', 9)),
('a40615b1-990d-442d-a07a-5854c7cf7656', jsonb_build_object('price', 500, 'type', 'One Year', 'day_duration', 0, 'month_duration', 12)),
('0a361514-d894-4d91-b8e4-7c229f94a29f', jsonb_build_object('price', 800, 'type', 'Two Years', 'day_duration', 0, 'month_duration', 24));

\connect ticket
INSERT into ticket_type (id, data) VALUES ('6c95ad4e-0767-443e-b93a-5cbe4be39d6b',
  jsonb_build_object(
    'price', 100,
    'violation', 'Expired Permit'
  )
);
INSERT into ticket_type (id, data) VALUES ('d81e4303-f68f-4b7e-afc4-8f2d85fad6ae',
  jsonb_build_object(
    'price', 200,
    'violation', 'No Permit'
  )
);
INSERT into ticket_type (id, data) VALUES ('4ad83963-f827-49b1-93eb-cffddb0c6c58',
  jsonb_build_object(
    'price', 300,
    'violation', 'Parked in Forbidden Zone'
  )
);

INSERT INTO ticket (id,data) VALUES ('123e4567-e89b-12d3-a456-426614174011',
  jsonb_build_object(
    'driverId', '123e4567-e89b-12d3-a456-426614174000',
    'overridden', false,
    'violation', 'No Permit',
    'price', 200,
    'paid', false,
    'issuedBy', 'enforcer-uuid',
    'createdAt', now()::text,
    'challenged', false,
    'challengeMessage', '',
    'challengeDenied', false,
    'challengeAccepted', false
  )
);


\connect vehicle
INSERT INTO vehicle (driver, data) VALUES (
    '123e4567-e89b-12d3-a456-426614174000',
    jsonb_build_object('plate', '123NICE')
)