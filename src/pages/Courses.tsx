// src/pages/Courses.tsx - UPDATED with search and filters
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import SearchBar, { SearchFilters } from "@/components/SearchBar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookOpen, Clock, BarChart, CheckCircle, Eye, Filter } from "lucide-react";
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

interface Enrollment {
  _id: string;
  courseId: {
    _id: string;
  };
  status: "pending" | "approved" | "rejected";
}

const Courses = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  const [allCourses, setAllCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [requestingEnrollment, setRequestingEnrollment] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const coursesRes = await API.get("/courses");
      const coursesData = coursesRes.data.courses;
      
      setAllCourses(coursesData);
      setFilteredCourses(coursesData);

      // Extract unique categories
      const uniqueCategories = Array.from(
        new Set(coursesData.map((course: Course) => course.category))
      ).sort();
      setCategories(uniqueCategories as string[]);

      // Fetch enrollments if user is logged in
      if (user) {
        try {
          const enrollmentsRes = await API.get("/enrollments/my-enrollments");
          setEnrollments(enrollmentsRes.data.enrollments);
        } catch (err) {
          console.log("Not logged in or no enrollments");
        }
      }
    } catch (err) {
      console.error("Error fetching data:", err);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load courses"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (filters: SearchFilters) => {
    let results = [...allCourses];

    // Filter by search query
    if (filters.query) {
      const query = filters.query.toLowerCase();
      results = results.filter(
        (course) =>
          course.title.toLowerCase().includes(query) ||
          course.description.toLowerCase().includes(query) ||
          course.teacherId.name.toLowerCase().includes(query)
      );
    }

    // Filter by level
    if (filters.level) {
      results = results.filter(
        (course) => course.level.toLowerCase() === filters.level.toLowerCase()
      );
    }

    // Filter by category
    if (filters.category) {
      results = results.filter((course) => course.category === filters.category);
    }

    setFilteredCourses(results);
  };

  const getEnrollmentStatus = (courseId: string) => {
    const enrollment = enrollments.find((e) => e.courseId._id === courseId);
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
      case "beginner":
        return "bg-green-500/10 text-green-500";
      case "intermediate":
        return "bg-yellow-500/10 text-yellow-500";
      case "advanced":
        return "bg-red-500/10 text-red-500";
      default:
        return "bg-gray-500/10 text-gray-500";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="container mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Browse Courses</h1>
          <p className="text-muted-foreground">
            Find the perfect course to advance your skills
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <SearchBar onSearch={handleSearch} categories={categories} />
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-sm text-muted-foreground">
            Showing {filteredCourses.length} of {allCourses.length} courses
          </p>
        </div>

        {/* Courses Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading courses...</p>
          </div>
        ) : filteredCourses.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <BookOpen className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No courses found</h3>
              <p className="text-muted-foreground mb-4">
                Try adjusting your search filters
              </p>
              <Button onClick={() => handleSearch({ query: "", level: "", category: "" })}>
                Clear Filters
              </Button>
            </CardContent>
          </Card>
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

                      {user?.role === "student" && (
                        enrollmentStatus === "approved" ? (
                          <Button
                            variant="secondary"
                            className="flex-1"
                            disabled
                            onClick={(e) => e.stopPropagation()}
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Enrolled
                          </Button>
                        ) : enrollmentStatus === "pending" ? (
                          <Button
                            variant="secondary"
                            className="flex-1"
                            disabled
                            onClick={(e) => e.stopPropagation()}
                          >
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
                        )
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Courses;