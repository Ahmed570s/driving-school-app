-- ============================================================================
-- DRIVING SCHOOL DATABASE SEED DATA (SUPABASE COMPATIBLE)
-- ============================================================================
-- This script works with Supabase's authentication system
-- STEP 1: Create users in Supabase Auth Dashboard FIRST
-- STEP 2: Run this script in Supabase SQL Editor
-- ============================================================================

-- STEP 1: Create these users in Supabase Auth Dashboard first:
-- Go to Authentication → Users → Add user
-- 
-- 🔐 REQUIRED USERS TO CREATE (14 total):
--
-- 1 ADMIN:
-- admin@example.com (password: admin)
--
-- 3 INSTRUCTORS:
-- david.instructor@example.com (password: instructor)
-- lisa.instructor@example.com (password: instructor)
-- james.instructor@example.com (password: instructor)
--
-- 10 STUDENTS:
-- emma.wilson@example.com (password: student) ← Full profile
-- john.smith@example.com (password: student) ← Full profile
-- alice.brown@example.com (password: student)
-- robert.johnson@example.com (password: student)
-- sarah.davis@example.com (password: student)
-- michael.taylor@example.com (password: student)
-- jessica.martinez@example.com (password: student)
-- daniel.white@example.com (password: student)
-- emily.anderson@example.com (password: student)
-- kevin.thompson@example.com (password: student)

-- ============================================================================
-- STEP 2: Run this script in Supabase SQL Editor
-- ============================================================================

-- Clear existing data (optional - uncomment if re-running)
-- DELETE FROM activity_logs;
-- DELETE FROM documents;
-- DELETE FROM class_attendances;
-- DELETE FROM classes;
-- DELETE FROM student_groups;
-- DELETE FROM groups;
-- DELETE FROM students;
-- DELETE FROM instructors;
-- DELETE FROM profiles;

-- ============================================================================
-- 1. PROFILES (Uses real Supabase Auth UUIDs)
-- ============================================================================

