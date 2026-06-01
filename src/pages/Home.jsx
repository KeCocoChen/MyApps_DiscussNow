import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Users, ArrowRight, Sparkles, Clock } from "lucide-react";
import ContentDisplay from "../components/ContentDisplay";
import WaitingRoomQuotes from "../components/WaitingRoomQuotes";
import SessionTimer from "../components/SessionTimer";
import JoinQuestionnaire from "../components/JoinQuestionnaire";

const SESSION_INTERVAL = 30 * 60 * 1000;

function getSessionIndex() {
  return Math.floor(Date.now() / SESSION_INTERVAL);
}

export default function Home() {
  const [showQ, setShowQ] = useState(false);
  const [extras, setExtras] = useState([]);
  const [isExploring, setIsExploring] = useState(false);
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

  const handleExplore = async () => {
    if (!currentPiece || isExploring || extras.length >= 5) return;
    setIsExploring(true);
    const prevThemes = extras.map((e, i) => `${i + 1}. ${e.slice(0, 60)}`).join(" | ");
    const insight = await base44.integrations.Core.InvokeLLM({
      prompt: `Give one fascinating angle, fact, or question about "${currentPiece.title}" (${currentPiece.type || "piece"} by ${currentPiece.author || "unknown"}). Context: ${currentPiece.description || ""}. Keep it to 2-3 sentences max. Make it thought-provoking for a group discussion. ${prevThemes ? `Don't repeat these themes: ${prevThemes}` : ""}`,
    });
    setExtras((prev) => [...prev, insight]);
    setIsExploring(false);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-10 space-y-10">
      {/* Single status strip */}
      <div className="flex items-center justify-between border-b border-border/30 pb-5">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Users className="w-3.5 h-3.5" />
          <span>{realCount} in the room</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Clock className="w-3 h-3" />
          <span>opens in</span>
          <SessionTimer />
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

      {/* Extras */}
      {extras.length > 0 && (
        <div className="space-y-2.5">
          {extras.map((insight, i) => (
            <div
              key={i}
              className="text-sm text-foreground/75 leading-relaxed pl-4 border-l border-primary/30 italic"
            >
              {insight}
            </div>
          ))}
        </div>
      )}

      {/* Explore more */}
      {currentPiece && extras.length < 5 && (
        <div className="flex justify-center">
          <button
            onClick={handleExplore}
            disabled={isExploring}
            className="text-xs text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors tracking-wide"
          >
            {isExploring ? "thinking..." : "tell me more →"}
          </button>
        </div>
      )}

      {/* Main CTA */}
      <div className="flex flex-col items-center gap-3 py-2">
        <Button
          size="lg"
          onClick={() => setShowQ(true)}
          className="gap-2 px-10 rounded-full shadow-md shadow-primary/15 hover:shadow-primary/25 transition-shadow"
          disabled={joinMutation.isPending}
        >
          {joinMutation.isPending ? "Joining..." : "Join this discussion"}
          <ArrowRight className="w-4 h-4" />
        </Button>
        <p className="text-xs text-muted-foreground/60 tracking-wide">new session every 30 minutes</p>
      </div>

      {/* Waiting room quote */}
      <WaitingRoomQuotes />

      <JoinQuestionnaire
        open={showQ}
        onClose={() => setShowQ(false)}
        onSubmit={handleSubmit}
      />
    </div>
  );
}