// src/pages/TeacherCourses.tsx - UPDATED with Course Management
import Navigation from "@/components/Navigation";
import CourseManagement from "@/components/CourseManagement";

const TeacherCourses = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-12">
        <CourseManagement />
      </div>
    </div>
  );
};

export default TeacherCourses;