// src/pages/CourseDetails.tsx - UPDATED with accordion course content
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { 
  BookOpen, 
  Clock, 
  BarChart, 
  Users, 
  CheckCircle, 
  ArrowLeft,
  Award,
  Target,
  Mail,
  MapPin,
  MessageSquare,
  FileText,
  Video,
  Eye
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import API from "@/api/axios";
import ReviewSection from "@/components/ReviewSection";
import { formatDistanceToNow } from "date-fns";

interface Lesson {
  title: string;
  description: string;
  duration: number;
  order: number;
}

interface Material {
  _id: string;
  title: string;
  type: 'pdf' | 'video' | 'document' | 'image' | 'other';
  url: string;
  filename: string;
  filesize: number;
  uploadedAt: string;
}

interface Course {
  _id: string;
  title: string;
  description: string;
  teacherId: {
    _id: string;
    name: string;
    gmail: string;
    age: number;
    address: string;
  };
  duration: string;
  level: string;
  category: string;
  image?: string;
  totalLessons: number;
  learningObjectives?: string[];
  requirements?: string[];
  lessons?: Lesson[];
  createdAt: string;
}

interface Enrollment {
  _id: string;
  status: "pending" | "approved" | "rejected";
  progress: number;
  enrollmentDate: string;
}

interface RelatedCourse {
  _id: string;
  title: string;
  level: string;
  category: string;
  teacherId: {
    name: string;
  };
}

// Component to show materials for a specific lesson
const LessonMaterials = ({ courseId, lessonTitle }: { courseId: string; lessonTitle: string }) => {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMaterials();
  }, [courseId, lessonTitle]);

  const fetchMaterials = async () => {
    try {
      const response = await API.get(`/materials/course/${courseId}`);
      const allMaterials: Material[] = response.data.materials || [];
      
      // Filter materials that belong to this lesson
      const lessonMaterials = allMaterials.filter(m => 
        m.title.includes(lessonTitle) || m.title.startsWith(`${lessonTitle} -`)
      );
      
      setMaterials(lessonMaterials);
    } catch (error) {
      console.error("Error fetching materials:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'pdf':
      case 'document':
        return <FileText className="h-5 w-5 text-red-500" />;
      case 'video':
        return <Video className="h-5 w-5 text-blue-500" />;
      default:
        return <FileText className="h-5 w-5 text-gray-500" />;
    }
  };

  if (loading) {
    return <div className="text-sm text-muted-foreground italic">Loading materials...</div>;
  }

  if (materials.length === 0) {
    return <div className="text-sm text-muted-foreground italic">No materials for this lesson</div>;
  }

  return (
    <div>
      <h5 className="text-sm font-medium mb-2">Lesson Materials</h5>
      <div className="space-y-2">
        {materials.map((material) => (
          <div
            key={material._id}
            className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg"
          >
            {getFileIcon(material.type)}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {material.title}
              </p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                <Badge variant="outline" className="text-xs">
                  {material.type.toUpperCase()}
                </Badge>
                <span>{formatFileSize(material.filesize)}</span>
                <span>
                  {formatDistanceToNow(new Date(material.uploadedAt), {
                    addSuffix: true,
                  })}
                </span>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(material.url, '_blank')}
            >
              <Eye className="h-4 w-4 mr-1" />
              View
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};

const CourseDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { toast } = useToast();

  const [course, setCourse] = useState<Course | null>(null);
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [relatedCourses, setRelatedCourses] = useState<RelatedCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [studentCount, setStudentCount] = useState(0);

  useEffect(() => {
    fetchCourseDetails();
  }, [id]);

  const fetchCourseDetails = async () => {
    setLoading(true);
    try {
      const courseRes = await API.get(`/courses/${id}`);
      setCourse(courseRes.data.course);

      const allCoursesRes = await API.get("/courses");
      const related = allCoursesRes.data.courses
        .filter((c: Course) => c._id !== id && c.category === courseRes.data.course.category)
        .slice(0, 3);
      setRelatedCourses(related);

      if (isAuthenticated && user?.role === "student") {
        try {
          const enrollmentsRes = await API.get("/enrollments/my-enrollments");
          const myEnrollment = enrollmentsRes.data.enrollments.find(
            (e: any) => e.courseId._id === id
          );
          if (myEnrollment) {
            setEnrollment(myEnrollment);
          }
        } catch (err) {
          console.log("No enrollment found");
        }
      }

      // Get real student count for this course
      try {
        const enrollmentsRes = await API.get(`/enrollments/course/${id}`);
        // Count only approved enrollments
        const approvedCount = enrollmentsRes.data.enrollments?.filter(
          (e: any) => e.status === "approved"
        ).length || 0;
        setStudentCount(approvedCount);
      } catch (err) {
        console.log("Could not fetch student count");
        setStudentCount(0);
      }

    } catch (error) {
      console.error("Error fetching course details:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load course details"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEnrollRequest = async () => {
    if (!isAuthenticated) {
      toast({
        title: "Please Sign In",
        description: "You need to sign in to enroll in courses"
      });
      setTimeout(() => navigate("/auth"), 1500);
      return;
    }

    if (user?.role !== "student") {
      toast({
        variant: "destructive",
        title: "Not Allowed",
        description: "Only students can enroll in courses"
      });
      return;
    }

    setEnrolling(true);
    try {
      await API.post("/enrollments/request", { courseId: id });
      toast({
        title: "Enrollment Requested!",
        description: "Your enrollment request has been sent to the teacher."
      });
      fetchCourseDetails();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Request Failed",
        description: error.response?.data?.message || "Could not request enrollment"
      });
    } finally {
      setEnrolling(false);
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

  const getEnrollmentButton = () => {
    if (!isAuthenticated) {
      return (
        <Button size="lg" className="w-full" onClick={handleEnrollRequest}>
          Sign In to Enroll
        </Button>
      );
    }

    if (user?.role === "teacher") {
      return (
        <Button size="lg" className="w-full" disabled variant="outline">
          Teachers Cannot Enroll
        </Button>
      );
    }

    if (enrollment) {
      switch (enrollment.status) {
        case "approved":
          return (
            <div className="space-y-2">
              <Button size="lg" className="w-full" variant="outline" disabled>
                <CheckCircle className="h-5 w-5 mr-2" />
                Enrolled
              </Button>
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-2">Your Progress</p>
                <Progress value={enrollment.progress} className="h-2" />
                <p className="text-sm font-medium mt-1">{enrollment.progress}% Complete</p>
              </div>
            </div>
          );
        case "pending":
          return (
            <Button size="lg" className="w-full" variant="outline" disabled>
              <Clock className="h-5 w-5 mr-2" />
              Pending Approval
            </Button>
          );
        case "rejected":
          return (
            <Button 
              size="lg" 
              className="w-full" 
              onClick={handleEnrollRequest}
              disabled={enrolling}
            >
              Request Again
            </Button>
          );
      }
    }

    return (
      <Button 
        size="lg" 
        className="w-full bg-gradient-hero" 
        onClick={handleEnrollRequest}
        disabled={enrolling}
      >
        {enrolling ? "Requesting..." : "Request Enrollment"}
      </Button>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-12">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading course details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-12">
          <Card>
            <CardContent className="py-12 text-center">
              <BookOpen className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h2 className="text-2xl font-bold mb-2">Course Not Found</h2>
              <p className="text-muted-foreground mb-4">The course you're looking for doesn't exist.</p>
              <Button onClick={() => navigate("/courses")}>
                Browse Courses
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const totalDuration = course.lessons?.reduce((sum, lesson) => sum + lesson.duration, 0) || 0;

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
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
            {/* Course Header */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <Badge className={getLevelColor(course.level)}>
                  {course.level}
                </Badge>
                <Badge variant="outline">{course.category}</Badge>
              </div>
              <h1 className="text-4xl font-bold mb-4">{course.title}</h1>
              <p className="text-lg text-muted-foreground mb-6">{course.description}</p>

              <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>{course.duration}</span>
                </div>
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  <span>{course.totalLessons} lessons</span>
                </div>
                {totalDuration > 0 && (
                  <div className="flex items-center gap-2">
                    <BarChart className="h-4 w-4" />
                    <span>{Math.floor(totalDuration / 60)}h {totalDuration % 60}m total</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <span>{studentCount} students</span>
                </div>
              </div>
            </div>

            <Separator />

            {/* What You'll Learn */}
            {course.learningObjectives && course.learningObjectives.length > 0 ? (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    What You'll Learn
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4">
                    {course.learningObjectives.map((objective, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>{objective}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  <Target className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>Learning objectives not added yet</p>
                </CardContent>
              </Card>
            )}

            {/* Course Content with Accordion and Materials */}
            {course.lessons && course.lessons.length > 0 ? (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    Course Content
                  </CardTitle>
                  <CardDescription>
                    {course.lessons.length} lessons • {Math.floor(totalDuration / 60)}h {totalDuration % 60}m
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Accordion type="single" collapsible className="space-y-2">
                    {course.lessons.map((lesson, index) => (
                      <AccordionItem 
                        key={index} 
                        value={`lesson-${index}`}
                        className="border rounded-lg px-4"
                      >
                        <AccordionTrigger className="hover:no-underline">
                          <div className="flex items-start gap-4 flex-1 text-left">
                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center font-semibold text-primary text-sm">
                              {lesson.order}
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold text-base">{lesson.title}</h4>
                              {lesson.description && (
                                <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
                                  {lesson.description}
                                </p>
                              )}
                              <div className="flex items-center gap-3 mt-2">
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                  <Clock className="h-3 w-3" />
                                  {lesson.duration} min
                                </div>
                              </div>
                            </div>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="pl-12 pt-2 pb-4 space-y-4">
                            {lesson.description && (
                              <div>
                                <h5 className="text-sm font-medium mb-1">Description</h5>
                                <p className="text-sm text-muted-foreground">
                                  {lesson.description}
                                </p>
                              </div>
                            )}
                            <LessonMaterials courseId={id!} lessonTitle={lesson.title} />
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>Course lessons not added yet</p>
                </CardContent>
              </Card>
            )}

            {/* Requirements */}
            {course.requirements && course.requirements.length > 0 ? (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5" />
                    Requirements
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {course.requirements.map((req, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                        <span>{req}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  <Award className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>Course requirements not added yet</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Enrollment Card */}
            <Card>
              <CardContent className="pt-6 space-y-6">
                <div className="aspect-video bg-gradient-card rounded-lg flex items-center justify-center">
                  <BookOpen className="h-16 w-16 text-primary/20" />
                </div>

                {getEnrollmentButton()}

                <Separator />

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Level</span>
                    <Badge className={getLevelColor(course.level)}>
                      {course.level}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Duration</span>
                    <span className="font-medium">{course.duration}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Total Lessons</span>
                    <span className="font-medium">{course.totalLessons}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Students</span>
                    <span className="font-medium">{studentCount}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Category</span>
                    <span className="font-medium">{course.category}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Instructor Card */}
            <Card>
              <CardHeader>
                <CardTitle>Your Instructor</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-16 h-16 rounded-full bg-gradient-hero flex items-center justify-center text-primary-foreground text-2xl font-bold">
                    {course.teacherId.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg">{course.teacherId.name}</h4>
                    <p className="text-sm text-muted-foreground">Course Instructor</p>
                  </div>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    <span>{course.teacherId.gmail}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>{course.teacherId.address}</span>
                  </div>
                </div>
                {isAuthenticated && user?.role === "student" && enrollment?.status === "approved" && (
                  <Button 
                    className="w-full gap-2" 
                    onClick={() => navigate(`/messages/${course.teacherId._id}/${course._id}`)}
                  >
                    <MessageSquare className="h-4 w-4" />
                    Message Teacher
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Related Courses */}
        {relatedCourses.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-6">More Courses in {course.category}</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {relatedCourses.map((relatedCourse) => (
                <Card 
                  key={relatedCourse._id} 
                  className="hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => navigate(`/course/${relatedCourse._id}`)}
                >
                  <CardHeader>
                    <div className="flex items-center justify-between mb-2">
                      <Badge className={getLevelColor(relatedCourse.level)}>
                        {relatedCourse.level}
                      </Badge>
                      <Badge variant="outline">{relatedCourse.category}</Badge>
                    </div>
                    <CardTitle className="text-lg line-clamp-2">{relatedCourse.title}</CardTitle>
                    <CardDescription>by {relatedCourse.teacherId.name}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button variant="outline" className="w-full">
                      View Course
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Reviews Section */}
        <div className="mt-12">
          <ReviewSection 
            courseId={id!} 
            canReview={enrollment?.status === "approved"} 
          />
        </div>
      </div>
    </div>
  );
};

export default CourseDetails;