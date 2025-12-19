// src/components/CourseMaterials.tsx - UPDATED for Cloudinary
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { FileText, Video, Image, File, Upload, Trash2, Download, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import API from "@/api/axios";
import { formatDistanceToNow } from "date-fns";

interface Material {
  _id: string;
  title: string;
  type: 'pdf' | 'video' | 'document' | 'image' | 'other';
  url: string;
  filename: string;
  filesize: number;
  uploadedAt: string;
}

interface Props {
  courseId: string;
  isTeacher: boolean;
}

const CourseMaterials = ({ courseId, isTeacher }: Props) => {
  const { toast } = useToast();
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [materialTitle, setMaterialTitle] = useState("");

  useEffect(() => {
    fetchMaterials();
  }, [courseId]);

  const fetchMaterials = async () => {
    setLoading(true);
    try {
      const response = await API.get(`/materials/course/${courseId}`);
      setMaterials(response.data.materials);
    } catch (error) {
      console.error("Error fetching materials:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Validate file size (100MB max)
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

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('title', materialTitle || selectedFile.name);

      await API.post(`/materials/upload/${courseId}`, formData, {
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
      fetchMaterials();
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
      await API.delete(`/materials/${courseId}/${materialId}`);
      toast({
        title: "Deleted",
        description: "Material deleted from cloud successfully"
      });
      fetchMaterials();
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
    // URL is already the full Cloudinary URL
    window.open(material.url, '_blank');
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Course Materials</CardTitle>
            <CardDescription>
              {isTeacher 
                ? "Upload videos, PDFs, and documents (stored securely in the cloud)"
                : "Download course materials to enhance your learning"}
            </CardDescription>
          </div>
          {isTeacher && (
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Upload className="h-4 w-4" />
                  Upload Material
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Upload Course Material</DialogTitle>
                  <DialogDescription>
                    Upload videos, PDFs, images, or documents to cloud storage
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
                      Supported: PDF, Videos (MP4, WebM), Images, Documents (DOC, PPT)
                      <br />
                      Maximum size: 100MB • Files stored securely in cloud
                    </p>
                  </div>

                  {selectedFile && (
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="text-sm font-medium">{selectedFile.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(selectedFile.size)} • Ready to upload to cloud
                      </p>
                    </div>
                  )}
                </div>

                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleUpload} disabled={uploading || !selectedFile}>
                    {uploading ? "Uploading to cloud..." : "Upload"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {materials.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Upload className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No materials uploaded yet</p>
            {isTeacher && <p className="text-sm">Upload your first material to cloud storage</p>}
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
                  {isTeacher && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(material._id, material.title)}
                      className="gap-1 text-destructive hover:bg-destructive hover:text-destructive-foreground"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CourseMaterials;