// src/components/CourseManagement.tsx
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Users } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import API from "@/api/axios";

interface Course {
  _id: string;
  title: string;
  description: string;
  teacherId: {
    _id: string;
    name: string;
  };
  duration: string;
  level: string;
  category: string;
  image?: string;
  totalLessons: number;
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

const CourseManagement = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState<CourseFormData>({
    title: "",
    description: "",
    duration: "",
    level: "beginner",
    category: "",
    totalLessons: 0
  });

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const response = await API.get(`/courses/teacher/${user?.id}`);
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

  const resetForm = () => {
    setFormData({
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
    setSubmitting(true);

    try {
      await API.post("/courses", {
        ...formData,
        teacherId: user?.id
      });

      toast({
        title: "Success!",
        description: "Course created successfully"
      });

      setIsCreateDialogOpen(false);
      resetForm();
      fetchCourses();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.response?.data?.message || "Failed to create course"
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCourse) return;

    setSubmitting(true);

    try {
      await API.put(`/courses/${editingCourse._id}`, {
        ...formData,
        teacherId: user?.id
      });

      toast({
        title: "Success!",
        description: "Course updated successfully"
      });

      setIsEditDialogOpen(false);
      setEditingCourse(null);
      resetForm();
      fetchCourses();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.response?.data?.message || "Failed to update course"
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteCourse = async (courseId: string, courseTitle: string) => {
    if (!confirm(`Are you sure you want to delete "${courseTitle}"?`)) return;

    try {
      await API.delete(`/courses/${courseId}`);
      
      toast({
        title: "Deleted",
        description: "Course deleted successfully"
      });

      fetchCourses();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.response?.data?.message || "Failed to delete course"
      });
    }
  };

  const openEditDialog = (course: Course) => {
    setEditingCourse(course);
    setFormData({
      title: course.title,
      description: course.description,
      duration: course.duration,
      level: course.level,
      category: course.category,
      totalLessons: course.totalLessons
    });
    setIsEditDialogOpen(true);
  };

  const getLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case "beginner": return "bg-green-500";
      case "intermediate": return "bg-yellow-500";
      case "advanced": return "bg-red-500";
      default: return "bg-gray-500";
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
    <div className="space-y-6">
      {/* Header with Create Button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">My Courses</h2>
          <p className="text-muted-foreground">Create and manage your courses</p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2" onClick={() => resetForm()}>
              <Plus className="h-4 w-4" />
              Create Course
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Course</DialogTitle>
              <DialogDescription>
                Fill in the details to create a new course
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateCourse} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Course Title *</Label>
                <Input
                  id="title"
                  placeholder="e.g., Introduction to Web Development"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Describe what students will learn in this course..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Input
                    id="category"
                    placeholder="e.g., Programming, Design"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="level">Level *</Label>
                  <Select value={formData.level} onValueChange={(value) => setFormData({ ...formData, level: value })}>
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
                  <Label htmlFor="duration">Duration *</Label>
                  <Input
                    id="duration"
                    placeholder="e.g., 8 weeks, 3 months"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="totalLessons">Total Lessons *</Label>
                  <Input
                    id="totalLessons"
                    type="number"
                    min="0"
                    placeholder="e.g., 24"
                    value={formData.totalLessons}
                    onChange={(e) => setFormData({ ...formData, totalLessons: parseInt(e.target.value) || 0 })}
                    required
                  />
                </div>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? "Creating..." : "Create Course"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Course</DialogTitle>
            <DialogDescription>
              Update course details
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditCourse} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-title">Course Title *</Label>
              <Input
                id="edit-title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-description">Description *</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-category">Category *</Label>
                <Input
                  id="edit-category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-level">Level *</Label>
                <Select value={formData.level} onValueChange={(value) => setFormData({ ...formData, level: value })}>
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
                <Label htmlFor="edit-duration">Duration *</Label>
                <Input
                  id="edit-duration"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-totalLessons">Total Lessons *</Label>
                <Input
                  id="edit-totalLessons"
                  type="number"
                  min="0"
                  value={formData.totalLessons}
                  onChange={(e) => setFormData({ ...formData, totalLessons: parseInt(e.target.value) || 0 })}
                  required
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? "Updating..." : "Update Course"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Courses Grid */}
      {courses.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Plus className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">No courses created yet</p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              Create Your First Course
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <Card key={course._id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between mb-2">
                  <Badge className={`${getLevelColor(course.level)} text-white`}>
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
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Duration</span>
                    <span className="font-medium">{course.duration}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Lessons</span>
                    <span className="font-medium">{course.totalLessons}</span>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1"
                    onClick={() => openEditDialog(course)}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 text-destructive hover:bg-destructive hover:text-destructive-foreground"
                    onClick={() => handleDeleteCourse(course._id, course.title)}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default CourseManagement;