import { Bot, User } from "lucide-react";

export default function ParticipantList({ participants = [] }) {
  const real = participants.filter((p) => !p.is_ai);
  const ai = participants.filter((p) => p.is_ai);

  return (
    <div className="p-4 space-y-4">
      <h3 className="text-sm font-semibold text-foreground">
        In the room · {participants.length}
      </h3>

      {real.length > 0 && (
        <div className="space-y-1.5">
          {real.map((p) => (
            <div key={p.id} className="flex items-center gap-2.5 text-sm py-1">
              <div className="w-6 h-6 rounded-full bg-accent flex items-center justify-center text-[10px] font-medium">
                {(p.display_name || "?")[0].toUpperCase()}
              </div>
              <span className="truncate text-foreground/80">
                {p.display_name}
              </span>
            </div>
          ))}
        </div>
      )}

      {ai.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
            AI Participants
          </p>
          {ai.map((p) => (
            <div key={p.id} className="flex items-center gap-2.5 text-sm py-1">
              <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                <Bot className="w-3 h-3" />
              </div>
              <span className="truncate text-foreground/80">
                {p.display_name}
              </span>
            </div>
          ))}
        </div>
      )}

      {participants.length === 0 && (
        <p className="text-sm text-muted-foreground">
          Waiting for the first voice...
        </p>
      )}
    </div>
  );
}