INSERT INTO profiles (id, email, role, status, first_name, last_name, phone, whatsapp, street_address, apartment, city, postal_code, province, country)
SELECT 
  au.id,
  au.email,
  CASE 
    WHEN au.email = 'admin@example.com' THEN 'admin'::user_role
    WHEN au.email LIKE '%.instructor@%' THEN 'instructor'::user_role
    ELSE 'student'::user_role
  END as role,
  CASE 
    WHEN au.email = 'sarah.davis@example.com' THEN 'inactive'::user_status
    ELSE 'active'::user_status
  END as status,
  CASE au.email
    -- Admin
    WHEN 'admin@example.com' THEN 'Sarah'
    -- Instructors
    WHEN 'david.instructor@example.com' THEN 'David'
    WHEN 'lisa.instructor@example.com' THEN 'Lisa'
    WHEN 'james.instructor@example.com' THEN 'James'
    -- Students
    WHEN 'emma.wilson@example.com' THEN 'Emma'
    WHEN 'john.smith@example.com' THEN 'John'
    WHEN 'alice.brown@example.com' THEN 'Alice'
    WHEN 'robert.johnson@example.com' THEN 'Robert'
    WHEN 'sarah.davis@example.com' THEN 'Sarah'
    WHEN 'michael.taylor@example.com' THEN 'Michael'
    WHEN 'jessica.martinez@example.com' THEN 'Jessica'
    WHEN 'daniel.white@example.com' THEN 'Daniel'
    WHEN 'emily.anderson@example.com' THEN 'Emily'
    WHEN 'kevin.thompson@example.com' THEN 'Kevin'
  END as first_name,
  CASE au.email
    -- Admin
    WHEN 'admin@example.com' THEN 'Anderson'
    -- Instructors
    WHEN 'david.instructor@example.com' THEN 'Thompson'
    WHEN 'lisa.instructor@example.com' THEN 'Rodriguez'
    WHEN 'james.instructor@example.com' THEN 'Kumar'
    -- Students
    WHEN 'emma.wilson@example.com' THEN 'Wilson'
    WHEN 'john.smith@example.com' THEN 'Smith'
    WHEN 'alice.brown@example.com' THEN 'Brown'
    WHEN 'robert.johnson@example.com' THEN 'Johnson'
    WHEN 'sarah.davis@example.com' THEN 'Davis'
    WHEN 'michael.taylor@example.com' THEN 'Taylor'
    WHEN 'jessica.martinez@example.com' THEN 'Martinez'
    WHEN 'daniel.white@example.com' THEN 'White'
    WHEN 'emily.anderson@example.com' THEN 'Anderson'
    WHEN 'kevin.thompson@example.com' THEN 'Thompson'
  END as last_name,
  CASE au.email
    -- Admin
    WHEN 'admin@example.com' THEN '+14165550001'
    -- Instructors
    WHEN 'david.instructor@example.com' THEN '+14165550103'
    WHEN 'lisa.instructor@example.com' THEN '+14165550104'
    WHEN 'james.instructor@example.com' THEN '+14165550105'
    -- Students
    WHEN 'emma.wilson@example.com' THEN '+14165550201'
    WHEN 'john.smith@example.com' THEN '+14165550202'
    WHEN 'alice.brown@example.com' THEN '+14165550203'
    WHEN 'robert.johnson@example.com' THEN '+14165550204'
    WHEN 'sarah.davis@example.com' THEN '+14165550205'
    WHEN 'michael.taylor@example.com' THEN '+14165550206'
    WHEN 'jessica.martinez@example.com' THEN '+14165550207'
    WHEN 'daniel.white@example.com' THEN '+14165550208'
    WHEN 'emily.anderson@example.com' THEN '+14165550209'
    WHEN 'kevin.thompson@example.com' THEN '+14165550210'
  END as phone,
  CASE au.email
    -- Admin
    WHEN 'admin@example.com' THEN '+14165550001'
    -- Instructors
    WHEN 'david.instructor@example.com' THEN '+14165550103'
    WHEN 'lisa.instructor@example.com' THEN '+14165550104'
    WHEN 'james.instructor@example.com' THEN '+14165550105'
    -- Students
    WHEN 'emma.wilson@example.com' THEN '+14165550201'
    WHEN 'john.smith@example.com' THEN '+14165550202'
    WHEN 'alice.brown@example.com' THEN '+14165550203'
    WHEN 'robert.johnson@example.com' THEN '+14165550204'
    WHEN 'sarah.davis@example.com' THEN '+14165550205'
    WHEN 'michael.taylor@example.com' THEN '+14165550206'
    WHEN 'jessica.martinez@example.com' THEN '+14165550207'
    WHEN 'daniel.white@example.com' THEN '+14165550208'
    WHEN 'emily.anderson@example.com' THEN '+14165550209'
    WHEN 'kevin.thompson@example.com' THEN '+14165550210'
  END as whatsapp,
  CASE au.email
    -- Admin
    WHEN 'admin@example.com' THEN '123 Main Street'
    -- Instructors
    WHEN 'david.instructor@example.com' THEN '789 King Street'
    WHEN 'lisa.instructor@example.com' THEN '321 Dundas Street'
    WHEN 'james.instructor@example.com' THEN '654 Bloor Street'
    -- Students
    WHEN 'emma.wilson@example.com' THEN '123 Residential Ave'
    WHEN 'john.smith@example.com' THEN '456 Student Street'
    WHEN 'alice.brown@example.com' THEN '789 Learning Lane'
    WHEN 'robert.johnson@example.com' THEN '321 Drive Way'
    WHEN 'sarah.davis@example.com' THEN '654 Practice Blvd'
    WHEN 'michael.taylor@example.com' THEN '987 Highway Road'
    WHEN 'jessica.martinez@example.com' THEN '147 Success Street'
    WHEN 'daniel.white@example.com' THEN '258 Progress Ave'
    WHEN 'emily.anderson@example.com' THEN '369 Challenge Court'
    WHEN 'kevin.thompson@example.com' THEN '741 Education Blvd'
  END as street_address,
  CASE au.email
    -- Admin
    WHEN 'admin@example.com' THEN 'Suite 200'
    -- Instructors
    WHEN 'david.instructor@example.com' THEN 'Apt 12'
    WHEN 'james.instructor@example.com' THEN 'Unit 5'
    -- Students
    WHEN 'emma.wilson@example.com' THEN 'Apt 4B'
    WHEN 'alice.brown@example.com' THEN 'Unit 12'
    WHEN 'sarah.davis@example.com' THEN 'Apt 8'
    WHEN 'jessica.martinez@example.com' THEN 'Unit 3'
    WHEN 'emily.anderson@example.com' THEN 'Apt 15'
    ELSE NULL
  END as apartment,
  'Toronto' as city,
  CASE au.email
    -- Admin
    WHEN 'admin@example.com' THEN 'M5V 3A8'
    -- Instructors
    WHEN 'david.instructor@example.com' THEN 'M5A 1J6'
    WHEN 'lisa.instructor@example.com' THEN 'M5T 1G5'
    WHEN 'james.instructor@example.com' THEN 'M6G 1K5'
    -- Students
    WHEN 'emma.wilson@example.com' THEN 'M4E 2K3'
    WHEN 'john.smith@example.com' THEN 'M4W 1L7'
    WHEN 'alice.brown@example.com' THEN 'M5S 2P1'
    WHEN 'robert.johnson@example.com' THEN 'M4Y 1N4'
    WHEN 'sarah.davis@example.com' THEN 'M5R 2L3'
    WHEN 'michael.taylor@example.com' THEN 'M6K 3R1'
    WHEN 'jessica.martinez@example.com' THEN 'M4P 1Y8'
    WHEN 'daniel.white@example.com' THEN 'M3N 2G4'
    WHEN 'emily.anderson@example.com' THEN 'M2M 4H6'
    WHEN 'kevin.thompson@example.com' THEN 'M1S 5T2'
  END as postal_code,
  'Ontario' as province,
  'Canada' as country
