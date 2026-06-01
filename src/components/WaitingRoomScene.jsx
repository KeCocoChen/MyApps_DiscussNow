import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, Music2, VolumeX } from "lucide-react";
import SessionTimer from "./SessionTimer";

const ANIMAL_IMAGES = [
  { url: "https://media.giphy.com/media/JIX9t2j0ZTN9S/giphy.gif",        name: "Blinking Cat",  delay: 0 },
  { url: "https://media.giphy.com/media/3oriO0OEd9QIDdllqo/giphy.gif",   name: "Golden Pup",   delay: 0.3 },
  { url: "https://media.giphy.com/media/oCjCjgplMHDVi/giphy.gif",        name: "Curious Fox",  delay: 0.6 },
  { url: "https://media.giphy.com/media/VbEloWwOz3QqYBsqIZ/giphy.gif",   name: "Hamster",     delay: 0.9 },
  { url: "https://media.giphy.com/media/26ufjzujCjKIjPt4A/giphy.gif",    name: "Wise Owl",    delay: 0.2 },
  { url: "https://media.giphy.com/media/RQSuZfuylVNAY/giphy.gif",        name: "Baby Bear",   delay: 0.5 },
  { url: "https://media.giphy.com/media/lJnAXeAmrqF3OPuCs0/giphy.gif",   name: "Parrot",      delay: 0.8 },
  { url: "https://media.giphy.com/media/ICOgUNjpvO0PC/giphy.gif",        name: "Bunny",       delay: 0.1 },
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
          <p className="text-[11px] uppercase tracking-widest font-semibold text-white/60" style={{ textShadow: "0 1px 4px rgba(0,0,0,0.8)" }}>Waiting Room</p>
          <p className="text-sm font-medium text-white" style={{ textShadow: "0 1px 6px rgba(0,0,0,0.9)" }}>
            Discussion in <SessionTimer format="mins" />
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Music toggle */}
          <button
            onClick={toggleMusic}
            className="flex items-center gap-1.5 text-[11px] text-white/70 hover:text-white transition-colors"
            style={{ textShadow: "0 1px 4px rgba(0,0,0,0.8)" }}
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
          disabled={isExploring}
          className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border border-foreground/20 hover:bg-accent text-foreground/70 hover:text-foreground disabled:opacity-30 transition-all w-fit"
        >
          <Sparkles className="w-3 h-3" />
          {isExploring ? "thinking…" : extras.length > 0 ? `Tell me something else` : `Tell me more about the ${contentLabel}`}
        </button>
      )}

      {/* LLM extra — shows only the latest insight */}
      {extras.length > 0 && (
        <p
          className="text-sm leading-relaxed text-white pl-3 border-l-2 border-white/40"
          style={{ textShadow: "0 1px 8px rgba(0,0,0,0.9), 0 0 20px rgba(0,0,0,0.7)", fontSize: "clamp(0.82rem, 1.5vw, 1rem)" }}
        >
          {extras[0]}
        </p>
      )}

    </div>
  );
}