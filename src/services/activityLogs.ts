// Activity Log Service - Handles all activity logging operations
import { supabase } from '@/lib/supabaseClient';

// ============================================================================
// TYPES - Activity Log interfaces
// ============================================================================

// Action types matching the database enum
export type ActionType = 
  | 'create' 
  | 'update' 
  | 'delete' 
  | 'login' 
  | 'logout' 
  | 'view' 
  | 'payment' 
  | 'class_scheduled' 
  | 'class_completed' 
  | 'certificate_issued';

// Log levels matching the database enum
export type LogLevel = 'info' | 'warning' | 'error' | 'critical';

// User roles matching the database enum
export type UserRole = 'admin' | 'instructor' | 'student';

// Entity types we track
export type EntityType = 
  | 'student' 
  | 'instructor' 
  | 'class' 
  | 'group' 
  | 'document' 
  | 'payment' 
  | 'certificate'
  | 'user'
  | 'system';

// What comes from the database
export interface DatabaseActivityLog {
  id: string;
  user_id: string | null;
  user_email: string | null;
  user_role: UserRole | null;
  action_type: ActionType;
  entity_type: string | null;
  entity_id: string | null;
  description: string;
  log_level: LogLevel;
  old_values: Record<string, any> | null;
  new_values: Record<string, any> | null;
  created_at: string;
}

// UI-friendly format
export interface ActivityLog {
  id: string;
  userId: string | null;
  userEmail: string | null;
  userRole: UserRole | null;
  actionType: ActionType;
  entityType: string | null;
  entityId: string | null;
  description: string;
  logLevel: LogLevel;
  oldValues: Record<string, any> | null;
  newValues: Record<string, any> | null;
  createdAt: string;
  // Computed fields for display
  timeAgo: string;
}

// Input for creating a log entry
export interface LogActivityInput {
  actionType: ActionType;
  entityType?: EntityType | string;
  entityId?: string;
  description: string;
  logLevel?: LogLevel;
  oldValues?: Record<string, any>;
  newValues?: Record<string, any>;
}

// Filters for fetching logs
export interface ActivityLogFilters {
  actionType?: ActionType;
  entityType?: string;
  logLevel?: LogLevel;
  userRole?: UserRole;
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Convert database log to UI format
 */
const convertToActivityLog = (dbLog: DatabaseActivityLog): ActivityLog => {
  return {
    id: dbLog.id,
    userId: dbLog.user_id,
    userEmail: dbLog.user_email,
    userRole: dbLog.user_role,
    actionType: dbLog.action_type,
    entityType: dbLog.entity_type,
    entityId: dbLog.entity_id,
    description: dbLog.description,
    logLevel: dbLog.log_level,
    oldValues: dbLog.old_values,
    newValues: dbLog.new_values,
    createdAt: dbLog.created_at,
    timeAgo: getTimeAgo(dbLog.created_at),
  };
};

/**
 * Calculate human-readable time ago string
 */
const getTimeAgo = (timestamp: string): string => {
  const now = new Date();
  const then = new Date(timestamp);
  const diffMs = now.getTime() - then.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffWeeks = Math.floor(diffDays / 7);

  if (diffSecs < 60) return 'Just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffWeeks === 1) return '1 week ago';
  if (diffWeeks < 4) return `${diffWeeks} weeks ago`;
  
  // For older dates, show the actual date
  return then.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric',
    year: then.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
  });
};

/**
 * Get current user info from Supabase session
 * Returns user_id, email, and role
 */
const getCurrentUserInfo = async (): Promise<{
  userId: string | null;
  userEmail: string | null;
  userRole: UserRole | null;
}> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      return { userId: null, userEmail: null, userRole: null };
    }

    // Get role from profiles table
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single();

    return {
      userId: session.user.id,
      userEmail: session.user.email || null,
      userRole: profile?.role || null,
    };
  } catch (error) {
    console.error('Error getting current user info:', error);
    return { userId: null, userEmail: null, userRole: null };
  }
};

/**
 * Extract only the changed fields between old and new objects
 * Returns { oldValues, newValues } with only the differences
 */
export const getChangedFields = (
  oldObj: Record<string, any> | null | undefined,
  newObj: Record<string, any> | null | undefined
): { oldValues: Record<string, any> | null; newValues: Record<string, any> | null } => {
  if (!oldObj && !newObj) {
    return { oldValues: null, newValues: null };
  }
  
  if (!oldObj) {
    // New record - all fields are "new"
    return { oldValues: null, newValues: newObj || null };
  }
  
  if (!newObj) {
    // Deleted record - all fields are "old"
    return { oldValues: oldObj, newValues: null };
  }

  const oldValues: Record<string, any> = {};
  const newValues: Record<string, any> = {};
  
  // Get all keys from both objects
  const allKeys = new Set([...Object.keys(oldObj), ...Object.keys(newObj)]);
  
  for (const key of allKeys) {
    const oldVal = oldObj[key];
    const newVal = newObj[key];
    
    // Skip if values are the same (using JSON stringify for deep comparison)
    if (JSON.stringify(oldVal) === JSON.stringify(newVal)) {
      continue;
    }
    
    // Skip internal/metadata fields
    if (['id', 'created_at', 'updated_at', 'createdAt', 'updatedAt'].includes(key)) {
      continue;
    }
    
    // Record the change
    if (oldVal !== undefined) oldValues[key] = oldVal;
    if (newVal !== undefined) newValues[key] = newVal;
  }
  
  // Return null if no changes
  const hasOldChanges = Object.keys(oldValues).length > 0;
  const hasNewChanges = Object.keys(newValues).length > 0;
  
  return {
    oldValues: hasOldChanges ? oldValues : null,
    newValues: hasNewChanges ? newValues : null,
  };
};

// ============================================================================
// MAIN LOGGING FUNCTION
// ============================================================================

/**
 * Log an activity to the database
 * This is the main function to call from other services
 */
export const logActivity = async (input: LogActivityInput): Promise<void> => {
  try {
    // Get current user info
    const { userId, userEmail, userRole } = await getCurrentUserInfo();
    
    console.log('📝 Logging activity:', {
      action: input.actionType,
      entity: input.entityType,
      description: input.description,
    });

    const { error } = await supabase
      .from('activity_logs')
      .insert({
        user_id: userId,
        user_email: userEmail,
        user_role: userRole,
        action_type: input.actionType,
        entity_type: input.entityType || null,
        entity_id: input.entityId || null,
        description: input.description,
        log_level: input.logLevel || 'info',
        old_values: input.oldValues || null,
        new_values: input.newValues || null,
      });

    if (error) {
      // Don't throw - logging should never break the main operation
      console.error('❌ Error logging activity:', error);
    } else {
      console.log('✅ Activity logged successfully');
    }
  } catch (error) {
    // Silently fail - logging should never break the main operation
    console.error('💥 Error in logActivity:', error);
  }
};

/**
 * Log activity with automatic change detection
 * Compares old and new objects and only logs the differences
 */
export const logActivityWithChanges = async (
  actionType: ActionType,
  entityType: EntityType | string,
  entityId: string,
  description: string,
  oldData?: Record<string, any> | null,
  newData?: Record<string, any> | null,
  logLevel: LogLevel = 'info'
): Promise<void> => {
  const { oldValues, newValues } = getChangedFields(oldData, newData);
  
  await logActivity({
    actionType,
    entityType,
    entityId,
    description,
    logLevel,
    oldValues: oldValues || undefined,
    newValues: newValues || undefined,
  });
};

// ============================================================================
// FETCH FUNCTIONS
// ============================================================================

/**
 * Get activity logs with optional filters
 */
export const getActivityLogs = async (
  filters?: ActivityLogFilters
): Promise<ActivityLog[]> => {
  try {
    console.log('🔍 Fetching activity logs with filters:', filters);

    let query = supabase
      .from('activity_logs')
      .select('*')
      .order('created_at', { ascending: false });

    // Apply filters
    if (filters?.actionType) {
      query = query.eq('action_type', filters.actionType);
    }
    if (filters?.entityType) {
      query = query.eq('entity_type', filters.entityType);
    }
    if (filters?.logLevel) {
      query = query.eq('log_level', filters.logLevel);
    }
    if (filters?.userRole) {
      query = query.eq('user_role', filters.userRole);
    }
    if (filters?.startDate) {
      query = query.gte('created_at', filters.startDate);
    }
    if (filters?.endDate) {
      query = query.lte('created_at', filters.endDate);
    }

    // Pagination
    const limit = filters?.limit || 50;
    const offset = filters?.offset || 0;
    query = query.range(offset, offset + limit - 1);

    const { data, error } = await query;

    if (error) {
      console.error('❌ Error fetching activity logs:', error);
      throw new Error(`Failed to fetch activity logs: ${error.message}`);
    }

    console.log(`✅ Found ${data?.length || 0} activity logs`);
    return (data || []).map(convertToActivityLog);

  } catch (error: any) {
    console.error('💥 Error in getActivityLogs:', error);
    throw error;
  }
};

