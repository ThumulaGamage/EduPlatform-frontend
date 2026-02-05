// src/components/assignments/AssignmentList.tsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, FileText, Users, AlertCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import API from "@/api/axios";
import { format, isPast } from "date-fns";

interface Assignment {
  _id: string;
  title: string;
  description: string;
  dueDate: string;
  maxScore: number;
  status: string;
  allowLateSubmission: boolean;
  teacherId: {
    name: string;
  };
  submission?: {
    _id: string;
    status: string;
    submittedAt: string;
    grade?: {
      score: number;
      feedback: string;
    };
  };
  hasSubmitted?: boolean;
}

interface AssignmentListProps {
  courseId: string;
}

const AssignmentList = ({ courseId }: AssignmentListProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAssignments();
  }, [courseId]);

  const fetchAssignments = async () => {
    setLoading(true);
    try {
      const response = await API.get(`/api/assignments/course/${courseId}`);
      setAssignments(response.data.assignments);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.response?.data?.message || "Failed to load assignments"
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (assignment: Assignment) => {
    if (user?.role === 'student') {
      if (assignment.submission?.status === 'graded') {
        return <Badge className="bg-green-500">Graded</Badge>;
      }
      if (assignment.hasSubmitted) {
        return <Badge className="bg-blue-500">Submitted</Badge>;
      }
      if (isPast(new Date(assignment.dueDate))) {
        return <Badge variant="destructive">Overdue</Badge>;
      }
      return <Badge variant="outline">Pending</Badge>;
    }
    
    // Teacher view
    return <Badge variant="secondary">{assignment.status}</Badge>;
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4 text-muted-foreground">Loading assignments...</p>
      </div>
    );
  }

  if (assignments.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <FileText className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No assignments yet</p>
          {user?.role === 'teacher' && (
            <p className="text-sm text-muted-foreground mt-2">
              Create your first assignment to get started
            </p>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {assignments.map((assignment) => {
        const isOverdue = isPast(new Date(assignment.dueDate));
        
        return (
          <Card key={assignment._id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg">{assignment.title}</CardTitle>
                  <CardDescription className="mt-1">
                    {assignment.description}
                  </CardDescription>
                </div>
                {getStatusBadge(assignment)}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {/* Assignment Info */}
                <div className="grid md:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>Due: {format(new Date(assignment.dueDate), "PPP")}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <FileText className="h-4 w-4" />
                    <span>Max Score: {assignment.maxScore}</span>
                  </div>
                  {user?.role === 'student' && assignment.submission?.grade && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Users className="h-4 w-4" />
                      <span>Your Score: {assignment.submission.grade.score}/{assignment.maxScore}</span>
                    </div>
                  )}
                </div>

                {/* Overdue Warning */}
                {isOverdue && user?.role === 'student' && !assignment.hasSubmitted && (
                  <div className="flex items-center gap-2 text-red-500 text-sm bg-red-50 dark:bg-red-950 p-2 rounded">
                    <AlertCircle className="h-4 w-4" />
                    <span>
                      {assignment.allowLateSubmission 
                        ? "This assignment is overdue but late submissions are allowed"
                        : "This assignment is overdue and no longer accepting submissions"
                      }
                    </span>
                  </div>
                )}

                {/* Grade Feedback */}
                {user?.role === 'student' && assignment.submission?.grade?.feedback && (
                  <div className="p-3 bg-muted rounded">
                    <p className="text-sm font-medium mb-1">Teacher Feedback:</p>
                    <p className="text-sm text-muted-foreground">
                      {assignment.submission.grade.feedback}
                    </p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => navigate(`/assignment/${assignment._id}`)}
                  >
                    View Details
                  </Button>
                  
                  {user?.role === 'student' && !assignment.hasSubmitted && (
                    <Button
                      className="flex-1"
                      onClick={() => navigate(`/assignment/${assignment._id}/submit`)}
                      disabled={isOverdue && !assignment.allowLateSubmission}
                    >
                      Submit Assignment
                    </Button>
                  )}
                  
                  {user?.role === 'student' && assignment.hasSubmitted && (
                    <Button
                      variant="secondary"
                      className="flex-1"
                      onClick={() => navigate(`/assignment/${assignment._id}/submission`)}
                    >
                      View Submission
                    </Button>
                  )}
                  
                  {user?.role === 'teacher' && (
                    <Button
                      className="flex-1"
                      onClick={() => navigate(`/teacher/assignment/${assignment._id}/submissions`)}
                    >
                      <Users className="h-4 w-4 mr-2" />
                      View Submissions
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default AssignmentList;