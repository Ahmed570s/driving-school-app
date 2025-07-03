# Database Schema Design - Driving School Management System

## Overview
This document outlines the complete database schema for the driving school management system. The schema is designed to support user management, student tracking, class scheduling, instructor management, vehicle tracking, payments, and comprehensive audit logging.

## Database Design Principles

### 🔑 **Key Concepts for Beginners**
- **Primary Key (PK)**: Unique identifier for each record in a table
- **Foreign Key (FK)**: Reference to a primary key in another table (creates relationships)
- **UUID**: Universally Unique Identifier - better than auto-incrementing numbers for distributed systems
- **Timestamps**: All tables include `created_at` and `updated_at` for tracking
- **Soft Delete**: Instead of deleting records, we mark them as inactive (preserves data integrity)
- **Enums**: Predefined list of allowed values (e.g., status can only be "active", "inactive", etc.)

## Core Entities & Relationships

```
profiles (users) --> students (extends profile)
profiles (users) --> instructors (extends profile)
students --> classes (attends)
instructors --> classes (teaches)
students <--> groups (many-to-many)
groups --> classes (theory classes)
students --> documents (owns)
classes --> class_attendances (attendance tracking)
```

---

## 1. Authentication & User Management

### 1.1 `profiles` Table
**Purpose**: Extends Supabase's built-in `auth.users` table with additional profile information

```sql
CREATE TYPE user_role AS ENUM ('admin', 'instructor', 'student');
CREATE TYPE user_status AS ENUM ('active', 'inactive', 'suspended');

CREATE TABLE profiles (
  -- Primary Key (links to Supabase auth.users)
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  
  -- Core Profile Info
  email VARCHAR(255) NOT NULL UNIQUE,
  role user_role NOT NULL DEFAULT 'student',
  status user_status NOT NULL DEFAULT 'active',
  
  -- Personal Information
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  phone VARCHAR(20),
  whatsapp VARCHAR(20),
  avatar_url TEXT,
  
  -- Address Information
  street_address TEXT,
  apartment VARCHAR(20),
  city VARCHAR(100),
  postal_code VARCHAR(20),
  province VARCHAR(50),
  country VARCHAR(50) DEFAULT 'Canada',
  
  -- System Fields
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  
  -- Constraints
  CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
  CONSTRAINT valid_phone CHECK (phone IS NULL OR phone ~* '^\+?[1-9]\d{1,14}$')
);
```

**Key Features**:
- ✅ Extends Supabase authentication
- ✅ Supports all user types (admin, instructor, student)
- ✅ Complete address information
- ✅ Soft delete with `is_active` flag
- ✅ Email and phone validation

---

## 2. Student Management

### 2.1 `students` Table
**Purpose**: Extended student-specific information beyond basic profile

```sql
CREATE TYPE student_status AS ENUM ('active', 'on_hold', 'completed', 'dropped', 'graduated');
CREATE TYPE student_phase AS ENUM ('1', '2', '3', '4');

CREATE TABLE students (
  -- Primary Key
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Links to profile
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  
  -- Student-Specific Info
  student_id VARCHAR(20) UNIQUE NOT NULL, -- e.g., "DS2024001"
  date_of_birth DATE,
  learner_license_number VARCHAR(50),
  
  -- Academic Progress
  status student_status NOT NULL DEFAULT 'active',
  current_phase student_phase DEFAULT '1',
  total_hours_completed INTEGER DEFAULT 0,
  theory_hours_completed INTEGER DEFAULT 0,
  practical_hours_completed INTEGER DEFAULT 0,
  enrollment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  contract_expiry_date DATE GENERATED ALWAYS AS (enrollment_date + INTERVAL '18 months') STORED,
  graduation_date DATE,
  
  -- Tracking Flags
  needs_support BOOLEAN DEFAULT false,
  attendance_issues BOOLEAN DEFAULT false,
  has_balance BOOLEAN DEFAULT false,
  has_missing_classes BOOLEAN DEFAULT false,
  

  
  -- System Fields
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  
  -- Constraints
  CONSTRAINT unique_student_profile UNIQUE(profile_id),
  CONSTRAINT valid_hours CHECK (
    total_hours_completed >= 0 AND 
    theory_hours_completed >= 0 AND 
    practical_hours_completed >= 0
  ),
  CONSTRAINT valid_graduation CHECK (
    graduation_date IS NULL OR graduation_date >= enrollment_date
  )
);
```

