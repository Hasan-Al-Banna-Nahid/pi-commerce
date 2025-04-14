import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Review } from "@/app/types/product";
import { formatDate } from "@/app/lib/utils";
import { Star } from "lucide-react";

interface ReviewCardProps {
  review: Review;
}

export function ReviewCard({ review }: ReviewCardProps) {
  const user = typeof review.user === "string" ? null : review.user;

  return (
    <div className="flex gap-4">
      <Avatar className="h-12 w-12">
        <AvatarImage src={user?.avatar} />
        <AvatarFallback>
          {user?.name?.charAt(0).toUpperCase() || "U"}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <div className="flex justify-between items-start">
          <div>
            <h4 className="font-semibold">{user?.name || "Anonymous"}</h4>
            <div className="flex items-center gap-1 mt-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${
                    i < review.rating ? "fill-primary" : "fill-muted"
                  }`}
                />
              ))}
            </div>
          </div>
          <span className="text-sm text-muted-foreground">
            {formatDate(review.createdAt)}
          </span>
        </div>
        <p className="mt-2 text-sm">{review.comment}</p>
      </div>
    </div>
  );
}
