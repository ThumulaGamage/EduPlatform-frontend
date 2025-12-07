// src/pages/TeacherDashboard.tsx - FIXED API ENDPOINTS
import { useState, useEffect } from "react";
import Navigation from "@/components/Navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, BookOpen, Clock, GraduationCap, CheckCircle, XCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import API from "@/api/axios";

interface Enrollment {
  _id: string;
  studentId: {
    _id: string;
    name: string;
    gmail: string;
  };
  courseId: {
    _id: string;
    title: string;
  };
  status: "pending" | "approved" | "rejected";
  enrollmentDate: string;
}

interface TeacherStats {
  totalCourses: number;
  totalStudents: number;
  pendingEnrollments: number;
  recentEnrollments: any[];
}

const TeacherDashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [stats, setStats] = useState<TeacherStats | null>(null);
  const [pendingEnrollments, setPendingEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // FIXED: Changed from /teachers/stats/dashboard to /teachers/dashboard/stats
      const [statsRes, pendingRes] = await Promise.all([
        API.get("/teachers/dashboard/stats"),
        API.get("/enrollments/pending")
      ]);

      setStats(statsRes.data.stats);
      setPendingEnrollments(pendingRes.data.enrollments);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load dashboard data"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApproveEnrollment = async (enrollmentId: string) => {
    setActionLoading(enrollmentId);
    try {
      await API.put(`/enrollments/${enrollmentId}/approve`);
      toast({
        title: "Enrollment Approved!",
        description: "Student has been enrolled in the course."
      });
      fetchData();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.response?.data?.message || "Failed to approve enrollment"
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectEnrollment = async (enrollmentId: string) => {
    setActionLoading(enrollmentId);
    try {
      await API.put(`/enrollments/${enrollmentId}/reject`);
      toast({
        title: "Enrollment Rejected",
        description: "Student enrollment has been rejected."
      });
      fetchData();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.response?.data?.message || "Failed to reject enrollment"
      });
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-12">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Welcome, {user?.name || "Instructor"}!</h1>
          <p className="text-muted-foreground text-lg">Manage your courses and students</p>
        </div>

        {/* Stats Overview */}
        <div className="grid md:grid-cols-4 gap-6 mb-12">
          {[
            { icon: BookOpen, label: "Total Courses", value: stats?.totalCourses || "0", color: "text-primary" },
            { icon: Users, label: "Total Students", value: stats?.totalStudents || "0", color: "text-secondary" },
            { icon: Clock, label: "Pending Requests", value: stats?.pendingEnrollments || "0", color: "text-accent" },
            { icon: GraduationCap, label: "Recent Enrollments", value: stats?.recentEnrollments?.length || "0", color: "text-primary" }
          ].map((stat, index) => (
            <Card key={index}>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-lg bg-muted ${stat.color}`}>
                    <stat.icon className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Pending Enrollment Requests */}
        {pendingEnrollments.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Pending Enrollment Requests</h2>
            <div className="space-y-4">
              {pendingEnrollments.map((enrollment) => (
                <Card key={enrollment._id}>
                  <CardContent className="pt-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-full bg-gradient-hero flex items-center justify-center text-primary-foreground font-bold text-lg">
                          {enrollment.studentId.name.charAt(0)}
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">{enrollment.studentId.name}</h3>
                          <p className="text-sm text-muted-foreground">{enrollment.studentId.gmail}</p>
                          <Badge variant="outline" className="mt-1">
                            {enrollment.courseId.title}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRejectEnrollment(enrollment._id)}
                          disabled={actionLoading === enrollment._id}
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Reject
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleApproveEnrollment(enrollment._id)}
                          disabled={actionLoading === enrollment._id}
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          {actionLoading === enrollment._id ? "Processing..." : "Approve"}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Recent Activity */}
        <div>
          <h2 className="text-2xl font-bold mb-6">Recent Enrollments</h2>
          <Card>
            <CardContent className="pt-6">
              {stats?.recentEnrollments && stats.recentEnrollments.length > 0 ? (
                <div className="space-y-4">
                  {stats.recentEnrollments.map((enrollment: any, index: number) => (
                    <div key={index} className="flex items-center justify-between py-3 border-b last:border-b-0">
                      <div>
                        <p className="font-medium">{enrollment.studentId?.name} enrolled</p>
                        <p className="text-sm text-muted-foreground">{enrollment.courseId?.title}</p>
                      </div>
                      <Badge variant={enrollment.status === "approved" ? "default" : "secondary"}>
                        {enrollment.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">No recent activity</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;