// Shared student data types and storage

// Basic Student type for the Students list page
export interface BasicStudent {
  id: string;
  name: string;
  email: string;
  phone: string;
  group: "A" | "B" | "C" | "D" | "none";
  hoursDone: number;
  status: "active" | "on-hold" | "completed" | "dropped";
  hasBalance: boolean;
  hasMissingClasses: boolean;
}

// Complete Student type for the profile page
export interface Student {
  id: string;
  firstName: string;
  lastName: string;
  studentId: string;
  phone: string;
  email: string;
  whatsapp: string;
  // Address fields
  street: string;
  apartment?: string;
  city: string;
  postalCode: string;
  // Additional personal information
  dateOfBirth: string;
  learnerLicenseNumber?: string;
  group: "A" | "B" | "C" | "D" | "none";
  status: "active" | "on-hold" | "completed" | "dropped";
  currentPhase: 1 | 2 | 3 | 4;
  totalCompletedSessions: number;
  enrollmentDate: string;
  needsSupport: boolean;
  attendanceIssues: boolean;
  documents: Document[];
}

export interface Document {
  id: string;
  name: string;
  type: "ID" | "Medical" | "Insurance" | "License" | "Other";
  fileType: "pdf" | "jpg" | "png" | "doc" | "docx";
  uploadDate: string;
  size: string;
  status: "approved" | "pending" | "rejected";
}

// Students data for the list view (simplified structure)
export const studentsListData: BasicStudent[] = [
  {
    id: "1",
    name: "Emma Wilson",
    email: "emma.wilson@example.com",
    phone: "(555) 123-4567",
    group: "A",
    hoursDone: 24,
    status: "active",
    hasBalance: false,
    hasMissingClasses: false
  },
  {
    id: "2",
    name: "John Smith",
    email: "john.smith@example.com",
    phone: "(555) 234-5678",
    group: "B",
    hoursDone: 16,
    status: "on-hold",
    hasBalance: true,
    hasMissingClasses: false
  },
  {
    id: "3",
    name: "Sophia Garcia",
    email: "sophia.garcia@example.com",
    phone: "(555) 345-6789",
    group: "A",
    hoursDone: 30,
    status: "completed",
    hasBalance: false,
    hasMissingClasses: false
  },
  {
    id: "4",
    name: "Michael Johnson",
    email: "michael.johnson@example.com",
    phone: "(555) 456-7890",
    group: "C",
    hoursDone: 8,
    status: "active",
    hasBalance: false,
    hasMissingClasses: true
  },
  {
    id: "5",
    name: "Olivia Brown",
    email: "olivia.brown@example.com",
    phone: "(555) 567-8901",
    group: "B",
    hoursDone: 20,
    status: "active",
    hasBalance: true,
    hasMissingClasses: true
  },
  {
    id: "6",
    name: "David Lee",
    email: "david.lee@example.com",
    phone: "(555) 678-9012",
    group: "D",
    hoursDone: 4,
    status: "dropped",
    hasBalance: true,
    hasMissingClasses: false
  },
  {
    id: "7",
    name: "Ava Martinez",
    email: "ava.martinez@example.com",
    phone: "(555) 789-0123",
    group: "C",
    hoursDone: 12,
    status: "active",
    hasBalance: false,
    hasMissingClasses: false
  },
  {
    id: "8",
    name: "James Wilson",
    email: "james.wilson@example.com",
    phone: "(555) 890-1234",
    group: "A",
    hoursDone: 28,
    status: "completed",
    hasBalance: false,
    hasMissingClasses: false
  }
];

