import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Check, ChevronDown, Filter, Plus, Search, X, Info } from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { PageLayout } from "@/components/ui/page-layout";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "@/components/ui/use-toast";
import { BasicStudent, studentsListData, addNewStudent } from "@/data/students";
import { getStudents } from "@/services/students";

// Type definitions
type StudentStatus = "active" | "on-hold" | "completed" | "dropped";
type StudentGroup = "A" | "B" | "C" | "D";
type SortOption = "name" | "hours" | "group" | "status";

// Filter type definitions
interface Filters {
  group: StudentGroup | "all";
  status: StudentStatus | "all";
  hasBalance: boolean | null;
  hasMissingClasses: boolean | null;
}

// Students page component
const Students = ({ onNavigateToStudentProfile, onNavigateToCreateStudent }: { onNavigateToStudentProfile?: (studentId: string, isNewStudent?: boolean) => void, onNavigateToCreateStudent?: () => void }) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const [sortBy, setSortBy] = useState<SortOption>("name");
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [filters, setFilters] = useState<Filters>({
    group: "all",
    status: "all",
    hasBalance: null,
    hasMissingClasses: null
  });
  const [selectedStudent, setSelectedStudent] = useState<BasicStudent | null>(null);
  const [students, setStudents] = useState<BasicStudent[]>([]);
  const [loading, setLoading] = useState(true);
  
  // 🔄 REAL DATABASE FUNCTION - Load students from database
  const loadStudents = async () => {
    try {
      setLoading(true);
      console.log('🔄 Loading students from database...');
      const realStudents = await getStudents();
      console.log('✅ Loaded students:', realStudents);
      setStudents(realStudents);
      
      toast({
        title: "Students Loaded Successfully! 🎉",
        description: `Found ${realStudents.length} students`,
      });
    } catch (error) {
      console.error('❌ Failed to load students:', error);
      toast({
        title: "Failed to Load Students",
        description: "Check console for details",
        variant: "destructive"
      });
      // Fallback to empty array on error
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  // Load students when component mounts
  useEffect(() => {
    loadStudents();
  }, []);
  
  // Apply filters and search
  const filteredStudents = students.filter(student => {
    // Search by name, email, or phone
    const matchesSearch = debouncedSearchTerm === "" || 
      student.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
      student.phone.includes(debouncedSearchTerm);
    
    // Apply filters
    const matchesGroup = filters.group === "all" || student.group === filters.group;
    const matchesStatus = filters.status === "all" || student.status === filters.status;
    const matchesBalance = filters.hasBalance === null || student.hasBalance === filters.hasBalance;
    const matchesMissingClasses = filters.hasMissingClasses === null || 
      student.hasMissingClasses === filters.hasMissingClasses;
    
    return matchesSearch && matchesGroup && matchesStatus && matchesBalance && matchesMissingClasses;
  });
  
  // Sort students
  const sortedStudents = [...filteredStudents].sort((a, b) => {
    switch (sortBy) {
      case "name":
        return a.name.localeCompare(b.name);
      case "hours":
        return b.hoursDone - a.hoursDone;
      case "group":
        return a.group.localeCompare(b.group);
      case "status":
        return a.status.localeCompare(b.status);
      default:
        return 0;
    }
  });
  
  // Toggle student selection for bulk actions
  const toggleStudentSelection = (id: string) => {
    setSelectedStudents(prev => 
      prev.includes(id) 
        ? prev.filter(studentId => studentId !== id)
        : [...prev, id]
    );
  };
  
  // Check if all students are selected
  const allSelected = sortedStudents.length > 0 && 
    sortedStudents.every(student => selectedStudents.includes(student.id));
  
  // Toggle all students selection
  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(sortedStudents.map(student => student.id));
    }
  };
  
  // Reset all filters
  const resetFilters = () => {
    setFilters({
      group: "all",
      status: "all",
      hasBalance: null,
      hasMissingClasses: null
    });
  };
  
  // Show student details
  const showStudentDetails = (student: BasicStudent) => {
    setSelectedStudent(student);
  };
  
  // Close student details panel
  const closeStudentDetails = () => {
    setSelectedStudent(null);
  };
  
  // Bulk actions handlers
  const handleBulkAction = (action: string, value: string) => {
    if (selectedStudents.length === 0) {
      toast({
        title: "No students selected",
        description: "Please select at least one student to perform this action."
      });
      return;
    }
    
    // Simulate action (in real app, this would update data)
    toast({
      title: `Bulk action: ${action}`,
      description: `Applied ${action}: ${value} to ${selectedStudents.length} students`
    });
    
    // Clear selection after action
    setSelectedStudents([]);
  };
  
  // Add new student handler
  const handleAddStudent = () => {
    // Navigate to create student page
    if (onNavigateToCreateStudent) {
      onNavigateToCreateStudent();
    } else {
    toast({
        title: "Navigation Error",
        description: "Unable to navigate to create student page."
    });
    }
  };
  
  return (
    <PageLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Students</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadStudents} disabled={loading}>
            🔄 Refresh
          </Button>
          <Button onClick={handleAddStudent}>
            <Plus className="mr-1 h-4 w-4" />
            Add New Student
          </Button>
        </div>
      </div>
      
      <Card className="p-3 bg-blue-50 border-blue-200 mb-6">
        <div className="flex items-start gap-2">
          <Info className="h-4 w-4 text-blue-600 mt-0.5" />
          <div className="space-y-1">
            <h3 className="text-sm font-medium text-blue-900">Student Profiles</h3>
            <div className="text-xs text-blue-800 space-y-0.5">
              <p>Only <strong>Emma Wilson</strong> and <strong>John Smith</strong> have full student profiles.</p>
            </div>
            <p className="text-xs text-blue-700">
              Click on their names to view their complete profiles.
            </p>
          </div>
        </div>
      </Card>
      
      {/* Search and filters row */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input 
            placeholder="Search by name, email, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex gap-3">
          {/* Sort dropdown */}
          <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">Name (A–Z)</SelectItem>
              <SelectItem value="hours">Hours Done</SelectItem>
              <SelectItem value="group">Group</SelectItem>
              <SelectItem value="status">Status</SelectItem>
            </SelectContent>
          </Select>
          
          {/* Filter button with popover */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="flex gap-2">
                <Filter className="h-4 w-4" />
                <span>Filter</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium leading-none">Filters</h4>
                  <p className="text-sm text-muted-foreground">
                    Filter students by various criteria
                  </p>
                </div>
                
                <div className="grid gap-3">
                  {/* Group filter */}
                  <div className="grid gap-1.5">
                    <label htmlFor="group" className="text-sm font-medium">Group</label>
                    <Select 
                      value={filters.group} 
                      onValueChange={(value) => setFilters({...filters, group: value as StudentGroup | "all"})}
                    >
                      <SelectTrigger id="group">
                        <SelectValue placeholder="All groups" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All groups</SelectItem>
                        <SelectItem value="A">Group A</SelectItem>
                        <SelectItem value="B">Group B</SelectItem>
                        <SelectItem value="C">Group C</SelectItem>
                        <SelectItem value="D">Group D</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {/* Status filter */}
                  <div className="grid gap-1.5">
                    <label htmlFor="status" className="text-sm font-medium">Status</label>
                    <Select 
                      value={filters.status} 
                      onValueChange={(value) => setFilters({...filters, status: value as StudentStatus | "all"})}
                    >
                      <SelectTrigger id="status">
                        <SelectValue placeholder="All statuses" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All statuses</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="on-hold">On Hold</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="dropped">Dropped</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {/* Has Balance filter */}
                  <div className="grid gap-1.5">
                    <label className="text-sm font-medium">Has Balance</label>
                    <RadioGroup 
                      value={filters.hasBalance === null ? "null" : filters.hasBalance.toString()}
                      onValueChange={(value) => {
                        if (value === "null") {
                          setFilters({...filters, hasBalance: null});
                        } else {
                          setFilters({...filters, hasBalance: value === "true"});
                        }
                      }}
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="null" id="all-balance" />
                        <label htmlFor="all-balance">All</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="true" id="has-balance" />
                        <label htmlFor="has-balance">Yes</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="false" id="no-balance" />
                        <label htmlFor="no-balance">No</label>
                      </div>
                    </RadioGroup>
                  </div>
                  
                  {/* Has Missing Classes filter */}
                  <div className="grid gap-1.5">
                    <label className="text-sm font-medium">Has Missing Classes</label>
                    <RadioGroup 
                      value={filters.hasMissingClasses === null ? "null" : filters.hasMissingClasses.toString()}
                      onValueChange={(value) => {
                        if (value === "null") {
                          setFilters({...filters, hasMissingClasses: null});
                        } else {
                          setFilters({...filters, hasMissingClasses: value === "true"});
                        }
                      }}
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="null" id="all-missing" />
                        <label htmlFor="all-missing">All</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="true" id="has-missing" />
                        <label htmlFor="has-missing">Yes</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="false" id="no-missing" />
                        <label htmlFor="no-missing">No</label>
                      </div>
                    </RadioGroup>
                  </div>
                </div>
                
                {/* Reset filters button */}
                <Button variant="outline" onClick={resetFilters}>Reset Filters</Button>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>
      
      {/* Bulk actions bar - only show when students are selected */}
      {selectedStudents.length > 0 && (
        <div className="bg-muted p-3 rounded-md mb-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">{selectedStudents.length} students selected</span>
          </div>
          <div className="flex gap-2">
            <Select onValueChange={(value) => handleBulkAction("group", value)}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Assign group" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="A">Group A</SelectItem>
                <SelectItem value="B">Group B</SelectItem>
                <SelectItem value="C">Group C</SelectItem>
                <SelectItem value="D">Group D</SelectItem>
              </SelectContent>
            </Select>
            
            <Select onValueChange={(value) => handleBulkAction("status", value)}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Set status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="on-hold">On Hold</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="dropped">Dropped</SelectItem>
              </SelectContent>
            </Select>
            
            <Button variant="destructive" onClick={() => handleBulkAction("delete", "")}>Delete</Button>
          </div>
        </div>
      )}
      
      {/* Students table */}
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox 
                  checked={allSelected}
                  onCheckedChange={toggleSelectAll}
                />
              </TableHead>
              <TableHead>Full Name</TableHead>
              <TableHead className="hidden md:table-cell">Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Group</TableHead>
              <TableHead>Hours Done</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  <div className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                    Loading students...
                  </div>
                </TableCell>
              </TableRow>
            ) : sortedStudents.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  No students found. Try adjusting your search or filters.
                </TableCell>
              </TableRow>
            ) : (
              sortedStudents.map(student => (
                <TableRow 
                  key={student.id}
                  className="cursor-pointer"
                  onClick={() => showStudentDetails(student)}
                >
                  <TableCell className="w-12" onClick={(e) => e.stopPropagation()}>
                    <Checkbox 
                      checked={selectedStudents.includes(student.id)}
                      onCheckedChange={() => toggleStudentSelection(student.id)}
                    />
                  </TableCell>
                  <TableCell className="font-medium">{student.name}</TableCell>
                  <TableCell className="hidden md:table-cell">{student.email}</TableCell>
                  <TableCell>{student.phone}</TableCell>
                  <TableCell>Group {student.group}</TableCell>
                  <TableCell>{student.hoursDone} hrs</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        student.status === 'active' ? 'border-green-500 text-green-600 bg-green-50' :
                        student.status === 'on-hold' ? 'border-yellow-500 text-yellow-600 bg-yellow-50' :
                        student.status === 'completed' ? 'border-blue-500 text-blue-600 bg-blue-50' :
                        'border-red-500 text-red-600 bg-red-50'
                      }
                    >
                      {student.status.charAt(0).toUpperCase() + student.status.slice(1).replace('-', ' ')}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      
      {/* Student details side panel */}
      <Sheet open={!!selectedStudent} onOpenChange={() => closeStudentDetails()}>
        <SheetContent className="w-full sm:max-w-md">
          {selectedStudent && (
            <>
              <SheetHeader>
                <SheetTitle>Student Details</SheetTitle>
                <SheetDescription>
                  View and manage student information
                </SheetDescription>
              </SheetHeader>
              <div className="py-6">
                <div className="space-y-6">
                  <div className="space-y-1">
                    <h3 className="text-lg font-semibold">{selectedStudent.name}</h3>
                    <p className="text-sm text-muted-foreground">ID: #{selectedStudent.id}</p>
                  </div>
                  
                  <div className="grid gap-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium mb-1">Group</p>
                        <p>Group {selectedStudent.group}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium mb-1">Status</p>
                        <Badge
                          variant="outline"
                          className={
                            selectedStudent.status === 'active' ? 'border-green-500 text-green-600 bg-green-50' :
                            selectedStudent.status === 'on-hold' ? 'border-yellow-500 text-yellow-600 bg-yellow-50' :
                            selectedStudent.status === 'completed' ? 'border-blue-500 text-blue-600 bg-blue-50' :
                            'border-red-500 text-red-600 bg-red-50'
                          }
                        >
                          {selectedStudent.status.charAt(0).toUpperCase() + selectedStudent.status.slice(1).replace('-', ' ')}
                        </Badge>
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium mb-1">Contact Information</p>
                      <p className="mb-1">📧 {selectedStudent.email}</p>
                      <p>📞 {selectedStudent.phone}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium mb-1">Progress</p>
                      <p>{selectedStudent.hoursDone} hours completed</p>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="text-sm">Has Balance</p>
                        <Badge variant={selectedStudent.hasBalance ? "default" : "outline"}>
                          {selectedStudent.hasBalance ? "Yes" : "No"}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <p className="text-sm">Has Missing Classes</p>
                        <Badge variant={selectedStudent.hasMissingClasses ? "default" : "outline"}>
                          {selectedStudent.hasMissingClasses ? "Yes" : "No"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Action buttons */}
              <div className="mt-6">
                <Button 
                  className="w-full"
                  onClick={() => onNavigateToStudentProfile?.(selectedStudent.id, false)}
                >
                  View Full Profile
                </Button>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </PageLayout>
  );
};

export default Students;