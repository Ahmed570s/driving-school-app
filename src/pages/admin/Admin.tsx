import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Activity, Calendar, FileText, LogOut, Plus, Receipt, UserRound, Users, Clock, Medal, Settings, Check, ChevronsUpDown, UsersRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sidebar, SidebarProvider, SidebarContent, SidebarHeader, SidebarFooter, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarGroupLabel, SidebarGroup } from "@/components/ui/sidebar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
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

// Define form data interface for class creation
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

// Dummy data for students
const dummyStudents = [
  { id: 1, name: "Emma Wilson", group: "Group A", phone: "(555) 123-4567" },
  { id: 2, name: "John Smith", group: "Group B", phone: "(555) 234-5678" },
  { id: 3, name: "Sophia Garcia", group: "Group C", phone: "(555) 345-6789" },
  { id: 4, name: "Michael Johnson", group: "Group A", phone: "(555) 456-7890" },
  { id: 5, name: "Olivia Brown", group: "Group B", phone: "(555) 567-8901" },
  { id: 6, name: "David Lee", group: "Group C", phone: "(555) 678-9012" },
  { id: 7, name: "Ava Martinez", group: "Group A", phone: "(555) 789-0123" },
  { id: 8, name: "James Wilson", group: "Group B", phone: "(555) 890-1234" },
];

// Dummy data for groups
const dummyGroups = [
  { id: "Group A", name: "Group A", studentCount: 4 },
  { id: "Group B", name: "Group B", studentCount: 4 },
  { id: "Group C", name: "Group C", studentCount: 4 },
];

