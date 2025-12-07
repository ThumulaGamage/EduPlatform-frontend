// src/pages/TeacherStudents.tsx - My Students View
import { useState, useEffect } from "react";
import Navigation from "@/components/Navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Mail } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import API from "@/api/axios";

interface Enrollment {
  _id: string;
  studentId: {
    _id: string;
    name: string;
    gmail: string;
    age: number;
    address: string;
  };
  courseId: {
    _id: string;
    title: string;
  };
  status: "pending" | "approved" | "rejected";
  progress: number;
}

const TeacherStudents = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [myStudents, setMyStudents] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const response = await API.get("/enrollments/my-students");
      setMyStudents(response.data.enrollments);
    } catch (error) {
      console.error("Error fetching students:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load students"
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-12">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading students...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">My Students</h1>
          <p className="text-muted-foreground text-lg">Students enrolled in your courses</p>
        </div>

        {myStudents.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Users className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No students enrolled yet</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {myStudents.map((enrollment) => (
              <Card key={enrollment._id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-full bg-gradient-hero flex items-center justify-center text-primary-foreground font-bold text-lg">
                        {enrollment.studentId.name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{enrollment.studentId.name}</h3>
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {enrollment.studentId.gmail}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col md:flex-row md:items-center gap-4">
                      <div className="text-sm">
                        <p className="text-muted-foreground">Course</p>
                        <p className="font-medium">{enrollment.courseId.title}</p>
                      </div>
                      <div className="text-sm">
                        <p className="text-muted-foreground">Progress</p>
                        <p className="font-medium">{enrollment.progress}%</p>
                      </div>
                      <div className="text-sm">
                        <p className="text-muted-foreground">Status</p>
                        <Badge variant="default">
                          {enrollment.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherStudents;