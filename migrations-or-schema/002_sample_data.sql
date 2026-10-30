-- Synthetic sample data for demonstration. No real students or numbers.
INSERT INTO administrator (student_number, name) VALUES ('A0000001', 'Demo Admin');
INSERT INTO requester (student_number, name, contact_phone) VALUES
  ('R0000001', 'Thato Demo', '72000001'),
  ('R0000002', 'Neo Demo',   '72000002');
INSERT INTO helper (student_number, name, contact_phone, available, vetted_by) VALUES
  ('H0000001', 'Kabelo Demo', '71000001', true, 1),
  ('H0000002', 'Lesedi Demo', '71000002', true, 1),
  ('H0000003', 'Mpho Demo',   '71000003', true, 1);
INSERT INTO errand_category (name, approved, standard_price) VALUES
  ('Parcel Collection', true, 20),
  ('Document Printing and Collection', true, 15),
  ('Alcohol Purchase', false, 0);
