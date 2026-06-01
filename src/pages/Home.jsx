import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import ContentDisplay from "../components/ContentDisplay";
import WaitingRoomAvatars from "../components/WaitingRoomAvatars";
import WaitingRoomQuotes from "../components/WaitingRoomQuotes";
import WaitingRoomMusic from "../components/WaitingRoomMusic";
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
    <div className="max-w-2xl mx-auto px-4 pt-8 pb-16 space-y-8">
      {/* WSJ-style top header */}
      <div className="flex items-start justify-between border-b border-foreground/15 pb-4">
        {/* Left: people + timer stacked */}
        <div className="space-y-0.5">
          <p className="text-sm font-semibold text-foreground">
            {Math.max(participants.length, 2)} people in the waiting room
          </p>
          <p className="text-xs text-muted-foreground">
            Next discussion in <SessionTimer format="mins" />
          </p>
        </div>
        {/* Right: prominent countdown */}
        <div className="text-right">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">Next drop</p>
          <p className="text-xl font-semibold text-foreground leading-tight">
            <SessionTimer format="full" />
          </p>
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



      {/* Waiting room */}
      <WaitingRoomAvatars
        participants={participants}
        piece={currentPiece}
        extras={extras}
        onExplore={currentPiece && extras.length < 5 ? handleExplore : null}
        isExploring={isExploring}
      />

      {/* Main CTA — WSJ style */}
      <div className="border-t border-b border-foreground/10 py-5 flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-widest text-muted-foreground font-medium mb-0.5">Join the conversation</p>
          <p className="text-sm text-foreground/70">New session every 30 minutes</p>
        </div>
        <Button
          onClick={() => setShowQ(true)}
          className="gap-2 rounded-none px-6 h-10 text-sm font-semibold"
          disabled={joinMutation.isPending}
        >
          {joinMutation.isPending ? "Joining..." : "Join"}
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>

      {/* Music + quote */}
      <div className="flex items-center justify-between">
        <WaitingRoomMusic />
        <WaitingRoomQuotes />
      </div>

      <JoinQuestionnaire
        open={showQ}
        onClose={() => setShowQ(false)}
        onSubmit={handleSubmit}
      />
    </div>
  );
}