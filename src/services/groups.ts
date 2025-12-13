// Groups Service Layer - Handles all database operations for student groups
import { supabase } from '@/lib/supabaseClient';

// ============================================================================
// TYPES - What data looks like coming from the database
// ============================================================================

// This is what Supabase returns when we join groups + profiles tables
export interface DatabaseGroup {
  // From groups table
  id: string;
  name: string;
  description: string | null;
  capacity: number;
  current_enrollment: number;
  status: 'active' | 'inactive' | 'completed';
  start_date: string | null; // ISO date string
  end_date: string | null; // ISO date string
  primary_instructor_id: string | null;
  created_at: string;
  updated_at: string;
  
  // From profiles table (joined) - for primary instructor
  profiles: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone: string | null;
  } | null;
}

// UI-friendly format for displaying groups
export interface Group {
  id: string;
  name: string;
  description: string;
  capacity: number;
  currentEnrollment: number;
  availableSpots: number; // calculated field
  status: 'active' | 'inactive' | 'completed';
  startDate: string; // YYYY-MM-DD format or empty
  endDate: string; // YYYY-MM-DD format or empty
  primaryInstructor: {
    id: string | null;
    name: string; // "First Last" or "No Instructor"
    email: string;
    phone: string;
  };
  enrollmentPercentage: number; // calculated field (0-100)
  isActive: boolean; // status === 'active'
  isFull: boolean; // currentEnrollment >= capacity
  createdAt: string;
  updatedAt: string;
}

// Simplified group format for dropdowns and selections
export interface GroupOption {
  id: string;
  name: string;
  capacity: number;
  currentEnrollment: number;
  availableSpots: number;
  status: 'active' | 'inactive' | 'completed';
  isFull: boolean;
}

// Filter options for fetching groups
export interface GroupFilters {
  status?: 'active' | 'inactive' | 'completed';
  hasAvailableSpots?: boolean;
  instructorId?: string;
}

// Input shape for creating/updating groups
export interface GroupInput {
  name: string;
  description?: string;
  capacity: number;
  status: 'active' | 'inactive' | 'completed';
  startDate?: string | null;
  endDate?: string | null;
  primaryInstructorId?: string | null;
}

// ============================================================================
// HELPER FUNCTIONS - Convert database format to UI format
// ============================================================================

/**
 * Converts database group to Group format for the UI
 * This is like a translator - takes database format and makes it UI-friendly
 */
const convertToGroup = (dbGroup: DatabaseGroup): Group => {
  // Handle instructor info
  const instructor = dbGroup.profiles ? {
    id: dbGroup.primary_instructor_id,
    name: `${dbGroup.profiles.first_name} ${dbGroup.profiles.last_name}`,
    email: dbGroup.profiles.email,
    phone: dbGroup.profiles.phone || ''
  } : {
    id: null,
    name: 'No Instructor',
    email: '',
    phone: ''
  };
  
  // Format dates
  const startDate = dbGroup.start_date ? dbGroup.start_date.split('T')[0] : '';
  const endDate = dbGroup.end_date ? dbGroup.end_date.split('T')[0] : '';
  
  // Calculate derived fields
  const availableSpots = Math.max(0, dbGroup.capacity - dbGroup.current_enrollment);
  const enrollmentPercentage = dbGroup.capacity > 0 
    ? Math.round((dbGroup.current_enrollment / dbGroup.capacity) * 100)
    : 0;
  const isActive = dbGroup.status === 'active';
  const isFull = dbGroup.current_enrollment >= dbGroup.capacity;
  
  return {
    id: dbGroup.id,
    name: dbGroup.name,
    description: dbGroup.description || '',
    capacity: dbGroup.capacity,
    currentEnrollment: dbGroup.current_enrollment,
    availableSpots,
    status: dbGroup.status,
    startDate,
    endDate,
    primaryInstructor: instructor,
    enrollmentPercentage,
    isActive,
    isFull,
    createdAt: dbGroup.created_at,
    updatedAt: dbGroup.updated_at
  };
};

/**
 * Converts database group to simplified GroupOption format
 * Used for dropdowns and selection lists
 */
const convertToGroupOption = (dbGroup: DatabaseGroup): GroupOption => {
  const availableSpots = Math.max(0, dbGroup.capacity - dbGroup.current_enrollment);
  const isFull = dbGroup.current_enrollment >= dbGroup.capacity;
  
  return {
    id: dbGroup.id,
    name: dbGroup.name,
    capacity: dbGroup.capacity,
    currentEnrollment: dbGroup.current_enrollment,
    availableSpots,
    status: dbGroup.status,
    isFull
  };
};

// ============================================================================
// MAIN CRUD FUNCTIONS - Database operations
// ============================================================================

