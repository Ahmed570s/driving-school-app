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
  AlertTriangle
} from "lucide-react";
import { format } from "date-fns";

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

interface Student {
  id: string;
  fullName: string;
  studentId: string;
  phone: string;
  email: string;
  whatsapp: string;
  currentPhase: 1 | 2 | 3 | 4;
  totalCompletedSessions: number;
  enrollmentDate: string;
  needsSupport: boolean;
  attendanceIssues: boolean;
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
    fullName: "Emma Wilson",
    studentId: "DS2024001",
    phone: "(555) 123-4567",
    email: "emma.wilson@email.com",
    whatsapp: "(555) 123-4567",
    currentPhase: 2,
    totalCompletedSessions: 10,
    enrollmentDate: "2024-01-15",
    needsSupport: false,
    attendanceIssues: false
  },
  "2": {
    id: "2", 
    fullName: "John Smith",
    studentId: "DS2024002",
    phone: "(555) 234-5678",
    email: "john.smith@email.com",
    whatsapp: "(555) 234-5678",
    currentPhase: 1,
    totalCompletedSessions: 3,
    enrollmentDate: "2024-02-01",
    needsSupport: true,
    attendanceIssues: false
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

      {/* Student Overview Section */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Basic Info Card */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Student Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Full Name</Label>
                <p className="text-lg font-semibold">{student.fullName}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Student ID</Label>
                <p className="text-lg font-semibold">{student.studentId}</p>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Phone</Label>
                  <p>{student.phone}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Email</Label>
                  <p>{student.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <MessageCircle className="h-4 w-4 text-muted-foreground" />
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">WhatsApp</Label>
                  <p>{student.whatsapp}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Enrollment Date</Label>
                  <p>{format(new Date(student.enrollmentDate), 'MMM d, yyyy')}</p>
                </div>
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

        {/* Progress Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5" />
              Progress Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">{progressPercentage}%</div>
              <p className="text-sm text-muted-foreground">Overall Progress</p>
            </div>
            
            <Progress value={progressPercentage} className="h-3" />
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm">Current Phase</span>
                <Badge className={getPhaseColor(calculateCurrentPhase())}>
                  Phase {calculateCurrentPhase()}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Sessions Completed</span>
                <span className="font-medium">{completedSessions} / {sessions.length}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions Row */}
      <div className="flex flex-wrap gap-3 my-6">
        <Button variant="outline">
          <Upload className="mr-2 h-4 w-4" />
          Upload Documents
        </Button>
        <Button variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Export Session Log
        </Button>
        <Button variant="outline">
          <MessageSquare className="mr-2 h-4 w-4" />
          Instructor Comments
        </Button>
      </div>

      {/* Session Log Section */}
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