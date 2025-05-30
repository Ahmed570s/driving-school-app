import React, { useState } from "react";
import { PageLayout } from "@/components/ui/page-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { 
  Users, 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Eye, 
  UserPlus, 
  UserMinus, 
  ArrowRight,
  BookOpen,
  GraduationCap,
  CalendarDays,
  StickyNote,
  CheckCircle2,
  Circle,
  UserCheck,
  Move
} from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";

// Types
interface Student {
  id: number;
  name: string;
  email: string;
  phone: string;
  joinDate: string;
  status: "active" | "completed" | "dropped";
  groupId?: number | null;
}

interface Group {
  id: number;
  name: string;
  description?: string;
  status: "active" | "completed";
  currentPhase: 1 | 2 | 3 | 4;
  sessionsCompleted: number;
  totalSessions: number;
  notes?: string;
  createdDate: string;
  students: number[];
}

// Dummy Data
const dummyStudents: Student[] = [
  { id: 1, name: "Emma Wilson", email: "emma.wilson@email.com", phone: "(555) 123-4567", joinDate: "2024-01-15", status: "active", groupId: 1 },
  { id: 2, name: "John Smith", email: "john.smith@email.com", phone: "(555) 234-5678", joinDate: "2024-01-20", status: "active", groupId: 1 },
  { id: 3, name: "Sophia Garcia", email: "sophia.garcia@email.com", phone: "(555) 345-6789", joinDate: "2024-02-01", status: "active", groupId: 2 },
  { id: 4, name: "Michael Johnson", email: "michael.j@email.com", phone: "(555) 456-7890", joinDate: "2024-02-05", status: "active", groupId: 2 },
  { id: 5, name: "Olivia Brown", email: "olivia.brown@email.com", phone: "(555) 567-8901", joinDate: "2024-01-10", status: "completed", groupId: 3 },
  { id: 6, name: "David Lee", email: "david.lee@email.com", phone: "(555) 678-9012", joinDate: "2024-01-12", status: "completed", groupId: 3 },
  { id: 7, name: "Ava Martinez", email: "ava.martinez@email.com", phone: "(555) 789-0123", joinDate: "2024-03-01", status: "active", groupId: null },
  { id: 8, name: "James Wilson", email: "james.wilson@email.com", phone: "(555) 890-1234", joinDate: "2024-03-05", status: "active", groupId: null },
  { id: 9, name: "Tyler Rodriguez", email: "tyler.r@email.com", phone: "(555) 234-5678", joinDate: "2024-02-15", status: "active", groupId: 1 },
  { id: 10, name: "Isabella Lopez", email: "isabella.lopez@email.com", phone: "(555) 345-6789", joinDate: "2024-02-20", status: "active", groupId: 2 },
];

const dummyGroups: Group[] = [
  {
    id: 1,
    name: "Group A - Morning Theory",
    description: "Morning theory sessions for beginners",
    status: "active",
    currentPhase: 2,
    sessionsCompleted: 8,
    totalSessions: 16,
    notes: "Fast-learning group, ahead of schedule",
    createdDate: "2024-01-15",
    students: [1, 2, 9]
  },
  {
    id: 2,
    name: "Group B - Evening Theory", 
    description: "Evening theory sessions",
    status: "active",
    currentPhase: 1,
    sessionsCompleted: 4,
    totalSessions: 16,
    notes: "Need extra focus on traffic rules",
    createdDate: "2024-02-01",
    students: [3, 4, 10]
  },
  {
    id: 3,
    name: "Group C - Weekend Intensive",
    description: "Weekend intensive theory course",
    status: "completed",
    currentPhase: 4,
    sessionsCompleted: 16,
    totalSessions: 16,
    notes: "Excellent group, all students passed",
    createdDate: "2024-01-10",
    students: [5, 6]
  },
];

// Form data interfaces
interface GroupFormData {
  name: string;
  description: string;
  currentPhase: 1 | 2 | 3 | 4;
  totalSessions: number;
  notes: string;
}

