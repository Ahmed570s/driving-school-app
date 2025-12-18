// Document Service Layer - Handles file uploads and document management
import { supabase } from '@/lib/supabaseClient';

// ============================================================================
// CONSTANTS - File validation rules (must match Supabase bucket config)
// ============================================================================

export const STORAGE_BUCKET = 'student-documents';

// Max file size: 10MB (in bytes)
export const MAX_FILE_SIZE = 10 * 1024 * 1024;
export const MAX_FILE_SIZE_MB = 10;

// Allowed file types
export const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'application/pdf',
] as const;

export const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.pdf'] as const;

// Human-readable format for error messages
export const ALLOWED_TYPES_DISPLAY = 'PDF, JPG, or PNG';

// ============================================================================
// TYPES - Document interfaces
// ============================================================================

// What comes from the database (simplified - no approval workflow)
export interface DatabaseDocument {
  id: string;
  student_id: string;
  name: string;
  description: string | null;
  document_type: 'id' | 'medical' | 'insurance' | 'license' | 'permit' | 'contract' | 'receipt' | 'test' | 'other';
  status: 'approved' | 'expired';
  file_path: string;
  file_name: string;
  file_size: number;
  mime_type: string;
  expiry_date: string | null;
  created_at: string;
  updated_at: string;
}

// UI-friendly format (simplified - no approval workflow)
export interface Document {
  id: string;
  studentId: string;
  name: string;
  description: string;
  documentType: string;
  status: 'approved' | 'expired';
  filePath: string;
  fileName: string;
  fileSize: number;
  fileSizeFormatted: string;
  mimeType: string;
  expiryDate: string | null;
  createdAt: string;
  updatedAt: string;
  downloadUrl?: string;
}

// Input for creating a document record
export interface DocumentInput {
  studentId: string;
  name: string;
  description?: string;
  documentType: string;
  filePath: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  expiryDate?: string | null;
}

// Validation result
export interface ValidationResult {
  valid: boolean;
  error?: string;
}

// Upload result
export interface UploadResult {
  success: boolean;
  filePath?: string;
  error?: string;
}

// ============================================================================
// VALIDATION FUNCTIONS - Check files before upload
// ============================================================================

/**
 * Validate file size
 * Returns error message if file is too large
 */
export const validateFileSize = (file: File): ValidationResult => {
  if (file.size > MAX_FILE_SIZE) {
    const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
    return {
      valid: false,
      error: `File size (${fileSizeMB}MB) exceeds maximum allowed size of ${MAX_FILE_SIZE_MB}MB`,
    };
  }
  return { valid: true };
};

/**
 * Validate file type by MIME type
 * Returns error message if file type is not allowed
 */
export const validateFileType = (file: File): ValidationResult => {
  const mimeType = file.type.toLowerCase();
  
  if (!ALLOWED_MIME_TYPES.includes(mimeType as any)) {
    return {
      valid: false,
      error: `File type "${file.type || 'unknown'}" is not allowed. Please upload a ${ALLOWED_TYPES_DISPLAY} file.`,
    };
  }
  return { valid: true };
};

/**
 * Validate file extension
 * Additional check in case MIME type is spoofed
 */
export const validateFileExtension = (file: File): ValidationResult => {
  const fileName = file.name.toLowerCase();
  const hasValidExtension = ALLOWED_EXTENSIONS.some(ext => fileName.endsWith(ext));
  
  if (!hasValidExtension) {
    const extension = fileName.split('.').pop() || 'none';
    return {
      valid: false,
      error: `File extension ".${extension}" is not allowed. Please upload a ${ALLOWED_TYPES_DISPLAY} file.`,
    };
  }
  return { valid: true };
};

/**
 * Validate file name (no special characters that could cause issues)
 */
