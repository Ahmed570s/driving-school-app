-- ============================================================================
-- CLASS ATTENDANCES SEED DATA
-- ============================================================================
-- This script creates attendance records for all completed classes
-- Must be run AFTER the main seed script (seed-coherent-data-fixed.sql)
-- ============================================================================

BEGIN;

-- ============================================================================
-- GROUP A THEORY CLASS ATTENDANCES
-- ============================================================================
-- Emma (44444444-4444-4444-4444-444444444444) and Michael (55555555-5555-5555-5555-555555555555)
-- Emma attended 3 classes (6 hours), Michael attended 4 classes (8 hours)

-- The Vehicle - Both Emma and Michael attended
INSERT INTO public.class_attendances (id, class_id, student_id, status, signed_at, completion_notes, instructor_feedback)
SELECT 
  gen_random_uuid() as id,
  c.id as class_id,
  s.id as student_id,
  'completed' as status,
  c.end_time - INTERVAL '5 minutes' as signed_at,
  'Completed successfully' as completion_notes,
  CASE 
    WHEN s.id = '44444444-4444-4444-4444-444444444444' THEN 'Emma - Good engagement, asked relevant questions about vehicle components'
    WHEN s.id = '55555555-5555-5555-5555-555555555555' THEN 'Michael - Excellent participation and understanding of mechanics'
  END as instructor_feedback
FROM classes c
CROSS JOIN (
  SELECT '44444444-4444-4444-4444-444444444444'::uuid as id
  UNION ALL 
  SELECT '55555555-5555-5555-5555-555555555555'::uuid as id
) s
WHERE c.title = 'The Vehicle' 
  AND c.group_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'
  AND c.status = 'completed';

-- The Driver - Both Emma and Michael attended  
INSERT INTO public.class_attendances (id, class_id, student_id, status, signed_at, completion_notes, instructor_feedback)
SELECT 
  gen_random_uuid() as id,
  c.id as class_id,
  s.id as student_id,
  'completed' as status,
  c.end_time - INTERVAL '5 minutes' as signed_at,
  'Completed successfully' as completion_notes,
  CASE 
    WHEN s.id = '44444444-4444-4444-4444-444444444444' THEN 'Emma - Shows good understanding of driver responsibilities'
    WHEN s.id = '55555555-5555-5555-5555-555555555555' THEN 'Michael - Very attentive and well-prepared'
  END as instructor_feedback
FROM classes c
CROSS JOIN (
  SELECT '44444444-4444-4444-4444-444444444444'::uuid as id
  UNION ALL 
  SELECT '55555555-5555-5555-5555-555555555555'::uuid as id
) s
WHERE c.title = 'The Driver' 
  AND c.group_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'
  AND c.status = 'completed';

-- The Environment - Both Emma and Michael attended
INSERT INTO public.class_attendances (id, class_id, student_id, status, signed_at, completion_notes, instructor_feedback)
SELECT 
  gen_random_uuid() as id,
  c.id as class_id,
  s.id as student_id,
  'completed' as status,
  c.end_time - INTERVAL '5 minutes' as signed_at,
  'Completed successfully' as completion_notes,
  CASE 
    WHEN s.id = '44444444-4444-4444-4444-444444444444' THEN 'Emma - Good grasp of weather-related driving concepts'
    WHEN s.id = '55555555-5555-5555-5555-555555555555' THEN 'Michael - Excellent questions about adverse conditions'
  END as instructor_feedback
FROM classes c
CROSS JOIN (
  SELECT '44444444-4444-4444-4444-444444444444'::uuid as id
  UNION ALL 
  SELECT '55555555-5555-5555-5555-555555555555'::uuid as id
) s
WHERE c.title = 'The Environment' 
  AND c.group_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'
  AND c.status = 'completed';

-- At-Risk Behaviours - Only Michael attended (Emma missed this class)
-- Michael's attendance record
INSERT INTO public.class_attendances (id, class_id, student_id, status, signed_at, completion_notes, instructor_feedback)
SELECT 
  gen_random_uuid() as id,
  c.id as class_id,
  '55555555-5555-5555-5555-555555555555'::uuid as student_id,
  'completed' as status,
  c.end_time - INTERVAL '5 minutes' as signed_at,
  'Completed successfully' as completion_notes,
  'Michael - Strong understanding of risk assessment and prevention strategies' as instructor_feedback
