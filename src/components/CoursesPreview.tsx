// src/components/CoursesPreview.tsx - FIXED VERSION
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookOpen, Clock, BarChart, CheckCircle } from "lucide-react";
import API from "@/api/axios";
import { useToast } from "@/hooks/use-toast";

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

interface Enrollment {
  _id: string;
  courseId: {
    _id: string;
    title: string;
  };
  status: "pending" | "approved" | "rejected";
}

const CoursesPreview = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [requestingEnrollment, setRequestingEnrollment] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [coursesRes, enrollmentsRes] = await Promise.all([
        API.get("/courses"),
        API.get("/enrollments/my-enrollments")
      ]);
      setCourses(coursesRes.data.courses);
      setEnrollments(enrollmentsRes.data.enrollments);
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  // FIXED: Compare with courseId._id since courseId is populated
  const getEnrollmentStatus = (courseId: string) => {
    const enrollment = enrollments.find(e => e.courseId._id === courseId);
    return enrollment?.status;
  };

  const handleEnrollRequest = async (courseId: string) => {
    setRequestingEnrollment(courseId);
    try {
      await API.post("/enrollments/request", { courseId });
      toast({
        title: "Enrollment Requested!",
        description: "Your enrollment request has been sent to the teacher.",
      });
      fetchData(); // Refresh data
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Request Failed",
        description: error.response?.data?.message || "Could not request enrollment",
      });
    } finally {
      setRequestingEnrollment(null);
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
        <p className="text-muted-foreground">Explore and enroll in courses that interest you</p>
      </div>

      {courses.length === 0 ? (
        <div className="text-center py-12">
          <BookOpen className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No courses available yet</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => {
            const enrollmentStatus = getEnrollmentStatus(course._id);
            const isRequesting = requestingEnrollment === course._id;

            return (
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

                  {enrollmentStatus === "approved" ? (
                    <Button variant="outline" className="w-full" disabled>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Enrolled
                    </Button>
                  ) : enrollmentStatus === "pending" ? (
                    <Button variant="outline" className="w-full" disabled>
                      Pending Approval
                    </Button>
                  ) : enrollmentStatus === "rejected" ? (
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => handleEnrollRequest(course._id)}
                      disabled={isRequesting}
                    >
                      Request Again
                    </Button>
                  ) : (
                    <Button 
                      className="w-full"
                      onClick={() => handleEnrollRequest(course._id)}
                      disabled={isRequesting}
                    >
                      {isRequesting ? "Requesting..." : "Request Enrollment"}
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CoursesPreview;