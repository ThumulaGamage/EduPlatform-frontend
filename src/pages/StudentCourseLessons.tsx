// src/pages/StudentCourseLessons.tsx - WITH MATERIAL VIEWER
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BookOpen, 
  Clock, 
  CheckCircle, 
  Circle,
  Award,
  ArrowLeft,
  PlayCircle,
  Lock,
  ChevronRight,
  ChevronDown,
  Video,
  FileText,
  Download,
  Eye,
  Image as ImageIcon,
  File
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
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMaterials, setLoadingMaterials] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);

  useEffect(() => {
    fetchCourseAndProgress();
    fetchMaterials();
  }, [id]);

  const fetchCourseAndProgress = async () => {
    setLoading(true);
    try {
      const courseRes = await API.get(`/courses/${id}`);
      setCourse(courseRes.data.course);

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

  const fetchMaterials = async () => {
    setLoadingMaterials(true);
    try {
      const response = await API.get(`/materials/course/${id}`);
      setMaterials(response.data.materials || []);
    } catch (error) {
      console.error("Error fetching materials:", error);
    } finally {
      setLoadingMaterials(false);
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

  const handleLessonClick = (lesson: Lesson) => {
    setSelectedLesson(selectedLesson?._id === lesson._id ? null : lesson);
    setSelectedMaterial(null); // Reset material selection
  };

  const handleNextLesson = () => {
    if (!course?.lessons || !selectedLesson) return;
    const currentIndex = course.lessons.findIndex(l => l._id === selectedLesson._id);
    if (currentIndex < course.lessons.length - 1) {
      setSelectedLesson(course.lessons[currentIndex + 1]);
      setSelectedMaterial(null);
    }
  };

  const handlePreviousLesson = () => {
    if (!course?.lessons || !selectedLesson) return;
    const currentIndex = course.lessons.findIndex(l => l._id === selectedLesson._id);
    if (currentIndex > 0) {
      setSelectedLesson(course.lessons[currentIndex - 1]);
      setSelectedMaterial(null);
    }
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'pdf':
        return <FileText className="h-5 w-5 text-red-500" />;
      case 'video':
        return <Video className="h-5 w-5 text-blue-500" />;
      case 'image':
        return <ImageIcon className="h-5 w-5 text-green-500" />;
      case 'document':
        return <File className="h-5 w-5 text-orange-500" />;
      default:
        return <File className="h-5 w-5 text-gray-500" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const renderMaterialViewer = (material: Material) => {
    if (material.type === 'video') {
      return (
        <div className="aspect-video bg-black rounded-lg overflow-hidden">
          <video 
            controls 
            className="w-full h-full"
            src={material.url}
          >
            Your browser does not support video playback.
          </video>
        </div>
      );
    }

    if (material.type === 'pdf') {
      // Use Google Docs Viewer as it works better across browsers
      const googleDocsUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(material.url)}&embedded=true`;
      
      return (
        <div className="space-y-4">
          <div className="aspect-video bg-gray-100 dark:bg-gray-900 rounded-lg overflow-hidden">
            <iframe 
              src={googleDocsUrl}
              className="w-full h-full"
              title={material.title}
            />
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => window.open(material.url, '_blank')}
              className="flex-1"
            >
              <Eye className="h-4 w-4 mr-2" />
              Open in New Tab
            </Button>
            <Button 
              variant="outline"
              asChild
              className="flex-1"
            >
              <a href={material.url} download>
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </a>
            </Button>
          </div>
        </div>
      );
    }

    if (material.type === 'image') {
      return (
        <div className="rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-900 p-4">
          <img 
            src={material.url}
            alt={material.title}
            className="w-full h-auto rounded"
          />
        </div>
      );
    }

    // For other files, show download option
    return (
      <div className="aspect-video bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg flex items-center justify-center border-2 border-dashed border-primary/20">
        <div className="text-center p-8">
          {getFileIcon(material.type)}
          <p className="text-lg font-medium mt-4 mb-2">{material.filename}</p>
          <p className="text-sm text-muted-foreground mb-4">
            {formatFileSize(material.filesize)}
          </p>
          <Button asChild>
            <a href={material.url} target="_blank" rel="noopener noreferrer">
              <Download className="h-4 w-4 mr-2" />
              Download File
            </a>
          </Button>
        </div>
      </div>
    );
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
        <Button 
          variant="ghost" 
          className="mb-6 gap-2"
          onClick={() => navigate("/student")}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Button>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <h1 className="text-4xl font-bold mb-2">{course.title}</h1>
              <p className="text-lg text-muted-foreground mb-4">{course.description}</p>
              <p className="text-sm text-muted-foreground">
                Taught by <span className="font-medium">{course.teacherId.name}</span>
              </p>
            </div>

            <Separator />

            {/* Selected Lesson Viewer */}
            {selectedLesson && (
              <Card className="border-primary">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <Badge className="mb-2">Lesson {selectedLesson.order}</Badge>
                      <CardTitle className="text-2xl">{selectedLesson.title}</CardTitle>
                      <CardDescription className="flex items-center gap-2 mt-2">
                        <Clock className="h-4 w-4" />
                        {selectedLesson.duration} minutes
                      </CardDescription>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => setSelectedLesson(null)}>
                      ✕
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Tabbed Content: Materials & About */}
                  <Tabs defaultValue="materials" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="materials">
                        <Video className="h-4 w-4 mr-2" />
                        Materials
                      </TabsTrigger>
                      <TabsTrigger value="about">
                        <FileText className="h-4 w-4 mr-2" />
                        About
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="materials" className="mt-4">
                      {loadingMaterials ? (
                        <div className="text-center py-8">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                        </div>
                      ) : materials.length === 0 ? (
                        <div className="aspect-video bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg flex items-center justify-center border-2 border-dashed border-primary/20">
                          <div className="text-center p-8">
                            <FileText className="h-16 w-16 mx-auto text-primary/40 mb-4" />
                            <p className="text-lg font-medium mb-2">No Materials Yet</p>
                            <p className="text-sm text-muted-foreground">
                              Your teacher hasn't uploaded any materials for this course.
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {/* Material Viewer */}
                          {selectedMaterial && (
                            <div className="mb-6">
                              {renderMaterialViewer(selectedMaterial)}
                              <div className="mt-4 flex items-center justify-between">
                                <div>
                                  <h4 className="font-semibold">{selectedMaterial.title}</h4>
                                  <p className="text-sm text-muted-foreground">
                                    {formatFileSize(selectedMaterial.filesize)}
                                  </p>
                                </div>
                                <Button 
                                  variant="outline"
                                  onClick={() => setSelectedMaterial(null)}
                                >
                                  Close
                                </Button>
                              </div>
                            </div>
                          )}

                          {/* Materials List */}
                          <div className="space-y-2">
                            <h4 className="font-semibold mb-3">Available Materials</h4>
                            {materials.map((material) => (
                              <div
                                key={material._id}
                                className={`flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50 cursor-pointer transition ${
                                  selectedMaterial?._id === material._id ? 'bg-primary/5 border-primary' : ''
                                }`}
                                onClick={() => setSelectedMaterial(material)}
                              >
                                {getFileIcon(material.type)}
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium truncate">{material.title}</p>
                                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <Badge variant="outline" className="text-xs">
                                      {material.type.toUpperCase()}
                                    </Badge>
                                    <span>{formatFileSize(material.filesize)}</span>
                                  </div>
                                </div>
                                <Button size="sm" variant="ghost">
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </TabsContent>

                    <TabsContent value="about" className="mt-4">
                      <div className="prose dark:prose-invert max-w-none">
                        <h3>About this lesson</h3>
                        <p>{selectedLesson.description || "Learn the key concepts covered in this lesson."}</p>
                      </div>
                    </TabsContent>
                  </Tabs>

                  <Separator />

                  {/* Lesson Actions */}
                  <div className="flex items-center justify-between gap-4">
                    <Button
                      variant="outline"
                      onClick={handlePreviousLesson}
                      disabled={course.lessons.findIndex(l => l._id === selectedLesson._id) === 0}
                    >
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Previous
                    </Button>

                    {isLessonCompleted(selectedLesson._id) ? (
                      <Button
                        variant="outline"
                        onClick={() => handleUncompleteLesson(selectedLesson._id)}
                        disabled={updating}
                      >
                        <Circle className="h-4 w-4 mr-2" />
                        Mark Incomplete
                      </Button>
                    ) : (
                      <Button
                        onClick={() => handleCompleteLesson(selectedLesson._id)}
                        disabled={updating}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Mark Complete
                      </Button>
                    )}

                    <Button
                      variant="outline"
                      onClick={handleNextLesson}
                      disabled={course.lessons.findIndex(l => l._id === selectedLesson._id) === course.lessons.length - 1}
                    >
                      Next
                      <ChevronRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Lessons List */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Course Lessons
                </CardTitle>
                <CardDescription>
                  {completedCount} of {course.lessons?.length || 0} lessons completed
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!course.lessons || course.lessons.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>No lessons added yet</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {course.lessons.map((lesson) => {
                      const isCompleted = isLessonCompleted(lesson._id);
                      const isSelected = selectedLesson?._id === lesson._id;
                      
                      return (
                        <div 
                          key={lesson._id}
                          className={`flex items-center justify-between p-4 border rounded-lg transition-all cursor-pointer ${
                            isCompleted 
                              ? "bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-900" 
                              : isSelected
                              ? "bg-primary/5 border-primary"
                              : "hover:bg-muted/50"
                          }`}
                          onClick={() => handleLessonClick(lesson)}
                        >
                          <div className="flex items-center gap-4 flex-1">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold flex-shrink-0 ${
                              isCompleted
                                ? "bg-green-500 text-white"
                                : "bg-primary/10 text-primary"
                            }`}>
                              {isCompleted ? (
                                <CheckCircle className="h-5 w-5" />
                              ) : (
                                <span>{lesson.order}</span>
                              )}
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-semibold">{lesson.title}</h3>
                                {isCompleted && (
                                  <Badge variant="secondary" className="bg-green-500 text-white text-xs">
                                    ✓
                                  </Badge>
                                )}
                              </div>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Clock className="h-3 w-3" />
                                <span>{lesson.duration} min</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex-shrink-0 ml-4">
                            {isSelected ? (
                              <ChevronDown className="h-5 w-5 text-primary" />
                            ) : (
                              <ChevronRight className="h-5 w-5 text-muted-foreground" />
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

          {/* Sidebar - Progress (same as before) */}
          <div className="space-y-6">
            <Card className="sticky top-20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Your Progress
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
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
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Materials</span>
                    <span className="font-medium">{materials.length}</span>
                  </div>
                </div>

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
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentCourseLessons;