// src/components/PublicCoursesPreview.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookOpen, Clock, BarChart, LogIn } from "lucide-react";
import API from "@/api/axios";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

interface Course {
  _id: string;
  title: string;
  description: string;
  teacherId: {
    _id: string;
    name: string;
    gmail: string;
  };
  duration: string;
  level: string;
  category: string;
  totalLessons: number;
}

const PublicCoursesPreview = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      // Public endpoint - no authentication needed
      const response = await API.get("/courses");
      setCourses(response.data.courses);
    } catch (err) {
      console.error("Error fetching courses:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleEnrollClick = () => {
    if (!isAuthenticated) {
      toast({
        title: "Please Sign In",
        description: "You need to sign in to enroll in courses",
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

  const getLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case "beginner": return "bg-green-500/10 text-green-500";
      case "intermediate": return "bg-yellow-500/10 text-yellow-500";
      case "advanced": return "bg-red-500/10 text-red-500";
      default: return "bg-gray-500/10 text-gray-500";
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4 text-muted-foreground">Loading courses...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold">Browse All Courses</h2>
        <p className="text-muted-foreground">Explore our courses - Sign in to enroll</p>
      </div>

      {courses.length === 0 ? (
        <div className="text-center py-12">
          <BookOpen className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No courses available yet</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <Card key={course._id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between mb-2">
                  <Badge className={getLevelColor(course.level)}>
                    {course.level}
                  </Badge>
                  <Badge variant="outline">{course.category}</Badge>
                </div>
                <CardTitle className="text-lg">{course.title}</CardTitle>
                <CardDescription className="line-clamp-2">
                  {course.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>{course.duration}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <BarChart className="h-4 w-4" />
                    <span>{course.totalLessons} lessons</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <BookOpen className="h-4 w-4" />
                    <span>by {course.teacherId.name}</span>
                  </div>
                </div>

                <Button 
                  className="w-full gap-2"
                  onClick={handleEnrollClick}
                >
                  <LogIn className="h-4 w-4" />
                  Sign In to Enroll
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default PublicCoursesPreview;