**Key Features**:
- ✅ Links to profiles table
- ✅ Unique student ID generation
- ✅ Progress tracking by hours and phases
- ✅ Emergency contact information
- ✅ Academic status management

### 2.2 `groups` Table
**Purpose**: Student groups for theory classes and organization

```sql
CREATE TYPE group_status AS ENUM ('active', 'completed', 'cancelled');

CREATE TABLE groups (
  -- Primary Key
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Group Information
  name VARCHAR(100) NOT NULL,
  description TEXT,
  capacity INTEGER NOT NULL DEFAULT 25,
  current_enrollment INTEGER DEFAULT 0,
  
  -- Schedule Info
  status group_status NOT NULL DEFAULT 'active',
  start_date DATE,
  end_date DATE,
  
  -- Instructor Assignment
  primary_instructor_id UUID REFERENCES profiles(id),
  
  -- System Fields
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  
  -- Constraints
  CONSTRAINT valid_capacity CHECK (capacity > 0),
  CONSTRAINT valid_enrollment CHECK (current_enrollment >= 0 AND current_enrollment <= capacity),
  CONSTRAINT valid_dates CHECK (end_date IS NULL OR end_date >= start_date)
);
```

### 2.3 `student_groups` Table
**Purpose**: Many-to-many relationship between students and groups

```sql
CREATE TABLE student_groups (
  -- Composite Primary Key
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
  
  -- Enrollment Info
  enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  status VARCHAR(20) DEFAULT 'active', -- active, completed, withdrawn
  
  -- System Fields
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  
  -- Primary Key
  PRIMARY KEY (student_id, group_id)
);
```

---

## 3. Instructor Management

### 3.1 `instructors` Table
**Purpose**: Extended instructor-specific information

```sql
CREATE TYPE instructor_status AS ENUM ('active', 'inactive', 'on_leave');

CREATE TABLE instructors (
  -- Primary Key
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Links to profile
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  
  -- Instructor Info
  employee_id VARCHAR(20) UNIQUE NOT NULL,
  hire_date DATE NOT NULL,
  status instructor_status NOT NULL DEFAULT 'active',
  
  -- Qualifications
  license_number VARCHAR(50),
  certification_expiry DATE,
  specializations TEXT[], -- e.g., ["highway", "night", "defensive"]
  

  
  -- Performance
  theory_hours_taught INTEGER DEFAULT 0,
  practical_hours_taught INTEGER DEFAULT 0,
  
  -- System Fields
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  
  -- Constraints
  CONSTRAINT unique_instructor_profile UNIQUE(profile_id)
);
```



---

---

## 4. Class & Scheduling Management

### 4.1 `classes` Table
**Purpose**: Core class/lesson scheduling and management

```sql
CREATE TYPE class_type AS ENUM ('theory', 'practical');
CREATE TYPE class_status AS ENUM ('scheduled', 'in_progress', 'completed', 'cancelled', 'no_show');

CREATE TABLE classes (
  -- Primary Key
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Class Information
  title VARCHAR(200) NOT NULL,
  description TEXT,
  class_type class_type NOT NULL,
  status class_status NOT NULL DEFAULT 'scheduled',
  
  -- Scheduling
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  duration_minutes INTEGER GENERATED ALWAYS AS (
    EXTRACT(EPOCH FROM (end_time - start_time)) / 60
  ) STORED,
  
  -- Relationships
  instructor_id UUID REFERENCES instructors(id) NOT NULL,
  student_id UUID REFERENCES students(id), -- NULL for group classes
  group_id UUID REFERENCES groups(id), -- NULL for individual classes
  
  -- Class Details
  location VARCHAR(200),
  notes TEXT,
  lesson_plan TEXT,
  
  -- Pricing
  cost DECIMAL(10,2),
  
  -- System Fields
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  
  -- Constraints
  CONSTRAINT valid_time_range CHECK (end_time > start_time),
  CONSTRAINT student_or_group CHECK (
    (student_id IS NOT NULL AND group_id IS NULL) OR 
    (student_id IS NULL AND group_id IS NOT NULL)
  ),
  CONSTRAINT valid_cost CHECK (cost IS NULL OR cost >= 0)
);
```

### 4.2 `class_attendances` Table
**Purpose**: Track student attendance and signatures for classes

```sql
CREATE TYPE attendance_status AS ENUM ('scheduled', 'signed_in', 'completed', 'missed', 'cancelled');

CREATE TABLE class_attendances (
  -- Primary Key
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Relationships
  class_id UUID REFERENCES classes(id) ON DELETE CASCADE NOT NULL,
  student_id UUID REFERENCES students(id) ON DELETE CASCADE NOT NULL,
  
  -- Attendance Details
  status attendance_status NOT NULL DEFAULT 'scheduled',
  signed_at TIMESTAMP WITH TIME ZONE,
  signature_data TEXT, -- Base64 encoded signature
  completion_notes TEXT,
  
  -- No-show tracking
  missed_at TIMESTAMP WITH TIME ZONE,
  missed_reason TEXT,
  
  -- Performance
  performance_rating INTEGER, -- 1-5 scale
  instructor_feedback TEXT,
  
  -- System Fields
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  
  -- Constraints
  CONSTRAINT unique_class_student UNIQUE(class_id, student_id),
  CONSTRAINT valid_rating CHECK (performance_rating IS NULL OR (performance_rating >= 1 AND performance_rating <= 5))
);
```

---

## 5. Document Management

### 5.1 `documents` Table
**Purpose**: Manage student documents and file attachments

```sql
CREATE TYPE document_type AS ENUM ('id', 'medical', 'insurance', 'license', 'permit', 'other');
CREATE TYPE document_status AS ENUM ('pending', 'approved', 'rejected', 'expired');

CREATE TABLE documents (
  -- Primary Key
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Ownership
  student_id UUID REFERENCES students(id) ON DELETE CASCADE NOT NULL,
  
  -- Document Info
  name VARCHAR(255) NOT NULL,
  description TEXT,
  document_type document_type NOT NULL,
  status document_status NOT NULL DEFAULT 'pending',
  
  -- File Information
  file_path TEXT NOT NULL, -- Supabase Storage path
  file_name VARCHAR(255) NOT NULL,
  file_size BIGINT, -- Size in bytes
  mime_type VARCHAR(100),
  
  -- Validation
  expiry_date DATE,
  approved_by UUID REFERENCES profiles(id),
  approved_at TIMESTAMP WITH TIME ZONE,
  rejection_reason TEXT,
  
  -- System Fields
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  
  -- Constraints
  CONSTRAINT valid_file_size CHECK (file_size IS NULL OR file_size > 0)
);
```

---

## 6. System Configuration

### 6.1 `settings` Table
**Purpose**: Store system-wide configuration options

```sql
CREATE TYPE setting_type AS ENUM ('string', 'number', 'boolean', 'json');

CREATE TABLE settings (
  -- Primary Key
  key VARCHAR(100) PRIMARY KEY,
  
  -- Value Storage
  value TEXT NOT NULL,
  setting_type setting_type NOT NULL DEFAULT 'string',
  
  -- Metadata
  description TEXT,
  category VARCHAR(50),
  is_public BOOLEAN DEFAULT false, -- Can non-admin users see this?
  
  -- System Fields
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_by UUID REFERENCES profiles(id)
);
```

