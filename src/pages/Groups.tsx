import { PageLayout } from "@/components/ui/page-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users } from "lucide-react";

const GroupsSection = () => {
  return (
    <PageLayout>
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Groups</h1>
        </div>
        
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Student Groups Management</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Users className="h-16 w-16 text-muted-foreground mb-4" />
            <h2 className="text-2xl font-semibold mb-2">Coming Soon</h2>
            <p className="text-muted-foreground text-center max-w-md">
              The Groups management feature is currently under development. 
              You'll be able to organize students into groups, manage class schedules, 
              and track group progress.
            </p>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
};

export default GroupsSection; 