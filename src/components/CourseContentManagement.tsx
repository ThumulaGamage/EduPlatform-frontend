// src/components/CourseContentManagement.tsx
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Trash2, GripVertical, Target, CheckCircle, BookOpen } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import API from "@/api/axios";

interface Lesson {
  title: string;
  description: string;
  duration: number;
  order: number;
}

interface Course {
  _id: string;
  title: string;
  learningObjectives: string[];
  requirements: string[];
  lessons: Lesson[];
}

interface Props {
  courseId: string;
  onUpdate?: () => void;
}

const CourseContentManagement = ({ courseId, onUpdate }: Props) => {
  const { toast } = useToast();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Learning Objectives
  const [objectives, setObjectives] = useState<string[]>([]);
  const [newObjective, setNewObjective] = useState("");

  // Requirements
  const [requirements, setRequirements] = useState<string[]>([]);
  const [newRequirement, setNewRequirement] = useState("");

  // Lessons
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [newLesson, setNewLesson] = useState<Lesson>({
    title: "",
    description: "",
    duration: 0,
    order: 0
  });
  const [isLessonDialogOpen, setIsLessonDialogOpen] = useState(false);

  useEffect(() => {
    fetchCourse();
  }, [courseId]);

  const fetchCourse = async () => {
    setLoading(true);
    try {
      const response = await API.get(`/courses/${courseId}`);
      const courseData = response.data.course;
      setCourse(courseData);
      setObjectives(courseData.learningObjectives || []);
      setRequirements(courseData.requirements || []);
      setLessons(courseData.lessons || []);
    } catch (error) {
      console.error("Error fetching course:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load course content"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveContent = async () => {
    try {
      await API.put(`/courses/${courseId}`, {
        learningObjectives: objectives,
        requirements: requirements,
        lessons: lessons,
        totalLessons: lessons.length
      });

      toast({
        title: "Success!",
        description: "Course content updated successfully"
      });

      setIsDialogOpen(false);
      if (onUpdate) onUpdate();
      fetchCourse();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.response?.data?.message || "Failed to update course content"
      });
    }
  };

  // Learning Objectives Functions
  const addObjective = () => {
    if (newObjective.trim()) {
      setObjectives([...objectives, newObjective.trim()]);
      setNewObjective("");
    }
  };

  const removeObjective = (index: number) => {
    setObjectives(objectives.filter((_, i) => i !== index));
  };

  // Requirements Functions
  const addRequirement = () => {
    if (newRequirement.trim()) {
      setRequirements([...requirements, newRequirement.trim()]);
      setNewRequirement("");
    }
  };

  const removeRequirement = (index: number) => {
    setRequirements(requirements.filter((_, i) => i !== index));
  };

  // Lesson Functions
  const addLesson = () => {
    if (newLesson.title.trim()) {
      const lessonWithOrder = {
        ...newLesson,
        order: lessons.length + 1
      };
      setLessons([...lessons, lessonWithOrder]);
      setNewLesson({
        title: "",
        description: "",
        duration: 0,
        order: 0
      });
      setIsLessonDialogOpen(false);
    }
  };

  const removeLesson = (index: number) => {
    const updatedLessons = lessons.filter((_, i) => i !== index);
    // Reorder remaining lessons
    const reorderedLessons = updatedLessons.map((lesson, i) => ({
      ...lesson,
      order: i + 1
    }));
    setLessons(reorderedLessons);
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Course Content Management</CardTitle>
              <CardDescription>
                Manage learning objectives, requirements, and lessons for {course?.title}
              </CardDescription>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>Edit Content</Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Edit Course Content</DialogTitle>
                  <DialogDescription>
                    Add learning objectives, requirements, and lessons
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                  {/* Learning Objectives */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Target className="h-5 w-5 text-primary" />
                      <h3 className="text-lg font-semibold">Learning Objectives</h3>
                    </div>
                    <div className="space-y-2">
                      {objectives.map((objective, index) => (
                        <div key={index} className="flex items-center gap-2 p-3 border rounded-lg">
                          <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                          <span className="flex-1">{objective}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeObjective(index)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      ))}
                      <div className="flex gap-2">
                        <Input
                          placeholder="Add a learning objective..."
                          value={newObjective}
                          onChange={(e) => setNewObjective(e.target.value)}
                          onKeyPress={(e) => e.key === "Enter" && addObjective()}
                        />
                        <Button onClick={addObjective} size="sm">
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Requirements */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-primary" />
                      <h3 className="text-lg font-semibold">Requirements</h3>
                    </div>
                    <div className="space-y-2">
                      {requirements.map((requirement, index) => (
                        <div key={index} className="flex items-center gap-2 p-3 border rounded-lg">
                          <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                          <span className="flex-1">{requirement}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeRequirement(index)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      ))}
                      <div className="flex gap-2">
                        <Input
                          placeholder="Add a requirement..."
                          value={newRequirement}
                          onChange={(e) => setNewRequirement(e.target.value)}
                          onKeyPress={(e) => e.key === "Enter" && addRequirement()}
                        />
                        <Button onClick={addRequirement} size="sm">
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Lessons */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <BookOpen className="h-5 w-5 text-primary" />
                        <h3 className="text-lg font-semibold">Lessons</h3>
                      </div>
                      <Dialog open={isLessonDialogOpen} onOpenChange={setIsLessonDialogOpen}>
                        <DialogTrigger asChild>
                          <Button size="sm">
                            <Plus className="h-4 w-4 mr-2" />
                            Add Lesson
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Add New Lesson</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <Label>Lesson Title *</Label>
                              <Input
                                value={newLesson.title}
                                onChange={(e) => setNewLesson({ ...newLesson, title: e.target.value })}
                                placeholder="e.g., Introduction to Variables"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Description</Label>
                              <Input
                                value={newLesson.description}
                                onChange={(e) => setNewLesson({ ...newLesson, description: e.target.value })}
                                placeholder="Brief description of the lesson"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Duration (minutes)</Label>
                              <Input
                                type="number"
                                min="0"
                                value={newLesson.duration}
                                onChange={(e) => setNewLesson({ ...newLesson, duration: parseInt(e.target.value) || 0 })}
                              />
                            </div>
                          </div>
                          <DialogFooter>
                            <Button variant="outline" onClick={() => setIsLessonDialogOpen(false)}>
                              Cancel
                            </Button>
                            <Button onClick={addLesson}>Add Lesson</Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                    <div className="space-y-2">
                      {lessons.map((lesson, index) => (
                        <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                          <GripVertical className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold flex-shrink-0">
                            {lesson.order}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{lesson.title}</p>
                            {lesson.description && (
                              <p className="text-sm text-muted-foreground truncate">{lesson.description}</p>
                            )}
                          </div>
                          <Badge variant="outline">{lesson.duration} min</Badge>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeLesson(index)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      ))}
                      {lessons.length === 0 && (
                        <p className="text-center text-muted-foreground py-8">
                          No lessons added yet. Click "Add Lesson" to get started.
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSaveContent}>
                    Save All Changes
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Current Content Summary */}
          <div className="grid md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <Target className="h-8 w-8 mx-auto text-primary mb-2" />
                  <p className="text-2xl font-bold">{objectives.length}</p>
                  <p className="text-sm text-muted-foreground">Learning Objectives</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <CheckCircle className="h-8 w-8 mx-auto text-primary mb-2" />
                  <p className="text-2xl font-bold">{requirements.length}</p>
                  <p className="text-sm text-muted-foreground">Requirements</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <BookOpen className="h-8 w-8 mx-auto text-primary mb-2" />
                  <p className="text-2xl font-bold">{lessons.length}</p>
                  <p className="text-sm text-muted-foreground">Lessons</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Preview */}
          {(objectives.length > 0 || requirements.length > 0 || lessons.length > 0) && (
            <div className="space-y-4">
              <h4 className="font-semibold">Content Preview</h4>
              
              {objectives.length > 0 && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Learning Objectives:</p>
                  <ul className="space-y-1">
                    {objectives.slice(0, 3).map((obj, i) => (
                      <li key={i} className="text-sm flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>{obj}</span>
                      </li>
                    ))}
                    {objectives.length > 3 && (
                      <li className="text-sm text-muted-foreground">+ {objectives.length - 3} more</li>
                    )}
                  </ul>
                </div>
              )}

              {lessons.length > 0 && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Lessons:</p>
                  <ul className="space-y-1">
                    {lessons.slice(0, 3).map((lesson, i) => (
                      <li key={i} className="text-sm flex items-center gap-2">
                        <Badge variant="outline">{lesson.order}</Badge>
                        <span>{lesson.title}</span>
                        <span className="text-muted-foreground">({lesson.duration} min)</span>
                      </li>
                    ))}
                    {lessons.length > 3 && (
                      <li className="text-sm text-muted-foreground">+ {lessons.length - 3} more</li>
                    )}
                  </ul>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CourseContentManagement;