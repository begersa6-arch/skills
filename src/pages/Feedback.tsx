import { useState } from "react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Star, Loader2, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function Feedback() {
  const { user } = useAuth();
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comments, setComments] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || rating === 0) return;
    setLoading(true);

    try {
      const { error } = await supabase.from("feedback").insert({
        user_id: user.id,
        rating,
        comments: comments.trim() || null,
      });

      if (error) throw error;
      setSubmitted(true);
      toast.success("Thank you for your feedback!");
    } catch (error: any) {
      toast.error(error.message || "Failed to submit feedback");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 max-w-md text-center">
          <div className="w-20 h-20 rounded-full bg-cheer-success/20 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-cheer-success" />
          </div>
          <h1 className="font-display text-3xl font-bold mb-4">Thank You!</h1>
          <p className="text-muted-foreground">Your feedback helps us improve CHEER for everyone.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-md">
        <h1 className="font-display text-3xl font-bold mb-2">Send Feedback</h1>
        <p className="text-muted-foreground mb-8">Help us improve CHEER with your feedback</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label className="mb-3 block">How would you rate your experience?</Label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="p-1 transition-transform hover:scale-110"
                >
                  <Star
                    className={cn(
                      "w-10 h-10 transition-colors",
                      (hoveredRating || rating) >= star
                        ? "fill-cheer-warning text-cheer-warning"
                        : "text-muted-foreground"
                    )}
                  />
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label htmlFor="comments">Comments (Optional)</Label>
            <Textarea
              id="comments"
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="Tell us what you think..."
              rows={5}
              className="mt-1"
            />
          </div>

          <Button type="submit" variant="hero" className="w-full" disabled={loading || rating === 0}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Submit Feedback"}
          </Button>
        </form>
      </div>
    </Layout>
  );
}
