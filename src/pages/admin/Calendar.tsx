import React, { useState } from "react";
import { PageLayout } from "@/components/ui/page-layout";
import { Button } from "@/components/ui/button";
import { Plus, ChevronLeft, ChevronRight, Phone, Clock, Users, Bookmark, UserRound, Calendar as CalendarIcon, AlertTriangle, Check, ChevronsUpDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetClose } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, parseISO, addDays } from "date-fns";

// Define class type
interface ClassItem {
  id: number;
  student: string;
  date: string;
  startTime: string;
  endTime: string;
  phone: string;
  instructor: string;
  className: string;
  type: string;
  group: string;
  duration: string;
  notes: string;
}

// Define form data interface
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
  { id: 9, name: "Tyler Rodriguez", group: "Group A", phone: "(555) 234-5678" },
  { id: 10, name: "Isabella Lopez", group: "Group B", phone: "(555) 345-6789" },
  { id: 11, name: "Mason Clark", group: "Group C", phone: "(555) 456-7890" },
  { id: 12, name: "Abigail Turner", group: "Group A", phone: "(555) 567-8901" },
];

// Dummy data for groups
const dummyGroups = [
  { id: "Group A", name: "Group A", studentCount: 4 },
  { id: "Group B", name: "Group B", studentCount: 4 },
  { id: "Group C", name: "Group C", studentCount: 4 },
];

// Instructors list
const instructors = ["Mike Brown", "Lisa Taylor", "James Wilson"];

// Duration options
const durationOptions = [
  { value: 60, label: "60 minutes" },
  { value: 90, label: "90 minutes" },
  { value: 120, label: "120 minutes" },
];

