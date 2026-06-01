import { useMemo, useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import WaitingRoomScene from "../components/WaitingRoomScene";
import WaitingRoomQuotes from "../components/WaitingRoomQuotes";

const SESSION_INTERVAL = 30 * 60 * 1000;
function getSessionIndex() {
  return Math.floor(Date.now() / SESSION_INTERVAL);
}

export default function WaitingRoom() {
  const [extras, setExtras] = useState([]);
  const [timeLeft, setTimeLeft] = useState(() => {
    const interval = 30 * 60 * 1000;
    const now = Date.now();
    return Math.max(0, Math.ceil(now / interval) * interval - now);
  });

  useEffect(() => {
    const timer = setInterval(() => {
      const interval = 30 * 60 * 1000;
      const now = Date.now();
      setTimeLeft(Math.max(0, Math.ceil(now / interval) * interval - now));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const sessionReady = timeLeft === 0;
  const minsLeft = Math.ceil(timeLeft / 60000);
  const [isExploring, setIsExploring] = useState(false);
  const sessionIndex = useMemo(() => getSessionIndex(), []);

  const { data: pieces = [] } = useQuery({
    queryKey: ["contentPieces"],
    queryFn: () => base44.entities.ContentPiece.list(),
  });

  const { data: participants = [] } = useQuery({
    queryKey: ["participants", sessionIndex],
    queryFn: () =>
      base44.entities.SessionParticipant.filter({ session_id: String(sessionIndex) }),
    refetchInterval: 15000,
  });

  const currentPiece = pieces.length > 0 ? pieces[sessionIndex % pieces.length] : null;

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
    <div className="max-w-2xl mx-auto px-4 pt-8 pb-16 space-y-6">
      <WaitingRoomScene
        participants={participants}
        piece={currentPiece}
        extras={extras}
        onExplore={currentPiece && extras.length < 5 ? handleExplore : null}
        isExploring={isExploring}
      />

      <WaitingRoomQuotes />

      {!sessionReady && (
        <div className="text-center py-2">
          <p className="text-sm text-muted-foreground">
            Discussion starts in <span className="font-semibold text-foreground">{minsLeft} min</span>
          </p>
        </div>
      )}

      {sessionReady && (
        <div className="text-center py-2 border-t border-foreground/10">
          <p className="text-sm font-semibold text-foreground">The discussion is live — listen in.</p>
        </div>
      )}
    </div>
  );
}