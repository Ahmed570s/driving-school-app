import React, { useState, useEffect } from "react";
import { PageLayout } from "@/components/ui/page-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  UserRound, Calendar, CheckCircle, BadgeDollarSign, Users, 
  BookOpen, Car, Trash, FileText, LogIn, LogOut, Eye, Award,
  RefreshCw, Filter, ChevronLeft, ChevronRight, AlertCircle,
  Plus, Edit, X
} from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { 
  getActivityLogs, 
  ActivityLog, 
  ActivityLogFilters,
  ActionType,
  LogLevel,
  UserRole
} from "@/services/activityLogs";

// Icon mapper function to return appropriate icon based on action type
const getActionIcon = (actionType: ActionType) => {
  switch (actionType) {
    case "create":
      return <Plus className="h-4 w-4" />;
    case "update":
      return <Edit className="h-4 w-4" />;
    case "delete":
      return <Trash className="h-4 w-4" />;
    case "login":
      return <LogIn className="h-4 w-4" />;
    case "logout":
      return <LogOut className="h-4 w-4" />;
    case "view":
      return <Eye className="h-4 w-4" />;
    case "payment":
      return <BadgeDollarSign className="h-4 w-4" />;
    case "class_scheduled":
      return <Calendar className="h-4 w-4" />;
    case "class_completed":
      return <CheckCircle className="h-4 w-4" />;
    case "certificate_issued":
      return <Award className="h-4 w-4" />;
    default:
      return <FileText className="h-4 w-4" />;
  }
};