// Expanded dummy data for calendar events
const dummyClasses: ClassItem[] = [
  // May 2025 classes
  { 
    id: 101, 
    student: "Emma Wilson", 
    date: "2025-05-05", 
    startTime: "10:00", 
    endTime: "12:00", 
    phone: "(555) 123-4567", 
    instructor: "Mike Brown",
    className: "Basic Maneuvers",
    type: "Practical",
    group: "Group A",
    duration: "1 hour",
    notes: "Focus on parking techniques and three-point turns. Student needs extra practice with parallel parking."
  },
  { 
    id: 102, 
    student: "John Smith", 
    date: "2025-05-05", 
    startTime: "14:00", 
    endTime: "15:00", 
    phone: "(555) 234-5678", 
    instructor: "Mike Brown",
    className: "Highway Driving",
    type: "Practical",
    group: "Group B",
    duration: "1 hour",
    notes: "First highway session. Cover merging, lane changes, and maintaining safe distances."
  },
  // Additional class for May 5th to test "+X more" functionality
  { 
    id: 115, 
    student: "Thomas Johnson", 
    date: "2025-05-05", 
    startTime: "16:00", 
    endTime: "17:00", 
    phone: "(555) 111-2222", 
    instructor: "Mike Brown",
    className: "Parking Practice",
    type: "Practical",
    group: "Group A",
    duration: "1 hour",
    notes: "Focused session on parallel parking and reverse parking techniques."
  },
  // Another class for May 5th
  { 
    id: 116, 
    student: "Sarah Miller", 
    date: "2025-05-05", 
    startTime: "18:00", 
    endTime: "19:00", 
    phone: "(555) 333-4444", 
    instructor: "Mike Brown",
    className: "City Driving",
    type: "Practical",
    group: "Group B",
    duration: "1 hour",
    notes: "Practice navigating through busy city streets and handling traffic lights."
  },
  { 
    id: 103, 
    student: "Sophia Garcia", 
    date: "2025-05-07", 
    startTime: "09:00", 
    endTime: "11:00", 
    phone: "(555) 345-6789", 
    instructor: "Lisa Taylor",
    className: "Road Signs",
    type: "Theory",
    group: "Group C",
    duration: "2 hours",
    notes: "Review all regulatory, warning, and guide signs. Will include a mini-quiz at the end."
  },
  { 
    id: 104, 
    student: "Michael Johnson", 
    date: "2025-05-08", 
    startTime: "13:00", 
    endTime: "14:00", 
    phone: "(555) 456-7890", 
    instructor: "James Wilson",
    className: "Night Driving",
    type: "Practical",
    group: "Group A",
    duration: "1 hour",
    notes: "Preparation for driving in low-light conditions. Emphasis on proper use of headlights and visibility awareness."
  },
  { 
    id: 105, 
    student: "Olivia Brown", 
    date: "2025-05-12", 
    startTime: "11:00", 
    endTime: "13:00", 
    phone: "(555) 567-8901", 
    instructor: "Lisa Taylor",
    className: "Traffic Rules",
    type: "Theory",
    group: "Group B",
    duration: "2 hours",
    notes: "Comprehensive review of right-of-way rules, traffic signals, and special traffic situations."
  },
  { 
    id: 106, 
    student: "David Lee", 
    date: "2025-05-14", 
    startTime: "15:00", 
    endTime: "16:00", 
    phone: "(555) 678-9012", 
    instructor: "James Wilson",
    className: "Urban Driving",
    type: "Practical",
    group: "Group C",
    duration: "1 hour",
    notes: "City center navigation focusing on one-way streets, traffic circles, and busy intersections."
  },
  { 
    id: 107, 
    student: "Ava Martinez", 
    date: "2025-05-15", 
    startTime: "10:00", 
    endTime: "12:00", 
    phone: "(555) 789-0123", 
    instructor: "Mike Brown",
    className: "Defensive Driving",
    type: "Theory",
    group: "Group A",
    duration: "2 hours",
    notes: "Techniques for anticipating hazards and driving defensively. Will include video examples of common scenarios."
  },
  { 
    id: 108, 
    student: "James Wilson", 
    date: "2025-05-19", 
    startTime: "14:00", 
    endTime: "15:00", 
    phone: "(555) 890-1234", 
    instructor: "Lisa Taylor",
    className: "Final Assessment",
    type: "Practical",
    group: "Group B",
    duration: "1 hour",
    notes: "Pre-exam evaluation to identify any remaining areas for improvement before the official test."
  },
  { 
    id: 109, 
    student: "Tyler Rodriguez", 
    date: "2025-05-21", 
    startTime: "09:00", 
    endTime: "10:00", 
    phone: "(555) 234-5678", 
    instructor: "Mike Brown",
    className: "Intro to Driving",
    type: "Practical",
    group: "Group A",
    duration: "1 hour",
    notes: "First driving lesson. Familiarization with vehicle controls and basic operations."
  },
  { 
    id: 110, 
    student: "Isabella Lopez", 
    date: "2025-05-21", 
    startTime: "13:00", 
    endTime: "15:00", 
    phone: "(555) 345-6789", 
    instructor: "Mike Brown",
    className: "Driving Laws",
    type: "Theory",
    group: "Group B",
    duration: "2 hours",
    notes: "Overview of state driving laws and regulations."
  },
  { 
    id: 111, 
    student: "Mason Clark", 
    date: "2025-05-22", 
    startTime: "10:00", 
    endTime: "11:00", 
    phone: "(555) 456-7890", 
    instructor: "Mike Brown",
    className: "Parking Skills",
    type: "Practical",
    group: "Group C",
    duration: "1 hour",
    notes: "Focus on parallel parking, reverse parking, and angle parking techniques."
  },
  { 
    id: 112, 
    student: "Abigail Turner", 
    date: "2025-05-26", 
    startTime: "09:00", 
    endTime: "10:00", 
    phone: "(555) 567-8901", 
    instructor: "Mike Brown",
    className: "Lane Changes",
    type: "Practical",
    group: "Group A",
    duration: "1 hour",
    notes: "Practicing safe lane changes, mirror checks, and blind spot awareness."
  },
  { 
    id: 113, 
    student: "Ethan Adams", 
    date: "2025-05-28", 
    startTime: "14:00", 
    endTime: "16:00", 
    phone: "(555) 678-9012", 
    instructor: "Mike Brown",
    className: "Road Safety",
    type: "Theory",
    group: "Group B",
    duration: "2 hours",
    notes: "Discussion on road safety principles and accident prevention strategies."
  },
  { 
    id: 114, 
    student: "Mia Scott", 
    date: "2025-05-30", 
    startTime: "09:00", 
    endTime: "10:00", 
    phone: "(555) 789-0123", 
    instructor: "Mike Brown",
    className: "Highway Entry & Exit",
    type: "Practical",
    group: "Group C",
    duration: "1 hour",
    notes: "Practice entering and exiting highways safely using acceleration and deceleration lanes."
  },
  // Original July 2024 classes
  { 
    id: 1, 
    student: "Emma Wilson", 
    date: "2024-07-15", 
    startTime: "10:00", 
    endTime: "12:00", 
    phone: "(555) 123-4567", 
    instructor: "Mike Brown",
    className: "Basic Maneuvers",
    type: "Practical",
    group: "Group A",
    duration: "2 hours",
    notes: "Focus on parking techniques and three-point turns. Student needs extra practice with parallel parking."
  },
  { 
    id: 2, 
    student: "John Smith", 
    date: "2024-07-15", 
    startTime: "14:00", 
    endTime: "16:00", 
    phone: "(555) 234-5678", 
    instructor: "Mike Brown",
    className: "Highway Driving",
    type: "Practical",
    group: "Group B",
    duration: "2 hours",
    notes: "First highway session. Cover merging, lane changes, and maintaining safe distances."
  },
  { 
    id: 3, 
    student: "Sophia Garcia", 
    date: "2024-07-16", 
    startTime: "09:00", 
    endTime: "11:00", 
    phone: "(555) 345-6789", 
    instructor: "Lisa Taylor",
    className: "Road Signs",
    type: "Theory",
    group: "Group C",
    duration: "2 hours",
    notes: "Review all regulatory, warning, and guide signs. Will include a mini-quiz at the end."
  },
  { 
    id: 4, 
    student: "Michael Johnson", 
    date: "2024-07-17", 
    startTime: "13:00", 
    endTime: "15:00", 
    phone: "(555) 456-7890", 
    instructor: "James Wilson",
    className: "Night Driving",
    type: "Practical",
    group: "Group A",
    duration: "2 hours",
    notes: "Preparation for driving in low-light conditions. Emphasis on proper use of headlights and visibility awareness."
  },
  { 
    id: 5, 
    student: "Olivia Brown", 
    date: "2024-07-18", 
    startTime: "11:00", 
    endTime: "13:00", 
    phone: "(555) 567-8901", 
    instructor: "Lisa Taylor",
    className: "Traffic Rules",
    type: "Theory",
    group: "Group B",
    duration: "2 hours",
    notes: "Comprehensive review of right-of-way rules, traffic signals, and special traffic situations."
  },
  { 
    id: 6, 
    student: "David Lee", 
    date: "2024-07-19", 
    startTime: "15:00", 
    endTime: "17:00", 
    phone: "(555) 678-9012", 
    instructor: "James Wilson",
    className: "Urban Driving",
    type: "Practical",
    group: "Group C",
    duration: "2 hours",
    notes: "City center navigation focusing on one-way streets, traffic circles, and busy intersections."
  },
  { 
    id: 7, 
    student: "Ava Martinez", 
    date: "2024-07-22", 
    startTime: "10:00", 
    endTime: "12:00", 
    phone: "(555) 789-0123", 
    instructor: "Mike Brown",
    className: "Defensive Driving",
    type: "Theory",
    group: "Group A",
    duration: "2 hours",
    notes: "Techniques for anticipating hazards and driving defensively. Will include video examples of common scenarios."
  },
  { 
    id: 8, 
    student: "James Wilson", 
    date: "2024-07-23", 
    startTime: "14:00", 
    endTime: "16:00", 
    phone: "(555) 890-1234", 
    instructor: "Lisa Taylor",
    className: "Final Assessment",
    type: "Practical",
    group: "Group B",
    duration: "2 hours",
    notes: "Pre-exam evaluation to identify any remaining areas for improvement before the official test."
  },
  // Additional classes
  { 
    id: 9, 
    student: "Tyler Rodriguez", 
    date: "2024-07-02", 
    startTime: "09:00", 
    endTime: "11:00", 
    phone: "(555) 234-5678", 
    instructor: "Mike Brown",
    className: "Intro to Driving",
    type: "Practical",
    group: "Group A",
    duration: "2 hours",
    notes: "First driving lesson. Familiarization with vehicle controls and basic operations."
  },
  { 
    id: 10, 
    student: "Isabella Lopez", 
    date: "2024-07-02", 
    startTime: "13:00", 
    endTime: "15:00", 
    phone: "(555) 345-6789", 
    instructor: "Lisa Taylor",
    className: "Driving Laws",
    type: "Theory",
    group: "Group B",
    duration: "2 hours",
    notes: "Overview of state driving laws and regulations."
  },
  { 
    id: 11, 
    student: "Mason Clark", 
    date: "2024-07-03", 
    startTime: "10:00", 
    endTime: "12:00", 
    phone: "(555) 456-7890", 
    instructor: "James Wilson",
    className: "Parking Skills",
    type: "Practical",
    group: "Group C",
    duration: "2 hours",
    notes: "Focus on parallel parking, reverse parking, and angle parking techniques."
  },
  { 
    id: 12, 
    student: "Abigail Turner", 
    date: "2024-07-04", 
    startTime: "09:00", 
    endTime: "11:00", 
    phone: "(555) 567-8901", 
    instructor: "Mike Brown",
    className: "Lane Changes",
    type: "Practical",
    group: "Group A",
    duration: "2 hours",
    notes: "Practicing safe lane changes, mirror checks, and blind spot awareness."
  },
  { 
    id: 13, 
    student: "Ethan Adams", 
    date: "2024-07-05", 
    startTime: "14:00", 
    endTime: "16:00", 
    phone: "(555) 678-9012", 
    instructor: "Lisa Taylor",
    className: "Road Safety",
    type: "Theory",
    group: "Group B",
    duration: "2 hours",
    notes: "Discussion on road safety principles and accident prevention strategies."
  },
  { 
    id: 14, 
    student: "Mia Scott", 
    date: "2024-07-08", 
    startTime: "09:00", 
    endTime: "11:00", 
    phone: "(555) 789-0123", 
    instructor: "James Wilson",
    className: "Highway Entry & Exit",
    type: "Practical",
    group: "Group C",
    duration: "2 hours",
    notes: "Practice entering and exiting highways safely using acceleration and deceleration lanes."
  },
  { 
    id: 15, 
    student: "Noah Green", 
    date: "2024-07-09", 
    startTime: "13:00", 
    endTime: "15:00", 
    phone: "(555) 890-1234", 
    instructor: "Mike Brown",
    className: "Emergency Maneuvers",
    type: "Practical",
    group: "Group A",
    duration: "2 hours",
    notes: "Learning how to handle emergency situations, including sudden stops and obstacle avoidance."
  },
  { 
    id: 16, 
    student: "Charlotte King", 
    date: "2024-07-10", 
    startTime: "10:00", 
    endTime: "12:00", 
    phone: "(555) 901-2345", 
    instructor: "Lisa Taylor",
    className: "Weather Conditions",
    type: "Theory",
    group: "Group B",
    duration: "2 hours",
    notes: "Understanding how to adjust driving techniques for different weather conditions."
  },
  { 
    id: 17, 
    student: "Lucas Wright", 
    date: "2024-07-11", 
    startTime: "14:00", 
    endTime: "16:00", 
    phone: "(555) 012-3456", 
    instructor: "James Wilson",
    className: "City Navigation",
    type: "Practical",
    group: "Group C",
    duration: "2 hours",
    notes: "Navigating through busy city streets and handling complex intersections."
  },
  { 
    id: 18, 
    student: "Amelia Cooper", 
    date: "2024-07-12", 
    startTime: "09:00", 
    endTime: "11:00", 
    phone: "(555) 123-4567", 
    instructor: "Mike Brown",
    className: "Vehicle Maintenance",
    type: "Theory",
    group: "Group A",
    duration: "2 hours",
    notes: "Basic vehicle maintenance and pre-drive inspection procedures."
  },
  { 
    id: 19, 
    student: "Henry Reed", 
    date: "2024-07-12", 
    startTime: "13:00", 
    endTime: "15:00", 
    phone: "(555) 234-5678", 
    instructor: "Lisa Taylor",
    className: "Fuel Efficiency",
    type: "Theory",
    group: "Group B",
    duration: "2 hours",
    notes: "Techniques for fuel-efficient driving and reducing carbon footprint."
  },
  { 
    id: 20, 
    student: "Ella Baker", 
    date: "2024-07-15", 
    startTime: "13:00", 
    endTime: "14:30", 
    phone: "(555) 345-6789", 
    instructor: "James Wilson",
    className: "Parking Practice",
    type: "Practical",
    group: "Group C",
    duration: "1.5 hours",
    notes: "Additional practice on various parking techniques in different scenarios."
  },
  { 
    id: 21, 
    student: "Alexander Cook", 
    date: "2024-07-16", 
    startTime: "14:00", 
    endTime: "16:00", 
    phone: "(555) 456-7890", 
    instructor: "Mike Brown",
    className: "Residential Driving",
    type: "Practical",
    group: "Group A",
    duration: "2 hours",
    notes: "Navigating residential areas with focus on school zones and pedestrian awareness."
  },
  { 
    id: 22, 
    student: "Scarlett Morgan", 
    date: "2024-07-17", 
    startTime: "09:00", 
    endTime: "11:00", 
    phone: "(555) 567-8901", 
    instructor: "Lisa Taylor",
    className: "Night Driving Theory",
    type: "Theory",
    group: "Group B",
    duration: "2 hours",
    notes: "Theoretical aspects of night driving before practical application."
  },
  { 
    id: 23, 
    student: "Jack Murphy", 
    date: "2024-07-18", 
    startTime: "14:00", 
    endTime: "16:00", 
    phone: "(555) 678-9012", 
    instructor: "James Wilson",
    className: "Defensive Techniques",
    type: "Practical",
    group: "Group C",
    duration: "2 hours",
    notes: "Practical application of defensive driving techniques in real-world scenarios."
  },
  { 
    id: 24, 
    student: "Sofia Peterson", 
    date: "2024-07-19", 
    startTime: "10:00", 
    endTime: "12:00", 
    phone: "(555) 789-0123", 
    instructor: "Mike Brown",
    className: "Highway Merging",
    type: "Practical",
    group: "Group A",
    duration: "2 hours",
    notes: "Advanced highway merging techniques with heavy traffic simulation."
  },
  { 
    id: 25, 
    student: "Leo Phillips", 
    date: "2024-07-19", 
    startTime: "09:00", 
    endTime: "11:00", 
    phone: "(555) 890-1234", 
    instructor: "Lisa Taylor",
    className: "Traffic Law Updates",
    type: "Theory",
    group: "Group B",
    duration: "2 hours",
    notes: "Recent updates to traffic laws and regulations."
  },
  { 
    id: 26, 
    student: "Riley Campbell", 
    date: "2024-07-22", 
    startTime: "14:00", 
    endTime: "16:00", 
    phone: "(555) 901-2345", 
    instructor: "James Wilson",
    className: "Rural Driving",
    type: "Practical",
    group: "Group C",
    duration: "2 hours",
    notes: "Driving on rural roads, handling gravel surfaces, and wildlife awareness."
  },
  { 
    id: 27, 
    student: "Elijah Hayes", 
    date: "2024-07-23", 
    startTime: "09:00", 
    endTime: "11:00", 
    phone: "(555) 012-3456", 
    instructor: "Mike Brown",
    className: "Motorway Driving",
    type: "Practical",
    group: "Group A",
    duration: "2 hours",
    notes: "Advanced motorway driving techniques and high-speed safety."
  },
  { 
    id: 28, 
    student: "Avery Ross", 
    date: "2024-07-24", 
    startTime: "13:00", 
    endTime: "15:00", 
    phone: "(555) 123-4567", 
    instructor: "Lisa Taylor",
    className: "Pre-Test Review",
    type: "Theory",
    group: "Group B",
    duration: "2 hours",
    notes: "Comprehensive review of all theoretical topics before the final exam."
  },
  { 
    id: 29, 
    student: "Benjamin Long", 
    date: "2024-07-25", 
    startTime: "10:00", 
    endTime: "12:00", 
    phone: "(555) 234-5678", 
    instructor: "James Wilson",
    className: "Final Route Practice",
    type: "Practical",
    group: "Group C",
    duration: "2 hours",
    notes: "Practice driving on potential test routes for the final examination."
  },
  { 
    id: 30, 
    student: "Luna Carter", 
    date: "2024-07-26", 
    startTime: "14:00", 
    endTime: "16:00", 
    phone: "(555) 345-6789", 
    instructor: "Mike Brown",
    className: "Mock Test",
    type: "Practical",
    group: "Group A",
    duration: "2 hours",
    notes: "Full mock driving test under examination conditions."
  },
  { 
    id: 31, 
    student: "Gabriel Rivera", 
    date: "2024-07-29", 
    startTime: "09:00", 
    endTime: "11:00", 
    phone: "(555) 456-7890", 
    instructor: "Lisa Taylor",
    className: "Test Debrief",
    type: "Theory",
    group: "Group B",
    duration: "2 hours",
    notes: "Discussion of common test mistakes and final tips for success."
  },
  { 
    id: 32, 
    student: "Stella Ward", 
    date: "2024-07-30", 
    startTime: "13:00", 
    endTime: "15:00", 
    phone: "(555) 567-8901", 
    instructor: "James Wilson",
    className: "Confidence Building",
    type: "Practical",
    group: "Group C",
    duration: "2 hours",
    notes: "Building confidence for nervous students before their final test."
  }
];

