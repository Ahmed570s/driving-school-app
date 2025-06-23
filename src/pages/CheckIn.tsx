import React, { useState, useRef } from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Clock, User, CheckCircle, Calendar, UserX } from "lucide-react";
import SignatureCanvas from 'react-signature-canvas';

// Dummy data for today's classes - replace with real data from Supabase
const todaysClasses: ClassItem[] = [
  {
    id: 1,
    classNumber: "C001",
    time: "09:00",
    endTime: "10:00",
    studentName: "Emma Wilson",
    instructor: "Mike Brown",
    status: "scheduled",
    signedAt: null,
    signature: null,
    missedAt: null,
    missedNote: null
  },
  {
    id: 2,
    classNumber: "C002",
    time: "10:30",
    endTime: "12:00",
    studentName: "John Smith",
    instructor: "Lisa Taylor",
    status: "scheduled",
    signedAt: null,
    signature: null,
    missedAt: null,
    missedNote: null
  },
  {
    id: 3,
    classNumber: "C003",
    time: "11:00",
    endTime: "12:00",
    studentName: "Sophia Garcia",
    instructor: "Mike Brown",
    status: "signed",
    signedAt: "2024-12-19T08:45:00Z",
    signature: "data:image/png;base64,...",
    missedAt: null,
    missedNote: null
  },
  {
    id: 4,
    classNumber: "C004",
    time: "14:00",
    endTime: "15:00",
    studentName: "Michael Johnson",
    instructor: "James Wilson",
    status: "scheduled",
    signedAt: null,
    signature: null,
    missedAt: null,
    missedNote: null
  },
  {
    id: 5,
    classNumber: "C005",
    time: "15:30",
    endTime: "17:00",
    studentName: "Olivia Brown",
    instructor: "Lisa Taylor",
    status: "scheduled",
    signedAt: null,
    signature: null,
    missedAt: null,
    missedNote: null
  },
  {
    id: 6,
    classNumber: "C006",
    time: "16:00",
    endTime: "17:00",
    studentName: "David Lee",
    instructor: "James Wilson",
    status: "scheduled",
    signedAt: null,
    signature: null,
    missedAt: null,
    missedNote: null
  }
];

interface ClassItem {
  id: number;
  classNumber: string;
  time: string;
  endTime: string;
  studentName: string;
  instructor: string;
  status: "scheduled" | "signed" | "missed";
  signedAt: string | null;
  signature: string | null;
  missedAt: string | null;
  missedNote: string | null;
}

