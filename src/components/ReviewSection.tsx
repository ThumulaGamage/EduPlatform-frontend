// src/components/ReviewSection.tsx
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Star, ThumbsUp, User, Edit, Trash2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import API from "@/api/axios";
import { formatDistanceToNow } from "date-fns";

interface Review {
  _id: string;
  studentId: {
    _id: string;
    name: string;
  };
  rating: number;
  review: string;
  createdAt: string;
  updatedAt: string;
}

interface ReviewStats {
  totalReviews: number;
  averageRating: number;
  ratingDistribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
}

interface Props {
  courseId: string;
  canReview: boolean; // Is student enrolled and approved?
}

const ReviewSection = ({ courseId, canReview }: Props) => {
  const { user } = useAuth();
  const { toast } = useToast();

  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [myReview, setMyReview] = useState<Review | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState("");
  const [hoveredStar, setHoveredStar] = useState(0);

  useEffect(() => {
    fetchReviews();
    if (canReview) {
      fetchMyReview();
    }
  }, [courseId]);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const response = await API.get(`/reviews/course/${courseId}`);
      setReviews(response.data.reviews);
      setStats(response.data.stats);
    } catch (error) {
      console.error("Error fetching reviews:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyReview = async () => {
    try {
      const response = await API.get(`/reviews/my-review/${courseId}`);
      setMyReview(response.data.review);
      setRating(response.data.review.rating);
      setReviewText(response.data.review.review);
    } catch (error) {
      // No review yet - that's fine
      console.log("No existing review");
    }
  };

  const handleSubmitReview = async () => {
    if (reviewText.trim().length < 10) {
      toast({
        variant: "destructive",
        title: "Review too short",
        description: "Please write at least 10 characters"
      });
      return;
    }

    setSubmitting(true);
    try {
      await API.post("/reviews", {
        courseId,
        rating,
        review: reviewText.trim()
      });

      toast({
        title: "Success!",
        description: myReview ? "Review updated" : "Review submitted"
      });

      setIsDialogOpen(false);
      fetchReviews();
      fetchMyReview();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.response?.data?.message || "Failed to submit review"
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteReview = async () => {
    if (!confirm("Are you sure you want to delete your review?")) return;

    try {
      await API.delete(`/reviews/${courseId}`);
      toast({
        title: "Deleted",
        description: "Review deleted successfully"
      });
      setMyReview(null);
      setRating(5);
      setReviewText("");
      fetchReviews();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.response?.data?.message || "Failed to delete review"
      });
    }
  };

  const openReviewDialog = () => {
    if (myReview) {
      setRating(myReview.rating);
      setReviewText(myReview.review);
    } else {
      setRating(5);
      setReviewText("");
    }
    setIsDialogOpen(true);
  };

  const StarRating = ({ rating: ratingValue, interactive = false, size = "md" }: any) => {
    const sizeClasses = {
      sm: "h-4 w-4",
      md: "h-5 w-5",
      lg: "h-8 w-8"
    };

    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${sizeClasses[size]} ${
              interactive ? "cursor-pointer" : ""
            } transition-colors ${
              star <= (interactive ? (hoveredStar || ratingValue) : ratingValue)
                ? "fill-yellow-500 text-yellow-500"
                : "text-gray-300"
            }`}
            onClick={() => interactive && setRating(star)}
            onMouseEnter={() => interactive && setHoveredStar(star)}
            onMouseLeave={() => interactive && setHoveredStar(0)}
          />
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Review Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Reviews & Ratings</CardTitle>
        </CardHeader>
        <CardContent>
          {stats && stats.totalReviews > 0 ? (
            <div className="grid md:grid-cols-2 gap-6">
              {/* Average Rating */}
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <div className="text-5xl font-bold">{stats.averageRating}</div>
                  <StarRating rating={Math.round(stats.averageRating)} />
                  <div className="text-sm text-muted-foreground mt-1">
                    {stats.totalReviews} {stats.totalReviews === 1 ? "review" : "reviews"}
                  </div>
                </div>
              </div>

              {/* Rating Distribution */}
              <div className="space-y-2">
                {[5, 4, 3, 2, 1].map((star) => {
                  const count = stats.ratingDistribution[star as keyof typeof stats.ratingDistribution];
                  const percentage = stats.totalReviews > 0 ? (count / stats.totalReviews) * 100 : 0;
                  return (
                    <div key={star} className="flex items-center gap-2">
                      <span className="text-sm w-3">{star}</span>
                      <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                      <Progress value={percentage} className="flex-1 h-2" />
                      <span className="text-sm text-muted-foreground w-8">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Star className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No reviews yet. Be the first to review!</p>
            </div>
          )}

          {/* Write Review Button */}
          {canReview && (
            <div className="mt-6 pt-6 border-t">
              {myReview ? (
                <div className="flex gap-2">
                  <Button onClick={openReviewDialog} className="gap-2">
                    <Edit className="h-4 w-4" />
                    Edit My Review
                  </Button>
                  <Button variant="outline" onClick={handleDeleteReview} className="gap-2">
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </Button>
                </div>
              ) : (
                <Button onClick={openReviewDialog} className="gap-2">
                  <Star className="h-4 w-4" />
                  Write a Review
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Review Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{myReview ? "Edit Review" : "Write a Review"}</DialogTitle>
            <DialogDescription>
              Share your experience with this course
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Your Rating</label>
              <StarRating rating={rating} interactive size="lg" />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Your Review</label>
              <Textarea
                placeholder="What did you think about this course?"
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                rows={5}
                maxLength={500}
              />
              <div className="text-xs text-muted-foreground mt-1">
                {reviewText.length}/500 characters (minimum 10)
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmitReview} disabled={submitting}>
              {submitting ? "Submitting..." : myReview ? "Update Review" : "Submit Review"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reviews List */}
      {reviews.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Student Reviews</h3>
          {reviews.map((review) => (
            <Card key={review._id}>
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-hero flex items-center justify-center text-primary-foreground font-bold flex-shrink-0">
                    {review.studentId.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h4 className="font-semibold">{review.studentId.name}</h4>
                        <StarRating rating={review.rating} size="sm" />
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(review.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                    <p className="text-sm">{review.review}</p>
                    {review.createdAt !== review.updatedAt && (
                      <p className="text-xs text-muted-foreground mt-2">(edited)</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReviewSection;