import { useState, useEffect } from "react";
import { Clock } from "lucide-react";

function getTimeLeft() {
  const interval = 30 * 60 * 1000;
  const now = Date.now();
  return Math.max(0, Math.ceil(now / interval) * interval - now);
}

export default function SessionTimer({ format = "full" }) {
  const [timeLeft, setTimeLeft] = useState(getTimeLeft());

  useEffect(() => {
    const timer = setInterval(() => setTimeLeft(getTimeLeft()), 1000);
    return () => clearInterval(timer);
  }, []);

  const mins = Math.floor(timeLeft / 60000);
  const secs = Math.floor((timeLeft % 60000) / 1000);

  if (format === "mins") {
    return <span>{mins} min</span>;
  }

  return (
    <span className="font-mono tabular-nums">
      {mins}:{secs.toString().padStart(2, "0")}
    </span>
  );
}