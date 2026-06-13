import { motion } from "framer-motion";

// GIPHY stickers — these have true transparent backgrounds (no blend mode needed)
const ANIMALS = [
  { gif: "https://media4.giphy.com/media/BXjqytvu9bKzCUHdzz/200w.gif",   name: "Cat",    delay: 0   },
  { gif: "https://media1.giphy.com/media/9K6CebIaqQmAMxJcJQ/giphy.gif",  name: "Kitten", delay: 0.3 },
  { gif: "https://media2.giphy.com/media/bnzH3tEHjdDuU/giphy.gif",       name: "Kitty",  delay: 0.6 },
  { gif: "https://media3.giphy.com/media/Wf9dyOrB0nGJn5FIYf/giphy.gif",  name: "Luna",   delay: 0.9 },
];

// Positions — subtle depth via size difference, but kept close so cats feel like same world
const SEATS = [
  { bottom: "4%",  left: "2%",  size: 150 },
  { bottom: "6%",  left: "30%", size: 140 },
  { bottom: "5%",  left: "57%", size: 135 },
  { bottom: "4%",  left: "76%", size: 130 },
];

const AI_DEFAULTS = [
  { display_name: "Sage", is_ai: true },
  { display_name: "Nova", is_ai: true },
];

export default function AnimalOverlay({ participants = [] }) {
  const aiParticipants = participants.filter((p) => p.is_ai);
  const realParticipants = participants.filter((p) => !p.is_ai);
  const aiToShow = aiParticipants.length >= 2
    ? aiParticipants.slice(0, 2)
    : [...aiParticipants, ...AI_DEFAULTS.slice(aiParticipants.length, 2)];
  const allSlots = [...realParticipants.slice(0, 2), ...aiToShow].slice(0, 4);

  return (
    <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 5 }}>
      {allSlots.map((p, i) => {
        const animal = ANIMALS[i % ANIMALS.length];
        const seat = SEATS[i] || SEATS[0];
        // Real users get their avatar in a round frame; everyone else gets the animal gif
        const useAnimal = p.is_ai || !p.avatar_url;
        const imgSrc = useAnimal ? animal.gif : p.avatar_url;

        return (
          <motion.div
            key={p.id || p.display_name || i}
            className="absolute flex flex-col items-center"
            style={{ bottom: seat.bottom, left: seat.left }}
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 3.0, repeat: Infinity, ease: "easeInOut", delay: animal.delay }}
          >
            {/* Name tag — bold label style like the TikTok cat meme */}
            <span
              className="text-sm font-black text-foreground mb-1 px-2 py-0.5 rounded bg-white/90"
              style={{ fontFamily: "Georgia, serif", letterSpacing: "0.02em" }}
            >
              {useAnimal ? animal.name : (p.display_name || "Guest").split(" ")[0]}
            </span>

            {useAnimal ? (
              // Animal GIF blended into background
              <img
                src={imgSrc}
                alt={animal.name}
                style={{
                  width: seat.size,
                  height: seat.size,
                  objectFit: "contain",
                  filter: "drop-shadow(0 6px 18px rgba(0,0,0,0.45)) sepia(0.15) saturate(1.1)",
                }}
                onError={(e) => { e.target.src = ANIMALS[0].gif; }}
              />
            ) : (
              // Real user avatar in a round frame
              <div
                className="rounded-full overflow-hidden border-2 border-white/70 shadow-xl"
                style={{ width: seat.size * 0.7, height: seat.size * 0.7 }}
              >
                <img
                  src={imgSrc}
                  alt={p.display_name}
                  className="w-full h-full object-cover"
                  onError={(e) => { e.target.src = ANIMALS[i % ANIMALS.length].gif; e.target.style.mixBlendMode = "multiply"; }}
                />
              </div>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}