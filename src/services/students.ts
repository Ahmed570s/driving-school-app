// Student Service Layer - Handles all database operations for students
import { supabase } from '@/lib/supabaseClient';
import { BasicStudent, Student } from '@/data/students';

// ============================================================================
// TYPES - What data looks like coming from the database
// ============================================================================

// This is what Supabase returns when we join profiles + students tables
interface DatabaseStudent {
  // From students table
  id: string;
  student_id: string;
  current_phase: number;
  total_hours_completed: number;
  status: 'active' | 'on_hold' | 'completed' | 'dropped';
  has_balance: boolean;
  has_missing_classes: boolean;
  // From profiles table (joined) - Supabase can return array or single object
  profiles: {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
  }[] | {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
  } | null;
}

// ============================================================================
// HELPER FUNCTIONS - Convert database format to UI format
// ============================================================================

/**
 * Converts database student to BasicStudent format for the UI
 * This is like a translator - takes database format and makes it UI-friendly
 */
const convertToBasicStudent = (dbStudent: DatabaseStudent): BasicStudent => {
  // Handle both array and single object from Supabase
  const profile = Array.isArray(dbStudent.profiles) 
    ? dbStudent.profiles[0] 
    : dbStudent.profiles;
  
  // Safety check - if no profile found, use fallback values
  if (!profile) {
    console.warn('⚠️ No profile found for student:', dbStudent.id);
    return {
      id: dbStudent.id,
      name: `Student ${dbStudent.student_id}`,
      studentId: dbStudent.student_id,
      email: 'no-email@example.com',
      phone: 'No phone',
      group: "A",
      hoursDone: dbStudent.total_hours_completed,
      status: dbStudent.status === 'on_hold' ? 'on-hold' : dbStudent.status as any,
      hasBalance: dbStudent.has_balance,
      hasMissingClasses: dbStudent.has_missing_classes
    };
  }
  
  // Convert database status format to UI format
  const convertStatus = (dbStatus: string) => {
    return dbStatus === 'on_hold' ? 'on-hold' : dbStatus as any;
  };
  
  return {
    id: dbStudent.id,
    name: `${profile.first_name} ${profile.last_name}`,
    studentId: dbStudent.student_id,
    email: profile.email,
    phone: profile.phone,
    group: "A", // TODO: Get real group from database later
    hoursDone: dbStudent.total_hours_completed,
    status: convertStatus(dbStudent.status),
    hasBalance: dbStudent.has_balance,
    hasMissingClasses: dbStudent.has_missing_classes
  };
};

/**
 * Converts database student with full profile to Complete Student format for the UI
 * This is for the detailed student profile page
 */
const convertToCompleteStudent = (dbStudent: any): Student => {
  // Handle both array and single object from Supabase
  const profile = Array.isArray(dbStudent.profiles) 
    ? dbStudent.profiles[0] 
    : dbStudent.profiles;
  
  // Safety check - if no profile found, use fallback values
  if (!profile) {
    console.warn('⚠️ No profile found for student:', dbStudent.id);
    return {
      id: dbStudent.id,
      firstName: 'Unknown',
      lastName: 'Student',
      studentId: dbStudent.student_id || `DS${new Date().getFullYear()}001`,
      phone: 'No phone',
      email: 'no-email@example.com',
      whatsapp: 'No WhatsApp',
      street: '',
      apartment: '',
      city: '',
      postalCode: '',
      dateOfBirth: '',
      learnerLicenseNumber: '',
      group: "none",
      status: dbStudent.status === 'on_hold' ? 'on-hold' : dbStudent.status as any,
      currentPhase: dbStudent.current_phase || 1,
      totalCompletedSessions: dbStudent.total_hours_completed || 0,
      enrollmentDate: dbStudent.enrollment_date || new Date().toISOString().split('T')[0],
      contractExpiryDate: dbStudent.contract_expiry_date || new Date().toISOString().split('T')[0],
      needsSupport: dbStudent.needs_support || false,
      attendanceIssues: dbStudent.attendance_issues || false,
      documents: [] // TODO: Add documents later
    };
  }
  
  // Convert database status format to UI format
  const convertStatus = (dbStatus: string) => {
    return dbStatus === 'on_hold' ? 'on-hold' : dbStatus as any;
  };
  
  return {
    id: dbStudent.id,
    firstName: profile.first_name,
    lastName: profile.last_name,
    studentId: dbStudent.student_id,
    phone: profile.phone,
    email: profile.email,
    whatsapp: profile.whatsapp || profile.phone,
    street: profile.street_address || '',
    apartment: profile.apartment || '',
    city: profile.city || '',
    postalCode: profile.postal_code || '',
    dateOfBirth: dbStudent.date_of_birth || '',
    learnerLicenseNumber: dbStudent.learner_license_number || '',
    group: "A", // TODO: Get real group from database later
    status: convertStatus(dbStudent.status),
    currentPhase: dbStudent.current_phase || 1,
    totalCompletedSessions: dbStudent.total_hours_completed || 0,
    enrollmentDate: dbStudent.enrollment_date,
    contractExpiryDate: dbStudent.contract_expiry_date,
    needsSupport: dbStudent.needs_support || false,
    attendanceIssues: dbStudent.attendance_issues || false,
    documents: [] // TODO: Add documents later
  };
};

