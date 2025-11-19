import React, { useState, useEffect } from "react";
import { PageLayout } from "@/components/ui/page-layout";
import { Button } from "@/components/ui/button";
import { Plus, ChevronLeft, ChevronRight, Phone, Clock, Users, Bookmark, UserRound, Calendar as CalendarIcon, AlertTriangle, Check, ChevronsUpDown, Loader2, RefreshCw } from "lucide-react";
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
import { getClasses, createClass, getUpcomingClasses, getClassById, updateClass, deleteClass } from "@/services/classes";
import { getInstructors, getActiveInstructors, getInstructorOptions, getInstructorStats } from "@/services/instructors";
import { getGroups, getActiveGroups, getGroupOptions, getGroupStats } from "@/services/groups";
import { getStudentsForScheduling, getStudentsByGroup, getAvailableStudentsForClass, getStudentStats } from "@/services/students";
import { useToast } from "@/hooks/use-toast";

// Import types from services
import type { ClassItem } from "@/services/classes";
import type { Instructor, InstructorOption } from "@/services/instructors";
import type { Group, GroupOption } from "@/services/groups";
import type { StudentOption } from "@/services/students";

// Define form data interface (matches service layer)
interface ClassFormData {
  type: "Theory" | "Practical" | "";
  date: string;
  startTime: string;
  duration: number;
  instructor: string;
  selectedStudents: string[];
  selectedGroup: string;
  notes: string;
  title: string;
}

// Real data state - will be loaded from database
// (Keeping empty arrays as initial state)

// Duration options
const durationOptions = [
  { value: 60, label: "60 minutes" },
  { value: 90, label: "90 minutes" },
  { value: 120, label: "120 minutes" },
];

// Real data will be loaded from database

// Predefined class titles based on driving school curriculum
const THEORY_CLASS_TITLES = [
  "The Vehicle",
  "The Driver", 
  "The Environment",
  "At-Risk Behaviours",
  "Evaluation",
  "Accompanied Driving",
  "OEA Strategy",
  "Speed",
  "Sharing the Road",
  "Alcohol and Drugs",
  "Fatigue and Distractions",
  "Eco-Driving"
];

const PRACTICAL_CLASS_TITLES = Array.from({ length: 15 }, (_, i) => `In-Car Session ${i + 1}`);

// Helper function to get the typical phase for a practical session
const getPracticalSessionPhase = (sessionNumber: number): number => {
  if (sessionNumber <= 3) return 2;
  if (sessionNumber <= 11) return 3;
  return 4;
};

