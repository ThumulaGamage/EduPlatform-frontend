// src/pages/TeacherCourses.tsx - COMPLETE with CREATE COURSE BUTTON + students, messaging, reviews
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { BookOpen, Plus, Trash2, FileText, Video, ArrowLeft, Edit, Save, Upload, Clock, Eye, CheckCircle, Users, Star, BarChart, MessageSquare, Send, Mail } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import API from "@/api/axios";
import { formatDistanceToNow } from "date-fns";

const CATEGORIES = [
  "Programming",
  "Web Development",
  "Mobile Development",
  "Data Science",
  "Machine Learning",
  "Artificial Intelligence",
  "Cloud Computing",
  "DevOps",
  "Cybersecurity",
  "Database",
  "UI/UX Design",
  "Graphic Design",
  "Game Development",
  "Business",
  "Marketing",
  "Project Management",
  "Language Learning",
  "Music",
  "Photography",
  "Other"
];

interface Course {
  _id: string;
  title: string;
  description: string;
  category: string;
  level: string;
  duration: string;
  totalLessons: number;
  learningObjectives?: string[];
  requirements?: string[];
}

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

interface LessonWithMaterials extends Lesson {
  materials: Material[];
}

interface Student {
  _id: string;
  studentId: {
    _id: string;
    name: string;
    gmail: string;
  };
  status: string;
  progress: number;
  enrollmentDate: string;
}

interface Review {
  _id: string;
  studentId: {
    _id: string;
    name: string;
  };
  rating: number;
  review: string;
  createdAt: string;
}

interface CourseFormData {
  title: string;
  description: string;
  duration: string;
  level: string;
  category: string;
  totalLessons: number;
}