// ============================================================================
// MAIN SERVICE FUNCTIONS - These are what your components will use
// ============================================================================

/**
 * Get all students for the students list page
 * This replaces the mock data in studentsListData
 */
export const getStudents = async (): Promise<BasicStudent[]> => {
  try {
    console.log('🔍 Fetching students from database...');
    
    // Query Supabase: Get students and join with profiles using explicit foreign key
    const { data, error } = await supabase
      .from('students')
      .select(`
        id,
        student_id,
        current_phase,
        total_hours_completed,
        status,
        has_balance,
        has_missing_classes,
        profiles!students_profile_id_fkey (
          first_name,
          last_name,
          email,
          phone
        )
      `);

    // Check if the query failed
    if (error) {
      console.error('❌ Database error:', error);
      throw error;
    }

    // Check if we got data
    if (!data) {
      console.log('⚠️ No students found in database');
      return [];
    }

    console.log(`✅ Found ${data.length} students in database`);
    
    // Convert database format to UI format
    const students = data.map(convertToBasicStudent);
    
    return students;

  } catch (error) {
    console.error('💥 Error in getStudents:', error);
    throw error; // Re-throw so the UI can handle it
  }
};

/**
 * Get a single student by ID for the student profile page
 * This will replace the mock data in studentProfilesData
 */
export const getStudentById = async (studentId: string): Promise<Student | null> => {
  try {
    console.log(`🔍 Fetching student ${studentId} from database...`);
    
    // Query Supabase: Get student with profile data
    const { data, error } = await supabase
      .from('students')
      .select(`
        id,
        student_id,
        date_of_birth,
        learner_license_number,
        status,
        current_phase,
        total_hours_completed,
        enrollment_date,
        contract_expiry_date,
        needs_support,
        attendance_issues,
        profiles!students_profile_id_fkey (
          first_name,
          last_name,
          email,
          phone,
          whatsapp,
          street_address,
          apartment,
          city,
          postal_code
        )
      `)
      .eq('id', studentId)
      .single();

    if (error) {
      console.error('❌ Database error:', error);
      throw error;
    }

    if (!data) {
      console.log('⚠️ Student not found');
      return null;
    }

    console.log('✅ Student found:', data);
    
    // Convert database format to UI format
    const student = convertToCompleteStudent(data);
    return student;

  } catch (error) {
    console.error('💥 Error in getStudentById:', error);
    throw error;
  }
};

// ============================================================================
// CREATE & UPDATE FUNCTIONS - Phase 1.2 Implementation
// ============================================================================

/**
 * Create a new student in the database
 * This will replace the mock addNewStudent function
 */
