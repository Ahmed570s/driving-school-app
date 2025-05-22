import { useState } from "react";
import { PageLayout } from "@/components/ui/page-layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  User, School, Users, Paintbrush, Bell, Link, ShieldAlert, 
  HelpCircle, Moon, Sun, ChevronDown, Info, Check, X
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/components/ui/use-toast";
import { useTheme } from "@/context/ThemeContext";

const Settings = () => {
  const [activeTab, setActiveTab] = useState("profile");
  const { theme, setTheme } = useTheme();
  
  // Dummy data
  const [profileData, setProfileData] = useState({
    name: "John Smith",
    email: "john.smith@example.com",
    phone: "(555) 123-4567",
    role: "Administrator"
  });
  
  const [schoolData, setSchoolData] = useState({
    schoolName: "Downtown Driving Academy",
    address: "123 Main Street, City, State 12345",
    phone: "(555) 987-6543",
    email: "contact@downtowndriving.com",
    website: "www.downtowndriving.com"
  });
  
  const [language, setLanguage] = useState("english");
  const [timeFormat, setTimeFormat] = useState("12h");
  
  const [notifications, setNotifications] = useState({
    newStudents: true,
    classReminders: true,
    paymentConfirmations: true,
    systemUpdates: false
  });
  
  const [integrations, setIntegrations] = useState({
    googleCalendar: false,
    outlookCalendar: false,
    smsProvider: true,
    paymentProvider: true
  });
  
  const handleSaveProfile = () => {
    toast({
      title: "Profile updated",
      description: "Your profile information has been saved.",
    });
  };
  
  const handleSaveSchool = () => {
    toast({
      title: "School information updated",
      description: "School details have been saved successfully.",
    });
  };
  
  const handleToggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    toast({
      title: `${newTheme.charAt(0).toUpperCase() + newTheme.slice(1)} mode activated`,
      description: `Theme has been changed to ${newTheme} mode.`,
    });
  };
  
  const handleExportData = () => {
    toast({
      title: "Data export initiated",
      description: "Your data export is being prepared and will be emailed to you.",
    });
  };
  
  const handleDeleteAccount = () => {
    toast({
      title: "Account deletion request",
      description: "Please contact support to confirm account deletion.",
      variant: "destructive"
    });
  };
  
  const handleSaveNotifications = () => {
    toast({
      title: "Notification preferences saved",
      description: "Your notification settings have been updated.",
    });
  };
  
  const handleSaveIntegrations = () => {
    toast({
      title: "Integration settings saved",
      description: "Your integration settings have been updated.",
    });
  };
  
  const handleSavePreferences = () => {
    toast({
      title: "System preferences saved",
      description: "Your system preferences have been updated.",
    });
  };
  
  // Mock users for the User Management section
  const users = [
    { id: 1, name: "Lisa Taylor", email: "lisa.taylor@example.com", role: "Instructor", status: "Active" },
    { id: 2, name: "Mike Brown", email: "mike.brown@example.com", role: "Instructor", status: "Active" },
    { id: 3, name: "James Wilson", email: "james.wilson@example.com", role: "Instructor", status: "Active" },
    { id: 4, name: "Sarah Johnson", email: "sarah.johnson@example.com", role: "Admin", status: "Active" },
    { id: 5, name: "David Lee", email: "david.lee@example.com", role: "Instructor", status: "Inactive" }
  ];
  
  return (
    <PageLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Settings</h1>
      </div>
      
      <Tabs 
        defaultValue="profile" 
        className="w-full" 
        value={activeTab} 
        onValueChange={setActiveTab}
      >
        <TabsList className="grid grid-cols-4 md:grid-cols-8 mb-6">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User size={16} />
            <span className="hidden md:inline">Profile</span>
          </TabsTrigger>
          <TabsTrigger value="school" className="flex items-center gap-2">
            <School size={16} />
            <span className="hidden md:inline">School</span>
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users size={16} />
            <span className="hidden md:inline">Users</span>
          </TabsTrigger>
          <TabsTrigger value="preferences" className="flex items-center gap-2">
            <Paintbrush size={16} />
            <span className="hidden md:inline">Preferences</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell size={16} />
            <span className="hidden md:inline">Notifications</span>
          </TabsTrigger>
          <TabsTrigger value="integrations" className="flex items-center gap-2">
            <Link size={16} />
            <span className="hidden md:inline">Integrations</span>
          </TabsTrigger>
          <TabsTrigger value="privacy" className="flex items-center gap-2">
            <ShieldAlert size={16} />
            <span className="hidden md:inline">Privacy</span>
          </TabsTrigger>
          <TabsTrigger value="support" className="flex items-center gap-2">
            <HelpCircle size={16} />
            <span className="hidden md:inline">Support</span>
          </TabsTrigger>
        </TabsList>
        
        <div className="space-y-6">
          {/* Profile Settings */}
          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Profile Settings</CardTitle>
                <CardDescription>
                  Manage your account information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex flex-col sm:flex-row gap-6 items-start">
                  <div className="flex flex-col items-center gap-2">
                    <Avatar className="h-24 w-24">
                      <AvatarImage src="/placeholder-avatar.jpg" alt="Profile" />
                      <AvatarFallback>{profileData.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <Button variant="outline" size="sm">Change Photo</Button>
                  </div>
                  <div className="grid gap-4 flex-1">
                    <div className="grid gap-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input 
                        id="name" 
                        value={profileData.name} 
                        onChange={e => setProfileData({...profileData, name: e.target.value})} 
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="email">Email</Label>
                      <Input 
                        id="email" 
                        type="email" 
                        value={profileData.email} 
                        onChange={e => setProfileData({...profileData, email: e.target.value})} 
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input 
                        id="phone" 
                        type="tel" 
                        value={profileData.phone} 
                        onChange={e => setProfileData({...profileData, phone: e.target.value})} 
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="role">Role</Label>
                      <Input id="role" value={profileData.role} disabled />
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline">Cancel</Button>
                <Button onClick={handleSaveProfile}>Save Changes</Button>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Password</CardTitle>
                <CardDescription>
                  Update your password
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="current-password">Current Password</Label>
                  <Input id="current-password" type="password" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="new-password">New Password</Label>
                  <Input id="new-password" type="password" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="confirm-password">Confirm New Password</Label>
                  <Input id="confirm-password" type="password" />
                </div>
              </CardContent>
              <CardFooter>
                <Button>Update Password</Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          {/* School Information */}
          <TabsContent value="school" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>School Information</CardTitle>
                <CardDescription>
                  Manage details about your driving school
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="school-name">School Name</Label>
                  <Input 
                    id="school-name" 
                    value={schoolData.schoolName} 
                    onChange={e => setSchoolData({...schoolData, schoolName: e.target.value})} 
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="school-address">Address</Label>
                  <Input 
                    id="school-address" 
                    value={schoolData.address} 
                    onChange={e => setSchoolData({...schoolData, address: e.target.value})} 
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="school-phone">Phone</Label>
                  <Input 
                    id="school-phone" 
                    value={schoolData.phone} 
                    onChange={e => setSchoolData({...schoolData, phone: e.target.value})} 
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="school-email">Email</Label>
                  <Input 
                    id="school-email" 
                    value={schoolData.email} 
                    onChange={e => setSchoolData({...schoolData, email: e.target.value})} 
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="school-website">Website</Label>
                  <Input 
                    id="school-website" 
                    value={schoolData.website} 
                    onChange={e => setSchoolData({...schoolData, website: e.target.value})} 
                  />
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline">Cancel</Button>
                <Button onClick={handleSaveSchool}>Save Changes</Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          {/* User Management */}
          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>User Management</CardTitle>
                  <CardDescription>
                    Manage instructors and admin users
                  </CardDescription>
                </div>
                <Button>
                  Add User
                </Button>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px] rounded-md border">
                  <div className="p-4 space-y-4">
                    {users.map(user => (
                      <div key={user.id} className="flex items-center justify-between p-3 border rounded-md">
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarFallback>{user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{user.name}</p>
                            <p className="text-sm text-muted-foreground">{user.email}</p>
                            <div className="flex items-center mt-1 gap-2">
                              <span className="text-xs bg-muted rounded-full px-2 py-0.5">{user.role}</span>
                              <span className={`text-xs rounded-full px-2 py-0.5 ${
                                user.status === 'Active' 
                                  ? 'bg-green-100 text-green-700' 
                                  : 'bg-red-100 text-red-700'
                              }`}>{user.status}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">Edit</Button>
                          {user.status === 'Active' ? (
                            <Button variant="outline" size="sm">Deactivate</Button>
                          ) : (
                            <Button variant="outline" size="sm">Activate</Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* System Preferences */}
          <TabsContent value="preferences" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>System Preferences</CardTitle>
                <CardDescription>
                  Customize your application experience
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Theme</Label>
                    <p className="text-sm text-muted-foreground">
                      Choose between light and dark mode
                    </p>
                  </div>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={handleToggleTheme}
                  >
                    {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                  </Button>
                </div>
                
                <Separator />
                
                <div className="space-y-3">
                  <Label htmlFor="language">Language</Label>
                  <Select value={language} onValueChange={setLanguage}>
                    <SelectTrigger id="language">
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="english">English</SelectItem>
                      <SelectItem value="spanish">Spanish</SelectItem>
                      <SelectItem value="french">French</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-3">
                  <Label htmlFor="time-format">Time Format</Label>
                  <Select value={timeFormat} onValueChange={setTimeFormat}>
                    <SelectTrigger id="time-format">
                      <SelectValue placeholder="Select time format" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="12h">12-hour (1:30 PM)</SelectItem>
                      <SelectItem value="24h">24-hour (13:30)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={handleSavePreferences}>Save Preferences</Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          {/* Notification Preferences */}
          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>
                  Configure how and when you receive notifications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">New Student Signups</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive notifications when a new student registers
                    </p>
                  </div>
                  <Switch 
                    checked={notifications.newStudents} 
                    onCheckedChange={(checked) => 
                      setNotifications({...notifications, newStudents: checked})
                    } 
                  />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Class Reminders</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive reminders about upcoming classes
                    </p>
                  </div>
                  <Switch 
                    checked={notifications.classReminders} 
                    onCheckedChange={(checked) => 
                      setNotifications({...notifications, classReminders: checked})
                    } 
                  />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Payment Confirmations</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive confirmations for payments
                    </p>
                  </div>
                  <Switch 
                    checked={notifications.paymentConfirmations} 
                    onCheckedChange={(checked) => 
                      setNotifications({...notifications, paymentConfirmations: checked})
                    } 
                  />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">System Updates</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive notifications about system updates and maintenance
                    </p>
                  </div>
                  <Switch 
                    checked={notifications.systemUpdates} 
                    onCheckedChange={(checked) => 
                      setNotifications({...notifications, systemUpdates: checked})
                    } 
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={handleSaveNotifications}>Save Notification Settings</Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          {/* Integration Settings */}
          <TabsContent value="integrations" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Integration Settings</CardTitle>
                <CardDescription>
                  Connect with third-party services
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Google Calendar</Label>
                    <p className="text-sm text-muted-foreground">
                      Sync your classes with Google Calendar
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {integrations.googleCalendar ? (
                      <span className="text-xs text-green-600 flex items-center gap-1">
                        <Check className="h-3 w-3" /> Connected
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <X className="h-3 w-3" /> Not connected
                      </span>
                    )}
                    <Button variant="outline" size="sm">
                      {integrations.googleCalendar ? "Disconnect" : "Connect"}
                    </Button>
                  </div>
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Outlook Calendar</Label>
                    <p className="text-sm text-muted-foreground">
                      Sync your classes with Outlook Calendar
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {integrations.outlookCalendar ? (
                      <span className="text-xs text-green-600 flex items-center gap-1">
                        <Check className="h-3 w-3" /> Connected
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <X className="h-3 w-3" /> Not connected
                      </span>
                    )}
                    <Button variant="outline" size="sm">
                      {integrations.outlookCalendar ? "Disconnect" : "Connect"}
                    </Button>
                  </div>
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">SMS Provider</Label>
                    <p className="text-sm text-muted-foreground">
                      Configure SMS notifications
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {integrations.smsProvider ? (
                      <span className="text-xs text-green-600 flex items-center gap-1">
                        <Check className="h-3 w-3" /> Connected
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <X className="h-3 w-3" /> Not connected
                      </span>
                    )}
                    <Button variant="outline" size="sm">
                      {integrations.smsProvider ? "Configure" : "Connect"}
                    </Button>
                  </div>
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Payment Provider</Label>
                    <p className="text-sm text-muted-foreground">
                      Configure payment processing
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {integrations.paymentProvider ? (
                      <span className="text-xs text-green-600 flex items-center gap-1">
                        <Check className="h-3 w-3" /> Connected
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <X className="h-3 w-3" /> Not connected
                      </span>
                    )}
                    <Button variant="outline" size="sm">
                      {integrations.paymentProvider ? "Configure" : "Connect"}
                    </Button>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={handleSaveIntegrations}>Save Integration Settings</Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          {/* Data & Privacy */}
          <TabsContent value="privacy" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Data & Privacy</CardTitle>
                <CardDescription>
                  Manage your data and privacy settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Export Data</h3>
                  <p className="text-sm text-muted-foreground">
                    Download all your data including students, classes, and receipts
                  </p>
                  <div className="flex gap-2 mt-2">
                    <Button variant="outline" onClick={handleExportData}>Export All Data</Button>
                    <Select defaultValue="json">
                      <SelectTrigger className="w-[120px]">
                        <SelectValue placeholder="Format" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="json">JSON</SelectItem>
                        <SelectItem value="csv">CSV</SelectItem>
                        <SelectItem value="pdf">PDF</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Privacy Policy</h3>
                  <p className="text-sm text-muted-foreground">
                    View our privacy policy and terms of service
                  </p>
                  <div className="flex gap-2 mt-2">
                    <Button variant="link" className="p-0 h-auto">Privacy Policy</Button>
                    <span className="text-muted-foreground">•</span>
                    <Button variant="link" className="p-0 h-auto">Terms of Service</Button>
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <h3 className="text-lg font-medium text-red-600">Danger Zone</h3>
                  <p className="text-sm text-muted-foreground">
                    Delete your account and all associated data. This action cannot be undone.
                  </p>
                  <Button variant="destructive" onClick={handleDeleteAccount}>Delete Account</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* App Version & Support */}
          <TabsContent value="support" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Support & Information</CardTitle>
                <CardDescription>
                  Get help and information about the app
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">App Version</Label>
                    <p className="text-sm text-muted-foreground">
                      Current version of the application
                    </p>
                  </div>
                  <span className="font-mono bg-muted rounded px-2 py-1 text-sm">v1.0.3</span>
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Contact Support</h3>
                  <p className="text-sm text-muted-foreground">
                    Need help? Get in touch with our support team
                  </p>
                  <Button className="mt-2">
                    <HelpCircle className="mr-2 h-4 w-4" />
                    Contact Support
                  </Button>
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Documentation</h3>
                  <p className="text-sm text-muted-foreground">
                    View user guides and documentation
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                    <Button variant="outline" className="justify-start">
                      <Info className="mr-2 h-4 w-4" />
                      User Guide
                    </Button>
                    <Button variant="outline" className="justify-start">
                      <Info className="mr-2 h-4 w-4" />
                      Admin Manual
                    </Button>
                    <Button variant="outline" className="justify-start">
                      <Info className="mr-2 h-4 w-4" />
                      FAQ
                    </Button>
                    <Button variant="outline" className="justify-start">
                      <Info className="mr-2 h-4 w-4" />
                      Video Tutorials
                    </Button>
                  </div>
                </div>
                
                <Separator />
                
                <div className="flex flex-col gap-1 p-3 bg-muted rounded-md">
                  <span className="text-sm font-medium">System Status</span>
                  <span className="flex items-center text-green-600 text-sm gap-1">
                    <Check className="h-3 w-3" /> All systems operational
                  </span>
                  <span className="text-xs text-muted-foreground">Last checked: Today at 9:45 AM</span>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </div>
      </Tabs>
    </PageLayout>
  );
};

export default Settings; 