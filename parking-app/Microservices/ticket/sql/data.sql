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