/**
 * Fetch all groups with their instructor data
 * This is the main function to get groups for management
 */
export const getGroups = async (filters?: GroupFilters): Promise<Group[]> => {
  try {
    console.log('🔍 Fetching groups with filters:', filters);

    // First, let's do a simple count to see if groups table exists and has data
    const { count, error: countError } = await supabase
      .from('groups')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.error('❌ Error checking groups table:', countError);
      throw new Error(`Database error: ${countError.message}`);
    }

    console.log(`📊 Found ${count} groups in database`);

    if (count === 0) {
      console.log('📭 No groups in database');
      return [];
    }

    // Start building the query
    let query = supabase
      .from('groups')
      .select(`
        *,
        profiles (
          id,
          first_name,
          last_name,
          email,
          phone
        )
      `)
      .order('created_at', { ascending: false });

    // Apply filters if provided
    if (filters) {
      if (filters.status) {
        query = query.eq('status', filters.status);
      }
      if (filters.hasAvailableSpots) {
        // Only groups that aren't full
        query = query.lt('current_enrollment', 'capacity');
      }
      if (filters.instructorId) {
        query = query.eq('primary_instructor_id', filters.instructorId);
      }
    }

    const { data, error } = await query;

    if (error) {
      console.error('❌ Error fetching groups:', error);
      throw new Error(`Failed to fetch groups: ${error.message}`);
    }

    if (!data) {
      console.log('📭 No groups found');
      return [];
    }

    console.log(`✅ Successfully fetched ${data.length} groups`);
    
    // Convert database format to UI format
    return data.map(convertToGroup);

  } catch (error) {
    console.error('💥 Error in getGroups:', error);
    throw error;
  }
};

/**
 * Fetch only active groups
 * This is commonly used for dropdowns and student enrollment
 */
export const getActiveGroups = async (): Promise<Group[]> => {
  return getGroups({ status: 'active' });
};

/**
 * Fetch active groups with available spots (for enrollment)
 */
export const getAvailableGroups = async (): Promise<Group[]> => {
  return getGroups({ 
    status: 'active',
    hasAvailableSpots: true 
  });
};

/**
 * Fetch active groups in simplified format for dropdowns
 */
export const getGroupOptions = async (): Promise<GroupOption[]> => {
  try {
    console.log('🔍 Fetching group options for dropdowns...');

    // Use the working getActiveGroups function and convert to options
    const activeGroups = await getActiveGroups();
    
    console.log(`✅ Converting ${activeGroups.length} active groups to options format`);
    
    // Convert full group objects to simplified options
    return activeGroups.map(group => ({
      id: group.id,
      name: group.name,
      capacity: group.capacity,
      currentEnrollment: group.currentEnrollment,
      availableSpots: group.availableSpots,
      status: group.status,
      isFull: group.isFull
    }));

  } catch (error) {
    console.error('💥 Error in getGroupOptions:', error);
    throw error;
  }
};

/**
 * Fetch a single group by ID with full details
 */
