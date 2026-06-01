import { useRef, useState } from "react";
import { Sparkles, Music2, VolumeX } from "lucide-react";
import SessionTimer from "./SessionTimer";

const ANIMAL_IMAGES = [
  { url: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=220&h=220&fit=crop&crop=face", name: "Doge" },
  { url: "https://images.unsplash.com/photo-1574158622682-e40e69881006?w=220&h=220&fit=crop&crop=face", name: "Grumpy" },
  { url: "https://images.unsplash.com/photo-1474511320723-9a56873867b5?w=220&h=220&fit=crop&crop=face", name: "Sly Fox" },
  { url: "https://images.unsplash.com/photo-1425082661705-1834bfd09dca?w=220&h=220&fit=crop&crop=face", name: "Hamster" },
  { url: "https://images.unsplash.com/photo-1490718720478-364a07a997cd?w=220&h=220&fit=crop&crop=face", name: "Wise Owl" },
  { url: "https://images.unsplash.com/photo-1568572933382-74d440642117?w=220&h=220&fit=crop&crop=face", name: "Corgi" },
];

const AI_DEFAULTS = [
  { display_name: "Sage", is_ai: true, goal: "intellectual_stimulation" },
  { display_name: "Nova", is_ai: true, goal: "learn_more" },
];

const GOAL_TAGS = {
  intellectual_stimulation: "Deep Thinker",
  make_friends: "Friendly",
  argue: "Devil's Advocate",
  learn_more: "Curious",
  no_goal: "Just Vibing",
};

// Positions that look like sitting on couch/floor (% based)
const SEATS = [
  { bottom: "9%",  left: "5%"  },
  { bottom: "6%",  left: "28%" },
  { bottom: "9%",  left: "52%" },
  { bottom: "7%",  right: "5%" },
];

const LIVING_ROOM_BG = "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=1000&fit=crop&crop=center";
const MUSIC_SRC = "https://cdn.pixabay.com/audio/2022/10/16/audio_12a6d9a175.mp3";

export default function WaitingRoomScene({ participants = [], piece, extras = [], onExplore, isExploring }) {
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef(null);

  const toggleMusic = () => {
    if (!audioRef.current) return;
    if (playing) {
      audioRef.current.pause();
      setPlaying(false);
    } else {
      audioRef.current.volume = 0.2;
      audioRef.current.play().catch(() => {});
      setPlaying(true);
    }
  };

  const aiParticipants = participants.filter((p) => p.is_ai);
  const realParticipants = participants.filter((p) => !p.is_ai);
  const aiToShow = aiParticipants.length >= 2
    ? aiParticipants.slice(0, 2)
    : [...aiParticipants, ...AI_DEFAULTS.slice(aiParticipants.length, 2)];
  const allAvatars = [...realParticipants.slice(0, 2), ...aiToShow].slice(0, 4);

  const contentLabel = piece
    ? ({ article: "article", video: "video", painting: "painting", song: "song" }[piece.type] || "piece")
    : "piece";

  return (
    <div className="space-y-3">
      {/* Header row */}
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <p className="text-[11px] uppercase tracking-widest font-semibold text-muted-foreground">Waiting Room</p>
          <p className="text-sm font-medium text-foreground">
            Discussion in <SessionTimer format="mins" />
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Music toggle */}
          <button
            onClick={toggleMusic}
            className="flex items-center gap-1.5 text-[11px] text-muted-foreground hover:text-foreground transition-colors"
          >
            {playing
              ? <Music2 className="w-3.5 h-3.5 text-primary animate-pulse" />
              : <VolumeX className="w-3.5 h-3.5" />}
            {playing ? "Playing" : "Play music"}
          </button>
          <audio ref={audioRef} src={MUSIC_SRC} loop preload="none" />
        </div>
      </div>

      {/* Tell me more button */}
      {onExplore && (
        <button
          onClick={onExplore}
          disabled={isExploring || extras.length >= 5}
          className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border border-foreground/20 hover:bg-accent text-foreground/70 hover:text-foreground disabled:opacity-30 transition-all w-fit"
        >
          <Sparkles className="w-3 h-3" />
          {isExploring ? "thinking…" : extras.length >= 5 ? "All caught up" : `Tell me more about the ${contentLabel} while waiting`}
        </button>
      )}

      {/* LLM extras */}
      {extras.length > 0 && (
        <div className="space-y-2">
          {extras.map((insight, i) => (
            <p key={i} className="text-xs text-foreground/65 leading-relaxed italic pl-3 border-l-2 border-foreground/10">
              {insight}
            </p>
          ))}
        </div>
      )}

      {/* Living room scene */}
      <div className="relative w-full rounded-2xl overflow-hidden shadow-sm" style={{ aspectRatio: "16/9" }}>
        {/* Background */}
        <img
          src={LIVING_ROOM_BG}
          alt="Cozy living room"
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* Warm amber vignette */}
        <div className="absolute inset-0 bg-gradient-to-t from-amber-950/30 via-transparent to-transparent" />

        {/* Participants sitting in the room */}
        {allAvatars.map((p, i) => {
          const animal = ANIMAL_IMAGES[i % ANIMAL_IMAGES.length];
          const imgSrc = p.avatar_url || animal.url;
          const displayName = p.is_ai ? animal.name : (p.display_name || "Guest").split(" ")[0];
          const tag = GOAL_TAGS[p.goal] || (p.is_ai ? "AI" : "Thinker");
          const pos = SEATS[i] || SEATS[0];

          return (
            <div
              key={p.id || p.display_name || i}
              className="absolute flex flex-col items-center"
              style={pos}
            >
              {/* Name + tag floating above */}
              <p
                className="text-[10px] font-bold text-white leading-none mb-0.5"
                style={{ textShadow: "0 1px 6px rgba(0,0,0,1), 0 0 12px rgba(0,0,0,0.8)" }}
              >
                {displayName}
              </p>
              <span className="text-[8px] px-1.5 py-0.5 rounded-full bg-black/50 text-white/95 backdrop-blur-sm leading-none mb-1.5">
                {tag}
              </span>
              {/* Round animal avatar — mix-blend-mode multiply removes white bg */}
              <div
                className="w-14 h-14 rounded-full overflow-hidden shadow-xl border-2 border-white/60"
                style={{ mixBlendMode: "normal" }}
              >
                <img
                  src={imgSrc}
                  alt={displayName}
                  className="w-full h-full object-cover scale-110"
                  onError={(e) => { e.target.src = animal.url; }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}