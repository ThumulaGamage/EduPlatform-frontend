import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Users, Star } from "lucide-react";

interface CourseCardProps {
  title: string;
  description: string;
  instructor: string;
  duration: string;
  students: number;
  rating: number;
  level: string;
  image: string;
}

const CourseCard = ({ title, description, instructor, duration, students, rating, level }: CourseCardProps) => {
  return (
    <Card className="group overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
      <div className="aspect-video bg-gradient-card overflow-hidden">
        <div className="w-full h-full bg-muted flex items-center justify-center">
          <span className="text-4xl opacity-20">📚</span>
        </div>
      </div>
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-lg line-clamp-2 group-hover:text-primary transition-colors">
            {title}
          </CardTitle>
          <Badge variant={level === "Beginner" ? "secondary" : "default"}>{level}</Badge>
        </div>
        <CardDescription className="line-clamp-2">{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">By {instructor}</p>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>{duration}</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            <span>{students.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-accent text-accent" />
            <span>{rating}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button className="w-full">View Course</Button>
      </CardFooter>
    </Card>
  );
};

export default CourseCard;