// Detailed student data for profiles
export const studentProfilesData: Record<string, Student> = {
  "1": {
    id: "1",
    firstName: "Emma",
    lastName: "Wilson",
    studentId: "DS2024001",
    phone: "(555) 123-4567",
    email: "emma.wilson@email.com",
    whatsapp: "(555) 123-4567",
    street: "123 Elm St",
    apartment: "Apt 4B",
    city: "Springfield",
    postalCode: "62704",
    dateOfBirth: "1990-05-15",
    learnerLicenseNumber: "L123456789",
    group: "A",
    status: "active",
    currentPhase: 2,
    totalCompletedSessions: 10,
    enrollmentDate: "2024-01-15",
    needsSupport: false,
    attendanceIssues: false,
    documents: [
      {
        id: "doc1",
        name: "Driver_License_Photo.jpg",
        type: "ID",
        fileType: "jpg",
        uploadDate: "2024-01-16",
        size: "2.3 MB",
        status: "approved"
      },
      {
        id: "doc2",
        name: "Medical_Certificate.pdf",
        type: "Medical",
        fileType: "pdf",
        uploadDate: "2024-01-18",
        size: "856 KB",
        status: "approved"
      },
      {
        id: "doc3",
        name: "Insurance_Proof.pdf",
        type: "Insurance",
        fileType: "pdf",
        uploadDate: "2024-01-20",
        size: "1.1 MB",
        status: "pending"
      }
    ]
  },
  "2": {
    id: "2", 
    firstName: "John",
    lastName: "Smith",
    studentId: "DS2024002",
    phone: "(555) 234-5678",
    email: "john.smith@email.com",
    whatsapp: "(555) 234-5678",
    street: "456 Oak St",
    city: "Springfield",
    postalCode: "62704",
    dateOfBirth: "1992-07-20",
    group: "B",
    status: "active",
    currentPhase: 1,
    totalCompletedSessions: 3,
    enrollmentDate: "2024-02-01",
    needsSupport: true,
    attendanceIssues: false,
    documents: [
      {
        id: "doc4",
        name: "Birth_Certificate.pdf",
        type: "ID",
        fileType: "pdf",
        uploadDate: "2024-02-02",
        size: "1.5 MB",
        status: "approved"
      },
      {
        id: "doc5",
        name: "Eye_Exam_Results.pdf",
        type: "Medical",
        fileType: "pdf",
        uploadDate: "2024-02-03",
        size: "645 KB",
        status: "rejected"
      }
    ]
  }
};

// Helper function to add a new student to both data stores
export const addNewStudent = (basicStudent: BasicStudent, formData?: any): void => {
  studentsListData.push(basicStudent);
  
  // Create a complete student profile with form data if provided
  const completeStudent: Student = {
    id: basicStudent.id,
    firstName: formData?.firstName || "",
    lastName: formData?.lastName || "",
    studentId: `DS${new Date().getFullYear()}${String(basicStudent.id).padStart(3, '0')}`,
    phone: basicStudent.phone,
    email: basicStudent.email,
    whatsapp: formData?.whatsapp || basicStudent.phone,
    street: formData?.street || "",
    apartment: formData?.apartment || "",
    city: formData?.city || "",
    postalCode: formData?.postalCode || "",
    dateOfBirth: formData?.dateOfBirth || "",
    learnerLicenseNumber: "",
    group: basicStudent.group,
    status: basicStudent.status,
    currentPhase: 1,
    totalCompletedSessions: 0,
    enrollmentDate: new Date().toISOString().split('T')[0],
    needsSupport: false,
    attendanceIssues: false,
    documents: []
  };
  
  studentProfilesData[basicStudent.id] = completeStudent;
};

// Helper function to create a complete student object with defaults for missing fields
export const createCompleteStudent = (partialStudent: any): Student => {
  const today = new Date().toISOString().split('T')[0];
  
  return {
    id: partialStudent.id,
    firstName: partialStudent.name === "New Student" ? "" : (partialStudent.firstName || partialStudent.name?.split(' ')[0] || ""),
    lastName: partialStudent.name === "New Student" ? "" : (partialStudent.lastName || partialStudent.name?.split(' ').slice(1).join(' ') || ""),
    studentId: partialStudent.studentId || `DS${new Date().getFullYear()}${String(partialStudent.id).padStart(3, '0')}`,
    phone: partialStudent.phone || "",
    email: partialStudent.email || "",
    whatsapp: partialStudent.whatsapp || partialStudent.phone || "",
    street: partialStudent.street || "",
    apartment: partialStudent.apartment || "",
    city: partialStudent.city || "",
    postalCode: partialStudent.postalCode || "",
    dateOfBirth: partialStudent.dateOfBirth || "",
    learnerLicenseNumber: partialStudent.learnerLicenseNumber || "",
    group: partialStudent.group || "none",
    status: partialStudent.status || "active",
    currentPhase: partialStudent.currentPhase || 1,
    totalCompletedSessions: partialStudent.totalCompletedSessions || 0,
    enrollmentDate: partialStudent.enrollmentDate || today,
    needsSupport: partialStudent.needsSupport || false,
    attendanceIssues: partialStudent.attendanceIssues || false,
    documents: partialStudent.documents || []
  };
}; 