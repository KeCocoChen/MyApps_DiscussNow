import { useState, useEffect } from "react";

function getMinsLeft() {
  const interval = 30 * 60 * 1000;
  return Math.max(1, Math.ceil((Math.ceil(Date.now() / interval) * interval - Date.now()) / 60000));
}

const ANIMAL_IMAGES = [
  { url: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=200&h=200&fit=crop", name: "Doge" },
  { url: "https://images.unsplash.com/photo-1574158622682-e40e69881006?w=200&h=200&fit=crop", name: "Grumpy" },
  { url: "https://images.unsplash.com/photo-1474511320723-9a56873867b5?w=200&h=200&fit=crop", name: "Sly Fox" },
  { url: "https://images.unsplash.com/photo-1425082661705-1834bfd09dca?w=200&h=200&fit=crop", name: "Hamster" },
  { url: "https://images.unsplash.com/photo-1490718720478-364a07a997cd?w=200&h=200&fit=crop", name: "Wise Owl" },
  { url: "https://images.unsplash.com/photo-1568572933382-74d440642117?w=200&h=200&fit=crop", name: "Corgi" },
  { url: "https://images.unsplash.com/photo-1533738363-b7f9aef128ce?w=200&h=200&fit=crop", name: "Cat" },
  { url: "https://images.unsplash.com/photo-1564349683136-77e08dba1ef7?w=200&h=200&fit=crop", name: "Panda" },
];

const AI_DEFAULTS = [
  { display_name: "Sage (AI)", is_ai: true },
  { display_name: "Nova (AI)", is_ai: true },
];

export default function WaitingRoomAvatars({ participants = [] }) {
  const [mins, setMins] = useState(getMinsLeft());
  useEffect(() => {
    const t = setInterval(() => setMins(getMinsLeft()), 10000);
    return () => clearInterval(t);
  }, []);

  const aiParticipants = participants.filter((p) => p.is_ai);
  const realParticipants = participants.filter((p) => !p.is_ai);

  const aiToShow = aiParticipants.length >= 2
    ? aiParticipants.slice(0, 3)
    : [...aiParticipants, ...AI_DEFAULTS.slice(aiParticipants.length, 2)];

  const allAvatars = [...realParticipants, ...aiToShow];
  const totalCount = Math.max(allAvatars.length, 2);
  const gridItems = allAvatars.slice(0, 4);

  const gridClass =
    gridItems.length === 1 ? "grid-cols-1" :
    gridItems.length === 2 ? "grid-cols-2" :
    "grid-cols-2";

  return (
    <div className="flex flex-col items-center gap-4">
      <div className={`grid ${gridClass} gap-1.5`}>
        {gridItems.map((p, i) => {
          const animal = ANIMAL_IMAGES[i % ANIMAL_IMAGES.length];
          const imgSrc = p.avatar_url || animal.url;
          const label = p.is_ai ? animal.name : (p.display_name || "").slice(0, 8);
          return (
            <div
              key={p.id || p.display_name || i}
              className="relative w-16 h-16 rounded-xl overflow-hidden bg-stone-100 shadow-sm"
              title={p.display_name}
            >
              <img
                src={imgSrc}
                alt={label}
                className="w-full h-full object-cover"
                onError={(e) => { e.target.src = animal.url; }}
              />
              <div className="absolute bottom-0 inset-x-0 bg-black/40 px-1 py-0.5">
                <p className="text-white text-[9px] font-medium text-center truncate leading-tight">{label}</p>
              </div>
            </div>
          );
        })}
        {allAvatars.length > 4 && (
          <div className="w-16 h-16 rounded-xl bg-stone-100 flex items-center justify-center shadow-sm">
            <span className="text-stone-500 text-xs font-semibold">+{allAvatars.length - 4}</span>
          </div>
        )}
      </div>

      <p className="text-sm text-center text-foreground leading-snug max-w-xs font-body">
        <span className="font-semibold">{totalCount} people</span> are in the waiting room — ready to discuss with you in{" "}
        <span className="font-semibold">{mins} min</span>.
      </p>
    </div>
  );
}