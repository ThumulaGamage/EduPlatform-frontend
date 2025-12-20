// src/components/StudentEnrolledCourses.tsx - UPDATE THIS COMPONENT
// Add "View Lessons" button to course cards

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { BookOpen, Clock, BarChart, Award, PlayCircle } from "lucide-react";
import API from "@/api/axios";
import { useToast } from "@/hooks/use-toast";

interface Enrollment {
  _id: string;
  courseId: {
    _id: string;
    title: string;
    description: string;
    duration: string;
    level: string;
    category: string;
    totalLessons: number;
    teacherId: {
      name: string;
    };
  };
  progress: number;
  status: string;
  enrollmentDate: string;
}

const StudentEnrolledCourses = () => {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchEnrollments();
  }, []);

  const fetchEnrollments = async () => {
    try {
      const response = await API.get("/enrollments/my-enrollments");
      const approved = response.data.enrollments.filter(
        (e: Enrollment) => e.status === "approved"
      );
      setEnrollments(approved);
    } catch (error) {
      console.error("Error fetching enrollments:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load enrolled courses"
      });
    } finally {
      setLoading(false);
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

  const getProgressColor = (progress: number) => {
    if (progress === 100) return "text-green-600";
    if (progress >= 50) return "text-blue-600";
    return "text-orange-600";
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4 text-muted-foreground">Loading your courses...</p>
      </div>
    );
  }

  if (enrollments.length === 0) {
    return (
      <div className="text-center py-12">
        <BookOpen className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-xl font-semibold mb-2">No Enrolled Courses</h3>
        <p className="text-muted-foreground mb-4">
          You haven't enrolled in any courses yet
        </p>
        <Button onClick={() => navigate("/courses")}>
          Browse Courses
        </Button>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold">My Enrolled Courses</h2>
        <p className="text-muted-foreground">
          Continue your learning journey
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {enrollments.map((enrollment) => {
          const course = enrollment.courseId;
          
          return (
            <Card 
              key={enrollment._id}
              className="hover:shadow-lg transition-shadow"
            >
              <CardHeader>
                <div className="flex items-start justify-between mb-2">
                  <Badge className={getLevelColor(course.level)}>
                    {course.level}
                  </Badge>
                  <Badge variant="outline">{course.category}</Badge>
                </div>
                <CardTitle className="text-lg line-clamp-2">
                  {course.title}
                </CardTitle>
                <CardDescription className="line-clamp-2">
                  {course.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Course Stats */}
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

                {/* Progress */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Progress</span>
                    <span className={`text-sm font-bold ${getProgressColor(enrollment.progress)}`}>
                      {enrollment.progress}%
                    </span>
                  </div>
                  <Progress value={enrollment.progress} className="h-2" />
                  {enrollment.progress === 100 && (
                    <div className="flex items-center gap-1 text-green-600 text-sm">
                      <Award className="h-4 w-4" />
                      <span className="font-medium">Completed!</span>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-2">
                  <Button
                    className="flex-1"
                    onClick={() => navigate(`/student/course/${course._id}/lessons`)}
                  >
                    <PlayCircle className="h-4 w-4 mr-2" />
                    {enrollment.progress === 0 ? "Start Learning" : "Continue"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => navigate(`/course/${course._id}`)}
                  >
                    Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default StudentEnrolledCourses;