const CheckIn = () => {
  const [classes, setClasses] = useState<ClassItem[]>(todaysClasses);
  const [selectedClass, setSelectedClass] = useState<ClassItem | null>(null);
  const [signatureModalOpen, setSignatureModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [missedNote, setMissedNote] = useState("");
  const [showMissedNote, setShowMissedNote] = useState(false);
  const signatureRef = useRef<SignatureCanvas>(null);

  const today = new Date();

  const handleSignIn = (classItem: ClassItem) => {
    setSelectedClass(classItem);
    setSignatureModalOpen(true);
  };

  const handleClearSignature = () => {
    if (signatureRef.current) {
      signatureRef.current.clear();
    }
  };

  const handleSubmitSignature = async () => {
    if (!selectedClass || !signatureRef.current) return;

    const signatureData = signatureRef.current.toDataURL();
    
    if (signatureRef.current.isEmpty()) {
      alert("Please provide a signature before submitting.");
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulate API call - replace with actual Supabase call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Update the class status
      setClasses(prevClasses =>
        prevClasses.map(cls =>
          cls.id === selectedClass.id
            ? {
                ...cls,
                status: "signed" as const,
                signedAt: new Date().toISOString(),
                signature: signatureData
              }
            : cls
        )
      );

      setSignatureModalOpen(false);
      setSelectedClass(null);
    } catch (error) {
      console.error("Error submitting signature:", error);
      alert("Failed to submit signature. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelSignature = () => {
    setSignatureModalOpen(false);
    setSelectedClass(null);
    setMissedNote("");
    setShowMissedNote(false);
  };

  const handleNoShow = () => {
    setShowMissedNote(true);
  };

  const handleSubmitNoShow = async () => {
    if (!selectedClass) return;

    setIsSubmitting(true);

    try {
      // Simulate API call - replace with actual Supabase call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Update the class status to missed
      setClasses(prevClasses =>
        prevClasses.map(cls =>
          cls.id === selectedClass.id
            ? {
                ...cls,
                status: "missed" as const,
                missedAt: new Date().toISOString(),
                missedNote: missedNote.trim() || "No show"
              }
            : cls
        )
      );

      // Log activity (in real implementation, this would be sent to Supabase)
      console.log(`Activity Log: Student ${selectedClass.studentName} marked as no-show for ${selectedClass.time} class with instructor ${selectedClass.instructor}. Note: ${missedNote.trim() || "No show"}`);

      setSignatureModalOpen(false);
      setSelectedClass(null);
      setMissedNote("");
      setShowMissedNote(false);
    } catch (error) {
      console.error("Error marking as no-show:", error);
      alert("Failed to mark as no-show. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Sticky Header */}
      <div className="sticky top-0 z-10 bg-background border-b border-border/50 shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Calendar className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-2xl font-bold text-foreground">Class Check-In</h1>
                <p className="text-muted-foreground">
                  {format(today, 'EEEE, MMMM d, yyyy')}
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-primary">
                {format(today, 'HH:mm')}
              </div>
              <div className="text-sm text-muted-foreground">
                {classes.filter(c => c.status === 'signed').length} of {classes.length} signed in
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {classes.map((classItem) => (
            <Card 
              key={classItem.id} 
              className={`transition-all duration-200 hover:shadow-lg ${
                classItem.status === 'signed' 
                  ? 'bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800' 
                  : classItem.status === 'missed'
                  ? 'bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-800'
                  : 'hover:scale-[1.02] cursor-pointer'
              }`}
            >
              <CardContent className="p-6">
                <div className="space-y-4">
                  {/* Time and Status */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Clock className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <div className="text-lg font-semibold">
                          {classItem.time} - {classItem.endTime}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Class #{classItem.classNumber}
                        </div>
                      </div>
                    </div>
                    {classItem.status === 'signed' && (
                      <Badge variant="secondary" className="bg-green-100 text-green-700 border-green-200">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Signed
                      </Badge>
                    )}
                    {classItem.status === 'missed' && (
                      <Badge variant="secondary" className="bg-red-100 text-red-700 border-red-200">
                        <UserX className="h-3 w-3 mr-1" />
                        No Show
                      </Badge>
                    )}
                  </div>

                  {/* Student Name */}
                  <div className="flex items-center space-x-2">
                    <User className="h-5 w-5 text-muted-foreground" />
                    <span className="text-xl font-medium text-foreground">
                      {classItem.studentName}
                    </span>
                  </div>

                  {/* Instructor */}
                  <div className="text-sm text-muted-foreground">
                    Instructor: <span className="font-medium">{classItem.instructor}</span>
                  </div>

                  {/* Signed At */}
                  {classItem.status === 'signed' && classItem.signedAt && (
                    <div className="text-sm text-green-600 dark:text-green-400">
                      Signed at: {format(new Date(classItem.signedAt), 'HH:mm')}
                    </div>
                  )}

                  {/* Missed At */}
                  {classItem.status === 'missed' && classItem.missedAt && (
                    <div className="text-sm text-red-600 dark:text-red-400">
                      Marked no-show at: {format(new Date(classItem.missedAt), 'HH:mm')}
                      {classItem.missedNote && (
                        <div className="text-xs mt-1 italic">"{classItem.missedNote}"</div>
                      )}
                    </div>
                  )}

                  {/* Sign In Button */}
                  <Button 
                    onClick={() => handleSignIn(classItem)}
                    disabled={classItem.status === 'signed' || classItem.status === 'missed'}
                    className="w-full h-12 text-lg"
                    variant={classItem.status === 'signed' || classItem.status === 'missed' ? "secondary" : "default"}
                  >
                    {classItem.status === 'signed' ? 'Already Signed' : 
                     classItem.status === 'missed' ? 'No Show' : 'Sign In'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {classes.length === 0 && (
          <div className="text-center py-12">
            <Calendar className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium text-muted-foreground mb-2">No classes scheduled</h3>
            <p className="text-sm text-muted-foreground">There are no classes scheduled for today.</p>
          </div>
        )}
      </div>

      {/* Signature Modal */}
      <Dialog open={signatureModalOpen} onOpenChange={setSignatureModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] p-0">
          <DialogHeader className="p-6 pb-4">
            <DialogTitle className="text-2xl">Student Sign-In</DialogTitle>
          </DialogHeader>
          
          {selectedClass && (
            <div className={`px-6 space-y-6 ${showMissedNote ? 'pb-8' : ''}`}>
              {/* Class Information */}
              <div className="bg-muted/50 rounded-lg p-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-muted-foreground">Student:</span>
                    <p className="text-lg font-semibold">{selectedClass.studentName}</p>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Time:</span>
                    <p className="text-lg font-semibold">{selectedClass.time} - {selectedClass.endTime}</p>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Class Number:</span>
                    <p className="text-lg font-semibold">{selectedClass.classNumber}</p>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Instructor:</span>
                    <p className="text-lg font-semibold">{selectedClass.instructor}</p>
                  </div>
                </div>
              </div>

              {/* Signature Pad */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">Please sign below:</h3>
                  <Button 
                    variant="outline" 
                    onClick={handleClearSignature}
                    type="button"
                  >
                    Clear
                  </Button>
                </div>
                
                <div className="border-2 border-dashed border-border rounded-lg p-2">
                  <SignatureCanvas
                    ref={signatureRef}
                    canvasProps={{
                      width: 800,
                      height: 300,
                      className: 'signature-canvas w-full h-full bg-background rounded'
                    }}
                    backgroundColor="rgb(255, 255, 255)"
                    penColor="rgb(0, 0, 0)"
                  />
                </div>
              </div>

              {/* No Show Note Section */}
              {showMissedNote && (
                <div className="space-y-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <UserX className="h-5 w-5 text-red-600" />
                    <h3 className="text-lg font-medium text-red-800">Mark as No Show</h3>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="missed-note" className="text-sm font-medium text-red-700">
                      Reason (optional)
                    </Label>
                    <Textarea
                      id="missed-note"
                      placeholder="e.g., Student called in sick, No contact, etc."
                      value={missedNote}
                      onChange={(e) => setMissedNote(e.target.value)}
                      className="min-h-[80px]"
                      disabled={isSubmitting}
                    />
                  </div>
                  <div className="flex space-x-3">
                    <Button 
                      variant="outline"
                      onClick={() => setShowMissedNote(false)}
                      className="h-10 px-6"
                      disabled={isSubmitting}
                    >
                      Cancel
                    </Button>
                    <Button 
                      variant="destructive"
                      onClick={handleSubmitNoShow}
                      className="h-10 px-6"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'Submitting...' : 'Submit No Show'}
                    </Button>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              {!showMissedNote && (
                <div className="flex space-x-4 pb-6">
                  <Button 
                    variant="outline" 
                    onClick={handleCancelSignature}
                    className="h-12 text-lg px-8"
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  
                  <Button 
                    variant="destructive"
                    onClick={handleNoShow}
                    className="h-12 text-lg px-6"
                    disabled={isSubmitting}
                  >
                    <UserX className="h-4 w-4 mr-2" />
                    No Show
                  </Button>
                  <Button 
                    onClick={handleSubmitSignature}
                    className="flex-1 h-12 text-lg"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit Signature'}
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CheckIn; 