/**
 * Get logs for a specific entity (e.g., all logs for a student)
 */
export const getLogsByEntity = async (
  entityType: string,
  entityId: string
): Promise<ActivityLog[]> => {
  try {
    const { data, error } = await supabase
      .from('activity_logs')
      .select('*')
      .eq('entity_type', entityType)
      .eq('entity_id', entityId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch logs for entity: ${error.message}`);
    }

    return (data || []).map(convertToActivityLog);
  } catch (error: any) {
    console.error('💥 Error in getLogsByEntity:', error);
    throw error;
  }
};

/**
 * Get logs for a specific user
 */
export const getLogsByUser = async (userId: string): Promise<ActivityLog[]> => {
  try {
    const { data, error } = await supabase
      .from('activity_logs')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch logs for user: ${error.message}`);
    }

    return (data || []).map(convertToActivityLog);
  } catch (error: any) {
    console.error('💥 Error in getLogsByUser:', error);
    throw error;
  }
};

/**
 * Get activity log statistics
 */
export const getActivityStats = async (): Promise<{
  totalLogs: number;
  todayLogs: number;
  logsByAction: Record<string, number>;
  logsByLevel: Record<string, number>;
}> => {
  try {
    // Get total count
    const { count: totalLogs } = await supabase
      .from('activity_logs')
      .select('*', { count: 'exact', head: true });

    // Get today's count
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const { count: todayLogs } = await supabase
      .from('activity_logs')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', today.toISOString());

    // Get logs by action type (last 100 for sampling)
    const { data: recentLogs } = await supabase
      .from('activity_logs')
      .select('action_type, log_level')
      .order('created_at', { ascending: false })
      .limit(100);

    const logsByAction: Record<string, number> = {};
    const logsByLevel: Record<string, number> = {};

    (recentLogs || []).forEach(log => {
      logsByAction[log.action_type] = (logsByAction[log.action_type] || 0) + 1;
      logsByLevel[log.log_level] = (logsByLevel[log.log_level] || 0) + 1;
    });

    return {
      totalLogs: totalLogs || 0,
      todayLogs: todayLogs || 0,
      logsByAction,
      logsByLevel,
    };
  } catch (error) {
    console.error('💥 Error in getActivityStats:', error);
    return {
      totalLogs: 0,
      todayLogs: 0,
      logsByAction: {},
      logsByLevel: {},
    };
  }
};

// ============================================================================
// CONVENIENCE FUNCTIONS - Pre-built logging for common actions
// ============================================================================

/**
 * Helper to capitalize first letter
 */
const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);

/**
 * Helper to format entity type for display
 */
const formatEntityType = (type: string) => {
  const typeMap: Record<string, string> = {
    'student': 'Student',
    'instructor': 'Instructor',
    'class': 'Class',
    'group': 'Group',
    'document': 'Document',
    'payment': 'Payment',
    'certificate': 'Certificate',
    'user': 'User',
  };
  return typeMap[type] || capitalize(type);
};

/**
 * Log a login event
 */
export const logLogin = async (userEmail: string): Promise<void> => {
  // Extract name from email (before @)
  const name = userEmail.split('@')[0].replace(/[._]/g, ' ');
  await logActivity({
    actionType: 'login',
    entityType: 'user',
    description: `${capitalize(name)} signed in`,
    logLevel: 'info',
  });
};

/**
 * Log a logout event
 */
export const logLogout = async (userEmail: string): Promise<void> => {
  const name = userEmail.split('@')[0].replace(/[._]/g, ' ');
  await logActivity({
    actionType: 'logout',
    entityType: 'user',
    description: `${capitalize(name)} signed out`,
    logLevel: 'info',
  });
};

/**
 * Log entity creation
 */
export const logCreate = async (
  entityType: EntityType,
  entityId: string,
  entityName: string,
  newData?: Record<string, any>
): Promise<void> => {
  await logActivity({
    actionType: 'create',
    entityType,
    entityId,
    description: `New ${entityType}: ${entityName}`,
    logLevel: 'info',
    newValues: newData,
  });
};

