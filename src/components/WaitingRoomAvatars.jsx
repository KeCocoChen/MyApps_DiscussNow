import { useState, useEffect } from "react";
import { Sparkles } from "lucide-react";
import SessionTimer from "./SessionTimer";

const ANIMAL_IMAGES = [
  { url: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=200&h=200&fit=crop&crop=face", name: "Doge" },
  { url: "https://images.unsplash.com/photo-1574158622682-e40e69881006?w=200&h=200&fit=crop&crop=face", name: "Grumpy" },
  { url: "https://images.unsplash.com/photo-1474511320723-9a56873867b5?w=200&h=200&fit=crop&crop=face", name: "Sly Fox" },
  { url: "https://images.unsplash.com/photo-1425082661705-1834bfd09dca?w=200&h=200&fit=crop&crop=face", name: "Hamster" },
  { url: "https://images.unsplash.com/photo-1490718720478-364a07a997cd?w=200&h=200&fit=crop&crop=face", name: "Wise Owl" },
  { url: "https://images.unsplash.com/photo-1568572933382-74d440642117?w=200&h=200&fit=crop&crop=face", name: "Corgi" },
];

const AI_DEFAULTS = [
  { display_name: "Sage (AI)", is_ai: true, goal: "intellectual_stimulation" },
  { display_name: "Nova (AI)", is_ai: true, goal: "learn_more" },
];

const GOAL_TAGS = {
  intellectual_stimulation: "Deep Thinker",
  make_friends: "Friendly",
  argue: "Devil's Advocate",
  learn_more: "Curious",
  no_goal: "Just Vibing",
};

const POSITIONS = [
  { bottom: "12%", left: "5%" },
  { bottom: "8%",  left: "27%" },
  { bottom: "14%", left: "52%" },
  { bottom: "10%", right: "5%" },
];

const BG_URL = "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=900&fit=crop";

export default function WaitingRoomAvatars({ participants = [], piece, extras = [], onExplore, isExploring }) {
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
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <p className="text-xs uppercase tracking-widest font-semibold text-foreground/70">Waiting Room</p>
          <p className="text-sm text-foreground font-medium">
            Discussion in <SessionTimer format="mins" />
          </p>
        </div>
        {onExplore && (
          <button
            onClick={onExplore}
            disabled={isExploring || extras.length >= 5}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border border-foreground/20 bg-background hover:bg-accent text-foreground/70 hover:text-foreground disabled:opacity-30 transition-all"
          >
            <Sparkles className="w-3 h-3" />
            {isExploring ? "thinking…" : extras.length >= 5 ? "All caught up" : `Tell me more about the ${contentLabel}`}
          </button>
        )}
      </div>

      {/* LLM extras */}
      {extras.length > 0 && (
        <div className="space-y-2">
          {extras.map((insight, i) => (
            <p key={i} className="text-xs text-foreground/65 leading-relaxed italic pl-3 border-l border-foreground/15">
              {insight}
            </p>
          ))}
        </div>
      )}

      {/* Living room scene */}
      <div className="relative w-full rounded-2xl overflow-hidden" style={{ aspectRatio: "16/9" }}>
        <img
          src={BG_URL}
          alt="Cozy living room"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-amber-900/10" />

        {allAvatars.map((p, i) => {
          const animal = ANIMAL_IMAGES[i % ANIMAL_IMAGES.length];
          const imgSrc = p.avatar_url || animal.url;
          const displayName = p.is_ai ? animal.name : (p.display_name || "Guest").split(" ")[0];
          const tag = GOAL_TAGS[p.goal] || (p.is_ai ? "AI Guest" : "Thinker");
          const pos = POSITIONS[i] || POSITIONS[0];

          return (
            <div
              key={p.id || p.display_name || i}
              className="absolute flex flex-col items-center gap-0.5"
              style={pos}
            >
              <span className="text-[10px] font-bold text-white leading-none" style={{ textShadow: "0 1px 4px rgba(0,0,0,0.9)" }}>
                {displayName}
              </span>
              <span className="text-[8px] px-1.5 py-0.5 rounded-full bg-black/45 text-white/90 leading-none backdrop-blur-sm mb-1">
                {tag}
              </span>
              <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white/80 shadow-lg">
                <img
                  src={imgSrc}
                  alt={displayName}
                  className="w-full h-full object-cover"
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