export const validateFileName = (file: File): ValidationResult => {
  // Check for potentially dangerous characters
  const dangerousChars = /[<>:"/\\|?*\x00-\x1f]/;
  if (dangerousChars.test(file.name)) {
    return {
      valid: false,
      error: 'File name contains invalid characters. Please rename the file and try again.',
    };
  }
  
  // Check file name length
  if (file.name.length > 255) {
    return {
      valid: false,
      error: 'File name is too long. Please use a shorter file name.',
    };
  }
  
  return { valid: true };
};

/**
 * Run all validations on a file
 * Returns first error encountered, or valid: true if all pass
 */
export const validateFile = (file: File): ValidationResult => {
  console.log('🔍 Validating file:', {
    name: file.name,
    type: file.type,
    size: `${(file.size / (1024 * 1024)).toFixed(2)}MB`,
  });

  // Check file name first
  const nameResult = validateFileName(file);
  if (!nameResult.valid) return nameResult;

  // Check file extension
  const extensionResult = validateFileExtension(file);
  if (!extensionResult.valid) return extensionResult;

  // Check MIME type
  const typeResult = validateFileType(file);
  if (!typeResult.valid) return typeResult;

  // Check file size last (most likely to pass)
  const sizeResult = validateFileSize(file);
  if (!sizeResult.valid) return sizeResult;

  console.log('✅ File validation passed');
  return { valid: true };
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Format file size for display (e.g., "2.5 MB", "500 KB")
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

/**
 * Generate a unique file path for storage
 * Format: students/{studentId}/{documentType}/{timestamp}_{filename}
 */
export const generateFilePath = (
  studentId: string,
  documentType: string,
  fileName: string
): string => {
  const timestamp = Date.now();
  const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
  const sanitizedType = documentType.toLowerCase().replace(/\s+/g, '-');
  
  return `students/${studentId}/${sanitizedType}/${timestamp}_${sanitizedFileName}`;
};

/**
 * Convert database document to UI format
 */
const convertToDocument = (dbDoc: DatabaseDocument): Document => {
  return {
    id: dbDoc.id,
    studentId: dbDoc.student_id,
    name: dbDoc.name,
    description: dbDoc.description || '',
    documentType: dbDoc.document_type,
    status: dbDoc.status,
    filePath: dbDoc.file_path,
    fileName: dbDoc.file_name,
    fileSize: dbDoc.file_size,
    fileSizeFormatted: formatFileSize(dbDoc.file_size),
    mimeType: dbDoc.mime_type,
    expiryDate: dbDoc.expiry_date,
    createdAt: dbDoc.created_at,
    updatedAt: dbDoc.updated_at,
  };
};

// ============================================================================
// STORAGE FUNCTIONS - Upload/Download files
// ============================================================================

/**
 * Upload a file to Supabase Storage
 * Validates the file first, then uploads to the bucket
 */
export const uploadFile = async (
  file: File,
  studentId: string,
  documentType: string
): Promise<UploadResult> => {
  try {
    // Step 1: Validate the file
    const validation = validateFile(file);
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }

    // Step 2: Generate unique file path
    const filePath = generateFilePath(studentId, documentType, file.name);
    console.log('📤 Uploading file to:', filePath);

    // Step 3: Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false, // Don't overwrite existing files
      });

    if (error) {
      console.error('❌ Upload error:', error);
      return { success: false, error: `Upload failed: ${error.message}` };
    }

    console.log('✅ File uploaded successfully:', data.path);
    return { success: true, filePath: data.path };

  } catch (error: any) {
    console.error('💥 Error in uploadFile:', error);
    return { success: false, error: error?.message || 'Upload failed' };
  }
};

/**
 * Get a signed URL for downloading/viewing a file
 * URLs are valid for 1 hour by default
 */
export const getSignedUrl = async (
  filePath: string,
  expiresIn: number = 3600
): Promise<string | null> => {
  try {
    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .createSignedUrl(filePath, expiresIn);

    if (error) {
      console.error('❌ Error creating signed URL:', error);
      return null;
    }

    return data.signedUrl;
  } catch (error) {
    console.error('💥 Error in getSignedUrl:', error);
    return null;
  }
};

/**
 * Delete a file from storage
 */
export const deleteFile = async (filePath: string): Promise<boolean> => {
  try {
    const { error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .remove([filePath]);

    if (error) {
      console.error('❌ Error deleting file:', error);
      return false;
    }

    console.log('✅ File deleted:', filePath);
    return true;
  } catch (error) {
    console.error('💥 Error in deleteFile:', error);
    return false;
  }
};

// ============================================================================
// DATABASE FUNCTIONS - CRUD for document records
// ============================================================================

/**
 * Create a document record in the database
 * Call this AFTER successfully uploading the file
 * Note: Status defaults to 'approved' since only admins upload documents
 */
export const createDocument = async (input: DocumentInput): Promise<Document> => {
  try {
    console.log('📝 Creating document record:', input);

    const { data, error } = await supabase
      .from('documents')
      .insert({
        student_id: input.studentId,
        name: input.name,
        description: input.description || null,
        document_type: input.documentType,
        status: 'approved', // Admin uploads are auto-approved
        file_path: input.filePath,
        file_name: input.fileName,
        file_size: input.fileSize,
        mime_type: input.mimeType,
        expiry_date: input.expiryDate || null,
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Error creating document record:', error);
      throw new Error(`Failed to create document: ${error.message}`);
    }

    console.log('✅ Document record created:', data);
    return convertToDocument(data);

  } catch (error: any) {
    console.error('💥 Error in createDocument:', error);
    throw error;
  }
};

/**
 * Get all documents for a student
 */
export const getStudentDocuments = async (studentId: string): Promise<Document[]> => {
  try {
    console.log('🔍 Fetching documents for student:', studentId);

    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('student_id', studentId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error fetching documents:', error);
      throw new Error(`Failed to fetch documents: ${error.message}`);
    }

    console.log(`✅ Found ${data?.length || 0} documents`);
    return (data || []).map(convertToDocument);

  } catch (error: any) {
    console.error('💥 Error in getStudentDocuments:', error);
    throw error;
  }
};

/**
 * Get a single document by ID
 */
export const getDocumentById = async (documentId: string): Promise<Document | null> => {
  try {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('id', documentId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw new Error(`Failed to fetch document: ${error.message}`);
    }

    return convertToDocument(data);

  } catch (error: any) {
    console.error('💥 Error in getDocumentById:', error);
    throw error;
  }
};

/**
 * Mark document as expired (for documents past their expiry date)
 */
export const markDocumentExpired = async (documentId: string): Promise<Document> => {
  try {
    console.log('📝 Marking document as expired:', documentId);

    const { data, error } = await supabase
      .from('documents')
      .update({
        status: 'expired',
        updated_at: new Date().toISOString(),
      })
      .eq('id', documentId)
      .select()
      .single();

    if (error) {
      console.error('❌ Error updating document:', error);
      throw new Error(`Failed to update document: ${error.message}`);
    }

    console.log('✅ Document marked as expired');
    return convertToDocument(data);

  } catch (error: any) {
    console.error('💥 Error in markDocumentExpired:', error);
    throw error;
  }
};

/**
 * Delete a document (removes both database record and storage file)
 */
export const deleteDocument = async (documentId: string): Promise<void> => {
  try {
    console.log('🗑️ Deleting document:', documentId);

    // Step 1: Get the document to find the file path
    const doc = await getDocumentById(documentId);
    if (!doc) {
      throw new Error('Document not found');
    }

    // Step 2: Delete the file from storage
    await deleteFile(doc.filePath);

    // Step 3: Delete the database record
    const { error } = await supabase
      .from('documents')
      .delete()
      .eq('id', documentId);

    if (error) {
      console.error('❌ Error deleting document record:', error);
      throw new Error(`Failed to delete document: ${error.message}`);
    }

    console.log('✅ Document deleted successfully');

  } catch (error: any) {
    console.error('💥 Error in deleteDocument:', error);
    throw error;
  }
};

// ============================================================================
// COMBINED UPLOAD FUNCTION - Upload file + create record in one call
// ============================================================================

/**
 * Upload a document file and create the database record
 * This is the main function to use from UI components
 */
export const uploadDocument = async (
  file: File,
  studentId: string,
  documentType: string,
  name: string,
  description?: string,
  expiryDate?: string
): Promise<Document> => {
  try {
    console.log('📤 Starting document upload:', { studentId, documentType, name });

    // Step 1: Upload file to storage (includes validation)
    const uploadResult = await uploadFile(file, studentId, documentType);
    if (!uploadResult.success || !uploadResult.filePath) {
      throw new Error(uploadResult.error || 'Upload failed');
    }

    // Step 2: Create document record in database
    const document = await createDocument({
      studentId,
      name,
      description,
      documentType,
      filePath: uploadResult.filePath,
      fileName: file.name,
      fileSize: file.size,
      mimeType: file.type,
      expiryDate,
    });

    console.log('✅ Document upload complete:', document.id);
    return document;

  } catch (error: any) {
    console.error('💥 Error in uploadDocument:', error);
    throw error;
  }
};

/**
 * Get document with download URL
 */
export const getDocumentWithUrl = async (documentId: string): Promise<Document | null> => {
  try {
    const doc = await getDocumentById(documentId);
    if (!doc) return null;

    const downloadUrl = await getSignedUrl(doc.filePath);
    return { ...doc, downloadUrl: downloadUrl || undefined };

  } catch (error) {
    console.error('💥 Error in getDocumentWithUrl:', error);
    throw error;
  }
};

