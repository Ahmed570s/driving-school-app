// Classes Service Layer - Handles all database operations for classes/lessons
import { supabase } from '@/lib/supabaseClient';

// ============================================================================
// TYPES - What data looks like coming from the database
// ============================================================================

// This is what Supabase returns when we join classes + instructors + profiles + students tables
export interface DatabaseClass {
  // From classes table
  id: string;
  title: string;
  description: string | null;
  class_type: 'theory' | 'practical';
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';
  start_time: string; // ISO timestamp
  end_time: string; // ISO timestamp
  duration_minutes: number;
  instructor_id: string;
  student_id: string | null;
  group_id: string | null;
  location: string | null;
  notes: string | null;
  lesson_plan: string | null;
  cost: number | null;
  created_at: string;
  updated_at: string;
  
  // From instructors + profiles join (instructor info)
  instructors: {
    id: string;
    employee_id: string;
    profiles: {
      first_name: string;
      last_name: string;
      email: string;
      phone: string | null;
    };
  } | null;
  
  // From students + profiles join (student info) - for practical classes
  students: {
    id: string;
    student_id: string;
    profiles: {
      first_name: string;
      last_name: string;
      email: string;
      phone: string | null;
    };
  } | null;
  
  // From groups table - for theory classes
  groups: {
    id: string;
    name: string;
    description: string | null;
  } | null;
}

// UI-friendly format for displaying classes in the calendar
export interface ClassItem {
  id: string;
  student: string; // Full name or group name
  date: string; // YYYY-MM-DD format
  startTime: string; // HH:MM format
  endTime: string; // HH:MM format
  phone: string;
  instructor: string; // Full instructor name
  className: string; // title from database
  type: 'Theory' | 'Practical';
  group: string;
  duration: string; // "60 minutes" format
  notes: string;
  // Additional fields for editing
  instructorId: string;
  studentId: string | null;
  groupId: string | null;
  location: string;
  cost: number | null;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';
}

// Form data format for creating/editing classes
export interface ClassFormData {
  type: 'Theory' | 'Practical' | '';
  date: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  duration: number; // minutes
  instructor: string; // instructor ID
  selectedStudents: string[]; // student IDs for practical classes
  selectedGroup: string; // group ID for theory classes
  notes: string;
  title?: string; // class title/name
  location?: string;
  cost?: number;
}

// Filter options for fetching classes
export interface ClassFilters {
  instructorId?: string;
  studentId?: string;
  groupId?: string;
  startDate?: string; // YYYY-MM-DD
  endDate?: string; // YYYY-MM-DD
  status?: 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';
  type?: 'theory' | 'practical';
}

// ============================================================================
// HELPER FUNCTIONS - Convert database format to UI format
// ============================================================================

/**
 * Converts database class to ClassItem format for the UI
 * This is like a translator - takes database format and makes it UI-friendly
 */
const convertToClassItem = (dbClass: DatabaseClass): ClassItem => {
  // Extract instructor info
  const instructor = dbClass.instructors?.profiles 
    ? `${dbClass.instructors.profiles.first_name} ${dbClass.instructors.profiles.last_name}`
    : 'Unknown Instructor';
  
  // Extract student info (for practical classes)
  const student = dbClass.students?.profiles 
    ? `${dbClass.students.profiles.first_name} ${dbClass.students.profiles.last_name}`
    : dbClass.groups?.name || 'Unknown';
  
  // Extract phone (prefer student phone, fallback to instructor phone)
  const phone = dbClass.students?.profiles?.phone 
    || dbClass.instructors?.profiles?.phone 
    || '';
  
  // Extract group name
  const group = dbClass.groups?.name || 'Individual';
  
  // Convert timestamps to date and time
  const startDateTime = new Date(dbClass.start_time);
  const endDateTime = new Date(dbClass.end_time);
  
  const date = startDateTime.toISOString().split('T')[0]; // YYYY-MM-DD
  const startTime = startDateTime.toTimeString().slice(0, 5); // HH:MM
  const endTime = endDateTime.toTimeString().slice(0, 5); // HH:MM
  
  // Format duration
  const duration = `${dbClass.duration_minutes} minutes`;
  
  // Capitalize class type for UI
  const type = dbClass.class_type === 'theory' ? 'Theory' : 'Practical';
  
  return {
    id: dbClass.id,
    student,
    date,
    startTime,
    endTime,
    phone,
    instructor,
    className: dbClass.title,
    type,
    group,
    duration,
    notes: dbClass.notes || '',
    // Additional fields for editing
    instructorId: dbClass.instructor_id,
    studentId: dbClass.student_id,
    groupId: dbClass.group_id,
    location: dbClass.location || '',
    cost: dbClass.cost,
    status: dbClass.status
  };
};

