-- supabase/seed.sql
-- Demo seed data for PettyCare
-- Uses fixed UUIDs for household and pets, gen_random_uuid() for other records

-- =============================================================================
-- 1. Demo Household
-- =============================================================================
INSERT INTO households (id, name, created_at)
VALUES (
  'a0000000-0000-0000-0000-000000000001',
  'Demo Family',
  '2023-01-10T08:00:00Z'
);

-- =============================================================================
-- 2. Pets (5 mock pets matching src/store/pet-context.tsx)
-- =============================================================================
INSERT INTO pets (id, household_id, name, species, breed, gender, birth_date, weight, weight_unit, color, notes, created_at, updated_at)
VALUES
  (
    'b0000000-0000-0000-0000-000000000001',  -- Luna
    'a0000000-0000-0000-0000-000000000001',
    'Luna', 'cat', 'Persian', 'female',
    '2021-03-15', 4.2, 'kg', '#F5F0EB',
    'Loves catnip',
    '2023-01-10T08:00:00Z', '2024-12-01T10:00:00Z'
  ),
  (
    'b0000000-0000-0000-0000-000000000002',  -- Max
    'a0000000-0000-0000-0000-000000000001',
    'Max', 'dog', 'Golden Retriever', 'male',
    '2019-07-20', 32.5, 'kg', '#D4A574',
    NULL,
    '2023-01-10T08:00:00Z', '2024-12-01T10:00:00Z'
  ),
  (
    'b0000000-0000-0000-0000-000000000003',  -- Coco
    'a0000000-0000-0000-0000-000000000001',
    'Coco', 'dog', 'Poodle', 'female',
    '2022-11-05', 6.8, 'kg', '#FFFFFF',
    NULL,
    '2023-06-15T08:00:00Z', '2024-12-01T10:00:00Z'
  ),
  (
    'b0000000-0000-0000-0000-000000000004',  -- Bella
    'a0000000-0000-0000-0000-000000000001',
    'Bella', 'cat', 'Siamese', 'female',
    '2020-09-12', 3.8, 'kg', NULL,
    'Indoor only',
    '2023-03-20T08:00:00Z', '2024-12-01T10:00:00Z'
  ),
  (
    'b0000000-0000-0000-0000-000000000005',  -- Charlie
    'a0000000-0000-0000-0000-000000000001',
    'Charlie', 'hamster', 'Syrian', 'male',
    '2024-06-01', 0.15, 'kg', NULL,
    NULL,
    '2024-06-15T08:00:00Z', '2024-12-01T10:00:00Z'
  );

-- =============================================================================
-- 3. Vaccinations (matching src/features/health/HealthPage.tsx perPetVaccinations)
-- =============================================================================
INSERT INTO vaccinations (id, pet_id, name, scheduled_date, administered_date, status, vet_name, notes)
VALUES
  -- Luna
  (gen_random_uuid(), 'b0000000-0000-0000-0000-000000000001', 'FVRCP',          '2025-04-10', '2024-04-10', 'completed', 'Dr. Smith', NULL),
  (gen_random_uuid(), 'b0000000-0000-0000-0000-000000000001', 'Rabies',         '2025-08-15', NULL,         'upcoming',  'Dr. Smith', '3-year vaccine'),
  (gen_random_uuid(), 'b0000000-0000-0000-0000-000000000001', 'Feline Leukemia', '2025-11-01', NULL,         'upcoming',  NULL,         NULL),
  -- Max
  (gen_random_uuid(), 'b0000000-0000-0000-0000-000000000002', 'Rabies',        '2025-03-10', '2024-03-10', 'completed', 'Dr. Smith', NULL),
  (gen_random_uuid(), 'b0000000-0000-0000-0000-000000000002', 'DHPP',          '2025-06-15', NULL,         'overdue',   NULL,         'Annual booster overdue!'),
  (gen_random_uuid(), 'b0000000-0000-0000-0000-000000000002', 'Bordetella',    '2025-09-01', NULL,         'upcoming',  NULL,         'Kennel cough'),
  (gen_random_uuid(), 'b0000000-0000-0000-0000-000000000002', 'Leptospirosis', '2025-12-01', NULL,         'upcoming',  NULL,         NULL),
  -- Coco
  (gen_random_uuid(), 'b0000000-0000-0000-0000-000000000003', 'DHPP',          '2025-02-20', '2024-02-20', 'completed', 'Dr. Lee',   NULL),
  (gen_random_uuid(), 'b0000000-0000-0000-0000-000000000003', 'Rabies',        '2025-10-15', NULL,         'upcoming',  NULL,         NULL),
  -- Bella
  (gen_random_uuid(), 'b0000000-0000-0000-0000-000000000004', 'FVRCP',         '2025-05-05', '2024-05-05', 'completed', 'Dr. Smith', NULL),
  (gen_random_uuid(), 'b0000000-0000-0000-0000-000000000004', 'Rabies',        '2025-07-20', NULL,         'upcoming',  NULL,         NULL),
  -- Charlie
  (gen_random_uuid(), 'b0000000-0000-0000-0000-000000000005', 'None',          '2025-01-01', NULL,         'completed', NULL,         'Hamster vaccinations N/A');

