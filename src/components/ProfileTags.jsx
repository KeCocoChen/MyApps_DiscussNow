import { cn } from "@/lib/utils";

const ALL_TAGS = [
  "curious", "contrarian", "listener", "storyteller",
  "analyst", "empath", "provocateur", "dreamer",
  "skeptic", "optimist", "introvert", "extrovert",
];

export default function ProfileTags({ selected, onChange, maxTags }) {
  const toggle = (tag) => {
    if (selected.includes(tag)) {
      onChange(selected.filter((t) => t !== tag));
    } else if (selected.length < maxTags) {
      onChange([...selected, tag]);
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      {ALL_TAGS.map((tag) => {
        const active = selected.includes(tag);
        const atLimit = !active && selected.length >= maxTags;
        return (
          <button
            key={tag}
            onClick={() => toggle(tag)}
            disabled={atLimit}
            className={cn(
              "px-3 py-1 rounded-full text-xs font-medium border transition-all",
              active
                ? "bg-primary text-primary-foreground border-primary"
                : atLimit
                ? "border-border text-muted-foreground/40 cursor-not-allowed"
                : "border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"
            )}
          >
            {tag}
          </button>
        );
      })}
    </div>
  );
}