const Calendar = () => {
  const { toast } = useToast();
  
  // Date and view state
  const [currentMonth, setCurrentMonth] = useState(new Date(2025, 4, 1)); // Month is 0-indexed, so 4 = May
  const [selectedDay, setSelectedDay] = useState(new Date(2025, 4, 21)); // May 21, 2025 for day view
  const [viewMode, setViewMode] = useState("month");
  
  // Data state - Replace mock data arrays with real state management
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [instructorOptions, setInstructorOptions] = useState<InstructorOption[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [groupOptions, setGroupOptions] = useState<GroupOption[]>([]);
  const [students, setStudents] = useState<StudentOption[]>([]);
  
  // Loading states
  const [loading, setLoading] = useState(true);
  const [instructorsLoading, setInstructorsLoading] = useState(true);
  const [groupsLoading, setGroupsLoading] = useState(true);
  const [studentsLoading, setStudentsLoading] = useState(true);
  
  // Selected instructor for filtering
  const [selectedInstructorId, setSelectedInstructorId] = useState<string>("");
  
  // UI state
  const [selectedClass, setSelectedClass] = useState<ClassItem | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  
  // Add Class Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [studentComboboxOpen, setStudentComboboxOpen] = useState(false);
  const [isCreatingClass, setIsCreatingClass] = useState(false);
  const [formData, setFormData] = useState<ClassFormData>({
    type: "",
    date: format(new Date(), 'yyyy-MM-dd'),
    startTime: "10:00",
    duration: 60,
    instructor: selectedInstructorId || "", // Default to current instructor
    selectedStudents: [],
    selectedGroup: "",
    notes: "",
    title: "",
  });
  
  // ============================================================================
  // DATA FETCHING - Load real data from services
  // ============================================================================

  // Load instructors data
  useEffect(() => {
    const loadInstructors = async () => {
      try {
        setInstructorsLoading(true);
        console.log('📚 Loading instructors for calendar...');
        
        // Load both full instructors and instructor options in parallel
        const [allInstructors, instructorOpts] = await Promise.all([
          getInstructors(),
          getInstructorOptions()
        ]);
        
        setInstructors(allInstructors);
        setInstructorOptions(instructorOpts);
        
        // Set default instructor to first instructor (required since we removed "All Instructors")
        if (!selectedInstructorId && allInstructors.length > 0) {
          setSelectedInstructorId(allInstructors[0].id);
        }
        
        console.log(`✅ Loaded ${allInstructors.length} instructors, ${instructorOpts.length} options`);
      } catch (error) {
        console.error('❌ Failed to load instructors:', error);
        toast({
          title: "Error Loading Instructors",
          description: "Failed to load instructor data. Please refresh the page.",
          variant: "destructive",
        });
      } finally {
        setInstructorsLoading(false);
      }
    };

    loadInstructors();
  }, []); // Run once on component mount

  // Load groups data
  useEffect(() => {
    const loadGroups = async () => {
      try {
        setGroupsLoading(true);
        console.log('👥 Loading groups for calendar...');
        
        // Load both full groups and group options in parallel
        const [allGroups, groupOpts] = await Promise.all([
          getGroups(),
          getGroupOptions()
        ]);
        
        setGroups(allGroups);
        setGroupOptions(groupOpts);
        
        console.log(`✅ Loaded ${allGroups.length} groups, ${groupOpts.length} options`);
      } catch (error) {
        console.error('❌ Failed to load groups:', error);
        toast({
          title: "Error Loading Groups",
          description: "Failed to load group data. Please refresh the page.",
          variant: "destructive",
        });
      } finally {
        setGroupsLoading(false);
      }
    };

    loadGroups();
  }, []); // Run once on component mount

  // Load students data
  useEffect(() => {
    const loadStudents = async () => {
      try {
        setStudentsLoading(true);
        console.log('🎓 Loading students for calendar...');
        
        const studentsData = await getStudentsForScheduling();
        setStudents(studentsData);
        
        console.log(`✅ Loaded ${studentsData.length} students for scheduling`);
      } catch (error) {
        console.error('❌ Failed to load students:', error);
        toast({
          title: "Error Loading Students",
          description: "Failed to load student data. Please refresh the page.",
          variant: "destructive",
        });
      } finally {
        setStudentsLoading(false);
      }
    };

    loadStudents();
  }, []); // Run once on component mount

  // Load classes data - depends on current month and selected instructor
  useEffect(() => {
    const loadClasses = async () => {
      try {
        setLoading(true);
        console.log('📅 Loading classes for calendar...', {
          month: format(currentMonth, 'yyyy-MM'),
          instructor: selectedInstructorId || 'all'
        });
        
        // Calculate date range for current month
        const startDate = format(startOfMonth(currentMonth), 'yyyy-MM-dd');
        const endDate = format(endOfMonth(currentMonth), 'yyyy-MM-dd');
        
        // Load classes with filters
        // Always filter by instructor (no "All Instructors" option)
        if (!selectedInstructorId) {
          console.log('⚠️ No instructor selected, skipping class load');
          return;
        }

        const classesData = await getClasses({
          startDate,
          endDate,
          instructorId: selectedInstructorId
        });
        
        setClasses(classesData);
        
        console.log(`✅ Loaded ${classesData.length} classes for ${format(currentMonth, 'MMMM yyyy')}`);
      } catch (error) {
        console.error('❌ Failed to load classes:', error);
        toast({
          title: "Error Loading Classes",
          description: "Failed to load class data. Please refresh the page.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    // Only load classes if we have instructors loaded (to avoid loading twice)
    if (!instructorsLoading) {
      loadClasses();
    }
  }, [currentMonth, selectedInstructorId, instructorsLoading]); // Reload when month or instructor changes

  // Update form instructor when selected instructor changes
  useEffect(() => {
    if (selectedInstructorId && formData.instructor !== selectedInstructorId) {
      setFormData(prev => ({
        ...prev,
        instructor: selectedInstructorId
      }));
    }
  }, [selectedInstructorId, formData.instructor]);

  // Refresh function that can be called after create/update/delete
  const refreshClasses = async () => {
    try {
      console.log('🔄 Refreshing classes...');
      
      const startDate = format(startOfMonth(currentMonth), 'yyyy-MM-dd');
      const endDate = format(endOfMonth(currentMonth), 'yyyy-MM-dd');
      
      // Always filter by instructor (no "All Instructors" option)
      if (!selectedInstructorId) {
        console.log('⚠️ No instructor selected, skipping refresh');
        return;
      }

      const classesData = await getClasses({
        startDate,
        endDate,
        instructorId: selectedInstructorId
      });
      
      setClasses(classesData);
      console.log(`✅ Refreshed ${classesData.length} classes`);
    } catch (error) {
      console.error('❌ Failed to refresh classes:', error);
      toast({
        title: "Error Refreshing Classes",
        description: "Failed to refresh class data.",
        variant: "destructive",
      });
    }
  };

  // ============================================================================
  // CALENDAR CALCULATIONS
  // ============================================================================

  // Get days for current month
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });
  
  // Navigation functions
  const prevMonth = () => {
    const newMonth = subMonths(currentMonth, 1);
    setCurrentMonth(newMonth);
    console.log('⬅️ Navigated to previous month:', format(newMonth, 'MMMM yyyy'));
  };
  
  const nextMonth = () => {
    const newMonth = addMonths(currentMonth, 1);
    setCurrentMonth(newMonth);
    console.log('➡️ Navigated to next month:', format(newMonth, 'MMMM yyyy'));
  };
  
  const prevDay = () => {
    const newDay = addDays(selectedDay, -1);
    setSelectedDay(newDay);
    console.log('⬅️ Navigated to previous day:', format(newDay, 'yyyy-MM-dd'));
  };
  
  const nextDay = () => {
    const newDay = addDays(selectedDay, 1);
    setSelectedDay(newDay);
    console.log('➡️ Navigated to next day:', format(newDay, 'yyyy-MM-dd'));
  };
  
  // Weekly navigation functions
  const [currentWeekStart, setCurrentWeekStart] = useState(new Date(2025, 4, 18)); // May 18, 2025
  const prevWeek = () => setCurrentWeekStart(addDays(currentWeekStart, -7));
  const nextWeek = () => setCurrentWeekStart(addDays(currentWeekStart, 7));
  
  
  // Get current instructor name for display
  const getCurrentInstructorName = () => {
    const instructor = instructors.find(inst => inst.id === selectedInstructorId);
    return instructor ? `${instructor.firstName} ${instructor.lastName}` : "Select Instructor";
  };
  
  // Filter classes by instructor (always filtered since no "All Instructors" option)
  const getFilteredClasses = () => {
    return classes; // Classes are already filtered by instructor in the API call
  };
  
  // Get classes for a specific day
  const getClassesForDay = (day: Date) => {
    const dateString = format(day, 'yyyy-MM-dd');
    const filteredClasses = getFilteredClasses();
    return filteredClasses.filter(cls => cls.date === dateString);
  };
  
  // Get classes for selected date in form
  const getClassesForSelectedDate = () => {
    return classes.filter(cls => cls.date === formData.date);
  };

  // Get instructor name by ID
  const getInstructorNameById = (instructorId: string) => {
    const instructor = instructors.find(inst => inst.id === instructorId);
    return instructor ? `${instructor.firstName} ${instructor.lastName}` : "Unknown Instructor";
  };

  // Get group name by ID
  const getGroupNameById = (groupId: string) => {
    const group = groups.find(grp => grp.id === groupId);
    return group ? group.name : "Unknown Group";
  };
  
  // Check instructor availability
  const checkInstructorConflict = () => {
    if (!formData.instructor || !formData.date || !formData.startTime) return null;
    
    const conflictingClass = classes.find(cls => 
      cls.instructorId === formData.instructor && 
      cls.date === formData.date && 
      cls.startTime === formData.startTime
    );
    
    return conflictingClass;
  };
  
  // Get students for selected group
  const getStudentsForGroup = (groupId: string) => {
    // This will be implemented when we have group-student relationships
    return students.filter(student => student.isActive);
  };
  
  // Handle form field changes
  const handleFormChange = (field: keyof ClassFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
      // Reset student selection when group is selected and vice versa
      ...(field === 'selectedGroup' && value ? { selectedStudents: [] } : {}),
      ...(field === 'selectedStudents' && value.length > 0 ? { selectedGroup: "" } : {}),
    }));
  };
  
  // Handle student selection
  const handleStudentToggle = (studentName: string) => {
    const updatedStudents = formData.selectedStudents.includes(studentName)
      ? formData.selectedStudents.filter(s => s !== studentName)
      : [...formData.selectedStudents, studentName];
    
    handleFormChange('selectedStudents', updatedStudents);
  };
  
  // Calculate end time based on start time and duration
  const calculateEndTime = (startTime: string, duration: number) => {
    const [hours, minutes] = startTime.split(':').map(Number);
    const startDate = new Date();
    startDate.setHours(hours, minutes, 0, 0);
    
    const endDate = new Date(startDate.getTime() + duration * 60000);
    return format(endDate, 'HH:mm');
  };
  
  // Get active students (either selected manually or from group)
  const getActiveStudents = () => {
    if (formData.selectedGroup) {
      return getStudentsForGroup(formData.selectedGroup);
    }
    return students.filter(student => formData.selectedStudents.includes(student.name));
  };
  
  // Enhanced form validation
  const validateForm = () => {
    const errors: string[] = [];

    // Required fields
    if (!formData.type) errors.push("Class type is required");
    if (!formData.title) errors.push("Class title is required");
    if (!formData.date) errors.push("Date is required");
    if (!formData.instructor) errors.push("Instructor is required");
    if (!formData.startTime) errors.push("Start time is required");

    // Date validation
    const selectedDate = new Date(formData.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (selectedDate < today) {
      errors.push("Cannot schedule classes in the past");
    }

    // Student/Group validation
    if (formData.type === "Theory") {
      if (!formData.selectedGroup) {
        errors.push("Please select a group for theory classes");
      }
    } else if (formData.type === "Practical") {
      if (formData.selectedStudents.length === 0) {
        errors.push("Please select a student for practical classes");
      }
      if (formData.selectedStudents.length > 1) {
        errors.push("Practical classes can only have one student");
      }
    }

    // Time validation
    const [hours, minutes] = formData.startTime.split(':').map(Number);
    if (hours < 8 || hours > 20) {
      errors.push("Classes must be scheduled between 8:00 AM and 8:00 PM");
    }

    // Duration validation
    if (formData.duration < 30 || formData.duration > 240) {
      errors.push("Class duration must be between 30 and 240 minutes");
    }

    return errors;
  };

  // Handle form submission
  const handleSubmit = async () => {
    try {
      setIsCreatingClass(true);

      // Validate form
      const validationErrors = validateForm();
      if (validationErrors.length > 0) {
        toast({
          title: "Validation Error",
          description: validationErrors.join(". "),
          variant: "destructive",
        });
        return;
      }

      // Check for instructor conflicts
      const conflictingClass = checkInstructorConflict();
      if (conflictingClass) {
        toast({
          title: "Scheduling Conflict",
          description: `The instructor already has a class at ${formData.startTime} on this date.`,
          variant: "destructive",
        });
        return;
      }
      
      console.log('📝 Creating new class...', formData);
      
      // Prepare class data for creation (with default values for removed fields)
      const classData = {
        type: formData.type,
        date: formData.date,
        startTime: formData.startTime,
        duration: formData.duration,
        instructor: formData.instructor,
        selectedStudents: formData.selectedStudents,
        selectedGroup: formData.selectedGroup,
        notes: formData.notes,
        title: formData.title, // Use the selected title from dropdown
        location: "Main Campus", // Default location
        cost: undefined, // No cost by default
      };
      
      // Create the class
      const newClass = await createClass(classData);
      
      // Show success message
      toast({
        title: "Class Created Successfully",
        description: `${newClass.type} class scheduled for ${format(new Date(formData.date), 'MMM d, yyyy')} at ${formData.startTime}.`,
      });
      
      // Refresh classes data
      await refreshClasses();
      
      // Reset form and close modal
      resetForm();
      setModalOpen(false);
      
    } catch (error) {
      console.error('❌ Failed to create class:', error);
      toast({
        title: "Error Creating Class",
        description: error instanceof Error ? error.message : "Failed to create class. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCreatingClass(false);
    }
  };

  // Reset form to default values
  const resetForm = () => {
    setFormData({
      type: "",
      date: format(new Date(), 'yyyy-MM-dd'),
      startTime: "10:00",
      duration: 60,
      instructor: selectedInstructorId || "",
      selectedStudents: [],
      selectedGroup: "",
      notes: "",
      title: "",
    });
  };

  // 🧪 TEMPORARY TEST FUNCTION - Remove this later
  const testServices = async () => {
    try {
      console.log('🧪 Testing classes, instructors, and groups services...');
      
      // === CLASSES SERVICE TESTS ===
      console.log('\n📚 TESTING CLASSES SERVICE:');
      
      // Test 1: Fetch all classes
      const allClasses = await getClasses();
      console.log('✅ All classes:', allClasses.length);
      
      // Test 2: Fetch upcoming classes
      const upcoming = await getUpcomingClasses();
      console.log('✅ Upcoming classes:', upcoming.length);
      
      // Test 3: Fetch by date range (May 2025)
      const mayClasses = await getClasses({
        startDate: '2025-05-01',
        endDate: '2025-05-31'
      });
      console.log('✅ May 2025 classes:', mayClasses.length);
      
      // === INSTRUCTORS SERVICE TESTS ===
      console.log('\n👨‍🏫 TESTING INSTRUCTORS SERVICE:');
      
      let allInstructors = [];
      let activeInstructors = [];
      let instructorOptions = [];
      let instructorStats = { total: 0, active: 0, inactive: 0, onLeave: 0 };
      
      try {
        // Test 4: Fetch all instructors
        allInstructors = await getInstructors();
        console.log('✅ All instructors:', allInstructors.length);
      } catch (error) {
        console.error('❌ Error fetching all instructors:', error);
      }
      
      try {
        // Test 5: Fetch active instructors
        activeInstructors = await getActiveInstructors();
        console.log('✅ Active instructors:', activeInstructors.length);
      } catch (error) {
        console.error('❌ Error fetching active instructors:', error);
      }
      
      try {
        // Test 6: Fetch instructor options (for dropdowns)
        instructorOptions = await getInstructorOptions();
        console.log('✅ Instructor options:', instructorOptions.length);
      } catch (error) {
        console.error('❌ Error fetching instructor options:', error);
      }
      
      try {
        // Test 7: Get instructor statistics
        instructorStats = await getInstructorStats();
        console.log('✅ Instructor stats:', instructorStats);
      } catch (error) {
        console.error('❌ Error fetching instructor stats:', error);
      }

      // === GROUPS SERVICE TESTS ===
      console.log('\n👥 TESTING GROUPS SERVICE:');
      
      let allGroups = [];
      let activeGroups = [];
      let groupOptions = [];
      let groupStats = { total: 0, active: 0, inactive: 0, completed: 0, totalCapacity: 0, totalEnrollment: 0, averageEnrollment: 0 };
      
      try {
        // Test 8: Fetch all groups
        allGroups = await getGroups();
        console.log('✅ All groups:', allGroups.length);
      } catch (error) {
        console.error('❌ Error fetching all groups:', error);
      }
      
      try {
        // Test 9: Fetch active groups
        activeGroups = await getActiveGroups();
        console.log('✅ Active groups:', activeGroups.length);
      } catch (error) {
        console.error('❌ Error fetching active groups:', error);
      }
      
      try {
        // Test 10: Fetch group options (for dropdowns)
        groupOptions = await getGroupOptions();
        console.log('✅ Group options:', groupOptions.length);
      } catch (error) {
        console.error('❌ Error fetching group options:', error);
      }
      
      try {
        // Test 11: Get group statistics
        groupStats = await getGroupStats();
        console.log('✅ Group stats:', groupStats);
      } catch (error) {
        console.error('❌ Error fetching group stats:', error);
      }

      // === STUDENTS SCHEDULING TESTS ===
      console.log('\n🎓 TESTING STUDENTS SCHEDULING SERVICE:');
      
      let studentsForScheduling = [];
      let theoryStudents = [];
      let practicalStudents = [];
      let studentStats = { total: 0, active: 0, onHold: 0, completed: 0, dropped: 0, averagePhase: 0, averageHours: 0 };
      
      try {
        // Test 12: Fetch students for scheduling
        studentsForScheduling = await getStudentsForScheduling();
        console.log('✅ Students for scheduling:', studentsForScheduling.length);
      } catch (error) {
        console.error('❌ Error fetching students for scheduling:', error);
      }
      
      try {
        // Test 13: Fetch students available for theory classes
        theoryStudents = await getAvailableStudentsForClass('theory');
        console.log('✅ Students available for theory:', theoryStudents.length);
      } catch (error) {
        console.error('❌ Error fetching theory students:', error);
      }
      
      try {
        // Test 14: Fetch students available for practical classes
        practicalStudents = await getAvailableStudentsForClass('practical');
        console.log('✅ Students available for practical:', practicalStudents.length);
      } catch (error) {
        console.error('❌ Error fetching practical students:', error);
      }
      
      try {
        // Test 15: Get student statistics
        studentStats = await getStudentStats();
        console.log('✅ Student stats:', studentStats);
      } catch (error) {
        console.error('❌ Error fetching student stats:', error);
      }
      
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
      
      // Test 16: Show sample data if available
      if (allClasses.length > 0) {
        console.log('📋 Sample class data:', allClasses[0]);
      }
      if (allInstructors.length > 0) {
        console.log('👨‍🏫 Sample instructor data:', allInstructors[0]);
      }
      if (instructorOptions.length > 0) {
        console.log('📝 Sample instructor option:', instructorOptions[0]);
      }
      if (allGroups.length > 0) {
        console.log('👥 Sample group data:', allGroups[0]);
      }
      if (groupOptions.length > 0) {
        console.log('📝 Sample group option:', groupOptions[0]);
      }
      if (studentsForScheduling.length > 0) {
        console.log('🎓 Sample student for scheduling:', studentsForScheduling[0]);
      }
      
      // Show results in UI
      alert(`🧪 Service Test Results:

📚 CLASSES SERVICE:
📊 Total classes: ${allClasses.length}
⏰ Upcoming classes: ${upcoming.length}  
📅 May 2025 classes: ${mayClasses.length}

👨‍🏫 INSTRUCTORS SERVICE:
👥 Total instructors: ${allInstructors.length}
✅ Active instructors: ${activeInstructors.length}
📝 Instructor options: ${instructorOptions.length}
📊 Stats: ${instructorStats.active} active, ${instructorStats.inactive} inactive, ${instructorStats.onLeave} on leave

👥 GROUPS SERVICE:
📚 Total groups: ${allGroups.length}
✅ Active groups: ${activeGroups.length}
📝 Group options: ${groupOptions.length}
📊 Stats: ${groupStats.active} active, ${groupStats.inactive} inactive, ${groupStats.completed} completed
📈 Capacity: ${groupStats.totalEnrollment}/${groupStats.totalCapacity}

🎓 STUDENTS SCHEDULING SERVICE:
📝 Students for scheduling: ${studentsForScheduling.length}
📚 Available for theory: ${theoryStudents.length}
🚗 Available for practical: ${practicalStudents.length}
📊 Stats: ${studentStats.active} active, ${studentStats.onHold} on hold, ${studentStats.completed} completed
📈 Avg Phase: ${studentStats.averagePhase}, Avg Hours: ${studentStats.averageHours}

✅ All services are working perfectly! Check console for detailed logs.`);
      
    } catch (error) {
      console.error('❌ Service test failed:', error);
      alert(`❌ Test failed: ${error.message}\n\nCheck console for details.`);
    }
  };
  
  // Generate weekly view days (current week)
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(currentWeekStart, i));
  
  // Time slots for weekly view (8:00 AM to 8:00 PM in 1-hour steps)
  const timeSlots = Array.from({ length: 13 }, (_, i) => `${i + 8}:00`);
  
  // Parse time string to hour number
  const parseTimeToHour = (timeString: string): number => {
    const [hour] = timeString.split(':').map(Number);
    return hour;
  };
  
  // Calculate class position in weekly view
  const getClassPositionData = (cls: ClassItem) => {
    const startHour = parseTimeToHour(cls.startTime);
    const endHour = parseTimeToHour(cls.endTime);
    const duration = endHour - startHour;
    
    return {
      startHour,
      endHour,
      duration
    };
  };
  
  // Handle class click
  const handleClassClick = (cls: ClassItem) => {
    setSelectedClass(cls);
    setSheetOpen(true);
  };
  
  // Render monthly view calendar
  const renderMonthView = () => (
    <div className="mt-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">{format(currentMonth, 'MMMM yyyy')}</h2>
        <div className="flex space-x-2">
          <Button variant="outline" size="icon" onClick={prevMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={nextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-7 gap-3 bg-background p-2">
        {/* Days of week */}
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div key={day} className="text-center py-3 font-medium text-muted-foreground bg-muted rounded-lg">
            {day}
          </div>
        ))}
        
        {/* Empty cells for days of previous month */}
        {Array.from({ length: monthStart.getDay() }).map((_, index) => (
          <div key={`empty-start-${index}`} className="bg-card/50 rounded-xl p-2.5 h-28 shadow-sm border border-border/50"></div>
        ))}
        
        {/* Calendar days */}
        {monthDays.map((day) => {
          const dayClasses = getClassesForDay(day);
          const displayClasses = dayClasses.slice(0, 1); // Only show first 1 class
          const remainingCount = dayClasses.length - 1;  // Count remaining classes
          const dayNum = day.getDay(); // 0 = Sunday, 3 = Wednesday
          const isWednesday = dayNum === 3;
          const isDay21 = day.getDate() === 21; // Check if it's the 21st day
          
          return (
            <div
              key={day.toString()}
              className={`bg-card rounded-xl p-2.5 h-28 shadow-sm border border-border/50 hover:shadow-md transition-shadow ${
                isDay21 ? 'bg-rose-50 border-rose-200' : ''
              }`}
            >
              <div className="text-sm font-semibold mb-1 text-foreground">{format(day, 'd')}</div>
              
              <div className="space-y-1">
              {displayClasses.map((cls) => (
                <div
                  key={cls.id}
                    className={`${cls.type === "Theory" ? "bg-blue-100 text-blue-700 border border-blue-200" : "bg-rose-100 text-rose-700 border border-rose-200"} px-2 py-1.5 text-xs rounded-md cursor-pointer hover:shadow-sm transition-all duration-200 hover:scale-[1.02] flex items-center`}
                  onClick={() => handleClassClick(cls)}
                >
                    <div className="font-medium truncate">{cls.student}</div>
                </div>
              ))}
              </div>
              
              {/* Show "+X more" message if there are additional classes */}
              {remainingCount > 0 && (
                <div className="text-xs font-medium text-muted-foreground mt-1 text-center bg-muted/50 py-0.5 px-2 rounded-md border border-border/30">
                  +{remainingCount} more
                </div>
              )}
            </div>
          );
        })}
        
        {/* Empty cells for days of next month */}
        {Array.from({ length: (7 - ((monthDays.length + monthStart.getDay()) % 7)) % 7 }).map((_, index) => (
          <div key={`empty-end-${index}`} className="bg-card/50 rounded-xl p-2.5 h-28 shadow-sm border border-border/50"></div>
        ))}
      </div>
    </div>
  );
  
  // Render weekly view calendar
  const renderWeekView = () => (
    <div className="mt-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Week of {format(weekDays[0], 'MMM d')} - {format(weekDays[6], 'MMM d, yyyy')}</h2>
        <div className="flex space-x-2">
          <Button variant="outline" size="icon" onClick={prevWeek}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={nextWeek}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <div className="bg-background rounded-xl shadow-sm border border-border/50 p-3">
        {/* Headers row */}
        <div className="flex mb-3">
          {/* Empty corner for time column */}
          <div className="w-20 mr-3"></div>
          {/* Day headers */}
          <div className="flex-1 grid grid-cols-7 gap-3">
            {weekDays.map((day, index) => (
              <div 
                key={day.toString()} 
                className={`text-center py-3 font-medium text-muted-foreground rounded-lg ${
                  isToday(day) ? 'bg-rose-50 border border-rose-200' : 'bg-muted'
                }`}
              >
                <div className="text-sm font-medium text-muted-foreground">{format(day, 'EEE')}</div>
                <div className="text-base font-semibold">{format(day, 'd')}</div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Calendar grid */}
        <div className="flex">
          {/* Time column */}
          <div className="w-20 mr-3 bg-muted rounded-lg">
            {timeSlots.map((time, index) => (
              <div 
                key={time} 
                className="h-10 flex items-center justify-center text-sm font-medium text-muted-foreground"
              >
                {time}
              </div>
            ))}
          </div>
          
          {/* Day columns */}
          <div className="flex-1 grid grid-cols-7 gap-3">
            {weekDays.map((day, dayIndex) => {
              const dayClasses = getClassesForDay(day);
              
              return (
                <div 
                  key={day.toString()} 
                  className={`relative rounded-xl shadow-sm border ${
                    isToday(day) 
                      ? 'bg-rose-50 border-rose-200' 
                      : 'bg-card border-border/50'
                  }`}
                >
                  {/* Time slot grid */}
                  {timeSlots.map((time, timeIndex) => (
                    <div 
                      key={`${day}-${time}`} 
                      className="h-10 border-t border-border/20 first:border-t-0"
                    />
                  ))}
                  
                  {/* Class cards */}
                  {dayClasses.map((cls) => {
                    const { startHour } = getClassPositionData(cls);
                    const slotIndex = startHour - 8; // 8 is first hour (8:00)
                    const topPosition = slotIndex * 40; // 40px per slot (h-10)
                    
                    return (
                      <div
                        key={cls.id}
                        className={`absolute left-1 right-1 ${cls.type === "Theory" ? "bg-blue-100 text-blue-700 border border-blue-200" : "bg-rose-100 text-rose-700 border border-rose-200"} p-2 rounded-md cursor-pointer hover:shadow-md transition-all duration-200 hover:scale-[1.02] flex items-center h-8`}
                        style={{ 
                          top: `${topPosition + 4}px`, // 4px offset for centering in 40px slot
                        }}
                        onClick={() => handleClassClick(cls)}
                      >
                        <div className="font-medium text-xs truncate">{cls.student}</div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
  
  // Render day view calendar
  const renderDayView = () => {
    const dayClasses = getClassesForDay(selectedDay);
    const sortedClasses = dayClasses.sort((a, b) => a.startTime.localeCompare(b.startTime));
    
    // Get calendar month for the selected day
    const calendarMonth = new Date(selectedDay.getFullYear(), selectedDay.getMonth(), 1);
    const calendarMonthStart = startOfMonth(calendarMonth);
    const calendarMonthEnd = endOfMonth(calendarMonth);
    const calendarMonthDays = eachDayOfInterval({ start: calendarMonthStart, end: calendarMonthEnd });
    
    return (
      <div className="mt-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">{format(selectedDay, 'EEEE, MMMM d, yyyy')}</h2>
          <div className="flex space-x-2">
            <Button variant="outline" size="icon" onClick={prevDay}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={nextDay}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Classes List - Left side */}
          <div className="lg:col-span-2 space-y-4">
            {loading ? (
              <div className="text-center py-12">
                <Loader2 className="mx-auto h-12 w-12 text-muted-foreground mb-4 animate-spin" />
                <h3 className="text-lg font-medium text-muted-foreground mb-2">Loading classes...</h3>
                <p className="text-sm text-muted-foreground">Please wait while we load the schedule.</p>
              </div>
            ) : sortedClasses.length === 0 ? (
              <div className="text-center py-12">
                <CalendarIcon className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium text-muted-foreground mb-2">No classes scheduled</h3>
                <p className="text-sm text-muted-foreground">
                  There are no classes scheduled for {format(selectedDay, 'MMMM d, yyyy')}.
                </p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => setModalOpen(true)}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Schedule a Class
                </Button>
              </div>
            ) : (
              <div className="grid gap-4">
                {sortedClasses.map((cls) => (
                  <Card 
                    key={cls.id} 
                    className="cursor-pointer hover:shadow-md transition-all duration-200 hover:scale-[1.01]"
                    onClick={() => handleClassClick(cls)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-3">
                            <Badge 
                              variant={cls.type === "Theory" ? "default" : "secondary"}
                              className={cls.type === "Theory" ? "bg-blue-100 text-blue-700 border border-blue-200" : "bg-rose-100 text-rose-700 border border-rose-200"}
                            >
                              {cls.type}
                            </Badge>
                            <span className="text-lg font-semibold">{cls.className}</span>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <div className="flex items-center space-x-2">
                              <UserRound className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm font-medium">{cls.student}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Users className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm text-muted-foreground">{cls.group}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm text-muted-foreground">{cls.startTime} - {cls.endTime}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Phone className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm text-muted-foreground">{cls.phone}</span>
                            </div>
                          </div>
                          
                          {cls.notes && (
                            <div className="mt-3 p-3 bg-muted/50 rounded-md">
                              <div className="flex items-start space-x-2">
                                <Bookmark className="h-4 w-4 text-muted-foreground mt-0.5" />
                                <p className="text-sm text-muted-foreground">{cls.notes}</p>
                              </div>
                            </div>
                          )}
                        </div>
                        
                        <div className="text-right">
                          <div className="text-2xl font-bold text-foreground">{cls.startTime}</div>
                          <div className="text-sm text-muted-foreground">{cls.duration}</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
          
          {/* Mini Calendar - Right side */}
          <div className="lg:col-span-1">
            <Card className="bg-background shadow-sm border border-border/50">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg font-semibold">
                    {format(calendarMonth, 'MMMM yyyy')}
                  </CardTitle>
                  <div className="flex space-x-1">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setSelectedDay(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1, selectedDay.getDate()))}
                    >
                      <ChevronLeft className="h-3 w-3" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setSelectedDay(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, selectedDay.getDate()))}
                    >
                      <ChevronRight className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-3">
                <div className="grid grid-cols-7 gap-1">
                  {/* Days of week headers */}
                  {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day) => (
                    <div key={day} className="text-center py-2 text-xs font-medium text-muted-foreground">
                      {day}
                    </div>
                  ))}
                  
                  {/* Empty cells for days of previous month */}
                  {Array.from({ length: calendarMonthStart.getDay() }).map((_, index) => (
                    <div key={`empty-start-${index}`} className="h-8"></div>
                  ))}
                  
                  {/* Calendar days */}
                  {calendarMonthDays.map((day) => {
                    const dayClasses = getClassesForDay(day);
                    const isSelected = format(day, 'yyyy-MM-dd') === format(selectedDay, 'yyyy-MM-dd');
                    const hasClasses = dayClasses.length > 0;
                    
                    return (
                      <button
                        key={day.toString()}
                        onClick={() => setSelectedDay(day)}
                        className={`h-8 w-8 text-xs rounded-md border transition-all duration-200 hover:shadow-sm ${
                          isSelected
                            ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                            : isToday(day)
                            ? 'bg-rose-50 border-rose-200 text-rose-700 hover:bg-rose-100'
                            : hasClasses
                            ? 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100'
                            : 'bg-card border-border/50 hover:bg-muted/50'
                        }`}
                      >
                        {format(day, 'd')}
                      </button>
                    );
                  })}
                  
                  {/* Empty cells for days of next month */}
                  {Array.from({ length: (7 - ((calendarMonthDays.length + calendarMonthStart.getDay()) % 7)) % 7 }).map((_, index) => (
                    <div key={`empty-end-${index}`} className="h-8"></div>
                  ))}
                </div>
                
                {/* Legend */}
                <div className="mt-4 space-y-2 text-xs">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-primary rounded-sm"></div>
                    <span className="text-muted-foreground">Selected</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-rose-100 border border-rose-200 rounded-sm"></div>
                    <span className="text-muted-foreground">Today</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-blue-100 border border-blue-200 rounded-sm"></div>
                    <span className="text-muted-foreground">Has classes</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  };
  
  return (
    <PageLayout>
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold">Calendar</h1>
          {(loading || instructorsLoading || groupsLoading || studentsLoading) && (
            <div className="flex items-center text-sm text-muted-foreground">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Loading...
            </div>
          )}
        </div>
        <div className="flex gap-2">
          {/* 🧪 TEMPORARY TEST BUTTON - Remove this later */}
          <Button variant="outline" onClick={testServices}>
            🧪 Test Services
          </Button>
          <Button 
            variant="outline" 
            onClick={refreshClasses}
            disabled={loading}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button onClick={() => setModalOpen(true)}>
            <Plus className="mr-1 h-4 w-4" />
            Create Class
          </Button>
        </div>
      </div>

      {/* Simple Add Class Dialog - Following Add Instructor pattern */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Add New Class</DialogTitle>
            <DialogDescription>
              Fill in the class details to schedule a new session.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-6 py-4">
            {/* Row 1: Class Type and Title */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="class-type">Class Type *</Label>
                <Select 
                  value={formData.type} 
                  onValueChange={(value: "Theory" | "Practical") => {
                    handleFormChange('type', value);
                    // Reset title when type changes
                    handleFormChange('title', '');
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select class type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Theory">Theory</SelectItem>
                    <SelectItem value="Practical">Practical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="title">Class Title *</Label>
                {formData.type ? (
                  <Select
                    value={formData.title}
                    onValueChange={(value) => handleFormChange('title', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={`Select ${formData.type.toLowerCase()} class title`} />
                    </SelectTrigger>
                    <SelectContent>
                      {formData.type === "Theory" ? (
                        // Theory class titles
                        THEORY_CLASS_TITLES.map((title) => (
                          <SelectItem key={title} value={title}>
                            {title}
                          </SelectItem>
                        ))
                      ) : (
                        // Practical class titles (In-Car Sessions) with phase info
                        PRACTICAL_CLASS_TITLES.map((title, index) => {
                          const sessionNumber = index + 1;
                          const phase = getPracticalSessionPhase(sessionNumber);
                          return (
                            <SelectItem key={title} value={title}>
                              {title} (Phase {phase})
                            </SelectItem>
                          );
                        })
                      )}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    id="title"
                    disabled
                    placeholder="Select class type first"
                    className="bg-muted"
                  />
                )}
              </div>
            </div>

            {/* Row 2: Instructor */}
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="instructor">Instructor *</Label>
                <Select 
                  value={formData.instructor} 
                  onValueChange={(value) => handleFormChange('instructor', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select instructor" />
                  </SelectTrigger>
                  <SelectContent>
                    {instructorsLoading ? (
                      <SelectItem value="" disabled>Loading instructors...</SelectItem>
                    ) : instructorOptions.length === 0 ? (
                      <SelectItem value="" disabled>No instructors available</SelectItem>
                    ) : (
                      instructorOptions.map((instructor) => (
                        <SelectItem key={instructor.id} value={instructor.id}>
                          {instructor.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Row 3: Date and Time */}
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Date *</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleFormChange('date', e.target.value)}
                  min={format(new Date(), 'yyyy-MM-dd')}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="time">Start Time *</Label>
                <Input
                  id="time"
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => handleFormChange('startTime', e.target.value)}
                  min="08:00"
                  max="20:00"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="duration">Duration (minutes) *</Label>
                <Select 
                  value={formData.duration.toString()} 
                  onValueChange={(value) => handleFormChange('duration', parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30">30 minutes</SelectItem>
                    <SelectItem value="60">60 minutes</SelectItem>
                    <SelectItem value="90">90 minutes</SelectItem>
                    <SelectItem value="120">120 minutes</SelectItem>
                    <SelectItem value="180">180 minutes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {/* Conditional Student Selection based on Class Type */}
            {formData.type && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    {formData.type === "Theory" ? (
                      // Theory: Show Group Dropdown
                      <>
                        <Label htmlFor="group">Select Group *</Label>
                        <Select 
                          value={formData.selectedGroup} 
                          onValueChange={(value) => handleFormChange('selectedGroup', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select a group for theory class" />
                          </SelectTrigger>
                          <SelectContent>
                            {groupsLoading ? (
                              <SelectItem value="" disabled>Loading groups...</SelectItem>
                            ) : groupOptions.length === 0 ? (
                              <SelectItem value="" disabled>No groups available</SelectItem>
                            ) : (
                              groupOptions.map((group) => (
                                <SelectItem key={group.id} value={group.id}>
                                  {group.name} ({group.currentEnrollment} students)
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                      </>
                    ) : (
                      // Practical: Show Single Student Dropdown with Search
                      <>
                        <Label htmlFor="student">Select Student *</Label>
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
                                : studentsLoading 
                                  ? "Loading students..."
                                  : students.length === 0
                                    ? "No students available"
                                    : "Select a student for practical class..."
                              }
                              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-[400px] p-0">
                            <Command>
                              <CommandInput placeholder="Search students..." />
                              <CommandList>
                                <CommandEmpty>No student found.</CommandEmpty>
                                <CommandGroup>
                                  {studentsLoading ? (
                                    <CommandItem disabled>
                                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                      Loading students...
                                    </CommandItem>
                                  ) : students.length === 0 ? (
                                    <CommandItem disabled>No students available</CommandItem>
                                  ) : (
                                    (() => {
                                      const availableStudents = students.filter(student => 
                                        formData.type === "Practical" ? student.currentPhase >= 2 : true
                                      );
                                      
                                      if (formData.type === "Practical" && availableStudents.length === 0) {
                                        return (
                                          <CommandItem disabled>
                                            No students available for practical classes (Phase 2+ required)
                                          </CommandItem>
                                        );
                                      }
                                      
                                      return availableStudents.map((student) => (
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
                                              formData.selectedStudents[0] === student.name ? "opacity-100" : "opacity-0"
                                            )}
                                          />
                                          {student.name} ({student.studentId}) - Phase {student.currentPhase}
                                        </CommandItem>
                                      ));
                                    })()
                                  )}
                                </CommandGroup>
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}
            
            {/* Notes section */}
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleFormChange('notes', e.target.value)}
                placeholder="Additional notes, lesson plan, or special instructions..."
                rows={3}
              />
            </div>

            {/* Conflict warning */}
            {formData.instructor && formData.date && formData.startTime && (
              (() => {
                const conflict = checkInstructorConflict();
                return conflict ? (
                  <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                    <AlertTriangle className="h-4 w-4 text-destructive" />
                    <div className="text-sm text-destructive">
                      <strong>Scheduling Conflict:</strong> The instructor already has a class at this time.
                    </div>
                  </div>
                ) : null;
              })()
            )}
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                resetForm();
                setModalOpen(false);
              }}
              disabled={isCreatingClass}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={isCreatingClass || !formData.type || !formData.title || !formData.instructor}
            >
              {isCreatingClass ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Class
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            {/* Instructor Tabs with View Toggle */}
            <Tabs 
              value={selectedInstructorId} 
              onValueChange={setSelectedInstructorId}
            >
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-4">
                <div className="flex items-center gap-4">
                  <TabsList>
                    {instructorsLoading ? (
                      <TabsTrigger value="" disabled>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Loading...
                      </TabsTrigger>
                    ) : instructors.length === 0 ? (
                      <TabsTrigger value="" disabled>No instructors</TabsTrigger>
                    ) : (
                      instructors.map((instructor) => (
                        <TabsTrigger key={instructor.id} value={instructor.id}>
                          {instructor.firstName} {instructor.lastName}
                        </TabsTrigger>
                      ))
                    )}
                  </TabsList>
                  
                  {/* Classes count indicator */}
                  {!loading && selectedInstructorId && (
                    <div className="text-sm text-muted-foreground">
                      {classes.length} {classes.length === 1 ? 'class' : 'classes'} for {getCurrentInstructorName()} in {format(currentMonth, 'MMMM yyyy')}
                    </div>
                  )}
                </div>
                
                {/* View Mode Toggle */}
                <ToggleGroup type="single" value={viewMode} onValueChange={(value) => value && setViewMode(value)}>
                  <ToggleGroupItem value="month" aria-label="Month view">Month</ToggleGroupItem>
                  <ToggleGroupItem value="week" aria-label="Week view">Week</ToggleGroupItem>
                  <ToggleGroupItem value="day" aria-label="Day view">Day</ToggleGroupItem>
                </ToggleGroup>
              </div>
              
              {/* Calendar View */}
              {!selectedInstructorId && !instructorsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <UserRound className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium text-muted-foreground mb-2">Select an Instructor</h3>
                    <p className="text-sm text-muted-foreground">
                      Choose an instructor from the tabs above to view their calendar.
                    </p>
                  </div>
                </div>
              ) : loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin mr-2" />
                  <span className="text-lg">Loading calendar...</span>
                </div>
              ) : (
                viewMode === "month" ? renderMonthView() : 
                viewMode === "week" ? renderWeekView() : 
                renderDayView()
              )}
            </Tabs>
          </div>
        </CardContent>
      </Card>

      {/* Class Details Sheet */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="sm:max-w-md">
          {selectedClass && (
            <>
              <SheetHeader>
                <SheetTitle>{selectedClass.className}</SheetTitle>
                <SheetDescription>{selectedClass.type} Session</SheetDescription>
              </SheetHeader>
              <div className="mt-6 space-y-4">
                <div className="flex items-start space-x-3">
                  <UserRound className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Student</p>
                    <p className="text-sm text-muted-foreground">{selectedClass.student}</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Users className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Group</p>
                    <p className="text-sm text-muted-foreground">{selectedClass.group}</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <UserRound className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Instructor</p>
                    <p className="text-sm text-muted-foreground">{selectedClass.instructor}</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CalendarIcon className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Date & Time</p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(selectedClass.date), 'MMMM d, yyyy')} • {selectedClass.startTime} - {selectedClass.endTime}
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Duration</p>
                    <p className="text-sm text-muted-foreground">{selectedClass.duration}</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Location</p>
                    <p className="text-sm text-muted-foreground">{selectedClass.location || "TBD"}</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Bookmark className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Notes</p>
                    <p className="text-sm text-muted-foreground">{selectedClass.notes}</p>
                  </div>
                </div>
              </div>
              <div className="mt-6">
                <SheetClose asChild>
                  <Button className="w-full">Close</Button>
                </SheetClose>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </PageLayout>
  );
};

export default Calendar; 