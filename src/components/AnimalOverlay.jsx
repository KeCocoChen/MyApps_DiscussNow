import { motion } from "framer-motion";

// Popular animals with white/light backgrounds — mix-blend-mode multiply removes the bg
const ANIMALS = [
  { gif: "https://media.giphy.com/media/JIX9t2j0ZTN9S/giphy.gif",        name: "Cat",         delay: 0   },
  { gif: "https://media.giphy.com/media/3oKIPnAiaMCws8nOsE/giphy.gif",   name: "Golden",      delay: 0.4 },
  { gif: "https://media.giphy.com/media/ICOgUNjpvO0PC/giphy.gif",        name: "Bunny",       delay: 0.8 },
  { gif: "https://media.giphy.com/media/xT0GqtpF1NWd9HHHzm/giphy.gif",   name: "Puppy",       delay: 0.2 },
];

// Positions on screen that correspond to where furniture would be in a cozy living room/cabin
// Adjust bottom/left values to suit the background image layout
const SEATS = [
  { bottom: "18%", left: "5%",  size: 120 },   // left side of couch
  { bottom: "22%", left: "40%", size: 130 },   // center couch
  { bottom: "10%", left: "62%", size: 110 },   // carpet / floor right
  { bottom: "8%",  left: "20%", size: 100 },   // floor left
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
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 2.8 + i * 0.4, repeat: Infinity, ease: "easeInOut", delay: animal.delay }}
          >
            {/* Name tag */}
            <span
              className="text-[10px] font-bold text-white mb-1 px-1.5 py-0.5 rounded bg-black/40 backdrop-blur-sm"
              style={{ textShadow: "0 1px 4px rgba(0,0,0,1)" }}
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
                  mixBlendMode: "multiply",
                  filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.5))",
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