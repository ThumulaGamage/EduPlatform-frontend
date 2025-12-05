import Navigation from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, BookOpen, MessageSquare, PlusCircle, BarChart } from "lucide-react";

const TeacherDashboard = () => {
  const myCourses = [
    {
      title: "Full Stack Web Development",
      students: 342,
      avgRating: 4.8,
      pending: 12,
      status: "active"
    },
    {
      title: "Advanced JavaScript Patterns",
      students: 215,
      avgRating: 4.9,
      pending: 5,
      status: "active"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h1 className="text-4xl font-bold mb-2">Instructor Dashboard</h1>
            <p className="text-muted-foreground text-lg">Manage your courses and students</p>
          </div>
          <Button className="bg-gradient-hero gap-2">
            <PlusCircle className="h-4 w-4" />
            Create New Course
          </Button>
        </div>

        {/* Stats Overview */}
        <div className="grid md:grid-cols-4 gap-6 mb-12">
          {[
            { icon: BookOpen, label: "Total Courses", value: "2", color: "text-primary" },
            { icon: Users, label: "Total Students", value: "557", color: "text-secondary" },
            { icon: MessageSquare, label: "Pending Reviews", value: "17", color: "text-accent" },
            { icon: BarChart, label: "Avg Rating", value: "4.85", color: "text-primary" }
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

        {/* My Courses */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">My Courses</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {myCourses.map((course, index) => (
              <Card key={index} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-xl mb-2">{course.title}</CardTitle>
                      <CardDescription>{course.students} enrolled students</CardDescription>
                    </div>
                    <Badge variant={course.status === "active" ? "default" : "secondary"}>
                      {course.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Average Rating</span>
                      <span className="font-semibold">⭐ {course.avgRating}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Pending Submissions</span>
                      <Badge variant="outline">{course.pending}</Badge>
                    </div>
                    <div className="flex gap-2 pt-2">
                      <Button variant="outline" className="flex-1">Edit Course</Button>
                      <Button className="flex-1">View Analytics</Button>
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
                  { student: "Alice Johnson", action: "submitted assignment", course: "Full Stack Web Development", time: "1 hour ago" },
                  { student: "Bob Smith", action: "asked a question", course: "Advanced JavaScript Patterns", time: "3 hours ago" },
                  { student: "Carol Williams", action: "completed course", course: "Full Stack Web Development", time: "5 hours ago" },
                  { student: "David Brown", action: "left a review", course: "Advanced JavaScript Patterns", time: "1 day ago" }
                ].map((activity, index) => (
                  <div key={index} className="flex items-center justify-between py-3 border-b last:border-b-0">
                    <div>
                      <p className="font-medium">{activity.student} {activity.action}</p>
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

export default TeacherDashboard;