export const createStudent = async (studentData: {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  whatsapp?: string;
  street?: string;
  apartment?: string;
  city?: string;
  postalCode?: string;
  dateOfBirth?: string;
  status?: 'active' | 'on_hold' | 'completed' | 'dropped';
}): Promise<Student> => {
  try {
    console.log('🔍 Creating new student...', studentData);

    // Step 1: Create the profile (database will auto-generate id)
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .insert({
        email: studentData.email,
        role: 'student',
        first_name: studentData.firstName,
        last_name: studentData.lastName,
        phone: studentData.phone,
        whatsapp: studentData.whatsapp || studentData.phone,
        street_address: studentData.street || '',
        apartment: studentData.apartment || '',
        city: studentData.city || '',
        postal_code: studentData.postalCode || ''
      })
      .select()
      .single();

    if (profileError) {
      console.error('❌ Profile creation error:', profileError);
      
      // Check for duplicate email error
      if (profileError.code === '23505' && profileError.message.includes('profiles_email_key')) {
        throw new Error(`A user with email "${studentData.email}" already exists. Please use a different email address.`);
      }
      
      throw profileError;
    }

    console.log('✅ Profile created:', profileData);

    // Step 2: Generate student ID
    const currentYear = new Date().getFullYear();
    const { data: existingStudents } = await supabase
      .from('students')
      .select('student_id')
      .like('student_id', `DS${currentYear}%`)
      .order('student_id', { ascending: false })
      .limit(1);

    let nextNumber = 1;
    if (existingStudents && existingStudents.length > 0) {
      const lastId = existingStudents[0].student_id;
      const lastNumber = parseInt(lastId.slice(-3));
      nextNumber = lastNumber + 1;
    }
    
    const studentId = `DS${currentYear}${String(nextNumber).padStart(3, '0')}`;

    // Step 3: Calculate enrollment date
    const enrollmentDate = new Date();

    // Step 4: Create the student record
    const { data: studentRecord, error: studentError } = await supabase
      .from('students')
      .insert({
        profile_id: profileData.id,
        student_id: studentId,
        date_of_birth: studentData.dateOfBirth || null,
        status: studentData.status || 'active',
        current_phase: 1,
        total_hours_completed: 0,
        enrollment_date: enrollmentDate.toISOString().split('T')[0],
        // contract_expiry_date is auto-generated by database (enrollment_date + 18 months)
        needs_support: false,
        attendance_issues: false
      })
      .select()
      .single();

    if (studentError) {
      console.error('❌ Student creation error:', studentError);
      throw studentError;
    }

    console.log('✅ Student created:', studentRecord);

    // Step 5: Return the complete student object
    const completeStudent: Student = {
      id: studentRecord.id,
      firstName: studentData.firstName,
      lastName: studentData.lastName,
      studentId: studentId,
      phone: studentData.phone,
      email: studentData.email,
      whatsapp: studentData.whatsapp || studentData.phone,
      street: studentData.street || '',
      apartment: studentData.apartment || '',
      city: studentData.city || '',
      postalCode: studentData.postalCode || '',
      dateOfBirth: studentData.dateOfBirth || '',
      learnerLicenseNumber: '',
      group: "none", // TODO: Add group assignment later
      status: (studentData.status || 'active') as any,
      currentPhase: 1,
      totalCompletedSessions: 0,
      enrollmentDate: enrollmentDate.toISOString().split('T')[0],
      contractExpiryDate: studentRecord.contract_expiry_date || enrollmentDate.toISOString().split('T')[0],
      needsSupport: false,
      attendanceIssues: false,
      documents: []
    };

    return completeStudent;

  } catch (error) {
    console.error('💥 Error in createStudent:', error);
    throw error;
  }
};

/**
 * Update an existing student in the database
 * This will replace the mock student update functionality
 */
