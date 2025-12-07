// src/components/Navigation.tsx - TEST VERSION WITH LOGS
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { GraduationCap, BookOpen, Users, LayoutDashboard, Menu, X, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const Navigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const isActive = (path: string) => location.pathname === path;

  const handleLogout = () => {
    logout();
    navigate("/");
  };
  
  // Navigation links based on user role
  const getNavLinks = () => {
    console.log("🔍 DEBUG - isAuthenticated:", isAuthenticated);
    console.log("🔍 DEBUG - user:", user);
    console.log("🔍 DEBUG - user role:", user?.role);
    
    if (!isAuthenticated) {
      console.log("📍 Showing PUBLIC links");
      // Not logged in - show public links
      return [
        { path: "/courses", label: "Courses", icon: BookOpen },
        { path: "/teachers", label: "Teachers", icon: Users },
      ];
    }
    
    if (user?.role === "teacher") {
      console.log("👨‍🏫 Showing TEACHER links");
      // Teacher - show Dashboard, My Students, Courses tabs
      return [
        { path: "/teacher-dashboard", label: "Dashboard", icon: LayoutDashboard },
        { path: "/teacher-dashboard/students", label: "My Students", icon: Users },
        { path: "/teacher-dashboard/courses", label: "Courses", icon: BookOpen },
      ];
    }
    
    console.log("👨‍🎓 Showing STUDENT links");
    // Student - show My Learning, Courses, Teachers
    return [
      { path: "/student-dashboard", label: "My Learning", icon: LayoutDashboard },
      { path: "/courses", label: "Courses", icon: BookOpen },
      { path: "/teachers", label: "Teachers", icon: Users },
    ];
  };

  const navLinks = getNavLinks();
  
  console.log("🔗 Nav Links to display:", navLinks);
  
  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2 transition-transform hover:scale-105">
            <GraduationCap className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold bg-gradient-hero bg-clip-text text-transparent">
              EduPlatform
            </span>
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link key={link.path} to={link.path}>
                <Button variant={isActive(link.path) ? "default" : "ghost"} className="gap-2">
                  <link.icon className="h-4 w-4" />
                  {link.label}
                </Button>
              </Link>
            ))}
          </div>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-hero flex items-center justify-center text-primary-foreground text-sm font-medium">
                    {user?.name?.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{user?.name}</span>
                    <span className="text-xs text-muted-foreground capitalize">{user?.role}</span>
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={handleLogout}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </div>
            ) : (
              <>
                <Link to="/auth">
                  <Button variant="ghost">Sign In</Button>
                </Link>
                <Link to="/auth">
                  <Button className="bg-gradient-hero">Get Started</Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-md hover:bg-muted transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-background">
          <div className="container mx-auto px-4 py-4 space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
              >
                <Button
                  variant={isActive(link.path) ? "default" : "ghost"}
                  className="w-full justify-start gap-2"
                >
                  <link.icon className="h-4 w-4" />
                  {link.label}
                </Button>
              </Link>
            ))}
            <div className="pt-4 border-t border-border space-y-2">
              {isAuthenticated ? (
                <>
                  <div className="flex items-center gap-2 px-4 py-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-hero flex items-center justify-center text-primary-foreground text-sm font-medium">
                      {user?.name?.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{user?.name}</span>
                      <span className="text-xs text-muted-foreground capitalize">{user?.role}</span>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full" onClick={() => { handleLogout(); setMobileMenuOpen(false); }}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Link to="/auth" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="outline" className="w-full">Sign In</Button>
                  </Link>
                  <Link to="/auth" onClick={() => setMobileMenuOpen(false)}>
                    <Button className="w-full bg-gradient-hero">Get Started</Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navigation;