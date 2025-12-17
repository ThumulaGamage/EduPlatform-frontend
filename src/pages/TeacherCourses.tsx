// src/pages/TeacherCourses.tsx - UPDATED with content management
import { useState } from "react";
import Navigation from "@/components/Navigation";
import CourseManagement from "@/components/CourseManagement";
import CourseContentManagement from "@/components/CourseContentManagement";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const TeacherCourses = () => {
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("courses");

  const handleCourseSelect = (courseId: string) => {
    setSelectedCourseId(courseId);
    setActiveTab("content");
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-12">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="courses">My Courses</TabsTrigger>
            <TabsTrigger value="content" disabled={!selectedCourseId}>
              Course Content
            </TabsTrigger>
          </TabsList>

          <TabsContent value="courses">
            <CourseManagement onSelectCourse={handleCourseSelect} />
          </TabsContent>

          <TabsContent value="content">
            {selectedCourseId ? (
              <CourseContentManagement 
                courseId={selectedCourseId}
                onUpdate={() => {
                  // Refresh course list if needed
                }}
              />
            ) : (
              <p className="text-center text-muted-foreground py-12">
                Select a course to manage its content
              </p>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default TeacherCourses;