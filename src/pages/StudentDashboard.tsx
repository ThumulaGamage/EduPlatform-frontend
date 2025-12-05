import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookOpen, Clock, Trophy, TrendingUp, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

const StudentDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogout = () => {
    logout();
    toast({
      title: "Logged out",
      description: "You've been successfully logged out.",
    });
    navigate("/auth");
  };

  const enrolledCourses = [
    {
      title: "Full Stack Web Development",
      progress: 65,
      nextLesson: "Building REST APIs",
      dueDate: "2 days",
    },
    {
      title: "UI/UX Design Fundamentals",
      progress: 40,
      nextLesson: "Color Theory",
      dueDate: "5 days",
    },
    {
      title: "Data Science with Python",
      progress: 20,
      nextLesson: "NumPy Basics",
      dueDate: "1 week",
    }
  ];

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
          {[
            { icon: BookOpen, label: "Courses Enrolled", value: "3", color: "text-primary" },
            { icon: Clock, label: "Hours Learned", value: "42", color: "text-secondary" },
            { icon: Trophy, label: "Certificates", value: "1", color: "text-accent" },
            { icon: TrendingUp, label: "Avg Progress", value: "42%", color: "text-primary" }
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

        {/* Enrolled Courses */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Your Courses</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {enrolledCourses.map((course, index) => (
              <Card key={index} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg">{course.title}</CardTitle>
                  <CardDescription>Next: {course.nextLesson}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-semibold">{course.progress}%</span>
                      </div>
                      <Progress value={course.progress} className="h-2" />
                    </div>
                    <div className="flex items-center justify-between">
                      <Badge variant="outline">Due in {course.dueDate}</Badge>
                      <Button size="sm">Continue</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div>
          <h2 className="text-2xl font-bold mb-6">Recent Activity</h2>
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {[
                  { action: "Completed lesson", course: "Full Stack Web Development", time: "2 hours ago" },
                  { action: "Submitted assignment", course: "UI/UX Design Fundamentals", time: "1 day ago" },
                  { action: "Started new course", course: "Data Science with Python", time: "3 days ago" }
                ].map((activity, index) => (
                  <div key={index} className="flex items-center justify-between py-3 border-b last:border-b-0">
                    <div>
                      <p className="font-medium">{activity.action}</p>
                      <p className="text-sm text-muted-foreground">{activity.course}</p>
                    </div>
                    <span className="text-sm text-muted-foreground">{activity.time}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;