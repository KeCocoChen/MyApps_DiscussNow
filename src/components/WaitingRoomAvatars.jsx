const AI_DEFAULTS = [
  { display_name: "Sage (AI)", color: "bg-emerald-100 text-emerald-700", is_ai: true },
  { display_name: "Nova (AI)", color: "bg-violet-100 text-violet-700", is_ai: true },
];

const AI_COLORS = [
  "bg-emerald-100 text-emerald-700",
  "bg-violet-100 text-violet-700",
  "bg-sky-100 text-sky-700",
  "bg-amber-100 text-amber-700",
];

function getInitials(name = "") {
  return name.replace(" (AI)", "").slice(0, 2).toUpperCase();
}

export default function WaitingRoomAvatars({ participants = [] }) {
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
  const maxVisible = 5;
  const visible = allAvatars.slice(0, maxVisible);
  const overflow = allAvatars.length - maxVisible;
  const totalCount = Math.max(allAvatars.length, 2);

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Stacked avatars */}
      <div className="flex items-center">
        {visible.map((p, i) => {
          const color = p.is_ai
            ? (AI_COLORS[i % AI_COLORS.length])
            : "bg-stone-100 text-stone-700";
          return (
            <div
              key={p.id || p.display_name || i}
              className={`w-9 h-9 rounded-full border-2 border-background flex items-center justify-center text-xs font-semibold ${color} ${i > 0 ? "-ml-2.5" : ""} shadow-sm`}
              title={p.display_name}
            >
              {p.avatar_url ? (
                <img src={p.avatar_url} alt={p.display_name} className="w-full h-full object-cover rounded-full" />
              ) : (
                getInitials(p.display_name || "?")
              )}
            </div>
          );
        })}
        {overflow > 0 && (
          <div className="-ml-2.5 w-9 h-9 rounded-full border-2 border-background bg-stone-100 flex items-center justify-center text-xs font-medium text-stone-500 shadow-sm">
            +{overflow}
          </div>
        )}
      </div>
      {/* Caption */}
      <p className="text-xs text-muted-foreground">
        <span className="font-medium text-foreground">{totalCount}</span>{" "}
        {totalCount === 1 ? "person is" : "people are"} in the waiting room
      </p>
    </div>
  );
}