-- =============================================================================
-- 4. Vet Visits (matching src/features/health/HealthPage.tsx perPetVisits)
-- =============================================================================
INSERT INTO vet_visits (id, pet_id, date, reason, diagnosis, prescription, vet_name, cost, follow_up_date, notes)
VALUES
  -- Luna
  (gen_random_uuid(), 'b0000000-0000-0000-0000-000000000001', '2024-12-10', 'Annual checkup',   'Healthy',             NULL,               'Dr. Smith', 85.00,  NULL,         NULL),
  (gen_random_uuid(), 'b0000000-0000-0000-0000-000000000001', '2024-08-15', 'Hairball issues',  'Mild digestive upset', 'Hairball gel',     'Dr. Smith', 95.00,  NULL,         NULL),
  -- Max
  (gen_random_uuid(), 'b0000000-0000-0000-0000-000000000002', '2024-12-10', 'Annual checkup',         'Healthy',           NULL,                 'Dr. Smith', 85.00,  NULL,         NULL),
  (gen_random_uuid(), 'b0000000-0000-0000-0000-000000000002', '2024-09-05', 'Ear infection',          'Otitis externa',   'Otomax 2x/day',      'Dr. Lee',   120.00, '2024-09-19', NULL),
  (gen_random_uuid(), 'b0000000-0000-0000-0000-000000000002', '2024-06-20', 'Vaccination booster',    NULL,               NULL,                 'Dr. Smith', 65.00,  NULL,         NULL),
  -- Coco
  (gen_random_uuid(), 'b0000000-0000-0000-0000-000000000003', '2024-11-20', 'Skin allergy',           'Atopic dermatitis', 'Apoquel',            'Dr. Lee',   150.00, NULL,         NULL),
  (gen_random_uuid(), 'b0000000-0000-0000-0000-000000000003', '2024-07-10', 'Grooming + checkup',     NULL,               NULL,                 'Dr. Smith', 55.00,  NULL,         NULL),
  -- Bella
  (gen_random_uuid(), 'b0000000-0000-0000-0000-000000000004', '2024-10-05', 'Annual checkup',         'Healthy',           NULL,                 'Dr. Smith', 85.00,  NULL,         NULL),
  -- Charlie
  (gen_random_uuid(), 'b0000000-0000-0000-0000-000000000005', '2024-09-01', 'New pet checkup',        'Healthy',           NULL,                 'Dr. Smith', 50.00,  NULL,         NULL);

-- =============================================================================
-- 5. Medications (matching src/features/health/HealthPage.tsx perPetMedications)
-- =============================================================================
INSERT INTO medications (id, pet_id, name, dosage, frequency, start_date, end_date, is_active, notes)
VALUES
  -- Luna
  (gen_random_uuid(), 'b0000000-0000-0000-0000-000000000001', 'Hairball Relief', '1 tube',  'Weekly',      '2024-08-15', NULL, true,  NULL),
  -- Max
  (gen_random_uuid(), 'b0000000-0000-0000-0000-000000000002', 'Heartgard Plus',  '1 chew',  'Monthly',     '2024-01-15', NULL, true,  NULL),
  (gen_random_uuid(), 'b0000000-0000-0000-0000-000000000002', 'NexGard',         '1 tablet','Monthly',     '2024-01-15', NULL, true,  NULL),
  -- Coco
  (gen_random_uuid(), 'b0000000-0000-0000-0000-000000000003', 'Apoquel',         '1 tablet','Twice daily', '2024-11-20', NULL, true,  NULL),
  (gen_random_uuid(), 'b0000000-0000-0000-0000-000000000003', 'Heartgard Plus',  '1 chew',  'Monthly',     '2024-01-15', NULL, true,  NULL);

