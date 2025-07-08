import React, { useState } from "react";
import { PageLayout } from "@/components/ui/page-layout";
import { Button } from "@/components/ui/button";
import { Plus, ChevronLeft, ChevronRight, Phone, Clock, Users, UserRound, Calendar as CalendarIcon, Check, X, FileText, Download, CheckCircle, AlertCircle, PenTool, MoreVertical } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { toast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import { format, addDays } from "date-fns";

// Define class type with additional properties for agenda functionality
interface ClassItem {
  id: number;
  student: string;
  date: string;
  startTime: string;
  endTime: string;
  phone: string;
  instructor: string;
  className: string;
  type: "Theory" | "Practical";
  group: string;
  duration: string;
  notes: string;
  isCheckedIn?: boolean;
  isCompleted?: boolean;
  attendanceData?: {
    totalStudents: number;
    presentStudents: number;
    absentStudents: number;
  };
}

// Define student attendance interface
interface StudentAttendance {
  id: number;
  name: string;
  avatar?: string;
  isPresent: boolean;
  notes: string;
}

// Instructors list
const instructors = ["Mike Brown", "Lisa Taylor", "James Wilson"];

// Mock students for theory classes
const mockStudentsForTheory = [
  { id: 1, name: "Emma Wilson", avatar: "" },
  { id: 2, name: "John Smith", avatar: "" },
  { id: 3, name: "Sophia Garcia", avatar: "" },
  { id: 4, name: "Michael Johnson", avatar: "" },
  { id: 5, name: "Olivia Brown", avatar: "" },
  { id: 6, name: "David Lee", avatar: "" },
  { id: 7, name: "Ava Martinez", avatar: "" },
  { id: 8, name: "James Wilson", avatar: "" },
  { id: 9, name: "Tyler Rodriguez", avatar: "" },
  { id: 10, name: "Isabella Lopez", avatar: "" },
  { id: 11, name: "Mason Clark", avatar: "" },
  { id: 12, name: "Abigail Turner", avatar: "" },
];

// Enhanced dummy data for agenda classes
const dummyClasses: ClassItem[] = [
  // Today's classes with different states
  { 
    id: 101, 
    student: "Emma Wilson", 
    date: format(new Date(), 'yyyy-MM-dd'), 
    startTime: "09:00", 
    endTime: "10:00", 
    phone: "(555) 123-4567", 
    instructor: "Mike Brown",
    className: "Basic Maneuvers",
    type: "Practical",
    group: "Group A",
    duration: "1 hour",
    notes: "Focus on parking techniques and three-point turns.",
    isCheckedIn: true,
    isCompleted: true
  },
  { 
    id: 102, 
    student: "John Smith", 
    date: format(new Date(), 'yyyy-MM-dd'), 
    startTime: "10:30", 
    endTime: "11:30", 
    phone: "(555) 234-5678", 
    instructor: "Mike Brown",
    className: "Highway Driving",
    type: "Practical",
    group: "Group B",
    duration: "1 hour",
    notes: "First highway session. Cover merging and lane changes.",
    isCheckedIn: false,
    isCompleted: false
  },
  { 
    id: 103, 
    student: "Theory Group A", 
    date: format(new Date(), 'yyyy-MM-dd'), 
    startTime: "14:00", 
    endTime: "16:00", 
    phone: "", 
    instructor: "Lisa Taylor",
    className: "Road Signs & Regulations",
    type: "Theory",
    group: "Group A",
    duration: "2 hours",
    notes: "Review all regulatory, warning, and guide signs.",
    isCheckedIn: false,
    isCompleted: false,
    attendanceData: {
      totalStudents: 12,
      presentStudents: 10,
      absentStudents: 2
    }
  },
  { 
    id: 104, 
    student: "Sophia Garcia", 
    date: format(new Date(), 'yyyy-MM-dd'), 
    startTime: "16:30", 
    endTime: "17:30", 
    phone: "(555) 345-6789", 
    instructor: "James Wilson",
    className: "City Driving",
    type: "Practical",
    group: "Individual",
    duration: "1 hour",
    notes: "Practice navigating through busy city streets.",
    isCheckedIn: false,
    isCompleted: false
  },
  { 
    id: 105, 
    student: "Theory Group B", 
    date: format(new Date(), 'yyyy-MM-dd'), 
    startTime: "18:00", 
    endTime: "19:30", 
    phone: "", 
    instructor: "Lisa Taylor",
    className: "Traffic Laws",
    type: "Theory",
    group: "Group B",
    duration: "1.5 hours",
    notes: "Comprehensive review of traffic laws and penalties.",
    isCheckedIn: false,
    isCompleted: false
  },
  { 
    id: 106, 
    student: "Michael Johnson", 
    date: format(new Date(), 'yyyy-MM-dd'), 
    startTime: "19:00", 
    endTime: "20:00", 
    phone: "(555) 456-7890", 
    instructor: "James Wilson",
    className: "Night Driving",
    type: "Practical",
    group: "Individual",
    duration: "1 hour",
    notes: "Low-light driving conditions and headlight usage.",
    isCheckedIn: false,
    isCompleted: false
  },
];

const Agenda = () => {
  const [selectedDay, setSelectedDay] = useState(new Date());
  const [classes, setClasses] = useState<ClassItem[]>(dummyClasses);
  const [attendanceModalOpen, setAttendanceModalOpen] = useState(false);
  const [manualCompletionModalOpen, setManualCompletionModalOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState<ClassItem | null>(null);
  const [studentAttendance, setStudentAttendance] = useState<StudentAttendance[]>([]);
  const [completionNotes, setCompletionNotes] = useState("");

  // Navigation functions
  const prevDay = () => setSelectedDay(addDays(selectedDay, -1));
  const nextDay = () => setSelectedDay(addDays(selectedDay, 1));

  // Get classes for the selected day
  const getClassesForDay = () => {
    return classes.filter(cls => cls.date === format(selectedDay, 'yyyy-MM-dd'));
  };

  // Handle practical class check-in
  const handlePracticalCheckIn = (classId: number) => {
    setClasses(prev => prev.map(cls => 
      cls.id === classId 
        ? { ...cls, isCheckedIn: true, isCompleted: true }
        : cls
    ));
    toast({
      title: "Class Checked In",
      description: "Practical class has been marked as completed with signature.",
    });
  };

  // Handle theory class click
  const handleTheoryClassClick = (classItem: ClassItem) => {
    setSelectedClass(classItem);
    // Initialize attendance data for theory classes
    const attendanceData = mockStudentsForTheory.slice(0, 12).map(student => ({
      id: student.id,
      name: student.name,
      avatar: student.avatar,
      isPresent: Math.random() > 0.2, // 80% present by default
      notes: ""
    }));
    setStudentAttendance(attendanceData);
    setAttendanceModalOpen(true);
  };

  // Handle attendance toggle
  const toggleAttendance = (studentId: number) => {
    setStudentAttendance(prev => prev.map(student => 
      student.id === studentId 
        ? { ...student, isPresent: !student.isPresent }
        : student
    ));
  };

  // Handle student notes
  const updateStudentNotes = (studentId: number, notes: string) => {
    setStudentAttendance(prev => prev.map(student => 
      student.id === studentId 
        ? { ...student, notes }
        : student
    ));
  };

  // Mark all present/absent
  const markAllPresent = () => {
    setStudentAttendance(prev => prev.map(student => ({ ...student, isPresent: true })));
  };

  const markAllAbsent = () => {
    setStudentAttendance(prev => prev.map(student => ({ ...student, isPresent: false })));
  };

  // Save attendance
  const saveAttendance = () => {
    if (!selectedClass) return;

    const presentCount = studentAttendance.filter(s => s.isPresent).length;
    const absentCount = studentAttendance.filter(s => !s.isPresent).length;

    setClasses(prev => prev.map(cls => 
      cls.id === selectedClass.id 
        ? { 
            ...cls, 
            isCompleted: true,
            attendanceData: {
              totalStudents: studentAttendance.length,
              presentStudents: presentCount,
              absentStudents: absentCount
            }
          }
        : cls
    ));

    setAttendanceModalOpen(false);
    toast({
      title: "Attendance Saved",
      description: `${presentCount} students marked present, ${absentCount} marked absent.`,
    });
  };

  // Handle manual completion
  const handleManualCompletion = (classItem: ClassItem) => {
    setSelectedClass(classItem);
    setCompletionNotes("");
    setManualCompletionModalOpen(true);
  };

  // Save manual completion
  const saveManualCompletion = () => {
    if (!selectedClass) return;

    setClasses(prev => prev.map(cls => 
      cls.id === selectedClass.id 
        ? { ...cls, isCompleted: true, notes: cls.notes + (completionNotes ? `\n\nManual completion: ${completionNotes}` : "") }
        : cls
    ));

    setManualCompletionModalOpen(false);
    toast({
      title: "Class Completed",
      description: "Class has been manually marked as completed.",
    });
  };

  // Handle undo completion
  const handleUndoCompletion = (classId: number) => {
    setClasses(prev => prev.map(cls => 
      cls.id === classId 
        ? { 
            ...cls, 
            isCompleted: false, 
            isCheckedIn: false,
            attendanceData: cls.type === "Theory" ? undefined : cls.attendanceData
          }
        : cls
    ));
    
    const undoneClass = classes.find(cls => cls.id === classId);
    toast({
      title: "Class Completion Undone",
      description: `${undoneClass?.className} has been reverted to incomplete status.`,
    });
  };

  // Calculate daily stats
  const calculateDailyStats = () => {
    const todayClasses = getClassesForDay();
    const completedClasses = todayClasses.filter(cls => cls.isCompleted).length;
    const practicalClasses = todayClasses.filter(cls => cls.type === "Practical").length;
    const theoryClasses = todayClasses.filter(cls => cls.type === "Theory").length;
    const noShows = todayClasses.filter(cls => !cls.isCompleted && !cls.isCheckedIn).length;

    return {
      totalClasses: todayClasses.length,
      completedClasses,
      practicalClasses,
      theoryClasses,
      noShows
    };
  };

  const stats = calculateDailyStats();

  return (
    <PageLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Agenda</h1>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="icon" onClick={prevDay}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={nextDay}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Date Header */}
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-foreground">
            {format(selectedDay, 'EEEE, MMMM d, yyyy')}
          </h2>
          <p className="text-muted-foreground mt-1">Daily Class Overview</p>
        </div>

        {/* Performance Summary Panel */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5" />
              <span>Performance Summary</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{stats.completedClasses}</div>
                <div className="text-sm text-muted-foreground">Completed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{stats.noShows}</div>
                <div className="text-sm text-muted-foreground">No-Shows</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{stats.practicalClasses}</div>
                <div className="text-sm text-muted-foreground">Practical</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{stats.theoryClasses}</div>
                <div className="text-sm text-muted-foreground">Theory</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground">{stats.totalClasses}</div>
                <div className="text-sm text-muted-foreground">Total Classes</div>
              </div>
            </div>
            <div className="mt-4 flex justify-center space-x-2">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export PDF
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Instructors and Classes Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {instructors.map((instructorName) => {
            const instructorClasses = getClassesForDay().filter(cls => cls.instructor === instructorName);
            const sortedClasses = instructorClasses.sort((a, b) => a.startTime.localeCompare(b.startTime));
            
            return (
              <div key={instructorName} className="space-y-4">
                <div className="flex items-center space-x-3 pb-3 border-b border-border/50">
                  <UserRound className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-semibold">{instructorName}</h3>
                  <Badge variant="secondary" className="text-xs">
                    {sortedClasses.length} {sortedClasses.length === 1 ? 'class' : 'classes'}
                  </Badge>
                </div>
                
                {sortedClasses.length === 0 ? (
                  <div className="text-center py-8">
                    <CalendarIcon className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">No classes scheduled</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {sortedClasses.map((cls) => (
                      <Card 
                        key={cls.id} 
                        className={cn(
                          "cursor-pointer transition-all duration-200",
                          cls.isCompleted 
                            ? "bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800"
                            : "hover:shadow-md hover:scale-[1.02]"
                        )}
                        onClick={() => {
                          if (cls.isCompleted) {
                            // For completed classes, allow undo
                            handleUndoCompletion(cls.id);
                          } else if (cls.type === "Theory") {
                            handleTheoryClassClick(cls);
                          } else if (cls.type === "Practical") {
                            handleManualCompletion(cls);
                          }
                        }}
                      >
                        <CardContent className="p-4">
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <Badge 
                                  variant={cls.type === "Theory" ? "default" : "secondary"}
                                  className={cls.type === "Theory" ? "bg-blue-100 text-blue-700 border border-blue-200" : "bg-rose-100 text-rose-700 border border-rose-200"}
                                >
                                  {cls.type}
                                </Badge>
                                {cls.isCompleted && (
                                  <Badge variant="default" className="bg-green-100 text-green-700 border border-green-200">
                                    <CheckCircle className="h-3 w-3 mr-1" />
                                    Completed
                                  </Badge>
                                )}
                              </div>
                              <div className="flex items-center space-x-2">
                                <div className="text-right">
                                  <div className="text-lg font-bold text-foreground">{cls.startTime}</div>
                                  <div className="text-xs text-muted-foreground">{cls.duration}</div>
                                </div>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm">
                                      <MoreVertical className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    {cls.type === "Practical" && !cls.isCompleted && (
                                      <DropdownMenuItem onClick={() => handlePracticalCheckIn(cls.id)}>
                                        <CheckCircle className="h-4 w-4 mr-2" />
                                        iPad Check-In
                                      </DropdownMenuItem>
                                    )}
                                    {!cls.isCompleted && (
                                      <DropdownMenuItem onClick={() => handleManualCompletion(cls)}>
                                        <PenTool className="h-4 w-4 mr-2" />
                                        Manual Completion
                                      </DropdownMenuItem>
                                    )}
                                    {cls.isCompleted && (
                                      <DropdownMenuItem onClick={() => handleUndoCompletion(cls.id)}>
                                        <X className="h-4 w-4 mr-2" />
                                        Undo Completion
                                      </DropdownMenuItem>
                                    )}
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </div>
                            
                            <div>
                              <h4 className="font-semibold text-sm mb-1">{cls.className}</h4>
                              {cls.type === "Practical" ? (
                                <div className="flex items-center space-x-2 mb-2">
                                  <UserRound className="h-3 w-3 text-muted-foreground" />
                                  <span className="text-xs font-medium">{cls.student}</span>
                                </div>
                              ) : (
                                <div className="flex items-center space-x-2 mb-2">
                                  <Users className="h-3 w-3 text-muted-foreground" />
                                  <span className="text-xs font-medium">{cls.group}</span>
                                  {cls.attendanceData && (
                                    <span className="text-xs text-muted-foreground">
                                      ({cls.attendanceData.presentStudents}/{cls.attendanceData.totalStudents} present)
                                    </span>
                                  )}
                                </div>
                              )}
                              {cls.phone && (
                                <div className="flex items-center space-x-2">
                                  <Phone className="h-3 w-3 text-muted-foreground" />
                                  <span className="text-xs text-muted-foreground">{cls.phone}</span>
                                </div>
                              )}
                            </div>
                            

                            
                            {cls.notes && (
                              <div className="p-2 bg-muted/50 rounded-md">
                                <p className="text-xs text-muted-foreground line-clamp-2">{cls.notes}</p>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Theory Class Attendance Modal */}
        <Dialog open={attendanceModalOpen} onOpenChange={setAttendanceModalOpen}>
          <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-hidden">
            <DialogHeader>
              <DialogTitle>Class Attendance</DialogTitle>
              <DialogDescription>
                {selectedClass?.className} - {selectedClass?.group}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Students</h3>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" onClick={markAllPresent}>
                    <Check className="h-4 w-4 mr-2" />
                    Mark All Present
                  </Button>
                  <Button variant="outline" size="sm" onClick={markAllAbsent}>
                    <X className="h-4 w-4 mr-2" />
                    Mark All Absent
                  </Button>
                </div>
              </div>
              
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {studentAttendance.map((student) => (
                  <div key={student.id} className="flex items-center space-x-3 p-3 border rounded-md">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={student.avatar} />
                      <AvatarFallback>
                        {student.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <Checkbox 
                          checked={student.isPresent}
                          onCheckedChange={() => toggleAttendance(student.id)}
                        />
                        <span className="font-medium">{student.name}</span>
                        <Badge variant={student.isPresent ? "default" : "secondary"}>
                          {student.isPresent ? "Present" : "Absent"}
                        </Badge>
                      </div>
                      <Input
                        placeholder="Optional notes (e.g., 'Arrived late')"
                        value={student.notes}
                        onChange={(e) => updateStudentNotes(student.id, e.target.value)}
                        className="mt-2 text-sm"
                      />
                    </div>
                  </div>
                ))}
              </div>
              
              <Separator />
              
              <div className="flex justify-between items-center">
                <div className="text-sm text-muted-foreground">
                  Present: {studentAttendance.filter(s => s.isPresent).length} / {studentAttendance.length}
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setAttendanceModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={saveAttendance}>
                Save Attendance
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Manual Completion Modal */}
        <Dialog open={manualCompletionModalOpen} onOpenChange={setManualCompletionModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Manual Completion</DialogTitle>
              <DialogDescription>
                Mark "{selectedClass?.className}" as completed manually
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="completion-notes">Completion Notes</Label>
                <Textarea
                  id="completion-notes"
                  placeholder="Add any notes about the manual completion..."
                  value={completionNotes}
                  onChange={(e) => setCompletionNotes(e.target.value)}
                  className="mt-2"
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setManualCompletionModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={saveManualCompletion}>
                Mark as Completed
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </PageLayout>
  );
};

export default Agenda; 