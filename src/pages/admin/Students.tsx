import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Check, ChevronDown, Filter, Plus, Search, X } from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

// Type definitions
type StudentStatus = "active" | "on-hold" | "completed" | "dropped";
type StudentGroup = "A" | "B" | "C" | "D";
type SortOption = "name" | "hours" | "group" | "status";

interface Student {
  id: string;
  name: string;
  email: string;
  phone: string;
  group: StudentGroup;
  hoursDone: number;
  status: StudentStatus;
  hasBalance: boolean;
  hasMissingClasses: boolean;
}

// Dummy data
const dummyStudents: Student[] = [
  {
    id: "1",
    name: "Emma Wilson",
    email: "emma.wilson@example.com",
    phone: "(555) 123-4567",
    group: "A",
    hoursDone: 24,
    status: "active",
    hasBalance: false,
    hasMissingClasses: false
  },
  {
    id: "2",
    name: "John Smith",
    email: "john.smith@example.com",
    phone: "(555) 234-5678",
    group: "B",
    hoursDone: 16,
    status: "on-hold",
    hasBalance: true,
    hasMissingClasses: false
  },
  {
    id: "3",
    name: "Sophia Garcia",
    email: "sophia.garcia@example.com",
    phone: "(555) 345-6789",
    group: "A",
    hoursDone: 30,
    status: "completed",
    hasBalance: false,
    hasMissingClasses: false
  },
  {
    id: "4",
    name: "Michael Johnson",
    email: "michael.johnson@example.com",
    phone: "(555) 456-7890",
    group: "C",
    hoursDone: 8,
    status: "active",
    hasBalance: false,
    hasMissingClasses: true
  },
  {
    id: "5",
    name: "Olivia Brown",
    email: "olivia.brown@example.com",
    phone: "(555) 567-8901",
    group: "B",
    hoursDone: 20,
    status: "active",
    hasBalance: true,
    hasMissingClasses: true
  },
  {
    id: "6",
    name: "David Lee",
    email: "david.lee@example.com",
    phone: "(555) 678-9012",
    group: "D",
    hoursDone: 4,
    status: "dropped",
    hasBalance: true,
    hasMissingClasses: false
  },
  {
    id: "7",
    name: "Ava Martinez",
    email: "ava.martinez@example.com",
    phone: "(555) 789-0123",
    group: "C",
    hoursDone: 12,
    status: "active",
    hasBalance: false,
    hasMissingClasses: false
  },
  {
    id: "8",
    name: "James Wilson",
    email: "james.wilson@example.com",
    phone: "(555) 890-1234",
    group: "A",
    hoursDone: 28,
    status: "completed",
    hasBalance: false,
    hasMissingClasses: false
  }
];

// Filter type definitions
interface Filters {
  group: StudentGroup | "all";
  status: StudentStatus | "all";
  hasBalance: boolean | null;
  hasMissingClasses: boolean | null;
}

// Students page component
const Students = () => {
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
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  
  // Apply filters and search
  const filteredStudents = dummyStudents.filter(student => {
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
  const showStudentDetails = (student: Student) => {
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
    toast({
      title: "Add New Student",
      description: "This feature is not implemented yet."
    });
  };
  
  return (
    <PageLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Students</h1>
        <Button onClick={handleAddStudent}>
          <Plus className="mr-1 h-4 w-4" />
          Add New Student
        </Button>
      </div>
      
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
            {sortedStudents.length === 0 ? (
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
                      className={`
                        ${student.status === 'active' ? 'border-green-500 text-green-500' : ''}
                        ${student.status === 'on-hold' ? 'border-amber-500 text-amber-500' : ''}
                        ${student.status === 'completed' ? 'border-blue-500 text-blue-500' : ''}
                        ${student.status === 'dropped' ? 'border-red-500 text-red-500' : ''}
                      `}
                    >
                      {student.status.charAt(0).toUpperCase() + student.status.slice(1)}
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
                          className={`
                            ${selectedStudent.status === 'active' ? 'border-green-500 text-green-500' : ''}
                            ${selectedStudent.status === 'on-hold' ? 'border-amber-500 text-amber-500' : ''}
                            ${selectedStudent.status === 'completed' ? 'border-blue-500 text-blue-500' : ''}
                            ${selectedStudent.status === 'dropped' ? 'border-red-500 text-red-500' : ''}
                          `}
                        >
                          {selectedStudent.status.charAt(0).toUpperCase() + selectedStudent.status.slice(1)}
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
              <div className="mt-6 space-y-2">
                <Button className="w-full">Edit Student</Button>
                <Button variant="outline" className="w-full">View Full Profile</Button>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </PageLayout>
  );
};

export default Students;
