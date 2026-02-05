// src/pages/StudentAssignments.tsx
import { useParams } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AssignmentList from "@/components/AssignmentList";

const StudentAssignments = () => {
  const { courseId } = useParams<{ courseId: string }>();

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Course Assignments</h1>
          <p className="text-muted-foreground">View and submit your assignments</p>
        </div>

        <Tabs defaultValue="pending" className="w-full">
          <TabsList>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="submitted">Submitted</TabsTrigger>
            <TabsTrigger value="graded">Graded</TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="mt-6">
            <AssignmentList courseId={courseId!} />
          </TabsContent>

          <TabsContent value="submitted" className="mt-6">
            <AssignmentList courseId={courseId!} />
          </TabsContent>

          <TabsContent value="graded" className="mt-6">
            <AssignmentList courseId={courseId!} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default StudentAssignments;