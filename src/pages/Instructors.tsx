import React, { useState } from "react";
import { PageLayout } from "@/components/ui/page-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogClose
} from "@/components/ui/dialog";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Pencil, Trash2, UserPlus, Search, Phone, Mail, Calendar, Car, Star, Clock, 
  Briefcase, MapPin, Award, FileText, UserCheck, Eye, User
} from "lucide-react";
import { toast } from "@/components/ui/use-toast";

// Define instructor type
interface Instructor {
  id: string;
  name: string;
  email: string;
  licenseNumber: string;
  phone: string;
  avatar?: string;
  address: string;
  specialties: string[];
  rating: number;
  joinDate: string;
  classesTaught: number;
  availability: string;
  certifications: string[];
  bio: string;
  vehicleAssigned: string;
}

// Dummy instructors data
const dummyInstructors: Instructor[] = [
  {
    id: "i1",
    name: "Mike Brown",
    email: "mike.brown@drivingschool.com",
    licenseNumber: "INS-2021-1458",
    phone: "(555) 123-4567",
    avatar: "https://i.pravatar.cc/150?img=68",
    address: "123 Main Street, Cityville, ST 12345",
    specialties: ["Highway Driving", "Defensive Driving", "Parallel Parking"],
    rating: 4.8,
    joinDate: "2019-05-12",
    classesTaught: 852,
    availability: "Mon-Fri, 9AM-5PM",
    certifications: ["Advanced Driving Instructor", "Defensive Driving Specialist"],
    bio: "Mike has over 10 years of experience teaching people of all ages to drive. He specializes in helping anxious drivers feel comfortable behind the wheel.",
    vehicleAssigned: "Toyota Corolla (Vehicle #2)"
  },
  {
    id: "i2",
    name: "Lisa Taylor",
    email: "lisa.taylor@drivingschool.com",
    licenseNumber: "INS-2020-3892",
    phone: "(555) 234-5678",
    avatar: "https://i.pravatar.cc/150?img=5",
    address: "456 Oak Drive, Townsville, ST 23456",
    specialties: ["City Driving", "Night Driving", "Driver Theory"],
    rating: 4.9,
    joinDate: "2020-03-15",
    classesTaught: 631,
    availability: "Tue-Sat, 10AM-6PM",
    certifications: ["Master Driving Instructor", "Theory Specialist"],
    bio: "Lisa is known for her patience and clear instruction. She has a background in education and applies effective teaching methods to help students learn quickly.",
    vehicleAssigned: "Honda Civic (Vehicle #3)"
  },
  {
    id: "i3",
    name: "James Wilson",
    email: "james.wilson@drivingschool.com",
    licenseNumber: "INS-2022-7251",
    phone: "(555) 345-6789",
    avatar: "https://i.pravatar.cc/150?img=11",
    address: "789 Pine Road, Villageton, ST 34567",
    specialties: ["Emergency Maneuvers", "Highway Merging", "Roundabouts"],
    rating: 4.7,
    joinDate: "2022-01-08",
    classesTaught: 413,
    availability: "Mon-Wed & Sat-Sun, 8AM-4PM",
    certifications: ["Emergency Maneuver Specialist", "Commercial Driver Trainer"],
    bio: "James joined our team after 15 years as a professional driver. His real-world experience makes him excellent at teaching practical driving skills and safety maneuvers.",
    vehicleAssigned: "Ford Focus (Vehicle #5)"
  },
  {
    id: "i4",
    name: "Sarah Johnson",
    email: "sarah.johnson@drivingschool.com",
    licenseNumber: "INS-2021-9023",
    phone: "(555) 456-7890",
    avatar: "https://i.pravatar.cc/150?img=9",
    address: "321 Elm Court, Hamletville, ST 45678",
    specialties: ["Teen Drivers", "Test Preparation", "Parking Techniques"],
    rating: 4.9,
    joinDate: "2021-09-20",
    classesTaught: 572,
    availability: "Wed-Sun, 11AM-7PM",
    certifications: ["Youth Driver Specialist", "Test Prep Expert"],
    bio: "Sarah has a special talent for working with teenage drivers and helping them build confidence. She's known for her high pass rate for road tests.",
    vehicleAssigned: "Nissan Sentra (Vehicle #7)"
  },
  {
    id: "i5",
    name: "Robert Chen",
    email: "robert.chen@drivingschool.com",
    licenseNumber: "INS-2019-4587",
    phone: "(555) 567-8901",
    avatar: "https://i.pravatar.cc/150?img=15",
    address: "654 Maple Avenue, Boroughtown, ST 56789",
    specialties: ["Winter Driving", "Mountain Roads", "Vehicle Handling"],
    rating: 4.6,
    joinDate: "2019-11-05",
    classesTaught: 924,
    availability: "Mon-Fri, 7AM-3PM",
    certifications: ["All-Weather Driving Expert", "Advanced Vehicle Control Specialist"],
    bio: "Robert excels at teaching advanced vehicle control and handling in challenging conditions. He previously worked as a driving instructor for law enforcement.",
    vehicleAssigned: "Subaru Impreza (Vehicle #8)"
  }
];

