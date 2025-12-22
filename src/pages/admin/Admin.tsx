import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Activity, Calendar, FileText, LogOut, Plus, Receipt, UserRound, Users, Clock, Medal, Settings, Check, ChevronsUpDown, UsersRound, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sidebar, SidebarProvider, SidebarContent, SidebarHeader, SidebarFooter, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarGroupLabel, SidebarGroup } from "@/components/ui/sidebar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import { PageLayout } from "@/components/ui/page-layout";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import StudentsSection from "./Students";
import SettingsSection from "./Settings";
import CalendarView from "./Calendar";
import AgendaView from "./Agenda";
import ActivityLogsSection from "./ActivityLogs";
import InstructorsSection from "./Instructors";
import GroupsSection from "./Groups";
import ReceiptsSection from "./Receipts";
import CertificatesSection from "./Certificates";
import StudentProfile from "./StudentProfile";
import CreateStudent from "./CreateStudent";

// Import services for real data
import { getInstructorOptions, InstructorOption } from "@/services/instructors";
import { getGroupOptions, GroupOption } from "@/services/groups";
import { getStudentsForScheduling, StudentOption, getStudentStats } from "@/services/students";
import { createClass, getClasses, getUpcomingClasses, ClassFormData, ClassItem } from "@/services/classes";
import { getActivityLogs, ActivityLog } from "@/services/activityLogs";
import { addDays, startOfWeek, endOfWeek, isToday, isTomorrow } from "date-fns";

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