// Get icon background color based on action type
const getActionIconBg = (actionType: ActionType) => {
  switch (actionType) {
    case "create":
      return "bg-green-100 text-green-700";
    case "update":
      return "bg-blue-100 text-blue-700";
    case "delete":
      return "bg-red-100 text-red-700";
    case "login":
      return "bg-emerald-100 text-emerald-700";
    case "logout":
      return "bg-gray-100 text-gray-700";
    case "view":
      return "bg-purple-100 text-purple-700";
    case "payment":
      return "bg-amber-100 text-amber-700";
    case "class_scheduled":
      return "bg-indigo-100 text-indigo-700";
    case "class_completed":
      return "bg-teal-100 text-teal-700";
    case "certificate_issued":
      return "bg-yellow-100 text-yellow-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
};

// Get user role badge color
const getRoleColor = (role: UserRole | null) => {
  switch (role) {
    case "admin":
      return "bg-blue-100 text-blue-800 border-blue-200";
    case "instructor":
      return "bg-green-100 text-green-800 border-green-200";
    case "student":
      return "bg-amber-100 text-amber-800 border-amber-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

// Get log level badge color
const getLogLevelColor = (level: LogLevel) => {
  switch (level) {
    case "info":
      return "bg-blue-50 text-blue-700 border-blue-200";
    case "warning":
      return "bg-yellow-50 text-yellow-700 border-yellow-200";
    case "error":
      return "bg-red-50 text-red-700 border-red-200";
    case "critical":
      return "bg-red-100 text-red-900 border-red-300";
    default:
      return "bg-gray-50 text-gray-700 border-gray-200";
  }
};

// Get entity type icon
const getEntityIcon = (entityType: string | null) => {
  switch (entityType) {
    case "student":
      return <UserRound className="h-3 w-3" />;
    case "instructor":
      return <UserRound className="h-3 w-3" />;
    case "class":
      return <BookOpen className="h-3 w-3" />;
    case "group":
      return <Users className="h-3 w-3" />;
    case "document":
      return <FileText className="h-3 w-3" />;
    case "payment":
      return <BadgeDollarSign className="h-3 w-3" />;
    case "certificate":
      return <Award className="h-3 w-3" />;
    case "user":
      return <UserRound className="h-3 w-3" />;
    default:
      return null;
  }
};

const ITEMS_PER_PAGE = 25;

const ActivityLogsSection = () => {
  // State
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  
  // Filters
  const [filters, setFilters] = useState<ActivityLogFilters>({
    limit: ITEMS_PER_PAGE,
    offset: 0,
  });
  const [actionTypeFilter, setActionTypeFilter] = useState<string>("all");
  const [entityTypeFilter, setEntityTypeFilter] = useState<string>("all");
  const [logLevelFilter, setLogLevelFilter] = useState<string>("all");
  const [userRoleFilter, setUserRoleFilter] = useState<string>("all");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  // Load logs
  const loadLogs = async (page: number = 1) => {
    try {
      setLoading(true);
      setError(null);
      
      const offset = (page - 1) * ITEMS_PER_PAGE;
      
      const filterParams: ActivityLogFilters = {
        limit: ITEMS_PER_PAGE,
        offset,
      };
      
      // Apply filters
      if (actionTypeFilter !== "all") {
        filterParams.actionType = actionTypeFilter as ActionType;
      }
      if (entityTypeFilter !== "all") {
        filterParams.entityType = entityTypeFilter;
      }
      if (logLevelFilter !== "all") {
        filterParams.logLevel = logLevelFilter as LogLevel;
      }
      if (userRoleFilter !== "all") {
        filterParams.userRole = userRoleFilter as UserRole;
      }
      if (startDate) {
        filterParams.startDate = `${startDate}T00:00:00`;
      }
      if (endDate) {
        filterParams.endDate = `${endDate}T23:59:59`;
      }
      
      const data = await getActivityLogs(filterParams);
      
      setLogs(data);
      setHasMore(data.length === ITEMS_PER_PAGE);
      setCurrentPage(page);
      
    } catch (err: any) {
      console.error('Error loading activity logs:', err);
      setError(err.message || 'Failed to load activity logs');
      toast({
        title: "Error",
        description: "Failed to load activity logs. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    loadLogs(1);
  }, []);

  // Apply filters
  const handleApplyFilters = () => {
    setCurrentPage(1);
    loadLogs(1);
  };

  // Clear filters
  const handleClearFilters = () => {
    setActionTypeFilter("all");
    setEntityTypeFilter("all");
    setLogLevelFilter("all");
    setUserRoleFilter("all");
    setStartDate("");
    setEndDate("");
    setCurrentPage(1);
    
    // Reload with no filters
    setTimeout(() => loadLogs(1), 0);
  };

  // Pagination handlers
  const handlePreviousPage = () => {
    if (currentPage > 1) {
      loadLogs(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (hasMore) {
      loadLogs(currentPage + 1);
    }
  };

  // Refresh
  const handleRefresh = () => {
    loadLogs(currentPage);
    toast({
      title: "Refreshed",
      description: "Activity logs have been refreshed.",
    });
  };

  return (
    <PageLayout>
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Activity Logs</h1>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4 mr-2" />
              {showFilters ? "Hide Filters" : "Show Filters"}
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleRefresh}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Filters */}
        {showFilters && (
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Filters</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {/* Action Type */}
                <div className="space-y-2">
                  <Label>Action Type</Label>
                  <Select value={actionTypeFilter} onValueChange={setActionTypeFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All actions" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Actions</SelectItem>
                      <SelectItem value="create">Create</SelectItem>
                      <SelectItem value="update">Update</SelectItem>
                      <SelectItem value="delete">Delete</SelectItem>
                      <SelectItem value="login">Login</SelectItem>
                      <SelectItem value="logout">Logout</SelectItem>
                      <SelectItem value="view">View</SelectItem>
                      <SelectItem value="payment">Payment</SelectItem>
                      <SelectItem value="class_scheduled">Class Scheduled</SelectItem>
                      <SelectItem value="class_completed">Class Completed</SelectItem>
                      <SelectItem value="certificate_issued">Certificate Issued</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Entity Type */}
                <div className="space-y-2">
                  <Label>Entity Type</Label>
                  <Select value={entityTypeFilter} onValueChange={setEntityTypeFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All entities" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Entities</SelectItem>
                      <SelectItem value="student">Student</SelectItem>
                      <SelectItem value="instructor">Instructor</SelectItem>
                      <SelectItem value="class">Class</SelectItem>
                      <SelectItem value="group">Group</SelectItem>
                      <SelectItem value="document">Document</SelectItem>
                      <SelectItem value="payment">Payment</SelectItem>
                      <SelectItem value="certificate">Certificate</SelectItem>
                      <SelectItem value="user">User</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Log Level */}
                <div className="space-y-2">
                  <Label>Log Level</Label>
                  <Select value={logLevelFilter} onValueChange={setLogLevelFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All levels" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Levels</SelectItem>
                      <SelectItem value="info">Info</SelectItem>
                      <SelectItem value="warning">Warning</SelectItem>
                      <SelectItem value="error">Error</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* User Role */}
                <div className="space-y-2">
                  <Label>User Role</Label>
                  <Select value={userRoleFilter} onValueChange={setUserRoleFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All roles" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Roles</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="instructor">Instructor</SelectItem>
                      <SelectItem value="student">Student</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Start Date */}
                <div className="space-y-2">
                  <Label>Start Date</Label>
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>

                {/* End Date */}
                <div className="space-y-2">
                  <Label>End Date</Label>
                  <Input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline" onClick={handleClearFilters}>
                  <X className="h-4 w-4 mr-2" />
                  Clear
                </Button>
                <Button onClick={handleApplyFilters}>
                  <Filter className="h-4 w-4 mr-2" />
                  Apply Filters
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Activity Log List */}
        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle>Recent Activities</CardTitle>
            <CardDescription>
              A log of recent actions performed in the system
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <span className="ml-3 text-muted-foreground">Loading activity logs...</span>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
                <p className="text-lg font-medium text-red-600">Error Loading Logs</p>
                <p className="text-sm text-muted-foreground mt-1">{error}</p>
                <Button variant="outline" className="mt-4" onClick={() => loadLogs(1)}>
                  Try Again
                </Button>
              </div>
            ) : logs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <FileText className="h-12 w-12 text-muted-foreground/50 mb-4" />
                <p className="text-lg font-medium">No Activity Logs</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {actionTypeFilter !== "all" || entityTypeFilter !== "all" || logLevelFilter !== "all" || userRoleFilter !== "all" || startDate || endDate
                    ? "No logs match your filter criteria. Try adjusting your filters."
                    : "Activity logs will appear here as actions are performed in the system."
                  }
                </p>
              </div>
            ) : (
              <>
                <ScrollArea className="h-[600px] pr-4">
                  <div className="space-y-4">
                    {logs.map((log, index) => (
                      <div key={log.id}>
                        <div className="flex items-start gap-4">
                          {/* Action Icon */}
                          <div className={`flex h-10 w-10 items-center justify-center rounded-full ${getActionIconBg(log.actionType)}`}>
                            {getActionIcon(log.actionType)}
                          </div>
                          
                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            {/* Description */}
                            <div className="flex items-start justify-between gap-4">
                              <p className="text-sm font-medium leading-relaxed">{log.description}</p>
                              <span className="text-xs text-muted-foreground whitespace-nowrap">{log.timeAgo}</span>
                            </div>
                            
                            {/* Meta info */}
                            <div className="mt-2 flex flex-wrap items-center gap-2">
                              {/* User Role */}
                              {log.userRole && (
                                <Badge variant="outline" className={`text-xs ${getRoleColor(log.userRole)}`}>
                                  {log.userRole}
                                </Badge>
                              )}
                              
                              {/* User Email */}
                              {log.userEmail && (
                                <span className="text-xs text-muted-foreground">
                                  {log.userEmail}
                                </span>
                              )}
                              
                              {/* Entity Type */}
                              {log.entityType && (
                                <Badge variant="outline" className="text-xs bg-gray-50">
                                  <span className="mr-1">{getEntityIcon(log.entityType)}</span>
                                  {log.entityType}
                                </Badge>
                              )}
                              
                              {/* Log Level (if not info) */}
                              {log.logLevel !== 'info' && (
                                <Badge variant="outline" className={`text-xs ${getLogLevelColor(log.logLevel)}`}>
                                  {log.logLevel}
                                </Badge>
                              )}
                            </div>
                            
                            {/* Changed values (if any) */}
                            {(log.oldValues || log.newValues) && (
                              <div className="mt-2 text-xs text-muted-foreground bg-muted/50 rounded p-2">
                                {log.oldValues && Object.keys(log.oldValues).length > 0 && (
                                  <div className="flex gap-2">
                                    <span className="font-medium text-red-600">Old:</span>
                                    <span>{JSON.stringify(log.oldValues)}</span>
                                  </div>
                                )}
                                {log.newValues && Object.keys(log.newValues).length > 0 && (
                                  <div className="flex gap-2">
                                    <span className="font-medium text-green-600">New:</span>
                                    <span>{JSON.stringify(log.newValues)}</span>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {index < logs.length - 1 && (
                          <Separator className="my-4" />
                        )}
                      </div>
                    ))}
                  </div>
                </ScrollArea>

                {/* Pagination */}
                <div className="flex items-center justify-between mt-4 pt-4 border-t">
                  <p className="text-sm text-muted-foreground">
                    Page {currentPage} • Showing {logs.length} logs
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handlePreviousPage}
                      disabled={currentPage === 1 || loading}
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleNextPage}
                      disabled={!hasMore || loading}
                    >
                      Next
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
};

export default ActivityLogsSection;