const InstructorsSection = () => {
  const [instructors, setInstructors] = useState<Instructor[]>(dummyInstructors);
  const [selectedInstructor, setSelectedInstructor] = useState<Instructor | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState<boolean>(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  
  // Form state for add/edit
  const [formData, setFormData] = useState<Partial<Instructor>>({
    name: "",
    email: "",
    licenseNumber: "",
    phone: "",
    address: "",
    bio: "",
    availability: "",
    vehicleAssigned: ""
  });
  
  // Filter instructors based on search query
  const filteredInstructors = instructors.filter(instructor => 
    instructor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    instructor.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    instructor.licenseNumber.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle instructor selection for profile view
  const handleSelectInstructor = (instructor: Instructor) => {
    setSelectedInstructor(instructor);
  };
  
  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  // Setup edit form with instructor data
  const handleEditClick = (instructor: Instructor) => {
    setFormData(instructor);
    setIsEditDialogOpen(true);
  };
  
  // Reset form data
  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      licenseNumber: "",
      phone: "",
      address: "",
      bio: "",
      availability: "",
      vehicleAssigned: ""
    });
  };
  
  // Add new instructor
  const handleAddInstructor = () => {
    const newInstructor: Instructor = {
      id: `i${instructors.length + 1}`,
      name: formData.name || "New Instructor",
      email: formData.email || "email@example.com",
      licenseNumber: formData.licenseNumber || "INS-XXXX-XXXX",
      phone: formData.phone || "(555) XXX-XXXX",
      address: formData.address || "Address",
      specialties: ["General Driving"],
      rating: 5.0,
      joinDate: new Date().toISOString().split('T')[0],
      classesTaught: 0,
      availability: formData.availability || "Not set",
      certifications: ["Standard Certification"],
      bio: formData.bio || "No bio provided",
      vehicleAssigned: formData.vehicleAssigned || "Not assigned"
    };
    
    setInstructors([...instructors, newInstructor]);
    setIsAddDialogOpen(false);
    resetForm();
    
    toast({
      title: "Instructor Added",
      description: `${newInstructor.name} has been added to the roster.`
    });
  };
  
  // Update existing instructor
  const handleUpdateInstructor = () => {
    if (!formData.id) return;
    
    const updatedInstructors = instructors.map(instructor => 
      instructor.id === formData.id ? { ...instructor, ...formData } : instructor
    );
    
    setInstructors(updatedInstructors);
    setIsEditDialogOpen(false);
    
    // Update selected instructor if currently viewing
    if (selectedInstructor && selectedInstructor.id === formData.id) {
      setSelectedInstructor({ ...selectedInstructor, ...formData });
    }
    
    toast({
      title: "Instructor Updated",
      description: `${formData.name}'s information has been updated.`
    });
  };
  
  // Delete instructor
  const handleDeleteInstructor = (id: string) => {
    const updatedInstructors = instructors.filter(instructor => instructor.id !== id);
    setInstructors(updatedInstructors);
    
    // Clear selected instructor if deleted
    if (selectedInstructor && selectedInstructor.id === id) {
      setSelectedInstructor(null);
    }
    
    toast({
      title: "Instructor Deleted",
      description: "The instructor has been removed from the system."
    });
  };
  
  return (
    <PageLayout>
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Instructors</h1>
          <Button onClick={() => { resetForm(); setIsAddDialogOpen(true); }}>
            <UserPlus className="mr-2 h-4 w-4" />
            Add Instructor
          </Button>
        </div>
        
        <div className="flex gap-6">
          {/* Left column - Instructor List */}
          <Card className="w-full lg:w-2/3">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Instructor Roster</CardTitle>
                <div className="relative w-64">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search instructors..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
              <CardDescription>View and manage driving instructors</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>License #</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInstructors.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                        No instructors found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredInstructors.map(instructor => (
                      <TableRow key={instructor.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={instructor.avatar} alt={instructor.name} />
                              <AvatarFallback>{instructor.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                            </Avatar>
                            {instructor.name}
                          </div>
                        </TableCell>
                        <TableCell>{instructor.email}</TableCell>
                        <TableCell>{instructor.licenseNumber}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleSelectInstructor(instructor)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEditClick(instructor)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Instructor</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete {instructor.name}? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction 
                                    onClick={() => handleDeleteInstructor(instructor.id)}
                                    className="bg-destructive text-destructive-foreground"
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          
          {/* Right column - Instructor Profile */}
          <Card className="w-full lg:w-1/3 h-fit">
            {selectedInstructor ? (
              <>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex flex-col items-center gap-2">
                      <Avatar className="h-16 w-16">
                        <AvatarImage src={selectedInstructor.avatar} alt={selectedInstructor.name} />
                        <AvatarFallback className="text-lg">
                          {selectedInstructor.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="text-center">
                        <CardTitle>{selectedInstructor.name}</CardTitle>
                        <div className="flex items-center justify-center gap-1 mt-1">
                          <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                          <span className="text-sm font-medium">{selectedInstructor.rating}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="icon"
                        onClick={() => handleEditClick(selectedInstructor)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="icon"
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Instructor</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete {selectedInstructor.name}? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={() => handleDeleteInstructor(selectedInstructor.id)}
                              className="bg-destructive text-destructive-foreground"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="space-y-1">
                      <h3 className="text-sm font-medium text-muted-foreground">Contact Information</h3>
                      <Separator />
                      <div className="grid grid-cols-1 gap-3 pt-2">
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{selectedInstructor.email}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{selectedInstructor.phone}</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                          <span className="text-sm">{selectedInstructor.address}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      <h3 className="text-sm font-medium text-muted-foreground">Instructor Details</h3>
                      <Separator />
                      <div className="grid grid-cols-1 gap-3 pt-2">
                        <div className="flex items-center gap-2">
                          <UserCheck className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">License: {selectedInstructor.licenseNumber}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">Joined: {new Date(selectedInstructor.joinDate).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">Available: {selectedInstructor.availability}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Car className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{selectedInstructor.vehicleAssigned}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Briefcase className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{selectedInstructor.classesTaught} classes taught</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      <h3 className="text-sm font-medium text-muted-foreground">Specialties</h3>
                      <Separator />
                      <div className="flex flex-wrap gap-2 pt-2">
                        {selectedInstructor.specialties.map((specialty, index) => (
                          <Badge key={index} variant="secondary">{specialty}</Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      <h3 className="text-sm font-medium text-muted-foreground">Certifications</h3>
                      <Separator />
                      <div className="flex flex-col gap-2 pt-2">
                        {selectedInstructor.certifications.map((cert, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <Award className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{cert}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      <h3 className="text-sm font-medium text-muted-foreground">Biography</h3>
                      <Separator />
                      <p className="text-sm pt-2">{selectedInstructor.bio}</p>
                    </div>
                  </div>
                </CardContent>
              </>
            ) : (
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <User className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">No Instructor Selected</h3>
                <p className="text-sm text-muted-foreground mt-1 mb-4">
                  Select an instructor from the list to view their detailed profile.
                </p>
              </CardContent>
            )}
          </Card>
        </div>
      </div>
      
      {/* Add Instructor Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Add New Instructor</DialogTitle>
            <DialogDescription>
              Fill in the instructor details. You can add more information later.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-6 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name || ''}
                  onChange={handleInputChange}
                  placeholder="John Doe"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email || ''}
                  onChange={handleInputChange}
                  placeholder="john.doe@example.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="licenseNumber">License Number</Label>
                <Input
                  id="licenseNumber"
                  name="licenseNumber"
                  value={formData.licenseNumber || ''}
                  onChange={handleInputChange}
                  placeholder="INS-XXXX-XXXX"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  name="phone"
                  value={formData.phone || ''}
                  onChange={handleInputChange}
                  placeholder="(555) XXX-XXXX"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                name="address"
                value={formData.address || ''}
                onChange={handleInputChange}
                placeholder="123 Main St, City, State 12345"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="availability">Availability</Label>
                <Input
                  id="availability"
                  name="availability"
                  value={formData.availability || ''}
                  onChange={handleInputChange}
                  placeholder="Mon-Fri, 9AM-5PM"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="vehicleAssigned">Vehicle Assignment</Label>
                <Input
                  id="vehicleAssigned"
                  name="vehicleAssigned"
                  value={formData.vehicleAssigned || ''}
                  onChange={handleInputChange}
                  placeholder="Toyota Corolla (Vehicle #1)"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="bio">Biography</Label>
              <Input
                id="bio"
                name="bio"
                value={formData.bio || ''}
                onChange={handleInputChange}
                placeholder="Brief instructor biography or notes"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddInstructor}>
              Add Instructor
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Edit Instructor Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Instructor</DialogTitle>
            <DialogDescription>
              Update instructor details.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-6 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Full Name</Label>
                <Input
                  id="edit-name"
                  name="name"
                  value={formData.name || ''}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-email">Email</Label>
                <Input
                  id="edit-email"
                  name="email"
                  type="email"
                  value={formData.email || ''}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-licenseNumber">License Number</Label>
                <Input
                  id="edit-licenseNumber"
                  name="licenseNumber"
                  value={formData.licenseNumber || ''}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-phone">Phone Number</Label>
                <Input
                  id="edit-phone"
                  name="phone"
                  value={formData.phone || ''}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-address">Address</Label>
              <Input
                id="edit-address"
                name="address"
                value={formData.address || ''}
                onChange={handleInputChange}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-availability">Availability</Label>
                <Input
                  id="edit-availability"
                  name="availability"
                  value={formData.availability || ''}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-vehicleAssigned">Vehicle Assignment</Label>
                <Input
                  id="edit-vehicleAssigned"
                  name="vehicleAssigned"
                  value={formData.vehicleAssigned || ''}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-bio">Biography</Label>
              <Input
                id="edit-bio"
                name="bio"
                value={formData.bio || ''}
                onChange={handleInputChange}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateInstructor}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageLayout>
  );
};

export default InstructorsSection; 