export const updateStudent = async (studentId: string, updates: Partial<Student>): Promise<Student> => {
  try {
    console.log('🔍 Updating student...', studentId, updates);

    // Step 1: Update the profile data
    if (updates.firstName || updates.lastName || updates.email || updates.phone || 
        updates.whatsapp || updates.street || updates.apartment || updates.city || updates.postalCode) {
      
      const profileUpdates: any = {};
      if (updates.firstName) profileUpdates.first_name = updates.firstName;
      if (updates.lastName) profileUpdates.last_name = updates.lastName;
      if (updates.email) profileUpdates.email = updates.email;
      if (updates.phone) profileUpdates.phone = updates.phone;
      if (updates.whatsapp) profileUpdates.whatsapp = updates.whatsapp;
      if (updates.street) profileUpdates.street_address = updates.street;
      if (updates.apartment) profileUpdates.apartment = updates.apartment;
      if (updates.city) profileUpdates.city = updates.city;
      if (updates.postalCode) profileUpdates.postal_code = updates.postalCode;

      const { error: profileError } = await supabase
        .from('profiles')
        .update(profileUpdates)
        .eq('id', (await supabase.from('students').select('profile_id').eq('id', studentId).single()).data?.profile_id);

      if (profileError) {
        console.error('❌ Profile update error:', profileError);
        
        // Check for duplicate email error
        if (profileError.code === '23505' && profileError.message.includes('profiles_email_key')) {
          throw new Error(`A user with email "${updates.email}" already exists. Please use a different email address.`);
        }
        
        throw profileError;
      }
    }

    // Step 2: Update the student data
    const studentUpdates: any = {};
    if (updates.dateOfBirth) studentUpdates.date_of_birth = updates.dateOfBirth;
    if (updates.learnerLicenseNumber) studentUpdates.learner_license_number = updates.learnerLicenseNumber;
    if (updates.status) studentUpdates.status = updates.status === 'on-hold' ? 'on_hold' : updates.status;
    if (updates.currentPhase) studentUpdates.current_phase = updates.currentPhase;
    if (updates.totalCompletedSessions !== undefined) studentUpdates.total_hours_completed = updates.totalCompletedSessions;
    if (updates.enrollmentDate) studentUpdates.enrollment_date = updates.enrollmentDate;
    // Note: contract_expiry_date is a generated column (enrollment_date + 18 months) - cannot be updated manually
    if (updates.needsSupport !== undefined) studentUpdates.needs_support = updates.needsSupport;
    if (updates.attendanceIssues !== undefined) studentUpdates.attendance_issues = updates.attendanceIssues;

    if (Object.keys(studentUpdates).length > 0) {
      const { error: studentError } = await supabase
        .from('students')
        .update(studentUpdates)
        .eq('id', studentId);

      if (studentError) {
        console.error('❌ Student update error:', studentError);
        throw studentError;
      }
    }

    console.log('✅ Student updated successfully');

    // Step 3: Fetch and return the updated student
    const updatedStudent = await getStudentById(studentId);
    if (!updatedStudent) {
      throw new Error('Failed to fetch updated student');
    }

    return updatedStudent;

  } catch (error) {
    console.error('💥 Error in updateStudent:', error);
    throw error;
  }
};

/**
 * Delete a student from the database
 * This removes both the student record and the associated profile
 */
export const deleteStudent = async (studentId: string): Promise<void> => {
  try {
    console.log('🔍 Deleting student...', studentId);

    // Step 1: Get the student's profile_id before deletion
    const { data: studentData, error: fetchError } = await supabase
      .from('students')
      .select('profile_id')
      .eq('id', studentId)
      .single();

    if (fetchError) {
      console.error('❌ Error fetching student for deletion:', fetchError);
      throw new Error('Student not found or could not be accessed');
    }

    if (!studentData) {
      throw new Error('Student not found');
    }

    // Step 2: Delete the student record first (due to foreign key constraints)
    const { error: studentDeleteError } = await supabase
      .from('students')
      .delete()
      .eq('id', studentId);

    if (studentDeleteError) {
      console.error('❌ Error deleting student record:', studentDeleteError);
      throw new Error('Failed to delete student record');
    }

    // Step 3: Delete the associated profile
    const { error: profileDeleteError } = await supabase
      .from('profiles')
      .delete()
      .eq('id', studentData.profile_id);

    if (profileDeleteError) {
      console.error('❌ Error deleting profile:', profileDeleteError);
      // Note: Student record is already deleted, but profile deletion failed
      // In a production app, you might want to implement a cleanup job
      throw new Error('Student deleted but profile cleanup failed');
    }

    console.log('✅ Student and profile deleted successfully');

  } catch (error) {
    console.error('💥 Error in deleteStudent:', error);
    throw error;
  }
};

/**
 * Delete multiple students from the database
 * This is for bulk delete operations
 */
