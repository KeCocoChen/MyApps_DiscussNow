// Small round profile avatars shown near the article — no names, no labels
const ANIMAL_IMAGES = [
  { url: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=120&h=120&fit=crop&crop=face", name: "Doge" },
  { url: "https://images.unsplash.com/photo-1574158622682-e40e69881006?w=120&h=120&fit=crop&crop=face", name: "Grumpy" },
  { url: "https://images.unsplash.com/photo-1474511320723-9a56873867b5?w=120&h=120&fit=crop&crop=face", name: "Sly Fox" },
  { url: "https://images.unsplash.com/photo-1425082661705-1834bfd09dca?w=120&h=120&fit=crop&crop=face", name: "Hamster" },
  { url: "https://images.unsplash.com/photo-1490718720478-364a07a997cd?w=120&h=120&fit=crop&crop=face", name: "Wise Owl" },
  { url: "https://images.unsplash.com/photo-1568572933382-74d440642117?w=120&h=120&fit=crop&crop=face", name: "Corgi" },
];

const AI_DEFAULTS = [
  { display_name: "Sage", is_ai: true },
  { display_name: "Nova", is_ai: true },
];

export default function WaitingRoomAvatars({ participants = [] }) {
  const aiParticipants = participants.filter((p) => p.is_ai);
  const realParticipants = participants.filter((p) => !p.is_ai);
  const aiToShow = aiParticipants.length >= 2
    ? aiParticipants.slice(0, 2)
    : [...aiParticipants, ...AI_DEFAULTS.slice(aiParticipants.length, 2)];

  const allAvatars = [...realParticipants, ...aiToShow].slice(0, 6);

  return (
    <div className="flex items-center gap-1">
      {allAvatars.map((p, i) => {
        const animal = ANIMAL_IMAGES[i % ANIMAL_IMAGES.length];
        const imgSrc = p.avatar_url || animal.url;
        return (
          <div
            key={p.id || p.display_name || i}
            className="w-7 h-7 rounded-full overflow-hidden border-2 border-background shadow-sm flex-shrink-0"
            style={{ marginLeft: i > 0 ? "-6px" : "0" }}
            title={p.display_name || animal.name}
          >
            <img
              src={imgSrc}
              alt=""
              className="w-full h-full object-cover"
              onError={(e) => { e.target.src = animal.url; }}
            />
          </div>
        );
      })}
      {participants.length > 6 && (
        <div
          className="w-7 h-7 rounded-full bg-muted border-2 border-background flex items-center justify-center flex-shrink-0"
          style={{ marginLeft: "-6px" }}
        >
          <span className="text-[9px] font-semibold text-muted-foreground">+{participants.length - 6}</span>
        </div>
      )}
    </div>
  );
}