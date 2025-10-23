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
    email: profile.email,
    phone: profile.phone,
    group: "A", // TODO: Get real group from database later
    hoursDone: dbStudent.total_hours_completed,
    status: convertStatus(dbStudent.status),
    hasBalance: dbStudent.has_balance,
    hasMissingClasses: dbStudent.has_missing_classes
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
    
    // For now, return null - we'll implement this in the next step
    // This is called "stubbing" - creating the function structure first
    console.log('⚠️ getStudentById not implemented yet');
    return null;

  } catch (error) {
    console.error('💥 Error in getStudentById:', error);
    throw error;
  }
};

// ============================================================================
// COMING NEXT - Functions we'll add later
// ============================================================================

// export const createStudent = async (studentData: any): Promise<Student> => { ... }
// export const updateStudent = async (id: string, updates: any): Promise<Student> => { ... }
// export const deleteStudent = async (id: string): Promise<void> => { ... }
