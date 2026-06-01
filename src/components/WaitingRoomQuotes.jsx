import { useState, useEffect } from "react";
import { Quote } from "lucide-react";

const quotes = [
  { text: "People who regularly engage in intellectual discussions report significantly higher life satisfaction.", source: "Positive Psychology Research" },
  { text: "Waiting mindfully primes your brain for richer engagement — you're not wasting time, you're preparing.", source: "Cognitive Neuroscience" },
  { text: "Discussing diverse perspectives increases creative output by up to 45%.", source: "Harvard Business Review" },
  { text: "You don't have to agree to connect. Respectful disagreement builds stronger bonds than easy consensus.", source: "Conflict Resolution Studies" },
  { text: "The mind is not a vessel to be filled, but a fire to be kindled.", source: "Plutarch" },
  { text: "We see the world not as it is, but as we are.", source: "Anaïs Nin" },
  { text: "The quality of a conversation is determined not by its length, but by its willingness to change us.", source: "Adam Grant" },
  { text: "Deep listening is the kind of attention that can genuinely change another person's day.", source: "Dialogue Research" },
  { text: "Every great conversation starts with a willingness to be surprised by someone else's perspective.", source: "Social Psychology" },
  { text: "People who feel heard are three times more likely to share genuinely — not just perform.", source: "Communication Studies" },
];

export default function WaitingRoomQuotes() {
  const [index, setIndex] = useState(() => Math.floor(Math.random() * quotes.length));
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIndex((i) => (i + 1) % quotes.length);
        setVisible(true);
      }, 400);
    }, 8000);
    return () => clearInterval(timer);
  }, []);

  const quote = quotes[index];

  return (
    <div
      className="transition-opacity duration-500"
      style={{ opacity: visible ? 1 : 0 }}
    >
      <div className="rounded-xl p-5 bg-accent/50 border border-accent">
        <div className="flex items-start gap-3">
          <Quote className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm text-foreground leading-relaxed">
              "{quote.text}"
            </p>
            <p className="text-xs text-muted-foreground mt-2">{quote.source}</p>
          </div>
        </div>
      </div>
    </div>
  );
}