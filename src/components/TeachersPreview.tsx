// src/components/TeachersPreview.tsx
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookOpen, Mail, MapPin, Users } from "lucide-react";
import API from "@/api/axios";

interface Teacher {
  _id: string;
  name: string;
  gmail: string;
  age: number;
  address: string;
  courseCount: number;
}

const TeachersPreview = () => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    try {
      const response = await API.get("/teachers");
      setTeachers(response.data.teachers);
    } catch (err) {
      console.error("Error fetching teachers:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4 text-muted-foreground">Loading teachers...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold">Our Teachers</h2>
        <p className="text-muted-foreground">Learn from experienced educators</p>
      </div>

      {teachers.length === 0 ? (
        <div className="text-center py-12">
          <Users className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No teachers found</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teachers.map((teacher) => (
            <Card key={teacher._id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-hero flex items-center justify-center text-primary-foreground text-lg font-bold">
                      {teacher.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <CardTitle className="text-lg">{teacher.name}</CardTitle>
                      <Badge variant="secondary" className="mt-1">
                        {teacher.courseCount} {teacher.courseCount === 1 ? 'Course' : 'Courses'}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  <span className="truncate">{teacher.gmail}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span className="truncate">{teacher.address}</span>
                </div>
                <Button variant="outline" className="w-full mt-4">
                  <BookOpen className="h-4 w-4 mr-2" />
                  View Courses
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default TeachersPreview;