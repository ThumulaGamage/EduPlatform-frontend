import Navigation from "@/components/Navigation";
import CourseCard from "@/components/CourseCard";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";

const coursesData = [
  {
    title: "Full Stack Web Development",
    description: "Learn to build modern web applications from scratch using React, Node.js, and MongoDB",
    instructor: "Sarah Johnson",
    duration: "12 weeks",
    students: 15420,
    rating: 4.8,
    level: "Intermediate",
    image: ""
  },
  {
    title: "Data Science with Python",
    description: "Master data analysis, visualization, and machine learning with Python",
    instructor: "Michael Chen",
    duration: "10 weeks",
    students: 23100,
    rating: 4.9,
    level: "Advanced",
    image: ""
  },
  {
    title: "UI/UX Design Fundamentals",
    description: "Create beautiful and user-friendly interfaces with design thinking principles",
    instructor: "Emily Rodriguez",
    duration: "8 weeks",
    students: 18750,
    rating: 4.7,
    level: "Beginner",
    image: ""
  },
  {
    title: "Mobile App Development",
    description: "Build native mobile apps for iOS and Android using React Native",
    instructor: "David Kim",
    duration: "14 weeks",
    students: 12890,
    rating: 4.6,
    level: "Intermediate",
    image: ""
  },
  {
    title: "Digital Marketing Mastery",
    description: "Learn SEO, social media marketing, and content strategy for growth",
    instructor: "Jessica Williams",
    duration: "6 weeks",
    students: 31200,
    rating: 4.8,
    level: "Beginner",
    image: ""
  },
  {
    title: "Cloud Computing with AWS",
    description: "Deploy and manage scalable applications on Amazon Web Services",
    instructor: "Robert Taylor",
    duration: "10 weeks",
    students: 9560,
    rating: 4.7,
    level: "Advanced",
    image: ""
  }
];

const Courses = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-12">
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-4">Explore Courses</h1>
          <p className="text-muted-foreground text-lg">
            Discover your next learning adventure from our extensive course library
          </p>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search courses..." 
              className="pl-10"
            />
          </div>
          <Select defaultValue="all">
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Levels</SelectItem>
              <SelectItem value="beginner">Beginner</SelectItem>
              <SelectItem value="intermediate">Intermediate</SelectItem>
              <SelectItem value="advanced">Advanced</SelectItem>
            </SelectContent>
          </Select>
          <Select defaultValue="popular">
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="popular">Most Popular</SelectItem>
              <SelectItem value="rating">Highest Rated</SelectItem>
              <SelectItem value="newest">Newest</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Course Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {coursesData.map((course, index) => (
            <CourseCard key={index} {...course} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Courses;