FROM classes c
WHERE c.title = 'At-Risk Behaviours' 
  AND c.group_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'
  AND c.status = 'completed';

-- Emma's missed class record
INSERT INTO public.class_attendances (id, class_id, student_id, status, signed_at, completion_notes, instructor_feedback, missed_at, missed_reason)
SELECT 
  gen_random_uuid() as id,
  c.id as class_id,
  '44444444-4444-4444-4444-444444444444'::uuid as student_id,
  'missed' as status,
  NULL as signed_at,
  NULL as completion_notes,
  NULL as instructor_feedback,
  c.start_time as missed_at,
  'Personal emergency - family commitment' as missed_reason
FROM classes c
WHERE c.title = 'At-Risk Behaviours' 
  AND c.group_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'
  AND c.status = 'completed';

-- ============================================================================
-- GROUP B THEORY CLASS ATTENDANCES
-- ============================================================================
-- Sarah (66666666-6666-6666-6666-666666666666) and Alex (77777777-7777-7777-7777-777777777777)
-- Both completed all 6 theory classes (12 hours each)

INSERT INTO public.class_attendances (id, class_id, student_id, status, signed_at, completion_notes, instructor_feedback)
SELECT 
  gen_random_uuid() as id,
  c.id as class_id,
  s.id as student_id,
  'completed' as status,
  c.end_time - INTERVAL '5 minutes' as signed_at,
  'Completed successfully' as completion_notes,
  CASE 
    WHEN s.id = '66666666-6666-6666-6666-666666666666' AND c.title = 'The Vehicle' THEN 'Sarah - Excellent foundational understanding of vehicle systems'
    WHEN s.id = '77777777-7777-7777-7777-777777777777' AND c.title = 'The Vehicle' THEN 'Alex - Good technical questions about mechanics'
    WHEN s.id = '66666666-6666-6666-6666-666666666666' AND c.title = 'The Driver' THEN 'Sarah - Shows strong responsibility awareness'
    WHEN s.id = '77777777-7777-7777-7777-777777777777' AND c.title = 'The Driver' THEN 'Alex - Engaged well with material'
    WHEN s.id = '66666666-6666-6666-6666-666666666666' AND c.title = 'The Environment' THEN 'Sarah - Good environmental awareness and safety focus'
    WHEN s.id = '77777777-7777-7777-7777-777777777777' AND c.title = 'The Environment' THEN 'Alex - Understands weather impacts on driving'
    WHEN s.id = '66666666-6666-6666-6666-666666666666' AND c.title = 'At-Risk Behaviours' THEN 'Sarah - Identifies risks well, good analytical skills'
    WHEN s.id = '77777777-7777-7777-7777-777777777777' AND c.title = 'At-Risk Behaviours' THEN 'Alex - Good risk assessment and prevention understanding'
    WHEN s.id = '66666666-6666-6666-6666-666666666666' AND c.title = 'Evaluation' THEN 'Sarah - Strong evaluation skills and self-assessment'
    WHEN s.id = '77777777-7777-7777-7777-777777777777' AND c.title = 'Evaluation' THEN 'Alex - Analytical approach to learning and improvement'
    WHEN s.id = '66666666-6666-6666-6666-666666666666' AND c.title = 'Accompanied Driving' THEN 'Sarah - Ready for supervised practice, understands guidance'
    WHEN s.id = '77777777-7777-7777-7777-777777777777' AND c.title = 'Accompanied Driving' THEN 'Alex - Understands supervision importance and learning process'
    ELSE 'Good participation in class'
  END as instructor_feedback
FROM classes c
CROSS JOIN (
  SELECT '66666666-6666-6666-6666-666666666666'::uuid as id
  UNION ALL 
  SELECT '77777777-7777-7777-7777-777777777777'::uuid as id
) s
WHERE c.group_id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'
  AND c.class_type = 'theory'
  AND c.status = 'completed';

