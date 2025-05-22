import { PageLayout } from "@/components/ui/page-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Medal } from "lucide-react";

const CertificatesSection = () => {
  return (
    <PageLayout>
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Certificates</h1>
        </div>
        
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Student Certifications</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Medal className="h-16 w-16 text-muted-foreground mb-4" />
            <h2 className="text-2xl font-semibold mb-2">Coming Soon</h2>
            <p className="text-muted-foreground text-center max-w-md">
              The Certificates management feature is currently under development. 
              You'll be able to issue, track, and verify student certifications, 
              completion records, and achievement badges.
            </p>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
};

export default CertificatesSection; 