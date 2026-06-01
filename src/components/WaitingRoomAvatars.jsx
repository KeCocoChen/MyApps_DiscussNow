import { useState, useEffect } from "react";

function getMinsLeft() {
  const interval = 30 * 60 * 1000;
  return Math.max(1, Math.ceil((Math.ceil(Date.now() / interval) * interval - Date.now()) / 60000));
}

const AI_DEFAULTS = [
  { display_name: "Sage (AI)", color: "bg-emerald-100 text-emerald-700", is_ai: true },
  { display_name: "Nova (AI)", color: "bg-violet-100 text-violet-700", is_ai: true },
];



function getInitials(name = "") {
  return name.replace(" (AI)", "").slice(0, 2).toUpperCase();
}

export default function WaitingRoomAvatars({ participants = [] }) {
  const [mins, setMins] = useState(getMinsLeft());
  useEffect(() => {
    const t = setInterval(() => setMins(getMinsLeft()), 10000);
    return () => clearInterval(t);
  }, []);

  // Build display list: real participants + ensure at least 2 AI bots shown
  const aiParticipants = participants.filter((p) => p.is_ai);
  const realParticipants = participants.filter((p) => !p.is_ai);

  const aiToShow = aiParticipants.length >= 2
    ? aiParticipants.slice(0, 3)
    : [
        ...aiParticipants,
        ...AI_DEFAULTS.slice(aiParticipants.length, 2),
      ];

  const allAvatars = [...realParticipants, ...aiToShow];
  const totalCount = Math.max(allAvatars.length, 2);
  const maxVisible = 5;
  const visible = allAvatars.slice(0, maxVisible);
  const overflow = allAvatars.length - maxVisible;

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Stacked avatars */}
      <div className="flex items-center">
        {visible.map((p, i) => (
          <div
            key={p.id || p.display_name || i}
            className={`w-10 h-10 rounded-full border-2 border-white flex items-center justify-center text-xs font-bold shadow-sm ${i > 0 ? "-ml-3" : ""} ${p.is_ai ? "bg-black text-white" : "bg-stone-200 text-stone-800"}`}
            title={p.display_name}
          >
            {p.avatar_url ? (
              <img src={p.avatar_url} alt={p.display_name} className="w-full h-full object-cover rounded-full" />
            ) : (
              getInitials(p.display_name || "?")
            )}
          </div>
        ))}
        {overflow > 0 && (
          <div className="-ml-3 w-10 h-10 rounded-full border-2 border-white bg-stone-100 flex items-center justify-center text-xs font-semibold text-stone-600 shadow-sm">
            +{overflow}
          </div>
        )}
      </div>
      {/* Caption */}
      <p className="text-sm text-center text-foreground leading-snug max-w-xs">
        <span className="font-semibold">{totalCount} people</span> are in the waiting room waiting to have a discussion with you in{" "}
        <span className="font-semibold">{mins} min</span>!
      </p>
    </div>
  );
}