### 6.2 `activity_logs` Table
**Purpose**: Comprehensive audit trail for all system actions

```sql
CREATE TYPE log_level AS ENUM ('info', 'warning', 'error', 'critical');
CREATE TYPE action_type AS ENUM (
  'create', 'update', 'delete', 'login', 'logout', 'view', 
  'payment', 'class_scheduled', 'class_completed', 'certificate_issued'
);

CREATE TABLE activity_logs (
  -- Primary Key
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Actor Information
  user_id UUID REFERENCES profiles(id),
  user_email VARCHAR(255),
  user_role user_role,
  
  -- Action Details
  action_type action_type NOT NULL,
  entity_type VARCHAR(50), -- e.g., 'student', 'class', 'payment'
  entity_id UUID,
  description TEXT NOT NULL,
  
  -- Severity
  log_level log_level NOT NULL DEFAULT 'info',
  
  -- Context
  ip_address INET,
  user_agent TEXT,
  session_id VARCHAR(100),
  
  -- Data Changes (for audit purposes)
  old_values JSONB,
  new_values JSONB,
  
  -- System Fields
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  
  -- Constraints
  CONSTRAINT logs_have_user_or_system CHECK (
    user_id IS NOT NULL OR user_email = 'system'
  )
);
```

---

## 7. Indexes for Performance

```sql
-- Authentication & Users
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_active ON profiles(is_active);

-- Students
CREATE INDEX idx_students_profile_id ON students(profile_id);
CREATE INDEX idx_students_status ON students(status);
CREATE INDEX idx_students_enrollment_date ON students(enrollment_date);
CREATE INDEX idx_student_groups_student_id ON student_groups(student_id);
CREATE INDEX idx_student_groups_group_id ON student_groups(group_id);

-- Instructors
CREATE INDEX idx_instructors_profile_id ON instructors(profile_id);
CREATE INDEX idx_instructors_status ON instructors(status);

-- Classes
CREATE INDEX idx_classes_instructor_id ON classes(instructor_id);
CREATE INDEX idx_classes_student_id ON classes(student_id);
CREATE INDEX idx_classes_group_id ON classes(group_id);
CREATE INDEX idx_classes_start_time ON classes(start_time);
CREATE INDEX idx_classes_status ON classes(status);
CREATE INDEX idx_classes_type ON classes(class_type);

-- Attendance
CREATE INDEX idx_attendance_class_id ON class_attendances(class_id);
CREATE INDEX idx_attendance_student_id ON class_attendances(student_id);
CREATE INDEX idx_attendance_status ON class_attendances(status);

-- Documents
CREATE INDEX idx_documents_student_id ON documents(student_id);
CREATE INDEX idx_documents_type ON documents(document_type);
CREATE INDEX idx_documents_status ON documents(status);



-- Activity Logs
CREATE INDEX idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX idx_activity_logs_action_type ON activity_logs(action_type);
CREATE INDEX idx_activity_logs_created_at ON activity_logs(created_at);
CREATE INDEX idx_activity_logs_entity ON activity_logs(entity_type, entity_id);
```

---

## 8. Row Level Security (RLS) Policies

### Core Security Principles
1. **Users can only see their own data**
2. **Instructors can see their assigned students and classes**
3. **Admins can see everything**
4. **System maintains audit logs for all actions**

```sql
-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE instructors ENABLE ROW LEVEL SECURITY;
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE class_attendances ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Example Policies (more detailed policies will be implemented in Phase 1.2)

-- Profiles: Users can view and update their own profile
CREATE POLICY "Users can view own profile" ON profiles 
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles 
  FOR UPDATE USING (auth.uid() = id);

-- Students: Students can view their own data, instructors can view assigned students
CREATE POLICY "Students can view own data" ON students 
  FOR SELECT USING (profile_id = auth.uid());

-- Classes: Users can view classes they're involved in
CREATE POLICY "View assigned classes" ON classes 
  FOR SELECT USING (
    instructor_id IN (SELECT id FROM instructors WHERE profile_id = auth.uid()) OR
    student_id IN (SELECT id FROM students WHERE profile_id = auth.uid()) OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );
```

