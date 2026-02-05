// src/pages/TeacherAssignments.tsx
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import CreateAssignment from "@/components/CreateAssignment";
import AssignmentList from "@/components/AssignmentList";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const TeacherAssignments = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleAssignmentCreated = () => {
    setShowCreateDialog(false);
    setRefreshKey(prev => prev + 1); // Trigger refresh
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Course Assignments</h1>
            <p className="text-muted-foreground">Manage assignments for your course</p>
          </div>
          
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Create Assignment
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Assignment</DialogTitle>
              </DialogHeader>
              <CreateAssignment 
                courseId={courseId!} 
                onSuccess={handleAssignmentCreated}
              />
            </DialogContent>
          </Dialog>
        </div>

        <Tabs defaultValue="all" className="w-full">
          <TabsList>
            <TabsTrigger value="all">All Assignments</TabsTrigger>
            <TabsTrigger value="published">Published</TabsTrigger>
            <TabsTrigger value="draft">Drafts</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-6">
            <AssignmentList key={refreshKey} courseId={courseId!} />
          </TabsContent>

          <TabsContent value="published" className="mt-6">
            <AssignmentList key={refreshKey} courseId={courseId!} />
          </TabsContent>

          <TabsContent value="draft" className="mt-6">
            <AssignmentList key={refreshKey} courseId={courseId!} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default TeacherAssignments;