/**
 * Log entity update with change detection
 */
export const logUpdate = async (
  entityType: EntityType,
  entityId: string,
  entityName: string,
  oldData: Record<string, any>,
  newData: Record<string, any>
): Promise<void> => {
  const { oldValues, newValues } = getChangedFields(oldData, newData);
  
  // Build a short description of what changed
  const changedKeys = Object.keys(newValues || {});
  let changesSummary = '';
  if (changedKeys.length === 1) {
    changesSummary = ` → ${changedKeys[0]}`;
  } else if (changedKeys.length > 1) {
    changesSummary = ` → ${changedKeys.length} fields`;
  }
  
  await logActivity({
    actionType: 'update',
    entityType,
    entityId,
    description: `Updated ${entityName}${changesSummary}`,
    logLevel: 'info',
    oldValues: oldValues || undefined,
    newValues: newValues || undefined,
  });
};

/**
 * Log entity deletion
 */
export const logDelete = async (
  entityType: EntityType,
  entityId: string,
  entityName: string,
  oldData?: Record<string, any>
): Promise<void> => {
  await logActivity({
    actionType: 'delete',
    entityType,
    entityId,
    description: `Deleted ${entityName}`,
    logLevel: 'warning',
    oldValues: oldData,
  });
};

/**
 * Log class scheduling
 */
export const logClassScheduled = async (
  classId: string,
  className: string,
  date: string,
  studentOrGroup?: string,
  instructor?: string
): Promise<void> => {
  // Format date to be shorter (e.g., "Dec 22")
  const shortDate = new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const context = studentOrGroup ? ` for ${studentOrGroup}` : '';
  await logActivity({
    actionType: 'class_scheduled',
    entityType: 'class',
    entityId: classId,
    description: `${className}${context} scheduled for ${shortDate}`,
    logLevel: 'info',
  });
};

/**
 * Log class completion
 */
export const logClassCompleted = async (
  classId: string,
  className: string,
  studentName?: string
): Promise<void> => {
  await logActivity({
    actionType: 'class_completed',
    entityType: 'class',
    entityId: classId,
    description: studentName ? `${studentName} completed ${className}` : `${className} completed`,
    logLevel: 'info',
  });
};

/**
 * Log class update with context
 */
export const logClassUpdated = async (
  classId: string,
  className: string,
  studentOrGroup?: string,
  changes?: string
): Promise<void> => {
  const context = studentOrGroup ? ` (${studentOrGroup})` : '';
  const changeInfo = changes ? ` → ${changes}` : '';
  await logActivity({
    actionType: 'update',
    entityType: 'class',
    entityId: classId,
    description: `Updated ${className}${context}${changeInfo}`,
    logLevel: 'info',
  });
};

/**
 * Log class deletion with context
 */
export const logClassDeleted = async (
  classId: string,
  className: string,
  studentOrGroup?: string,
  date?: string
): Promise<void> => {
  const context = studentOrGroup ? ` for ${studentOrGroup}` : '';
  const dateInfo = date ? ` on ${new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}` : '';
  await logActivity({
    actionType: 'delete',
    entityType: 'class',
    entityId: classId,
    description: `Deleted ${className}${context}${dateInfo}`,
    logLevel: 'warning',
  });
};

/**
 * Log certificate issuance
 */
export const logCertificateIssued = async (
  certificateId: string,
  studentName: string,
  certificateType: string
): Promise<void> => {
  await logActivity({
    actionType: 'certificate_issued',
    entityType: 'certificate',
    entityId: certificateId,
    description: `${certificateType} issued to ${studentName}`,
    logLevel: 'info',
  });
};

/**
 * Log payment
 */
export const logPayment = async (
  paymentId: string,
  studentName: string,
  amount: number,
  description?: string
): Promise<void> => {
  await logActivity({
    actionType: 'payment',
    entityType: 'payment',
    entityId: paymentId,
    description: description || `$${amount.toFixed(2)} from ${studentName}`,
    logLevel: 'info',
  });
};

/**
 * Log an error
 */
export const logError = async (
  entityType: EntityType | string,
  description: string,
  entityId?: string
): Promise<void> => {
  await logActivity({
    actionType: 'view',
    entityType,
    entityId,
    description,
    logLevel: 'error',
  });
};