FROM auth.users au
WHERE au.email IN (
  'admin@example.com',
  'david.instructor@example.com',
  'lisa.instructor@example.com',
  'james.instructor@example.com',
  'emma.wilson@example.com',
  'john.smith@example.com',
  'alice.brown@example.com',
  'robert.johnson@example.com',
  'sarah.davis@example.com',
  'michael.taylor@example.com',
  'jessica.martinez@example.com',
  'daniel.white@example.com',
  'emily.anderson@example.com',
  'kevin.thompson@example.com'
);

-- ============================================================================
-- 2. INSTRUCTORS (3 total)
-- ============================================================================

INSERT INTO instructors (profile_id, employee_id, hire_date, status, license_number, certification_expiry, specializations, theory_hours_taught, practical_hours_taught)
SELECT 
  p.id as profile_id,
  CASE p.email
    WHEN 'david.instructor@example.com' THEN 'INST001'
    WHEN 'lisa.instructor@example.com' THEN 'INST002'
    WHEN 'james.instructor@example.com' THEN 'INST003'
  END as employee_id,
  CASE p.email
    WHEN 'david.instructor@example.com' THEN '2022-01-15'::date
    WHEN 'lisa.instructor@example.com' THEN '2021-08-20'::date
    WHEN 'james.instructor@example.com' THEN '2023-03-10'::date
  END as hire_date,
  'active'::instructor_status as status,
  CASE p.email
    WHEN 'david.instructor@example.com' THEN 'ON-INST-12345'
    WHEN 'lisa.instructor@example.com' THEN 'ON-INST-23456'
    WHEN 'james.instructor@example.com' THEN 'ON-INST-34567'
  END as license_number,
  CASE p.email
    WHEN 'david.instructor@example.com' THEN '2025-12-31'::date
    WHEN 'lisa.instructor@example.com' THEN '2025-08-20'::date
    WHEN 'james.instructor@example.com' THEN '2026-03-10'::date
  END as certification_expiry,
  CASE p.email
    WHEN 'david.instructor@example.com' THEN ARRAY['highway', 'defensive', 'night']
    WHEN 'lisa.instructor@example.com' THEN ARRAY['city', 'parallel_parking', 'winter']
    WHEN 'james.instructor@example.com' THEN ARRAY['highway', 'city', 'defensive']
  END as specializations,
  CASE p.email
    WHEN 'david.instructor@example.com' THEN 240
    WHEN 'lisa.instructor@example.com' THEN 180
    WHEN 'james.instructor@example.com' THEN 160
  END as theory_hours_taught,
  CASE p.email
    WHEN 'david.instructor@example.com' THEN 520
    WHEN 'lisa.instructor@example.com' THEN 380
    WHEN 'james.instructor@example.com' THEN 290
  END as practical_hours_taught
FROM profiles p
WHERE p.role = 'instructor';

-- ============================================================================
-- 3. GROUPS (4 total)
-- ============================================================================

INSERT INTO groups (name, description, capacity, current_enrollment, status, start_date, end_date, primary_instructor_id) 
SELECT 
  g.name,
  g.description,
  g.capacity,
  g.current_enrollment,
  g.status::group_status,
  g.start_date,
  g.end_date,
  i.profile_id as primary_instructor_id
FROM (
  VALUES 
    ('Group A - Morning Theory', 'Morning theory classes for new students', 25, 6, 'active', '2024-01-15'::date, '2024-04-15'::date, 'INST001'),
    ('Group B - Evening Theory', 'Evening theory classes for working students', 25, 4, 'active', '2024-01-20'::date, '2024-04-20'::date, 'INST002'),
    ('Group C - Weekend Theory', 'Weekend theory classes for busy students', 25, 2, 'active', '2024-02-01'::date, '2024-05-01'::date, 'INST003'),
    ('Group D - Advanced Theory', 'Advanced theory for phase 3-4 students', 20, 3, 'active', '2024-02-15'::date, '2024-05-15'::date, 'INST001')
) AS g(name, description, capacity, current_enrollment, status, start_date, end_date, employee_id)
JOIN instructors i ON i.employee_id = g.employee_id;

-- ============================================================================
-- 4. STUDENTS (10 total)
-- ============================================================================

