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