export const deleteMultipleStudents = async (studentIds: string[]): Promise<void> => {
  try {
    console.log('🔍 Bulk deleting students...', studentIds);

    if (studentIds.length === 0) {
      throw new Error('No students selected for deletion');
    }

    // Step 1: Get all profile_ids for the students to be deleted
    const { data: studentsData, error: fetchError } = await supabase
      .from('students')
      .select('id, profile_id')
      .in('id', studentIds);

    if (fetchError) {
      console.error('❌ Error fetching students for bulk deletion:', fetchError);
      throw new Error('Could not fetch students for deletion');
    }

    if (!studentsData || studentsData.length === 0) {
      throw new Error('No students found for deletion');
    }

    const profileIds = studentsData.map(student => student.profile_id);

    // Step 2: Delete all student records
    const { error: studentsDeleteError } = await supabase
      .from('students')
      .delete()
      .in('id', studentIds);

    if (studentsDeleteError) {
      console.error('❌ Error bulk deleting student records:', studentsDeleteError);
      throw new Error('Failed to delete student records');
    }

    // Step 3: Delete all associated profiles
    const { error: profilesDeleteError } = await supabase
      .from('profiles')
      .delete()
      .in('id', profileIds);

    if (profilesDeleteError) {
      console.error('❌ Error bulk deleting profiles:', profilesDeleteError);
      throw new Error('Students deleted but profile cleanup failed');
    }

    console.log(`✅ Successfully deleted ${studentIds.length} students and their profiles`);

  } catch (error) {
    console.error('💥 Error in deleteMultipleStudents:', error);
    throw error;
  }
};

// ============================================================================
// SCHEDULING FUNCTIONS - For class scheduling and dropdowns
// ============================================================================

// Simplified student format for dropdowns and scheduling
export interface StudentOption {
  id: string;
  name: string; // "First Last"
  studentId: string; // DS2025001
  email: string;
  phone: string;
  status: 'active' | 'on-hold' | 'completed' | 'dropped';
  currentPhase: number;
  isActive: boolean;
}

/**
 * Get students in simplified format for scheduling dropdowns
 * This is commonly used in class creation forms
 */
export const getStudentsForScheduling = async (): Promise<StudentOption[]> => {
  try {
    console.log('🔍 Fetching students for scheduling dropdowns...');

    // Use the existing getStudents function and convert to simplified format
    const allStudents = await getStudents();
    
    console.log(`✅ Converting ${allStudents.length} students to scheduling format`);
    
    // Convert full student objects to simplified options
    // Only include active students for scheduling
    const activeStudents = allStudents.filter(student => 
      student.status === 'active' || student.status === 'on-hold'
    );
    
    return activeStudents.map(student => ({
      id: student.id,
      name: `${student.firstName} ${student.lastName}`,
      studentId: student.studentId,
      email: student.email,
      phone: student.phone,
      status: student.status,
      currentPhase: student.currentPhase,
      isActive: student.status === 'active'
    }));

  } catch (error) {
    console.error('💥 Error in getStudentsForScheduling:', error);
    throw error;
  }
};

/**
 * Get students enrolled in a specific group
 * This is useful for theory class scheduling
 */
export const getStudentsByGroup = async (groupId: string): Promise<BasicStudent[]> => {
  try {
    console.log('🔍 Fetching students for group:', groupId);

    const { data, error } = await supabase
      .from('student_groups')
      .select(`
        student_id,
        enrolled_at,
        status,
        students!inner (
          id,
          student_id,
          current_phase,
          total_hours_completed,
          status,
          has_balance,
          has_missing_classes,
          profiles!inner (
            first_name,
            last_name,
            email,
            phone
          )
        )
      `)
      .eq('group_id', groupId)
      .eq('status', 'active');

    if (error) {
      console.error('❌ Error fetching students by group:', error);
      throw new Error(`Failed to fetch students for group: ${error.message}`);
    }

    if (!data || data.length === 0) {
      console.log('📭 No students found in this group');
      return [];
    }

    console.log(`✅ Successfully fetched ${data.length} students for group`);
    
    // Convert the joined data to BasicStudent format
    return data.map((item: any) => {
      const student = item.students;
      return convertToBasicStudent(student);
    });

  } catch (error) {
    console.error('💥 Error in getStudentsByGroup:', error);
    throw error;
  }
};

