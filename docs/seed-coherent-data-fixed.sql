-- ============================================================================
-- COHERENT SEED DATA SCRIPT (FIXED VERSION)
-- ============================================================================
-- This script creates realistic, coherent test data for the driving school app
-- All UUIDs use proper format and gen_random_uuid() where appropriate
-- ============================================================================

BEGIN;

-- ============================================================================
-- 1. PROFILES (Base user data)
-- ============================================================================
-- Note: Admin profiles are preserved from the clear script, only adding new profiles

-- Instructors
INSERT INTO public.profiles (id, email, role, first_name, last_name, phone, street_address, city, postal_code, province, country) VALUES
('11111111-1111-1111-1111-111111111111', 'david.thompson@drivingschool.com', 'instructor', 'David', 'Thompson', '+14165550101', '123 Main St', 'Toronto', 'M5V 3A8', 'Ontario', 'Canada'),
('22222222-2222-2222-2222-222222222222', 'lisa.rodriguez@drivingschool.com', 'instructor', 'Lisa', 'Rodriguez', '+14165550102', '456 Oak Ave', 'Toronto', 'M4S 2B2', 'Ontario', 'Canada'),
('33333333-3333-3333-3333-333333333333', 'james.kumar@drivingschool.com', 'instructor', 'James', 'Kumar', '+14165550103', '789 Pine Rd', 'Toronto', 'M6R 3C3', 'Ontario', 'Canada');

-- Students
INSERT INTO public.profiles (id, email, role, first_name, last_name, phone, street_address, city, postal_code, province, country) VALUES
-- Group A (Phase 1) - Just starting
('44444444-4444-4444-4444-444444444444', 'emma.wilson@email.com', 'student', 'Emma', 'Wilson', '+14165550201', '101 Student St', 'Toronto', 'M5T 1A1', 'Ontario', 'Canada'),
('55555555-5555-5555-5555-555555555555', 'michael.chen@email.com', 'student', 'Michael', 'Chen', '+14165550202', '202 Learning Ave', 'Toronto', 'M4S 2B2', 'Ontario', 'Canada'),

-- Group B (Phase 2) - Some progress
('66666666-6666-6666-6666-666666666666', 'sarah.johnson@email.com', 'student', 'Sarah', 'Johnson', '+14165550203', '303 Progress Rd', 'Toronto', 'M6R 3C3', 'Ontario', 'Canada'),
('77777777-7777-7777-7777-777777777777', 'alex.martinez@email.com', 'student', 'Alex', 'Martinez', '+14165550204', '404 Drive Way', 'Toronto', 'M5P 4D4', 'Ontario', 'Canada'),

-- Group C (Phase 3) - Well advanced
('88888888-8888-8888-8888-888888888888', 'olivia.taylor@email.com', 'student', 'Olivia', 'Taylor', '+14165550205', '505 Advanced Blvd', 'Toronto', 'M4N 5E5', 'Ontario', 'Canada'),
('99999999-9999-9999-9999-999999999999', 'ryan.davis@email.com', 'student', 'Ryan', 'Davis', '+14165550206', '606 Expert Lane', 'Toronto', 'M6K 6F6', 'Ontario', 'Canada');

-- ============================================================================
-- 2. INSTRUCTORS
-- ============================================================================

INSERT INTO public.instructors (id, profile_id, employee_id, hire_date, status, license_number, certification_expiry, specializations, theory_hours_taught, practical_hours_taught) VALUES
('11111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'INST001', '2023-01-15', 'active', 'ON-INST-12345', '2026-01-15', ARRAY['highway', 'defensive'], 120, 300),
('22222222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', 'INST002', '2022-06-01', 'active', 'ON-INST-23456', '2025-06-01', ARRAY['city', 'parking'], 100, 250),
('33333333-3333-3333-3333-333333333333', '33333333-3333-3333-3333-333333333333', 'INST003', '2024-03-01', 'active', 'ON-INST-34567', '2027-03-01', ARRAY['night', 'winter'], 80, 200);

-- ============================================================================
-- 3. GROUPS
-- ============================================================================

INSERT INTO public.groups (id, name, description, capacity, current_enrollment, status, start_date, end_date, primary_instructor_id) VALUES
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Group A - Beginners', 'Phase 1 students starting their driving journey', 8, 2, 'active', '2025-01-01', '2025-07-01', '11111111-1111-1111-1111-111111111111'),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Group B - Intermediate', 'Phase 2 students progressing through theory and starting practical', 8, 2, 'active', '2024-11-01', '2025-05-01', '22222222-2222-2222-2222-222222222222'),
('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Group C - Advanced', 'Phase 3 students focusing on advanced skills', 8, 2, 'active', '2024-09-01', '2025-03-01', '33333333-3333-3333-3333-333333333333');