INSERT INTO students (profile_id, student_id, date_of_birth, learner_license_number, status, current_phase, total_hours_completed, theory_hours_completed, practical_hours_completed, enrollment_date, needs_support, attendance_issues, has_balance, has_missing_classes)
SELECT 
  p.id as profile_id,
  CASE p.email
    WHEN 'emma.wilson@example.com' THEN 'DS2024001'
    WHEN 'john.smith@example.com' THEN 'DS2024002'
    WHEN 'alice.brown@example.com' THEN 'DS2024003'
    WHEN 'robert.johnson@example.com' THEN 'DS2024004'
    WHEN 'sarah.davis@example.com' THEN 'DS2024005'
    WHEN 'michael.taylor@example.com' THEN 'DS2024006'
    WHEN 'jessica.martinez@example.com' THEN 'DS2024007'
    WHEN 'daniel.white@example.com' THEN 'DS2024008'
    WHEN 'emily.anderson@example.com' THEN 'DS2024009'
    WHEN 'kevin.thompson@example.com' THEN 'DS2024010'
  END as student_id,
  CASE p.email
    WHEN 'emma.wilson@example.com' THEN '1998-05-15'::date
    WHEN 'john.smith@example.com' THEN '1995-08-22'::date
    WHEN 'alice.brown@example.com' THEN '1999-03-10'::date
    WHEN 'robert.johnson@example.com' THEN '1997-11-30'::date
    WHEN 'sarah.davis@example.com' THEN '2000-07-18'::date
    WHEN 'michael.taylor@example.com' THEN '1996-12-05'::date
    WHEN 'jessica.martinez@example.com' THEN '1998-09-14'::date
    WHEN 'daniel.white@example.com' THEN '1999-04-25'::date
    WHEN 'emily.anderson@example.com' THEN '2001-01-12'::date
    WHEN 'kevin.thompson@example.com' THEN '1997-06-08'::date
  END as date_of_birth,
  CASE p.email
    WHEN 'emma.wilson@example.com' THEN 'ON-L-987654321'
    WHEN 'john.smith@example.com' THEN 'ON-L-876543210'
    WHEN 'alice.brown@example.com' THEN 'ON-L-765432109'
    WHEN 'robert.johnson@example.com' THEN 'ON-L-654321098'
    WHEN 'sarah.davis@example.com' THEN 'ON-L-543210987'
    WHEN 'michael.taylor@example.com' THEN 'ON-L-432109876'
    WHEN 'jessica.martinez@example.com' THEN 'ON-L-321098765'
    WHEN 'daniel.white@example.com' THEN 'ON-L-210987654'
    WHEN 'emily.anderson@example.com' THEN 'ON-L-109876543'
    WHEN 'kevin.thompson@example.com' THEN 'ON-L-098765432'
  END as learner_license_number,
  CASE p.email
    WHEN 'emma.wilson@example.com' THEN 'active'::student_status
    WHEN 'john.smith@example.com' THEN 'active'::student_status
    WHEN 'alice.brown@example.com' THEN 'active'::student_status
    WHEN 'robert.johnson@example.com' THEN 'active'::student_status
    WHEN 'sarah.davis@example.com' THEN 'on_hold'::student_status
    WHEN 'michael.taylor@example.com' THEN 'active'::student_status
    WHEN 'jessica.martinez@example.com' THEN 'completed'::student_status
    WHEN 'daniel.white@example.com' THEN 'active'::student_status
    WHEN 'emily.anderson@example.com' THEN 'dropped'::student_status
    WHEN 'kevin.thompson@example.com' THEN 'active'::student_status
  END as status,
  CASE p.email
    WHEN 'emma.wilson@example.com' THEN '2'::student_phase
    WHEN 'john.smith@example.com' THEN '3'::student_phase
    WHEN 'alice.brown@example.com' THEN '1'::student_phase
    WHEN 'robert.johnson@example.com' THEN '2'::student_phase
    WHEN 'sarah.davis@example.com' THEN '1'::student_phase
    WHEN 'michael.taylor@example.com' THEN '4'::student_phase
    WHEN 'jessica.martinez@example.com' THEN '4'::student_phase
    WHEN 'daniel.white@example.com' THEN '1'::student_phase
    WHEN 'emily.anderson@example.com' THEN '1'::student_phase
    WHEN 'kevin.thompson@example.com' THEN '2'::student_phase
  END as current_phase,
  CASE p.email
    WHEN 'emma.wilson@example.com' THEN 24
    WHEN 'john.smith@example.com' THEN 36
    WHEN 'alice.brown@example.com' THEN 8
    WHEN 'robert.johnson@example.com' THEN 20
    WHEN 'sarah.davis@example.com' THEN 6
    WHEN 'michael.taylor@example.com' THEN 48
    WHEN 'jessica.martinez@example.com' THEN 60
    WHEN 'daniel.white@example.com' THEN 4
    WHEN 'emily.anderson@example.com' THEN 2
    WHEN 'kevin.thompson@example.com' THEN 16
  END as total_hours_completed,
  CASE p.email
    WHEN 'emma.wilson@example.com' THEN 12
    WHEN 'john.smith@example.com' THEN 18
    WHEN 'alice.brown@example.com' THEN 8
    WHEN 'robert.johnson@example.com' THEN 10
    WHEN 'sarah.davis@example.com' THEN 6
    WHEN 'michael.taylor@example.com' THEN 24
    WHEN 'jessica.martinez@example.com' THEN 30
    WHEN 'daniel.white@example.com' THEN 4
    WHEN 'emily.anderson@example.com' THEN 2
    WHEN 'kevin.thompson@example.com' THEN 8
  END as theory_hours_completed,
  CASE p.email
    WHEN 'emma.wilson@example.com' THEN 12
    WHEN 'john.smith@example.com' THEN 18
    WHEN 'alice.brown@example.com' THEN 0
    WHEN 'robert.johnson@example.com' THEN 10
    WHEN 'sarah.davis@example.com' THEN 0
    WHEN 'michael.taylor@example.com' THEN 24
    WHEN 'jessica.martinez@example.com' THEN 30
    WHEN 'daniel.white@example.com' THEN 0
    WHEN 'emily.anderson@example.com' THEN 0
    WHEN 'kevin.thompson@example.com' THEN 8
  END as practical_hours_completed,
  CASE p.email
    WHEN 'emma.wilson@example.com' THEN '2024-01-10'::date
    WHEN 'john.smith@example.com' THEN '2023-12-01'::date
    WHEN 'alice.brown@example.com' THEN '2024-02-01'::date
    WHEN 'robert.johnson@example.com' THEN '2024-01-20'::date
    WHEN 'sarah.davis@example.com' THEN '2024-01-25'::date
    WHEN 'michael.taylor@example.com' THEN '2023-10-15'::date
    WHEN 'jessica.martinez@example.com' THEN '2023-08-01'::date
    WHEN 'daniel.white@example.com' THEN '2024-02-10'::date
    WHEN 'emily.anderson@example.com' THEN '2024-01-30'::date
    WHEN 'kevin.thompson@example.com' THEN '2024-01-15'::date
  END as enrollment_date,
  CASE p.email
    WHEN 'emma.wilson@example.com' THEN false
    WHEN 'john.smith@example.com' THEN false
    WHEN 'alice.brown@example.com' THEN false
    WHEN 'robert.johnson@example.com' THEN true
    WHEN 'sarah.davis@example.com' THEN false
    WHEN 'michael.taylor@example.com' THEN false
    WHEN 'jessica.martinez@example.com' THEN false
    WHEN 'daniel.white@example.com' THEN false
    WHEN 'emily.anderson@example.com' THEN true
    WHEN 'kevin.thompson@example.com' THEN false
  END as needs_support,
  CASE p.email
    WHEN 'emma.wilson@example.com' THEN false
    WHEN 'john.smith@example.com' THEN false
    WHEN 'alice.brown@example.com' THEN false
    WHEN 'robert.johnson@example.com' THEN false
    WHEN 'sarah.davis@example.com' THEN true
    WHEN 'michael.taylor@example.com' THEN false
    WHEN 'jessica.martinez@example.com' THEN false
    WHEN 'daniel.white@example.com' THEN false
    WHEN 'emily.anderson@example.com' THEN true
    WHEN 'kevin.thompson@example.com' THEN false
  END as attendance_issues,
  CASE p.email
    WHEN 'emma.wilson@example.com' THEN false
    WHEN 'john.smith@example.com' THEN true
    WHEN 'alice.brown@example.com' THEN false
    WHEN 'robert.johnson@example.com' THEN false
    WHEN 'sarah.davis@example.com' THEN true
    WHEN 'michael.taylor@example.com' THEN false
    WHEN 'jessica.martinez@example.com' THEN false
    WHEN 'daniel.white@example.com' THEN false
    WHEN 'emily.anderson@example.com' THEN true
    WHEN 'kevin.thompson@example.com' THEN false
  END as has_balance,
  CASE p.email
    WHEN 'emma.wilson@example.com' THEN false
    WHEN 'john.smith@example.com' THEN false
    WHEN 'alice.brown@example.com' THEN true
    WHEN 'robert.johnson@example.com' THEN false
    WHEN 'sarah.davis@example.com' THEN false
    WHEN 'michael.taylor@example.com' THEN false
    WHEN 'jessica.martinez@example.com' THEN false
    WHEN 'daniel.white@example.com' THEN false
    WHEN 'emily.anderson@example.com' THEN true
    WHEN 'kevin.thompson@example.com' THEN false
  END as has_missing_classes