/**
 * Get available students for a specific class type
 * This helps filter students based on their current phase and status
 */
export const getAvailableStudentsForClass = async (classType: 'theory' | 'practical'): Promise<StudentOption[]> => {
  try {
    console.log('🔍 Fetching available students for class type:', classType);

    const allStudents = await getStudentsForScheduling();
    
    // Filter based on class type and student phase
    const availableStudents = allStudents.filter(student => {
      // Only active students can be scheduled
      if (student.status !== 'active') return false;
      
      // For theory classes, students in any phase can attend
      if (classType === 'theory') return true;
      
      // For practical classes, students should be in phase 2 or higher
      if (classType === 'practical') return student.currentPhase >= 2;
      
      return true;
    });

    console.log(`✅ Found ${availableStudents.length} available students for ${classType} classes`);
    return availableStudents;

  } catch (error) {
    console.error('💥 Error in getAvailableStudentsForClass:', error);
    throw error;
  }
};

/**
 * Check if a student is available for scheduling at a specific time
 * This will be useful for conflict detection
 */
export const checkStudentAvailability = async (
  studentId: string, 
  startTime: string, 
  endTime: string
): Promise<boolean> => {
  try {
    console.log('🔍 Checking student availability:', { studentId, startTime, endTime });

    // Check if student has any classes during this time
    const { data, error } = await supabase
      .from('classes')
      .select('id')
      .eq('student_id', studentId)
      .eq('status', 'scheduled')
      .or(`and(start_time.lte.${startTime},end_time.gt.${startTime}),and(start_time.lt.${endTime},end_time.gte.${endTime}),and(start_time.gte.${startTime},end_time.lte.${endTime})`);

    if (error) {
      console.error('❌ Error checking student availability:', error);
      throw new Error('Failed to check student availability');
    }

    const isAvailable = !data || data.length === 0;
    console.log(`✅ Student availability check: ${isAvailable ? 'Available' : 'Busy'}`);
    
    return isAvailable;

  } catch (error) {
    console.error('💥 Error in checkStudentAvailability:', error);
    throw error;
  }
};

/**
 * Get student statistics for dashboard
 */
export const getStudentStats = async (): Promise<{
  total: number;
  active: number;
  onHold: number;
  completed: number;
  dropped: number;
  averagePhase: number;
  averageHours: number;
}> => {
  try {
    console.log('🔍 Fetching student statistics...');

    // Use the existing getStudents function which we know works
    const allStudents = await getStudents();
    
    // Calculate stats from the fetched students
    const activeStudents = allStudents.filter(student => student.status === 'active');
    const onHoldStudents = allStudents.filter(student => student.status === 'on-hold');
    const completedStudents = allStudents.filter(student => student.status === 'completed');
    const droppedStudents = allStudents.filter(student => student.status === 'dropped');
    
    const totalHours = allStudents.reduce((sum, student) => sum + student.totalHours, 0);
    const totalPhases = allStudents.reduce((sum, student) => sum + student.currentPhase, 0);
    
    const averageHours = allStudents.length > 0 
      ? Math.round((totalHours / allStudents.length) * 100) / 100
      : 0;
    
    const averagePhase = allStudents.length > 0 
      ? Math.round((totalPhases / allStudents.length) * 100) / 100
      : 0;

    const stats = {
      total: allStudents.length,
      active: activeStudents.length,
      onHold: onHoldStudents.length,
      completed: completedStudents.length,
      dropped: droppedStudents.length,
      averagePhase,
      averageHours
    };

    console.log('✅ Successfully calculated student stats:', stats);
    return stats;

  } catch (error) {
    console.error('💥 Error in getStudentStats:', error);
    throw error;
  }
};

// ============================================================================
// COMING NEXT - Functions we'll add later
// ============================================================================

// export const archiveStudent = async (id: string): Promise<void> => { ... }
// export const restoreStudent = async (id: string): Promise<void> => { ... }
