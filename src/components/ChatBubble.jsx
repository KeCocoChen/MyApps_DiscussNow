import { Bot } from "lucide-react";

export default function ChatBubble({ message, isOwn }) {
  return (
    <div className={`flex gap-3 ${isOwn ? "justify-end" : "justify-start"}`}>
      {!isOwn && (
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-medium ${
            message.is_ai
              ? "bg-primary/10 text-primary"
              : "bg-accent text-accent-foreground"
          }`}
        >
          {message.is_ai ? (
            <Bot className="w-4 h-4" />
          ) : (
            (message.sender_name || "?")[0].toUpperCase()
          )}
        </div>
      )}
      <div className={`max-w-[75%] ${isOwn ? "items-end" : ""}`}>
        {!isOwn && (
          <p className="text-xs text-muted-foreground mb-1">
            {message.sender_name}
            {message.is_ai && (
              <span className="ml-1 text-primary/70">· AI</span>
            )}
          </p>
        )}
        <div
          className={`rounded-2xl px-4 py-2.5 ${
            isOwn
              ? "bg-primary text-primary-foreground"
              : "bg-card border border-border"
          }`}
        >
          <p className="text-sm leading-relaxed">{message.content}</p>
        </div>
      </div>
    </div>
  );
}