FROM profiles p
WHERE p.role = 'student';

-- ============================================================================
-- 5. STUDENT GROUPS (Many-to-many relationships)
-- ============================================================================

INSERT INTO student_groups (student_id, group_id, enrolled_at, status)
SELECT 
  s.id as student_id,
  g.id as group_id,
  '2024-01-15 09:00:00+00'::timestamptz as enrolled_at,
  'active' as status
FROM students s
JOIN groups g ON g.name = 'Group A - Morning Theory'
WHERE s.student_id IN ('DS2024001', 'DS2024003', 'DS2024004', 'DS2024008', 'DS2024010')

UNION ALL

SELECT 
  s.id as student_id,
  g.id as group_id,
  '2024-01-20 18:00:00+00'::timestamptz as enrolled_at,
  'completed' as status
FROM students s
JOIN groups g ON g.name = 'Group B - Evening Theory'
WHERE s.student_id IN ('DS2024002', 'DS2024005', 'DS2024007')

UNION ALL

SELECT 
  s.id as student_id,
  g.id as group_id,
  '2024-02-01 10:00:00+00'::timestamptz as enrolled_at,
  'active' as status
FROM students s
JOIN groups g ON g.name = 'Group C - Weekend Theory'
WHERE s.student_id IN ('DS2024006', 'DS2024009')

