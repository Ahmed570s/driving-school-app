import React, { useEffect, useMemo, useState } from "react";
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
  Pencil, Trash2, UserPlus, Search, Phone, Mail, Calendar, Award, Eye, Loader2, User 
} from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { Instructor, InstructorInput, getInstructors, createInstructor, updateInstructor, deleteInstructor } from "@/services/instructors";

const InstructorsSection = () => {
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [selectedInstructor, setSelectedInstructor] = useState<Instructor | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState<boolean>(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  
  // Form state for add/edit
  const [formData, setFormData] = useState<Partial<InstructorInput> & { id?: string }>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    whatsapp: "",
    hireDate: "",
    status: "active",
    employeeId: "",
    licenseNumber: "",
    certificationExpiry: "",
  });

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await getInstructors();
        setInstructors(data);
      } catch (error: any) {
        toast({
          title: "Error loading instructors",
          description: error?.message || "Failed to load instructors",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);
  
  // Filter instructors based on search query
  const filteredInstructors = useMemo(
    () =>
      instructors.filter((instructor) => {
        const haystack = [
          instructor.fullName,
          instructor.firstName,
          instructor.lastName,
          instructor.email,
          instructor.licenseNumber,
          instructor.status,
        ]
          .join(" ")
          .toLowerCase();
        return haystack.includes(searchQuery.toLowerCase());
      }),
    [instructors, searchQuery]
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
    setFormData({
      id: instructor.id,
      firstName: instructor.firstName,
      lastName: instructor.lastName,
      email: instructor.email,
      phone: instructor.phone,
      whatsapp: instructor.whatsapp,
      hireDate: instructor.hireDate,
      status: instructor.status,
      employeeId: instructor.employeeId,
      licenseNumber: instructor.licenseNumber,
      certificationExpiry: instructor.certificationExpiry,
    });
    setIsEditDialogOpen(true);
  };
  
  // Reset form data
  const resetForm = () => {
    setFormData({
      id: undefined,
      firstName: "",
      lastName: "",
      email: "",
      licenseNumber: "",
      phone: "",
      whatsapp: "",
      hireDate: "",
      status: "active",
      employeeId: "",
      certificationExpiry: "",
    });
  };
  
  // Add new instructor
  const handleAddInstructor = async () => {
    try {
      setSaving(true);
      if (!formData.firstName || !formData.lastName || !formData.email || !formData.hireDate || !formData.status) {
        toast({
          title: "Missing required fields",
          description: "First name, last name, email, status, and hire date are required.",
          variant: "destructive",
        });
        return;
      }
      const input: InstructorInput = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        whatsapp: formData.whatsapp,
        hireDate: formData.hireDate,
        status: (formData.status as any) || "active",
        employeeId: formData.employeeId,
        licenseNumber: formData.licenseNumber,
        certificationExpiry: formData.certificationExpiry,
        specializations: [],
      };
      const optimisticId = `temp-${Date.now()}`;
      const optimistic: Instructor = {
        id: optimisticId,
        profileId: "",
        employeeId: input.employeeId || "",
        fullName: `${input.firstName} ${input.lastName}`,
        firstName: input.firstName,
        lastName: input.lastName,
        email: input.email,
        phone: input.phone || "",
        whatsapp: input.whatsapp || "",
        status: input.status || "active",
        hireDate: input.hireDate,
        licenseNumber: input.licenseNumber || "",
        certificationExpiry: input.certificationExpiry || "",
        specializations: input.specializations || [],
        theoryHours: 0,
        practicalHours: 0,
        totalHours: 0,
        avatar: "",
        address: {
          street: "",
          apartment: "",
          city: "",
          postalCode: "",
          province: "",
          country: "Canada",
        },
        isActive: true,
      };
      setInstructors((prev) => [optimistic, ...prev]);
      const created = await createInstructor(input);
      setInstructors((prev) => prev.map(i => i.id === optimisticId ? created : i));
      setIsAddDialogOpen(false);
      resetForm();
      toast({
        title: "Instructor Added",
        description: `${created.fullName} has been added.`,
      });
    } catch (error: any) {
      setInstructors((prev) => prev.filter(i => !i.id.startsWith('temp-')));
      toast({
        title: "Error adding instructor",
        description: error?.message || "Failed to add instructor",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };
  
  // Update existing instructor
  const handleUpdateInstructor = async () => {
    if (!formData.id) return;
    try {
      setSaving(true);
      const updates: Partial<InstructorInput> = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        whatsapp: formData.whatsapp,
        hireDate: formData.hireDate,
        status: formData.status as any,
        employeeId: formData.employeeId,
        licenseNumber: formData.licenseNumber,
      certificationExpiry: formData.certificationExpiry,
      };
      const updated = await updateInstructor(formData.id, updates);
      setInstructors((prev) => prev.map((i) => (i.id === updated.id ? updated : i)));
      if (selectedInstructor?.id === updated.id) {
        setSelectedInstructor(updated);
      }
      setIsEditDialogOpen(false);
      toast({
        title: "Instructor Updated",
        description: `${updated.fullName} has been updated.`,
      });
    } catch (error: any) {
      toast({
        title: "Error updating instructor",
        description: error?.message || "Failed to update instructor",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };
  
  // Delete instructor
  const handleDeleteInstructor = async (id: string) => {
    try {
      setDeletingId(id);
      const previous = instructors;
      setInstructors((prev) => prev.filter((i) => i.id !== id));
      try {
        await deleteInstructor(id);
      } catch (err) {
        setInstructors(previous);
        throw err;
      }
      if (selectedInstructor?.id === id) {
        setSelectedInstructor(null);
      }
      toast({
        title: "Instructor Deleted",
        description: "The instructor has been removed.",
      });
    } catch (error: any) {
      toast({
        title: "Error deleting instructor",
        description: error?.message || "Failed to delete instructor",
        variant: "destructive",
      });
    } finally {
      setDeletingId(null);
    }
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
              {loading ? (
                <div className="flex items-center justify-center py-10 text-muted-foreground gap-2">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Loading instructors...
                </div>
              ) : (
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
                              <AvatarImage src={instructor.avatar} alt={instructor.fullName} />
                              <AvatarFallback>
                                {(instructor.fullName || `${instructor.firstName} ${instructor.lastName}` || "N")
                                  .split(" ")
                                  .map(n => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            {instructor.fullName}
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
                                <Button variant="ghost" size="icon" disabled={deletingId === instructor.id}>
                                  {deletingId === instructor.id ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                  )}
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Instructor</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete {instructor.fullName}? This action cannot be undone.
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
              )}
            </CardContent>
          </Card>
          
          {/* Right column - Instructor Profile */}
          <Card className="w-full lg:w-1/3 h-fit mx-auto">
            {selectedInstructor ? (
              <>
                <CardHeader>
                  <div className="flex flex-col items-center gap-2">
                    <div className="flex flex-col items-center gap-2">
                      <Avatar className="h-16 w-16">
                        <AvatarImage src={selectedInstructor.avatar || ""} alt={selectedInstructor.fullName} />
                        <AvatarFallback className="text-lg">
                          {(selectedInstructor.fullName || `${selectedInstructor.firstName} ${selectedInstructor.lastName}`)
                            .split(" ")
                            .map(n => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="w-full flex flex-col items-center text-center space-y-1">
                        <CardTitle className="text-center">{selectedInstructor.fullName}</CardTitle>
                        <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground">
                          <Mail className="h-4 w-4" />
                          {selectedInstructor.email}
                        </div>
                        <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground">
                          <Phone className="h-4 w-4" />
                          {selectedInstructor.phone || "No phone"}
                        </div>
                      </div>
                    </div>
                    <Badge variant="secondary" className="capitalize self-center mt-1">
                      {selectedInstructor.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Hire Date</p>
                        <p className="text-sm text-muted-foreground">{selectedInstructor.hireDate}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Award className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">License #</p>
                        <p className="text-sm text-muted-foreground">{selectedInstructor.licenseNumber || "—"}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Award className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Cert Expiry</p>
                        <p className="text-sm text-muted-foreground">{selectedInstructor.certificationExpiry || "—"}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Award className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Employee ID</p>
                        <p className="text-sm text-muted-foreground">{selectedInstructor.employeeId}</p>
                      </div>
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
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  name="firstName"
                  value={formData.firstName || ""}
                  onChange={handleInputChange}
                  placeholder="John"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  name="lastName"
                  value={formData.lastName || ""}
                  onChange={handleInputChange}
                  placeholder="Doe"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email || ""}
                  onChange={handleInputChange}
                  placeholder="john.doe@example.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="hireDate">Hire Date *</Label>
                <Input
                  id="hireDate"
                  name="hireDate"
                  type="date"
                  value={formData.hireDate || ""}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="licenseNumber">License Number</Label>
                <Input
                  id="licenseNumber"
                  name="licenseNumber"
                  value={formData.licenseNumber || ""}
                  onChange={handleInputChange}
                  placeholder="INS-XXXX-XXXX"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="certificationExpiry">Certification Expiry</Label>
                <Input
                  id="certificationExpiry"
                  name="certificationExpiry"
                  type="date"
                  value={formData.certificationExpiry || ""}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  name="phone"
                  value={formData.phone || ""}
                  onChange={handleInputChange}
                  placeholder="(555) XXX-XXXX"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="whatsapp">WhatsApp</Label>
                <Input
                  id="whatsapp"
                  name="whatsapp"
                  value={formData.whatsapp || ""}
                  onChange={handleInputChange}
                  placeholder="(555) XXX-XXXX"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="employeeId">Employee ID</Label>
                <Input
                  id="employeeId"
                  name="employeeId"
                  value={formData.employeeId || ""}
                  onChange={handleInputChange}
                  placeholder="EMP-001"
                />
              </div>
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
                <Label htmlFor="edit-firstName">First Name *</Label>
                <Input
                  id="edit-firstName"
                  name="firstName"
                  value={formData.firstName || ''}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-lastName">Last Name *</Label>
                <Input
                  id="edit-lastName"
                  name="lastName"
                  value={formData.lastName || ''}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-email">Email *</Label>
                <Input
                  id="edit-email"
                  name="email"
                  type="email"
                  value={formData.email || ''}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-hireDate">Hire Date *</Label>
                <Input
                  id="edit-hireDate"
                  name="hireDate"
                  type="date"
                  value={formData.hireDate || ''}
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
                <Label htmlFor="edit-certificationExpiry">Certification Expiry</Label>
                <Input
                  id="edit-certificationExpiry"
                  name="certificationExpiry"
                  type="date"
                  value={formData.certificationExpiry || ''}
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
              <div className="space-y-2">
                <Label htmlFor="edit-whatsapp">WhatsApp</Label>
                <Input
                  id="edit-whatsapp"
                  name="whatsapp"
                  value={formData.whatsapp || ''}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-employeeId">Employee ID</Label>
                <Input
                  id="edit-employeeId"
                  name="employeeId"
                  value={formData.employeeId || ''}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-status">Status</Label>
                <Input
                  id="edit-status"
                  name="status"
                  value={formData.status || "active"}
                  onChange={handleInputChange}
                  placeholder="active | inactive | on_leave"
                />
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateInstructor} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageLayout>
  );
};

export default InstructorsSection; 