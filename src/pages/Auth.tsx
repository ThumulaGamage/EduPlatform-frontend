// src/pages/Auth.tsx
import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GraduationCap, Mail, Lock, User, ArrowLeft, BookOpen, Users, MapPin, Calendar } from "lucide-react";
import { useAuth, UserRole } from "@/contexts/AuthContext";
import { toast } from "sonner";

const Auth = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { signup, login, isAuthenticated, user, loading: authLoading } = useAuth();
  
  const [isSignUp, setIsSignUp] = useState(searchParams.get("signup") === "true");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [address, setAddress] = useState("");
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [step, setStep] = useState<"credentials" | "role">("credentials");
  const [loading, setLoading] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      const destination = user.role === "teacher" ? "/teacher-dashboard" : "/student-dashboard";
      navigate(destination);
    }
  }, [isAuthenticated, user, navigate]);

  const handleCredentialsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSignUp) {
      // Move to role selection step
      setStep("role");
    } else {
      // Handle login
      handleLogin();
    }
  };

  const handleLogin = async () => {
    setLoading(true);
    try {
      await login(email, password);
      // Navigation will happen automatically via useEffect after login
    } catch (error) {
      // Error toast is shown in AuthContext
      console.error("Login error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
  };

  const handleSignupComplete = async () => {
    if (!selectedRole) {
      toast.error("Please select your role");
      return;
    }

    if (!age || parseInt(age) < 1) {
      toast.error("Please enter a valid age");
      return;
    }

    if (!address.trim()) {
      toast.error("Please enter your address");
      return;
    }
    
    setLoading(true);
    try {
      await signup(name, email, password, parseInt(age), address, selectedRole);
      // Navigation will happen automatically via useEffect after signup
    } catch (error) {
      // Error toast is shown in AuthContext
      console.error("Signup error:", error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setStep("credentials");
    setSelectedRole(null);
    setName("");
    setEmail("");
    setPassword("");
    setAge("");
    setAddress("");
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="p-4 md:p-6">
        <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" />
          <span className="text-sm">Back to home</span>
        </Link>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-6">
          {/* Logo */}
          <div className="text-center space-y-2">
            <Link to="/" className="inline-flex items-center gap-2 justify-center">
              <GraduationCap className="h-10 w-10 text-primary" />
              <span className="text-2xl font-bold bg-gradient-hero bg-clip-text text-transparent">
                EduPlatform
              </span>
            </Link>
            <p className="text-muted-foreground">
              {step === "role" 
                ? "Select your role to continue"
                : isSignUp 
                  ? "Create your account to start learning" 
                  : "Welcome back! Sign in to continue"
              }
            </p>
          </div>

          {/* Auth Card */}
          <Card className="border-border/50 shadow-lg">
            {step === "credentials" ? (
              <>
                <CardHeader className="space-y-1 pb-4">
                  <CardTitle className="text-xl">
                    {isSignUp ? "Create an account" : "Sign in"}
                  </CardTitle>
                  <CardDescription>
                    {isSignUp 
                      ? "Enter your details below to create your account" 
                      : "Enter your email and password to access your account"
                    }
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleCredentialsSubmit} className="space-y-4">
                    {isSignUp && (
                      <>
                        <div className="space-y-2">
                          <Label htmlFor="name">Full Name</Label>
                          <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              id="name"
                              type="text"
                              placeholder="John Doe"
                              value={name}
                              onChange={(e) => setName(e.target.value)}
                              className="pl-10"
                              required
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="age">Age</Label>
                          <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              id="age"
                              type="number"
                              placeholder="25"
                              value={age}
                              onChange={(e) => setAge(e.target.value)}
                              className="pl-10"
                              required
                              min="1"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="address">Address</Label>
                          <div className="relative">
                            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              id="address"
                              type="text"
                              placeholder="123 Main St, City"
                              value={address}
                              onChange={(e) => setAddress(e.target.value)}
                              className="pl-10"
                              required
                            />
                          </div>
                        </div>
                      </>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="email"
                          type="email"
                          placeholder="you@example.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="password"
                          type="password"
                          placeholder="••••••••"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="pl-10"
                          required
                          minLength={6}
                        />
                      </div>
                    </div>

                    {!isSignUp && (
                      <div className="flex justify-end">
                        <button type="button" className="text-sm text-primary hover:underline">
                          Forgot password?
                        </button>
                      </div>
                    )}

                    <Button 
                      type="submit" 
                      className="w-full bg-gradient-hero hover:opacity-90"
                      disabled={loading}
                    >
                      {loading ? "Please wait..." : isSignUp ? "Continue" : "Sign In"}
                    </Button>
                  </form>

                  <div className="mt-6 text-center text-sm">
                    <span className="text-muted-foreground">
                      {isSignUp ? "Already have an account?" : "Don't have an account?"}
                    </span>{" "}
                    <button
                      type="button"
                      onClick={() => {
                        setIsSignUp(!isSignUp);
                        resetForm();
                      }}
                      className="text-primary font-medium hover:underline"
                    >
                      {isSignUp ? "Sign in" : "Sign up"}
                    </button>
                  </div>
                </CardContent>
              </>
            ) : (
              <>
                <CardHeader className="space-y-1 pb-4">
                  <CardTitle className="text-xl">Choose your role</CardTitle>
                  <CardDescription>
                    Are you here to learn or to teach?
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Student Option */}
                  <button
                    type="button"
                    onClick={() => handleRoleSelect("student")}
                    className={`w-full p-6 rounded-lg border-2 transition-all duration-200 text-left ${
                      selectedRole === "student"
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        selectedRole === "student" ? "bg-primary text-primary-foreground" : "bg-muted"
                      }`}>
                        <BookOpen className="h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">I'm a Student</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          I want to explore courses, learn new skills, and track my progress
                        </p>
                      </div>
                    </div>
                  </button>

                  {/* Teacher Option */}
                  <button
                    type="button"
                    onClick={() => handleRoleSelect("teacher")}
                    className={`w-full p-6 rounded-lg border-2 transition-all duration-200 text-left ${
                      selectedRole === "teacher"
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        selectedRole === "teacher" ? "bg-primary text-primary-foreground" : "bg-muted"
                      }`}>
                        <Users className="h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">I'm a Teacher</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          I want to create courses, share knowledge, and grow my student base
                        </p>
                      </div>
                    </div>
                  </button>

                  <div className="flex gap-3 pt-4">
                    <Button
                      variant="outline"
                      onClick={() => setStep("credentials")}
                      className="flex-1"
                      disabled={loading}
                    >
                      Back
                    </Button>
                    <Button
                      onClick={handleSignupComplete}
                      disabled={!selectedRole || loading}
                      className="flex-1 bg-gradient-hero hover:opacity-90"
                    >
                      {loading ? "Creating..." : "Complete Signup"}
                    </Button>
                  </div>
                </CardContent>
              </>
            )}
          </Card>

          {/* Terms */}
          <p className="text-center text-xs text-muted-foreground px-4">
            By continuing, you agree to our{" "}
            <a href="#" className="underline hover:text-foreground">Terms of Service</a>{" "}
            and{" "}
            <a href="#" className="underline hover:text-foreground">Privacy Policy</a>
          </p>
        </div>
      </main>
    </div>
  );
};

export default Auth;