-- ============================================================================
-- GROUP C THEORY CLASS ATTENDANCES
-- ============================================================================
-- Olivia (88888888-8888-8888-8888-888888888888) and Ryan (99999999-9999-9999-9999-999999999999)
-- Both completed all 10 theory classes (20 hours each)

INSERT INTO public.class_attendances (id, class_id, student_id, status, signed_at, completion_notes, instructor_feedback)
SELECT 
  gen_random_uuid() as id,
  c.id as class_id,
  s.id as student_id,
  'completed' as status,
  c.end_time - INTERVAL '5 minutes' as signed_at,
  'Completed successfully' as completion_notes,
  CASE 
    WHEN s.id = '88888888-8888-8888-8888-888888888888' AND c.title = 'The Vehicle' THEN 'Olivia - Excellent foundational knowledge, advanced questions'
    WHEN s.id = '99999999-9999-9999-9999-999999999999' AND c.title = 'The Vehicle' THEN 'Ryan - Strong technical understanding and attention to detail'
    WHEN s.id = '88888888-8888-8888-8888-888888888888' AND c.title = 'The Driver' THEN 'Olivia - Responsible attitude and mature approach'
    WHEN s.id = '99999999-9999-9999-9999-999999999999' AND c.title = 'The Driver' THEN 'Ryan - Good rule comprehension and ethical understanding'
    WHEN s.id = '88888888-8888-8888-8888-888888888888' AND c.title = 'The Environment' THEN 'Olivia - Environmental awareness and safety consciousness'
    WHEN s.id = '99999999-9999-9999-9999-999999999999' AND c.title = 'The Environment' THEN 'Ryan - Weather condition understanding and adaptation skills'
    WHEN s.id = '88888888-8888-8888-8888-888888888888' AND c.title = 'At-Risk Behaviours' THEN 'Olivia - Risk identification skills and prevention mindset'
    WHEN s.id = '99999999-9999-9999-9999-999999999999' AND c.title = 'At-Risk Behaviours' THEN 'Ryan - Behavioral awareness and safety-first approach'
    WHEN s.id = '88888888-8888-8888-8888-888888888888' AND c.title = 'Evaluation' THEN 'Olivia - Strong evaluation abilities and critical thinking'
    WHEN s.id = '99999999-9999-9999-9999-999999999999' AND c.title = 'Evaluation' THEN 'Ryan - Self-assessment skills and continuous improvement'
    WHEN s.id = '88888888-8888-8888-8888-888888888888' AND c.title = 'Accompanied Driving' THEN 'Olivia - Ready for supervised driving, excellent preparation'
    WHEN s.id = '99999999-9999-9999-9999-999999999999' AND c.title = 'Accompanied Driving' THEN 'Ryan - Supervision concepts clear, methodical approach'
    WHEN s.id = '88888888-8888-8888-8888-888888888888' AND c.title = 'OEA Strategy' THEN 'Olivia - OEA strategy mastered, strategic thinking excellent'
    WHEN s.id = '99999999-9999-9999-9999-999999999999' AND c.title = 'OEA Strategy' THEN 'Ryan - Strategic thinking developed, systematic approach'
    WHEN s.id = '88888888-8888-8888-8888-888888888888' AND c.title = 'Speed' THEN 'Olivia - Speed management excellent, understands control techniques'
    WHEN s.id = '99999999-9999-9999-9999-999999999999' AND c.title = 'Speed' THEN 'Ryan - Speed control understanding, safe practices'
    WHEN s.id = '88888888-8888-8888-8888-888888888888' AND c.title = 'Sharing the Road' THEN 'Olivia - Road sharing expertise, excellent interaction skills'
    WHEN s.id = '99999999-9999-9999-9999-999999999999' AND c.title = 'Sharing the Road' THEN 'Ryan - Interaction skills developed, courteous driving'
    WHEN s.id = '88888888-8888-8888-8888-888888888888' AND c.title = 'Collision Avoidance' THEN 'Olivia - Advanced collision prevention mastered'
    WHEN s.id = '99999999-9999-9999-9999-999999999999' AND c.title = 'Collision Avoidance' THEN 'Ryan - Prevention techniques understood, defensive mindset'
    ELSE 'Good participation in advanced class'
  END as instructor_feedback