const TeacherCourses = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [lessonsWithMaterials, setLessonsWithMaterials] = useState<LessonWithMaterials[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [studentCount, setStudentCount] = useState(0);
  const [averageRating, setAverageRating] = useState(0);
  const [totalDuration, setTotalDuration] = useState(0);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  // Create Course Dialog - NEW
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [createFormData, setCreateFormData] = useState<CourseFormData>({
    title: "",
    description: "",
    duration: "",
    level: "beginner",
    category: "",
    totalLessons: 0
  });

  // Edit Course Dialog
  const [isEditCourseOpen, setIsEditCourseOpen] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editDuration, setEditDuration] = useState("");
  const [editLevel, setEditLevel] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editObjectives, setEditObjectives] = useState<string[]>([]);
  const [editRequirements, setEditRequirements] = useState<string[]>([]);
  const [editObjectiveInput, setEditObjectiveInput] = useState("");
  const [editRequirementInput, setEditRequirementInput] = useState("");

  // Add Lesson Dialog
  const [isAddLessonOpen, setIsAddLessonOpen] = useState(false);
  const [lessonTitle, setLessonTitle] = useState("");
  const [lessonDescription, setLessonDescription] = useState("");
  const [lessonDuration, setLessonDuration] = useState("");
  const [lessonPDF, setLessonPDF] = useState<File | null>(null);
  const [lessonVideo, setLessonVideo] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  // Message Dialogs
  const [isMessageStudentOpen, setIsMessageStudentOpen] = useState(false);
  const [isBroadcastOpen, setIsBroadcastOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [messageContent, setMessageContent] = useState("");
  const [broadcastMessage, setBroadcastMessage] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const response = await API.get("/courses/teacher");
      setCourses(response.data.courses);
    } catch (error) {
      console.error("Error fetching courses:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load courses"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchCourseContent = async (courseId: string) => {
    try {
      // Fetch course details
      const courseRes = await API.get(`/courses/${courseId}`);
      const lessons: Lesson[] = courseRes.data.course.lessons || [];
      
      // Calculate total duration
      const total = lessons.reduce((sum, lesson) => sum + lesson.duration, 0);
      setTotalDuration(total);

      // Fetch materials
      const materialsRes = await API.get(`/materials/course/${courseId}`);
      const allMaterials: Material[] = materialsRes.data.materials || [];

      const lessonsWithMats: LessonWithMaterials[] = lessons.map(lesson => {
        const lessonMaterials = allMaterials.filter(material => 
          material.title.includes(lesson.title) || 
          material.title.startsWith(`${lesson.title} -`)
        );
        
        return {
          ...lesson,
          materials: lessonMaterials
        };
      });

      setLessonsWithMaterials(lessonsWithMats);

      // Fetch enrolled students
      const enrollmentsRes = await API.get(`/enrollments/course/${courseId}`);
      const approvedStudents = enrollmentsRes.data.enrollments.filter(
        (e: any) => e.status === 'approved'
      );
      setStudents(approvedStudents);
      setStudentCount(approvedStudents.length);

      // Fetch reviews
      const reviewsRes = await API.get(`/reviews/course/${courseId}`);
      setReviews(reviewsRes.data.reviews || []);
      
      // Calculate average rating
      if (reviewsRes.data.reviews && reviewsRes.data.reviews.length > 0) {
        const avg = reviewsRes.data.reviews.reduce((sum: number, r: Review) => sum + r.rating, 0) / reviewsRes.data.reviews.length;
        setAverageRating(avg);
      } else {
        setAverageRating(0);
      }

    } catch (error) {
      console.error("Error fetching course content:", error);
    }
  };

  const handleSelectCourse = async (course: Course) => {
    setSelectedCourse(course);
    setActiveTab("overview");
    await fetchCourseContent(course._id);
  };

  const handleBackToCourses = () => {
    setSelectedCourse(null);
    setLessonsWithMaterials([]);
    setStudents([]);
    setReviews([]);
  };

  // CREATE COURSE HANDLER - NEW
  const resetCreateForm = () => {
    setCreateFormData({
      title: "",
      description: "",
      duration: "",
      level: "beginner",
      category: "",
      totalLessons: 0
    });
  };

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);

    try {
      await API.post("/courses", {
        ...createFormData,
        teacherId: user?.id
      });

      toast({
        title: "Success!",
        description: "Course created successfully"
      });

      setIsCreateDialogOpen(false);
      resetCreateForm();
      fetchCourses();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.response?.data?.message || "Failed to create course"
      });
    } finally {
      setUploading(false);
    }
  };

  const openEditCourseDialog = () => {
    if (!selectedCourse) return;
    
    setEditTitle(selectedCourse.title);
    setEditDescription(selectedCourse.description);
    setEditDuration(selectedCourse.duration);
    setEditLevel(selectedCourse.level);
    setEditCategory(selectedCourse.category);
    setEditObjectives(selectedCourse.learningObjectives || []);
    setEditRequirements(selectedCourse.requirements || []);
    setIsEditCourseOpen(true);
  };

  const handleUpdateCourse = async () => {
    if (!selectedCourse) return;

    setUploading(true);
    try {
      const courseRes = await API.get(`/courses/${selectedCourse._id}`);
      const course = courseRes.data.course;

      await API.put(`/courses/${selectedCourse._id}`, {
        title: editTitle,
        description: editDescription,
        duration: editDuration,
        level: editLevel,
        category: editCategory,
        image: course.image || '',
        totalLessons: course.totalLessons,
        learningObjectives: editObjectives,
        requirements: editRequirements,
        lessons: course.lessons || []
      });

      toast({
        title: "Success!",
        description: "Course updated successfully"
      });

      setIsEditCourseOpen(false);
      
      const updatedCourse = {
        ...selectedCourse,
        title: editTitle,
        description: editDescription,
        duration: editDuration,
        level: editLevel,
        category: editCategory,
        learningObjectives: editObjectives,
        requirements: editRequirements
      };
      setSelectedCourse(updatedCourse);
      
      fetchCourses();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.response?.data?.message || "Failed to update course"
      });
    } finally {
      setUploading(false);
    }
  };

  const handleAddLesson = async () => {
    if (!selectedCourse) return;

    if (!lessonTitle.trim() || !lessonDescription.trim()) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please provide lesson title and description"
      });
      return;
    }

    setUploading(true);

    try {
      const courseRes = await API.get(`/courses/${selectedCourse._id}`);
      const course = courseRes.data.course;
      const currentLessons = course.lessons || [];

      const newLesson = {
        title: lessonTitle,
        description: lessonDescription,
        duration: parseInt(lessonDuration) || 0,
        order: currentLessons.length + 1
      };

      const updatedLessons = [...currentLessons, newLesson];

      await API.put(`/courses/${selectedCourse._id}`, {
        title: course.title,
        description: course.description,
        duration: course.duration,
        level: course.level,
        category: course.category,
        image: course.image || '',
        totalLessons: updatedLessons.length,
        learningObjectives: course.learningObjectives || [],
        requirements: course.requirements || [],
        lessons: updatedLessons
      });

      if (lessonPDF) {
        try {
          const formData = new FormData();
          formData.append('file', lessonPDF);
          formData.append('title', `${lessonTitle} - Document`);
          
          await API.post(`/materials/upload/${selectedCourse._id}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
          });
        } catch (error: any) {
          console.error("PDF upload error:", error.response?.data);
        }
      }

      if (lessonVideo) {
        try {
          const formData = new FormData();
          formData.append('file', lessonVideo);
          formData.append('title', `${lessonTitle} - Video`);
          
          await API.post(`/materials/upload/${selectedCourse._id}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
          });
        } catch (error: any) {
          console.error("Video upload error:", error.response?.data);
        }
      }

      toast({
        title: "Success!",
        description: "Lesson added successfully"
      });

      setIsAddLessonOpen(false);
      setLessonTitle("");
      setLessonDescription("");
      setLessonDuration("");
      setLessonPDF(null);
      setLessonVideo(null);

      fetchCourseContent(selectedCourse._id);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.response?.data?.message || "Failed to add lesson"
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteLesson = async (lessonId: string) => {
    if (!selectedCourse) return;
    if (!confirm("Delete this lesson and all its materials?")) return;

    try {
      const courseRes = await API.get(`/courses/${selectedCourse._id}`);
      const course = courseRes.data.course;
      const currentLessons = course.lessons || [];
      const lessonToDelete = currentLessons.find((l: Lesson) => l._id === lessonId);
      
      const updatedLessons = currentLessons.filter((l: Lesson) => l._id !== lessonId);
      
      await API.put(`/courses/${selectedCourse._id}`, {
        title: course.title,
        description: course.description,
        duration: course.duration,
        level: course.level,
        category: course.category,
        image: course.image || '',
        totalLessons: updatedLessons.length,
        learningObjectives: course.learningObjectives || [],
        requirements: course.requirements || [],
        lessons: updatedLessons
      });

      if (lessonToDelete) {
        const materialsRes = await API.get(`/materials/course/${selectedCourse._id}`);
        const allMaterials: Material[] = materialsRes.data.materials || [];
        const lessonMaterials = allMaterials.filter(m => 
          m.title.includes(lessonToDelete.title) || 
          m.title.startsWith(`${lessonToDelete.title} -`)
        );

        for (const material of lessonMaterials) {
          await API.delete(`/materials/${selectedCourse._id}/${material._id}`);
        }
      }

      toast({
        title: "Deleted",
        description: "Lesson and materials deleted successfully"
      });

      fetchCourseContent(selectedCourse._id);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete lesson"
      });
    }
  };

  const handleDeleteMaterial = async (materialId: string) => {
    if (!selectedCourse) return;
    if (!confirm("Delete this material?")) return;

    try {
      await API.delete(`/materials/${selectedCourse._id}/${materialId}`);
      toast({
        title: "Deleted",
        description: "Material deleted successfully"
      });
      fetchCourseContent(selectedCourse._id);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete material"
      });
    }
  };

  const handleSendMessage = async () => {
    if (!selectedStudent || !messageContent.trim()) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please enter a message"
      });
      return;
    }

    setSending(true);
    try {
      await API.post("/messages/send", {
        receiverId: selectedStudent.studentId._id,
        courseId: selectedCourse?._id,
        message: messageContent
      });

      toast({
        title: "Message Sent!",
        description: `Message sent to ${selectedStudent.studentId.name}`
      });

      setIsMessageStudentOpen(false);
      setMessageContent("");
      setSelectedStudent(null);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Failed to Send",
        description: error.response?.data?.message || "Could not send message"
      });
    } finally {
      setSending(false);
    }
  };

  const handleBroadcast = async () => {
    if (!broadcastMessage.trim() || !selectedCourse) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please enter a message"
      });
      return;
    }

    setSending(true);
    try {
      // Send individual message to each student
      const sendPromises = students.map(student =>
        API.post("/messages/send", {
          receiverId: student.studentId._id,
          courseId: selectedCourse._id,
          message: broadcastMessage
        })
      );

      await Promise.all(sendPromises);

      toast({
        title: "Broadcast Sent!",
        description: `Message sent to ${studentCount} students`
      });

      setIsBroadcastOpen(false);
      setBroadcastMessage("");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Failed to Broadcast",
        description: error.response?.data?.message || "Could not send broadcast"
      });
    } finally {
      setSending(false);
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

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating
                ? "fill-yellow-400 text-yellow-400"
                : "text-gray-300"
            }`}
          />
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading courses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="container mx-auto px-4 py-12">
        {/* Course List View */}
        {!selectedCourse ? (
          <>
            {/* HEADER WITH CREATE BUTTON - MODIFIED */}
            <div className="mb-8 flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold mb-2">My Courses</h1>
                <p className="text-muted-foreground">
                  Click on a course to view and manage content
                </p>
              </div>

              {/* CREATE COURSE BUTTON - NEW */}
              <Button onClick={() => {
                resetCreateForm();
                setIsCreateDialogOpen(true);
              }} className="gap-2" size="lg">
                <Plus className="h-5 w-5" />
                Create Course
              </Button>
            </div>

            {courses.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <BookOpen className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No courses yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Create your first course to get started
                  </p>
                  <Button onClick={() => setIsCreateDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Course
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.map((course) => (
                  <Card 
                    key={course._id} 
                    className="hover:shadow-lg transition-all cursor-pointer hover:scale-105"
                    onClick={() => handleSelectCourse(course)}
                  >
                    <CardHeader>
                      <div className="flex items-center justify-between mb-2">
                        <Badge>{course.level}</Badge>
                        <Badge variant="outline">{course.category}</Badge>
                      </div>
                      <CardTitle className="text-lg">{course.title}</CardTitle>
                      <CardDescription className="line-clamp-2">
                        {course.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="text-sm text-muted-foreground">
                        <div>Duration: {course.duration}</div>
                        <div>Lessons: {course.totalLessons}</div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </>
        ) : (
          /* Course Detail View with Tabs - UNCHANGED */
          <>
            {/* Back Button */}
            <Button 
              variant="ghost" 
              className="mb-6 gap-2"
              onClick={handleBackToCourses}
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Courses
            </Button>

            {/* Course Header */}
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-4">
                <Badge className={selectedCourse.level === 'beginner' ? 'bg-green-500 text-white' : 
                                 selectedCourse.level === 'intermediate' ? 'bg-yellow-500 text-white' : 
                                 'bg-red-500 text-white'}>
                  {selectedCourse.level}
                </Badge>
                <Badge variant="outline">{selectedCourse.category}</Badge>
              </div>
              <h1 className="text-4xl font-bold mb-4">{selectedCourse.title}</h1>
              <p className="text-lg text-muted-foreground mb-6">{selectedCourse.description}</p>

              {/* Course Stats */}
              <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground mb-6">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>{selectedCourse.duration}</span>
                </div>
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  <span>{selectedCourse.totalLessons} lessons</span>
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
                {averageRating > 0 && (
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span>{averageRating.toFixed(1)} ({reviews.length} reviews)</span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={openEditCourseDialog}
                  className="gap-2"
                >
                  <Edit className="h-4 w-4" />
                  Edit Course
                </Button>
                <Button onClick={() => setIsAddLessonOpen(true)} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Lesson
                </Button>
                <Dialog open={isBroadcastOpen} onOpenChange={setIsBroadcastOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="gap-2">
                      <Mail className="h-4 w-4" />
                      Broadcast Message
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Broadcast to All Students</DialogTitle>
                      <DialogDescription>
                        Send a message to all {studentCount} enrolled students
                      </DialogDescription>
                    </DialogHeader>
                    <Textarea
                      placeholder="Enter your message..."
                      value={broadcastMessage}
                      onChange={(e) => setBroadcastMessage(e.target.value)}
                      rows={6}
                    />
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsBroadcastOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleBroadcast} disabled={sending}>
                        {sending ? "Sending..." : "Send to All"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            <Separator className="mb-6" />

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-6">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="students">Students ({studentCount})</TabsTrigger>
                <TabsTrigger value="reviews">Reviews ({reviews.length})</TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview">
                {/* What You'll Learn */}
                {selectedCourse.learningObjectives && selectedCourse.learningObjectives.length > 0 ? (
                  <Card className="mb-6">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        What You'll Learn
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid md:grid-cols-2 gap-4">
                        {selectedCourse.learningObjectives.map((objective, index) => (
                          <div key={index} className="flex items-start gap-2">
                            <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                            <span>{objective}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Card className="mb-6">
                    <CardContent className="py-8 text-center text-muted-foreground">
                      <CheckCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p>Learning objectives not added yet</p>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="mt-3"
                        onClick={openEditCourseDialog}
                      >
                        Add Learning Objectives
                      </Button>
                    </CardContent>
                  </Card>
                )}

                {/* Course Content */}
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BookOpen className="h-5 w-5" />
                      Course Content
                    </CardTitle>
                    <CardDescription>
                      {lessonsWithMaterials.length} lessons • {Math.floor(totalDuration / 60)}h {totalDuration % 60}m
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {lessonsWithMaterials.length === 0 ? (
                      <div className="text-center py-12 text-muted-foreground">
                        <BookOpen className="h-16 w-16 mx-auto mb-3 opacity-50" />
                        <p className="font-medium">No lessons yet</p>
                        <p className="text-sm mb-4">Click "Add Lesson" to create your first lesson</p>
                        <Button onClick={() => setIsAddLessonOpen(true)} className="gap-2">
                          <Plus className="h-4 w-4" />
                          Add First Lesson
                        </Button>
                      </div>
                    ) : (
                      <Accordion type="single" collapsible className="space-y-2">
                        {lessonsWithMaterials.map((lesson, index) => (
                          <AccordionItem 
                            key={lesson._id} 
                            value={lesson._id}
                            className="border rounded-lg px-4"
                          >
                            <AccordionTrigger className="hover:no-underline">
                              <div className="flex items-start gap-4 flex-1 text-left">
                                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center font-semibold text-primary text-sm">
                                  {index + 1}
                                </div>
                                <div className="flex-1">
                                  <h4 className="font-semibold text-base">{lesson.title}</h4>
                                  <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
                                    {lesson.description}
                                  </p>
                                  <div className="flex items-center gap-3 mt-2">
                                    {lesson.duration > 0 && (
                                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                        <Clock className="h-3 w-3" />
                                        {lesson.duration} min
                                      </div>
                                    )}
                                    {lesson.materials.length > 0 && (
                                      <Badge variant="secondary" className="text-xs">
                                        {lesson.materials.length} material{lesson.materials.length !== 1 ? 's' : ''}
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </AccordionTrigger>
                            <AccordionContent>
                              <div className="pl-12 pt-2 pb-4 space-y-4">
                                <div>
                                  <h5 className="text-sm font-medium mb-1">Description</h5>
                                  <p className="text-sm text-muted-foreground">
                                    {lesson.description}
                                  </p>
                                </div>

                                {lesson.materials.length > 0 ? (
                                  <div>
                                    <h5 className="text-sm font-medium mb-2">Lesson Materials</h5>
                                    <div className="space-y-2">
                                      {lesson.materials.map((material) => (
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
                                          <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleDeleteMaterial(material._id)}
                                          >
                                            <Trash2 className="h-4 w-4" />
                                          </Button>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                ) : (
                                  <div className="text-sm text-muted-foreground italic">
                                    No materials attached to this lesson
                                  </div>
                                )}

                                <div className="flex justify-end pt-2">
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => handleDeleteLesson(lesson._id)}
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete Lesson
                                  </Button>
                                </div>
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        ))}
                      </Accordion>
                    )}
                  </CardContent>
                </Card>

                {/* Requirements */}
                {selectedCourse.requirements && selectedCourse.requirements.length > 0 ? (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <BookOpen className="h-5 w-5" />
                        Requirements
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {selectedCourse.requirements.map((req, index) => (
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
                      <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p>Course requirements not added yet</p>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="mt-3"
                        onClick={openEditCourseDialog}
                      >
                        Add Requirements
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* Students Tab */}
              <TabsContent value="students">
                <Card>
                  <CardHeader>
                    <CardTitle>Enrolled Students ({studentCount})</CardTitle>
                    <CardDescription>
                      Students who have been approved for this course
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {students.length === 0 ? (
                      <div className="text-center py-12 text-muted-foreground">
                        <Users className="h-16 w-16 mx-auto mb-3 opacity-50" />
                        <p>No students enrolled yet</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {students.map((student) => (
                          <div
                            key={student._id}
                            className="flex items-center justify-between p-4 border rounded-lg"
                          >
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-full bg-gradient-hero flex items-center justify-center text-primary-foreground text-xl font-bold">
                                {student.studentId.name.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <h4 className="font-semibold">{student.studentId.name}</h4>
                                <p className="text-sm text-muted-foreground">{student.studentId.gmail}</p>
                                <div className="flex items-center gap-3 mt-1">
                                  <Badge variant="secondary">
                                    Progress: {student.progress}%
                                  </Badge>
                                  <span className="text-xs text-muted-foreground">
                                    Enrolled {formatDistanceToNow(new Date(student.enrollmentDate), { addSuffix: true })}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <Dialog open={isMessageStudentOpen && selectedStudent?._id === student._id} 
                                    onOpenChange={(open) => {
                                      setIsMessageStudentOpen(open);
                                      if (!open) setSelectedStudent(null);
                                    }}>
                              <DialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setSelectedStudent(student)}
                                >
                                  <MessageSquare className="h-4 w-4 mr-2" />
                                  Message
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Message Student</DialogTitle>
                                  <DialogDescription>
                                    Send a message to {student.studentId.name}
                                  </DialogDescription>
                                </DialogHeader>
                                <Textarea
                                  placeholder="Enter your message..."
                                  value={messageContent}
                                  onChange={(e) => setMessageContent(e.target.value)}
                                  rows={6}
                                />
                                <DialogFooter>
                                  <Button variant="outline" onClick={() => {
                                    setIsMessageStudentOpen(false);
                                    setMessageContent("");
                                    setSelectedStudent(null);
                                  }}>
                                    Cancel
                                  </Button>
                                  <Button onClick={handleSendMessage} disabled={sending}>
                                    <Send className="h-4 w-4 mr-2" />
                                    {sending ? "Sending..." : "Send"}
                                  </Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Reviews Tab */}
              <TabsContent value="reviews">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                      Course Reviews
                    </CardTitle>
                    <CardDescription>
                      {averageRating > 0 
                        ? `Average rating: ${averageRating.toFixed(1)} out of 5 from ${reviews.length} reviews`
                        : 'No reviews yet'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {reviews.length === 0 ? (
                      <div className="text-center py-12 text-muted-foreground">
                        <Star className="h-16 w-16 mx-auto mb-3 opacity-50" />
                        <p>No reviews yet</p>
                        <p className="text-sm">Reviews will appear here when students rate your course</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {reviews.map((review) => (
                          <div key={review._id} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                            <div className="flex gap-4">
                              {/* Student Avatar */}
                              <div className="flex-shrink-0">
                                <div className="w-12 h-12 rounded-full bg-gradient-hero flex items-center justify-center text-primary-foreground text-xl font-bold">
                                  {review.studentId.name.charAt(0).toUpperCase()}
                                </div>
                              </div>
                              
                              {/* Review Content */}
                              <div className="flex-1">
                                <div className="flex items-start justify-between mb-2">
                                  <div>
                                    <h4 className="font-semibold text-base">{review.studentId.name}</h4>
                                    <div className="flex items-center gap-2 mt-1">
                                      {renderStars(review.rating)}
                                      <span className="text-xs text-muted-foreground">
                                        {formatDistanceToNow(new Date(review.createdAt), { addSuffix: true })}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                {/* Student Comment */}
                                {review.review ? (
                                  <p className="text-sm leading-relaxed mt-3 bg-muted/30 p-3 rounded">
                                    {review.review}
                                  </p>
                                ) : (
                                  <p className="text-sm text-muted-foreground italic mt-3">
                                    No review provided
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </>
        )}

        {/* CREATE COURSE DIALOG - NEW */}
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Course</DialogTitle>
              <DialogDescription>
                Fill in the details to create a new course
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateCourse} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="create-title">Course Title *</Label>
                <Input
                  id="create-title"
                  placeholder="e.g., Introduction to Web Development"
                  value={createFormData.title}
                  onChange={(e) => setCreateFormData({ ...createFormData, title: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="create-description">Description *</Label>
                <Textarea
                  id="create-description"
                  placeholder="Describe what students will learn in this course..."
                  value={createFormData.description}
                  onChange={(e) => setCreateFormData({ ...createFormData, description: e.target.value })}
                  rows={4}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="create-category">Category *</Label>
                  <Select 
                    value={createFormData.category} 
                    onValueChange={(value) => setCreateFormData({ ...createFormData, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="create-level">Level *</Label>
                  <Select 
                    value={createFormData.level} 
                    onValueChange={(value) => setCreateFormData({ ...createFormData, level: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="create-duration">Duration *</Label>
                  <Input
                    id="create-duration"
                    placeholder="e.g., 8 weeks, 3 months"
                    value={createFormData.duration}
                    onChange={(e) => setCreateFormData({ ...createFormData, duration: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="create-totalLessons">Total Lessons *</Label>
                  <Input
                    id="create-totalLessons"
                    type="number"
                    min="1"
                    placeholder="e.g., 24"
                    value={createFormData.totalLessons || ""}
                    onChange={(e) => setCreateFormData({ ...createFormData, totalLessons: parseInt(e.target.value) || 0 })}
                    required
                  />
                </div>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={uploading}>
                  {uploading ? "Creating..." : "Create Course"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Edit Course Dialog - UNCHANGED */}
        <Dialog open={isEditCourseOpen} onOpenChange={setIsEditCourseOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Course Details</DialogTitle>
              <DialogDescription>
                Update course information, requirements, and learning objectives
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <Label>Course Title</Label>
                <Input
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  placeholder="Course title"
                />
              </div>

              <div>
                <Label>Description</Label>
                <Textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  placeholder="Course description"
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Duration</Label>
                  <Input
                    value={editDuration}
                    onChange={(e) => setEditDuration(e.target.value)}
                    placeholder="e.g., 10 hours"
                  />
                </div>
                <div>
                  <Label>Level</Label>
                  <Input
                    value={editLevel}
                    onChange={(e) => setEditLevel(e.target.value)}
                    placeholder="beginner/intermediate/advanced"
                  />
                </div>
                <div>
                  <Label>Category</Label>
                  <Input
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    placeholder="e.g., Programming"
                  />
                </div>
              </div>

              <div>
                <Label>Learning Objectives</Label>
                <div className="flex gap-2 mb-2">
                  <Input
                    value={editObjectiveInput}
                    onChange={(e) => setEditObjectiveInput(e.target.value)}
                    placeholder="Add learning objective"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && editObjectiveInput.trim()) {
                        setEditObjectives([...editObjectives, editObjectiveInput.trim()]);
                        setEditObjectiveInput("");
                      }
                    }}
                  />
                  <Button
                    type="button"
                    onClick={() => {
                      if (editObjectiveInput.trim()) {
                        setEditObjectives([...editObjectives, editObjectiveInput.trim()]);
                        setEditObjectiveInput("");
                      }
                    }}
                  >
                    Add
                  </Button>
                </div>
                <div className="space-y-1">
                  {editObjectives.map((obj, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm p-2 bg-muted rounded">
                      <span className="flex-1">{obj}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditObjectives(editObjectives.filter((_, i) => i !== idx))}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label>Requirements</Label>
                <div className="flex gap-2 mb-2">
                  <Input
                    value={editRequirementInput}
                    onChange={(e) => setEditRequirementInput(e.target.value)}
                    placeholder="Add requirement"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && editRequirementInput.trim()) {
                        setEditRequirements([...editRequirements, editRequirementInput.trim()]);
                        setEditRequirementInput("");
                      }
                    }}
                  />
                  <Button
                    type="button"
                    onClick={() => {
                      if (editRequirementInput.trim()) {
                        setEditRequirements([...editRequirements, editRequirementInput.trim()]);
                        setEditRequirementInput("");
                      }
                    }}
                  >
                    Add
                  </Button>
                </div>
                <div className="space-y-1">
                  {editRequirements.map((req, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm p-2 bg-muted rounded">
                      <span className="flex-1">{req}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditRequirements(editRequirements.filter((_, i) => i !== idx))}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditCourseOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpdateCourse} disabled={uploading}>
                {uploading ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Add Lesson Dialog - UNCHANGED */}
        <Dialog open={isAddLessonOpen} onOpenChange={setIsAddLessonOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Lesson</DialogTitle>
              <DialogDescription>
                Create a lesson with title, description, and optional materials
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <Label htmlFor="lesson-title">Lesson Title *</Label>
                <Input
                  id="lesson-title"
                  placeholder="e.g., Introduction to React Hooks"
                  value={lessonTitle}
                  onChange={(e) => setLessonTitle(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="lesson-description">Description *</Label>
                <Textarea
                  id="lesson-description"
                  placeholder="What will students learn in this lesson?"
                  value={lessonDescription}
                  onChange={(e) => setLessonDescription(e.target.value)}
                  rows={4}
                />
              </div>

              <div>
                <Label htmlFor="lesson-duration">Duration (minutes)</Label>
                <Input
                  id="lesson-duration"
                  type="number"
                  placeholder="30"
                  value={lessonDuration}
                  onChange={(e) => setLessonDuration(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="lesson-pdf">Document (PDF, DOCX, PPT)</Label>
                <Input
                  id="lesson-pdf"
                  type="file"
                  accept=".pdf,.doc,.docx,.ppt,.pptx"
                  onChange={(e) => setLessonPDF(e.target.files?.[0] || null)}
                  className="cursor-pointer"
                />
                {lessonPDF && (
                  <p className="text-xs text-muted-foreground mt-1">
                    ✅ {lessonPDF.name} ({formatFileSize(lessonPDF.size)})
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="lesson-video">Video Lecture (MP4, WebM)</Label>
                <Input
                  id="lesson-video"
                  type="file"
                  accept=".mp4,.webm,.ogg"
                  onChange={(e) => setLessonVideo(e.target.files?.[0] || null)}
                  className="cursor-pointer"
                />
                {lessonVideo && (
                  <p className="text-xs text-muted-foreground mt-1">
                    ✅ {lessonVideo.name} ({formatFileSize(lessonVideo.size)})
                  </p>
                )}
                <p className="text-xs text-muted-foreground mt-1">
                  Max size: 100MB per file
                </p>
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsAddLessonOpen(false)}
                disabled={uploading}
              >
                Cancel
              </Button>
              <Button onClick={handleAddLesson} disabled={uploading}>
                {uploading ? (
                  <>
                    <Upload className="h-4 w-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Add Lesson
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default TeacherCourses;