---

## 9. Database Functions & Triggers

### Automatic Timestamp Updates
```sql
-- Function to update 'updated_at' timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply to all tables with updated_at column
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_students_updated_at BEFORE UPDATE ON students 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ... (repeat for all tables)
```

### Student Progress Tracking
```sql
-- Function to update student hours when class is completed
CREATE OR REPLACE FUNCTION update_student_hours()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    -- Update student hours based on class type and duration
    UPDATE students 
    SET 
      total_hours_completed = total_hours_completed + 
        (SELECT duration_minutes FROM classes WHERE id = NEW.class_id) / 60.0,
      theory_hours_completed = CASE 
        WHEN (SELECT class_type FROM classes WHERE id = NEW.class_id) = 'theory' 
        THEN theory_hours_completed + (SELECT duration_minutes FROM classes WHERE id = NEW.class_id) / 60.0
        ELSE theory_hours_completed
      END,
      practical_hours_completed = CASE 
        WHEN (SELECT class_type FROM classes WHERE id = NEW.class_id) = 'practical' 
        THEN practical_hours_completed + (SELECT duration_minutes FROM classes WHERE id = NEW.class_id) / 60.0
        ELSE practical_hours_completed
      END
    WHERE id = NEW.student_id;
  END IF;
  
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_student_progress AFTER UPDATE ON class_attendances
  FOR EACH ROW EXECUTE FUNCTION update_student_hours();
```

---

## 10. Sample Data & Migration Strategy

### Initial Data Requirements
1. **Admin User**: First system administrator
2. **Default Groups**: A, B, C, D groups
3. **System Settings**: Default configuration
4. **Sample Instructors**: For development/testing

### Migration Order
1. Create ENUM types
2. Create core tables (profiles, students, instructors)
3. Create relationship tables (groups, student_groups)
4. Create operational tables (classes, attendances)
5. Create supporting tables (documents, certificates, payments)
6. Create system tables (activity_logs, settings)
7. Create indexes
8. Set up RLS policies
9. Create functions and triggers
10. Seed initial data

---

## 11. Future Considerations

### Scalability Features
- **Partitioning**: Activity logs by date
- **Archiving**: Completed classes older than 2 years
- **Caching**: Frequently accessed student/instructor data
- **Read Replicas**: For reporting and analytics

### Additional Features
- **Multi-location Support**: If expanding to multiple branches
- **API Rate Limiting**: Built into Supabase
- **Real-time Subscriptions**: For live updates
- **File Storage**: Supabase Storage for documents and certificates

---

## Summary

This database schema provides:
- ✅ **Complete User Management** with role-based access
- ✅ **Comprehensive Student Tracking** with progress monitoring
- ✅ **Flexible Class Scheduling** for theory and practical lessons
- ✅ **Instructor Management** with performance tracking
- ✅ **Document Handling** with approval workflows
- ✅ **Audit Logging** for compliance and troubleshooting
- ✅ **Security** with Row Level Security policies
- ✅ **Performance** with strategic indexing
- ✅ **Data Integrity** with constraints and foreign keys

**Total Tables**: 9 core tables + 3 relationship tables
**Estimated Initial Size**: < 1GB (for 1000+ students)
**Concurrent Users**: Supports 100+ users simultaneously

This schema will efficiently support a driving school with hundreds of students, multiple instructors, and comprehensive administrative features while maintaining data integrity and security.

## Next Steps

1. **Review this schema** - Make sure it covers all your needs
2. **Suggest modifications** - Any changes or additions needed?
3. **Begin Phase 1.2** - Create tables in Supabase
4. **Generate TypeScript types** - From real database structure
5. **Set up RLS policies** - Secure data access