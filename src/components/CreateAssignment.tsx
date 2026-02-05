// src/components/assignments/CreateAssignment.tsx
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { CalendarIcon, Upload, X } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import API from "@/api/axios";
import { cn } from "@/lib/utils";

interface CreateAssignmentProps {
  courseId: string;
  onSuccess?: () => void;
}

const CreateAssignment = ({ courseId, onSuccess }: CreateAssignmentProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [dueDate, setDueDate] = useState<Date>();
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    instructions: "",
    maxScore: 100,
    allowLateSubmission: false
  });

  const [files, setFiles] = useState<File[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!dueDate) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please select a due date"
      });
      return;
    }

    setLoading(true);

    try {
      const submitData = new FormData();
      submitData.append('courseId', courseId);
      submitData.append('title', formData.title);
      submitData.append('description', formData.description);
      submitData.append('instructions', formData.instructions);
      submitData.append('maxScore', formData.maxScore.toString());
      submitData.append('dueDate', dueDate.toISOString());
      submitData.append('allowLateSubmission', formData.allowLateSubmission.toString());

      files.forEach(file => {
        submitData.append('attachments', file);
      });

      await API.post('/api/assignments', submitData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      toast({
        title: "Success!",
        description: "Assignment created successfully"
      });

      // Reset form
      setFormData({
        title: "",
        description: "",
        instructions: "",
        maxScore: 100,
        allowLateSubmission: false
      });
      setDueDate(undefined);
      setFiles([]);

      if (onSuccess) onSuccess();

    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.response?.data?.message || "Failed to create assignment"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create New Assignment</CardTitle>
        <CardDescription>Add a new assignment for your students</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Assignment Title *</Label>
            <Input
              id="title"
              placeholder="e.g., Chapter 5 Exercises"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              placeholder="Brief description of the assignment..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              required
            />
          </div>

          {/* Instructions */}
          <div className="space-y-2">
            <Label htmlFor="instructions">Instructions</Label>
            <Textarea
              id="instructions"
              placeholder="Detailed instructions for students..."
              value={formData.instructions}
              onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
              rows={5}
            />
          </div>

          {/* Max Score and Due Date Row */}
          <div className="grid md:grid-cols-2 gap-4">
            {/* Max Score */}
            <div className="space-y-2">
              <Label htmlFor="maxScore">Maximum Score *</Label>
              <Input
                id="maxScore"
                type="number"
                min="1"
                value={formData.maxScore}
                onChange={(e) => setFormData({ ...formData, maxScore: parseInt(e.target.value) || 100 })}
                required
              />
            </div>

            {/* Due Date */}
            <div className="space-y-2">
              <Label>Due Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !dueDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dueDate ? format(dueDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={dueDate}
                    onSelect={setDueDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Allow Late Submission */}
          <div className="flex items-center space-x-2">
            <Switch
              id="allowLate"
              checked={formData.allowLateSubmission}
              onCheckedChange={(checked) => setFormData({ ...formData, allowLateSubmission: checked })}
            />
            <Label htmlFor="allowLate" className="cursor-pointer">
              Allow late submissions
            </Label>
          </div>

          {/* File Attachments */}
          <div className="space-y-2">
            <Label>Attachments (Optional)</Label>
            <div className="flex items-center gap-2">
              <Input
                type="file"
                onChange={handleFileChange}
                multiple
                accept=".pdf,.doc,.docx,.txt,.zip,.rar,.jpg,.jpeg,.png"
                className="hidden"
                id="file-upload"
              />
              <Label
                htmlFor="file-upload"
                className="flex items-center gap-2 px-4 py-2 bg-secondary hover:bg-secondary/80 rounded-md cursor-pointer transition"
              >
                <Upload className="h-4 w-4" />
                Choose Files
              </Label>
              <span className="text-sm text-muted-foreground">
                {files.length} file(s) selected
              </span>
            </div>

            {/* File List */}
            {files.length > 0 && (
              <div className="space-y-2 mt-2">
                {files.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 bg-muted rounded"
                  >
                    <span className="text-sm truncate flex-1">{file.name}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex gap-2">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? "Creating..." : "Create Assignment"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default CreateAssignment;