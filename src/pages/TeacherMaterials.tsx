// src/pages/TeacherMaterials.tsx - Dedicated page for teachers to manage course materials
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { FileText, Video, Image, File, Upload, Trash2, Eye, FolderOpen, BookOpen } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import API from "@/api/axios";
import { formatDistanceToNow } from "date-fns";

interface Course {
  _id: string;
  title: string;
  category: string;
  materials: Material[];
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

const TeacherMaterials = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string>("");
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [materialTitle, setMaterialTitle] = useState("");

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    if (selectedCourse) {
      fetchMaterials(selectedCourse);
    }
  }, [selectedCourse]);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const response = await API.get("/courses/teacher");
      setCourses(response.data.courses);
      if (response.data.courses.length > 0) {
        setSelectedCourse(response.data.courses[0]._id);
      }
    } catch (error) {
      console.error("Error fetching courses:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load your courses"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchMaterials = async (courseId: string) => {
    try {
      const response = await API.get(`/materials/course/${courseId}`);
      setMaterials(response.data.materials);
    } catch (error) {
      console.error("Error fetching materials:", error);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      if (file.size > 100 * 1024 * 1024) {
        toast({
          variant: "destructive",
          title: "File too large",
          description: "Maximum file size is 100MB"
        });
        return;
      }

      setSelectedFile(file);
      if (!materialTitle) {
        setMaterialTitle(file.name);
      }
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast({
        variant: "destructive",
        title: "No file selected",
        description: "Please select a file to upload"
      });
      return;
    }

    if (!selectedCourse) {
      toast({
        variant: "destructive",
        title: "No course selected",
        description: "Please select a course first"
      });
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('title', materialTitle || selectedFile.name);

      await API.post(`/materials/upload/${selectedCourse}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      toast({
        title: "Success!",
        description: "Material uploaded to cloud successfully"
      });

      setIsDialogOpen(false);
      setSelectedFile(null);
      setMaterialTitle("");
      fetchMaterials(selectedCourse);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Upload Failed",
        description: error.response?.data?.message || "Failed to upload material"
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (materialId: string, filename: string) => {
    if (!confirm(`Delete "${filename}"?`)) return;

    try {
      await API.delete(`/materials/${selectedCourse}/${materialId}`);
      toast({
        title: "Deleted",
        description: "Material deleted from cloud successfully"
      });
      fetchMaterials(selectedCourse);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.response?.data?.message || "Failed to delete material"
      });
    }
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'pdf':
        return <FileText className="h-8 w-8 text-red-500" />;
      case 'video':
        return <Video className="h-8 w-8 text-blue-500" />;
      case 'image':
        return <Image className="h-8 w-8 text-green-500" />;
      case 'document':
        return <File className="h-8 w-8 text-orange-500" />;
      default:
        return <File className="h-8 w-8 text-gray-500" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const handleView = (material: Material) => {
    window.open(material.url, '_blank');
  };

  const getTotalSize = () => {
    return materials.reduce((sum, m) => sum + m.filesize, 0);
  };

  const getFileTypeCount = (type: string) => {
    return materials.filter(m => m.type === type).length;
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

  const selectedCourseData = courses.find(c => c._id === selectedCourse);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Course Materials</h1>
          <p className="text-muted-foreground">
            Upload and manage materials for your courses
          </p>
        </div>

        {courses.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <BookOpen className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No courses yet</h3>
              <p className="text-muted-foreground mb-4">
                Create your first course to start uploading materials
              </p>
              <Button onClick={() => navigate("/teacher-dashboard")}>
                Go to Dashboard
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Course Selector & Upload Button */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex-1 max-w-md">
                    <Label className="mb-2 block">Select Course</Label>
                    <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {courses.map((course) => (
                          <SelectItem key={course._id} value={course._id}>
                            {course.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                      <Button size="lg" className="gap-2">
                        <Upload className="h-5 w-5" />
                        Upload Material
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Upload Course Material</DialogTitle>
                        <DialogDescription>
                          Upload to: {selectedCourseData?.title}
                        </DialogDescription>
                      </DialogHeader>

                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="material-title">Material Title</Label>
                          <Input
                            id="material-title"
                            placeholder="e.g., Week 1 Lecture Notes"
                            value={materialTitle}
                            onChange={(e) => setMaterialTitle(e.target.value)}
                          />
                        </div>

                        <div>
                          <Label htmlFor="file-upload">Select File</Label>
                          <Input
                            id="file-upload"
                            type="file"
                            accept=".pdf,.mp4,.webm,.ogg,.jpg,.jpeg,.png,.gif,.doc,.docx,.ppt,.pptx"
                            onChange={handleFileSelect}
                            className="cursor-pointer"
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            Supported: PDF, Videos (MP4, WebM), Images, Documents
                            <br />
                            Maximum size: 100MB • Stored in cloud
                          </p>
                        </div>

                        {selectedFile && (
                          <div className="p-3 bg-muted rounded-lg">
                            <p className="text-sm font-medium">{selectedFile.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {formatFileSize(selectedFile.size)} • Ready to upload
                            </p>
                          </div>
                        )}
                      </div>

                      <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button onClick={handleUpload} disabled={uploading || !selectedFile}>
                          {uploading ? "Uploading..." : "Upload"}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
            </Card>

            {/* Stats Cards */}
            {materials.length > 0 && (
              <div className="grid md:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardDescription>Total Files</CardDescription>
                    <CardTitle className="text-3xl">{materials.length}</CardTitle>
                  </CardHeader>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardDescription>Total Size</CardDescription>
                    <CardTitle className="text-3xl">{formatFileSize(getTotalSize())}</CardTitle>
                  </CardHeader>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardDescription>Videos</CardDescription>
                    <CardTitle className="text-3xl">{getFileTypeCount('video')}</CardTitle>
                  </CardHeader>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardDescription>Documents</CardDescription>
                    <CardTitle className="text-3xl">
                      {getFileTypeCount('pdf') + getFileTypeCount('document')}
                    </CardTitle>
                  </CardHeader>
                </Card>
              </div>
            )}

            {/* Materials List */}
            <Card>
              <CardHeader>
                <CardTitle>Uploaded Materials</CardTitle>
                <CardDescription>
                  {materials.length} file{materials.length !== 1 ? 's' : ''} in {selectedCourseData?.title}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {materials.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <FolderOpen className="h-16 w-16 mx-auto mb-3 opacity-50" />
                    <p className="mb-2">No materials uploaded yet</p>
                    <p className="text-sm">Click "Upload Material" to add your first file</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {materials.map((material) => (
                      <div
                        key={material._id}
                        className="flex items-center gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex-shrink-0">
                          {getFileIcon(material.type)}
                        </div>

                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium truncate">{material.title}</h4>
                          <div className="flex items-center gap-3 text-sm text-muted-foreground">
                            <Badge variant="outline" className="text-xs">
                              {material.type.toUpperCase()}
                            </Badge>
                            <span>{formatFileSize(material.filesize)}</span>
                            <span>
                              {formatDistanceToNow(new Date(material.uploadedAt), { addSuffix: true })}
                            </span>
                            <Badge variant="secondary" className="text-xs">
                              ☁️ Cloud
                            </Badge>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleView(material)}
                            className="gap-1"
                          >
                            <Eye className="h-4 w-4" />
                            View
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDelete(material._id, material.title)}
                            className="gap-1 text-destructive hover:bg-destructive hover:text-destructive-foreground"
                          >
                            <Trash2 className="h-4 w-4" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherMaterials;