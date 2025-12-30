// src/pages/TeacherProfile.tsx - Public teacher profile page
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  ArrowLeft, 
  Mail, 
  MapPin, 
  BookOpen, 
  Users, 
  Award,
  Calendar,
  GraduationCap
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import API from "@/api/axios";
import { formatDistanceToNow } from "date-fns";

interface Teacher {
  _id: string;
  name: string;
  gmail: string;
  age: number;
  address: string;
  createdAt: string;
}

interface Course {
  _id: string;
  title: string;
  description: string;
  level: string;
  category: string;
  duration: string;
  totalLessons: number;
}

const TeacherProfilePage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [studentCount, setStudentCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTeacherProfile();
  }, [id]);

  const fetchTeacherProfile = async () => {
    setLoading(true);
    try {
      // Fetch teacher details
      const teacherRes = await API.get(`/users/${id}`);
      setTeacher(teacherRes.data.user);

      // Fetch teacher's courses
      const coursesRes = await API.get(`/courses`);
      const teacherCourses = coursesRes.data.courses.filter(
        (course: any) => course.teacherId._id === id
      );
      setCourses(teacherCourses);

      // Count total students across all courses
      let totalStudents = 0;
      for (const course of teacherCourses) {
        try {
          const enrollmentsRes = await API.get(`/enrollments/course/${course._id}`);
          const approvedCount = enrollmentsRes.data.enrollments.filter(
            (e: any) => e.status === 'approved'
          ).length;
          totalStudents += approvedCount;
        } catch (err) {
          console.log("Could not fetch enrollments for course:", course._id);
        }
      }
      setStudentCount(totalStudents);

    } catch (error) {
      console.error("Error fetching teacher profile:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load teacher profile"
      });
    } finally {
      setLoading(false);
    }
  };

  const getLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case "beginner": return "bg-green-500 text-white";
      case "intermediate": return "bg-yellow-500 text-white";
      case "advanced": return "bg-red-500 text-white";
      default: return "bg-gray-500 text-white";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-12">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading teacher profile...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!teacher) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-12">
          <Card>
            <CardContent className="py-12 text-center">
              <Users className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h2 className="text-2xl font-bold mb-2">Teacher Not Found</h2>
              <p className="text-muted-foreground mb-4">The teacher you're looking for doesn't exist.</p>
              <Button onClick={() => navigate("/teachers")}>
                Browse Teachers
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Button 
          variant="ghost" 
          className="mb-6 gap-2"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Teacher Header */}
            <Card>
              <CardHeader>
                <div className="flex items-start gap-6">
                  <div className="w-24 h-24 rounded-full bg-gradient-hero flex items-center justify-center text-primary-foreground text-4xl font-bold">
                    {teacher.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-3xl mb-2">{teacher.name}</CardTitle>
                    <p className="text-muted-foreground mb-4">Course Instructor</p>
                    
                    <div className="flex flex-wrap gap-4">
                      <div className="flex items-center gap-2 text-sm">
                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                        <span>{courses.length} courses</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span>{studentCount} students</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>Joined {formatDistanceToNow(new Date(teacher.createdAt), { addSuffix: true })}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* Courses Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="h-5 w-5" />
                  Courses by {teacher.name}
                </CardTitle>
                <CardDescription>
                  {courses.length} {courses.length === 1 ? 'course' : 'courses'} available
                </CardDescription>
              </CardHeader>
              <CardContent>
                {courses.length === 0 ? (
                  <div className="text-center py-12">
                    <BookOpen className="h-16 w-16 mx-auto text-muted-foreground mb-3 opacity-50" />
                    <p className="text-muted-foreground">
                      {teacher.name} hasn't created any courses yet
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {courses.map((course) => (
                      <Card 
                        key={course._id}
                        className="hover:shadow-md transition-shadow cursor-pointer"
                        onClick={() => navigate(`/course/${course._id}`)}
                      >
                        <CardHeader>
                          <div className="flex items-center justify-between mb-2">
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
                        <CardContent>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                            <div className="flex items-center gap-1">
                              <BookOpen className="h-4 w-4" />
                              <span>{course.totalLessons} lessons</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Award className="h-4 w-4" />
                              <span>{course.duration}</span>
                            </div>
                          </div>
                          <Button 
                            variant="outline" 
                            className="w-full"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/course/${course._id}`);
                            }}
                          >
                            View Course Details
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Info Card */}
            <Card className="sticky top-20">
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <Mail className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-muted-foreground">Email</p>
                      <p className="font-medium break-all">{teacher.gmail}</p>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <MapPin className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-muted-foreground">Location</p>
                      <p className="font-medium">{teacher.address}</p>
                    </div>
                  </div>
                </div>

                <Separator />

                <Button 
                  className="w-full"
                  onClick={() => navigate(`/courses?teacher=${teacher._id}&teacherName=${encodeURIComponent(teacher.name)}`)}
                >
                  <BookOpen className="h-4 w-4 mr-2" />
                  View All Courses
                </Button>
              </CardContent>
            </Card>

            {/* Stats Card */}
            <Card>
              <CardHeader>
                <CardTitle>Teaching Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Total Courses</span>
                  <span className="text-2xl font-bold">{courses.length}</span>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Total Students</span>
                  <span className="text-2xl font-bold">{studentCount}</span>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Member Since</span>
                  <span className="text-sm font-medium">
                    {new Date(teacher.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherProfilePage;