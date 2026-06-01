import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

const feedbackOptions = [
  { value: "report_bad_behavior", label: "Report bad behavior" },
  { value: "report_bug", label: "Report a bug" },
  { value: "suggestion", label: "Give a suggestion" },
  { value: "other", label: "Something else" },
];

const ratingLabels = {
  1: "Hated it",
  2: "Did not enjoy",
  3: "Neutral",
  4: "Enjoyed it",
  5: "Loved it",
};

export default function PostDiscussionSurvey({ open, onClose, onSubmit, participants = [] }) {
  const [rating, setRating] = useState(0);
  const [likedParticipant, setLikedParticipant] = useState("");
  const [dislikedParticipant, setDislikedParticipant] = useState("none");
  const [feedbackType, setFeedbackType] = useState("");
  const [feedbackText, setFeedbackText] = useState("");

  const realParticipants = participants.filter((p) => !p.is_ai);

  const handleSubmit = () => {
    onSubmit({
      rating,
      likedParticipant,
      dislikedParticipant: dislikedParticipant === "none" ? "" : dislikedParticipant,
      feedbackType,
      feedbackText,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-heading text-xl">How was the discussion?</DialogTitle>
          <p className="text-sm text-muted-foreground">
            A minute of feedback helps make the next one better.
          </p>
        </DialogHeader>

        <div className="space-y-7 py-2">
          {/* Q1: Rating */}
          <div className="space-y-3">
            <p className="text-sm font-medium">How did you enjoy the conversation?</p>
            <div className="flex gap-2 justify-center">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  onClick={() => setRating(n)}
                  className={`w-12 h-12 rounded-xl text-sm font-semibold transition-all ${
                    rating === n
                      ? "bg-primary text-primary-foreground shadow-md scale-105"
                      : "bg-muted hover:bg-accent"
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
            <div className="flex justify-between text-xs text-muted-foreground px-1">
              <span>Hate it</span>
              <span>Neutral</span>
              <span>Love it</span>
            </div>
            {rating > 0 && (
              <p className="text-center text-xs text-primary font-medium">
                {ratingLabels[rating]}
              </p>
            )}
          </div>

          {/* Q2: Liked participant */}
          {realParticipants.length > 0 && (
            <div className="space-y-3">
              <p className="text-sm font-medium">Which participant did you enjoy most?</p>
              <RadioGroup
                value={likedParticipant}
                onValueChange={setLikedParticipant}
                className="flex flex-wrap gap-x-6 gap-y-2"
              >
                {realParticipants.map((p) => (
                  <div key={p.id} className="flex items-center gap-2">
                    <RadioGroupItem value={p.user_email} id={`like-${p.id}`} />
                    <Label htmlFor={`like-${p.id}`} className="cursor-pointer">
                      {p.display_name}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          )}

          {/* Q3: Disliked participant */}
          {realParticipants.length > 0 && (
            <div className="space-y-3">
              <p className="text-sm font-medium">
                Anyone you would rather not discuss with again?{" "}
                <span className="font-normal text-muted-foreground">(optional)</span>
              </p>
              <RadioGroup
                value={dislikedParticipant}
                onValueChange={setDislikedParticipant}
                className="flex flex-wrap gap-x-6 gap-y-2"
              >
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="none" id="dislike-none" />
                  <Label htmlFor="dislike-none" className="cursor-pointer">
                    No one
                  </Label>
                </div>
                {realParticipants.map((p) => (
                  <div key={p.id} className="flex items-center gap-2">
                    <RadioGroupItem value={p.user_email} id={`dislike-${p.id}`} />
                    <Label htmlFor={`dislike-${p.id}`} className="cursor-pointer">
                      {p.display_name}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          )}

          {/* Q4: Feedback chips */}
          <div className="space-y-3">
            <p className="text-sm font-medium">
              Anything to share?{" "}
              <span className="font-normal text-muted-foreground">(optional)</span>
            </p>
            <div className="flex flex-wrap gap-2">
              {feedbackOptions.map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() =>
                    setFeedbackType((prev) => (prev === value ? "" : value))
                  }
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${
                    feedbackType === value
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-background border-border hover:border-primary/50"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            {feedbackType && (
              <Textarea
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                placeholder="Tell us more..."
                rows={3}
                className="mt-2"
              />
            )}
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <Button variant="ghost" onClick={onClose} className="flex-1">
            Skip
          </Button>
          <Button onClick={handleSubmit} disabled={!rating} className="flex-1">
            Submit and leave
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}