-- =============================================================================
-- 6. Activity Records (15 days per pet, matching src/features/activity/ActivityPage.tsx)
--    Dogs get more activity, cats moderate, hamster light
-- =============================================================================
INSERT INTO activity_records (id, pet_id, date, steps, distance, duration, calories)
SELECT gen_random_uuid(), pet_id::uuid, date::date, steps, distance, duration, calories
FROM (VALUES
  -- Luna (cat - moderate activity)
  ('b0000000-0000-0000-0000-000000000001', '2025-05-31', 3200, 1.2, 25, 90),
  ('b0000000-0000-0000-0000-000000000001', '2025-06-01', 2800, 1.0, 20, 78),
  ('b0000000-0000-0000-0000-000000000001', '2025-06-02', 4100, 1.5, 30, 110),
  ('b0000000-0000-0000-0000-000000000001', '2025-06-03', 3500, 1.3, 28, 95),
  ('b0000000-0000-0000-0000-000000000001', '2025-06-04', 2200, 0.8, 18, 65),
  ('b0000000-0000-0000-0000-000000000001', '2025-06-05', 4800, 1.7, 35, 125),
  ('b0000000-0000-0000-0000-000000000001', '2025-06-06', 3100, 1.1, 24, 88),
  ('b0000000-0000-0000-0000-000000000001', '2025-06-07', 5600, 2.0, 40, 145),
  ('b0000000-0000-0000-0000-000000000001', '2025-06-08', 2900, 1.1, 22, 82),
  ('b0000000-0000-0000-0000-000000000001', '2025-06-09', 3700, 1.4, 29, 100),
  ('b0000000-0000-0000-0000-000000000001', '2025-06-10', 4500, 1.6, 33, 118),
  ('b0000000-0000-0000-0000-000000000001', '2025-06-11', 2600, 0.9, 19, 72),
  ('b0000000-0000-0000-0000-000000000001', '2025-06-12', 3800, 1.4, 30, 105),
  ('b0000000-0000-0000-0000-000000000001', '2025-06-13', 4200, 1.5, 32, 112),
  ('b0000000-0000-0000-0000-000000000001', '2025-06-14', 3400, 1.2, 26, 92),
  -- Max (dog - high activity)
  ('b0000000-0000-0000-0000-000000000002', '2025-05-31', 7200, 4.5, 65, 280),
  ('b0000000-0000-0000-0000-000000000002', '2025-06-01', 8500, 5.2, 78, 320),
  ('b0000000-0000-0000-0000-000000000002', '2025-06-02', 6300, 3.8, 55, 245),
  ('b0000000-0000-0000-0000-000000000002', '2025-06-03', 9100, 5.7, 82, 350),
  ('b0000000-0000-0000-0000-000000000002', '2025-06-04', 7800, 4.8, 70, 295),
  ('b0000000-0000-0000-0000-000000000002', '2025-06-05', 5600, 3.5, 50, 220),
  ('b0000000-0000-0000-0000-000000000002', '2025-06-06', 8200, 5.0, 75, 310),
  ('b0000000-0000-0000-0000-000000000002', '2025-06-07', 9500, 5.9, 85, 370),
  ('b0000000-0000-0000-0000-000000000002', '2025-06-08', 6800, 4.2, 60, 260),
  ('b0000000-0000-0000-0000-000000000002', '2025-06-09', 7400, 4.6, 68, 285),
  ('b0000000-0000-0000-0000-000000000002', '2025-06-10', 8100, 5.1, 72, 305),
  ('b0000000-0000-0000-0000-000000000002', '2025-06-11', 5900, 3.7, 52, 230),
  ('b0000000-0000-0000-0000-000000000002', '2025-06-12', 8700, 5.4, 80, 335),
  ('b0000000-0000-0000-0000-000000000002', '2025-06-13', 7600, 4.7, 68, 290),
  ('b0000000-0000-0000-0000-000000000002', '2025-06-14', 7000, 4.3, 62, 270),
  -- Coco (dog - moderate to high activity)
  ('b0000000-0000-0000-0000-000000000003', '2025-05-31', 5800, 3.2, 48, 210),
  ('b0000000-0000-0000-0000-000000000003', '2025-06-01', 6400, 3.6, 55, 235),
  ('b0000000-0000-0000-0000-000000000003', '2025-06-02', 5100, 2.8, 42, 190),
  ('b0000000-0000-0000-0000-000000000003', '2025-06-03', 7200, 4.1, 62, 265),
  ('b0000000-0000-0000-0000-000000000003', '2025-06-04', 4800, 2.6, 38, 175),
  ('b0000000-0000-0000-0000-000000000003', '2025-06-05', 6900, 3.9, 58, 250),
  ('b0000000-0000-0000-0000-000000000003', '2025-06-06', 5500, 3.0, 45, 205),
  ('b0000000-0000-0000-0000-000000000003', '2025-06-07', 7600, 4.3, 65, 280),
  ('b0000000-0000-0000-0000-000000000003', '2025-06-08', 6100, 3.4, 50, 225),
  ('b0000000-0000-0000-0000-000000000003', '2025-06-09', 5300, 2.9, 44, 198),
  ('b0000000-0000-0000-0000-000000000003', '2025-06-10', 6700, 3.8, 56, 245),
  ('b0000000-0000-0000-0000-000000000003', '2025-06-11', 4900, 2.7, 40, 182),
  ('b0000000-0000-0000-0000-000000000003', '2025-06-12', 7100, 4.0, 60, 260),
  ('b0000000-0000-0000-0000-000000000003', '2025-06-13', 5900, 3.3, 48, 218),
  ('b0000000-0000-0000-0000-000000000003', '2025-06-14', 6300, 3.5, 52, 230),
  -- Bella (cat - moderate activity)
  ('b0000000-0000-0000-0000-000000000004', '2025-05-31', 2400, 0.9, 18, 72),
  ('b0000000-0000-0000-0000-000000000004', '2025-06-01', 3100, 1.2, 24, 88),
  ('b0000000-0000-0000-0000-000000000004', '2025-06-02', 2800, 1.0, 20, 78),
  ('b0000000-0000-0000-0000-000000000004', '2025-06-03', 3500, 1.3, 26, 96),
  ('b0000000-0000-0000-0000-000000000004', '2025-06-04', 1900, 0.7, 15, 58),
  ('b0000000-0000-0000-0000-000000000004', '2025-06-05', 4200, 1.5, 32, 112),
  ('b0000000-0000-0000-0000-000000000004', '2025-06-06', 2700, 1.0, 22, 75),
  ('b0000000-0000-0000-0000-000000000004', '2025-06-07', 3800, 1.4, 28, 102),
  ('b0000000-0000-0000-0000-000000000004', '2025-06-08', 3300, 1.2, 25, 90),
  ('b0000000-0000-0000-0000-000000000004', '2025-06-09', 2600, 0.9, 20, 72),
  ('b0000000-0000-0000-0000-000000000004', '2025-06-10', 4000, 1.5, 30, 108),
  ('b0000000-0000-0000-0000-000000000004', '2025-06-11', 2200, 0.8, 17, 65),
  ('b0000000-0000-0000-0000-000000000004', '2025-06-12', 3600, 1.3, 27, 98),
  ('b0000000-0000-0000-0000-000000000004', '2025-06-13', 4500, 1.6, 34, 120),
  ('b0000000-0000-0000-0000-000000000004', '2025-06-14', 2900, 1.1, 22, 82),
  -- Charlie (hamster - light activity)
  ('b0000000-0000-0000-0000-000000000005', '2025-05-31', 800,  0.1, 10, 15),
  ('b0000000-0000-0000-0000-000000000005', '2025-06-01', 1200, 0.1, 15, 22),
  ('b0000000-0000-0000-0000-000000000005', '2025-06-02', 600,  0.1, 8,  12),
  ('b0000000-0000-0000-0000-000000000005', '2025-06-03', 1400, 0.2, 18, 28),
  ('b0000000-0000-0000-0000-000000000005', '2025-06-04', 900,  0.1, 12, 18),
  ('b0000000-0000-0000-0000-000000000005', '2025-06-05', 700,  0.1, 9,  14),
  ('b0000000-0000-0000-0000-000000000005', '2025-06-06', 1100, 0.1, 14, 20),
  ('b0000000-0000-0000-0000-000000000005', '2025-06-07', 1500, 0.2, 20, 30),
  ('b0000000-0000-0000-0000-000000000005', '2025-06-08', 500,  0.0, 6,  10),
  ('b0000000-0000-0000-0000-000000000005', '2025-06-09', 1300, 0.2, 16, 25),
  ('b0000000-0000-0000-0000-000000000005', '2025-06-10', 1000, 0.1, 13, 19),
  ('b0000000-0000-0000-0000-000000000005', '2025-06-11', 750,  0.1, 10, 15),
  ('b0000000-0000-0000-0000-000000000005', '2025-06-12', 950,  0.1, 12, 18),
  ('b0000000-0000-0000-0000-000000000005', '2025-06-13', 1250, 0.2, 16, 24),
  ('b0000000-0000-0000-0000-000000000005', '2025-06-14', 850,  0.1, 11, 17)
) AS t(pet_id, date, steps, distance, duration, calories);