const Calendar = () => {
  // Set default date to May 2025
  const [currentMonth, setCurrentMonth] = useState(new Date(2025, 4, 1)); // Month is 0-indexed, so 4 = May
  const [selectedDay, setSelectedDay] = useState(new Date(2025, 4, 21)); // May 21, 2025 for day view
  const [instructor, setInstructor] = useState("Mike Brown");
  const [viewMode, setViewMode] = useState("month");
  const [selectedClass, setSelectedClass] = useState<ClassItem | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  
  // Add Class Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [studentComboboxOpen, setStudentComboboxOpen] = useState(false);
  const [formData, setFormData] = useState<ClassFormData>({
    type: "",
    date: format(new Date(), 'yyyy-MM-dd'),
    startTime: "10:00",
    duration: 60,
    instructor: "",
    selectedStudents: [],
    selectedGroup: "",
    notes: "",
  });
  
  // Get days for current month
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });
  
  // Navigation functions
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevDay = () => setSelectedDay(addDays(selectedDay, -1));
  const nextDay = () => setSelectedDay(addDays(selectedDay, 1));
  
  // Weekly navigation functions
  const [currentWeekStart, setCurrentWeekStart] = useState(new Date(2025, 4, 18)); // May 18, 2025
  const prevWeek = () => setCurrentWeekStart(addDays(currentWeekStart, -7));
  const nextWeek = () => setCurrentWeekStart(addDays(currentWeekStart, 7));
  
  
  // Filter classes by instructor
  const instructorClasses = dummyClasses.filter(cls => cls.instructor === instructor);
  
  // Get classes for a specific day
  const getClassesForDay = (day: Date) => {
    const dateString = format(day, 'yyyy-MM-dd');
    return instructorClasses.filter(cls => cls.date === dateString);
  };
  
  // Get classes for selected date in form
  const getClassesForSelectedDate = () => {
    return dummyClasses.filter(cls => cls.date === formData.date);
  };
  
  // Check instructor availability
  const checkInstructorConflict = () => {
    if (!formData.instructor || !formData.date || !formData.startTime) return null;
    
    const conflictingClass = dummyClasses.find(cls => 
      cls.instructor === formData.instructor && 
      cls.date === formData.date && 
      cls.startTime === formData.startTime
    );
    
    return conflictingClass;
  };
  
  // Get students for selected group
  const getStudentsForGroup = (groupId: string) => {
    return dummyStudents.filter(student => student.group === groupId);
  };
  
  // Handle form field changes
  const handleFormChange = (field: keyof ClassFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
      // Reset student selection when group is selected and vice versa
      ...(field === 'selectedGroup' && value ? { selectedStudents: [] } : {}),
      ...(field === 'selectedStudents' && value.length > 0 ? { selectedGroup: "" } : {}),
    }));
  };
  
  // Handle student selection
  const handleStudentToggle = (studentName: string) => {
    const updatedStudents = formData.selectedStudents.includes(studentName)
      ? formData.selectedStudents.filter(s => s !== studentName)
      : [...formData.selectedStudents, studentName];
    
    handleFormChange('selectedStudents', updatedStudents);
  };
  
  // Calculate end time based on start time and duration
  const calculateEndTime = (startTime: string, duration: number) => {
    const [hours, minutes] = startTime.split(':').map(Number);
    const startDate = new Date();
    startDate.setHours(hours, minutes, 0, 0);
    
    const endDate = new Date(startDate.getTime() + duration * 60000);
    return format(endDate, 'HH:mm');
  };
  
  // Get active students (either selected manually or from group)
  const getActiveStudents = () => {
    if (formData.selectedGroup) {
      return getStudentsForGroup(formData.selectedGroup);
    }
    return dummyStudents.filter(student => formData.selectedStudents.includes(student.name));
  };
  
  // Handle form submission
  const handleSubmit = () => {
    // Basic validation
    if (!formData.type || !formData.date || !formData.instructor) {
      alert("Please fill in all required fields");
      return;
    }
    
    if (!formData.selectedGroup && formData.selectedStudents.length === 0) {
      alert("Please select students or a group");
      return;
    }
    
    // Show success message
    alert("Class created successfully!");
    
    // Reset form and close modal
    setFormData({
      type: "",
      date: format(new Date(), 'yyyy-MM-dd'),
      startTime: "10:00",
      duration: 60,
      instructor: "",
      selectedStudents: [],
      selectedGroup: "",
      notes: "",
    });
    setModalOpen(false);
  };
  
  // Generate weekly view days (current week)
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(currentWeekStart, i));
  
  // Time slots for weekly view (8:00 AM to 8:00 PM in 1-hour steps)
  const timeSlots = Array.from({ length: 13 }, (_, i) => `${i + 8}:00`);
  
  // Parse time string to hour number
  const parseTimeToHour = (timeString: string): number => {
    const [hour] = timeString.split(':').map(Number);
    return hour;
  };
  
  // Calculate class position in weekly view
  const getClassPositionData = (cls: ClassItem) => {
    const startHour = parseTimeToHour(cls.startTime);
    const endHour = parseTimeToHour(cls.endTime);
    const duration = endHour - startHour;
    
    return {
      startHour,
      endHour,
      duration
    };
  };
  
  // Handle class click
  const handleClassClick = (cls: ClassItem) => {
    setSelectedClass(cls);
    setSheetOpen(true);
  };
  
  // Render monthly view calendar
  const renderMonthView = () => (
    <div className="mt-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">{format(currentMonth, 'MMMM yyyy')}</h2>
        <div className="flex space-x-2">
          <Button variant="outline" size="icon" onClick={prevMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={nextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-7 gap-3 bg-background p-2">
        {/* Days of week */}
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div key={day} className="text-center py-3 font-medium text-muted-foreground bg-muted rounded-lg">
            {day}
          </div>
        ))}
        
        {/* Empty cells for days of previous month */}
        {Array.from({ length: monthStart.getDay() }).map((_, index) => (
          <div key={`empty-start-${index}`} className="bg-card/50 rounded-xl p-2.5 h-28 shadow-sm border border-border/50"></div>
        ))}
        
        {/* Calendar days */}
        {monthDays.map((day) => {
          const dayClasses = getClassesForDay(day);
          const displayClasses = dayClasses.slice(0, 1); // Only show first 1 class
          const remainingCount = dayClasses.length - 1;  // Count remaining classes
          const dayNum = day.getDay(); // 0 = Sunday, 3 = Wednesday
          const isWednesday = dayNum === 3;
          const isDay21 = day.getDate() === 21; // Check if it's the 21st day
          
          return (
            <div
              key={day.toString()}
              className={`bg-card rounded-xl p-2.5 h-28 shadow-sm border border-border/50 hover:shadow-md transition-shadow ${
                isDay21 ? 'bg-rose-50 border-rose-200' : ''
              }`}
            >
              <div className="text-sm font-semibold mb-1 text-foreground">{format(day, 'd')}</div>
              
              <div className="space-y-1">
              {displayClasses.map((cls) => (
                <div
                  key={cls.id}
                    className={`${cls.type === "Theory" ? "bg-blue-100 text-blue-700 border border-blue-200" : "bg-rose-100 text-rose-700 border border-rose-200"} px-2 py-1.5 text-xs rounded-md cursor-pointer hover:shadow-sm transition-all duration-200 hover:scale-[1.02] flex items-center`}
                  onClick={() => handleClassClick(cls)}
                >
                    <div className="font-medium truncate">{cls.student}</div>
                </div>
              ))}
              </div>
              
              {/* Show "+X more" message if there are additional classes */}
              {remainingCount > 0 && (
                <div className="text-xs font-medium text-muted-foreground mt-1 text-center bg-muted/50 py-0.5 px-2 rounded-md border border-border/30">
                  +{remainingCount} more
                </div>
              )}
            </div>
          );
        })}
        
        {/* Empty cells for days of next month */}
        {Array.from({ length: (7 - ((monthDays.length + monthStart.getDay()) % 7)) % 7 }).map((_, index) => (
          <div key={`empty-end-${index}`} className="bg-card/50 rounded-xl p-2.5 h-28 shadow-sm border border-border/50"></div>
        ))}
      </div>
    </div>
  );
  
  // Render weekly view calendar
  const renderWeekView = () => (
    <div className="mt-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Week of {format(weekDays[0], 'MMM d')} - {format(weekDays[6], 'MMM d, yyyy')}</h2>
        <div className="flex space-x-2">
          <Button variant="outline" size="icon" onClick={prevWeek}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={nextWeek}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <div className="bg-background rounded-xl shadow-sm border border-border/50 p-3">
        {/* Headers row */}
        <div className="flex mb-3">
          {/* Empty corner for time column */}
          <div className="w-20 mr-3"></div>
          {/* Day headers */}
          <div className="flex-1 grid grid-cols-7 gap-3">
            {weekDays.map((day, index) => (
              <div 
                key={day.toString()} 
                className={`text-center py-3 font-medium text-muted-foreground rounded-lg ${
                  isToday(day) ? 'bg-rose-50 border border-rose-200' : 'bg-muted'
                }`}
              >
                <div className="text-sm font-medium text-muted-foreground">{format(day, 'EEE')}</div>
                <div className="text-base font-semibold">{format(day, 'd')}</div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Calendar grid */}
        <div className="flex">
          {/* Time column */}
          <div className="w-20 mr-3 bg-muted rounded-lg">
            {timeSlots.map((time, index) => (
              <div 
                key={time} 
                className="h-10 flex items-center justify-center text-sm font-medium text-muted-foreground"
              >
                {time}
              </div>
            ))}
          </div>
          
          {/* Day columns */}
          <div className="flex-1 grid grid-cols-7 gap-3">
            {weekDays.map((day, dayIndex) => {
              const dayClasses = getClassesForDay(day);
              
              return (
                <div 
                  key={day.toString()} 
                  className={`relative rounded-xl shadow-sm border ${
                    isToday(day) 
                      ? 'bg-rose-50 border-rose-200' 
                      : 'bg-card border-border/50'
                  }`}
                >
                  {/* Time slot grid */}
                  {timeSlots.map((time, timeIndex) => (
                    <div 
                      key={`${day}-${time}`} 
                      className="h-10 border-t border-border/20 first:border-t-0"
                    />
                  ))}
                  
                  {/* Class cards */}
                  {dayClasses.map((cls) => {
                    const { startHour } = getClassPositionData(cls);
                    const slotIndex = startHour - 8; // 8 is first hour (8:00)
                    const topPosition = slotIndex * 40; // 40px per slot (h-10)
                    
                    return (
                      <div
                        key={cls.id}
                        className={`absolute left-1 right-1 ${cls.type === "Theory" ? "bg-blue-100 text-blue-700 border border-blue-200" : "bg-rose-100 text-rose-700 border border-rose-200"} p-2 rounded-md cursor-pointer hover:shadow-md transition-all duration-200 hover:scale-[1.02] flex items-center h-8`}
                        style={{ 
                          top: `${topPosition + 4}px`, // 4px offset for centering in 40px slot
                        }}
                        onClick={() => handleClassClick(cls)}
                      >
                        <div className="font-medium text-xs truncate">{cls.student}</div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
  
  // Render day view calendar
  const renderDayView = () => {
    const dayClasses = getClassesForDay(selectedDay);
    const sortedClasses = dayClasses.sort((a, b) => a.startTime.localeCompare(b.startTime));
    
    // Get calendar month for the selected day
    const calendarMonth = new Date(selectedDay.getFullYear(), selectedDay.getMonth(), 1);
    const calendarMonthStart = startOfMonth(calendarMonth);
    const calendarMonthEnd = endOfMonth(calendarMonth);
    const calendarMonthDays = eachDayOfInterval({ start: calendarMonthStart, end: calendarMonthEnd });
    
    return (
      <div className="mt-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">{format(selectedDay, 'EEEE, MMMM d, yyyy')}</h2>
          <div className="flex space-x-2">
            <Button variant="outline" size="icon" onClick={prevDay}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={nextDay}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Classes List - Left side */}
          <div className="lg:col-span-2 space-y-4">
            {sortedClasses.length === 0 ? (
              <div className="text-center py-12">
                <CalendarIcon className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium text-muted-foreground mb-2">No classes scheduled</h3>
                <p className="text-sm text-muted-foreground">There are no classes scheduled for this day.</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {sortedClasses.map((cls) => (
                  <Card 
                    key={cls.id} 
                    className="cursor-pointer hover:shadow-md transition-all duration-200 hover:scale-[1.01]"
                    onClick={() => handleClassClick(cls)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-3">
                            <Badge 
                              variant={cls.type === "Theory" ? "default" : "secondary"}
                              className={cls.type === "Theory" ? "bg-blue-100 text-blue-700 border border-blue-200" : "bg-rose-100 text-rose-700 border border-rose-200"}
                            >
                              {cls.type}
                            </Badge>
                            <span className="text-lg font-semibold">{cls.className}</span>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <div className="flex items-center space-x-2">
                              <UserRound className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm font-medium">{cls.student}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Users className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm text-muted-foreground">{cls.group}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm text-muted-foreground">{cls.startTime} - {cls.endTime}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Phone className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm text-muted-foreground">{cls.phone}</span>
                            </div>
                          </div>
                          
                          {cls.notes && (
                            <div className="mt-3 p-3 bg-muted/50 rounded-md">
                              <div className="flex items-start space-x-2">
                                <Bookmark className="h-4 w-4 text-muted-foreground mt-0.5" />
                                <p className="text-sm text-muted-foreground">{cls.notes}</p>
                              </div>
                            </div>
                          )}
                        </div>
                        
                        <div className="text-right">
                          <div className="text-2xl font-bold text-foreground">{cls.startTime}</div>
                          <div className="text-sm text-muted-foreground">{cls.duration}</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
          
          {/* Mini Calendar - Right side */}
          <div className="lg:col-span-1">
            <Card className="bg-background shadow-sm border border-border/50">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg font-semibold">
                    {format(calendarMonth, 'MMMM yyyy')}
                  </CardTitle>
                  <div className="flex space-x-1">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setSelectedDay(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1, selectedDay.getDate()))}
                    >
                      <ChevronLeft className="h-3 w-3" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setSelectedDay(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, selectedDay.getDate()))}
                    >
                      <ChevronRight className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-3">
                <div className="grid grid-cols-7 gap-1">
                  {/* Days of week headers */}
                  {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day) => (
                    <div key={day} className="text-center py-2 text-xs font-medium text-muted-foreground">
                      {day}
                    </div>
                  ))}
                  
                  {/* Empty cells for days of previous month */}
                  {Array.from({ length: calendarMonthStart.getDay() }).map((_, index) => (
                    <div key={`empty-start-${index}`} className="h-8"></div>
                  ))}
                  
                  {/* Calendar days */}
                  {calendarMonthDays.map((day) => {
                    const dayClasses = getClassesForDay(day);
                    const isSelected = format(day, 'yyyy-MM-dd') === format(selectedDay, 'yyyy-MM-dd');
                    const hasClasses = dayClasses.length > 0;
                    
                    return (
                      <button
                        key={day.toString()}
                        onClick={() => setSelectedDay(day)}
                        className={`h-8 w-8 text-xs rounded-md border transition-all duration-200 hover:shadow-sm ${
                          isSelected
                            ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                            : isToday(day)
                            ? 'bg-rose-50 border-rose-200 text-rose-700 hover:bg-rose-100'
                            : hasClasses
                            ? 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100'
                            : 'bg-card border-border/50 hover:bg-muted/50'
                        }`}
                      >
                        {format(day, 'd')}
                      </button>
                    );
                  })}
                  
                  {/* Empty cells for days of next month */}
                  {Array.from({ length: (7 - ((calendarMonthDays.length + calendarMonthStart.getDay()) % 7)) % 7 }).map((_, index) => (
                    <div key={`empty-end-${index}`} className="h-8"></div>
                  ))}
                </div>
                
                {/* Legend */}
                <div className="mt-4 space-y-2 text-xs">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-primary rounded-sm"></div>
                    <span className="text-muted-foreground">Selected</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-rose-100 border border-rose-200 rounded-sm"></div>
                    <span className="text-muted-foreground">Today</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-blue-100 border border-blue-200 rounded-sm"></div>
                    <span className="text-muted-foreground">Has classes</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  };
  
  return (
    <PageLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Calendar</h1>
        <Button onClick={() => setModalOpen(true)}>
          <Plus className="mr-1 h-4 w-4" />
          Create Class
        </Button>
      </div>

      {/* Simple Add Class Dialog - Following Add Instructor pattern */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
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
                  value={formData.type} 
                  onValueChange={(value: "Theory" | "Practical") => handleFormChange('type', value)}
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
                  value={formData.instructor} 
                  onValueChange={(value) => handleFormChange('instructor', value)}
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
                  value={formData.date}
                  onChange={(e) => handleFormChange('date', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="time">Start Time</Label>
                <Input
                  id="time"
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => handleFormChange('startTime', e.target.value)}
                />
              </div>
            </div>
            
            {/* Conditional Student Selection based on Class Type */}
            {formData.type && (
              <div className="space-y-2">
                {formData.type === "Theory" ? (
                  // Theory: Show Group Dropdown
                  <>
                    <Label htmlFor="group">Select Group</Label>
                    <Select 
                      value={formData.selectedGroup} 
                      onValueChange={(value) => handleFormChange('selectedGroup', value)}
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
                          {formData.selectedStudents[0] 
                            ? dummyStudents.find(student => student.name === formData.selectedStudents[0])?.name + 
                              ` (${dummyStudents.find(student => student.name === formData.selectedStudents[0])?.id})`
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
                                    const newValue = currentValue === formData.selectedStudents[0] ? [] : [currentValue];
                                    handleFormChange('selectedStudents', newValue);
                                    setStudentComboboxOpen(false);
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      formData.selectedStudents[0] === student.name ? "opacity-100" : "opacity-0"
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
                value={formData.notes}
                onChange={(e) => handleFormChange('notes', e.target.value)}
                placeholder="Class notes or description"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>
              Create Class
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            {/* Instructor Tabs with View Toggle */}
            <Tabs defaultValue="Mike Brown" onValueChange={setInstructor}>
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-4">
                <TabsList>
                  <TabsTrigger value="Mike Brown">Mike Brown</TabsTrigger>
                  <TabsTrigger value="Lisa Taylor">Lisa Taylor</TabsTrigger>
                  <TabsTrigger value="James Wilson">James Wilson</TabsTrigger>
                </TabsList>
                
                {/* View Mode Toggle */}
                <ToggleGroup type="single" value={viewMode} onValueChange={(value) => value && setViewMode(value)}>
                  <ToggleGroupItem value="month" aria-label="Month view">Month</ToggleGroupItem>
                  <ToggleGroupItem value="week" aria-label="Week view">Week</ToggleGroupItem>
                  <ToggleGroupItem value="day" aria-label="Day view">Day</ToggleGroupItem>
                </ToggleGroup>
              </div>
              
              {/* Calendar View */}
              {viewMode === "month" ? renderMonthView() : 
               viewMode === "week" ? renderWeekView() : 
               renderDayView()}
            </Tabs>
          </div>
        </CardContent>
      </Card>

      {/* Class Details Sheet */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="sm:max-w-md">
          {selectedClass && (
            <>
              <SheetHeader>
                <SheetTitle>{selectedClass.className}</SheetTitle>
                <SheetDescription>{selectedClass.type} Session</SheetDescription>
              </SheetHeader>
              <div className="mt-6 space-y-4">
                <div className="flex items-start space-x-3">
                  <UserRound className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Student</p>
                    <p className="text-sm text-muted-foreground">{selectedClass.student}</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Users className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Group</p>
                    <p className="text-sm text-muted-foreground">{selectedClass.group}</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <UserRound className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Instructor</p>
                    <p className="text-sm text-muted-foreground">{selectedClass.instructor}</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CalendarIcon className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Date & Time</p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(selectedClass.date), 'MMMM d, yyyy')} • {selectedClass.startTime} - {selectedClass.endTime}
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Duration</p>
                    <p className="text-sm text-muted-foreground">{selectedClass.duration}</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Contact</p>
                    <p className="text-sm text-muted-foreground">{selectedClass.phone}</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Bookmark className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Notes</p>
                    <p className="text-sm text-muted-foreground">{selectedClass.notes}</p>
                  </div>
                </div>
              </div>
              <div className="mt-6">
                <SheetClose asChild>
                  <Button className="w-full">Close</Button>
                </SheetClose>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </PageLayout>
  );
};

export default Calendar; 