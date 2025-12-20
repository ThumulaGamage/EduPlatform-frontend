// src/pages/StudentCourseLessons.tsx
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  BookOpen, 
  Clock, 
  CheckCircle, 
  Circle,
  Award,
  ArrowLeft,
  PlayCircle,
  Lock
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import API from "@/api/axios";

interface Lesson {
  _id: string;
  title: string;
  description: string;
  duration: number;
  order: number;
}

interface Course {
  _id: string;
  title: string;
  description: string;
  teacherId: {
    _id: string;
    name: string;
  };
  lessons: Lesson[];
  totalLessons: number;
}

interface Enrollment {
  _id: string;
  progress: number;
  completedLessons: string[];
  status: string;
}

const StudentCourseLessons = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const [course, setCourse] = useState<Course | null>(null);
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchCourseAndProgress();
  }, [id]);

  const fetchCourseAndProgress = async () => {
    setLoading(true);
    try {
      // Fetch course details
      const courseRes = await API.get(`/courses/${id}`);
      setCourse(courseRes.data.course);

      // Fetch enrollment and progress
      const enrollmentRes = await API.get("/enrollments/my-enrollments");
      const myEnrollment = enrollmentRes.data.enrollments.find(
        (e: any) => e.courseId._id === id
      );

      if (myEnrollment) {
        setEnrollment(myEnrollment);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load course"
      });
    } finally {
      setLoading(false);
    }
  };

  const isLessonCompleted = (lessonId: string) => {
    return enrollment?.completedLessons?.includes(lessonId) || false;
  };

  const handleCompleteLesson = async (lessonId: string) => {
    if (!enrollment) return;

    setUpdating(true);
    try {
      await API.put(`/enrollments/${enrollment._id}/complete-lesson`, {
        lessonId
      });

      toast({
        title: "Lesson Completed!",
        description: "Great job! Keep going!"
      });

      // Refresh data
      await fetchCourseAndProgress();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.response?.data?.message || "Could not update progress"
      });
    } finally {
      setUpdating(false);
    }
  };

  const handleUncompleteLesson = async (lessonId: string) => {
    if (!enrollment) return;

    setUpdating(true);
    try {
      await API.put(`/enrollments/${enrollment._id}/uncomplete-lesson`, {
        lessonId
      });

      toast({
        title: "Lesson Unmarked",
        description: "Lesson marked as incomplete"
      });

      // Refresh data
      await fetchCourseAndProgress();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.response?.data?.message || "Could not update progress"
      });
    } finally {
      setUpdating(false);
    }
  };

  const calculateProgress = () => {
    if (!course?.lessons || course.lessons.length === 0) return 0;
    const completed = enrollment?.completedLessons?.length || 0;
    return Math.round((completed / course.lessons.length) * 100);
  };

  const getCompletedCount = () => {
    return enrollment?.completedLessons?.length || 0;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-12">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading course...</p>
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
              <p className="text-muted-foreground mb-4">This course doesn't exist or you're not enrolled.</p>
              <Button onClick={() => navigate("/student")}>
                Back to Dashboard
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!enrollment || enrollment.status !== "approved") {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-12">
          <Card>
            <CardContent className="py-12 text-center">
              <Lock className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h2 className="text-2xl font-bold mb-2">Not Enrolled</h2>
              <p className="text-muted-foreground mb-4">
                You need to be enrolled and approved to access course lessons.
              </p>
              <Button onClick={() => navigate(`/course/${id}`)}>
                View Course Details
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const progress = calculateProgress();
  const completedCount = getCompletedCount();

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Button 
          variant="ghost" 
          className="mb-6 gap-2"
          onClick={() => navigate("/student")}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Button>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content - Lessons */}
          <div className="lg:col-span-2 space-y-6">
            {/* Course Header */}
            <div>
              <h1 className="text-4xl font-bold mb-2">{course.title}</h1>
              <p className="text-lg text-muted-foreground mb-4">{course.description}</p>
              <p className="text-sm text-muted-foreground">
                Taught by <span className="font-medium">{course.teacherId.name}</span>
              </p>
            </div>

            <Separator />

            {/* Lessons List */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <BookOpen className="h-5 w-5" />
                      Course Lessons
                    </CardTitle>
                    <CardDescription>
                      {completedCount} of {course.lessons?.length || 0} lessons completed
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {!course.lessons || course.lessons.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>No lessons added yet</p>
                    <p className="text-sm">Check back later</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {course.lessons.map((lesson, index) => {
                      const isCompleted = isLessonCompleted(lesson._id);
                      
                      return (
                        <div 
                          key={lesson._id}
                          className={`flex items-center justify-between p-4 border rounded-lg transition-all ${
                            isCompleted 
                              ? "bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-900" 
                              : "hover:bg-muted/50"
                          }`}
                        >
                          <div className="flex items-center gap-4 flex-1">
                            {/* Lesson Number */}
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg flex-shrink-0 ${
                              isCompleted
                                ? "bg-green-500 text-white"
                                : "bg-primary/10 text-primary"
                            }`}>
                              {isCompleted ? (
                                <CheckCircle className="h-6 w-6" />
                              ) : (
                                <span>{lesson.order}</span>
                              )}
                            </div>

                            {/* Lesson Info */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className={`font-semibold text-lg ${
                                  isCompleted ? "line-through text-muted-foreground" : ""
                                }`}>
                                  {lesson.title}
                                </h3>
                                {isCompleted && (
                                  <Badge variant="secondary" className="bg-green-500 text-white">
                                    Completed
                                  </Badge>
                                )}
                              </div>
                              {lesson.description && (
                                <p className="text-sm text-muted-foreground mb-2">
                                  {lesson.description}
                                </p>
                              )}
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Clock className="h-4 w-4" />
                                <span>{lesson.duration} minutes</span>
                              </div>
                            </div>
                          </div>

                          {/* Action Button */}
                          <div className="flex-shrink-0 ml-4">
                            {isCompleted ? (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleUncompleteLesson(lesson._id)}
                                disabled={updating}
                              >
                                <Circle className="h-4 w-4 mr-2" />
                                Mark Incomplete
                              </Button>
                            ) : (
                              <Button
                                variant="default"
                                size="sm"
                                onClick={() => handleCompleteLesson(lesson._id)}
                                disabled={updating}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Mark Complete
                              </Button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Progress */}
          <div className="space-y-6">
            {/* Progress Card */}
            <Card className="sticky top-20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Your Progress
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Progress Circle/Bar */}
                <div className="text-center space-y-4">
                  <div className="relative inline-flex items-center justify-center">
                    <div className="w-32 h-32 rounded-full bg-primary/10 flex items-center justify-center">
                      <div className="text-center">
                        <p className="text-4xl font-bold text-primary">{progress}%</p>
                        <p className="text-xs text-muted-foreground">Complete</p>
                      </div>
                    </div>
                  </div>
                  
                  <Progress value={progress} className="h-3" />
                  
                  <div className="text-sm text-muted-foreground">
                    <p className="font-medium text-foreground text-lg">
                      {completedCount} / {course.lessons?.length || 0}
                    </p>
                    <p>Lessons Completed</p>
                  </div>
                </div>

                <Separator />

                {/* Stats */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Total Lessons</span>
                    <span className="font-medium">{course.lessons?.length || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Completed</span>
                    <span className="font-medium text-green-600">{completedCount}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Remaining</span>
                    <span className="font-medium text-orange-600">
                      {(course.lessons?.length || 0) - completedCount}
                    </span>
                  </div>
                </div>

                {/* Completion Message */}
                {progress === 100 && (
                  <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900 rounded-lg p-4 text-center">
                    <Award className="h-8 w-8 mx-auto text-green-600 mb-2" />
                    <p className="font-semibold text-green-700 dark:text-green-400">
                      Congratulations! 🎉
                    </p>
                    <p className="text-sm text-green-600 dark:text-green-500 mt-1">
                      You've completed all lessons!
                    </p>
                  </div>
                )}

                {progress > 0 && progress < 100 && (
                  <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-lg p-4 text-center">
                    <PlayCircle className="h-8 w-8 mx-auto text-blue-600 mb-2" />
                    <p className="font-semibold text-blue-700 dark:text-blue-400">
                      Keep Going! 💪
                    </p>
                    <p className="text-sm text-blue-600 dark:text-blue-500 mt-1">
                      You're making great progress!
                    </p>
                  </div>
                )}

                {progress === 0 && (
                  <div className="bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-900 rounded-lg p-4 text-center">
                    <PlayCircle className="h-8 w-8 mx-auto text-orange-600 mb-2" />
                    <p className="font-semibold text-orange-700 dark:text-orange-400">
                      Let's Get Started! 🚀
                    </p>
                    <p className="text-sm text-orange-600 dark:text-orange-500 mt-1">
                      Complete your first lesson
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentCourseLessons;