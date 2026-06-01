import { BookOpen, Video, Palette, Music } from "lucide-react";

const typeConfig = {
  article: { icon: BookOpen, label: "Article" },
  video: { icon: Video, label: "Video" },
  painting: { icon: Palette, label: "Painting" },
  song: { icon: Music, label: "Song" },
};

export default function ContentDisplay({ piece }) {
  if (!piece) return null;
  const config = typeConfig[piece.type] || typeConfig.article;
  const Icon = config.icon;

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Icon className="w-4 h-4" />
        <span>{config.label}</span>
        {piece.author && <span className="text-muted-foreground/60">·</span>}
        {piece.author && <span>{piece.author}</span>}
      </div>

      {piece.image_url && (
        <div className="rounded-xl overflow-hidden bg-muted">
          <img
            src={piece.image_url}
            alt={piece.title}
            className="w-full object-cover max-h-[400px]"
          />
        </div>
      )}

      <h1 className="font-heading text-2xl md:text-3xl font-bold tracking-tight leading-tight">
        {piece.title}
      </h1>

      {piece.description && (
        <p className="text-muted-foreground leading-relaxed text-base">
          {piece.description}
        </p>
      )}

      {piece.content_body && piece.type === "article" && (
        <div className="text-foreground/85 leading-relaxed text-[15px] whitespace-pre-line">
          {piece.content_body}
        </div>
      )}

      {piece.type === "song" && piece.source_url && (
        <a
          href={piece.source_url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-primary hover:underline text-sm font-medium"
        >
          <Music className="w-4 h-4" /> Listen on external player
        </a>
      )}
    </div>
  );
}