UNION ALL

SELECT 
  s.id as student_id,
  g.id as group_id,
  '2024-02-15 10:00:00+00'::timestamptz as enrolled_at,
  'active' as status
FROM students s
JOIN groups g ON g.name = 'Group D - Advanced Theory'
WHERE s.student_id IN ('DS2024002', 'DS2024006', 'DS2024007');

-- ============================================================================
-- 6. CLASSES (Theory and Practical)
-- ============================================================================

-- Theory Classes (Group classes)
INSERT INTO classes (title, description, class_type, status, start_time, end_time, instructor_id, group_id, location, notes, cost)
SELECT 
  c.title,
  c.description,
  c.class_type::class_type,
  c.status::class_status,
  c.start_time,
  c.end_time,
  i.id as instructor_id,
  g.id as group_id,
  c.location,
  c.notes,
  c.cost
FROM (
  VALUES 
    ('Introduction to Traffic Rules', 'Basic traffic rules and road signs', 'theory', 'completed', '2024-01-15 09:00:00+00'::timestamptz, '2024-01-15 11:00:00+00'::timestamptz, 'INST001', 'Group A - Morning Theory', 'Classroom A', 'First class of the session', 75.00),
    ('Right of Way Rules', 'Understanding priority and yielding', 'theory', 'completed', '2024-01-17 09:00:00+00'::timestamptz, '2024-01-17 11:00:00+00'::timestamptz, 'INST001', 'Group A - Morning Theory', 'Classroom A', NULL, 75.00),
    ('Parking and Reversing', 'Parking techniques and safety', 'theory', 'completed', '2024-01-22 09:00:00+00'::timestamptz, '2024-01-22 11:00:00+00'::timestamptz, 'INST001', 'Group A - Morning Theory', 'Classroom A', NULL, 75.00),
    ('Highway Driving Theory', 'Safe highway driving practices', 'theory', 'scheduled', '2024-12-20 09:00:00+00'::timestamptz, '2024-12-20 11:00:00+00'::timestamptz, 'INST001', 'Group A - Morning Theory', 'Classroom A', 'Advanced topic', 75.00),
    ('Evening Traffic Rules', 'Traffic rules for evening students', 'theory', 'completed', '2024-01-20 18:00:00+00'::timestamptz, '2024-01-20 20:00:00+00'::timestamptz, 'INST002', 'Group B - Evening Theory', 'Classroom B', NULL, 75.00),
    ('Night Driving Safety', 'Special considerations for night driving', 'theory', 'scheduled', '2024-12-18 18:00:00+00'::timestamptz, '2024-12-18 20:00:00+00'::timestamptz, 'INST002', 'Group B - Evening Theory', 'Classroom B', NULL, 75.00)
) AS c(title, description, class_type, status, start_time, end_time, employee_id, group_name, location, notes, cost)
JOIN instructors i ON i.employee_id = c.employee_id
JOIN groups g ON g.name = c.group_name;

-- Practical Classes for Emma and John (featured students)
INSERT INTO classes (title, description, class_type, status, start_time, end_time, instructor_id, student_id, location, notes, cost)
SELECT 
  c.title,
  c.description,
  c.class_type::class_type,
  c.status::class_status,
  c.start_time,
  c.end_time,
  i.id as instructor_id,
  s.id as student_id,
  c.location,
  c.notes,
  c.cost
