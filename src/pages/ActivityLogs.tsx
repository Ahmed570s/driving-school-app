import React from "react";
import { PageLayout } from "@/components/ui/page-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
  UserRound, Calendar, CheckCircle, BadgeDollarSign, Users, 
  BookOpen, Star, Car, Trash, MessageSquare, Settings, 
  Clock, Lock, FileText
} from "lucide-react";

// Define activity entry type
interface ActivityEntry {
  id: number;
  message: string;
  timestamp: string;
  actor: string;
  actorType: "admin" | "instructor" | "system" | "student";
  actionType: "user" | "calendar" | "completion" | "payment" | "group" | "lesson" | "rating" | "vehicle" | "delete" | "message" | "settings" | "time" | "security" | "document";
}

// Dummy activities data - ordered by most recent first
const dummyActivities: ActivityEntry[] = [
  {
    id: 1,
    message: "John Smith registered as a new student",
    timestamp: "2 minutes ago",
    actor: "Admin User",
    actorType: "admin",
    actionType: "user"
  },
  {
    id: 2,
    message: "Theory class scheduled for Group A",
    timestamp: "15 minutes ago",
    actor: "Mike Brown",
    actorType: "instructor",
    actionType: "calendar"
  },
  {
    id: 3,
    message: "David Johnson's payment processed for Lesson Pack B",
    timestamp: "1 hour ago",
    actor: "System",
    actorType: "system",
    actionType: "payment"
  },
  {
    id: 4,
    message: "Emma Wilson completed her driving course",
    timestamp: "3 hours ago",
    actor: "Lisa Taylor",
    actorType: "instructor",
    actionType: "completion"
  },
  {
    id: 5,
    message: "New Group C created for weekend classes",
    timestamp: "Yesterday, 4:30 PM",
    actor: "Admin User",
    actorType: "admin",
    actionType: "group"
  },
  {
    id: 6,
    message: "Vehicle #3 maintenance schedule updated",
    timestamp: "Yesterday, 2:15 PM",
    actor: "James Wilson",
    actorType: "instructor",
    actionType: "vehicle"
  },
  {
    id: 7,
    message: "Summer promotional discount activated",
    timestamp: "2 days ago",
    actor: "System",
    actorType: "system",
    actionType: "settings"
  },
  {
    id: 8,
    message: "Michael Johnson left a 5-star review",
    timestamp: "2 days ago",
    actor: "Michael Johnson",
    actorType: "student",
    actionType: "rating"
  },
  {
    id: 9,
    message: "System backup completed successfully",
    timestamp: "3 days ago",
    actor: "System",
    actorType: "system",
    actionType: "security"
  },
  {
    id: 10,
    message: "Instructor meeting minutes uploaded",
    timestamp: "3 days ago",
    actor: "Admin User",
    actorType: "admin",
    actionType: "document"
  },
  {
    id: 11,
    message: "Student record for Sarah Miller deleted",
    timestamp: "4 days ago",
    actor: "Admin User",
    actorType: "admin",
    actionType: "delete"
  },
  {
    id: 12,
    message: "Holiday schedule for December published",
    timestamp: "5 days ago",
    actor: "System",
    actorType: "system",
    actionType: "calendar"
  },
  {
    id: 13,
    message: "New messaging system implemented",
    timestamp: "1 week ago",
    actor: "System",
    actorType: "system",
    actionType: "message"
  },
  {
    id: 14,
    message: "Class rescheduled for Alex Thompson",
    timestamp: "1 week ago",
    actor: "Lisa Taylor",
    actorType: "instructor",
    actionType: "time"
  },
  {
    id: 15,
    message: "Theory test materials updated",
    timestamp: "1 week ago",
    actor: "Mike Brown",
    actorType: "instructor",
    actionType: "lesson"
  }
];

// Icon mapper function to return appropriate icon based on action type
const getActionIcon = (actionType: string) => {
  switch (actionType) {
    case "user":
      return <UserRound className="h-4 w-4" />;
    case "calendar":
      return <Calendar className="h-4 w-4" />;
    case "completion":
      return <CheckCircle className="h-4 w-4" />;
    case "payment":
      return <BadgeDollarSign className="h-4 w-4" />;
    case "group":
      return <Users className="h-4 w-4" />;
    case "lesson":
      return <BookOpen className="h-4 w-4" />;
    case "rating":
      return <Star className="h-4 w-4" />;
    case "vehicle":
      return <Car className="h-4 w-4" />;
    case "delete":
      return <Trash className="h-4 w-4" />;
    case "message":
      return <MessageSquare className="h-4 w-4" />;
    case "settings":
      return <Settings className="h-4 w-4" />;
    case "time":
      return <Clock className="h-4 w-4" />;
    case "security":
      return <Lock className="h-4 w-4" />;
    case "document":
      return <FileText className="h-4 w-4" />;
    default:
      return <Calendar className="h-4 w-4" />;
  }
};

// Get actor type badge background color
const getActorTypeColor = (actorType: string) => {
  switch (actorType) {
    case "admin":
      return "bg-blue-100 text-blue-800";
    case "instructor":
      return "bg-green-100 text-green-800";
    case "system":
      return "bg-purple-100 text-purple-800";
    case "student":
      return "bg-amber-100 text-amber-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const ActivityLogsSection = () => {
  return (
    <PageLayout>
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Activity Logs</h1>
        </div>

        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle>Recent Activities</CardTitle>
            <CardDescription>
              A log of recent actions performed in the system
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <ScrollArea className="h-[600px] pr-4">
              <div className="space-y-6">
                {dummyActivities.map((activity, index) => (
                  <div key={activity.id}>
                    <div className="flex items-start">
                      <div className="mr-4 flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                        {getActionIcon(activity.actionType)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium">{activity.message}</p>
                          <span className="text-xs text-muted-foreground">{activity.timestamp}</span>
                        </div>
                        <div className="mt-1 flex items-center">
                          <span className={`text-xs px-2 py-0.5 rounded-full ${getActorTypeColor(activity.actorType)}`}>
                            {activity.actorType}
                          </span>
                          <span className="text-xs text-muted-foreground ml-2">{activity.actor}</span>
                        </div>
                      </div>
                    </div>
                    {index < dummyActivities.length - 1 && (
                      <Separator className="my-4" />
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
};

export default ActivityLogsSection; 