-- ============================================================================
-- 4. STUDENTS
-- ============================================================================

INSERT INTO public.students (id, profile_id, student_id, date_of_birth, status, current_phase, total_hours_completed, theory_hours_completed, practical_hours_completed, enrollment_date, needs_support, attendance_issues, has_balance, has_missing_classes) VALUES
-- Group A (Phase 1) - Emma: 6 theory hours, Michael: 8 theory hours
('44444444-4444-4444-4444-444444444444', '44444444-4444-4444-4444-444444444444', 'DS2025001', '1998-05-15', 'active', '1'::student_phase, 6, 6, 0, '2025-01-01', false, false, false, true),
('55555555-5555-5555-5555-555555555555', '55555555-5555-5555-5555-555555555555', 'DS2025002', '1999-03-10', 'active', '1'::student_phase, 8, 8, 0, '2025-01-01', false, false, false, false),

-- Group B (Phase 2) - Sarah: 16 hours (12 theory + 4 practical), Alex: 15 hours (12 theory + 3 practical)
('66666666-6666-6666-6666-666666666666', '66666666-6666-6666-6666-666666666666', 'DS2025003', '1997-11-30', 'active', '2'::student_phase, 16, 12, 4, '2024-11-01', false, false, false, false),
('77777777-7777-7777-7777-777777777777', '77777777-7777-7777-7777-777777777777', 'DS2025004', '2000-07-18', 'active', '2'::student_phase, 15, 12, 3, '2024-11-01', false, false, false, false),

-- Group C (Phase 3) - Olivia: 28 hours (20 theory + 8 practical), Ryan: 27 hours (20 theory + 7 practical)
('88888888-8888-8888-8888-888888888888', '88888888-8888-8888-8888-888888888888', 'DS2025005', '1998-09-14', 'active', '3'::student_phase, 28, 20, 8, '2024-09-01', false, false, false, false),
('99999999-9999-9999-9999-999999999999', '99999999-9999-9999-9999-999999999999', 'DS2025006', '1999-04-25', 'active', '3'::student_phase, 27, 20, 7, '2024-09-01', false, false, false, false);

-- ============================================================================
-- 5. STUDENT GROUP ENROLLMENTS
-- ============================================================================

INSERT INTO public.student_groups (student_id, group_id, enrolled_at, status) VALUES
-- Group A
('44444444-4444-4444-4444-444444444444', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '2025-01-01 09:00:00+00', 'active'),
('55555555-5555-5555-5555-555555555555', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '2025-01-01 09:00:00+00', 'active'),

-- Group B
('66666666-6666-6666-6666-666666666666', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '2024-11-01 09:00:00+00', 'active'),
('77777777-7777-7777-7777-777777777777', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '2024-11-01 09:00:00+00', 'active'),

-- Group C
('88888888-8888-8888-8888-888888888888', 'cccccccc-cccc-cccc-cccc-cccccccccccc', '2024-09-01 09:00:00+00', 'active'),
('99999999-9999-9999-9999-999999999999', 'cccccccc-cccc-cccc-cccc-cccccccccccc', '2024-09-01 09:00:00+00', 'active');

-- ============================================================================
-- 6. CLASSES - THEORY CLASSES (Group-based, 2 hours each)
-- ============================================================================

-- Group A Theory Classes (Phase 1) - Recent classes
INSERT INTO public.classes (id, title, description, class_type, status, start_time, end_time, instructor_id, group_id, location, notes) VALUES
(gen_random_uuid(), 'The Vehicle', 'Understanding vehicle components and basic mechanics', 'theory', 'completed', '2025-01-05 10:00:00+00', '2025-01-05 12:00:00+00', '11111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Classroom A', 'First theory class for Group A'),
(gen_random_uuid(), 'The Driver', 'Driver responsibilities and basic road rules', 'theory', 'completed', '2025-01-07 10:00:00+00', '2025-01-07 12:00:00+00', '11111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Classroom A', 'Second theory class for Group A'),
(gen_random_uuid(), 'The Environment', 'Weather conditions and environmental factors', 'theory', 'completed', '2025-01-12 10:00:00+00', '2025-01-12 12:00:00+00', '11111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Classroom A', 'Third theory class for Group A'),
-- Emma missed this class, Michael attended
(gen_random_uuid(), 'At-Risk Behaviours', 'Identifying and avoiding risky driving behaviors', 'theory', 'completed', '2025-01-14 10:00:00+00', '2025-01-14 12:00:00+00', '11111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Classroom A', 'Fourth theory class - Michael attended, Emma missed');

