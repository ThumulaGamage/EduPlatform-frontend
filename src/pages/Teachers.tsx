// src/pages/Teachers.tsx - UPDATED with real data
import { useEffect, useState } from "react";
import Navigation from "@/components/Navigation";
import TeachersPreview from "@/components/TeachersPreview";

const Teachers = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-12">
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-4">Our Teachers</h1>
          <p className="text-muted-foreground text-lg">
            Learn from experienced educators passionate about sharing their knowledge
          </p>
        </div>

        {/* TeachersPreview component already fetches real data */}
        <TeachersPreview />
      </div>
    </div>
  );
};

export default Teachers;