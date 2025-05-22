import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Activity, Calendar, FileText, LogOut, Plus, Receipt, UserRound, Users, Clock, Medal, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sidebar, SidebarProvider, SidebarContent, SidebarHeader, SidebarFooter, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarGroupLabel, SidebarGroup } from "@/components/ui/sidebar";
import { toast } from "@/components/ui/use-toast";
import { PageLayout } from "@/components/ui/page-layout";
import StudentsSection from "./Students";
import SettingsSection from "./Settings";
import CalendarView from "./Calendar";
import ActivityLogsSection from "./ActivityLogs";

const Admin = () => {
  const {
    role,
    logout
  } = useAuth();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState("dashboard");

  // Protect route - redirect if not admin
  useState(() => {
    if (role !== "admin") {
      navigate("/");
    }
  });
  
  const handleLogout = () => {
    logout();
    navigate("/");
    toast({
      title: "Logged out successfully",
      description: "You have been logged out of your admin account"
    });
  };
  
  const handleAddStudent = () => {
    toast({
      title: "Add Student",
      description: "This feature is not implemented yet."
    });
  };
  
  const handleCreateClass = () => {
    toast({
      title: "Create Class",
      description: "This feature is not implemented yet."
    });
  };
  
  const renderActiveSection = () => {
    switch (activeSection) {
      case "students":
        return <StudentsSection />;
      case "settings":
        return <SettingsSection />;
      case "calendar":
        return <CalendarView />;
      case "activity-logs":
        return <ActivityLogsSection />;
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
                  <SidebarMenuButton asChild tooltip="Instructors">
                    <button onClick={() => setActiveSection("instructors")}>
                      <UserRound size={20} />
                      <span>Instructors</span>
                    </button>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip="Calendar">
                    <button onClick={() => setActiveSection("calendar")}>
                      <Calendar size={20} />
                      <span>Calendar</span>
                    </button>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip="Activity Logs">
                    <button onClick={() => setActiveSection("activity-logs")}>
                      <FileText size={20} />
                      <span>Activity Logs</span>
                    </button>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip="Groups">
                    <button onClick={() => setActiveSection("groups")}>
                      <Users size={20} />
                      <span>Groups</span>
                    </button>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip="Receipts">
                    <button onClick={() => setActiveSection("receipts")}>
                      <Receipt size={20} />
                      <span>Receipts</span>
                    </button>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip="Certificates">
                    <button onClick={() => setActiveSection("certificates")}>
                      <Medal size={20} />
                      <span>Certificates</span>
                    </button>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip="Settings">
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
