// src/components/CoursesPreview.tsx - WITH DEBUG LOGGING
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookOpen, Clock, BarChart, CheckCircle, Eye, X } from "lucide-react";
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
  };
  status: "pending" | "approved" | "rejected";
}

const CoursesPreview = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const teacherIdFilter = searchParams.get("teacher");
  const teacherNameFilter = searchParams.get("teacherName");

  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [requestingEnrollment, setRequestingEnrollment] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    // DEBUG: Log what we're filtering
    console.log("=== FILTER DEBUG ===");
    console.log("Teacher ID Filter:", teacherIdFilter);
    console.log("Teacher Name Filter:", teacherNameFilter);
    console.log("Total Courses:", courses.length);
    
    if (teacherIdFilter) {
      console.log("Filtering courses for teacher:", teacherIdFilter);
      
      const filtered = courses.filter(course => {
        const matches = course.teacherId._id === teacherIdFilter;
        console.log(`Course: ${course.title}, Teacher: ${course.teacherId._id}, Match: ${matches}`);
        return matches;
      });
      
      console.log("Filtered Courses Count:", filtered.length);
      setFilteredCourses(filtered);
    } else {
      console.log("No filter - showing all courses");
      setFilteredCourses(courses);
    }
    console.log("===================");
  }, [teacherIdFilter, courses]);

  const fetchData = async () => {
    try {
      const [coursesRes, enrollmentsRes] = await Promise.all([
        API.get("/courses"),
        API.get("/enrollments/my-enrollments")
      ]);
      
      console.log("Fetched courses:", coursesRes.data.courses);
      setCourses(coursesRes.data.courses);
      setEnrollments(enrollmentsRes.data.enrollments);
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  const clearTeacherFilter = () => {
    setSearchParams({});
  };

  const getEnrollmentStatus = (courseId: string) => {
    const enrollment = enrollments.find(e => e.courseId._id === courseId);
    return enrollment?.status;
  };

  const handleEnrollRequest = async (courseId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setRequestingEnrollment(courseId);
    try {
      await API.post("/enrollments/request", { courseId });
      toast({
        title: "Enrollment Requested!",
        description: "Your enrollment request has been sent to the teacher.",
      });
      fetchData();
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
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">
              {teacherNameFilter ? `Courses by ${teacherNameFilter}` : "Browse All Courses"}
            </h2>
            <p className="text-muted-foreground">
              {teacherNameFilter 
                ? `Showing ${filteredCourses.length} courses by this instructor`
                : "Explore and enroll in courses that interest you"
              }
            </p>
          </div>
          {teacherIdFilter && (
            <Button variant="outline" onClick={clearTeacherFilter}>
              <X className="h-4 w-4 mr-2" />
              Clear Filter
            </Button>
          )}
        </div>
      </div>

      {filteredCourses.length === 0 ? (
        <div className="text-center py-12">
          <BookOpen className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">
            {teacherNameFilter 
              ? `${teacherNameFilter} hasn't created any courses yet`
              : "No courses available yet"
            }
          </p>
          {teacherIdFilter && (
            <Button className="mt-4" onClick={clearTeacherFilter}>
              View All Courses
            </Button>
          )}
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => {
            const enrollmentStatus = getEnrollmentStatus(course._id);
            const isRequesting = requestingEnrollment === course._id;

            return (
              <Card 
                key={course._id} 
                className="hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => navigate(`/course/${course._id}`)}
              >
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

                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      className="flex-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/course/${course._id}`);
                      }}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                    
                    {enrollmentStatus === "approved" ? (
                      <Button variant="secondary" className="flex-1" disabled onClick={(e) => e.stopPropagation()}>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Enrolled
                      </Button>
                    ) : enrollmentStatus === "pending" ? (
                      <Button variant="secondary" className="flex-1" disabled onClick={(e) => e.stopPropagation()}>
                        Pending
                      </Button>
                    ) : (
                      <Button 
                        className="flex-1"
                        onClick={(e) => handleEnrollRequest(course._id, e)}
                        disabled={isRequesting}
                      >
                        {isRequesting ? "..." : "Enroll"}
                      </Button>
                    )}
                  </div>
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