/**
 * Converts form data to database format for creating/updating classes
 */
const convertToDatabase = (formData: ClassFormData) => {
  // Calculate end time based on start time and duration
  const startDateTime = new Date(`${formData.date}T${formData.startTime}:00`);
  const endDateTime = new Date(startDateTime.getTime() + formData.duration * 60000);
  
  // Determine if it's a theory or practical class
  const isTheoryClass = formData.type === 'Theory';
  
  return {
    title: formData.title || `${formData.type} Class`,
    description: formData.notes || null,
    class_type: formData.type.toLowerCase() as 'theory' | 'practical',
    status: 'scheduled' as const,
    start_time: startDateTime.toISOString(),
    end_time: endDateTime.toISOString(),
    instructor_id: formData.instructor,
    student_id: isTheoryClass ? null : (formData.selectedStudents[0] || null),
    group_id: isTheoryClass ? formData.selectedGroup : null,
    location: formData.location || null,
    notes: formData.notes || null,
    cost: formData.cost || null
  };
};

// ============================================================================
// MAIN CRUD FUNCTIONS - Database operations
// ============================================================================

/**
 * Fetch classes with optional filtering
 * This is the main function to get classes for the calendar
 */
export const getClasses = async (filters?: ClassFilters): Promise<ClassItem[]> => {
  try {
    console.log('🔍 Fetching classes with filters:', filters);

    // Start building the query
    let query = supabase
      .from('classes')
      .select(`
        *,
        instructors!inner (
          id,
          employee_id,
          profiles!inner (
            first_name,
            last_name,
            email,
            phone
          )
        ),
        students (
          id,
          student_id,
          profiles (
            first_name,
            last_name,
            email,
            phone
          )
        ),
        groups (
          id,
          name,
          description
        )
      `)
      .order('start_time', { ascending: true });

    // Apply filters if provided
    if (filters) {
      if (filters.instructorId) {
        query = query.eq('instructor_id', filters.instructorId);
      }
      if (filters.studentId) {
        query = query.eq('student_id', filters.studentId);
      }
      if (filters.groupId) {
        query = query.eq('group_id', filters.groupId);
      }
      if (filters.startDate) {
        query = query.gte('start_time', `${filters.startDate}T00:00:00`);
      }
      if (filters.endDate) {
        query = query.lte('start_time', `${filters.endDate}T23:59:59`);
      }
      if (filters.status) {
        query = query.eq('status', filters.status);
      }
      if (filters.type) {
        query = query.eq('class_type', filters.type);
      }
    }

    const { data, error } = await query;

    if (error) {
      console.error('❌ Error fetching classes:', error);
      throw new Error('Failed to fetch classes from database');
    }

    if (!data) {
      console.log('📭 No classes found');
      return [];
    }

    console.log(`✅ Successfully fetched ${data.length} classes`);
    
    // Convert database format to UI format
    return data.map(convertToClassItem);

  } catch (error) {
    console.error('💥 Error in getClasses:', error);
    throw error;
  }
};

/**
 * Fetch a single class by ID with full details
 */
