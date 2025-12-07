// src/pages/StudentDashboard.tsx - UPDATED with real data
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookOpen, Clock, Trophy, TrendingUp, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import API from "@/api/axios";

interface Enrollment {
  _id: string;
  courseId: {
    _id: string;
    title: string;
    description: string;
    teacherId: {
      _id: string;
      name: string;
    };
    level: string;
    duration: string;
  };
  status: "pending" | "approved" | "rejected";
  progress: number;
  enrollmentDate: string;
}

const StudentDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEnrollments();
  }, []);

  const fetchEnrollments = async () => {
    setLoading(true);
    try {
      const response = await API.get("/enrollments/my-enrollments");
      setEnrollments(response.data.enrollments);
    } catch (error) {
      console.error("Error fetching enrollments:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load your courses"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    toast({
      title: "Logged out",
      description: "You've been successfully logged out.",
    });
    navigate("/auth");
  };

  // Filter enrollments by status
  const approvedEnrollments = enrollments.filter(e => e.status === "approved");
  const pendingEnrollments = enrollments.filter(e => e.status === "pending");
  const rejectedEnrollments = enrollments.filter(e => e.status === "rejected");

  // Calculate stats
  const totalHours = approvedEnrollments.length * 10; // Assuming 10 hours per course
  const certificates = approvedEnrollments.filter(e => e.progress === 100).length;
  const avgProgress = approvedEnrollments.length > 0
    ? Math.round(approvedEnrollments.reduce((sum, e) => sum + e.progress, 0) / approvedEnrollments.length)
    : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-12">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading your courses...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-12">
        <div className="mb-12">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">
                Welcome back, {user?.name || "Student"}!
              </h1>
              <p className="text-muted-foreground text-lg">Continue your learning journey</p>
              {user && (
                <p className="text-sm text-muted-foreground mt-1">
                  {user.gmail} • {user.age} years old
                </p>
              )}
            </div>
            <Button 
              variant="outline" 
              onClick={handleLogout}
              className="gap-2"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid md:grid-cols-4 gap-6 mb-12">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-muted text-primary">
                  <BookOpen className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{approvedEnrollments.length}</p>
                  <p className="text-sm text-muted-foreground">Courses Enrolled</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-muted text-secondary">
                  <Clock className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{totalHours}</p>
                  <p className="text-sm text-muted-foreground">Hours Learned</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-muted text-accent">
                  <Trophy className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{certificates}</p>
                  <p className="text-sm text-muted-foreground">Certificates</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-muted text-primary">
                  <TrendingUp className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{avgProgress}%</p>
                  <p className="text-sm text-muted-foreground">Avg Progress</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Pending Enrollments */}
        {pendingEnrollments.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Pending Approvals</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pendingEnrollments.map((enrollment) => (
                <Card key={enrollment._id} className="border-yellow-500/50">
                  <CardHeader>
                    <CardTitle className="text-lg">{enrollment.courseId.title}</CardTitle>
                    <CardDescription>by {enrollment.courseId.teacherId.name}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600 border-yellow-500/50">
                      Waiting for approval
                    </Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Enrolled Courses */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Your Courses</h2>
          {approvedEnrollments.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <BookOpen className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-4">No enrolled courses yet</p>
                <Button onClick={() => navigate("/courses")}>
                  Browse Courses
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {approvedEnrollments.map((enrollment) => (
                <Card key={enrollment._id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-lg">{enrollment.courseId.title}</CardTitle>
                    <CardDescription>
                      by {enrollment.courseId.teacherId.name}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-muted-foreground">Progress</span>
                          <span className="font-semibold">{enrollment.progress}%</span>
                        </div>
                        <Progress value={enrollment.progress} className="h-2" />
                      </div>
                      <div className="flex items-center justify-between">
                        <Badge variant="outline">{enrollment.courseId.level}</Badge>
                        <Button size="sm">Continue</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div>
          <h2 className="text-2xl font-bold mb-6">Recent Activity</h2>
          <Card>
            <CardContent className="pt-6">
              {enrollments.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No activity yet</p>
              ) : (
                <div className="space-y-4">
                  {enrollments.slice(0, 5).map((enrollment) => (
                    <div key={enrollment._id} className="flex items-center justify-between py-3 border-b last:border-b-0">
                      <div>
                        <p className="font-medium">
                          {enrollment.status === "approved" ? "Enrolled in" : 
                           enrollment.status === "pending" ? "Requested enrollment for" :
                           "Enrollment rejected for"}
                        </p>
                        <p className="text-sm text-muted-foreground">{enrollment.courseId.title}</p>
                      </div>
                      <Badge variant={
                        enrollment.status === "approved" ? "default" :
                        enrollment.status === "pending" ? "outline" :
                        "destructive"
                      }>
                        {enrollment.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;