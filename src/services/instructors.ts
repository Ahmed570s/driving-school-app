// Instructors Service Layer - Handles all database operations for instructors
import { supabase } from '@/lib/supabaseClient';

// ============================================================================
// TYPES - What data looks like coming from the database
// ============================================================================

// This is what Supabase returns when we join instructors + profiles tables
export interface DatabaseInstructor {
  // From instructors table
  id: string;
  profile_id: string;
  employee_id: string;
  hire_date: string; // ISO date string
  status: 'active' | 'inactive' | 'on_leave';
  license_number: string | null;
  certification_expiry: string | null; // ISO date string
  specializations: string[] | null;
  theory_hours_taught: number;
  practical_hours_taught: number;
  created_at: string;
  updated_at: string;
  
  // From profiles table (joined)
  profiles: {
    id: string;
    email: string;
    role: 'admin' | 'instructor' | 'student';
    status: 'active' | 'inactive' | 'suspended';
    first_name: string;
    last_name: string;
    phone: string | null;
    whatsapp: string | null;
    avatar_url: string | null;
    street_address: string | null;
    apartment: string | null;
    city: string | null;
    postal_code: string | null;
    province: string | null;
    country: string | null;
    is_active: boolean;
  };
}

// UI-friendly format for displaying instructors
export interface Instructor {
  id: string;
  profileId: string;
  employeeId: string;
  fullName: string; // "First Last"
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  whatsapp: string;
  status: 'active' | 'inactive' | 'on_leave';
  hireDate: string; // YYYY-MM-DD format
  licenseNumber: string;
  certificationExpiry: string; // YYYY-MM-DD format or empty
  specializations: string[]; // Array of specialization strings
  theoryHours: number;
  practicalHours: number;
  totalHours: number; // calculated field
  avatar: string;
  address: {
    street: string;
    apartment: string;
    city: string;
    postalCode: string;
    province: string;
    country: string;
  };
  isActive: boolean; // from profiles.is_active
}

// Simplified instructor format for dropdowns and selections
export interface InstructorOption {
  id: string;
  name: string; // "First Last"
  employeeId: string;
  status: 'active' | 'inactive' | 'on_leave';
  specializations: string[];
}

// Filter options for fetching instructors
export interface InstructorFilters {
  status?: 'active' | 'inactive' | 'on_leave';
  specialization?: string;
  isActive?: boolean;
}

// ============================================================================
// HELPER FUNCTIONS - Convert database format to UI format
// ============================================================================

/**
 * Converts database instructor to Instructor format for the UI
 * This is like a translator - takes database format and makes it UI-friendly
 */
const convertToInstructor = (dbInstructor: DatabaseInstructor): Instructor => {
  const profile = dbInstructor.profiles;
  
  // Build full name
  const fullName = `${profile.first_name} ${profile.last_name}`;
  
  // Format dates
  const hireDate = dbInstructor.hire_date ? dbInstructor.hire_date.split('T')[0] : '';
  const certificationExpiry = dbInstructor.certification_expiry 
    ? dbInstructor.certification_expiry.split('T')[0] 
    : '';
  
  // Handle specializations array
  const specializations = dbInstructor.specializations || [];
  
  // Calculate total hours
  const totalHours = dbInstructor.theory_hours_taught + dbInstructor.practical_hours_taught;
  
  return {
    id: dbInstructor.id,
    profileId: dbInstructor.profile_id,
    employeeId: dbInstructor.employee_id,
    fullName,
    firstName: profile.first_name,
    lastName: profile.last_name,
    email: profile.email,
    phone: profile.phone || '',
    whatsapp: profile.whatsapp || '',
    status: dbInstructor.status,
    hireDate,
    licenseNumber: dbInstructor.license_number || '',
    certificationExpiry,
    specializations,
    theoryHours: dbInstructor.theory_hours_taught,
    practicalHours: dbInstructor.practical_hours_taught,
    totalHours,
    avatar: profile.avatar_url || '',
    address: {
      street: profile.street_address || '',
      apartment: profile.apartment || '',
      city: profile.city || '',
      postalCode: profile.postal_code || '',
      province: profile.province || '',
      country: profile.country || 'Canada'
    },
    isActive: profile.is_active
  };
};