-- =============================================================================
-- 7. Feeding Records (today's schedule per pet, matching src/features/feeding/FeedingPage.tsx)
-- =============================================================================
INSERT INTO feeding_records (id, pet_id, meal_time, food, portion, notes)
VALUES
  -- Luna: 3 meals (2 fed, 1 pending)
  (gen_random_uuid(), 'b0000000-0000-0000-0000-000000000001', '2025-06-14T08:00:00Z', 'Purina Cat Chow',  '0.5 cup',  NULL),
  (gen_random_uuid(), 'b0000000-0000-0000-0000-000000000001', '2025-06-14T12:00:00Z', 'Purina Cat Chow',  '1.0 cup',  NULL),
  (gen_random_uuid(), 'b0000000-0000-0000-0000-000000000001', '2025-06-14T18:00:00Z', 'Purina Cat Chow',  '1.5 cup',  NULL),
  -- Max: 2 meals (both fed)
  (gen_random_uuid(), 'b0000000-0000-0000-0000-000000000002', '2025-06-14T07:30:00Z', 'Royal Canin Large', '1.0 cup',  NULL),
  (gen_random_uuid(), 'b0000000-0000-0000-0000-000000000002', '2025-06-14T17:30:00Z', 'Royal Canin Large', '1.5 cup',  NULL),
  -- Coco: 3 meals (2 fed, 1 pending)
  (gen_random_uuid(), 'b0000000-0000-0000-0000-000000000003', '2025-06-14T08:00:00Z', 'Hill''s Science Diet', '0.5 cup',  NULL),
  (gen_random_uuid(), 'b0000000-0000-0000-0000-000000000003', '2025-06-14T12:00:00Z', 'Hill''s Science Diet', '1.0 cup',  NULL),
  (gen_random_uuid(), 'b0000000-0000-0000-0000-000000000003', '2025-06-14T18:00:00Z', 'Hill''s Science Diet', '1.5 cup',  NULL),
  -- Bella: 2 meals (1 fed, 1 pending)
  (gen_random_uuid(), 'b0000000-0000-0000-0000-000000000004', '2025-06-14T08:30:00Z', 'Friskies',          '0.5 cup',  NULL),
  (gen_random_uuid(), 'b0000000-0000-0000-0000-000000000004', '2025-06-14T17:00:00Z', 'Friskies',          '1.0 cup',  NULL),
  -- Charlie: 2 meals (both fed)
  (gen_random_uuid(), 'b0000000-0000-0000-0000-000000000005', '2025-06-14T09:00:00Z', 'Sunflower seeds',   '1 tbsp',   NULL),
  (gen_random_uuid(), 'b0000000-0000-0000-0000-000000000005', '2025-06-14T21:00:00Z', 'Sunflower seeds',   '1 tbsp',   NULL);

-- =============================================================================
-- 8. Appointments (matching src/features/appointments/AppointmentsPage.tsx mockAppointments)
--    Using fixed dates derived from a "today" of 2025-06-14
-- =============================================================================
INSERT INTO appointments (id, pet_id, date, time, type, vet_name, notes)
VALUES
  -- Luna: today + tomorrow
  (gen_random_uuid(), 'b0000000-0000-0000-0000-000000000001', '2025-06-14', '10:00', 'Annual Checkup', 'Dr. Smith', 'Bring stool sample'),
  (gen_random_uuid(), 'b0000000-0000-0000-0000-000000000001', '2025-06-15', '14:30', 'Vaccination',    'Dr. Smith', NULL),
  -- Max: tomorrow + 7 days
  (gen_random_uuid(), 'b0000000-0000-0000-0000-000000000002', '2025-06-15', '09:00', 'Dental Cleaning', 'Dr. Lee',   'Fast after 8pm'),
  (gen_random_uuid(), 'b0000000-0000-0000-0000-000000000002', '2025-06-21', '11:00', 'Follow-up',       'Dr. Lee',   NULL),
  -- Coco: today
  (gen_random_uuid(), 'b0000000-0000-0000-0000-000000000003', '2025-06-14', '16:00', 'Skin Check',      'Dr. Lee',   NULL),
  -- Bella: 7 days
  (gen_random_uuid(), 'b0000000-0000-0000-0000-000000000004', '2025-06-21', '10:30', 'Annual Checkup',  'Dr. Smith', NULL);
  -- Charlie: no appointments

-- =============================================================================
-- 9. Reminders (sample reminders across pets)
-- =============================================================================
INSERT INTO reminders (id, pet_id, type, title, description, due_date, priority, is_recurring, is_completed)
VALUES
  -- Luna
  (gen_random_uuid(), 'b0000000-0000-0000-0000-000000000001', 'vaccination', 'Rabies booster due',        '3-year rabies vaccine coming up',      '2025-08-15', 'high',   false, false),
  (gen_random_uuid(), 'b0000000-0000-0000-0000-000000000001', 'medication',  'Weekly hairball gel',        'Give hairball relief gel',             '2025-06-16', 'medium', true,  false),
  -- Max
  (gen_random_uuid(), 'b0000000-0000-0000-0000-000000000002', 'medication',  'Monthly Heartgard',          'Give Heartgard Plus chew',             '2025-06-15', 'high',   true,  false),
  (gen_random_uuid(), 'b0000000-0000-0000-0000-000000000002', 'medication',  'Monthly NexGard',            'Give NexGard flea/tick tablet',        '2025-06-15', 'high',   true,  false),
  (gen_random_uuid(), 'b0000000-0000-0000-0000-000000000002', 'vaccination', 'DHPP overdue!',              'Annual booster is overdue - schedule now', '2025-06-15', 'high',   false, false),
  (gen_random_uuid(), 'b0000000-0000-0000-0000-000000000002', 'checkup',     'Dental cleaning appointment','Scheduled for June 15 with Dr. Lee',   '2025-06-15', 'medium', false, false),
  -- Coco
  (gen_random_uuid(), 'b0000000-0000-0000-0000-000000000003', 'medication',  'Apoquel twice daily',        'Give Apoquel tablet morning and night','2025-06-14', 'high',   true,  true),
  (gen_random_uuid(), 'b0000000-0000-0000-0000-000000000003', 'grooming',    'Grooming appointment',        'Poodle grooming every 6 weeks',        '2025-07-01', 'low',    false, false),
  -- Bella
  (gen_random_uuid(), 'b0000000-0000-0000-0000-000000000004', 'vaccination', 'Rabies vaccination',          'Due July 20',                          '2025-07-20', 'medium', false, false),
  -- Charlie
  (gen_random_uuid(), 'b0000000-0000-0000-0000-000000000005', 'feeding',    'Daily food refill',           'Refill sunflower seeds and water',     '2025-06-14', 'low',    true,  true),
  (gen_random_uuid(), 'b0000000-0000-0000-0000-000000000005', 'custom',     'Cage cleaning',               'Deep clean Charlie''s cage',           '2025-06-20', 'low',    false, false),

  -- Household reminders (petId references Luna as the associated pet)
  (gen_random_uuid(), 'b0000000-0000-0000-0000-000000000001', 'checkup',   'Yearly wellness exam',        'All pets due for annual checkup',      '2025-07-01', 'medium', false, false);

-- =============================================================================
-- 10. Pet Moments (for Dashboard gallery, 3-4 per pet per type)
-- =============================================================================
INSERT INTO pet_moments (id, pet_id, image_url, caption, moment_type, taken_at)
SELECT gen_random_uuid(), pet_id::uuid, image_url, caption, moment_type, taken_at::date
FROM (VALUES
  -- Luna (cat)
  ('b0000000-0000-0000-0000-000000000001', 'https://picsum.photos/seed/luna-daily-1/400/400', '窗边晒太阳 🌤️', 'daily', '2025-06-10'),
  ('b0000000-0000-0000-0000-000000000001', 'https://picsum.photos/seed/luna-daily-2/400/400', '追逐蝴蝶 🦋', 'daily', '2025-06-11'),
  ('b0000000-0000-0000-0000-000000000001', 'https://picsum.photos/seed/luna-daily-3/400/400', '纸箱里打盹 📦', 'daily', '2025-06-12'),
  ('b0000000-0000-0000-0000-000000000001', 'https://picsum.photos/seed/luna-interact-1/600/450', '梳毛时光 🐱', 'interaction', '2025-06-08'),
  ('b0000000-0000-0000-0000-000000000001', 'https://picsum.photos/seed/luna-interact-2/600/450', '逗猫棒大战 🪄', 'interaction', '2025-06-05'),
  ('b0000000-0000-0000-0000-000000000001', 'https://picsum.photos/seed/luna-growth-1/400/500', '小猫到家第一天 🐣', 'growth', '2023-01-15'),
  ('b0000000-0000-0000-0000-000000000001', 'https://picsum.photos/seed/luna-growth-2/400/500', '一岁啦 🎂', 'growth', '2024-03-15'),
  ('b0000000-0000-0000-0000-000000000001', 'https://picsum.photos/seed/luna-growth-3/400/500', '现在的大美人 ✨', 'growth', '2025-06-01'),
  -- Max (dog)
  ('b0000000-0000-0000-0000-000000000002', 'https://picsum.photos/seed/max-daily-1/400/400', '公园狂奔 🐕', 'daily', '2025-06-12'),
  ('b0000000-0000-0000-0000-000000000002', 'https://picsum.photos/seed/max-daily-2/400/400', '叼着球回来 🎾', 'daily', '2025-06-11'),
  ('b0000000-0000-0000-0000-000000000002', 'https://picsum.photos/seed/max-daily-3/400/400', '雨中散步 🌧️', 'daily', '2025-06-09'),
  ('b0000000-0000-0000-0000-000000000002', 'https://picsum.photos/seed/max-interact-1/600/450', '飞盘接球 🥏', 'interaction', '2025-06-10'),
  ('b0000000-0000-0000-0000-000000000002', 'https://picsum.photos/seed/max-interact-2/600/450', '早晨拥抱 🤗', 'interaction', '2025-06-08'),
  ('b0000000-0000-0000-0000-000000000002', 'https://picsum.photos/seed/max-growth-1/400/500', '幼犬时期 🐶', 'growth', '2019-07-20'),
  ('b0000000-0000-0000-0000-000000000002', 'https://picsum.photos/seed/max-growth-2/400/500', '帅气一岁 🏆', 'growth', '2020-07-20'),
  ('b0000000-0000-0000-0000-000000000002', 'https://picsum.photos/seed/max-growth-3/400/500', '今天的Max 💪', 'growth', '2025-06-01'),
  -- Coco (poodle)
  ('b0000000-0000-0000-0000-000000000003', 'https://picsum.photos/seed/coco-daily-1/400/400', '美容后自恋 💇', 'daily', '2025-06-13'),
  ('b0000000-0000-0000-0000-000000000003', 'https://picsum.photos/seed/coco-daily-2/400/400', '小步快跑 🏃', 'daily', '2025-06-10'),
  ('b0000000-0000-0000-0000-000000000003', 'https://picsum.photos/seed/coco-daily-3/400/400', '玩具收藏 🧸', 'daily', '2025-06-08'),
  ('b0000000-0000-0000-0000-000000000003', 'https://picsum.photos/seed/coco-interact-1/600/450', '教新把戏 🎪', 'interaction', '2025-06-07'),
  ('b0000000-0000-0000-0000-000000000003', 'https://picsum.photos/seed/coco-interact-2/600/450', '沙发依偎 🛋️', 'interaction', '2025-06-05'),
  ('b0000000-0000-0000-0000-000000000003', 'https://picsum.photos/seed/coco-growth-1/400/500', '到家第一天 🏠', 'growth', '2022-11-05'),
  ('b0000000-0000-0000-0000-000000000003', 'https://picsum.photos/seed/coco-growth-2/400/500', '现在的Coco 🌟', 'growth', '2025-06-01'),
  -- Bella (cat)
  ('b0000000-0000-0000-0000-000000000004', 'https://picsum.photos/seed/bella-daily-1/400/400', '爬架最高处 🐈', 'daily', '2025-06-12'),
  ('b0000000-0000-0000-0000-000000000004', 'https://picsum.photos/seed/bella-daily-2/400/400', '偷看窗外 👀', 'daily', '2025-06-11'),
  ('b0000000-0000-0000-0000-000000000004', 'https://picsum.photos/seed/bella-daily-3/400/400', '午睡三小时 💤', 'daily', '2025-06-09'),
  ('b0000000-0000-0000-0000-000000000004', 'https://picsum.photos/seed/bella-interact-1/600/450', '摸摸肚肚 🤲', 'interaction', '2025-06-06'),
  ('b0000000-0000-0000-0000-000000000004', 'https://picsum.photos/seed/bella-interact-2/600/450', '激光点追踪 🔴', 'interaction', '2025-06-04'),
  ('b0000000-0000-0000-0000-000000000004', 'https://picsum.photos/seed/bella-growth-1/400/500', '领养时的小可爱 🥺', 'growth', '2023-09-12'),
  ('b0000000-0000-0000-0000-000000000004', 'https://picsum.photos/seed/bella-growth-2/400/500', '半年后 😊', 'growth', '2024-03-12'),
  ('b0000000-0000-0000-0000-000000000004', 'https://picsum.photos/seed/bella-growth-3/400/500', '现在的女王 👑', 'growth', '2025-06-01'),
  -- Charlie (hamster)
  ('b0000000-0000-0000-0000-000000000005', 'https://picsum.photos/seed/charlie-daily-1/400/400', '跑轮时间 ⚡', 'daily', '2025-06-12'),
  ('b0000000-0000-0000-0000-000000000005', 'https://picsum.photos/seed/charlie-daily-2/400/400', '藏食物 🥜', 'daily', '2025-06-10'),
  ('b0000000-0000-0000-0000-000000000005', 'https://picsum.photos/seed/charlie-daily-3/400/400', '钻木屑 🪵', 'daily', '2025-06-08'),
  ('b0000000-0000-0000-0000-000000000005', 'https://picsum.photos/seed/charlie-interact-1/600/450', '手心喂食 🖐️', 'interaction', '2025-06-07'),
  ('b0000000-0000-0000-0000-000000000005', 'https://picsum.photos/seed/charlie-interact-2/600/450', '探险时间 🧭', 'interaction', '2025-06-05'),
  ('b0000000-0000-0000-0000-000000000005', 'https://picsum.photos/seed/charlie-growth-1/400/500', '刚到家 🐹', 'growth', '2024-06-01'),
  ('b0000000-0000-0000-0000-000000000005', 'https://picsum.photos/seed/charlie-growth-2/400/500', '两个月后 🥰', 'growth', '2024-08-01'),
  ('b0000000-0000-0000-0000-000000000005', 'https://picsum.photos/seed/charlie-growth-3/400/500', '现在的Charlie 🏋️', 'growth', '2025-06-01')
) AS t(pet_id, image_url, caption, moment_type, taken_at);

-- =============================================================================
-- Done. Summary:
--   1 household, 5 pets, 12 vaccinations, 9 vet visits, 5 medications,
--   75 activity records (15 per pet), 12 feeding records, 6 appointments,
--   12 reminders, 39 pet moments
-- =============================================================================
