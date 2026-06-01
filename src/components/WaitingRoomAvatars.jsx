// Small round profile avatars shown near the article — no names, no labels
const ANIMAL_IMAGES = [
  { url: "https://media.giphy.com/media/JIX9t2j0ZTN9S/giphy.gif",        name: "Blinking Cat" },
  { url: "https://media.giphy.com/media/3oriO0OEd9QIDdllqo/giphy.gif",   name: "Golden Pup" },
  { url: "https://media.giphy.com/media/oCjCjgplMHDVi/giphy.gif",        name: "Curious Fox" },
  { url: "https://media.giphy.com/media/VbEloWwOz3QqYBsqIZ/giphy.gif",   name: "Hamster" },
  { url: "https://media.giphy.com/media/26ufjzujCjKIjPt4A/giphy.gif",    name: "Wise Owl" },
  { url: "https://media.giphy.com/media/RQSuZfuylVNAY/giphy.gif",        name: "Baby Bear" },
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