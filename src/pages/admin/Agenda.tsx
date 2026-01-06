import React, { useState, useEffect } from "react";
import { PageLayout } from "@/components/ui/page-layout";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Phone, Clock, Users, UserRound, Calendar as CalendarIcon, Check, X, FileText, Download, CheckCircle, PenTool, MoreVertical, Loader2, Printer } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import { format, addDays } from "date-fns";

// Services
import { getClasses, updateClass, ClassItem as ServiceClassItem } from "@/services/classes";
import { getActiveInstructors, Instructor } from "@/services/instructors";
import { getStudentsByGroup, BasicStudent } from "@/services/students";

// Extended class item for agenda functionality
interface AgendaClass extends ServiceClassItem {
  isCompleted?: boolean;
  attendanceData?: {
    totalStudents: number;
    presentStudents: number;
    absentStudents: number;
  };
}

// Student attendance interface
interface StudentAttendance {
  id: string;
  name: string;
  avatar?: string;
  isPresent: boolean;
  notes: string;
}

const Agenda = () => {
  const { toast } = useToast();
  const [selectedDay, setSelectedDay] = useState(new Date());
  const [classes, setClasses] = useState<AgendaClass[]>([]);
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [loading, setLoading] = useState(true);
  const [attendanceModalOpen, setAttendanceModalOpen] = useState(false);
  const [manualCompletionModalOpen, setManualCompletionModalOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState<AgendaClass | null>(null);
  const [studentAttendance, setStudentAttendance] = useState<StudentAttendance[]>([]);
  const [completionNotes, setCompletionNotes] = useState("");
  const [loadingAttendance, setLoadingAttendance] = useState(false);
  const [savingCompletion, setSavingCompletion] = useState(false);

  // Load data on mount and when selected day changes
  useEffect(() => {
    loadData();
  }, [selectedDay]);

  const loadData = async () => {
    setLoading(true);
    try {
      const dateStr = format(selectedDay, 'yyyy-MM-dd');
      
      // Load classes and instructors in parallel
      const [classesData, instructorsData] = await Promise.all([
        getClasses({ startDate: dateStr, endDate: dateStr }),
        getActiveInstructors()
      ]);

      // Convert classes to agenda format with completion status
      const agendaClasses: AgendaClass[] = classesData.map(cls => ({
        ...cls,
        isCompleted: cls.status === 'completed' || cls.status === 'no_show'
      }));

      setClasses(agendaClasses);
      setInstructors(instructorsData);
    } catch (error) {
      console.error('Error loading agenda data:', error);
      toast({
        title: "Error",
        description: "Failed to load agenda data. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Navigation functions
  const prevDay = () => setSelectedDay(addDays(selectedDay, -1));
  const nextDay = () => setSelectedDay(addDays(selectedDay, 1));
  const goToToday = () => setSelectedDay(new Date());

  // Get classes for the selected day (already filtered by API)
  const getClassesForDay = () => classes;

  // Handle practical class check-in (iPad signature)
  const handlePracticalCheckIn = async (classItem: AgendaClass) => {
    setSavingCompletion(true);
    try {
      await updateClass(classItem.id, { status: 'completed' });
      
      setClasses(prev => prev.map(cls => 
        cls.id === classItem.id 
          ? { ...cls, status: 'completed' as const, isCompleted: true }
          : cls
      ));
      
      toast({
        title: "Class Checked In",
        description: "Practical class marked as completed.",
      });
    } catch (error) {
      console.error('Error checking in class:', error);
      toast({
        title: "Error",
        description: "Failed to check in class. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSavingCompletion(false);
    }
  };

  // Handle theory class click - load students for attendance
  const handleTheoryClassClick = async (classItem: AgendaClass) => {
    setSelectedClass(classItem);
    setLoadingAttendance(true);
    setAttendanceModalOpen(true);

    try {
      // Load students for this group
      let students: BasicStudent[] = [];
      if (classItem.groupId) {
        students = await getStudentsByGroup(classItem.groupId);
      }

      // Initialize attendance data
      const attendanceData: StudentAttendance[] = students.map(student => ({
        id: student.id,
        name: student.name,
        avatar: "",
        isPresent: true, // Default to present
        notes: ""
      }));

      setStudentAttendance(attendanceData);
    } catch (error) {
      console.error('Error loading students for attendance:', error);
      toast({
        title: "Error",
        description: "Failed to load student list.",
        variant: "destructive"
      });
      // Set empty attendance list if loading fails
      setStudentAttendance([]);
    } finally {
      setLoadingAttendance(false);
    }
  };

  // Handle attendance toggle
  const toggleAttendance = (studentId: string) => {
    setStudentAttendance(prev => prev.map(student => 
      student.id === studentId 
        ? { ...student, isPresent: !student.isPresent }
        : student
    ));
  };

  // Handle student notes
  const updateStudentNotes = (studentId: string, notes: string) => {
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
  const saveAttendance = async () => {
    if (!selectedClass) return;

    setSavingCompletion(true);
    try {
      const presentCount = studentAttendance.filter(s => s.isPresent).length;
      const absentCount = studentAttendance.filter(s => !s.isPresent).length;

      // Update class status to completed
      await updateClass(selectedClass.id, { status: 'completed' });

      setClasses(prev => prev.map(cls => 
        cls.id === selectedClass.id 
          ? { 
              ...cls, 
              status: 'completed' as const,
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
        description: `${presentCount} present, ${absentCount} absent.`,
      });
    } catch (error) {
      console.error('Error saving attendance:', error);
      toast({
        title: "Error",
        description: "Failed to save attendance. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSavingCompletion(false);
    }
  };

  // Handle manual completion
  const handleManualCompletion = (classItem: AgendaClass) => {
    setSelectedClass(classItem);
    setCompletionNotes("");
    setManualCompletionModalOpen(true);
  };

  // Save manual completion
  const saveManualCompletion = async () => {
    if (!selectedClass) return;

    setSavingCompletion(true);
    try {
      // Update class status and notes
      const updatedNotes = selectedClass.notes 
        ? `${selectedClass.notes}\n\nManual completion: ${completionNotes}`
        : `Manual completion: ${completionNotes}`;
      
      await updateClass(selectedClass.id, { 
        status: 'completed',
        notes: completionNotes ? updatedNotes : selectedClass.notes
      });

      setClasses(prev => prev.map(cls => 
        cls.id === selectedClass.id 
          ? { 
              ...cls, 
              status: 'completed' as const,
              isCompleted: true, 
              notes: completionNotes ? updatedNotes : cls.notes 
            }
          : cls
      ));

      setManualCompletionModalOpen(false);
      toast({
        title: "Class Completed",
        description: "Class has been marked as completed.",
      });
    } catch (error) {
      console.error('Error completing class:', error);
      toast({
        title: "Error",
        description: "Failed to complete class. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSavingCompletion(false);
    }
  };

  // Handle undo completion
  const handleUndoCompletion = async (classItem: AgendaClass) => {
    setSavingCompletion(true);
    try {
      await updateClass(classItem.id, { status: 'scheduled' });

      setClasses(prev => prev.map(cls => 
        cls.id === classItem.id 
          ? { 
              ...cls, 
              status: 'scheduled' as const,
              isCompleted: false,
              attendanceData: undefined
            }
          : cls
      ));
      
      toast({
        title: "Completion Undone",
        description: `${classItem.className} reverted to scheduled.`,
      });
    } catch (error) {
      console.error('Error undoing completion:', error);
      toast({
        title: "Error",
        description: "Failed to undo completion. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSavingCompletion(false);
    }
  };

  // Calculate daily stats
  const calculateDailyStats = () => {
    const todayClasses = getClassesForDay();
    const completedClasses = todayClasses.filter(cls => cls.isCompleted).length;
    const practicalClasses = todayClasses.filter(cls => cls.type === "Practical").length;
    const theoryClasses = todayClasses.filter(cls => cls.type === "Theory").length;
    const pending = todayClasses.filter(cls => !cls.isCompleted).length;

    return {
      totalClasses: todayClasses.length,
      completedClasses,
      practicalClasses,
      theoryClasses,
      pending
    };
  };

  const stats = calculateDailyStats();
  const isToday = format(selectedDay, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');

  return (
    <PageLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Agenda</h1>
          <div className="flex items-center space-x-2">
            <Button 
              variant={isToday ? "default" : "outline"} 
              size="sm" 
              onClick={goToToday}
              className="mr-2"
            >
              Today
            </Button>
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
                <div className="text-2xl font-bold text-orange-600">{stats.pending}</div>
                <div className="text-sm text-muted-foreground">Pending</div>
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
                <Printer className="h-4 w-4 mr-2" />
                Print
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export PDF
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Loading State */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin mr-2" />
            <span className="text-lg">Loading agenda...</span>
          </div>
        ) : instructors.length === 0 ? (
          <div className="text-center py-12">
            <UserRound className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium text-muted-foreground mb-2">No Instructors Found</h3>
            <p className="text-sm text-muted-foreground">
              Add instructors to see their daily schedules.
            </p>
          </div>
        ) : (
          /* Instructors and Classes Grid */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {instructors.map((instructor) => {
              const instructorClasses = getClassesForDay().filter(cls => cls.instructorId === instructor.id);
              const sortedClasses = instructorClasses.sort((a, b) => a.startTime.localeCompare(b.startTime));
              
              return (
                <div key={instructor.id} className="space-y-4">
                  <div className="flex items-center space-x-3 pb-3 border-b border-border/50">
                    <UserRound className="h-5 w-5 text-primary" />
                    <h3 className="text-lg font-semibold">{instructor.fullName}</h3>
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
                              handleUndoCompletion(cls);
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
                                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                      <Button variant="ghost" size="sm">
                                        <MoreVertical className="h-4 w-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                                      {cls.type === "Practical" && !cls.isCompleted && (
                                        <DropdownMenuItem onClick={() => handlePracticalCheckIn(cls)}>
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
                                        <DropdownMenuItem onClick={() => handleUndoCompletion(cls)}>
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
        )}

        {/* Theory Class Attendance Modal */}
        <Dialog open={attendanceModalOpen} onOpenChange={setAttendanceModalOpen}>
          <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-hidden">
            <DialogHeader>
              <DialogTitle>Class Attendance</DialogTitle>
              <DialogDescription>
                {selectedClass?.className} - {selectedClass?.group}
              </DialogDescription>
            </DialogHeader>
            
            {loadingAttendance ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin mr-2" />
                <span>Loading students...</span>
              </div>
            ) : studentAttendance.length === 0 ? (
              <div className="text-center py-8">
                <Users className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-muted-foreground">No students enrolled in this group.</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Students</h3>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" onClick={markAllPresent}>
                      <Check className="h-4 w-4 mr-2" />
                      All Present
                    </Button>
                    <Button variant="outline" size="sm" onClick={markAllAbsent}>
                      <X className="h-4 w-4 mr-2" />
                      All Absent
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {studentAttendance.map((student) => (
                    <div key={student.id} className="flex items-center space-x-3 p-3 border rounded-md">
                      <Avatar className="h-8 w-8">
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
            )}
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setAttendanceModalOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={saveAttendance} 
                disabled={savingCompletion || loadingAttendance || studentAttendance.length === 0}
              >
                {savingCompletion ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Saving...
                  </>
                ) : (
                  "Save Attendance"
                )}
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
                Mark "{selectedClass?.className}" as completed
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="p-3 bg-muted/50 rounded-md">
                <div className="flex items-center space-x-2 text-sm">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>{selectedClass?.startTime} - {selectedClass?.endTime}</span>
                </div>
                {selectedClass?.type === "Practical" && (
                  <div className="flex items-center space-x-2 text-sm mt-1">
                    <UserRound className="h-4 w-4 text-muted-foreground" />
                    <span>{selectedClass?.student}</span>
                  </div>
                )}
              </div>
              
              <div>
                <Label htmlFor="completion-notes">Completion Notes (optional)</Label>
                <Textarea
                  id="completion-notes"
                  placeholder="Add any notes about this class..."
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
              <Button onClick={saveManualCompletion} disabled={savingCompletion}>
                {savingCompletion ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Saving...
                  </>
                ) : (
                  "Mark as Completed"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </PageLayout>
  );
};

export default Agenda;
