import React, { useState } from "react";
import { PageLayout } from "@/components/ui/page-layout";
import { Button } from "@/components/ui/button";
import { Plus, ChevronLeft, ChevronRight, Phone, Clock, Users, Bookmark, UserRound, Calendar as CalendarIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetClose } from "@/components/ui/sheet";
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
  const [instructor, setInstructor] = useState("Mike Brown");
  const [viewMode, setViewMode] = useState("month");
  const [selectedClass, setSelectedClass] = useState<ClassItem | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  
  // Get days for current month
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });
  
  // Navigation functions
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  
  // Filter classes by instructor
  const instructorClasses = dummyClasses.filter(cls => cls.instructor === instructor);
  
  // Get classes for a specific day
  const getClassesForDay = (day: Date) => {
    const dateString = format(day, 'yyyy-MM-dd');
    return instructorClasses.filter(cls => cls.date === dateString);
  };
  
  // Generate weekly view days (current week)
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(new Date(2025, 4, 18), i)); // Start from May 18, 2025
  
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
      
      <div className="grid grid-cols-7 gap-px bg-muted">
        {/* Days of week */}
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div key={day} className="text-center p-2 font-medium">
            {day}
          </div>
        ))}
        
        {/* Empty cells for days of previous month */}
        {Array.from({ length: monthStart.getDay() }).map((_, index) => (
          <div key={`empty-start-${index}`} className="bg-card p-2 min-h-24"></div>
        ))}
        
        {/* Calendar days */}
        {monthDays.map((day) => {
          const dayClasses = getClassesForDay(day);
          const displayClasses = dayClasses.slice(0, 2); // Only show first 2 classes
          const remainingCount = dayClasses.length - 2;  // Count remaining classes
          const dayNum = day.getDay(); // 0 = Sunday, 3 = Wednesday
          const isWednesday = dayNum === 3;
          const isDay21 = day.getDate() === 21; // Check if it's the 21st day
          
          return (
            <div
              key={day.toString()}
              className={`bg-card p-2 min-h-24 ${
                isDay21 ? 'bg-rose-50' : ''
              }`}
            >
              <div className="text-sm font-medium mb-1">{format(day, 'd')}</div>
              
              {displayClasses.map((cls) => (
                <div
                  key={cls.id}
                  className={`${cls.type === "Theory" ? "bg-blue-100 text-blue-700 border border-blue-300" : "bg-rose-100 text-rose-700 border border-rose-300"} p-1 text-xs rounded mb-1 truncate cursor-pointer hover:opacity-80 transition-opacity`}
                  onClick={() => handleClassClick(cls)}
                >
                  <div className="font-medium">{cls.student}</div>
                  <div>{cls.startTime} - {cls.endTime}</div>
                </div>
              ))}
              
              {/* Show "+X more" message if there are additional classes */}
              {remainingCount > 0 && (
                <div className="text-xs font-medium text-muted-foreground mt-1 text-center bg-muted py-0.5 rounded">
                  +{remainingCount} more
                </div>
              )}
            </div>
          );
        })}
        
        {/* Empty cells for days of next month */}
        {Array.from({ length: (7 - ((monthDays.length + monthStart.getDay()) % 7)) % 7 }).map((_, index) => (
          <div key={`empty-end-${index}`} className="bg-card p-2 min-h-24"></div>
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
          <Button variant="outline" size="icon">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <div className="flex border rounded">
        {/* Time column */}
        <div className="w-20 border-r bg-[#f9f9f9]">
          <div className="h-14"></div> {/* Empty header cell with increased height */}
          {timeSlots.map((time) => (
            <div key={time} className="h-16 flex items-center justify-center text-sm border-t">
              {time}
            </div>
          ))}
        </div>
        
        {/* Week days */}
        <div className="flex-1 grid grid-cols-7">
          {/* Day headers */}
          <div className="col-span-7 grid grid-cols-7 divide-x bg-[#f9f9f9]">
            {weekDays.map((day) => {
              const dayNum = day.getDay(); // 0 = Sunday, 3 = Wednesday
              const isWednesday = dayNum === 3;
              
              return (
                <div 
                  key={day.toString()} 
                  className={`text-center py-3 px-2 font-medium h-14 flex flex-col justify-center ${isWednesday ? 'bg-rose-50' : ''}`}
                >
                  <div className="text-sm">{format(day, 'EEE')}</div>
                  <div className="text-base">{format(day, 'd')}</div>
                </div>
              );
            })}
          </div>
          
          {/* Time grid */}
          <div className="col-span-7 grid grid-cols-7 divide-x">
            {weekDays.map((day) => {
              const dayClasses = getClassesForDay(day);
              const dayNum = day.getDay(); // 0 = Sunday, 3 = Wednesday
              const isWednesday = dayNum === 3;
              
              return (
                <div key={day.toString()} className={`relative ${isWednesday ? 'bg-rose-50' : 'bg-white'}`}>
                  {/* Time slot rows - just for the grid */}
                  {timeSlots.map((time) => (
                    <div 
                      key={`${day}-${time}`} 
                      className="h-16 border-t"
                    />
                  ))}
                  
                  {/* Render classes as absolute positioned blocks */}
                  {dayClasses.map((cls) => {
                    const { startHour, duration } = getClassPositionData(cls);
                    const topPosition = (startHour - 8) * 64; // 8 is first hour, 64px per hour (16px * 4)
                    const height = Math.max(duration * 64, 64); // Ensure at least one hour height
                    
                    // Choose background color based on class type - always use rose for all classes as in picture
                    const bgColor = "bg-rose-100 border border-rose-300";
                    
                    return (
                      <div
                        key={cls.id}
                        className={`absolute inset-x-1 ${bgColor} p-2 rounded shadow-sm cursor-pointer hover:opacity-80 transition-opacity`}
                        style={{ 
                          top: `${topPosition + 2}px`, 
                          height: `${height - 4}px`,
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between',
                        }}
                        onClick={() => handleClassClick(cls)}
                      >
                        <div>
                          <div className="font-medium text-rose-700 text-xs">{cls.student}</div>
                          <div className="text-xs text-rose-700">{cls.startTime} - {cls.endTime}</div>
                        </div>
                        <div className="flex items-center text-xs text-rose-700">
                          <Phone className="h-3 w-3 mr-1" />
                          <span className="whitespace-nowrap">{cls.phone}</span>
                        </div>
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
  
  return (
    <PageLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Calendar</h1>
        <Button>
          <Plus className="mr-1 h-4 w-4" />
          Create Class
        </Button>
      </div>
      
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            {/* Instructor Tabs */}
            <Tabs defaultValue="Mike Brown" onValueChange={setInstructor}>
              <TabsList className="mb-4">
                <TabsTrigger value="Mike Brown">Mike Brown</TabsTrigger>
                <TabsTrigger value="Lisa Taylor">Lisa Taylor</TabsTrigger>
                <TabsTrigger value="James Wilson">James Wilson</TabsTrigger>
              </TabsList>
              
              {/* View Mode Toggle */}
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-medium">{instructor}'s Schedule</h2>
                <ToggleGroup type="single" value={viewMode} onValueChange={(value) => value && setViewMode(value)}>
                  <ToggleGroupItem value="month" aria-label="Month view">Month</ToggleGroupItem>
                  <ToggleGroupItem value="week" aria-label="Week view">Week</ToggleGroupItem>
                </ToggleGroup>
              </div>
              
              {/* Calendar View */}
              {viewMode === "month" ? renderMonthView() : renderWeekView()}
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