const GroupsSection = () => {
  // State management
  const [groups, setGroups] = useState<Group[]>(dummyGroups);
  const [students, setStudents] = useState<Student[]>(dummyStudents);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "completed">("all");
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [selectedStudents, setSelectedStudents] = useState<number[]>([]);
  
  // Modal states
  const [createGroupOpen, setCreateGroupOpen] = useState(false);
  const [editGroupOpen, setEditGroupOpen] = useState(false);
  const [groupDetailsOpen, setGroupDetailsOpen] = useState(false);
  const [deleteGroupOpen, setDeleteGroupOpen] = useState(false);
  const [groupToDelete, setGroupToDelete] = useState<Group | null>(null);
  
  // Form data
  const [groupFormData, setGroupFormData] = useState<GroupFormData>({
    name: "",
    description: "",
    currentPhase: 1,
    totalSessions: 16,
    notes: "",
  });

  // Computed values
  const filteredGroups = groups.filter(group => {
    const matchesSearch = group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         group.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || group.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const unassignedStudents = students.filter(student => !student.groupId);

  // Helper functions
  const getStudentsInGroup = (groupId: number) => {
    return students.filter(student => student.groupId === groupId);
  };

  const getProgressPercentage = (completed: number, total: number) => {
    return Math.round((completed / total) * 100);
  };

  const getPhaseColor = (phase: number) => {
    const colors = {
      1: "bg-red-100 text-red-800",
      2: "bg-yellow-100 text-yellow-800", 
      3: "bg-blue-100 text-blue-800",
      4: "bg-green-100 text-green-800"
    };
    return colors[phase as keyof typeof colors];
  };

  // Form handlers
  const handleCreateGroup = () => {
    const newGroup: Group = {
      id: Math.max(...groups.map(g => g.id)) + 1,
      name: groupFormData.name,
      description: groupFormData.description,
      status: "active",
      currentPhase: groupFormData.currentPhase,
      sessionsCompleted: 0,
      totalSessions: groupFormData.totalSessions,
      notes: groupFormData.notes,
      createdDate: new Date().toISOString().split('T')[0],
      students: []
    };
    
    setGroups([...groups, newGroup]);
    setCreateGroupOpen(false);
    resetForm();
  };

  const handleEditGroup = () => {
    if (!selectedGroup) return;
    
    const updatedGroups = groups.map(group => 
      group.id === selectedGroup.id 
        ? { ...group, ...groupFormData }
        : group
    );
    
    setGroups(updatedGroups);
    setEditGroupOpen(false);
    setSelectedGroup(null);
    resetForm();
  };

  const handleDeleteGroup = () => {
    if (!groupToDelete) return;
    
    // Remove group and unassign students
    setGroups(groups.filter(g => g.id !== groupToDelete.id));
    setStudents(students.map(student => 
      student.groupId === groupToDelete.id 
        ? { ...student, groupId: null }
        : student
    ));
    
    setDeleteGroupOpen(false);
    setGroupToDelete(null);
  };

  const handleAddStudentToGroup = (studentId: number, groupId: number) => {
    setStudents(students.map(student => 
      student.id === studentId 
        ? { ...student, groupId }
        : student
    ));
  };

  const handleRemoveStudentFromGroup = (studentId: number) => {
    setStudents(students.map(student => 
      student.id === studentId 
        ? { ...student, groupId: null }
        : student
    ));
  };

  const handleMoveStudents = (studentIds: number[], targetGroupId: number | null) => {
    setStudents(students.map(student => 
      studentIds.includes(student.id)
        ? { ...student, groupId: targetGroupId }
        : student
    ));
    setSelectedStudents([]);
  };

  const resetForm = () => {
    setGroupFormData({
      name: "",
      description: "",
      currentPhase: 1,
      totalSessions: 16,
      notes: "",
    });
  };

  const openEditDialog = (group: Group) => {
    setSelectedGroup(group);
    setGroupFormData({
      name: group.name,
      description: group.description || "",
      currentPhase: group.currentPhase,
      totalSessions: group.totalSessions,
      notes: group.notes || "",
    });
    setEditGroupOpen(true);
  };

  const openGroupDetails = (group: Group) => {
    setSelectedGroup(group);
    setGroupDetailsOpen(true);
  };

  return (
    <PageLayout>
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Groups Management</h1>
          <Button onClick={() => setCreateGroupOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create Group
          </Button>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex gap-4 items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search groups by name or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={(value: "all" | "active" | "completed") => setStatusFilter(value)}>
                <SelectTrigger className="w-[180px]">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Groups</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Groups Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredGroups.map((group) => {
            const groupStudents = getStudentsInGroup(group.id);
            const progressPercentage = getProgressPercentage(group.sessionsCompleted, group.totalSessions);
            
            return (
              <Card 
                key={group.id} 
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => openGroupDetails(group)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{group.name}</CardTitle>
                      {group.description && (
                        <p className="text-sm text-muted-foreground mt-1">{group.description}</p>
                      )}
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openGroupDetails(group)}>
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => openEditDialog(group)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit Group
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => { setGroupToDelete(group); setDeleteGroupOpen(true); }}
                          className="text-red-600"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete Group
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Status and Phase */}
                  <div className="flex items-center justify-between">
                    <Badge variant={group.status === "active" ? "default" : "secondary"}>
                      {group.status === "active" ? "Active" : "Completed"}
                    </Badge>
                    <Badge className={getPhaseColor(group.currentPhase)}>
                      Phase {group.currentPhase}
                    </Badge>
                  </div>

                  {/* Progress */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-medium">{progressPercentage}%</span>
                    </div>
                    <Progress value={progressPercentage} className="h-2" />
                    <p className="text-xs text-muted-foreground">
                      {group.sessionsCompleted} of {group.totalSessions} sessions completed
                    </p>
                  </div>

                  {/* Students Count */}
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Users className="mr-2 h-4 w-4" />
                    {groupStudents.length} student{groupStudents.length !== 1 ? 's' : ''}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Unassigned Students */}
        {unassignedStudents.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <UserCheck className="mr-2 h-5 w-5" />
                Unassigned Students ({unassignedStudents.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {unassignedStudents.map((student) => (
                  <div key={student.id} className="flex items-center justify-between p-2 border rounded">
                    <div>
                      <p className="font-medium">{student.name}</p>
                      <p className="text-sm text-muted-foreground">{student.email}</p>
                    </div>
                    <Select onValueChange={(value) => handleAddStudentToGroup(student.id, parseInt(value))}>
                      <SelectTrigger className="w-[200px]">
                        <SelectValue placeholder="Assign to group" />
                      </SelectTrigger>
                      <SelectContent>
                        {groups.filter(g => g.status === "active").map((group) => (
                          <SelectItem key={group.id} value={group.id.toString()}>
                            {group.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Create/Edit Group Dialog */}
        <Dialog open={createGroupOpen || editGroupOpen} onOpenChange={() => {
          setCreateGroupOpen(false);
          setEditGroupOpen(false);
          resetForm();
        }}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>{editGroupOpen ? "Edit Group" : "Create New Group"}</DialogTitle>
              <DialogDescription>
                {editGroupOpen ? "Update the group information below." : "Fill in the details to create a new theory group."}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Group Name</Label>
                <Input
                  id="name"
                  value={groupFormData.name}
                  onChange={(e) => setGroupFormData({ ...groupFormData, name: e.target.value })}
                  placeholder="Enter group name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  value={groupFormData.description}
                  onChange={(e) => setGroupFormData({ ...groupFormData, description: e.target.value })}
                  placeholder="Enter group description"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phase">Current Phase</Label>
                  <Select 
                    value={groupFormData.currentPhase.toString()} 
                    onValueChange={(value) => setGroupFormData({ ...groupFormData, currentPhase: parseInt(value) as 1 | 2 | 3 | 4 })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Phase 1</SelectItem>
                      <SelectItem value="2">Phase 2</SelectItem>
                      <SelectItem value="3">Phase 3</SelectItem>
                      <SelectItem value="4">Phase 4</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="totalSessions">Total Sessions</Label>
                  <Input
                    id="totalSessions"
                    type="number"
                    value={groupFormData.totalSessions}
                    onChange={(e) => setGroupFormData({ ...groupFormData, totalSessions: parseInt(e.target.value) || 16 })}
                    min="1"
                    max="50"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  value={groupFormData.notes}
                  onChange={(e) => setGroupFormData({ ...groupFormData, notes: e.target.value })}
                  placeholder="Enter any notes about this group"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => {
                setCreateGroupOpen(false);
                setEditGroupOpen(false);
                resetForm();
              }}>
                Cancel
              </Button>
              <Button onClick={editGroupOpen ? handleEditGroup : handleCreateGroup}>
                {editGroupOpen ? "Update Group" : "Create Group"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Group Details Sheet */}
        <Sheet open={groupDetailsOpen} onOpenChange={setGroupDetailsOpen}>
          <SheetContent className="sm:max-w-2xl">
            {selectedGroup && (
              <>
                <SheetHeader>
                  <SheetTitle>{selectedGroup.name}</SheetTitle>
                  <SheetDescription>{selectedGroup.description}</SheetDescription>
                </SheetHeader>
                <div className="mt-6">
                  <Tabs defaultValue="overview" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="overview">Overview</TabsTrigger>
                      <TabsTrigger value="students">Students</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="overview" className="space-y-4 mt-4">
                      <div className="grid grid-cols-2 gap-4">
                        <Card>
                          <CardContent className="p-4">
                            <div className="flex items-center space-x-2">
                              <BookOpen className="h-5 w-5 text-blue-600" />
                              <div>
                                <p className="text-sm font-medium">Current Phase</p>
                                <p className="text-2xl font-bold">Phase {selectedGroup.currentPhase}</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardContent className="p-4">
                            <div className="flex items-center space-x-2">
                              <GraduationCap className="h-5 w-5 text-green-600" />
                              <div>
                                <p className="text-sm font-medium">Progress</p>
                                <p className="text-2xl font-bold">
                                  {getProgressPercentage(selectedGroup.sessionsCompleted, selectedGroup.totalSessions)}%
                                </p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                      
                      <Card>
                        <CardContent className="p-4">
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Sessions Progress</span>
                              <span>{selectedGroup.sessionsCompleted} / {selectedGroup.totalSessions}</span>
                            </div>
                            <Progress 
                              value={getProgressPercentage(selectedGroup.sessionsCompleted, selectedGroup.totalSessions)} 
                              className="h-3"
                            />
                          </div>
                        </CardContent>
                      </Card>
                      
                      {selectedGroup.notes && (
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-sm flex items-center">
                              <StickyNote className="mr-2 h-4 w-4" />
                              Notes
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p className="text-sm text-muted-foreground">{selectedGroup.notes}</p>
                          </CardContent>
                        </Card>
                      )}
                    </TabsContent>
                    
                    <TabsContent value="students" className="mt-4">
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <h3 className="text-lg font-medium">Group Students</h3>
                          <div className="flex gap-2">
                            {selectedStudents.length > 0 && (
                              <Select onValueChange={(value) => {
                                if (value === "remove") {
                                  selectedStudents.forEach(id => handleRemoveStudentFromGroup(id));
                                } else {
                                  handleMoveStudents(selectedStudents, parseInt(value));
                                }
                              }}>
                                <SelectTrigger className="w-[150px]">
                                  <SelectValue placeholder="Move selected" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="remove">Remove from group</SelectItem>
                                  {groups
                                    .filter(g => g.id !== selectedGroup.id && g.status === "active")
                                    .map((group) => (
                                      <SelectItem key={group.id} value={group.id.toString()}>
                                        {group.name}
                                      </SelectItem>
                                    ))}
                                </SelectContent>
                              </Select>
                            )}
                          </div>
                        </div>
                        
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="w-12">
                                <Checkbox
                                  checked={selectedStudents.length === getStudentsInGroup(selectedGroup.id).length}
                                  onCheckedChange={(checked) => {
                                    if (checked) {
                                      setSelectedStudents(getStudentsInGroup(selectedGroup.id).map(s => s.id));
                                    } else {
                                      setSelectedStudents([]);
                                    }
                                  }}
                                />
                              </TableHead>
                              <TableHead>Name</TableHead>
                              <TableHead>Contact</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead className="w-12"></TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {getStudentsInGroup(selectedGroup.id).map((student) => (
                              <TableRow key={student.id}>
                                <TableCell>
                                  <Checkbox
                                    checked={selectedStudents.includes(student.id)}
                                    onCheckedChange={(checked) => {
                                      if (checked) {
                                        setSelectedStudents([...selectedStudents, student.id]);
                                      } else {
                                        setSelectedStudents(selectedStudents.filter(id => id !== student.id));
                                      }
                                    }}
                                  />
                                </TableCell>
                                <TableCell>
                                  <div>
                                    <p className="font-medium">{student.name}</p>
                                    <p className="text-sm text-muted-foreground">{student.email}</p>
                                  </div>
                                </TableCell>
                                <TableCell>{student.phone}</TableCell>
                                <TableCell>
                                  <Badge variant={student.status === "active" ? "default" : "secondary"}>
                                    {student.status}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleRemoveStudentFromGroup(student.id)}
                                  >
                                    <UserMinus className="h-4 w-4" />
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                        
                        {unassignedStudents.length > 0 && (
                          <div className="space-y-2">
                            <h4 className="font-medium">Add Students to Group</h4>
                            {unassignedStudents.map((student) => (
                              <div key={student.id} className="flex items-center justify-between p-2 border rounded">
                                <div>
                                  <p className="font-medium">{student.name}</p>
                                  <p className="text-sm text-muted-foreground">{student.email}</p>
                                </div>
                                <Button
                                  size="sm"
                                  onClick={() => handleAddStudentToGroup(student.id, selectedGroup.id)}
                                >
                                  <UserPlus className="mr-2 h-4 w-4" />
                                  Add
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>
              </>
            )}
          </SheetContent>
        </Sheet>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteGroupOpen} onOpenChange={setDeleteGroupOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Group</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete "{groupToDelete?.name}"? This action cannot be undone.
                All students in this group will be unassigned.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteGroup} className="bg-red-600 hover:bg-red-700">
                Delete Group
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </PageLayout>
  );
};

export default GroupsSection; 