FROM (
  VALUES 
    ('First Practical Lesson - Emma', 'Initial assessment and basic controls', 'practical', 'completed', '2024-01-25 10:00:00+00'::timestamptz, '2024-01-25 12:00:00+00'::timestamptz, 'INST001', 'DS2024001', 'Training Vehicle 1', 'Student shows good potential', 120.00),
    ('City Driving Practice - Emma', 'Downtown driving experience', 'practical', 'completed', '2024-02-01 10:00:00+00'::timestamptz, '2024-02-01 12:00:00+00'::timestamptz, 'INST001', 'DS2024001', 'Training Vehicle 1', 'Improved confidence', 120.00),
    ('Parking Practice - Emma', 'Parallel and perpendicular parking', 'practical', 'scheduled', '2024-12-19 10:00:00+00'::timestamptz, '2024-12-19 12:00:00+00'::timestamptz, 'INST001', 'DS2024001', 'Training Vehicle 1', NULL, 120.00),
    ('Highway Driving - John', 'Highway merging and lane changes', 'practical', 'completed', '2024-01-28 14:00:00+00'::timestamptz, '2024-01-28 16:00:00+00'::timestamptz, 'INST002', 'DS2024002', 'Training Vehicle 2', 'Excellent highway skills', 120.00),
    ('Advanced Maneuvers - John', 'Complex intersection navigation', 'practical', 'completed', '2024-02-05 14:00:00+00'::timestamptz, '2024-02-05 16:00:00+00'::timestamptz, 'INST002', 'DS2024002', 'Training Vehicle 2', 'Ready for test preparation', 120.00),
    ('Test Preparation - John', 'Final test preparation session', 'practical', 'scheduled', '2024-12-21 14:00:00+00'::timestamptz, '2024-12-21 16:00:00+00'::timestamptz, 'INST002', 'DS2024002', 'Training Vehicle 2', NULL, 120.00)
) AS c(title, description, class_type, status, start_time, end_time, employee_id, student_id, location, notes, cost)
JOIN instructors i ON i.employee_id = c.employee_id
JOIN students s ON s.student_id = c.student_id;

-- ============================================================================
-- 7. CLASS ATTENDANCES (Sample attendance records)
-- ============================================================================

-- Theory class attendances for Group A
INSERT INTO class_attendances (class_id, student_id, status, signed_at, completion_notes, instructor_feedback)
SELECT 
  c.id as class_id,
  s.id as student_id,
  'completed'::attendance_status as status,
  c.start_time + INTERVAL '5 minutes' as signed_at,
  'Completed successfully' as completion_notes,
  CASE s.student_id
    WHEN 'DS2024001' THEN 'Good participation and understanding'
    WHEN 'DS2024003' THEN 'Needs to ask more questions'
    WHEN 'DS2024004' THEN 'Excellent attention to detail'
    WHEN 'DS2024008' THEN 'Good foundational understanding'
    WHEN 'DS2024010' THEN 'Improving engagement'
  END as instructor_feedback
FROM classes c
JOIN groups g ON g.id = c.group_id
JOIN student_groups sg ON sg.group_id = g.id
JOIN students s ON s.id = sg.student_id
WHERE c.title IN ('Introduction to Traffic Rules', 'Right of Way Rules', 'Parking and Reversing')
AND s.student_id IN ('DS2024001', 'DS2024003', 'DS2024004', 'DS2024008', 'DS2024010');

-- Practical class attendances with signatures
INSERT INTO class_attendances (class_id, student_id, status, signed_at, signature_data, completion_notes, instructor_feedback)
SELECT 
  c.id as class_id,
  s.id as student_id,
  'completed'::attendance_status as status,
  c.start_time + INTERVAL '5 minutes' as signed_at,
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=' as signature_data,
  'Completed successfully with signature' as completion_notes,
  CASE c.title
    WHEN 'First Practical Lesson - Emma' THEN 'Natural ability, very comfortable with vehicle controls'
    WHEN 'City Driving Practice - Emma' THEN 'Gaining confidence in city traffic, good observation skills'
    WHEN 'Highway Driving - John' THEN 'Excellent highway driving skills, smooth lane changes'
    WHEN 'Advanced Maneuvers - John' THEN 'Ready for road test, very skilled driver'
  END as instructor_feedback
FROM classes c
JOIN students s ON s.id = c.student_id
WHERE c.class_type = 'practical' 
AND c.status = 'completed'
AND c.title IN ('First Practical Lesson - Emma', 'City Driving Practice - Emma', 'Highway Driving - John', 'Advanced Maneuvers - John');

-- ============================================================================
-- 8. DOCUMENTS (Sample documents for Emma and John)
-- ============================================================================

INSERT INTO documents (student_id, name, description, document_type, status, file_path, file_name, file_size, mime_type, expiry_date)
SELECT 
  s.id as student_id,
  d.name,
  d.description,
  d.document_type::document_type,
  d.status::document_status,
  d.file_path,
  d.file_name,
  d.file_size,
  d.mime_type,
  d.expiry_date
