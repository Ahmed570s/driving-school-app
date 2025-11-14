import React, { useState, useEffect } from "react";
import { PageLayout } from "@/components/ui/page-layout";
import { Button } from "@/components/ui/button";
import { Plus, ChevronLeft, ChevronRight, Phone, Clock, Users, Bookmark, UserRound, Calendar as CalendarIcon, AlertTriangle, Check, ChevronsUpDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetClose } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, parseISO, addDays } from "date-fns";
import { getClasses, createClass, getUpcomingClasses, getClassById, updateClass, deleteClass, ClassItem as ServiceClassItem } from "@/services/classes";
import { getInstructors, getActiveInstructors, getInstructorOptions, getInstructorStats, Instructor } from "@/services/instructors";
import { getGroups, getActiveGroups, getGroupOptions, getGroupStats, Group } from "@/services/groups";
import { getStudentsForScheduling, getStudentsByGroup, getAvailableStudentsForClass, getStudentStats, StudentOption } from "@/services/students";

// Define class type for UI compatibility (will be replaced with ServiceClassItem)
interface ClassItem {
  id: number;
  student: string;
  date: string;
  startTime: string;
  endTime: string;
  phone: string;
  instructor: string;
  className: string;
  type: string;
  group: string;
  duration: string;
  notes: string;
}

// Define form data interface
interface ClassFormData {
  type: "Theory" | "Practical" | "";
  date: string;
  startTime: string;
  duration: number;
  instructor: string;
  selectedStudents: string[];
  selectedGroup: string;
  notes: string;
}

// Duration options
const durationOptions = [
  { value: 60, label: "60 minutes" },
  { value: 90, label: "90 minutes" },
  { value: 120, label: "120 minutes" },
];