export const getClassById = async (id: string): Promise<ClassItem | null> => {
  try {
    console.log('🔍 Fetching class by ID:', id);

    const { data, error } = await supabase
      .from('classes')
      .select(`
        *,
        instructors!inner (
          id,
          employee_id,
          profiles!inner (
            first_name,
            last_name,
            email,
            phone
          )
        ),
        students (
          id,
          student_id,
          profiles (
            first_name,
            last_name,
            email,
            phone
          )
        ),
        groups (
          id,
          name,
          description
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error('❌ Error fetching class:', error);
      throw new Error('Failed to fetch class from database');
    }

    if (!data) {
      console.log('📭 Class not found');
      return null;
    }

    console.log('✅ Successfully fetched class');
    return convertToClassItem(data);

  } catch (error) {
    console.error('💥 Error in getClassById:', error);
    throw error;
  }
};

/**
 * Create a new class
 */
export const createClass = async (classData: ClassFormData): Promise<ClassItem> => {
  try {
    console.log('🔍 Creating new class:', classData);

    // Convert form data to database format
    const dbData = convertToDatabase(classData);

    const { data, error } = await supabase
      .from('classes')
      .insert(dbData)
      .select(`
        *,
        instructors!inner (
          id,
          employee_id,
          profiles!inner (
            first_name,
            last_name,
            email,
            phone
          )
        ),
        students (
          id,
          student_id,
          profiles (
            first_name,
            last_name,
            email,
            phone
          )
        ),
        groups (
          id,
          name,
          description
        )
      `)
      .single();

    if (error) {
      console.error('❌ Error creating class:', error);
      throw new Error('Failed to create class in database');
    }

    if (!data) {
      throw new Error('No data returned after creating class');
    }

    console.log('✅ Successfully created class');
    return convertToClassItem(data);

  } catch (error) {
    console.error('💥 Error in createClass:', error);
    throw error;
  }
};

/**
 * Update an existing class
 */
export const updateClass = async (id: string, updates: Partial<ClassItem>): Promise<ClassItem> => {
  try {
    console.log('🔍 Updating class:', id, updates);

    // Convert UI updates to database format
    const dbUpdates: any = {};
    
    if (updates.className !== undefined) dbUpdates.title = updates.className;
    if (updates.notes !== undefined) dbUpdates.notes = updates.notes;
    if (updates.location !== undefined) dbUpdates.location = updates.location;
    if (updates.cost !== undefined) dbUpdates.cost = updates.cost;
    if (updates.status !== undefined) dbUpdates.status = updates.status;
    if (updates.instructorId !== undefined) dbUpdates.instructor_id = updates.instructorId;
    if (updates.studentId !== undefined) dbUpdates.student_id = updates.studentId;
    if (updates.groupId !== undefined) dbUpdates.group_id = updates.groupId;
    
    // Handle time updates
    if (updates.date || updates.startTime || updates.duration) {
      // We need the current class data to calculate new times
      const currentClass = await getClassById(id);
      if (!currentClass) {
        throw new Error('Class not found for update');
      }
      
      const date = updates.date || currentClass.date;
      const startTime = updates.startTime || currentClass.startTime;
      const duration = updates.duration ? `${updates.duration} minutes` : currentClass.duration;
      const durationMinutes = parseInt(duration.split(' ')[0]);
      
      const startDateTime = new Date(`${date}T${startTime}:00`);
      const endDateTime = new Date(startDateTime.getTime() + durationMinutes * 60000);
      
      dbUpdates.start_time = startDateTime.toISOString();
      dbUpdates.end_time = endDateTime.toISOString();
    }

    // Add updated timestamp
    dbUpdates.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('classes')
      .update(dbUpdates)
      .eq('id', id)
      .select(`
        *,
        instructors!inner (
          id,
          employee_id,
          profiles!inner (
            first_name,
            last_name,
            email,
            phone
          )
        ),
        students (
          id,
          student_id,
          profiles (
            first_name,
            last_name,
            email,
            phone
          )
        ),
        groups (
          id,
          name,
          description
        )
      `)
      .single();

    if (error) {
      console.error('❌ Error updating class:', error);
      throw new Error('Failed to update class in database');
    }

    if (!data) {
      throw new Error('No data returned after updating class');
    }

    console.log('✅ Successfully updated class');
    return convertToClassItem(data);

  } catch (error) {
    console.error('💥 Error in updateClass:', error);
    throw error;
  }
};

/**
 * Delete a class from the database
 */
export const deleteClass = async (id: string): Promise<void> => {
  try {
    console.log('🔍 Deleting class:', id);

    const { error } = await supabase
      .from('classes')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('❌ Error deleting class:', error);
      throw new Error('Failed to delete class from database');
    }

    console.log('✅ Successfully deleted class');

  } catch (error) {
    console.error('💥 Error in deleteClass:', error);
    throw error;
  }
};

// ============================================================================
// HELPER FUNCTIONS - Additional utilities
// ============================================================================

/**
 * Get classes for a specific instructor
 */
export const getClassesByInstructor = async (instructorId: string, date?: string): Promise<ClassItem[]> => {
  const filters: ClassFilters = { instructorId };
  
  if (date) {
    filters.startDate = date;
    filters.endDate = date;
  }
  
  return getClasses(filters);
};

/**
 * Get classes for a specific student
 */
export const getClassesByStudent = async (studentId: string): Promise<ClassItem[]> => {
  return getClasses({ studentId });
};

/**
 * Get classes for a specific date range
 */
export const getClassesByDateRange = async (startDate: string, endDate: string): Promise<ClassItem[]> => {
  return getClasses({ startDate, endDate });
};

/**
 * Get upcoming classes (next 7 days)
 */
export const getUpcomingClasses = async (): Promise<ClassItem[]> => {
  const today = new Date().toISOString().split('T')[0];
  const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  
  return getClasses({ 
    startDate: today, 
    endDate: nextWeek,
    status: 'scheduled'
  });
};