FROM (
  VALUES 
    ('DS2024001', 'Driver License Copy', 'Copy of current learner permit', 'license', 'approved', 'documents/emma_license.pdf', 'emma_license.pdf', 245760, 'application/pdf', '2025-05-15'::date),
    ('DS2024001', 'Medical Certificate', 'Medical fitness certificate', 'medical', 'approved', 'documents/emma_medical.pdf', 'emma_medical.pdf', 189440, 'application/pdf', '2025-01-15'::date),
    ('DS2024001', 'Student Contract', 'Signed enrollment contract', 'contract', 'approved', 'documents/emma_contract.pdf', 'emma_contract.pdf', 512000, 'application/pdf', NULL),
    ('DS2024002', 'Photo ID', 'Government issued photo ID', 'id', 'approved', 'documents/john_id.pdf', 'john_id.pdf', 156780, 'application/pdf', '2026-08-22'::date),
    ('DS2024002', 'Insurance Proof', 'Auto insurance verification', 'insurance', 'approved', 'documents/john_insurance.pdf', 'john_insurance.pdf', 203520, 'application/pdf', '2024-12-01'::date),
    ('DS2024002', 'Student Contract', 'Signed enrollment contract', 'contract', 'approved', 'documents/john_contract.pdf', 'john_contract.pdf', 498432, 'application/pdf', NULL)
) AS d(student_id, name, description, document_type, status, file_path, file_name, file_size, mime_type, expiry_date)
JOIN students s ON s.student_id = d.student_id;

-- ============================================================================
-- 9. ACTIVITY LOGS (Sample audit trail)
-- ============================================================================

INSERT INTO activity_logs (user_id, user_email, user_role, action_type, entity_type, entity_id, description, log_level, ip_address)
SELECT 
  p.id as user_id,
  p.email as user_email,
  p.role as user_role,
  a.action_type::action_type,
  a.entity_type,
  a.entity_id::uuid,
  a.description,
  a.log_level::log_level,
  a.ip_address::inet
FROM profiles p
CROSS JOIN (
  VALUES 
    ('admin@example.com', 'create', 'student', NULL, 'Created new student profile for Emma Wilson', 'info', '192.168.1.100'),
    ('admin@example.com', 'create', 'student', NULL, 'Created new student profile for John Smith', 'info', '192.168.1.100'),
    ('david.instructor@example.com', 'class_completed', 'class', NULL, 'Completed practical lesson with Emma Wilson', 'info', '192.168.1.50'),
    ('lisa.instructor@example.com', 'class_completed', 'class', NULL, 'Completed highway driving lesson with John Smith', 'info', '192.168.1.51'),
    ('emma.wilson@example.com', 'login', 'profile', NULL, 'Student logged into system', 'info', '192.168.1.200'),
    ('john.smith@example.com', 'view', 'class', NULL, 'Viewed upcoming class details', 'info', '192.168.1.201')
) AS a(email, action_type, entity_type, entity_id, description, log_level, ip_address)
WHERE p.email = a.email
LIMIT 6;

-- ============================================================================
-- VERIFICATION QUERIES - Run these to check your data
-- ============================================================================

-- 1. Check user counts by role
SELECT 
  role, 
  COUNT(*) as count 
FROM profiles 
GROUP BY role 
ORDER BY role;

-- 2. Check student status distribution
SELECT 
  status, 
  COUNT(*) as count 
FROM students 
GROUP BY status 
ORDER BY status;

-- 3. Show Emma and John's complete profiles
SELECT 
  p.first_name || ' ' || p.last_name as name,
  p.email,
  s.student_id,
  s.current_phase,
  s.total_hours_completed || ' hrs total' as progress,
  s.enrollment_date
FROM profiles p
JOIN students s ON s.profile_id = p.id  
WHERE p.email IN ('emma.wilson@example.com', 'john.smith@example.com')
ORDER BY s.student_id;

-- 4. Check class counts by type and status
SELECT 
  class_type,
  status,
  COUNT(*) as count
FROM classes
GROUP BY class_type, status
ORDER BY class_type, status;

-- 5. Check group enrollments
SELECT 
  g.name as group_name,
  COUNT(sg.student_id) as enrolled_students,
  g.capacity as max_capacity
FROM groups g 
LEFT JOIN student_groups sg ON g.id = sg.group_id 
GROUP BY g.name, g.capacity
ORDER BY g.name;

-- 6. Summary Report
SELECT 
  'Total Users' as metric, COUNT(*)::text as value FROM profiles
UNION ALL
SELECT 
  'Total Students' as metric, COUNT(*)::text as value FROM students
UNION ALL
SELECT 
  'Total Instructors' as metric, COUNT(*)::text as value FROM instructors
UNION ALL
SELECT 
  'Total Classes' as metric, COUNT(*)::text as value FROM classes
UNION ALL
SELECT 
  'Total Groups' as metric, COUNT(*)::text as value FROM groups
UNION ALL
SELECT 
  'Total Documents' as metric, COUNT(*)::text as value FROM documents;

-- ============================================================================
-- SUCCESS MESSAGE
-- ============================================================================

SELECT 
  '🎉 DATABASE SEEDED SUCCESSFULLY! 🎉' as message,
  '1 Admin, 3 Instructors, 10 Students created' as users,
  'Emma Wilson & John Smith have full profiles' as featured_students,
  'Ready for frontend testing!' as status; 