const Admin = () => {
  const {
    role,
    isAuthenticated,
    isLoading,
    logout
  } = useAuth();
  const navigate = useNavigate();

  // All useState hooks must be at the top level
  const [activeSection, setActiveSection] = useState("dashboard");
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [isNewStudent, setIsNewStudent] = useState(false);

  // Class creation modal state
  const [createClassModalOpen, setCreateClassModalOpen] = useState(false);
  const [studentComboboxOpen, setStudentComboboxOpen] = useState(false);
  const [classTitleComboboxOpen, setClassTitleComboboxOpen] = useState(false);
  const [isCreatingClass, setIsCreatingClass] = useState(false);
  const [classFormData, setClassFormData] = useState<ClassFormData>({
    type: "",
    date: format(new Date(), 'yyyy-MM-dd'),
    startTime: "10:00",
    duration: 60,
    instructor: "",
    selectedStudents: [],
    selectedGroup: "",
    notes: "",
    title: "",
    location: "Main Campus",
    cost: undefined,
  });
  
  // Real data state for class creation
  const [instructorOptions, setInstructorOptions] = useState<InstructorOption[]>([]);
  const [groupOptions, setGroupOptions] = useState<GroupOption[]>([]);
  const [studentOptions, setStudentOptions] = useState<StudentOption[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(false);
  
  // Track taken titles for validation
  const [takenTheoryTitles, setTakenTheoryTitles] = useState<string[]>([]);
  const [takenPracticalTitles, setTakenPracticalTitles] = useState<string[]>([]);
  const [titleLoading, setTitleLoading] = useState(false);

  // Dashboard data state
  const [dashboardLoading, setDashboardLoading] = useState(true);
  const [dashboardRefreshKey, setDashboardRefreshKey] = useState(0); // Used to force refresh
  const [studentStats, setStudentStats] = useState<{
    total: number;
    active: number;
    onHold: number;
    completed: number;
    dropped: number;
    averageHours: number;
  }>({ total: 0, active: 0, onHold: 0, completed: 0, dropped: 0, averageHours: 0 });
  const [classesThisWeek, setClassesThisWeek] = useState<number>(0);
  const [totalHoursLogged, setTotalHoursLogged] = useState<number>(0);
  const [recentActivities, setRecentActivities] = useState<ActivityLog[]>([]);
  const [upcomingClasses, setUpcomingClasses] = useState<ClassItem[]>([]);

  // Protect admin route - redirect unauthenticated users
  useEffect(() => {
    if (!isLoading && (!isAuthenticated || role !== 'admin')) {
      console.log('🔄 Admin access denied, redirecting to login');
      navigate("/", { replace: true });
    }
  }, [isAuthenticated, role, isLoading, navigate]);

  // Load data when class creation modal opens
  useEffect(() => {
    if (createClassModalOpen) {
      const loadOptions = async () => {
        setLoadingOptions(true);
        try {
          const [instructors, groups, students] = await Promise.all([
            getInstructorOptions(),
            getGroupOptions(),
            getStudentsForScheduling()
          ]);
          setInstructorOptions(instructors);
          setGroupOptions(groups);
          setStudentOptions(students);
        } catch (error) {
          console.error('Failed to load options:', error);
          toast({
            title: "Error Loading Data",
            description: "Failed to load instructors, groups, or students.",
            variant: "destructive"
          });
        } finally {
          setLoadingOptions(false);
        }
      };
      loadOptions();
    }
  }, [createClassModalOpen]);

  // Load dashboard data when on dashboard section or when refresh key changes
  useEffect(() => {
    if (activeSection !== "dashboard") return;

    const loadDashboardData = async () => {
      setDashboardLoading(true);
      try {
        console.log('🔄 Loading dashboard data...');
        // Load all dashboard data in parallel
        const [stats, activities, upcoming, weekClasses] = await Promise.all([
          getStudentStats(),
          getActivityLogs({ limit: 5 }),
          getUpcomingClasses(),
          // Get classes for this week to count
          getClasses({
            startDate: format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd'),
            endDate: format(endOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd'),
          }),
        ]);

        setStudentStats(stats);
        setRecentActivities(activities);
        setUpcomingClasses(upcoming.slice(0, 5)); // Only show 5 upcoming
        setClassesThisWeek(weekClasses.length);

        // Calculate total hours logged (from completed classes this month)
        const completedClasses = weekClasses.filter(c => c.status === 'completed');
        const totalMinutes = completedClasses.reduce((sum, c) => {
          const durationMatch = c.duration?.match(/(\d+)/);
          return sum + (durationMatch ? parseInt(durationMatch[1]) : 60);
        }, 0);
        setTotalHoursLogged(Math.round(totalMinutes / 60));
        console.log('✅ Dashboard data loaded');

      } catch (error) {
        console.error('Failed to load dashboard data:', error);
        toast({
          title: "Error Loading Dashboard",
          description: "Some dashboard data could not be loaded.",
          variant: "destructive"
        });
      } finally {
        setDashboardLoading(false);
      }
    };

    loadDashboardData();
  }, [activeSection, dashboardRefreshKey]);

  // Load taken titles when group or student changes
  useEffect(() => {
    const loadTakenTitles = async () => {
      if (classFormData.type === "Theory" && classFormData.selectedGroup) {
        setTitleLoading(true);
        try {
          const groupClasses = await getClasses({ groupId: classFormData.selectedGroup });
          const blockedTitles = Array.from(
            new Set(
              groupClasses
                .filter(cls => cls.type === "Theory" && ["completed", "scheduled", "in_progress"].includes(cls.status))
                .map(cls => cls.className.toLowerCase())
            )
          );
          setTakenTheoryTitles(blockedTitles);
        } catch (error) {
          console.error('Failed to check group classes:', error);
          setTakenTheoryTitles([]);
        } finally {
          setTitleLoading(false);
        }
      } else if (classFormData.type === "Practical" && classFormData.selectedStudents.length > 0) {
        setTitleLoading(true);
        try {
          const selectedStudent = studentOptions.find(s => s.name === classFormData.selectedStudents[0]);
          if (selectedStudent) {
            const studentClasses = await getClasses({ studentId: selectedStudent.id });
            const blockedTitles = Array.from(
              new Set(
                studentClasses
                  .filter(cls => cls.type === "Practical" && ["completed", "scheduled", "in_progress"].includes(cls.status))
                  .map(cls => cls.className.toLowerCase())
              )
            );
            setTakenPracticalTitles(blockedTitles);
          }
        } catch (error) {
          console.error('Failed to check student classes:', error);
          setTakenPracticalTitles([]);
        } finally {
          setTitleLoading(false);
        }
      }
    };
    
    if (createClassModalOpen) {
      loadTakenTitles();
    }
  }, [classFormData.type, classFormData.selectedGroup, classFormData.selectedStudents, createClassModalOpen, studentOptions]);

  // Show loading while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  // Don't render admin panel if not authenticated or not admin
  if (!isAuthenticated || role !== 'admin') {
    return null;
  }
  
  const handleLogout = async () => {
    try {
      console.log('🔄 Attempting logout...');
      await logout();
      console.log('✅ Logout successful, redirecting...');
      
    toast({
      title: "Logged out successfully",
        description: "You have been logged out of your admin account.",
      });
      
      // Small delay to show toast before redirect
      setTimeout(() => {
        navigate("/");
      }, 500);
      
    } catch (error) {
      console.error('❌ Logout error:', error);
      toast({
        title: "Logout Error",
        description: "There was an issue logging out. Please try again.",
        variant: "destructive"
    });
    }
  };
  
  const handleAddStudent = () => {
    navigateToCreateStudent();
  };
  
  const handleCreateClass = () => {
    setCreateClassModalOpen(true);
  };
  
  // Function to handle student profile navigation
  const navigateToStudentProfile = (studentId: string, isNewStudentFlag: boolean = false) => {
    setSelectedStudentId(studentId);
    setIsNewStudent(isNewStudentFlag);
    setActiveSection("student-profile");
  };

  // Function to navigate back from student profile
  const navigateBackFromStudentProfile = () => {
    setSelectedStudentId(null);
    setIsNewStudent(false);
    setActiveSection("students");
  };

  // Function to navigate to create student
  const navigateToCreateStudent = () => {
    setActiveSection("create-student");
  };

  // Function to navigate back from create student
  const navigateBackFromCreateStudent = () => {
    setActiveSection("students");
  };

  // Function to handle student creation completion
  const handleStudentCreated = (studentId: string) => {
    setSelectedStudentId(studentId);
    setIsNewStudent(false); // Don't auto-edit since we already have the data
    setActiveSection("student-profile");
  };

  // Class form handling functions
  const handleClassFormChange = (field: keyof ClassFormData, value: any) => {
    setClassFormData(prev => {
      let next: ClassFormData = {
        ...prev,
        [field]: value,
      };

      // Reset related fields when type changes
      if (field === 'type') {
        next = {
          ...next,
          title: "",
          selectedGroup: "",
          selectedStudents: [],
        };
        setTakenTheoryTitles([]);
        setTakenPracticalTitles([]);
      }

      // Reset student selection when group is selected
      if (field === 'selectedGroup') {
        next = {
          ...next,
          selectedStudents: [],
          title: "",
        };
      }

      // Reset group when students selected
      if (field === 'selectedStudents') {
        next = {
          ...next,
          selectedGroup: "",
          title: "",
        };
      }

      return next;
    });
  };

  // Handle student selection for practical classes
  const handleStudentToggle = (studentName: string) => {
    const updatedStudents = classFormData.selectedStudents.includes(studentName)
      ? classFormData.selectedStudents.filter(s => s !== studentName)
      : [...classFormData.selectedStudents, studentName];
    
    handleClassFormChange('selectedStudents', updatedStudents);
  };

  // Reset form helper
  const resetClassForm = () => {
    setClassFormData({
      type: "",
      date: format(new Date(), 'yyyy-MM-dd'),
      startTime: "10:00",
      duration: 60,
      instructor: "",
      selectedStudents: [],
      selectedGroup: "",
      notes: "",
      title: "",
      location: "Main Campus",
      cost: undefined,
    });
    setTakenTheoryTitles([]);
    setTakenPracticalTitles([]);
  };

  // Get available and unavailable titles
  const getClassTitles = () => {
    const titleSource = classFormData.type === "Theory" ? THEORY_CLASS_TITLES : PRACTICAL_CLASS_TITLES;
    const takenSet = new Set(classFormData.type === "Theory" ? takenTheoryTitles : takenPracticalTitles);
    const available = titleSource.filter(t => !takenSet.has(t.toLowerCase()));
    const unavailable = titleSource.filter(t => takenSet.has(t.toLowerCase()));
    return { available, unavailable };
  };

  // Check if title selection is ready
  const isTitleSelectionReady = () => {
    return (classFormData.type === "Theory" && !!classFormData.selectedGroup) ||
           (classFormData.type === "Practical" && classFormData.selectedStudents.length === 1);
  };

  // Handle class form submission
  const handleClassFormSubmit = async () => {
    // Basic validation
    if (!classFormData.type || !classFormData.date || !classFormData.instructor) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    if (!classFormData.title) {
      toast({
        title: "Validation Error",
        description: "Please select a class title",
        variant: "destructive"
      });
      return;
    }
    
    if (classFormData.type === "Theory" && !classFormData.selectedGroup) {
      toast({
        title: "Validation Error", 
        description: "Please select a group for theory class",
        variant: "destructive"
      });
      return;
    }

    if (classFormData.type === "Practical" && classFormData.selectedStudents.length === 0) {
      toast({
        title: "Validation Error", 
        description: "Please select a student for practical class",
        variant: "destructive"
      });
      return;
    }

    // Date validation
    const selectedDate = new Date(classFormData.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (selectedDate < today) {
      toast({
        title: "Validation Error",
        description: "Cannot schedule classes in the past",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsCreatingClass(true);
      
      // Create the class in the database
      const newClass = await createClass(classFormData);
      
      toast({
        title: "Class Created Successfully",
        description: `${newClass.type} class "${newClass.className}" scheduled for ${format(new Date(classFormData.date), 'MMM d, yyyy')} at ${classFormData.startTime}.`
      });
      
      // Reset form and close modal
      resetClassForm();
      setCreateClassModalOpen(false);
      
    } catch (error: any) {
      console.error('Failed to create class:', error);
      toast({
        title: "Error Creating Class",
        description: error.message || "Failed to create class. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsCreatingClass(false);
    }
  };
  
  // Helper to format class date for display
  const formatClassDate = (dateStr: string, timeStr: string) => {
    const date = new Date(dateStr);
    if (isToday(date)) {
      return `Today, ${timeStr}`;
    }
    if (isTomorrow(date)) {
      return `Tomorrow, ${timeStr}`;
    }
    return `${format(date, 'EEE, MMM d')}, ${timeStr}`;
  };

  // Helper to get icon for activity type
  const getActivityIcon = (actionType: string) => {
    switch (actionType) {
      case 'create':
        return <Plus className="h-4 w-4" />;
      case 'update':
        return <Settings className="h-4 w-4" />;
      case 'delete':
        return <Receipt className="h-4 w-4" />;
      case 'login':
      case 'logout':
        return <UserRound className="h-4 w-4" />;
      case 'class_scheduled':
        return <Calendar className="h-4 w-4" />;
      case 'class_completed':
        return <Check className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const renderActiveSection = () => {
    switch (activeSection) {
      case "students":
        return <StudentsSection onNavigateToStudentProfile={navigateToStudentProfile} onNavigateToCreateStudent={navigateToCreateStudent} />;
      case "create-student":
        return <CreateStudent onBack={navigateBackFromCreateStudent} onStudentCreated={handleStudentCreated} />;
      case "instructors":
        return <InstructorsSection />;
      case "settings":
        return <SettingsSection />;
      case "calendar":
        return <CalendarView />;
      case "agenda":
        return <AgendaView />;
      case "activity-logs":
        return <ActivityLogsSection />;
      case "groups":
        return <GroupsSection />;
      case "receipts":
        return <ReceiptsSection />;
      case "certificates":
        return <CertificatesSection />;
      case "student-profile":
        return <StudentProfile 
          studentId={selectedStudentId} 
          onBack={navigateBackFromStudentProfile} 
          initialEditMode={isNewStudent}
        />;
      case "dashboard":
      default:
        return (
          <PageLayout>
            <div className="mx-auto max-w-6xl space-y-6">
              {/* Top section with heading and buttons */}
              <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">Dashboard</h1>
                <div className="flex space-x-2">
                  <Button onClick={handleAddStudent}>
                    <Plus className="mr-1 h-4 w-4" />
                    Add New Student
                  </Button>
                  <Button onClick={handleCreateClass}>
                    <Plus className="mr-1 h-4 w-4" />
                    Create Class
                  </Button>
                </div>
              </div>

              {/* Summary grid with four metric cards */}
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {/* Total Students Card */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    {dashboardLoading ? (
                      <div className="h-8 w-16 bg-muted animate-pulse rounded" />
                    ) : (
                      <>
                        <div className="text-2xl font-bold">{studentStats.total}</div>
                        <p className="text-xs text-muted-foreground">
                          {studentStats.active} active, {studentStats.onHold} on hold
                        </p>
                      </>
                    )}
                  </CardContent>
                </Card>

                {/* Total Instructors Card - Keep as placeholder for now */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Total Instructors</CardTitle>
                    <UserRound className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">—</div>
                    <p className="text-xs text-muted-foreground">
                      Coming soon
                    </p>
                  </CardContent>
                </Card>

                {/* Classes This Week Card */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Classes This Week</CardTitle>
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    {dashboardLoading ? (
                      <div className="h-8 w-16 bg-muted animate-pulse rounded" />
                    ) : (
                      <>
                        <div className="text-2xl font-bold">{classesThisWeek}</div>
                        <p className="text-xs text-muted-foreground">
                          {upcomingClasses.length} upcoming
                        </p>
                      </>
                    )}
                  </CardContent>
                </Card>

                {/* Hours Logged Card */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Hours Logged</CardTitle>
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    {dashboardLoading ? (
                      <div className="h-8 w-16 bg-muted animate-pulse rounded" />
                    ) : (
                      <>
                        <div className="text-2xl font-bold">{totalHoursLogged}</div>
                        <p className="text-xs text-muted-foreground">
                          Avg {studentStats.averageHours} hrs/student
                        </p>
                      </>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Bottom section with two cards side by side */}
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {/* Recent Activities Card */}
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Activities</CardTitle>
                    <CardDescription>Latest actions in the system</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {dashboardLoading ? (
                        // Loading skeleton
                        Array.from({ length: 5 }).map((_, i) => (
                          <div key={i} className="flex items-center">
                            <div className="mr-2 h-8 w-8 bg-muted animate-pulse rounded-full" />
                            <div className="flex-1 ml-2 space-y-2">
                              <div className="h-4 w-3/4 bg-muted animate-pulse rounded" />
                              <div className="h-3 w-1/4 bg-muted animate-pulse rounded" />
                            </div>
                          </div>
                        ))
                      ) : recentActivities.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-4">
                          No recent activities
                        </p>
                      ) : (
                        recentActivities.map((activity) => (
                          <div key={activity.id} className="flex items-center">
                            <div className="mr-2 flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                              {getActivityIcon(activity.actionType)}
                            </div>
                            <div className="flex-1 ml-2">
                              <p className="text-sm">{activity.description}</p>
                              <p className="text-xs text-muted-foreground">{activity.timeAgo}</p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Upcoming Classes Card */}
                <Card>
                  <CardHeader>
                    <CardTitle>Upcoming Classes</CardTitle>
                    <CardDescription>Scheduled for the next 7 days</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {dashboardLoading ? (
                        // Loading skeleton
                        Array.from({ length: 5 }).map((_, i) => (
                          <div key={i} className="flex items-center">
                            <div className="mr-2 h-8 w-8 bg-muted animate-pulse rounded-full" />
                            <div className="flex-1 ml-2 space-y-2">
                              <div className="h-4 w-3/4 bg-muted animate-pulse rounded" />
                              <div className="h-3 w-1/2 bg-muted animate-pulse rounded" />
                            </div>
                          </div>
                        ))
                      ) : upcomingClasses.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-4">
                          No upcoming classes scheduled
                        </p>
                      ) : (
                        upcomingClasses.map((classItem) => (
                          <div key={classItem.id} className="flex items-center">
                            <div className="mr-2 flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                              <Calendar className="h-4 w-4" />
                            </div>
                            <div className="flex-1 ml-2">
                              <p className="text-sm font-medium">
                                {classItem.type}: {classItem.className}
                              </p>
                              <div className="flex items-center">
                                <p className="text-xs text-muted-foreground">
                                  {formatClassDate(classItem.date, classItem.startTime)}
                                </p>
                                <span className="text-xs mx-1 text-muted-foreground">•</span>
                                <p className="text-xs text-muted-foreground">{classItem.instructor}</p>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </PageLayout>
        );
    }
  };
  
  return <SidebarProvider>
      <div className="flex h-screen w-full bg-background">
        {/* Create Class Modal */}
        <Dialog open={createClassModalOpen} onOpenChange={(open) => {
          setCreateClassModalOpen(open);
          if (!open) resetClassForm();
        }}>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Class</DialogTitle>
              <DialogDescription>
                Fill in the class details to schedule a new session.
              </DialogDescription>
            </DialogHeader>
            
            {loadingOptions ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2 text-muted-foreground">Loading options...</span>
              </div>
            ) : (
              <div className="grid gap-6 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="class-type">Class Type *</Label>
                    <Select 
                      value={classFormData.type} 
                      onValueChange={(value: "Theory" | "Practical") => handleClassFormChange('type', value)}
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
                    <Label htmlFor="instructor">Instructor *</Label>
                    <Select 
                      value={classFormData.instructor} 
                      onValueChange={(value) => handleClassFormChange('instructor', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select instructor" />
                      </SelectTrigger>
                      <SelectContent>
                        {instructorOptions.map((instructor) => (
                          <SelectItem key={instructor.id} value={instructor.id}>
                            {instructor.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="date">Date *</Label>
                    <Input
                      id="date"
                      type="date"
                      value={classFormData.date}
                      onChange={(e) => handleClassFormChange('date', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="time">Start Time *</Label>
                    <Input
                      id="time"
                      type="time"
                      value={classFormData.startTime}
                      onChange={(e) => handleClassFormChange('startTime', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="duration">Duration</Label>
                    <Select 
                      value={classFormData.duration.toString()} 
                      onValueChange={(value) => handleClassFormChange('duration', parseInt(value))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select duration" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="60">60 minutes</SelectItem>
                        <SelectItem value="120">120 minutes</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={classFormData.location || ""}
                      onChange={(e) => handleClassFormChange('location', e.target.value)}
                      placeholder="Main Campus"
                    />
                  </div>
                </div>
                
                {/* Conditional Student/Group Selection based on Class Type */}
                {classFormData.type && (
                  <div className="space-y-2">
                    {classFormData.type === "Theory" ? (
                      // Theory: Show Group Dropdown
                      <>
                        <Label htmlFor="group">Select Group *</Label>
                        <Select 
                          value={classFormData.selectedGroup} 
                          onValueChange={(value) => handleClassFormChange('selectedGroup', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select a group for theory class" />
                          </SelectTrigger>
                          <SelectContent>
                            {groupOptions.map((group) => (
                              <SelectItem key={group.id} value={group.id}>
                                {group.name} ({group.studentCount} students)
                              </SelectItem>
                            ))}
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
                              {classFormData.selectedStudents[0] 
                                ? (() => {
                                    const student = studentOptions.find(s => s.name === classFormData.selectedStudents[0]);
                                    return student ? `${student.name} (${student.studentId})` : classFormData.selectedStudents[0];
                                  })()
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
                                  {studentOptions.filter(s => s.isActive).map((student) => (
                                    <CommandItem
                                      key={student.id}
                                      value={student.name}
                                      onSelect={(currentValue) => {
                                        const newValue = currentValue === classFormData.selectedStudents[0] ? [] : [currentValue];
                                        handleClassFormChange('selectedStudents', newValue);
                                        setStudentComboboxOpen(false);
                                      }}
                                    >
                                      <Check
                                        className={cn(
                                          "mr-2 h-4 w-4",
                                          classFormData.selectedStudents[0] === student.name ? "opacity-100" : "opacity-0"
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
                      </>
                    )}
                  </div>
                )}

                {/* Class Title Selection - Only show after group/student selected */}
                {classFormData.type && isTitleSelectionReady() && (
                  <div className="space-y-2">
                    <Label>Class Title *</Label>
                    {titleLoading ? (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground py-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Checking available titles...
                      </div>
                    ) : (
                      <Popover open={classTitleComboboxOpen} onOpenChange={setClassTitleComboboxOpen}>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={classTitleComboboxOpen}
                            className="w-full justify-between"
                          >
                            {classFormData.title || "Select class title..."}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[400px] p-0">
                          <Command>
                            <CommandInput placeholder="Search titles..." />
                            <CommandList>
                              <CommandEmpty>No title found.</CommandEmpty>
                              {getClassTitles().available.length > 0 && (
                                <CommandGroup heading="Available">
                                  {getClassTitles().available.map((title) => (
                                    <CommandItem
                                      key={title}
                                      value={title}
                                      onSelect={(currentValue) => {
                                        handleClassFormChange('title', currentValue);
                                        setClassTitleComboboxOpen(false);
                                      }}
                                    >
                                      <Check
                                        className={cn(
                                          "mr-2 h-4 w-4",
                                          classFormData.title === title ? "opacity-100" : "opacity-0"
                                        )}
                                      />
                                      {title}
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              )}
                              {getClassTitles().unavailable.length > 0 && (
                                <>
                                  <CommandSeparator />
                                  <CommandGroup heading="Already Completed/Scheduled">
                                    {getClassTitles().unavailable.map((title) => (
                                      <CommandItem
                                        key={title}
                                        value={title}
                                        disabled
                                        className="opacity-50"
                                      >
                                        <Check className="mr-2 h-4 w-4 opacity-0" />
                                        {title} (already done)
                                      </CommandItem>
                                    ))}
                                  </CommandGroup>
                                </>
                              )}
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    )}
                  </div>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Input
                    id="notes"
                    value={classFormData.notes}
                    onChange={(e) => handleClassFormChange('notes', e.target.value)}
                    placeholder="Class notes or description"
                  />
                </div>
              </div>
            )}
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setCreateClassModalOpen(false)} disabled={isCreatingClass}>
                Cancel
              </Button>
              <Button onClick={handleClassFormSubmit} disabled={isCreatingClass || loadingOptions}>
                {isCreatingClass ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Class"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Sidebar */}
        <Sidebar>
          <SidebarHeader className="">
            <div className="px-4 py-4">
              <h2 className="text-xl font-bold text-sidebar-foreground">Driving School</h2>
              <p className="text-sm text-sidebar-foreground/70">Admin Panel</p>
            </div>
          </SidebarHeader>
          
          <SidebarContent>
            <SidebarGroup className="pt-2">
              <SidebarGroupLabel className="px-4">Navigation</SidebarGroupLabel>
              <SidebarMenu className="px-2">
                <SidebarMenuItem>
                  <SidebarMenuButton 
                    asChild 
                    isActive={activeSection === "dashboard"} 
                    tooltip="Dashboard"
                    onClick={() => {
                      setActiveSection("dashboard");
                      setDashboardRefreshKey(prev => prev + 1); // Force refresh on click
                    }}
                  >
                    <button>
                      <Activity size={20} />
                      <span>Dashboard</span>
                    </button>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton 
                    asChild 
                    isActive={activeSection === "agenda"} 
                    tooltip="Agenda"
                  >
                    <button onClick={() => setActiveSection("agenda")}>
                      <Clock size={20} />
                      <span>Agenda</span>
                    </button>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton 
                    asChild 
                    isActive={activeSection === "calendar"} 
                    tooltip="Calendar"
                  >
                    <button onClick={() => setActiveSection("calendar")}>
                      <Calendar size={20} />
                      <span>Calendar</span>
                    </button>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton 
                    asChild 
                    isActive={activeSection === "students"} 
                    tooltip="Students"
                    onClick={() => setActiveSection("students")}
                  >
                    <button>
                      <Users size={20} />
                      <span>Students</span>
                    </button>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton 
                    asChild 
                    isActive={activeSection === "instructors"} 
                    tooltip="Instructors"
                  >
                    <button onClick={() => setActiveSection("instructors")}>
                      <UserRound size={20} />
                      <span>Instructors</span>
                    </button>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton 
                    asChild 
                    isActive={activeSection === "groups"} 
                    tooltip="Groups"
                  >
                    <button onClick={() => setActiveSection("groups")}>
                      <UsersRound size={20} />
                      <span>Groups</span>
                    </button>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton 
                    asChild 
                    isActive={activeSection === "receipts"} 
                    tooltip="Receipts"
                  >
                    <button onClick={() => setActiveSection("receipts")}>
                      <Receipt size={20} />
                      <span>Receipts</span>
                    </button>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton 
                    asChild 
                    isActive={activeSection === "certificates"} 
                    tooltip="Certificates"
                  >
                    <button onClick={() => setActiveSection("certificates")}>
                      <Medal size={20} />
                      <span>Certificates</span>
                    </button>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton 
                    asChild 
                    isActive={activeSection === "activity-logs"} 
                    tooltip="Activity Logs"
                  >
                    <button onClick={() => setActiveSection("activity-logs")}>
                      <FileText size={20} />
                      <span>Activity Logs</span>
                    </button>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton 
                    asChild 
                    isActive={activeSection === "settings"} 
                    tooltip="Settings"
                  >
                    <button onClick={() => setActiveSection("settings")}>
                      <Settings size={20} />
                      <span>Settings</span>
                    </button>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroup>
          </SidebarContent>
          
          <SidebarFooter>
            <div className="px-3 py-2">
              <Button variant="outline" className="w-full justify-start" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </Button>
            </div>
          </SidebarFooter>
        </Sidebar>

        {/* Main content */}
        <div className="flex-1 overflow-auto p-6">
          {renderActiveSection()}
        </div>
      </div>
    </SidebarProvider>;
};

export default Admin;
