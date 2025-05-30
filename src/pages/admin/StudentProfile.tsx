import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { 
  ArrowLeft, 
  Phone, 
  Mail, 
  MessageCircle, 
  Calendar, 
  Clock, 
  User, 
  GraduationCap,
  Filter,
  Download,
  Upload,
  FileText,
  Flag,
  MessageSquare,
  CheckCircle2,
  Circle,
  BookOpen,
  Car,
  Eye,
  Users,
  AlertTriangle,
  MapPin,
  CreditCard,
  Cake,
  Files,
  Trash2,
  ExternalLink,
  Shield,
  FileImage,
  File,
  Edit,
  Save,
  X
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "@/components/ui/use-toast";

// Types
interface Session {
  id: number;
  phase: 1 | 2 | 3 | 4;
  name: string;
  type: "Theory" | "Practical" | "Observation";
  completed: boolean;
  date?: string;
  timeFrom?: string;
  timeTo?: string;
  instructor?: string;
  notes?: string;
  instructorComments?: string;
}

interface Document {
  id: string;
  name: string;
  type: "ID" | "Medical" | "Insurance" | "License" | "Other";
  fileType: "pdf" | "jpg" | "png" | "doc" | "docx";
  uploadDate: string;
  size: string;
  status: "approved" | "pending" | "rejected";
}

interface Student {
  id: string;
  firstName: string;
  lastName: string;
  studentId: string;
  phone: string;
  email: string;
  whatsapp: string;
  // Address fields
  street: string;
  apartment?: string; // Optional since not all addresses have apartment numbers
  city: string;
  postalCode: string;
  // Additional personal information
  dateOfBirth: string;
  learnerLicenseNumber?: string; // Optional since they get it during the course
  currentPhase: 1 | 2 | 3 | 4;
  totalCompletedSessions: number;
  enrollmentDate: string;
  needsSupport: boolean;
  attendanceIssues: boolean;
  documents: Document[];
}

// Government curriculum sessions template
const sessionTemplate: Session[] = [
  // Phase 1: Prerequisite
  { id: 1, phase: 1, name: "The Vehicle", type: "Theory", completed: true, date: "2024-01-15", timeFrom: "10:00", timeTo: "11:30", instructor: "Mike Brown", notes: "Covered basic vehicle components" },
  { id: 2, phase: 1, name: "The Driver", type: "Theory", completed: true, date: "2024-01-17", timeFrom: "10:00", timeTo: "11:30", instructor: "Mike Brown", notes: "Driver responsibilities and requirements" },
  { id: 3, phase: 1, name: "The Environment", type: "Theory", completed: true, date: "2024-01-19", timeFrom: "10:00", timeTo: "11:30", instructor: "Lisa Taylor", notes: "Road conditions and weather factors" },
  { id: 4, phase: 1, name: "At-Risk Behaviours", type: "Theory", completed: true, date: "2024-01-22", timeFrom: "10:00", timeTo: "11:30", instructor: "Lisa Taylor", notes: "Risk awareness and prevention" },
  { id: 5, phase: 1, name: "Evaluation", type: "Theory", completed: true, date: "2024-01-24", timeFrom: "10:00", timeTo: "11:30", instructor: "Mike Brown", notes: "Phase 1 assessment completed" },
  
  // Phase 2: Guided Driving
  { id: 6, phase: 2, name: "Accompanied Driving", type: "Theory", completed: true, date: "2024-01-26", timeFrom: "10:00", timeTo: "11:30", instructor: "Lisa Taylor", notes: "Preparation for practical sessions" },
  { id: 7, phase: 2, name: "In-Car Session 1", type: "Practical", completed: true, date: "2024-01-29", timeFrom: "14:00", timeTo: "15:30", instructor: "James Wilson", notes: "First practical lesson - basic controls" },
  { id: 8, phase: 2, name: "In-Car Session 2", type: "Practical", completed: true, date: "2024-02-01", timeFrom: "14:00", timeTo: "15:30", instructor: "James Wilson", notes: "Steering and basic maneuvers" },
  { id: 9, phase: 2, name: "OEA Strategy", type: "Theory", completed: true, date: "2024-02-03", timeFrom: "10:00", timeTo: "11:30", instructor: "Mike Brown", notes: "Observe, Evaluate, Act methodology" },
  { id: 10, phase: 2, name: "In-Car Session 3", type: "Practical", completed: true, date: "2024-02-05", timeFrom: "14:00", timeTo: "15:30", instructor: "James Wilson", notes: "Traffic integration practice" },
  { id: 11, phase: 2, name: "In-Car Session 4", type: "Practical", completed: false },
  
  // Phase 3: Semi-Guided Driving
  { id: 12, phase: 3, name: "Speed", type: "Theory", completed: false },
  { id: 13, phase: 3, name: "In-Car Session 5", type: "Practical", completed: false },
  { id: 14, phase: 3, name: "In-Car Session 6", type: "Practical", completed: false },
  { id: 15, phase: 3, name: "Sharing the Road", type: "Theory", completed: false },
  { id: 16, phase: 3, name: "In-Car Session 7", type: "Practical", completed: false },
  { id: 17, phase: 3, name: "In-Car Session 8", type: "Practical", completed: false },
  { id: 18, phase: 3, name: "Alcohol and Drugs", type: "Theory", completed: false },
  { id: 19, phase: 3, name: "In-Car Session 9", type: "Practical", completed: false },
  { id: 20, phase: 3, name: "In-Car Session 10", type: "Practical", completed: false },
  
  // Phase 4: Toward Independent Driving
  { id: 21, phase: 4, name: "Fatigue and Distractions", type: "Theory", completed: false },
  { id: 22, phase: 4, name: "In-Car Session 11", type: "Practical", completed: false },
  { id: 23, phase: 4, name: "In-Car Session 12", type: "Practical", completed: false },
  { id: 24, phase: 4, name: "In-Car Session 13", type: "Practical", completed: false },
  { id: 25, phase: 4, name: "Eco-Driving", type: "Theory", completed: false },
  { id: 26, phase: 4, name: "In-Car Session 14", type: "Practical", completed: false },
  { id: 27, phase: 4, name: "In-Car Session 15", type: "Practical", completed: false }
];

// Dummy student data
const dummyStudents: Record<string, Student> = {
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
    // No learner license number yet - showing optional field
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

// Instructors
const instructors = ["Mike Brown", "Lisa Taylor", "James Wilson"];

const StudentProfile = ({ 
  studentId, 
  onBack 
}: { 
  studentId: string | null; 
  onBack: () => void;
}) => {
  const navigate = useNavigate();
  
  // State
  const [sessions, setSessions] = useState<Session[]>(sessionTemplate);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [phaseFilter, setPhaseFilter] = useState<"all" | "1" | "2" | "3" | "4">("all");
  const [typeFilter, setTypeFilter] = useState<"all" | "Theory" | "Practical" | "Observation">("all");
  const [completionFilter, setCompletionFilter] = useState<"all" | "completed" | "pending">("all");
  const [isEditingStudent, setIsEditingStudent] = useState(false);
  const [editedStudent, setEditedStudent] = useState<Student | null>(null);

  // Get student data
  const student = studentId ? dummyStudents[studentId] : null;
  
  if (!student) {
    return (
      <div className="text-center py-8">
        <h1 className="text-2xl font-bold text-red-600">Student Not Found</h1>
        <Button onClick={onBack} className="mt-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Students
        </Button>
      </div>
    );
  }

  // Calculate progress
  const completedSessions = sessions.filter(s => s.completed).length;
  const progressPercentage = Math.round((completedSessions / sessions.length) * 100);
  
  // Auto-calculate current phase based on completed sessions
  const calculateCurrentPhase = (): 1 | 2 | 3 | 4 => {
    const phase1Complete = sessions.slice(0, 5).every(s => s.completed);
    const phase2Complete = sessions.slice(5, 11).every(s => s.completed);
    const phase3Complete = sessions.slice(11, 20).every(s => s.completed);
    
    if (!phase1Complete) return 1;
    if (!phase2Complete) return 2;
    if (!phase3Complete) return 3;
    return 4;
  };

  // Filter sessions
  const filteredSessions = useMemo(() => {
    return sessions.filter(session => {
      const matchesPhase = phaseFilter === "all" || session.phase.toString() === phaseFilter;
      const matchesType = typeFilter === "all" || session.type === typeFilter;
      const matchesCompletion = completionFilter === "all" || 
        (completionFilter === "completed" && session.completed) ||
        (completionFilter === "pending" && !session.completed);
      
      return matchesPhase && matchesType && matchesCompletion;
    });
  }, [sessions, phaseFilter, typeFilter, completionFilter]);

  // Session modal handlers
  const openSessionModal = (session: Session) => {
    setSelectedSession(session);
    setModalOpen(true);
  };

  const handleSessionUpdate = (updatedSession: Session) => {
    setSessions(prev => prev.map(s => s.id === updatedSession.id ? updatedSession : s));
    setModalOpen(false);
    setSelectedSession(null);
  };

  // Student edit handlers
  const handleEditStudent = () => {
    setEditedStudent({ ...student });
    setIsEditingStudent(true);
  };

  const handleSaveStudent = () => {
    if (editedStudent) {
      // Here you would typically make an API call to save the student data
      // For now, we'll just show a toast notification
      console.log('Saving student data:', editedStudent);
      
      toast({
        title: "Student information updated",
        description: "The student's information has been saved successfully.",
      });
      
      setIsEditingStudent(false);
      setEditedStudent(null);
      // You could update the local state or refetch data here
    }
  };

  const handleCancelEdit = () => {
    setIsEditingStudent(false);
    setEditedStudent(null);
  };

  const handleStudentFieldChange = (field: keyof Student, value: string) => {
    if (editedStudent) {
      setEditedStudent({ ...editedStudent, [field]: value });
    }
  };

  const getPhaseColor = (phase: number) => {
    const colors = { 1: "bg-red-100 text-red-800", 2: "bg-yellow-100 text-yellow-800", 3: "bg-blue-100 text-blue-800", 4: "bg-green-100 text-green-800" };
    return colors[phase as keyof typeof colors];
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "Theory": return <BookOpen className="h-4 w-4" />;
      case "Practical": return <Car className="h-4 w-4" />;
      case "Observation": return <Eye className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const getDocumentIcon = (fileType: string) => {
    switch (fileType) {
      case "pdf": return <FileText className="h-4 w-4 text-red-600" />;
      case "jpg":
      case "png": return <FileImage className="h-4 w-4 text-blue-600" />;
      case "doc":
      case "docx": return <File className="h-4 w-4 text-blue-800" />;
      default: return <File className="h-4 w-4 text-gray-600" />;
    }
  };

  const getDocumentTypeColor = (type: string) => {
    const colors = {
      "ID": "bg-blue-100 text-blue-800",
      "Medical": "bg-green-100 text-green-800", 
      "Insurance": "bg-purple-100 text-purple-800",
      "License": "bg-orange-100 text-orange-800",
      "Other": "bg-gray-100 text-gray-800"
    };
    return colors[type as keyof typeof colors] || colors.Other;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved": return "bg-green-100 text-green-800 border-green-200";
      case "pending": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "rejected": return "bg-red-100 text-red-800 border-red-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <div className="flex flex-col pt-6">
      {/* Header with back button */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Student Profile</h1>
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Students
        </Button>
      </div>

      {/* Tabs Container */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid grid-cols-3 mb-6">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="sessions" className="flex items-center gap-2">
            <GraduationCap className="h-4 w-4" />
            Sessions
          </TabsTrigger>
          <TabsTrigger value="documents" className="flex items-center gap-2">
            <Files className="h-4 w-4" />
            Documents
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Student Overview Section */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Basic Info Card */}
            <Card className="md:col-span-2">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Student Information
                  </CardTitle>
                  {!isEditingStudent ? (
                    <Button variant="outline" size="sm" onClick={handleEditStudent}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </Button>
                  ) : (
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={handleCancelEdit}>
                        <X className="mr-2 h-4 w-4" />
                        Cancel
                      </Button>
                      <Button size="sm" onClick={handleSaveStudent}>
                        <Save className="mr-2 h-4 w-4" />
                        Save
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">First Name</Label>
                    {isEditingStudent ? (
                      <Input 
                        value={editedStudent?.firstName || ''} 
                        onChange={(e) => handleStudentFieldChange('firstName', e.target.value)}
                        className="mt-1"
                      />
                    ) : (
                      <p className="text-lg font-semibold">{student.firstName}</p>
                    )}
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Last Name</Label>
                    {isEditingStudent ? (
                      <Input 
                        value={editedStudent?.lastName || ''} 
                        onChange={(e) => handleStudentFieldChange('lastName', e.target.value)}
                        className="mt-1"
                      />
                    ) : (
                      <p className="text-lg font-semibold">{student.lastName}</p>
                    )}
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Student ID</Label>
                    {isEditingStudent ? (
                      <Input 
                        value={editedStudent?.studentId || ''} 
                        onChange={(e) => handleStudentFieldChange('studentId', e.target.value)}
                        className="mt-1"
                      />
                    ) : (
                      <p className="text-lg font-semibold">{student.studentId}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <div className="flex-1">
                      <Label className="text-sm font-medium text-muted-foreground">Phone</Label>
                      {isEditingStudent ? (
                        <Input 
                          value={editedStudent?.phone || ''} 
                          onChange={(e) => handleStudentFieldChange('phone', e.target.value)}
                          className="mt-1"
                        />
                      ) : (
                        <p>{student.phone}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <div className="flex-1">
                      <Label className="text-sm font-medium text-muted-foreground">Email</Label>
                      {isEditingStudent ? (
                        <Input 
                          type="email"
                          value={editedStudent?.email || ''} 
                          onChange={(e) => handleStudentFieldChange('email', e.target.value)}
                          className="mt-1"
                        />
                      ) : (
                        <p>{student.email}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <MessageCircle className="h-4 w-4 text-muted-foreground" />
                    <div className="flex-1">
                      <Label className="text-sm font-medium text-muted-foreground">WhatsApp</Label>
                      {isEditingStudent ? (
                        <Input 
                          value={editedStudent?.whatsapp || ''} 
                          onChange={(e) => handleStudentFieldChange('whatsapp', e.target.value)}
                          className="mt-1"
                        />
                      ) : (
                        <p>{student.whatsapp}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div className="flex-1">
                      <Label className="text-sm font-medium text-muted-foreground">Enrollment Date</Label>
                      {isEditingStudent ? (
                        <Input 
                          type="date"
                          value={editedStudent?.enrollmentDate || ''} 
                          onChange={(e) => handleStudentFieldChange('enrollmentDate', e.target.value)}
                          className="mt-1"
                        />
                      ) : (
                        <p>{format(new Date(student.enrollmentDate), 'MMM d, yyyy')}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Cake className="h-4 w-4 text-muted-foreground" />
                    <div className="flex-1">
                      <Label className="text-sm font-medium text-muted-foreground">Date of Birth</Label>
                      {isEditingStudent ? (
                        <Input 
                          type="date"
                          value={editedStudent?.dateOfBirth || ''} 
                          onChange={(e) => handleStudentFieldChange('dateOfBirth', e.target.value)}
                          className="mt-1"
                        />
                      ) : (
                        <p>{format(new Date(student.dateOfBirth), 'MMM d, yyyy')}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Address Information */}
                <div className="pt-4 border-t">
                  <Label className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Address Information
                  </Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Street Address</Label>
                      {isEditingStudent ? (
                        <Input 
                          value={editedStudent?.street || ''} 
                          onChange={(e) => handleStudentFieldChange('street', e.target.value)}
                          className="mt-1"
                        />
                      ) : (
                        <p>{student.street}</p>
                      )}
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Apartment/Unit</Label>
                      {isEditingStudent ? (
                        <Input 
                          value={editedStudent?.apartment || ''} 
                          onChange={(e) => handleStudentFieldChange('apartment', e.target.value)}
                          placeholder="Optional"
                          className="mt-1"
                        />
                      ) : (
                        <p>{student.apartment || '-'}</p>
                      )}
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">City</Label>
                      {isEditingStudent ? (
                        <Input 
                          value={editedStudent?.city || ''} 
                          onChange={(e) => handleStudentFieldChange('city', e.target.value)}
                          className="mt-1"
                        />
                      ) : (
                        <p>{student.city}</p>
                      )}
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Postal Code</Label>
                      {isEditingStudent ? (
                        <Input 
                          value={editedStudent?.postalCode || ''} 
                          onChange={(e) => handleStudentFieldChange('postalCode', e.target.value)}
                          className="mt-1"
                        />
                      ) : (
                        <p>{student.postalCode}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* License Information */}
                <div className="pt-4 border-t">
                  <Label className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                    <CreditCard className="h-4 w-4" />
                    License Information
                  </Label>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Learner License Number</Label>
                    {isEditingStudent ? (
                      <Input 
                        value={editedStudent?.learnerLicenseNumber || ''} 
                        onChange={(e) => handleStudentFieldChange('learnerLicenseNumber', e.target.value)}
                        placeholder="Optional - Enter when obtained"
                        className="mt-1 font-mono"
                      />
                    ) : student.learnerLicenseNumber ? (
                      <p className="font-mono">{student.learnerLicenseNumber}</p>
                    ) : (
                      <p className="text-muted-foreground">Not yet obtained</p>
                    )}
                  </div>
                </div>

                {/* Internal Flags */}
                {(student.needsSupport || student.attendanceIssues) && (
                  <div className="pt-4 border-t">
                    <Label className="text-sm font-medium text-muted-foreground mb-2 block">Internal Flags</Label>
                    <div className="flex gap-2">
                      {student.needsSupport && (
                        <Badge variant="outline" className="border-orange-500 text-orange-600">
                          <Flag className="mr-1 h-3 w-3" />
                          Needs Support
                        </Badge>
                      )}
                      {student.attendanceIssues && (
                        <Badge variant="outline" className="border-red-500 text-red-600">
                          <AlertTriangle className="mr-1 h-3 w-3" />
                          Attendance Issues
                        </Badge>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Right Column with Progress and Quick Actions */}
            <div className="space-y-6">
              {/* Progress Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <GraduationCap className="h-5 w-5" />
                    Progress
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{progressPercentage}%</div>
                    <p className="text-xs text-muted-foreground">Complete</p>
                  </div>
                  
                  <Progress value={progressPercentage} className="h-2" />
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs">Current Phase</span>
                      <Badge className={getPhaseColor(calculateCurrentPhase())} variant="outline">
                        Phase {calculateCurrentPhase()}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs">Sessions</span>
                      <span className="text-xs font-medium">{completedSessions} / {sessions.length}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      <Upload className="mr-2 h-4 w-4" />
                      Upload Documents
                    </Button>
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      <Download className="mr-2 h-4 w-4" />
                      Export Session Log
                    </Button>
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      <MessageSquare className="mr-2 h-4 w-4" />
                      Instructor Comments
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Sessions Tab */}
        <TabsContent value="sessions" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Session Log</CardTitle>
                <div className="flex gap-2">
                  <Select value={phaseFilter} onValueChange={(value: any) => setPhaseFilter(value)}>
                    <SelectTrigger className="w-[120px]">
                      <SelectValue placeholder="Phase" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Phases</SelectItem>
                      <SelectItem value="1">Phase 1</SelectItem>
                      <SelectItem value="2">Phase 2</SelectItem>
                      <SelectItem value="3">Phase 3</SelectItem>
                      <SelectItem value="4">Phase 4</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select value={typeFilter} onValueChange={(value: any) => setTypeFilter(value)}>
                    <SelectTrigger className="w-[120px]">
                      <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="Theory">Theory</SelectItem>
                      <SelectItem value="Practical">Practical</SelectItem>
                      <SelectItem value="Observation">Observation</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select value={completionFilter} onValueChange={(value: any) => setCompletionFilter(value)}>
                    <SelectTrigger className="w-[120px]">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">#</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Phase</TableHead>
                      <TableHead>Completed?</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Time</TableHead>
                      <TableHead>Instructor</TableHead>
                      <TableHead className="w-[100px]">Notes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSessions.map((session) => (
                      <TableRow 
                        key={session.id} 
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => openSessionModal(session)}
                      >
                        <TableCell className="font-medium">{session.id}</TableCell>
                        <TableCell>{session.name}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getTypeIcon(session.type)}
                            {session.type}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getPhaseColor(session.phase)} variant="outline">
                            Phase {session.phase}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {session.completed ? (
                            <CheckCircle2 className="h-5 w-5 text-green-600" />
                          ) : (
                            <Circle className="h-5 w-5 text-muted-foreground" />
                          )}
                        </TableCell>
                        <TableCell>{session.date || "-"}</TableCell>
                        <TableCell>
                          {session.timeFrom && session.timeTo 
                            ? `${session.timeFrom} - ${session.timeTo}` 
                            : "-"
                          }
                        </TableCell>
                        <TableCell>{session.instructor || "-"}</TableCell>
                        <TableCell>
                          {session.notes ? (
                            <Button variant="ghost" size="sm">
                              <FileText className="h-4 w-4" />
                            </Button>
                          ) : (
                            "-"
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Documents Tab */}
        <TabsContent value="documents" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center gap-2">
                  <Files className="h-5 w-5" />
                  Documents ({student.documents.length})
                </CardTitle>
                <Button>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload New Document
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {student.documents.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Files className="mx-auto h-12 w-12 mb-4 text-muted-foreground/50" />
                  <p>No documents uploaded yet</p>
                  <p className="text-sm">Click "Upload New Document" to add files</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {student.documents.map((document) => (
                    <div key={document.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-3">
                        {getDocumentIcon(document.fileType)}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium">{document.name}</h4>
                            <Badge variant="outline" className={getDocumentTypeColor(document.type)}>
                              {document.type}
                            </Badge>
                            <Badge variant="outline" className={getStatusColor(document.status)}>
                              {document.status.charAt(0).toUpperCase() + document.status.slice(1)}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>Size: {document.size}</span>
                            <span>Uploaded: {format(new Date(document.uploadDate), 'MMM d, yyyy')}</span>
                            <span className="uppercase">{document.fileType}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" title="Download">
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" title="View">
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" title="Delete" className="text-red-600 hover:text-red-700">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {/* Document Requirements Info */}
              <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                <div className="flex items-start gap-2">
                  <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium mb-2">Required Documents</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        <span>Photo ID (Driver's License/Passport)</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        <span>Medical Certificate</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Circle className="h-4 w-4 text-muted-foreground" />
                        <span>Insurance Proof</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Circle className="h-4 w-4 text-muted-foreground" />
                        <span>Vision Test Results</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Session Edit Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          {selectedSession && (
            <>
              <DialogHeader>
                <DialogTitle>Edit Session: {selectedSession.name}</DialogTitle>
                <DialogDescription>
                  Update session completion, schedule, and notes.
                </DialogDescription>
              </DialogHeader>
              
              <SessionEditForm 
                session={selectedSession}
                onSave={handleSessionUpdate}
                onCancel={() => setModalOpen(false)}
              />
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Session Edit Form Component
const SessionEditForm: React.FC<{
  session: Session;
  onSave: (session: Session) => void;
  onCancel: () => void;
}> = ({ session, onSave, onCancel }) => {
  const [formData, setFormData] = useState(session);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Completion Status</Label>
          <div className="flex items-center space-x-2">
            <Checkbox
              checked={formData.completed}
              onCheckedChange={(checked) => 
                setFormData(prev => ({ ...prev, completed: !!checked }))
              }
            />
            <span>Mark as completed</span>
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="date">Date</Label>
          <Input
            id="date"
            type="date"
            value={formData.date || ""}
            onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
          />
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="timeFrom">From</Label>
          <Input
            id="timeFrom"
            type="time"
            value={formData.timeFrom || ""}
            onChange={(e) => setFormData(prev => ({ ...prev, timeFrom: e.target.value }))}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="timeTo">To</Label>
          <Input
            id="timeTo"
            type="time"
            value={formData.timeTo || ""}
            onChange={(e) => setFormData(prev => ({ ...prev, timeTo: e.target.value }))}
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="instructor">Instructor</Label>
        <Select 
          value={formData.instructor || ""} 
          onValueChange={(value) => setFormData(prev => ({ ...prev, instructor: value }))}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select instructor" />
          </SelectTrigger>
          <SelectContent>
            {instructors.map((instructor) => (
              <SelectItem key={instructor} value={instructor}>
                {instructor}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          value={formData.notes || ""}
          onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
          placeholder="Add session notes..."
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="instructorComments">Instructor Comments</Label>
        <Textarea
          id="instructorComments"
          value={formData.instructorComments || ""}
          onChange={(e) => setFormData(prev => ({ ...prev, instructorComments: e.target.value }))}
          placeholder="Private instructor comments..."
        />
      </div>
      
      <DialogFooter className="gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          Save Changes
        </Button>
      </DialogFooter>
    </form>
  );
};

export default StudentProfile; 