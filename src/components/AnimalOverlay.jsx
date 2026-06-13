import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

// All 4 verified: real photo animal, animated GIF, transparent background
const ANIMALS = [
  { gif: "https://media2.giphy.com/media/rrasLFSTyi4Th1e8Xo/giphy.gif",  name: "Cat",    delay: 0   },
  { gif: "https://media2.giphy.com/media/3og0IJHMqlmPzy7sGs/giphy.gif",  name: "Chewy",  delay: 0.4 },
  { gif: "https://media2.giphy.com/media/cswKtqXhBDTJZCp6yJ/giphy.gif",  name: "Rigley", delay: 0.8 },
  { gif: "https://media3.giphy.com/media/YTEHHsDnIzuPA7hd7Z/giphy.gif",  name: "Shiba",  delay: 0.2 },
];

// The two AI chatbots always present in the room
const AI_BOTS = [
  {
    name: "Sage",
    animal: ANIMALS[0],
    seat: { bottom: "4%", left: "8%", size: 150 },
    bio: "A deep thinker who loves exploring ideas from multiple angles. Asks the questions others are afraid to.",
    trait: "Philosopher",
    mood: "Contemplative",
  },
  {
    name: "Nova",
    animal: ANIMALS[3],
    seat: { bottom: "4%", left: "72%", size: 145 },
    bio: "Curious and enthusiastic. Always learning, always connecting dots you didn't know existed.",
    trait: "Curious Mind",
    mood: "Energetic",
  },
];

// Human participant seats (middle two)
const HUMAN_SEATS = [
  { bottom: "5%", left: "30%", size: 140 },
  { bottom: "5%", left: "52%", size: 135 },
];

function AIProfileCard({ bot }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8, scale: 0.95 }}
      transition={{ duration: 0.15 }}
      className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-48 z-20"
    >
      <div
        className="rounded-xl p-3 text-left shadow-2xl border border-white/20"
        style={{ background: "rgba(10,14,20,0.88)", backdropFilter: "blur(12px)" }}
      >
        <div className="flex items-center gap-2 mb-2">
          <div className="w-7 h-7 rounded-full bg-primary/30 flex items-center justify-center text-xs font-bold text-primary">
            AI
          </div>
          <div>
            <p className="text-white text-sm font-semibold leading-none">{bot.name}</p>
            <p className="text-primary text-[10px] mt-0.5">{bot.trait}</p>
          </div>
        </div>
        <p className="text-white/70 text-[11px] leading-relaxed mb-2">{bot.bio}</p>
        <div className="flex items-center gap-1">
          <span className="text-[10px] text-white/40">Mood:</span>
          <span className="text-[10px] text-white/70">{bot.mood}</span>
        </div>
      </div>
      {/* Arrow */}
      <div className="w-2 h-2 bg-black/80 rotate-45 mx-auto -mt-1 border-r border-b border-white/10" />
    </motion.div>
  );
}

function AISlot({ bot }) {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      className="absolute flex flex-col items-center cursor-pointer"
      style={{ bottom: bot.seat.bottom, left: bot.seat.left, zIndex: 5 }}
      animate={{ y: [0, -6, 0] }}
      transition={{ duration: 3.0, repeat: Infinity, ease: "easeInOut", delay: bot.animal.delay }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="relative flex flex-col items-center">
        <AnimatePresence>
          {hovered && <AIProfileCard bot={bot} />}
        </AnimatePresence>

        {/* Name tag */}
        <span
          className="text-sm font-black text-white mb-1"
          style={{ fontFamily: "Georgia, serif", letterSpacing: "0.02em", textShadow: "0 1px 6px rgba(0,0,0,0.8)" }}
        >
          {bot.name}
        </span>

        {/* Animal GIF */}
        <img
          src={bot.animal.gif}
          alt={bot.name}
          style={{
            width: bot.seat.size,
            height: bot.seat.size,
            objectFit: "contain",
            filter: "drop-shadow(0 6px 18px rgba(0,0,0,0.45)) sepia(0.15) saturate(1.1)",
          }}
        />
      </div>
    </motion.div>
  );
}

export default function AnimalOverlay({ participants = [] }) {
  const realParticipants = participants.filter((p) => !p.is_ai).slice(0, 2);

  return (
    <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 5 }}>
      {/* Always-present AI bots */}
      {AI_BOTS.map((bot) => (
        <div key={bot.name} style={{ pointerEvents: "auto" }}>
          <AISlot bot={bot} />
        </div>
      ))}

      {/* Human participants in middle seats */}
      {realParticipants.map((p, i) => {
        const seat = HUMAN_SEATS[i];
        const animal = ANIMALS[(i + 1) % ANIMALS.length];
        const imgSrc = p.avatar_url ? p.avatar_url : animal.gif;
        const isAnimal = !p.avatar_url;

        return (
          <motion.div
            key={p.id || p.display_name || i}
            className="absolute flex flex-col items-center"
            style={{ bottom: seat.bottom, left: seat.left, zIndex: 5 }}
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 3.0, repeat: Infinity, ease: "easeInOut", delay: animal.delay }}
          >
            <span
              className="text-sm font-black text-white mb-1"
              style={{ fontFamily: "Georgia, serif", letterSpacing: "0.02em", textShadow: "0 1px 6px rgba(0,0,0,0.8)" }}
            >
              {(p.display_name || "Guest").split(" ")[0]}
            </span>
            {isAnimal ? (
              <img
                src={imgSrc}
                alt={p.display_name}
                style={{
                  width: seat.size,
                  height: seat.size,
                  objectFit: "contain",
                  filter: "drop-shadow(0 6px 18px rgba(0,0,0,0.45)) sepia(0.15) saturate(1.1)",
                }}
              />
            ) : (
              <div
                className="rounded-full overflow-hidden border-2 border-white/70 shadow-xl"
                style={{ width: seat.size * 0.7, height: seat.size * 0.7 }}
              >
                <img src={imgSrc} alt={p.display_name} className="w-full h-full object-cover" />
              </div>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}