FROM classes c
CROSS JOIN (
  SELECT '88888888-8888-8888-8888-888888888888'::uuid as id
  UNION ALL 
  SELECT '99999999-9999-9999-9999-999999999999'::uuid as id
) s
WHERE c.group_id = 'cccccccc-cccc-cccc-cccc-cccccccccccc'
  AND c.class_type = 'theory'
  AND c.status = 'completed';

-- ============================================================================
-- PRACTICAL CLASS ATTENDANCES
-- ============================================================================

-- Sarah's Practical Classes (4 completed)
INSERT INTO public.class_attendances (id, class_id, student_id, status, signed_at, signature_data, completion_notes, instructor_feedback)
SELECT 
  gen_random_uuid() as id,
  c.id as class_id,
  '66666666-6666-6666-6666-666666666666'::uuid as student_id,
  'completed' as status,
  c.end_time - INTERVAL '5 minutes' as signed_at,
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=' as signature_data,
  'Completed successfully with signature' as completion_notes,
  CASE 
    WHEN c.title = 'In-Car Session 1' THEN 'Sarah - Good initial coordination, needs practice with clutch control'
    WHEN c.title = 'In-Car Session 2' THEN 'Sarah - Improved significantly, parallel parking needs more work'
    WHEN c.title = 'In-Car Session 3' THEN 'Sarah - Smooth turns, good speed control in residential areas'
    WHEN c.title = 'In-Car Session 4' THEN 'Sarah - Better signal timing, ready for more complex traffic situations'
  END as instructor_feedback
FROM classes c
WHERE c.student_id = '66666666-6666-6666-6666-666666666666'
  AND c.class_type = 'practical'
  AND c.status = 'completed';

-- Alex's Practical Classes (3 completed)
INSERT INTO public.class_attendances (id, class_id, student_id, status, signed_at, signature_data, completion_notes, instructor_feedback)
SELECT 
  gen_random_uuid() as id,
  c.id as class_id,
  '77777777-7777-7777-7777-777777777777'::uuid as student_id,
  'completed' as status,
  c.end_time - INTERVAL '5 minutes' as signed_at,
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=' as signature_data,
  'Completed successfully with signature' as completion_notes,
  CASE 
    WHEN c.title = 'In-Car Session 1' THEN 'Alex - Natural feel for vehicle, confident start'
    WHEN c.title = 'In-Car Session 2' THEN 'Alex - Quick learner, good spatial awareness for parking'
    WHEN c.title = 'In-Car Session 3' THEN 'Alex - Confident in neighborhoods, ready for busier roads'
  END as instructor_feedback
FROM classes c
WHERE c.student_id = '77777777-7777-7777-7777-777777777777'
  AND c.class_type = 'practical'
  AND c.status = 'completed';

-- Olivia's Practical Classes (8 completed)
INSERT INTO public.class_attendances (id, class_id, student_id, status, signed_at, signature_data, completion_notes, instructor_feedback)
SELECT 
  gen_random_uuid() as id,
  c.id as class_id,
  '88888888-8888-8888-8888-888888888888'::uuid as student_id,
  'completed' as status,
  c.end_time - INTERVAL '5 minutes' as signed_at,
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=' as signature_data,
  'Completed successfully with signature' as completion_notes,
  CASE 
    WHEN c.title = 'In-Car Session 1' THEN 'Olivia - Natural driving ability, very smooth and controlled'
    WHEN c.title = 'In-Car Session 2' THEN 'Olivia - All parking types mastered quickly, exceptional skills'
    WHEN c.title = 'In-Car Session 3' THEN 'Olivia - Perfect residential driving, ready for advanced challenges'
    WHEN c.title = 'In-Car Session 4' THEN 'Olivia - Handles complex traffic with confidence and skill'
    WHEN c.title = 'In-Car Session 5' THEN 'Olivia - Smooth highway entry/exit, excellent merging technique'
    WHEN c.title = 'In-Car Session 6' THEN 'Olivia - Handles multi-lane intersections perfectly'
    WHEN c.title = 'In-Car Session 7' THEN 'Olivia - All advanced parking techniques mastered'
    WHEN c.title = 'In-Car Session 8' THEN 'Olivia - Excellent night vision and awareness, ready for test'
  END as instructor_feedback
