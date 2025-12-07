// src/components/PublicTeachersPreview.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookOpen, Mail, MapPin, Users, LogIn } from "lucide-react";
import API from "@/api/axios";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

interface Teacher {
  _id: string;
  name: string;
  gmail: string;
  age: number;
  address: string;
  courseCount: number;
}

const PublicTeachersPreview = () => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    try {
      // Public endpoint - no authentication needed
      const response = await API.get("/teachers");
      setTeachers(response.data.teachers);
    } catch (err) {
      console.error("Error fetching teachers:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewTeacherClick = () => {
    if (!isAuthenticated) {
      toast({
        title: "Please Sign In",
        description: "You need to sign in to view teacher details and courses",
        action: (
          <Button 
            size="sm" 
            onClick={() => navigate("/auth")}
            className="gap-2"
          >
            <LogIn className="h-4 w-4" />
            Sign In
          </Button>
        ),
      });
      // Navigate after a short delay so user can see the toast
      setTimeout(() => navigate("/auth"), 1500);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4 text-muted-foreground">Loading teachers...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold">Our Teachers</h2>
        <p className="text-muted-foreground">Learn from experienced educators - Sign in to view more</p>
      </div>

      {teachers.length === 0 ? (
        <div className="text-center py-12">
          <Users className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No teachers found</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teachers.map((teacher) => (
            <Card key={teacher._id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-hero flex items-center justify-center text-primary-foreground text-lg font-bold">
                      {teacher.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <CardTitle className="text-lg">{teacher.name}</CardTitle>
                      <Badge variant="secondary" className="mt-1">
                        {teacher.courseCount} {teacher.courseCount === 1 ? 'Course' : 'Courses'}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  <span className="truncate">{teacher.gmail}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span className="truncate">{teacher.address}</span>
                </div>
                <Button 
                  variant="outline" 
                  className="w-full mt-4 gap-2"
                  onClick={handleViewTeacherClick}
                >
                  <LogIn className="h-4 w-4" />
                  Sign In to View Courses
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default PublicTeachersPreview;