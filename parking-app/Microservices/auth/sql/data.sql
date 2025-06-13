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