FROM classes c
WHERE c.student_id = '88888888-8888-8888-8888-888888888888'
  AND c.class_type = 'practical'
  AND c.status = 'completed';

-- Ryan's Practical Classes (7 completed)
INSERT INTO public.class_attendances (id, class_id, student_id, status, signed_at, signature_data, completion_notes, instructor_feedback)
SELECT 
  gen_random_uuid() as id,
  c.id as class_id,
  '99999999-9999-9999-9999-999999999999'::uuid as student_id,
  'completed' as status,
  c.end_time - INTERVAL '5 minutes' as signed_at,
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=' as signature_data,
  'Completed successfully with signature' as completion_notes,
  CASE 
    WHEN c.title = 'In-Car Session 1' THEN 'Ryan - Good control and methodical approach to learning'
    WHEN c.title = 'In-Car Session 2' THEN 'Ryan - Systematic parking approach, very precise movements'
    WHEN c.title = 'In-Car Session 3' THEN 'Ryan - Careful and observant, excellent safety habits'
    WHEN c.title = 'In-Car Session 4' THEN 'Ryan - Cautious but confident, good decision making'
    WHEN c.title = 'In-Car Session 5' THEN 'Ryan - Adapting well to highway speeds, good awareness'
    WHEN c.title = 'In-Car Session 6' THEN 'Ryan - Methodical approach to complex situations'
    WHEN c.title = 'In-Car Session 7' THEN 'Ryan - Precise and careful, excellent parking technique'
  END as instructor_feedback
FROM classes c
WHERE c.student_id = '99999999-9999-9999-9999-999999999999'
  AND c.class_type = 'practical'
  AND c.status = 'completed';

COMMIT;

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Check attendance counts by student
SELECT 
  p.first_name || ' ' || p.last_name as student_name,
  s.current_phase,
  COUNT(ca.id) as total_attendances,
  COUNT(CASE WHEN ca.status = 'completed' THEN 1 END) as completed_classes,
  COUNT(CASE WHEN ca.status = 'missed' THEN 1 END) as missed_classes
FROM students s
JOIN profiles p ON p.id = s.profile_id
LEFT JOIN class_attendances ca ON ca.student_id = s.id
GROUP BY s.id, p.first_name, p.last_name, s.current_phase
ORDER BY s.current_phase, p.first_name;

-- Check attendance by class type
SELECT 
  c.class_type,
  COUNT(ca.id) as total_attendance_records,
  COUNT(CASE WHEN ca.status = 'completed' THEN 1 END) as completed,
  COUNT(CASE WHEN ca.status = 'missed' THEN 1 END) as missed
FROM classes c
LEFT JOIN class_attendances ca ON ca.class_id = c.id
WHERE c.status = 'completed'
GROUP BY c.class_type;

-- Verify attendance matches student hours
SELECT 
  p.first_name || ' ' || p.last_name as student_name,
  s.theory_hours_completed,
  s.practical_hours_completed,
  s.total_hours_completed,
  COUNT(CASE WHEN c.class_type = 'theory' AND ca.status = 'completed' THEN 1 END) * 2 as theory_hours_attended,
  COUNT(CASE WHEN c.class_type = 'practical' AND ca.status = 'completed' THEN 1 END) as practical_hours_attended
FROM students s
JOIN profiles p ON p.id = s.profile_id
LEFT JOIN class_attendances ca ON ca.student_id = s.id AND ca.status = 'completed'
LEFT JOIN classes c ON c.id = ca.class_id
GROUP BY s.id, p.first_name, p.last_name, s.theory_hours_completed, s.practical_hours_completed, s.total_hours_completed
ORDER BY s.current_phase, p.first_name;

-- ============================================================================
-- SUCCESS MESSAGE
-- ============================================================================

SELECT 
  '🎉 CLASS ATTENDANCES CREATED SUCCESSFULLY! 🎉' as message,
  'All completed classes now have attendance records' as summary,
  'Theory and practical attendances with instructor feedback' as details,
  'Emma has 1 missed class, all others completed their classes' as notes;