const Calendar = () => {
  // Set default date to May 2025
  const [currentMonth, setCurrentMonth] = useState(new Date(2025, 4, 1)); // Month is 0-indexed, so 4 = May
  const [selectedDay, setSelectedDay] = useState(new Date(2025, 4, 21)); // May 21, 2025 for day view
  const [instructor, setInstructor] = useState("Mike Brown");
  const [viewMode, setViewMode] = useState("month");
  const [selectedClass, setSelectedClass] = useState<ClassItem | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  // ============================================================================
  // REAL DATA STATE MANAGEMENT - Replace mock data with real state
  // ============================================================================
  
  // Classes data from database
  const [classes, setClasses] = useState<ServiceClassItem[]>([]);
  const [classesLoading, setClassesLoading] = useState(true);
  
  // Instructors data from database  
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [instructorsLoading, setInstructorsLoading] = useState(true);
  
  // Students data for dropdowns
  const [students, setStudents] = useState<StudentOption[]>([]);
  const [studentsLoading, setStudentsLoading] = useState(true);
  
  // Groups data for dropdowns
  const [groups, setGroups] = useState<Group[]>([]);
  const [groupsLoading, setGroupsLoading] = useState(true);
  
  // Overall loading state
  const [loading, setLoading] = useState(true);
  
  // Add Class Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [studentComboboxOpen, setStudentComboboxOpen] = useState(false);
  const [formData, setFormData] = useState<ClassFormData>({
    type: "",
    date: format(new Date(), 'yyyy-MM-dd'),
    startTime: "",
    duration: 60,
    instructor: "",
    selectedStudents: [],
    selectedGroup: "",
    notes: ""
  });

  // Week view state
  const [currentWeekStart, setCurrentWeekStart] = useState(new Date(2025, 4, 18)); // May 18, 2025
  const prevWeek = () => setCurrentWeekStart(addDays(currentWeekStart, -7));
  const nextWeek = () => setCurrentWeekStart(addDays(currentWeekStart, 7));
  
  // Filter classes by instructor (temporary - will be replaced with real data filtering)
  const instructorClasses: ClassItem[] = []; // Empty for now, will be populated from real data
  
  // Get classes for a specific day (temporary - will be replaced with real data filtering)
  const getClassesForDay = (day: Date) => {
    const dateString = format(day, 'yyyy-MM-dd');
    return instructorClasses.filter(cls => cls.date === dateString);
  };

  // Get classes for selected date in form (temporary - will be replaced with real data filtering)
  const getClassesForSelectedDate = () => {
    return instructorClasses.filter(cls => cls.date === formData.date);
  };
  
  // Check instructor availability (temporary - will be replaced with real conflict checking)
  const checkInstructorConflict = () => {
    if (!formData.instructor || !formData.date || !formData.startTime) return null;
    
    const conflictingClass = instructorClasses.find(cls => 
      cls.instructor === formData.instructor && 
      cls.date === formData.date && 
      cls.startTime === formData.startTime
    );
    
    return conflictingClass || null;
  };

  // Get students for selected group (temporary - will be replaced with real data filtering)
  const getStudentsForGroup = (groupId: string) => {
    return students.filter(student => 
      groups.find(group => group.id === groupId)?.name === groupId
    );
  };
  
  // Handle form field changes
  const handleFormChange = (field: keyof ClassFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Calculate end time based on start time and duration
  const calculateEndTime = (startTime: string, duration: number) => {
    if (!startTime) return "";
    
    const [hours, minutes] = startTime.split(':').map(Number);
    const startDate = new Date();
    startDate.setHours(hours, minutes, 0, 0);
    
    const endDate = new Date(startDate.getTime() + duration * 60000);
    return format(endDate, 'HH:mm');
  };

  // Get students based on class type and group selection
  const getAvailableStudents = () => {
    if (formData.type === "Theory" && formData.selectedGroup) {
      return getStudentsForGroup(formData.selectedGroup);
    }
    return students.filter(student => formData.selectedStudents.includes(student.name));
  };
  
  // Handle form submission (temporary - will be replaced with real class creation)
  const handleSubmit = () => {
    // Basic validation
    if (!formData.type || !formData.date || !formData.startTime || !formData.instructor) {
      alert("Please fill in all required fields");
      return;
    }

    if (formData.type === "Theory" && !formData.selectedGroup) {
      alert("Please select a group for theory class");
      return;
    }

    if (formData.type === "Practical" && formData.selectedStudents.length === 0) {
      alert("Please select a student for practical class");
      return;
    }

    // Check for conflicts
    const conflict = checkInstructorConflict();
    if (conflict) {
      alert(`Instructor ${formData.instructor} is already booked at ${formData.startTime} on ${formData.date}`);
      return;
    }

    // TODO: Replace with real class creation using createClass service
    console.log("Creating class:", formData);
    
    // Reset form and close modal
    setFormData({
      type: "",
      date: format(new Date(), 'yyyy-MM-dd'),
      startTime: "",
      duration: 60,
      instructor: "",
      selectedStudents: [],
      selectedGroup: "",
      notes: ""
    });
    setModalOpen(false);
  };

  // Navigation functions
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevDay = () => setSelectedDay(addDays(selectedDay, -1));
  const nextDay = () => setSelectedDay(addDays(selectedDay, 1));

  // Get days for month view
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Test Services Function (temporary - for testing the service layer)
  const testServices = async () => {
    console.log('🧪 Testing all service layers...');
    
    try {
      // Test classes service
      const allClasses = await getClasses();
      console.log('✅ Classes service:', allClasses.length, 'classes found');
      
      // Test instructors service  
      const allInstructors = await getInstructors();
      console.log('✅ Instructors service:', allInstructors.length, 'instructors found');
      
      // Test groups service
      const allGroups = await getGroups();
      console.log('✅ Groups service:', allGroups.length, 'groups found');
      
      // Test students service
      const studentsForScheduling = await getStudentsForScheduling();
      console.log('✅ Students service:', studentsForScheduling.length, 'students found');
      
      // Test availability functions
      const theoryStudents = await getAvailableStudentsForClass('theory');
      const practicalStudents = await getAvailableStudentsForClass('practical');
      console.log('✅ Students available for theory:', theoryStudents.length);
      console.log('✅ Students available for practical:', practicalStudents.length);
      
      // Test statistics
      const studentStats = await getStudentStats();
      console.log('✅ Student stats:', studentStats);
      
      // === DIAGNOSTIC: Check student phases ===
      if (studentsForScheduling.length > 0) {
        console.log('\n🔍 STUDENT PHASE ANALYSIS:');
        const phaseBreakdown = studentsForScheduling.reduce((acc, student) => {
          acc[`Phase ${student.currentPhase}`] = (acc[`Phase ${student.currentPhase}`] || 0) + 1;
          return acc;
        }, {});
        console.log('📊 Phase breakdown:', phaseBreakdown);
        
        const phase1Students = studentsForScheduling.filter(s => s.currentPhase === 1);
        const phase2PlusStudents = studentsForScheduling.filter(s => s.currentPhase >= 2);
        
        console.log(`📚 Phase 1 students (theory only): ${phase1Students.length}`);
        console.log(`🚗 Phase 2+ students (practical eligible): ${phase2PlusStudents.length}`);
        
        if (phase1Students.length > 0) {
          console.log('👥 Phase 1 students:', phase1Students.map(s => `${s.name} (${s.studentId})`));
        }
        if (phase2PlusStudents.length > 0) {
          console.log('👥 Phase 2+ students:', phase2PlusStudents.map(s => `${s.name} (Phase ${s.currentPhase})`));
        }
      }
      
    } catch (error) {
      console.error('❌ Service test failed:', error);
    }
  };

  // Render month view
  const renderMonthView = () => (
    <div className="grid grid-cols-7 gap-1">
      {/* Day headers */}
      {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
        <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
          {day}
        </div>
      ))}
      
      {/* Calendar days */}
      {calendarDays.map(day => {
        const dayClasses = getClassesForDay(day);
        const isCurrentMonth = isSameMonth(day, currentMonth);
        const isCurrentDay = isToday(day);
        
        return (
          <div
            key={day.toISOString()}
            className={cn(
              "min-h-[100px] p-1 border border-gray-200 cursor-pointer hover:bg-gray-50",
              !isCurrentMonth && "bg-gray-50 text-gray-400",
              isCurrentDay && "bg-blue-50 border-blue-200"
            )}
            onClick={() => setSelectedDay(day)}
          >
            <div className={cn(
              "text-sm font-medium mb-1",
              isCurrentDay && "text-blue-600"
            )}>
              {format(day, 'd')}
            </div>
            
            {/* Classes for this day */}
            {dayClasses.slice(0, 2).map(cls => (
              <div
                key={cls.id}
                className={cn(
                  "text-xs p-1 mb-1 rounded cursor-pointer truncate",
                  cls.type === "Theory" ? "bg-blue-100 text-blue-800" : "bg-green-100 text-green-800"
                )}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedClass(cls);
                  setSheetOpen(true);
                }}
              >
                {cls.startTime} - {cls.student}
              </div>
            ))}
            
            {/* Show "+X more" if there are more classes */}
            {dayClasses.length > 2 && (
              <div className="text-xs text-gray-500 cursor-pointer hover:text-gray-700">
                +{dayClasses.length - 2} more
              </div>
            )}
          </div>
        );
      })}
    </div>
  );

  // Render week view
  const renderWeekView = () => {
    const weekDays = Array.from({ length: 7 }, (_, i) => addDays(currentWeekStart, i));
    
    return (
      <div className="grid grid-cols-8 gap-1">
        {/* Time column header */}
        <div className="p-2 text-center text-sm font-medium text-gray-500">Time</div>
        
        {/* Day headers */}
        {weekDays.map(day => (
          <div key={day.toISOString()} className="p-2 text-center text-sm font-medium text-gray-500">
            <div>{format(day, 'EEE')}</div>
            <div className={cn(
              "text-lg",
              isToday(day) && "text-blue-600 font-bold"
            )}>
              {format(day, 'd')}
            </div>
          </div>
        ))}
        
        {/* Time slots */}
        {Array.from({ length: 10 }, (_, i) => i + 8).map(hour => (
          <React.Fragment key={hour}>
            {/* Time label */}
            <div className="p-2 text-sm text-gray-500 border-r">
              {hour}:00
            </div>
            
            {/* Day columns */}
            {weekDays.map(day => {
              const dayClasses = getClassesForDay(day).filter(cls => {
                const classHour = parseInt(cls.startTime.split(':')[0]);
                return classHour === hour;
              });
              
              return (
                <div key={`${day.toISOString()}-${hour}`} className="min-h-[60px] p-1 border border-gray-200">
                  {dayClasses.map(cls => (
                    <div
                      key={cls.id}
                      className={cn(
                        "text-xs p-1 mb-1 rounded cursor-pointer",
                        cls.type === "Theory" ? "bg-blue-100 text-blue-800" : "bg-green-100 text-green-800"
                      )}
                      onClick={() => {
                        setSelectedClass(cls);
                        setSheetOpen(true);
                      }}
                    >
                      <div className="font-medium">{cls.student}</div>
                      <div>{cls.className}</div>
                    </div>
                  ))}
                </div>
              );
            })}
          </React.Fragment>
        ))}
      </div>
    );
  };

  // Render day view
  const renderDayView = () => {
    const dayClasses = getClassesForDay(selectedDay);
    
    return (
      <div className="space-y-4">
        <div className="text-center">
          <h3 className="text-lg font-semibold">{format(selectedDay, 'EEEE, MMMM d, yyyy')}</h3>
        </div>
        
        {dayClasses.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            No classes scheduled for this day
          </div>
        ) : (
          <div className="space-y-2">
            {dayClasses.map(cls => (
              <Card key={cls.id} className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => {
                      setSelectedClass(cls);
                      setSheetOpen(true);
                    }}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={cn(
                        "w-3 h-3 rounded-full",
                        cls.type === "Theory" ? "bg-blue-500" : "bg-green-500"
                      )} />
                      <div>
                        <div className="font-medium">{cls.className}</div>
                        <div className="text-sm text-gray-500">{cls.student}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{cls.startTime} - {cls.endTime}</div>
                      <div className="text-sm text-gray-500">{cls.instructor}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <PageLayout title="Calendar">
      <div className="space-y-6">
        {/* Header with navigation and actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm" onClick={prevMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <h2 className="text-xl font-semibold">
              {format(currentMonth, 'MMMM yyyy')}
            </h2>
            <Button variant="outline" size="sm" onClick={nextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={testServices}>
              🧪 Test Services
            </Button>
            <Button onClick={() => setModalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Class
            </Button>
          </div>
        </div>

        {/* View mode toggle */}
        <ToggleGroup type="single" value={viewMode} onValueChange={setViewMode}>
          <ToggleGroupItem value="month">Month</ToggleGroupItem>
          <ToggleGroupItem value="week">Week</ToggleGroupItem>
          <ToggleGroupItem value="day">Day</ToggleGroupItem>
        </ToggleGroup>

        {/* Instructor tabs */}
        <Tabs value={instructor} onValueChange={setInstructor}>
          <TabsList>
            <TabsTrigger value="Mike Brown">Mike Brown</TabsTrigger>
            <TabsTrigger value="Lisa Taylor">Lisa Taylor</TabsTrigger>
            <TabsTrigger value="James Wilson">James Wilson</TabsTrigger>
          </TabsList>

          <TabsContent value="Mike Brown" className="mt-6">
            <Card>
              <CardContent className="p-6">
                {loading ? (
                  <div className="text-center py-8">
                    <div className="text-gray-500">Loading calendar data...</div>
                  </div>
                ) : (
                  <>
                    {viewMode === "month" && renderMonthView()}
                    {viewMode === "week" && (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <Button variant="outline" size="sm" onClick={prevWeek}>
                            <ChevronLeft className="h-4 w-4" />
                          </Button>
                          <h3 className="font-semibold">
                            {format(currentWeekStart, 'MMM d')} - {format(addDays(currentWeekStart, 6), 'MMM d, yyyy')}
                          </h3>
                          <Button variant="outline" size="sm" onClick={nextWeek}>
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </div>
                        {renderWeekView()}
                      </div>
                    )}
                    {viewMode === "day" && (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <Button variant="outline" size="sm" onClick={prevDay}>
                            <ChevronLeft className="h-4 w-4" />
                          </Button>
                          <h3 className="font-semibold">
                            {format(selectedDay, 'EEEE, MMMM d, yyyy')}
                          </h3>
                          <Button variant="outline" size="sm" onClick={nextDay}>
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </div>
                        {renderDayView()}
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="Lisa Taylor" className="mt-6">
            <Card>
              <CardContent className="p-6">
                {loading ? (
                  <div className="text-center py-8">
                    <div className="text-gray-500">Loading calendar data...</div>
                  </div>
                ) : (
                  <>
                    {viewMode === "month" && renderMonthView()}
                    {viewMode === "week" && renderWeekView()}
                    {viewMode === "day" && renderDayView()}
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="James Wilson" className="mt-6">
            <Card>
              <CardContent className="p-6">
                {loading ? (
                  <div className="text-center py-8">
                    <div className="text-gray-500">Loading calendar data...</div>
                  </div>
                ) : (
                  <>
                    {viewMode === "month" && renderMonthView()}
                    {viewMode === "week" && renderWeekView()}
                    {viewMode === "day" && renderDayView()}
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Class Details Sheet */}
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Class Details</SheetTitle>
              <SheetDescription>
                View and manage class information
              </SheetDescription>
            </SheetHeader>
            
            {selectedClass && (
              <div className="space-y-6 mt-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Badge variant={selectedClass.type === "Theory" ? "default" : "secondary"}>
                      {selectedClass.type}
                    </Badge>
                    <span className="text-sm text-gray-500">{selectedClass.group}</span>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-lg">{selectedClass.className}</h3>
                    <p className="text-gray-600">{selectedClass.student}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <CalendarIcon className="h-4 w-4 text-gray-400" />
                      <span>{selectedClass.date}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <span>{selectedClass.startTime} - {selectedClass.endTime}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <UserRound className="h-4 w-4 text-gray-400" />
                      <span>{selectedClass.instructor}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <span>{selectedClass.phone}</span>
                    </div>
                  </div>
                  
                  {selectedClass.notes && (
                    <div>
                      <h4 className="font-medium mb-2">Notes</h4>
                      <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                        {selectedClass.notes}
                      </p>
                    </div>
                  )}
                </div>
                
                <div className="flex space-x-2">
                  <Button variant="outline" className="flex-1">
                    Edit Class
                  </Button>
                  <Button variant="destructive" className="flex-1">
                    Cancel Class
                  </Button>
                </div>
              </div>
            )}
          </SheetContent>
        </Sheet>

        {/* Add Class Modal */}
        <Dialog open={modalOpen} onOpenChange={setModalOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Class</DialogTitle>
              <DialogDescription>
                Schedule a new theory or practical class
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Class Type *</Label>
                  <Select value={formData.type} onValueChange={(value) => handleFormChange('type', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select class type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Theory">Theory Class</SelectItem>
                      <SelectItem value="Practical">Practical Class</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="date">Date *</Label>
                  <Input
                    type="date"
                    value={formData.date}
                    onChange={(e) => handleFormChange('date', e.target.value)}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startTime">Start Time *</Label>
                  <Input
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => handleFormChange('startTime', e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="duration">Duration *</Label>
                  <Select 
                    value={formData.duration.toString()} 
                    onValueChange={(value) => handleFormChange('duration', parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {durationOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value.toString()}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>End Time</Label>
                  <Input
                    value={calculateEndTime(formData.startTime, formData.duration)}
                    disabled
                    className="bg-gray-50"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="instructor">Instructor *</Label>
                <Select value={formData.instructor} onValueChange={(value) => handleFormChange('instructor', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select instructor" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Mike Brown">Mike Brown</SelectItem>
                    <SelectItem value="Lisa Taylor">Lisa Taylor</SelectItem>
                    <SelectItem value="James Wilson">James Wilson</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* Conflict warning */}
              {checkInstructorConflict() && (
                <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded">
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                  <span className="text-sm text-red-700">
                    Instructor {formData.instructor} is already booked at {formData.startTime} on {formData.date}
                  </span>
                </div>
              )}
              
              {/* Theory class group selection */}
              {formData.type === "Theory" && (
                <div className="space-y-2">
                  <Label htmlFor="group">Group *</Label>
                  <Select value={formData.selectedGroup} onValueChange={(value) => handleFormChange('selectedGroup', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select group for theory class" />
                    </SelectTrigger>
                    <SelectContent>
                      {groups.map((group) => (
                        <SelectItem key={group.id} value={group.id}>
                          {group.name} ({group.currentEnrollment} students)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              
              {/* Practical class student selection */}
              {formData.type === "Practical" && (
                <div className="space-y-2">
                  <Label>Student *</Label>
                  <Popover open={studentComboboxOpen} onOpenChange={setStudentComboboxOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={studentComboboxOpen}
                        className="w-full justify-between"
                      >
                        {formData.selectedStudents[0] 
                          ? students.find(student => student.name === formData.selectedStudents[0])?.name + 
                            ` (${students.find(student => student.name === formData.selectedStudents[0])?.studentId})`
                          : "Select a student for practical class..."
                        }
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0">
                      <Command>
                        <CommandInput placeholder="Search students..." />
                        <CommandList>
                          <CommandEmpty>No student found.</CommandEmpty>
                          <CommandGroup>
                            {students.map((student) => (
                              <CommandItem
                                key={student.id}
                                value={student.name}
                                onSelect={(currentValue) => {
                                  const newValue = currentValue === formData.selectedStudents[0] ? [] : [currentValue];
                                  handleFormChange('selectedStudents', newValue);
                                  setStudentComboboxOpen(false);
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    formData.selectedStudents.includes(student.name) ? "opacity-100" : "opacity-0"
                                  )}
                                />
                                {student.name} ({student.studentId})
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  placeholder="Add any additional notes or instructions for this class..."
                  value={formData.notes}
                  onChange={(e) => handleFormChange('notes', e.target.value)}
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSubmit}>
                Create Class
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </PageLayout>
  );
};

export default Calendar;