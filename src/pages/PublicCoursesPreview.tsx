// src/components/PublicCoursesPreview.tsx - UPDATED with search
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import SearchBar, { SearchFilters } from "@/components/SearchBar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookOpen, Clock, BarChart } from "lucide-react";
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

const PublicCoursesPreview = () => {
  const [allCourses, setAllCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await API.get("/courses");
      const coursesData = response.data.courses;
      
      setAllCourses(coursesData);
      setFilteredCourses(coursesData);

      // Extract unique categories
      const uniqueCategories = Array.from(
        new Set(coursesData.map((course: Course) => course.category))
      ).sort();
      setCategories(uniqueCategories as string[]);
    } catch (err) {
      console.error("Error fetching courses:", err);
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

  const handleSignInToEnroll = () => {
    toast({
      title: "Please Sign In",
      description: "You need to sign in to enroll in courses",
      action: (
        <Button size="sm" onClick={() => navigate("/auth")}>
          Sign In
        </Button>
      ),
    });
    setTimeout(() => navigate("/auth"), 1500);
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
        <h2 className="text-2xl font-bold mb-2">Explore Courses</h2>
        <p className="text-muted-foreground">
          Find the perfect course to start your learning journey
        </p>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <SearchBar onSearch={handleSearch} categories={categories} />
      </div>

      {/* Results Count */}
      <div className="mb-6">
        <p className="text-sm text-muted-foreground">
          Showing {filteredCourses.length} of {allCourses.length} courses
        </p>
      </div>

      {filteredCourses.length === 0 ? (
        <div className="text-center py-12">
          <BookOpen className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground mb-4">No courses found</p>
          <Button onClick={() => handleSearch({ query: "", level: "", category: "" })}>
            Clear Filters
          </Button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
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

                <Button
                  className="w-full"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSignInToEnroll();
                  }}
                >
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