/**
 * Converts database instructor to simplified InstructorOption format
 * Used for dropdowns and selection lists
 */
const convertToInstructorOption = (dbInstructor: DatabaseInstructor): InstructorOption => {
  const profile = dbInstructor.profiles;
  const fullName = `${profile.first_name} ${profile.last_name}`;
  
  return {
    id: dbInstructor.id,
    name: fullName,
    employeeId: dbInstructor.employee_id,
    status: dbInstructor.status,
    specializations: dbInstructor.specializations || []
  };
};

// ============================================================================
// MAIN CRUD FUNCTIONS - Database operations
// ============================================================================

/**
 * Fetch all instructors with their profile data
 * This is the main function to get instructors for management
 */
export const getInstructors = async (filters?: InstructorFilters): Promise<Instructor[]> => {
  try {
    console.log('🔍 Fetching instructors with filters:', filters);

    // First, let's do a simple count to see if instructors table exists and has data
    const { count, error: countError } = await supabase
      .from('instructors')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.error('❌ Error checking instructors table:', countError);
      throw new Error(`Database error: ${countError.message}`);
    }

    console.log(`📊 Found ${count} instructors in database`);

    if (count === 0) {
      console.log('📭 No instructors in database');
      return [];
    }

    // Start building the query
    let query = supabase
      .from('instructors')
      .select(`
        *,
        profiles!inner (
          id,
          email,
          role,
          status,
          first_name,
          last_name,
          phone,
          whatsapp,
          avatar_url,
          street_address,
          apartment,
          city,
          postal_code,
          province,
          country,
          is_active
        )
      `)
      .order('created_at', { ascending: false });

    // Apply filters if provided
    if (filters) {
      if (filters.status) {
        query = query.eq('status', filters.status);
      }
      if (filters.specialization) {
        query = query.contains('specializations', [filters.specialization]);
      }
      if (filters.isActive !== undefined) {
        query = query.eq('profiles.is_active', filters.isActive);
      }
    }

    const { data, error } = await query;

    if (error) {
      console.error('❌ Error fetching instructors:', error);
      throw new Error(`Failed to fetch instructors: ${error.message}`);
    }

    if (!data) {
      console.log('📭 No instructors found');
      return [];
    }

    console.log(`✅ Successfully fetched ${data.length} instructors`);
    
    // Convert database format to UI format
    return data.map(convertToInstructor);

  } catch (error) {
    console.error('💥 Error in getInstructors:', error);
    throw error;
  }
};

/**
 * Fetch only active instructors
 * This is commonly used for dropdowns and scheduling
 */
export const getActiveInstructors = async (): Promise<Instructor[]> => {
  return getInstructors({ 
    status: 'active',
    isActive: true 
  });
};

/**
 * Fetch active instructors in simplified format for dropdowns
 */
export const getInstructorOptions = async (): Promise<InstructorOption[]> => {
  try {
    console.log('🔍 Fetching instructor options for dropdowns...');

    // Let's use the same approach as getActiveInstructors but return simplified format
    const activeInstructors = await getActiveInstructors();
    
    console.log(`✅ Converting ${activeInstructors.length} active instructors to options format`);
    
    // Convert full instructor objects to simplified options
    return activeInstructors.map(instructor => ({
      id: instructor.id,
      name: instructor.fullName,
      employeeId: instructor.employeeId,
      status: instructor.status,
      specializations: instructor.specializations
    }));

  } catch (error) {
    console.error('💥 Error in getInstructorOptions:', error);
    throw error;
  }
};

/**
 * Fetch a single instructor by ID with full details
 */
