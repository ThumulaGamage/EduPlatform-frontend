// src/pages/Courses.tsx - UPDATED with real data
import { useEffect, useState } from "react";
import Navigation from "@/components/Navigation";
import CoursesPreview from "@/components/CoursesPreview";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";

const Courses = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-12">
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-4">Explore Courses</h1>
          <p className="text-muted-foreground text-lg">
            Discover your next learning adventure from our extensive course library
          </p>
        </div>

        {/* CoursesPreview component already fetches real data */}
        <CoursesPreview />
      </div>
    </div>
  );
};

export default Courses;