export const getGroupById = async (id: string): Promise<Group | null> => {
  try {
    console.log('🔍 Fetching group by ID:', id);

    const { data, error } = await supabase
      .from('groups')
      .select(`
        *,
        profiles (
          id,
          first_name,
          last_name,
          email,
          phone
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error('❌ Error fetching group:', error);
      throw new Error(`Failed to fetch group: ${error.message}`);
    }

    if (!data) {
      console.log('📭 Group not found');
      return null;
    }

    console.log('✅ Successfully fetched group');
    return convertToGroup(data);

  } catch (error) {
    console.error('💥 Error in getGroupById:', error);
    throw error;
  }
};

/**
 * Get groups assigned to a specific instructor
 */
export const getGroupsByInstructor = async (instructorId: string): Promise<Group[]> => {
  return getGroups({ instructorId });
};

// ============================================================================
// CREATE / UPDATE / DELETE
// ============================================================================

const groupSelectWithProfile = `
  *,
  profiles (
    id,
    first_name,
    last_name,
    email,
    phone
  )
`;

/**
 * Create a new group
 */
export const createGroup = async (input: GroupInput): Promise<Group> => {
  try {
    console.log('🆕 Creating group...', input);

    const payload = {
      name: input.name,
      description: input.description || null,
      capacity: input.capacity,
      current_enrollment: 0,
      status: input.status,
      start_date: input.startDate || null,
      end_date: input.endDate || null,
      primary_instructor_id: input.primaryInstructorId || null
    };

    const { data, error } = await supabase
      .from('groups')
      .insert(payload)
      .select(groupSelectWithProfile)
      .single();

    if (error) {
      console.error('❌ Error creating group:', error);
      throw new Error(`Failed to create group: ${error.message}`);
    }

    if (!data) {
      throw new Error('Group creation returned no data');
    }

    console.log('✅ Group created');
    return convertToGroup(data as DatabaseGroup);
  } catch (error) {
    console.error('💥 Error in createGroup:', error);
    throw error;
  }
};

/**
 * Update an existing group
 */
export const updateGroup = async (id: string, updates: Partial<GroupInput>): Promise<Group> => {
  try {
    console.log('✏️ Updating group...', id, updates);

    const payload: Record<string, any> = {};
    if (updates.name !== undefined) payload.name = updates.name;
    if (updates.description !== undefined) payload.description = updates.description || null;
    if (updates.capacity !== undefined) payload.capacity = updates.capacity;
    if (updates.status !== undefined) payload.status = updates.status;
    if (updates.startDate !== undefined) payload.start_date = updates.startDate || null;
    if (updates.endDate !== undefined) payload.end_date = updates.endDate || null;
    if (updates.primaryInstructorId !== undefined) payload.primary_instructor_id = updates.primaryInstructorId || null;

    if (Object.keys(payload).length === 0) {
      throw new Error('No updates provided for group');
    }

    const { data, error } = await supabase
      .from('groups')
      .update(payload)
      .eq('id', id)
      .select(groupSelectWithProfile)
      .single();

    if (error) {
      console.error('❌ Error updating group:', error);
      throw new Error(`Failed to update group: ${error.message}`);
    }

    if (!data) {
      throw new Error('Group update returned no data');
    }

    console.log('✅ Group updated');
    return convertToGroup(data as DatabaseGroup);
  } catch (error) {
    console.error('💥 Error in updateGroup:', error);
    throw error;
  }
};

/**
 * Delete a group and clean up related records
 */
export const deleteGroup = async (id: string): Promise<void> => {
  try {
    console.log('🗑️ Deleting group...', id);

    // Detach group from classes
    const { error: classError } = await supabase
      .from('classes')
      .update({ group_id: null })
      .eq('group_id', id);

    if (classError) {
      console.error('❌ Error clearing group on classes:', classError);
      throw new Error(`Failed to clear group from classes: ${classError.message}`);
    }

    // Remove student memberships
    const { error: membershipError } = await supabase
      .from('student_groups')
      .delete()
      .eq('group_id', id);

    if (membershipError) {
      console.error('❌ Error deleting group memberships:', membershipError);
      throw new Error(`Failed to delete group memberships: ${membershipError.message}`);
    }

    // Delete the group
    const { error: groupError } = await supabase
      .from('groups')
      .delete()
      .eq('id', id);

    if (groupError) {
      console.error('❌ Error deleting group:', groupError);
      throw new Error(`Failed to delete group: ${groupError.message}`);
    }

    console.log('✅ Group deleted');
  } catch (error) {
    console.error('💥 Error in deleteGroup:', error);
    throw error;
  }
};

// ============================================================================
// MEMBERSHIP HELPERS
// ============================================================================

/**
 * Recalculate and update current_enrollment for a group
 */
const recalcGroupEnrollment = async (groupId: string): Promise<number> => {
  const { count, error } = await supabase
    .from('student_groups')
    .select('*', { count: 'exact', head: true })
    .eq('group_id', groupId)
    .eq('status', 'active');

  if (error) {
    console.error('❌ Error recalculating enrollment:', error);
    // Non-fatal: skip enrollment update if count fails
    return 0;
  }

  const enrollment = count ?? 0;
  const { error: updateError } = await supabase
    .from('groups')
    .update({ current_enrollment: enrollment })
    .eq('id', groupId);

  if (updateError) {
    console.error('❌ Error updating enrollment on group:', updateError);
    // Non-fatal: membership was added, just enrollment count failed
  }

  return enrollment;
};

/**
 * Add or update a student-group membership
 */
export const addStudentToGroup = async (
  groupId: string,
  studentId: string,
  status: 'active' | 'inactive' | 'completed' = 'active'
): Promise<void> => {
  try {
    console.log('➕ Adding student to group', { groupId, studentId, status });

    const { error } = await supabase
      .from('student_groups')
      .upsert(
        {
          group_id: groupId,
          student_id: studentId,
          status,
          enrolled_at: new Date().toISOString()
        },
        { onConflict: 'group_id,student_id' }
      );

    if (error) {
      console.error('❌ Error adding student to group:', error);
      throw new Error(`Failed to add student to group: ${error.message}`);
    }

    // Update enrollment count if active membership
    if (status === 'active') {
      await recalcGroupEnrollment(groupId);
    }

    console.log('✅ Student added to group');
  } catch (error) {
    console.error('💥 Error in addStudentToGroup:', error);
    throw error;
  }
};

/**
 * Remove a student from a group
 */
export const removeStudentFromGroup = async (groupId: string, studentId: string): Promise<void> => {
  try {
    console.log('➖ Removing student from group', { groupId, studentId });

    const { error } = await supabase
      .from('student_groups')
      .delete()
      .eq('group_id', groupId)
      .eq('student_id', studentId);

    if (error) {
      console.error('❌ Error removing student from group:', error);
      throw new Error(`Failed to remove student from group: ${error.message}`);
    }

    await recalcGroupEnrollment(groupId);
    console.log('✅ Student removed from group');
  } catch (error) {
    console.error('💥 Error in removeStudentFromGroup:', error);
    throw error;
  }
};

// ============================================================================
// CLASSES INTEGRATION
// ============================================================================

/**
 * Assign or clear a group on a class
 */
export const setClassGroup = async (classId: string, groupId: string | null): Promise<void> => {
  try {
    console.log('🗂️ Setting class group', { classId, groupId });

    const { error } = await supabase
      .from('classes')
      .update({ group_id: groupId })
      .eq('id', classId);

    if (error) {
      console.error('❌ Error setting class group:', error);
      throw new Error(`Failed to set class group: ${error.message}`);
    }

    console.log('✅ Class group updated');
  } catch (error) {
    console.error('💥 Error in setClassGroup:', error);
    throw error;
  }
};

// ============================================================================
// HELPER FUNCTIONS - Additional utilities
// ============================================================================

/**
 * Get group statistics
 */
export const getGroupStats = async (): Promise<{
  total: number;
  active: number;
  inactive: number;
  completed: number;
  totalCapacity: number;
  totalEnrollment: number;
  averageEnrollment: number;
}> => {
  try {
    console.log('🔍 Fetching group statistics...');

    // Use the existing getGroups function which we know works
    const allGroups = await getGroups();
    
    // Calculate stats from the fetched groups
    const activeGroups = allGroups.filter(group => group.status === 'active');
    const inactiveGroups = allGroups.filter(group => group.status === 'inactive');
    const completedGroups = allGroups.filter(group => group.status === 'completed');
    
    const totalCapacity = allGroups.reduce((sum, group) => sum + group.capacity, 0);
    const totalEnrollment = allGroups.reduce((sum, group) => sum + group.currentEnrollment, 0);
    const averageEnrollment = allGroups.length > 0 
      ? Math.round((totalEnrollment / allGroups.length) * 100) / 100
      : 0;

    const stats = {
      total: allGroups.length,
      active: activeGroups.length,
      inactive: inactiveGroups.length,
      completed: completedGroups.length,
      totalCapacity,
      totalEnrollment,
      averageEnrollment
    };

    console.log('✅ Successfully calculated group stats:', stats);
    return stats;

  } catch (error) {
    console.error('💥 Error in getGroupStats:', error);
    throw error;
  }
};

/**
 * Check if a group has available spots for enrollment
 */
export const checkGroupAvailability = async (groupId: string): Promise<{
  hasSpots: boolean;
  availableSpots: number;
  capacity: number;
  currentEnrollment: number;
}> => {
  try {
    console.log('🔍 Checking group availability:', groupId);

    const { data, error } = await supabase
      .from('groups')
      .select('capacity, current_enrollment')
      .eq('id', groupId)
      .single();

    if (error) {
      console.error('❌ Error checking group availability:', error);
      throw new Error('Failed to check group availability');
    }

    if (!data) {
      throw new Error('Group not found');
    }

    const availableSpots = Math.max(0, data.capacity - data.current_enrollment);
    const hasSpots = availableSpots > 0;

    const result = {
      hasSpots,
      availableSpots,
      capacity: data.capacity,
      currentEnrollment: data.current_enrollment
    };

    console.log(`✅ Group availability check:`, result);
    return result;

  } catch (error) {
    console.error('💥 Error in checkGroupAvailability:', error);
    throw error;
  }
};

/**
 * Get students enrolled in a specific group
 * This will be useful when we integrate with the students service
 */
export const getGroupStudents = async (groupId: string): Promise<any[]> => {
  try {
    console.log('🔍 Fetching students for group:', groupId);

    const { data, error } = await supabase
      .from('student_groups')
      .select(`
        student_id,
        enrolled_at,
        status,
        students (
          id,
          student_id,
          profiles (
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
      console.error('❌ Error fetching group students:', error);
      throw new Error('Failed to fetch group students');
    }

    console.log(`✅ Successfully fetched ${data?.length || 0} students for group`);
    return data || [];

  } catch (error) {
    console.error('💥 Error in getGroupStudents:', error);
    throw error;
  }
};