// Instructors list
const instructors = ["Mike Brown", "Lisa Taylor", "James Wilson"];

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
  const [classFormData, setClassFormData] = useState<ClassFormData>({
    type: "",
    date: format(new Date(), 'yyyy-MM-dd'),
    startTime: "10:00",
    duration: 60,
    instructor: "",
    selectedStudents: [],
    selectedGroup: "",
    notes: "",
  });

  // Protect admin route - redirect unauthenticated users
  useEffect(() => {
    if (!isLoading && (!isAuthenticated || role !== 'admin')) {
      console.log('🔄 Admin access denied, redirecting to login');
      navigate("/", { replace: true });
    }
  }, [isAuthenticated, role, isLoading, navigate]);

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
    setClassFormData(prev => ({
      ...prev,
      [field]: value,
      // Reset student selection when group is selected and vice versa
      ...(field === 'selectedGroup' && value ? { selectedStudents: [] } : {}),
      ...(field === 'selectedStudents' && value.length > 0 ? { selectedGroup: "" } : {}),
    }));
  };

  // Handle student selection for practical classes
  const handleStudentToggle = (studentName: string) => {
    const updatedStudents = classFormData.selectedStudents.includes(studentName)
      ? classFormData.selectedStudents.filter(s => s !== studentName)
      : [...classFormData.selectedStudents, studentName];
    
    handleClassFormChange('selectedStudents', updatedStudents);
  };

  // Handle class form submission
  const handleClassFormSubmit = () => {
    // Basic validation
    if (!classFormData.type || !classFormData.date || !classFormData.instructor) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }
    
    if (!classFormData.selectedGroup && classFormData.selectedStudents.length === 0) {
      toast({
        title: "Validation Error", 
        description: "Please select students or a group",
        variant: "destructive"
      });
      return;
    }
    
    // Show success message
    toast({
      title: "Class Created Successfully",
      description: "The class has been scheduled and added to the calendar."
    });
    
    // Reset form and close modal
    setClassFormData({
      type: "",
      date: format(new Date(), 'yyyy-MM-dd'),
      startTime: "10:00",
      duration: 60,
      instructor: "",
      selectedStudents: [],
      selectedGroup: "",
      notes: "",
    });
    setCreateClassModalOpen(false);
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
                    <div className="text-2xl font-bold">152</div>
                    <p className="text-xs text-muted-foreground">
                      +12% from last month
                    </p>
                  </CardContent>
                </Card>

                {/* Total Instructors Card */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Total Instructors</CardTitle>
                    <UserRound className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">8</div>
                    <p className="text-xs text-muted-foreground">
                      +1 new this month
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
                    <div className="text-2xl font-bold">24</div>
                    <p className="text-xs text-muted-foreground">
                      6 more than last week
                    </p>
                  </CardContent>
                </Card>

                {/* Hours Logged Card */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Hours Logged</CardTitle>
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">128</div>
                    <p className="text-xs text-muted-foreground">
                      +18% from last month
                    </p>
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
                      {/* Activities list */}
                      {[{
                        icon: <UserRound className="h-4 w-4" />,
                        text: "John Smith registered as a new student",
                        time: "2 minutes ago"
                      }, {
                        icon: <Calendar className="h-4 w-4" />,
                        text: "Theory class scheduled for Group A",
                        time: "1 hour ago"
                      }, {
                        icon: <Settings className="h-4 w-4" />,
                        text: "Emma Wilson completed her course",
                        time: "3 hours ago"
                      }, {
                        icon: <Receipt className="h-4 w-4" />,
                        text: "Payment received from David Johnson",
                        time: "Yesterday"
                      }, {
                        icon: <Users className="h-4 w-4" />,
                        text: "New Group C created for weekend classes",
                        time: "Yesterday"
                      }].map((item, i) => <div key={i} className="flex items-center">
                            <div className="mr-2 flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                              {item.icon}
                            </div>
                            <div className="flex-1 ml-2">
                              <p className="text-sm">{item.text}</p>
                              <p className="text-xs text-muted-foreground">{item.time}</p>
                            </div>
                          </div>)}
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
                      {/* Classes list */}
                      {[{
                        title: "Theory: Road Signs",
                        date: "Today, 2:00 PM",
                        instructor: "Mike Brown"
                      }, {
                        title: "Practical: Parking Skills",
                        date: "Today, 4:30 PM",
                        instructor: "Lisa Taylor"
                      }, {
                        title: "Theory: Traffic Rules",
                        date: "Tomorrow, 10:00 AM",
                        instructor: "Mike Brown"
                      }, {
                        title: "Practical: City Driving",
                        date: "Tomorrow, 1:00 PM",
                        instructor: "James Wilson"
                      }, {
                        title: "Practical: Highway Driving",
                        date: "Friday, 11:00 AM",
                        instructor: "Lisa Taylor"
                      }].map((item, i) => <div key={i} className="flex items-center">
                            <div className="mr-2 flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                              <Calendar className="h-4 w-4" />
                            </div>
                            <div className="flex-1 ml-2">
                              <p className="text-sm font-medium">{item.title}</p>
                              <div className="flex items-center">
                                <p className="text-xs text-muted-foreground">{item.date}</p>
                                <span className="text-xs mx-1 text-muted-foreground">•</span>
                                <p className="text-xs text-muted-foreground">{item.instructor}</p>
                              </div>
                            </div>
                          </div>)}
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
        <Dialog open={createClassModalOpen} onOpenChange={setCreateClassModalOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Add New Class</DialogTitle>
              <DialogDescription>
                Fill in the class details to schedule a new session.
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-6 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="class-type">Class Type</Label>
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
                  <Label htmlFor="instructor">Instructor</Label>
                  <Select 
                    value={classFormData.instructor} 
                    onValueChange={(value) => handleClassFormChange('instructor', value)}
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
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={classFormData.date}
                    onChange={(e) => handleClassFormChange('date', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="time">Start Time</Label>
                  <Input
                    id="time"
                    type="time"
                    value={classFormData.startTime}
                    onChange={(e) => handleClassFormChange('startTime', e.target.value)}
                  />
                </div>
              </div>
              
              {/* Conditional Student Selection based on Class Type */}
              {classFormData.type && (
                <div className="space-y-2">
                  {classFormData.type === "Theory" ? (
                    // Theory: Show Group Dropdown
                    <>
                      <Label htmlFor="group">Select Group</Label>
                      <Select 
                        value={classFormData.selectedGroup} 
                        onValueChange={(value) => handleClassFormChange('selectedGroup', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a group for theory class" />
                        </SelectTrigger>
                        <SelectContent>
                          {dummyGroups.map((group) => (
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
                      <Label htmlFor="student">Select Student</Label>
                      <Popover open={studentComboboxOpen} onOpenChange={setStudentComboboxOpen}>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={studentComboboxOpen}
                            className="w-full justify-between"
                          >
                            {classFormData.selectedStudents[0] 
                              ? dummyStudents.find(student => student.name === classFormData.selectedStudents[0])?.name + 
                                ` (${dummyStudents.find(student => student.name === classFormData.selectedStudents[0])?.id})`
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
                                {dummyStudents.map((student) => (
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
                                    {student.name} ({student.id})
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
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setCreateClassModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleClassFormSubmit}>
                Create Class
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
                    onClick={() => setActiveSection("dashboard")}
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
