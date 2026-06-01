import { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import WaitingRoomScene from "../components/WaitingRoomScene";
import AnimalOverlay from "../components/AnimalOverlay";


const BG_URL = "https://media.base44.com/images/public/6a1d1f0b92a437a5210e58cc/2bc8c55be_IMG_2444.png";

const SESSION_INTERVAL = 30 * 60 * 1000;
function getSessionIndex() {
  return Math.floor(Date.now() / SESSION_INTERVAL);
}

export default function WaitingRoom() {
  const [extras, setExtras] = useState([]);
  const navigate = useNavigate();
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
    setExtras([insight]);
    setIsExploring(false);
  };



  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* Immersive background */}
      <div
        className="fixed inset-0 w-full h-full bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${BG_URL})` }}
      />
      {/* Dark gradient overlay for readability */}
      <div className="fixed inset-0 bg-gradient-to-b from-black/20 via-black/10 to-black/60" />

      {/* Animals sitting in the room */}
      <AnimalOverlay participants={participants} />

      {/* Content */}
      <div className="relative z-10 max-w-lg mx-auto px-4 pt-10 pb-20 space-y-5">
        <WaitingRoomScene
          participants={participants}
          piece={currentPiece}
          extras={extras}
          onExplore={currentPiece && extras.length < 5 ? handleExplore : null}
          isExploring={isExploring}
        />


        {!sessionReady && (
          <div className="text-center py-2">
            <p className="text-sm text-white/80">
              Discussion starts in <span className="font-semibold text-white">{minsLeft} min</span>
            </p>
          </div>
        )}

        {sessionReady && (
          <div className="text-center py-2 border-t border-white/20">
            <p className="text-sm font-semibold text-white">The discussion is live — listen in.</p>
          </div>
        )}

        {/* Bottom-right action buttons */}
        <div className="fixed bottom-6 right-5 flex flex-col gap-2 items-end" style={{ zIndex: 20 }}>
          <button
            onClick={() => navigate("/")}
            className="text-xs text-white/80 hover:text-white bg-black/40 hover:bg-black/60 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20 transition-all"
          >
            ← Back to the {currentPiece ? ({ article: "article", video: "video", painting: "painting", song: "song" }[currentPiece.type] || "piece") : "article"}
          </button>
          <button
            onClick={() => navigate("/")}
            className="text-xs text-white/50 hover:text-white/80 transition-colors px-2 py-1"
          >
            Exit room
          </button>
        </div>
      </div>
    </div>
  );
}