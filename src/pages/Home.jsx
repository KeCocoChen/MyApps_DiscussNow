import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Users, ArrowRight, Sparkles } from "lucide-react";
import ContentDisplay from "../components/ContentDisplay";
import SessionTimer from "../components/SessionTimer";
import JoinQuestionnaire from "../components/JoinQuestionnaire";

const SESSION_INTERVAL = 30 * 60 * 1000;

function getSessionIndex() {
  return Math.floor(Date.now() / SESSION_INTERVAL);
}

export default function Home() {
  const [showQ, setShowQ] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const sessionIndex = useMemo(() => getSessionIndex(), []);

  const { data: pieces = [], isLoading } = useQuery({
    queryKey: ["contentPieces"],
    queryFn: () => base44.entities.ContentPiece.list(),
  });

  const { data: participants = [] } = useQuery({
    queryKey: ["participants", sessionIndex],
    queryFn: () =>
      base44.entities.SessionParticipant.filter({
        session_id: String(sessionIndex),
      }),
    refetchInterval: 15000,
  });

  const currentPiece =
    pieces.length > 0 ? pieces[sessionIndex % pieces.length] : null;

  const joinMutation = useMutation({
    mutationFn: async (answers) => {
      const user = await base44.auth.me();
      return base44.entities.SessionParticipant.create({
        session_id: String(sessionIndex),
        user_email: user.email,
        display_name: user.full_name || "Anonymous",
        attitude: answers.attitude,
        will_initiate: answers.initiate,
        mood: answers.mood,
        goal: answers.goal,
        is_ai: false,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["participants"] });
      navigate(`/room?session=${sessionIndex}`);
    },
  });

  const handleSubmit = (answers) => {
    setShowQ(false);
    joinMutation.mutate(answers);
  };

  const realCount = participants.filter((p) => !p.is_ai).length;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-8">
      {/* Status bar */}
      <div className="flex items-center justify-between">
        <SessionTimer />
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Users className="w-4 h-4" />
          <span>
            {realCount} {realCount === 1 ? "person" : "people"} discussing
          </span>
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="w-6 h-6 border-2 border-muted border-t-primary rounded-full animate-spin" />
        </div>
      ) : currentPiece ? (
        <ContentDisplay piece={currentPiece} />
      ) : (
        <div className="text-center py-20 space-y-3">
          <Sparkles className="w-8 h-8 mx-auto text-primary/40" />
          <p className="text-lg text-muted-foreground">
            Preparing the next piece...
          </p>
          <p className="text-sm text-muted-foreground/70">
            Something interesting is coming your way.
          </p>
        </div>
      )}

      {/* Join CTA */}
      <div className="flex justify-center pt-4">
        <Button
          size="lg"
          onClick={() => setShowQ(true)}
          className="gap-2 px-8 shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-shadow"
          disabled={joinMutation.isPending}
        >
          {joinMutation.isPending ? "Joining..." : "Join the discussion"}
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>

      <JoinQuestionnaire
        open={showQ}
        onClose={() => setShowQ(false)}
        onSubmit={handleSubmit}
      />
    </div>
  );
}