-- Group B Theory Classes (Phase 1 + Phase 2) - 6 classes total (12 hours)
INSERT INTO public.classes (id, title, description, class_type, status, start_time, end_time, instructor_id, group_id, location, notes) VALUES
(gen_random_uuid(), 'The Vehicle', 'Understanding vehicle components and basic mechanics', 'theory', 'completed', '2024-11-03 14:00:00+00', '2024-11-03 16:00:00+00', '22222222-2222-2222-2222-222222222222', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Classroom B', 'Group B Phase 1 - Class 1'),
(gen_random_uuid(), 'The Driver', 'Driver responsibilities and basic road rules', 'theory', 'completed', '2024-11-05 14:00:00+00', '2024-11-05 16:00:00+00', '22222222-2222-2222-2222-222222222222', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Classroom B', 'Group B Phase 1 - Class 2'),
(gen_random_uuid(), 'The Environment', 'Weather conditions and environmental factors', 'theory', 'completed', '2024-11-10 14:00:00+00', '2024-11-10 16:00:00+00', '22222222-2222-2222-2222-222222222222', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Classroom B', 'Group B Phase 1 - Class 3'),
(gen_random_uuid(), 'At-Risk Behaviours', 'Identifying and avoiding risky driving behaviors', 'theory', 'completed', '2024-11-12 14:00:00+00', '2024-11-12 16:00:00+00', '22222222-2222-2222-2222-222222222222', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Classroom B', 'Group B Phase 1 - Class 4'),
(gen_random_uuid(), 'Evaluation', 'Assessment and evaluation techniques', 'theory', 'completed', '2024-11-17 14:00:00+00', '2024-11-17 16:00:00+00', '22222222-2222-2222-2222-222222222222', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Classroom B', 'Group B Phase 1 - Class 5'),
(gen_random_uuid(), 'Accompanied Driving', 'Learning with supervision and guidance', 'theory', 'completed', '2024-11-19 14:00:00+00', '2024-11-19 16:00:00+00', '22222222-2222-2222-2222-222222222222', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Classroom B', 'Group B Phase 2 - Class 1');

-- Group C Theory Classes (Phase 1 + Phase 2 + Phase 3) - 10 classes total (20 hours)
INSERT INTO public.classes (id, title, description, class_type, status, start_time, end_time, instructor_id, group_id, location, notes) VALUES
(gen_random_uuid(), 'The Vehicle', 'Understanding vehicle components and basic mechanics', 'theory', 'completed', '2024-09-02 09:00:00+00', '2024-09-02 11:00:00+00', '33333333-3333-3333-3333-333333333333', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'Classroom C', 'Group C Phase 1 - Class 1'),
(gen_random_uuid(), 'The Driver', 'Driver responsibilities and basic road rules', 'theory', 'completed', '2024-09-04 09:00:00+00', '2024-09-04 11:00:00+00', '33333333-3333-3333-3333-333333333333', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'Classroom C', 'Group C Phase 1 - Class 2'),
(gen_random_uuid(), 'The Environment', 'Weather conditions and environmental factors', 'theory', 'completed', '2024-09-09 09:00:00+00', '2024-09-09 11:00:00+00', '33333333-3333-3333-3333-333333333333', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'Classroom C', 'Group C Phase 1 - Class 3'),
(gen_random_uuid(), 'At-Risk Behaviours', 'Identifying and avoiding risky driving behaviors', 'theory', 'completed', '2024-09-11 09:00:00+00', '2024-09-11 11:00:00+00', '33333333-3333-3333-3333-333333333333', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'Classroom C', 'Group C Phase 1 - Class 4'),
(gen_random_uuid(), 'Evaluation', 'Assessment and evaluation techniques', 'theory', 'completed', '2024-09-16 09:00:00+00', '2024-09-16 11:00:00+00', '33333333-3333-3333-3333-333333333333', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'Classroom C', 'Group C Phase 1 - Class 5'),
-- Phase 2 classes
(gen_random_uuid(), 'Accompanied Driving', 'Learning with supervision and guidance', 'theory', 'completed', '2024-09-18 09:00:00+00', '2024-09-18 11:00:00+00', '33333333-3333-3333-3333-333333333333', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'Classroom C', 'Group C Phase 2 - Class 1'),
(gen_random_uuid(), 'OEA Strategy', 'Observe, Evaluate, Act driving strategy', 'theory', 'completed', '2024-09-23 09:00:00+00', '2024-09-23 11:00:00+00', '33333333-3333-3333-3333-333333333333', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'Classroom C', 'Group C Phase 2 - Class 2'),
-- Phase 3 classes
(gen_random_uuid(), 'Speed', 'Speed management and control techniques', 'theory', 'completed', '2024-09-25 09:00:00+00', '2024-09-25 11:00:00+00', '33333333-3333-3333-3333-333333333333', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'Classroom C', 'Group C Phase 3 - Class 1'),
(gen_random_uuid(), 'Sharing the Road', 'Interacting safely with other road users', 'theory', 'completed', '2024-09-30 09:00:00+00', '2024-09-30 11:00:00+00', '33333333-3333-3333-3333-333333333333', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'Classroom C', 'Group C Phase 3 - Class 2'),
(gen_random_uuid(), 'Collision Avoidance', 'Advanced collision prevention techniques', 'theory', 'completed', '2024-10-02 09:00:00+00', '2024-10-02 11:00:00+00', '33333333-3333-3333-3333-333333333333', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'Classroom C', 'Group C Phase 3 - Class 3');

-- ============================================================================
-- 7. CLASSES - PRACTICAL CLASSES (Individual, 1 hour each)
-- ============================================================================

-- Group B Practical Classes (Sarah - 4 hours, Alex - 3 hours)
INSERT INTO public.classes (id, title, description, class_type, status, start_time, end_time, instructor_id, student_id, location, notes) VALUES
-- Sarah's practical classes (4 completed)
(gen_random_uuid(), 'In-Car Session 1', 'First practical driving lesson - basic controls', 'practical', 'completed', '2024-11-25 14:00:00+00', '2024-11-25 15:00:00+00', '22222222-2222-2222-2222-222222222222', '66666666-6666-6666-6666-666666666666', 'Training Vehicle 1', 'Sarah - First practical lesson'),
(gen_random_uuid(), 'In-Car Session 2', 'Basic maneuvers and parking', 'practical', 'completed', '2024-12-02 14:00:00+00', '2024-12-02 15:00:00+00', '22222222-2222-2222-2222-222222222222', '66666666-6666-6666-6666-666666666666', 'Training Vehicle 1', 'Sarah - Second practical lesson'),
(gen_random_uuid(), 'In-Car Session 3', 'Residential driving and turns', 'practical', 'completed', '2024-12-09 14:00:00+00', '2024-12-09 15:00:00+00', '22222222-2222-2222-2222-222222222222', '66666666-6666-6666-6666-666666666666', 'Training Vehicle 1', 'Sarah - Third practical lesson'),
(gen_random_uuid(), 'In-Car Session 4', 'Traffic navigation and signals', 'practical', 'completed', '2024-12-16 14:00:00+00', '2024-12-16 15:00:00+00', '22222222-2222-2222-2222-222222222222', '66666666-6666-6666-6666-666666666666', 'Training Vehicle 1', 'Sarah - Fourth practical lesson'),

-- Alex's practical classes (3 completed)
(gen_random_uuid(), 'In-Car Session 1', 'First practical driving lesson - basic controls', 'practical', 'completed', '2024-11-26 15:00:00+00', '2024-11-26 16:00:00+00', '22222222-2222-2222-2222-222222222222', '77777777-7777-7777-7777-777777777777', 'Training Vehicle 2', 'Alex - First practical lesson'),
(gen_random_uuid(), 'In-Car Session 2', 'Basic maneuvers and parking', 'practical', 'completed', '2024-12-03 15:00:00+00', '2024-12-03 16:00:00+00', '22222222-2222-2222-2222-222222222222', '77777777-7777-7777-7777-777777777777', 'Training Vehicle 2', 'Alex - Second practical lesson'),
(gen_random_uuid(), 'In-Car Session 3', 'Residential driving and turns', 'practical', 'completed', '2024-12-10 15:00:00+00', '2024-12-10 16:00:00+00', '22222222-2222-2222-2222-222222222222', '77777777-7777-7777-7777-777777777777', 'Training Vehicle 2', 'Alex - Third practical lesson');

-- Group C Practical Classes (Olivia - 8 hours, Ryan - 7 hours)
INSERT INTO public.classes (id, title, description, class_type, status, start_time, end_time, instructor_id, student_id, location, notes) VALUES
-- Olivia's practical classes (8 completed)
(gen_random_uuid(), 'In-Car Session 1', 'First practical driving lesson - basic controls', 'practical', 'completed', '2024-09-30 10:00:00+00', '2024-09-30 11:00:00+00', '33333333-3333-3333-3333-333333333333', '88888888-8888-8888-8888-888888888888', 'Training Vehicle 1', 'Olivia - First practical lesson'),
(gen_random_uuid(), 'In-Car Session 2', 'Basic maneuvers and parking', 'practical', 'completed', '2024-10-06 10:00:00+00', '2024-10-06 11:00:00+00', '33333333-3333-3333-3333-333333333333', '88888888-8888-8888-8888-888888888888', 'Training Vehicle 1', 'Olivia - Second practical lesson'),
(gen_random_uuid(), 'In-Car Session 3', 'Residential driving and turns', 'practical', 'completed', '2024-10-13 10:00:00+00', '2024-10-13 11:00:00+00', '33333333-3333-3333-3333-333333333333', '88888888-8888-8888-8888-888888888888', 'Training Vehicle 1', 'Olivia - Third practical lesson'),
(gen_random_uuid(), 'In-Car Session 4', 'Traffic navigation and signals', 'practical', 'completed', '2024-10-20 10:00:00+00', '2024-10-20 11:00:00+00', '33333333-3333-3333-3333-333333333333', '88888888-8888-8888-8888-888888888888', 'Training Vehicle 1', 'Olivia - Fourth practical lesson'),
(gen_random_uuid(), 'In-Car Session 5', 'Highway driving introduction', 'practical', 'completed', '2024-10-27 10:00:00+00', '2024-10-27 11:00:00+00', '33333333-3333-3333-3333-333333333333', '88888888-8888-8888-8888-888888888888', 'Training Vehicle 1', 'Olivia - Fifth practical lesson'),
(gen_random_uuid(), 'In-Car Session 6', 'Complex intersections', 'practical', 'completed', '2024-11-03 10:00:00+00', '2024-11-03 11:00:00+00', '33333333-3333-3333-3333-333333333333', '88888888-8888-8888-8888-888888888888', 'Training Vehicle 1', 'Olivia - Sixth practical lesson'),
(gen_random_uuid(), 'In-Car Session 7', 'Advanced parking techniques', 'practical', 'completed', '2024-11-10 10:00:00+00', '2024-11-10 11:00:00+00', '33333333-3333-3333-3333-333333333333', '88888888-8888-8888-8888-888888888888', 'Training Vehicle 1', 'Olivia - Seventh practical lesson'),
(gen_random_uuid(), 'In-Car Session 8', 'Night driving basics', 'practical', 'completed', '2024-11-17 18:00:00+00', '2024-11-17 19:00:00+00', '33333333-3333-3333-3333-333333333333', '88888888-8888-8888-8888-888888888888', 'Training Vehicle 1', 'Olivia - Eighth practical lesson'),

-- Ryan's practical classes (7 completed)
(gen_random_uuid(), 'In-Car Session 1', 'First practical driving lesson - basic controls', 'practical', 'completed', '2024-10-01 11:00:00+00', '2024-10-01 12:00:00+00', '33333333-3333-3333-3333-333333333333', '99999999-9999-9999-9999-999999999999', 'Training Vehicle 2', 'Ryan - First practical lesson'),
(gen_random_uuid(), 'In-Car Session 2', 'Basic maneuvers and parking', 'practical', 'completed', '2024-10-08 11:00:00+00', '2024-10-08 12:00:00+00', '33333333-3333-3333-3333-333333333333', '99999999-9999-9999-9999-999999999999', 'Training Vehicle 2', 'Ryan - Second practical lesson'),
(gen_random_uuid(), 'In-Car Session 3', 'Residential driving and turns', 'practical', 'completed', '2024-10-15 11:00:00+00', '2024-10-15 12:00:00+00', '33333333-3333-3333-3333-333333333333', '99999999-9999-9999-9999-999999999999', 'Training Vehicle 2', 'Ryan - Third practical lesson'),
(gen_random_uuid(), 'In-Car Session 4', 'Traffic navigation and signals', 'practical', 'completed', '2024-10-22 11:00:00+00', '2024-10-22 12:00:00+00', '33333333-3333-3333-3333-333333333333', '99999999-9999-9999-9999-999999999999', 'Training Vehicle 2', 'Ryan - Fourth practical lesson'),
(gen_random_uuid(), 'In-Car Session 5', 'Highway driving introduction', 'practical', 'completed', '2024-10-29 11:00:00+00', '2024-10-29 12:00:00+00', '33333333-3333-3333-3333-333333333333', '99999999-9999-9999-9999-999999999999', 'Training Vehicle 2', 'Ryan - Fifth practical lesson'),
(gen_random_uuid(), 'In-Car Session 6', 'Complex intersections', 'practical', 'completed', '2024-11-05 11:00:00+00', '2024-11-05 12:00:00+00', '33333333-3333-3333-3333-333333333333', '99999999-9999-9999-9999-999999999999', 'Training Vehicle 2', 'Ryan - Sixth practical lesson'),
(gen_random_uuid(), 'In-Car Session 7', 'Advanced parking techniques', 'practical', 'completed', '2024-11-12 11:00:00+00', '2024-11-12 12:00:00+00', '33333333-3333-3333-3333-333333333333', '99999999-9999-9999-9999-999999999999', 'Training Vehicle 2', 'Ryan - Seventh practical lesson');

-- ============================================================================
-- 8. UPCOMING CLASSES (Future classes for testing calendar functionality)
-- ============================================================================

-- Group A upcoming theory classes
INSERT INTO public.classes (id, title, description, class_type, status, start_time, end_time, instructor_id, group_id, location, notes) VALUES
(gen_random_uuid(), 'Evaluation', 'Assessment and evaluation techniques', 'theory', 'scheduled', '2025-01-26 10:00:00+00', '2025-01-26 12:00:00+00', '11111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Classroom A', 'Upcoming theory for Group A'),
(gen_random_uuid(), 'Accompanied Driving', 'Learning with supervision and guidance', 'theory', 'scheduled', '2025-01-28 10:00:00+00', '2025-01-28 12:00:00+00', '11111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Classroom A', 'Upcoming theory for Group A');

-- Upcoming practical classes
INSERT INTO public.classes (id, title, description, class_type, status, start_time, end_time, instructor_id, student_id, location, notes) VALUES
(gen_random_uuid(), 'In-Car Session 5', 'Highway driving introduction', 'practical', 'scheduled', '2025-01-25 14:00:00+00', '2025-01-25 15:00:00+00', '22222222-2222-2222-2222-222222222222', '66666666-6666-6666-6666-666666666666', 'Training Vehicle 1', 'Sarah - Next practical lesson'),
(gen_random_uuid(), 'In-Car Session 4', 'Traffic navigation and signals', 'practical', 'scheduled', '2025-01-26 15:00:00+00', '2025-01-26 16:00:00+00', '22222222-2222-2222-2222-222222222222', '77777777-7777-7777-7777-777777777777', 'Training Vehicle 2', 'Alex - Next practical lesson');

-- ============================================================================
-- CLASS ATTENDANCES
-- ============================================================================
-- Note: Attendance records are skipped in this seed script to avoid UUID reference complexity.
-- In a real application, attendance would be created after classes using the actual class IDs.

COMMIT;

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================
-- Run these to verify the data was inserted correctly:

-- Check counts
SELECT 'Profiles' as table_name, COUNT(*) as count FROM profiles WHERE role != 'admin'
UNION ALL
SELECT 'Instructors', COUNT(*) FROM instructors
UNION ALL
SELECT 'Students', COUNT(*) FROM students
UNION ALL
SELECT 'Groups', COUNT(*) FROM groups
UNION ALL
SELECT 'Classes', COUNT(*) FROM classes
UNION ALL
SELECT 'Student Groups', COUNT(*) FROM student_groups;

-- Check student progress
SELECT 
  p.first_name || ' ' || p.last_name as name,
  s.current_phase,
  s.theory_hours_completed,
  s.practical_hours_completed,
  s.total_hours_completed
FROM students s
JOIN profiles p ON p.id = s.profile_id
ORDER BY s.current_phase, p.first_name;

-- Check class distribution
SELECT 
  class_type,
  status,
  COUNT(*) as count
FROM classes
GROUP BY class_type, status
ORDER BY class_type, status;

-- ============================================================================
-- SUCCESS MESSAGE
-- ============================================================================

SELECT 
  '🎉 COHERENT SEED DATA CREATED SUCCESSFULLY! 🎉' as message,
  '3 Instructors, 6 Students, 3 Groups' as summary,
  '40+ Classes with proper UUID format' as classes,
  'All data relationships are coherent!' as status;
