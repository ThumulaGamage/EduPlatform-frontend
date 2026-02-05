// src/pages/LessonViewer.tsx
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, ArrowRight, BookOpen, CheckCircle, Clock } from "lucide-react";
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
  lessons: Lesson[];
}

const LessonViewer = () => {
  const { courseId, lessonId } = useParams<{ courseId: string; lessonId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const [course, setCourse] = useState<Course | null>(null);
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCourseAndLesson();
  }, [courseId, lessonId]);

  const fetchCourseAndLesson = async () => {
    try {
      const response = await API.get(`/courses/${courseId}`);
      setCourse(response.data.course);
      
      const lesson = response.data.course.lessons?.find((l: Lesson) => l._id === lessonId);
      if (lesson) {
        setCurrentLesson(lesson);
      }
    } catch (error) {
      console.error("Error fetching lesson:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load lesson"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleNextLesson = () => {
    if (!course || !currentLesson) return;
    
    const currentIndex = course.lessons.findIndex(l => l._id === currentLesson._id);
    if (currentIndex < course.lessons.length - 1) {
      const nextLesson = course.lessons[currentIndex + 1];
      navigate(`/course/${courseId}/lesson/${nextLesson._id}`);
    }
  };

  const handlePreviousLesson = () => {
    if (!course || !currentLesson) return;
    
    const currentIndex = course.lessons.findIndex(l => l._id === currentLesson._id);
    if (currentIndex > 0) {
      const prevLesson = course.lessons[currentIndex - 1];
      navigate(`/course/${courseId}/lesson/${prevLesson._id}`);
    }
  };

  const markAsComplete = async () => {
    toast({
      title: "Lesson Completed!",
      description: "Great job! Moving to next lesson..."
    });
    // You can add API call here to track progress
    setTimeout(() => handleNextLesson(), 1000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        </div>
      </div>
    );
  }

  if (!currentLesson || !course) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-12">
          <Card>
            <CardContent className="py-12 text-center">
              <BookOpen className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h2 className="text-2xl font-bold mb-2">Lesson Not Found</h2>
              <Button onClick={() => navigate(`/course/${courseId}`)}>
                Back to Course
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const currentIndex = course.lessons.findIndex(l => l._id === currentLesson._id);
  const isFirstLesson = currentIndex === 0;
  const isLastLesson = currentIndex === course.lessons.length - 1;

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <Button 
          variant="ghost" 
          className="mb-6 gap-2"
          onClick={() => navigate(`/course/${courseId}`)}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Course
        </Button>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Lesson Header */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <Badge>Lesson {currentLesson.order}</Badge>
                  <div className="flex items-center gap-2 text-muted-foreground text-sm">
                    <Clock className="h-4 w-4" />
                    <span>{currentLesson.duration} min</span>
                  </div>
                </div>
                <CardTitle className="text-2xl">{currentLesson.title}</CardTitle>
              </CardHeader>
            </Card>

            {/* Lesson Content */}
            <Card>
              <CardContent className="pt-6">
                {/* Video Placeholder */}
                <div className="aspect-video bg-gradient-card rounded-lg flex items-center justify-center mb-6">
                  <div className="text-center">
                    <BookOpen className="h-16 w-16 mx-auto text-primary/20 mb-4" />
                    <p className="text-muted-foreground">
                      Video content would appear here
                    </p>
                    <p className="text-sm text-muted-foreground mt-2">
                      You can integrate video player or PDF viewer
                    </p>
                  </div>
                </div>

                {/* Lesson Description */}
                <div className="prose dark:prose-invert max-w-none">
                  <h3>About this lesson</h3>
                  <p>{currentLesson.description || "Learn the key concepts in this lesson."}</p>
                  
                  <h3>What you'll learn</h3>
                  <ul>
                    <li>Key concepts and fundamentals</li>
                    <li>Practical applications</li>
                    <li>Best practices and tips</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                onClick={handlePreviousLesson}
                disabled={isFirstLesson}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Previous Lesson
              </Button>

              {!isLastLesson ? (
                <Button onClick={markAsComplete}>
                  Mark Complete & Continue
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button onClick={markAsComplete}>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Complete Course
                </Button>
              )}
            </div>
          </div>

          {/* Sidebar - Lesson List */}
          <div className="lg:col-span-1">
            <Card className="sticky top-20">
              <CardHeader>
                <CardTitle className="text-lg">Course Content</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 max-h-[70vh] overflow-y-auto">
                {course.lessons.map((lesson, index) => (
                  <div
                    key={lesson._id}
                    className={`p-3 rounded-lg cursor-pointer transition ${
                      lesson._id === currentLesson._id
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-muted"
                    }`}
                    onClick={() => navigate(`/course/${courseId}/lesson/${lesson._id}`)}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-semibold">
                        {index + 1}
                      </span>
                      {index < currentIndex && (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      )}
                    </div>
                    <p className="text-sm font-medium line-clamp-2">{lesson.title}</p>
                    <p className="text-xs opacity-70 mt-1">{lesson.duration} min</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LessonViewer;