import { useState, useEffect, useRef } from "react";
import { VolumeX, Volume2 } from "lucide-react";

const ANIMAL_IMAGES = [
  { url: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=200&h=200&fit=crop", name: "Doge", tag: "very curious" },
  { url: "https://images.unsplash.com/photo-1574158622682-e40e69881006?w=200&h=200&fit=crop", name: "Grumpy", tag: "skeptical" },
  { url: "https://images.unsplash.com/photo-1474511320723-9a56873867b5?w=200&h=200&fit=crop", name: "Sly Fox", tag: "devil's advocate" },
  { url: "https://images.unsplash.com/photo-1425082661705-1834bfd09dca?w=200&h=200&fit=crop", name: "Hamster", tag: "enthusiastic" },
  { url: "https://images.unsplash.com/photo-1490718720478-364a07a997cd?w=200&h=200&fit=crop", name: "Wise Owl", tag: "thoughtful" },
  { url: "https://images.unsplash.com/photo-1568572933382-74d440642117?w=200&h=200&fit=crop", name: "Corgi", tag: "optimist" },
  { url: "https://images.unsplash.com/photo-1533738363-b7f9aef128ce?w=200&h=200&fit=crop", name: "Cat", tag: "realist" },
  { url: "https://images.unsplash.com/photo-1564349683136-77e08dba1ef7?w=200&h=200&fit=crop", name: "Panda", tag: "peacemaker" },
];

const AI_DEFAULTS = [
  { display_name: "Sage (AI)", is_ai: true },
  { display_name: "Nova (AI)", is_ai: true },
];

// Positions inside the living room scene
const POSITIONS = [
  { left: "12%", top: "38%", size: 56 },
  { left: "30%", top: "42%", size: 52 },
  { left: "52%", top: "40%", size: 56 },
  { left: "71%", top: "43%", size: 50 },
  { left: "8%",  top: "66%", size: 44 },
  { left: "40%", top: "68%", size: 44 },
  { left: "72%", top: "65%", size: 42 },
];

const GOAL_TAG_MAP = {
  intellectual_stimulation: "curious",
  make_friends: "friendly",
  argue: "debate mode",
  learn_more: "learning",
  no_goal: "just vibing",
};

const LIVING_ROOM_BG = "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=900&h=540&fit=crop&auto=format";

function getMinsLeft() {
  const interval = 30 * 60 * 1000;
  return Math.max(1, Math.ceil((Math.ceil(Date.now() / interval) * interval - Date.now()) / 60000));
}

export default function WaitingRoomAvatars({ participants = [], contentPiece, onExplore, isExploring }) {
  const [mins, setMins] = useState(getMinsLeft());
  const [musicOn, setMusicOn] = useState(false);
  const audioRef = useRef(null);

  useEffect(() => {
    const t = setInterval(() => setMins(getMinsLeft()), 10000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (!audioRef.current) return;
    if (musicOn) {
      audioRef.current.play().catch(() => {});
    } else {
      audioRef.current.pause();
    }
  }, [musicOn]);

  const aiParticipants = participants.filter((p) => p.is_ai);
  const realParticipants = participants.filter((p) => !p.is_ai);
  const aiToShow = aiParticipants.length >= 2
    ? aiParticipants.slice(0, 2)
    : [...aiParticipants, ...AI_DEFAULTS.slice(aiParticipants.length, 2)];
  const allAvatars = [...realParticipants, ...aiToShow].slice(0, POSITIONS.length);

  const pieceType = contentPiece?.type || "piece";
  const exploreLabel = isExploring ? "thinking..." : `Tell me more about this ${pieceType} while I wait`;

  return (
    <div className="space-y-3">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-widest text-muted-foreground font-medium">Waiting Room</p>
          <p className="text-sm font-semibold text-foreground">
            Discussion in <span className="font-bold">{mins} min</span>
          </p>
        </div>
        <button
          onClick={() => setMusicOn((v) => !v)}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors border border-border/60 rounded-full px-3 py-1.5"
        >
          {musicOn ? <Volume2 className="w-3 h-3" /> : <VolumeX className="w-3 h-3" />}
          {musicOn ? "Music on" : "Play music"}
        </button>
      </div>

      {/* Tell me more */}
      {contentPiece && (
        <button
          onClick={onExplore}
          disabled={isExploring}
          className="w-full text-xs text-center py-2 border border-dashed border-foreground/20 rounded-lg text-muted-foreground hover:text-foreground hover:border-foreground/40 disabled:opacity-40 transition-all"
        >
          {exploreLabel}
        </button>
      )}

      {/* Living room scene */}
      <div className="relative w-full rounded-xl overflow-hidden" style={{ paddingBottom: "58%" }}>
        <img
          src={LIVING_ROOM_BG}
          alt="cozy living room"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-amber-950/20" />

        {allAvatars.map((p, i) => {
          const animal = ANIMAL_IMAGES[i % ANIMAL_IMAGES.length];
          const pos = POSITIONS[i];
          const imgSrc = p.avatar_url || animal.url;
          const name = p.is_ai ? animal.name : (p.display_name || "Guest").split(" ")[0];
          const tag = p.is_ai ? animal.tag : (GOAL_TAG_MAP[p.goal] || animal.tag);
          const size = pos.size;

          return (
            <div
              key={p.id || p.display_name || i}
              className="absolute flex flex-col items-center"
              style={{ left: pos.left, top: pos.top, transform: "translate(-50%, -100%)" }}
            >
              <div className="flex flex-col items-center mb-1 gap-0.5">
                <span className="text-white text-[10px] font-semibold drop-shadow leading-none">{name}</span>
                <span className="bg-black/50 text-white text-[8px] px-1.5 py-0.5 rounded-full leading-none">{tag}</span>
              </div>
              <div
                className="rounded-full border-2 border-white/80 overflow-hidden shadow-md"
                style={{ width: size, height: size }}
              >
                <img
                  src={imgSrc}
                  alt={name}
                  className="w-full h-full object-cover"
                  onError={(e) => { e.target.src = animal.url; }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <audio
        ref={audioRef}
        src="https://assets.mixkit.co/music/preview/mixkit-valley-sunset-127.mp3"
        loop
        preload="none"
      />
    </div>
  );
}