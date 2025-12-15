import React, { useEffect, useMemo, useState } from "react";
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
  BookOpen,
  GraduationCap,
  StickyNote,
  UserCheck,
} from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { useToast } from "@/components/ui/use-toast";
import {
  Group,
  GroupInput,
  addStudentToGroup,
  createGroup,
  deleteGroup,
  getGroupStudents,
  getGroups,
  updateGroup,
  removeStudentFromGroup,
} from "@/services/groups";
import { BasicStudent } from "@/data/students";
import { getStudentsForScheduling } from "@/services/students";
import { getClasses } from "@/services/classes";

interface GroupFormData {
  name: string;
  description: string;
  capacity: number;
  status: "active" | "completed" | "cancelled";
  startDate: string;
  endDate: string;
  primaryInstructorId: string | null;
}

interface FormErrors {
  name?: string;
  capacity?: string;
  status?: string;
}

const GroupsSection = () => {
  const { toast } = useToast();

  const [groups, setGroups] = useState<Group[]>([]);
  const [students, setStudents] = useState<BasicStudent[]>([]);
  const [groupMembers, setGroupMembers] = useState<Record<string, BasicStudent[]>>({});
  const [groupProgress, setGroupProgress] = useState<Record<string, { total: number; completed: number; percent: number }>>({});
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "completed" | "cancelled">("all");
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [createGroupOpen, setCreateGroupOpen] = useState(false);
  const [editGroupOpen, setEditGroupOpen] = useState(false);
  const [groupDetailsOpen, setGroupDetailsOpen] = useState(false);
  const [deleteGroupOpen, setDeleteGroupOpen] = useState(false);
  const [groupToDelete, setGroupToDelete] = useState<Group | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [membersLoading, setMembersLoading] = useState(false);
  const [groupTheoryClasses, setGroupTheoryClasses] = useState<any[]>([]);
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [groupFormData, setGroupFormData] = useState<GroupFormData>({
    name: "",
    description: "",
    capacity: 12,
    status: "active",
    startDate: "",
    endDate: "",
    primaryInstructorId: null,
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [fetchedGroups, fetchedStudents] = await Promise.all([
          getGroups(),
          getStudentsForScheduling(),
        ]);
        setGroups(fetchedGroups);
        setStudents(fetchedStudents);

        // Load all group memberships upfront so unassigned students can be computed
        const membersMap: Record<string, BasicStudent[]> = {};
        await Promise.all(
          fetchedGroups.map(async (g) => {
            try {
              const data = await getGroupStudents(g.id);
              membersMap[g.id] = data.map((item: any) => {
                const st = item.students;
                return {
                  id: st.id,
                  name: `${st.profiles.first_name} ${st.profiles.last_name}`,
                  studentId: st.student_id,
                  email: st.profiles.email,
                  phone: st.profiles.phone,
                  group: "none",
                  hoursDone: 0,
                  currentPhase: 1,
                  status: "active",
                  hasBalance: false,
                  hasMissingClasses: false,
                } as BasicStudent;
              });
            } catch {
              membersMap[g.id] = [];
            }
          })
        );
        setGroupMembers(membersMap);

        await loadGroupProgress(fetchedGroups.map((g) => g.id));
      } catch (error: any) {
        toast({
          title: "Error loading groups",
          description: error?.message || "Failed to load groups",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [toast]);

  const filteredGroups = useMemo(() => {
    return groups.filter((group) => {
      const matchesSearch =
        group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        group.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "all" || group.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [groups, searchTerm, statusFilter]);

  const unassignedStudents = useMemo(() => {
    const inGroups = new Set<string>();
    Object.values(groupMembers).forEach((list) =>
      list.forEach((s) => inGroups.add(s.id))
    );
    return students.filter((s) => !inGroups.has(s.id));
  }, [students, groupMembers]);

  const getStudentsInGroup = (groupId: string) => groupMembers[groupId] || [];

  const loadGroupProgress = async (groupIds: string[]) => {
    try {
      const entries = await Promise.all(
        groupIds.map(async (id) => {
          const classes = await getClasses({ groupId: id, type: "theory" as any });
          const TOTAL_THEORY = 12;
          const completed = Math.min(
            TOTAL_THEORY,
            classes.filter((c) => c.status === "completed").length
          );
          const percent = Math.round((completed / TOTAL_THEORY) * 100);
          const total = TOTAL_THEORY;
          return [id, { total, completed, percent }];
        })
      );
      setGroupProgress(Object.fromEntries(entries));
    } catch (error: any) {
      toast({
        title: "Error loading group progress",
        description: error?.message || "Failed to load theory class progress",
        variant: "destructive",
      });
    }
  };

  const loadGroupMembers = async (groupId: string) => {
    try {
      setMembersLoading(true);
      const data = await getGroupStudents(groupId);
      const members: BasicStudent[] = data.map((item: any) => {
        const st = item.students;
        return {
          id: st.id,
          name: `${st.profiles.first_name} ${st.profiles.last_name}`,
          studentId: st.student_id,
          email: st.profiles.email,
          phone: st.profiles.phone,
          group: "none",
          hoursDone: 0,
          currentPhase: 1,
          status: "active",
          hasBalance: false,
          hasMissingClasses: false,
        } as BasicStudent;
      });
      setGroupMembers((prev) => ({ ...prev, [groupId]: members }));
    } catch (error: any) {
      toast({
        title: "Error loading members",
        description: error?.message || "Failed to load group members",
        variant: "destructive",
      });
    } finally {
      setMembersLoading(false);
    }
  };

  const getStatusBadgeClass = (status: Group["status"]) => {
    if (status === "active") return "bg-green-100 text-green-800";
    if (status === "completed") return "bg-blue-100 text-blue-800";
    if (status === "cancelled") return "bg-red-100 text-red-800";
    return "bg-gray-200 text-gray-800";
  };

  const validateForm = (): boolean => {
    const errors: FormErrors = {};

    // Name is required
    if (!groupFormData.name.trim()) {
      errors.name = "Group name is required";
    }

    // Capacity must be at least 1
    if (!groupFormData.capacity || groupFormData.capacity < 1) {
      errors.capacity = "Capacity must be at least 1";
    }

    // Status is required (always has a default, but check anyway)
    if (!groupFormData.status) {
      errors.status = "Status is required";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreateGroup = async () => {
    // Validate form
    if (!validateForm()) {
      toast({ 
        title: "Validation Error", 
        description: "Please fix the errors in the form",
        variant: "destructive" 
      });
      return;
    }

    // Optimistic: create a temp group immediately
    const tempId = `temp-${Date.now()}`;
    const optimisticGroup: Group = {
      id: tempId,
      name: groupFormData.name.trim(),
      description: groupFormData.description || "",
      capacity: groupFormData.capacity,
      currentEnrollment: 0,
      availableSpots: groupFormData.capacity,
      status: groupFormData.status,
      startDate: groupFormData.startDate || "",
      endDate: groupFormData.endDate || "",
      primaryInstructor: { id: null, name: "No Instructor", email: "", phone: "" },
      enrollmentPercentage: 0,
      isActive: groupFormData.status === "active",
      isFull: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Add optimistic group to list
    setGroups((prev) => [optimisticGroup, ...prev]);
    setGroupProgress((prev) => ({ ...prev, [tempId]: { total: 12, completed: 0, percent: 0 } }));
    // Initialize empty members for the new group so it appears in dropdowns
    setGroupMembers((prev) => ({ ...prev, [tempId]: [] }));
    setCreateGroupOpen(false);
    resetForm();

    try {
      setSaving(true);
      const input: GroupInput = {
        name: groupFormData.name.trim(),
        description: groupFormData.description || "",
        capacity: groupFormData.capacity,
        status: groupFormData.status,
        startDate: groupFormData.startDate || null,
        endDate: groupFormData.endDate || null,
        primaryInstructorId: groupFormData.primaryInstructorId || null,
      };
      const created = await createGroup(input);

      // Replace optimistic group with real one
      setGroups((prev) => prev.map((g) => (g.id === tempId ? created : g)));
      setGroupProgress((prev) => {
        const { [tempId]: _, ...rest } = prev;
        return { ...rest, [created.id]: { total: 12, completed: 0, percent: 0 } };
      });
      // Update groupMembers to use real ID
      setGroupMembers((prev) => {
        const { [tempId]: tempMembers, ...rest } = prev;
        return { ...rest, [created.id]: tempMembers || [] };
      });

      toast({ title: "Group created", description: created.name });
    } catch (error: any) {
      // Rollback optimistic update
      setGroups((prev) => prev.filter((g) => g.id !== tempId));
      setGroupProgress((prev) => {
        const { [tempId]: _, ...rest } = prev;
        return rest;
      });
      setGroupMembers((prev) => {
        const { [tempId]: _, ...rest } = prev;
        return rest;
      });

      toast({
        title: "Error creating group",
        description: error?.message || "Failed to create group",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleEditGroup = async () => {
    if (!selectedGroup) return;

    // Validate form
    if (!validateForm()) {
      toast({ 
        title: "Validation Error", 
        description: "Please fix the errors in the form",
        variant: "destructive" 
      });
      return;
    }

    try {
      setSaving(true);
      const input: Partial<GroupInput> = {
        name: groupFormData.name.trim(),
        description: groupFormData.description || "",
        capacity: groupFormData.capacity,
        status: groupFormData.status,
        startDate: groupFormData.startDate || null,
        endDate: groupFormData.endDate || null,
        primaryInstructorId: groupFormData.primaryInstructorId || null,
      };
      const updated = await updateGroup(selectedGroup.id, input);
      setGroups((prev) => prev.map((g) => (g.id === updated.id ? updated : g)));
      await loadGroupProgress([selectedGroup.id]);
      setEditGroupOpen(false);
      setSelectedGroup(null);
      resetForm();
      toast({ title: "Group updated", description: updated.name });
    } catch (error: any) {
      toast({
        title: "Error updating group",
        description: error?.message || "Failed to update group",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteGroup = async () => {
    if (!groupToDelete) return;

    const deletedGroupId = groupToDelete.id;
    const deletedGroupName = groupToDelete.name;

    // Optimistic: remove from list immediately
    const previousGroups = [...groups];
    const previousMembers = { ...groupMembers };
    const previousProgress = { ...groupProgress };

    setGroups((prev) => prev.filter((g) => g.id !== deletedGroupId));
    setGroupMembers((prev) => {
      const copy = { ...prev };
      delete copy[deletedGroupId];
      return copy;
    });
    setGroupProgress((prev) => {
      const copy = { ...prev };
      delete copy[deletedGroupId];
      return copy;
    });
    setDeleteGroupOpen(false);
    setGroupToDelete(null);

    try {
      setDeletingId(deletedGroupId);
      await deleteGroup(deletedGroupId);
      toast({ title: "Group deleted", description: deletedGroupName });
    } catch (error: any) {
      // Rollback optimistic update
      setGroups(previousGroups);
      setGroupMembers(previousMembers);
      setGroupProgress(previousProgress);

      toast({
        title: "Error deleting group",
        description: error?.message || "Failed to delete group",
        variant: "destructive",
      });
    } finally {
      setDeletingId(null);
    }
  };

  const handleAddStudentToGroup = async (studentId: string, groupId: string) => {
    try {
      await addStudentToGroup(groupId, studentId, "active");
      await loadGroupMembers(groupId);
      toast({ title: "Student added" });
    } catch (error: any) {
      toast({
        title: "Error adding student",
        description: error?.message || "Failed to add student",
        variant: "destructive",
      });
    }
  };

  const handleRemoveStudentFromGroup = async (groupId: string, studentId: string) => {
    try {
      await removeStudentFromGroup(groupId, studentId);
      await loadGroupMembers(groupId);
      toast({ title: "Student removed" });
    } catch (error: any) {
      toast({
        title: "Error removing student",
        description: error?.message || "Failed to remove student",
        variant: "destructive",
      });
    }
  };

  const handleMoveStudents = async (studentIds: string[], targetGroupId: string | null) => {
    if (!selectedGroup) return;
    try {
      for (const id of studentIds) {
        if (targetGroupId) {
          await addStudentToGroup(targetGroupId, id, "active");
        } else {
          await removeStudentFromGroup(selectedGroup.id, id);
        }
      }
      await loadGroupMembers(selectedGroup.id);
      if (targetGroupId) await loadGroupMembers(targetGroupId);
      setSelectedStudents([]);
      toast({ title: "Students moved" });
    } catch (error: any) {
      toast({
        title: "Error moving students",
        description: error?.message || "Failed to move students",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setGroupFormData({
      name: "",
      description: "",
      capacity: 12,
      status: "active",
      startDate: "",
      endDate: "",
      primaryInstructorId: null,
    });
    setFormErrors({});
  };

  const openEditDialog = (group: Group) => {
    setSelectedGroup(group);
    setGroupDetailsOpen(false);
    setGroupFormData({
      name: group.name,
      description: group.description || "",
      capacity: group.capacity,
      status: group.status,
      startDate: group.startDate || "",
      endDate: group.endDate || "",
      primaryInstructorId: group.primaryInstructor.id,
    });
    setEditGroupOpen(true);
  };

  const openGroupDetails = async (group: Group) => {
    setSelectedGroup(group);
    setGroupDetailsOpen(true);
    await loadGroupMembers(group.id);
    // Load theory classes for this group
    try {
      const classes = await getClasses({ groupId: group.id, type: "theory" as any });
      setGroupTheoryClasses(classes);
    } catch {
      setGroupTheoryClasses([]);
    }
  };

  return (
    <PageLayout>
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Groups Management</h1>
          <Button onClick={() => setCreateGroupOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create Group
          </Button>
        </div>

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
              <Select value={statusFilter} onValueChange={(value: "all" | "active" | "completed" | "cancelled") => setStatusFilter(value)}>
                <SelectTrigger className="w-[180px]">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Groups</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading groups...</p>
            </div>
          </div>
        )}

        {!loading && filteredGroups.length === 0 && (
          <Card className="p-8 text-center">
            <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No Groups Found</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm || statusFilter !== "all" 
                ? "No groups match your search criteria." 
                : "Get started by creating your first group."}
            </p>
            {!searchTerm && statusFilter === "all" && (
              <Button onClick={() => setCreateGroupOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create Group
              </Button>
            )}
          </Card>
        )}

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {!loading && filteredGroups.map((group) => {
            const groupStudents = groupMembers[group.id] || [];
            const progressData = groupProgress[group.id] || { total: 0, completed: 0, percent: 0 };

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
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
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
                          onClick={() => {
                            setGroupToDelete(group);
                            setDeleteGroupOpen(true);
                          }}
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
                  <div className="flex items-center justify-between">
                    <Badge className={getStatusBadgeClass(group.status)}>{group.status}</Badge>
                    <Badge variant={group.isFull ? "secondary" : "default"}>
                      {group.isFull ? "Full" : `${group.availableSpots} spots`}
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Theory Progress</span>
                      <span className="font-medium">{progressData.percent}%</span>
                    </div>
                    <Progress value={progressData.percent} className="h-2" />
                    <p className="text-xs text-muted-foreground">
                      {`${progressData.completed} of ${progressData.total} theory classes completed`}
                    </p>
                  </div>

                  <div className="flex items-center text-sm text-muted-foreground">
                    <Users className="mr-2 h-4 w-4" />
                    {groupStudents.length || group.currentEnrollment} student
                    {(groupStudents.length || group.currentEnrollment) !== 1 ? "s" : ""}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {!loading && unassignedStudents.length > 0 && (
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
                    <Select onValueChange={(value) => handleAddStudentToGroup(student.id, value)}>
                      <SelectTrigger className="w-[200px]">
                        <SelectValue placeholder="Assign to group" />
                      </SelectTrigger>
                      <SelectContent>
                        {groups
                          .filter((g) => g.status === "active")
                          .map((group) => (
                            <SelectItem key={group.id} value={group.id}>
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

        <Dialog
          open={createGroupOpen || editGroupOpen}
          onOpenChange={() => {
            setCreateGroupOpen(false);
            setEditGroupOpen(false);
            resetForm();
          }}
        >
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>{editGroupOpen ? "Edit Group" : "Create New Group"}</DialogTitle>
              <DialogDescription>
                {editGroupOpen ? "Update the group information below." : "Fill in the details to create a new theory group."}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Group Name *</Label>
                <Input
                  id="name"
                  value={groupFormData.name}
                  onChange={(e) => {
                    setGroupFormData({ ...groupFormData, name: e.target.value });
                    if (formErrors.name) setFormErrors({ ...formErrors, name: undefined });
                  }}
                  placeholder="Enter group name"
                  className={formErrors.name ? "border-red-500" : ""}
                />
                {formErrors.name && (
                  <p className="text-sm text-red-500">{formErrors.name}</p>
                )}
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
                  <Label htmlFor="capacity">Capacity *</Label>
                  <Input
                    id="capacity"
                    type="number"
                    value={groupFormData.capacity}
                    onChange={(e) => {
                      setGroupFormData({ ...groupFormData, capacity: parseInt(e.target.value) || 1 });
                      if (formErrors.capacity) setFormErrors({ ...formErrors, capacity: undefined });
                    }}
                    min="1"
                    max="50"
                    className={formErrors.capacity ? "border-red-500" : ""}
                  />
                  {formErrors.capacity && (
                    <p className="text-sm text-red-500">{formErrors.capacity}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status *</Label>
                  <Select
                    value={groupFormData.status}
                    onValueChange={(value: Group["status"]) => {
                      setGroupFormData({ ...groupFormData, status: value });
                      if (formErrors.status) setFormErrors({ ...formErrors, status: undefined });
                    }}
                  >
                    <SelectTrigger className={formErrors.status ? "border-red-500" : ""}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                  {formErrors.status && (
                    <p className="text-sm text-red-500">{formErrors.status}</p>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={groupFormData.startDate}
                    onChange={(e) => setGroupFormData({ ...groupFormData, startDate: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={groupFormData.endDate}
                    onChange={(e) => setGroupFormData({ ...groupFormData, endDate: e.target.value })}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setCreateGroupOpen(false);
                  setEditGroupOpen(false);
                  resetForm();
                }}
              >
                Cancel
              </Button>
              <Button onClick={editGroupOpen ? handleEditGroup : handleCreateGroup} disabled={saving}>
                {saving ? "Saving..." : editGroupOpen ? "Update Group" : "Create Group"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Sheet open={groupDetailsOpen} onOpenChange={setGroupDetailsOpen}>
          <SheetContent className="sm:max-w-2xl">
            {selectedGroup && (
              <>
                <SheetHeader>
                  <SheetTitle>{selectedGroup.name}</SheetTitle>
                  <SheetDescription>{selectedGroup.description}</SheetDescription>
                </SheetHeader>
                <div className="mt-6 flex flex-col h-[calc(100vh-140px)]">
                  <Tabs defaultValue="overview" className="w-full flex flex-col flex-1 overflow-hidden">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="overview">Overview</TabsTrigger>
                      <TabsTrigger value="students">Students</TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="space-y-4 mt-4 overflow-y-auto flex-1">
                      <div className="grid grid-cols-2 gap-4">
                        <Card>
                          <CardContent className="p-4">
                            <div className="flex items-center space-x-2">
                              <BookOpen className="h-5 w-5 text-blue-600" />
                              <div>
                                <p className="text-sm font-medium">Capacity</p>
                                <p className="text-2xl font-bold">{selectedGroup.capacity}</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardContent className="p-4">
                            <div className="flex items-center space-x-2">
                              <GraduationCap className="h-5 w-5 text-green-600" />
                              <div>
                                <p className="text-sm font-medium">Enrolled</p>
                                <p className="text-2xl font-bold">
                                  {selectedGroup.currentEnrollment}/{selectedGroup.capacity}
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
                              <span>Dates</span>
                              <span>
                                {selectedGroup.startDate || "N/A"} - {selectedGroup.endDate || "N/A"}
                              </span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Theory Classes Progress */}
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base flex items-center gap-2">
                            <BookOpen className="h-4 w-4" />
                            Theory Classes ({groupTheoryClasses.filter(c => c.status === 'completed').length}/12 completed)
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                          <div className="space-y-2">
                            {/* Show all 12 theory class slots */}
                            {Array.from({ length: 12 }, (_, i) => {
                              const classNum = i + 1;
                              // Find a matching class for this slot (by title or order)
                              const matchingClass = groupTheoryClasses.find(
                                (c) => c.className?.includes(`${classNum}`) || c.className?.includes(`Class ${classNum}`)
                              ) || groupTheoryClasses[i];
                              const isCompleted = matchingClass?.status === 'completed';
                              const isScheduled = matchingClass && matchingClass.status !== 'completed';

                              // Theory class names based on the SAAQ program
                              const theoryClassNames = [
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

                              return (
                                <div
                                  key={classNum}
                                  className={`flex items-center justify-between p-2 rounded border ${
                                    isCompleted
                                      ? "bg-green-50 border-green-200"
                                      : isScheduled
                                      ? "bg-blue-50 border-blue-200"
                                      : "bg-gray-50 border-gray-200"
                                  }`}
                                >
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium w-6">{classNum}.</span>
                                    <span className="text-sm">{theoryClassNames[i]}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    {isCompleted ? (
                                      <Badge className="bg-green-600">Completed</Badge>
                                    ) : isScheduled ? (
                                      <Badge variant="outline" className="border-blue-400 text-blue-600">
                                        Scheduled
                                      </Badge>
                                    ) : (
                                      <Badge variant="outline" className="text-gray-500">
                                        Not Scheduled
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>

                    <TabsContent value="students" className="mt-4 overflow-y-auto flex-1">
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <h3 className="text-lg font-medium">Group Students</h3>
                          <div className="flex gap-2">
                            {selectedStudents.length > 0 && (
                              <Select
                                onValueChange={(value) => {
                                  if (value === "remove") {
                                    handleMoveStudents(selectedStudents, null);
                                  } else {
                                    handleMoveStudents(selectedStudents, value);
                                  }
                                }}
                              >
                                <SelectTrigger className="w-[150px]">
                                  <SelectValue placeholder="Move selected" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="remove">Remove from group</SelectItem>
                                  {groups
                                    .filter((g) => g.id !== selectedGroup.id && g.status === "active")
                                    .map((group) => (
                                      <SelectItem key={group.id} value={group.id}>
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
                                      setSelectedStudents(getStudentsInGroup(selectedGroup.id).map((s) => s.id));
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
                            {membersLoading && (
                              <TableRow>
                                <TableCell colSpan={5} className="text-center text-sm text-muted-foreground">
                                  Loading members...
                                </TableCell>
                              </TableRow>
                            )}
                            {!membersLoading &&
                              getStudentsInGroup(selectedGroup.id).map((student) => (
                                <TableRow key={student.id}>
                                  <TableCell>
                                    <Checkbox
                                      checked={selectedStudents.includes(student.id)}
                                      onCheckedChange={(checked) => {
                                        if (checked) {
                                          setSelectedStudents([...selectedStudents, student.id]);
                                        } else {
                                          setSelectedStudents(selectedStudents.filter((id) => id !== student.id));
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
                                      onClick={() => handleRemoveStudentFromGroup(selectedGroup.id, student.id)}
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
                                <Button size="sm" onClick={() => handleAddStudentToGroup(student.id, selectedGroup.id)}>
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

        <AlertDialog open={deleteGroupOpen} onOpenChange={setDeleteGroupOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Group</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete "{groupToDelete?.name}"? This action cannot be undone. All students in
                this group will be unassigned.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteGroup} className="bg-red-600 hover:bg-red-700" disabled={saving}>
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
