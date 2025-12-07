// src/pages/Home.tsx - UPDATED with public access to courses and teachers
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { BookOpen, Users, Award, TrendingUp, GraduationCap } from "lucide-react";
import PublicCoursesPreview from "@/components/PublicCoursesPreview";
import PublicTeachersPreview from "@/components/PublicTeachersPreview";
import { useAuth } from "@/contexts/AuthContext";

type TabType = "home" | "courses" | "teachers";

const Home = () => {
  const [activeTab, setActiveTab] = useState<TabType>("home");
  const { isAuthenticated, user } = useAuth();

  const getDashboardLink = () => {
    if (!user) return "/auth";
    return user.role === "teacher" ? "/teacher-dashboard" : "/student-dashboard";
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2" onClick={() => setActiveTab("home")}>
              <GraduationCap className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold bg-gradient-hero bg-clip-text text-transparent">
                EduPlatform
              </span>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-1">
              <Button
                variant={activeTab === "home" ? "default" : "ghost"}
                onClick={() => setActiveTab("home")}
                className={activeTab === "home" ? "bg-gradient-hero" : ""}
              >
                Home
              </Button>
              <Button
                variant={activeTab === "courses" ? "default" : "ghost"}
                onClick={() => setActiveTab("courses")}
                className={activeTab === "courses" ? "bg-gradient-hero" : ""}
              >
                <BookOpen className="h-4 w-4 mr-2" />
                Courses
              </Button>
              <Button
                variant={activeTab === "teachers" ? "default" : "ghost"}
                onClick={() => setActiveTab("teachers")}
                className={activeTab === "teachers" ? "bg-gradient-hero" : ""}
              >
                <Users className="h-4 w-4 mr-2" />
                Teachers
              </Button>
            </nav>

            {/* Auth Buttons */}
            <div className="flex items-center gap-3">
              {isAuthenticated ? (
                <Link to={getDashboardLink()}>
                  <Button className="bg-gradient-hero">My Dashboard</Button>
                </Link>
              ) : (
                <>
                  <Link to="/auth">
                    <Button variant="ghost">Sign In</Button>
                  </Link>
                  <Link to="/auth?signup=true">
                    <Button className="bg-gradient-hero">Get Started</Button>
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Mobile Nav */}
          <div className="flex md:hidden gap-1 pb-3 overflow-x-auto">
            <Button
              size="sm"
              variant={activeTab === "home" ? "default" : "ghost"}
              onClick={() => setActiveTab("home")}
              className={activeTab === "home" ? "bg-gradient-hero" : ""}
            >
              Home
            </Button>
            <Button
              size="sm"
              variant={activeTab === "courses" ? "default" : "ghost"}
              onClick={() => setActiveTab("courses")}
              className={activeTab === "courses" ? "bg-gradient-hero" : ""}
            >
              Courses
            </Button>
            <Button
              size="sm"
              variant={activeTab === "teachers" ? "default" : "ghost"}
              onClick={() => setActiveTab("teachers")}
              className={activeTab === "teachers" ? "bg-gradient-hero" : ""}
            >
              Teachers
            </Button>
          </div>
        </div>
      </header>

      {/* Content based on active tab */}
      {activeTab === "home" && (
        <>
          {/* Hero Section */}
          <section className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-hero opacity-10"></div>
            <div className="container mx-auto px-4 py-20 md:py-32 relative">
              <div className="max-w-3xl mx-auto text-center">
                <h1 className="text-4xl md:text-6xl font-bold mb-6 animate-fade-in">
                  Learn Without Limits
                </h1>
                <p className="text-xl text-muted-foreground mb-8 animate-fade-in" style={{ animationDelay: '0.1s' }}>
                  Access world-class education from anywhere. Join thousands of learners transforming their future.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in" style={{ animationDelay: '0.2s' }}>
                  <Button 
                    size="lg" 
                    className="bg-gradient-hero text-lg px-8"
                    onClick={() => setActiveTab("courses")}
                  >
                    <BookOpen className="h-5 w-5 mr-2" />
                    Explore Courses
                  </Button>
                  <Button 
                    size="lg" 
                    variant="outline" 
                    className="text-lg px-8"
                    onClick={() => setActiveTab("teachers")}
                  >
                    <Users className="h-5 w-5 mr-2" />
                    Meet Teachers
                  </Button>
                </div>
              </div>
            </div>
          </section>

          {/* Features Section */}
          <section className="py-20 bg-muted/30">
            <div className="container mx-auto px-4">
              <h2 className="text-3xl font-bold text-center mb-12">Why Choose EduPlatform</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                {[
                  {
                    icon: BookOpen,
                    title: "Expert Instructors",
                    description: "Learn from industry professionals with real-world experience"
                  },
                  {
                    icon: Users,
                    title: "Active Community",
                    description: "Connect with peers and collaborate on projects"
                  },
                  {
                    icon: Award,
                    title: "Certificates",
                    description: "Earn recognized certificates upon course completion"
                  },
                  {
                    icon: TrendingUp,
                    title: "Track Progress",
                    description: "Monitor your learning journey with detailed analytics"
                  }
                ].map((feature, index) => (
                  <div 
                    key={index} 
                    className="text-center p-6 rounded-lg bg-card shadow-sm hover:shadow-md transition-all duration-300 animate-fade-in"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                      <feature.icon className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="py-20">
            <div className="container mx-auto px-4">
              <div className="max-w-4xl mx-auto bg-gradient-hero rounded-2xl p-12 text-center text-primary-foreground shadow-lg">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                  Start Your Learning Journey Today
                </h2>
                <p className="text-lg mb-8 opacity-90">
                  Join our community of learners and start achieving your goals
                </p>
                <Link to="/auth?signup=true">
                  <Button size="lg" variant="secondary" className="text-lg px-8">
                    Sign Up Free
                  </Button>
                </Link>
              </div>
            </div>
          </section>
        </>
      )}

      {activeTab === "courses" && (
        <div className="container mx-auto px-4 py-12">
          <div className="mb-12 text-center">
            <h1 className="text-4xl font-bold mb-4">Explore Our Courses</h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              {isAuthenticated 
                ? "Discover your next learning adventure from our extensive course library" 
                : "Browse our courses - Sign in to enroll and start learning"}
            </p>
          </div>
          {/* Shows real courses with "Sign In to Enroll" button for non-authenticated users */}
          <PublicCoursesPreview />
        </div>
      )}

      {activeTab === "teachers" && (
        <div className="container mx-auto px-4 py-12">
          <div className="mb-12 text-center">
            <h1 className="text-4xl font-bold mb-4">Meet Our Teachers</h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              {isAuthenticated
                ? "Learn from industry professionals who are passionate about sharing their knowledge"
                : "Meet our educators - Sign in to view their courses and enroll"}
            </p>
          </div>
          {/* Shows real teachers with "Sign In to View Courses" button for non-authenticated users */}
          <PublicTeachersPreview />
        </div>
      )}
    </div>
  );
};

export default Home;