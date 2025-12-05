import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { BookOpen, Users, Award, TrendingUp } from "lucide-react";
import Navigation from "@/components/Navigation";

const Home = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
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
              <Link to="/courses">
                <Button size="lg" className="bg-gradient-hero text-lg px-8">
                  Explore Courses
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="text-lg px-8">
                For Teachers
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
                className="text-center p-6 rounded-lg bg-card shadow-sm hover:shadow-md transition-all duration-300"
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
              Join over 50,000 students already learning on our platform
            </p>
            <Button size="lg" variant="secondary" className="text-lg px-8">
              Sign Up Free
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