export const getInstructorById = async (id: string): Promise<Instructor | null> => {
  try {
    console.log('🔍 Fetching instructor by ID:', id);

    const { data, error } = await supabase
      .from('instructors')
      .select(`
        *,
        profiles!inner (
          id,
          email,
          role,
          status,
          first_name,
          last_name,
          phone,
          whatsapp,
          avatar_url,
          street_address,
          apartment,
          city,
          postal_code,
          province,
          country,
          is_active
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error('❌ Error fetching instructor:', error);
      throw new Error('Failed to fetch instructor from database');
    }

    if (!data) {
      console.log('📭 Instructor not found');
      return null;
    }

    console.log('✅ Successfully fetched instructor');
    return convertToInstructor(data);

  } catch (error) {
    console.error('💥 Error in getInstructorById:', error);
    throw error;
  }
};

/**
 * Fetch instructor by profile ID (useful when you have the profile ID from auth)
 */
export const getInstructorByProfileId = async (profileId: string): Promise<Instructor | null> => {
  try {
    console.log('🔍 Fetching instructor by profile ID:', profileId);

    const { data, error } = await supabase
      .from('instructors')
      .select(`
        *,
        profiles!inner (
          id,
          email,
          role,
          status,
          first_name,
          last_name,
          phone,
          whatsapp,
          avatar_url,
          street_address,
          apartment,
          city,
          postal_code,
          province,
          country,
          is_active
        )
      `)
      .eq('profile_id', profileId)
      .single();

    if (error) {
      console.error('❌ Error fetching instructor by profile ID:', error);
      throw new Error('Failed to fetch instructor from database');
    }

    if (!data) {
      console.log('📭 Instructor not found for profile ID');
      return null;
    }

    console.log('✅ Successfully fetched instructor by profile ID');
    return convertToInstructor(data);

  } catch (error) {
    console.error('💥 Error in getInstructorByProfileId:', error);
    throw error;
  }
};

// ============================================================================
// HELPER FUNCTIONS - Additional utilities
// ============================================================================

/**
 * Get instructors with specific specialization
 */
export const getInstructorsBySpecialization = async (specialization: string): Promise<Instructor[]> => {
  return getInstructors({ 
    specialization,
    status: 'active',
    isActive: true 
  });
};

/**
 * Get instructor statistics
 */
export const getInstructorStats = async (): Promise<{
  total: number;
  active: number;
  inactive: number;
  onLeave: number;
}> => {
  try {
    console.log('🔍 Fetching instructor statistics...');

    const [totalResult, activeResult, inactiveResult, onLeaveResult] = await Promise.all([
      supabase.from('instructors').select('id', { count: 'exact', head: true }),
      supabase.from('instructors').select('id', { count: 'exact', head: true }).eq('status', 'active'),
      supabase.from('instructors').select('id', { count: 'exact', head: true }).eq('status', 'inactive'),
      supabase.from('instructors').select('id', { count: 'exact', head: true }).eq('status', 'on_leave')
    ]);

    const stats = {
      total: totalResult.count || 0,
      active: activeResult.count || 0,
      inactive: inactiveResult.count || 0,
      onLeave: onLeaveResult.count || 0
    };

    console.log('✅ Successfully fetched instructor stats:', stats);
    return stats;

  } catch (error) {
    console.error('💥 Error in getInstructorStats:', error);
    throw error;
  }
};

/**
 * Check if an instructor is available for a specific time slot
 * This will be useful for scheduling conflict detection
 */
export const checkInstructorAvailability = async (
  instructorId: string, 
  startTime: string, 
  endTime: string
): Promise<boolean> => {
  try {
    console.log('🔍 Checking instructor availability:', { instructorId, startTime, endTime });

    // Check if instructor has any classes during this time
    const { data, error } = await supabase
      .from('classes')
      .select('id')
      .eq('instructor_id', instructorId)
      .eq('status', 'scheduled')
      .or(`and(start_time.lte.${startTime},end_time.gt.${startTime}),and(start_time.lt.${endTime},end_time.gte.${endTime}),and(start_time.gte.${startTime},end_time.lte.${endTime})`);

    if (error) {
      console.error('❌ Error checking instructor availability:', error);
      throw new Error('Failed to check instructor availability');
    }

    const isAvailable = !data || data.length === 0;
    console.log(`✅ Instructor availability check: ${isAvailable ? 'Available' : 'Busy'}`);
    
    return isAvailable;

  } catch (error) {
    console.error('💥 Error in checkInstructorAvailability:', error);
    throw error;
  }
};
