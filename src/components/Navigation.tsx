// src/components/Navigation.tsx - UPDATED with Materials link for teachers
import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GraduationCap, BookOpen, Users, LayoutDashboard, Menu, X, LogOut, UserCircle, MessageSquare, Upload } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import API from "@/api/axios";

const Navigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  
  const isActive = (path: string) => location.pathname === path;

  useEffect(() => {
    if (isAuthenticated) {
      fetchUnreadCount();
      // Poll for unread count every 30 seconds
      const interval = setInterval(fetchUnreadCount, 30000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  const fetchUnreadCount = async () => {
    try {
      const response = await API.get("/messages/unread-count");
      setUnreadCount(response.data.unreadCount);
    } catch (error) {
      console.error("Error fetching unread count:", error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/");
    toast.success("Logged out successfully");
  };
  
  // Navigation links based on user role
  const getNavLinks = () => {
    if (!isAuthenticated) {
      // Not logged in - show public links
      return [
        { path: "/courses", label: "Courses", icon: BookOpen },
        { path: "/teachers", label: "Teachers", icon: Users },
      ];
    }
    
    if (user?.role === "teacher") {
      // Teacher - show Dashboard, Materials, My Students, Courses, Messages
      return [
        { path: "/teacher-dashboard", label: "Dashboard", icon: LayoutDashboard },
        { path: "/teacher-materials", label: "Materials", icon: Upload },
        { path: "/teacher-dashboard/students", label: "My Students", icon: Users },
        { path: "/teacher-dashboard/courses", label: "Courses", icon: BookOpen },
        { path: "/messages", label: "Messages", icon: MessageSquare, badge: unreadCount },
      ];
    }
    
    // Student - show My Learning, Courses, Teachers, Messages
    return [
      { path: "/student-dashboard", label: "My Learning", icon: LayoutDashboard },
      { path: "/courses", label: "Courses", icon: BookOpen },
      { path: "/teachers", label: "Teachers", icon: Users },
      { path: "/messages", label: "Messages", icon: MessageSquare, badge: unreadCount },
    ];
  };

  const navLinks = getNavLinks();
  
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
                <Button variant={isActive(link.path) ? "default" : "ghost"} className="gap-2 relative">
                  <link.icon className="h-4 w-4" />
                  {link.label}
                  {link.badge && link.badge > 0 && (
                    <Badge variant="destructive" className="ml-1 h-5 min-w-5 p-0 flex items-center justify-center">
                      {link.badge}
                    </Badge>
                  )}
                </Button>
              </Link>
            ))}
          </div>

          {/* Desktop Auth Section */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="gap-2 hover:bg-muted">
                    <div className="w-8 h-8 rounded-full bg-gradient-hero flex items-center justify-center text-primary-foreground text-sm font-medium">
                      {user?.name?.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex flex-col items-start">
                      <span className="text-sm font-medium">{user?.name}</span>
                      <span className="text-xs text-muted-foreground capitalize">{user?.role}</span>
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={() => navigate(user?.role === "teacher" ? "/teacher-profile" : "/student-profile")}
                    className="cursor-pointer"
                  >
                    <UserCircle className="h-4 w-4 mr-2" />
                    View Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => navigate(user?.role === "teacher" ? "/teacher-dashboard" : "/student-dashboard")}
                    className="cursor-pointer"
                  >
                    <LayoutDashboard className="h-4 w-4 mr-2" />
                    Dashboard
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={handleLogout} 
                    className="text-destructive cursor-pointer"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
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
                  className="w-full justify-start gap-2 relative"
                >
                  <link.icon className="h-4 w-4" />
                  {link.label}
                  {link.badge && link.badge > 0 && (
                    <Badge variant="destructive" className="ml-auto h-5 min-w-5 p-0 flex items-center justify-center">
                      {link.badge}
                    </Badge>
                  )}
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
                  <Button 
                    variant="outline" 
                    className="w-full justify-start gap-2" 
                    onClick={() => { 
                      navigate(user?.role === "teacher" ? "/teacher-profile" : "/student-profile"); 
                      setMobileMenuOpen(false); 
                    }}
                  >
                    <UserCircle className="h-4 w-4" />
                    View Profile
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start gap-2" 
                    onClick={() => { 
                      handleLogout(); 
                      setMobileMenuOpen(false); 
                    }}
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Link to="/auth" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="outline" className="w-full">Sign In</Button>
                  </Link>
                  <Link to="/auth?signup=true" onClick={() => setMobileMenuOpen(false)}>
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