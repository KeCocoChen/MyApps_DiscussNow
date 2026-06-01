import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, ArrowLeft, MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";
import ChatBubble from "../components/ChatBubble";
import ParticipantList from "../components/ParticipantList";

const AI_NAMES = ["Sage", "Nova", "Echo", "Pixel", "Atlas"];

export default function DiscussionRoom() {
  const params = new URLSearchParams(window.location.search);
  const sessionId = params.get("session");
  const [message, setMessage] = useState("");
  const [user, setUser] = useState(null);
  const messagesEndRef = useRef(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    base44.auth.me().then(setUser);
  }, []);

  const { data: messages = [] } = useQuery({
    queryKey: ["messages", sessionId],
    queryFn: () =>
      base44.entities.ChatMessage.filter(
        { session_id: sessionId },
        "created_date",
        200
      ),
  });

  const { data: participants = [] } = useQuery({
    queryKey: ["participants", sessionId],
    queryFn: () =>
      base44.entities.SessionParticipant.filter({ session_id: sessionId }),
  });

  const { data: pieces = [] } = useQuery({
    queryKey: ["contentPieces"],
    queryFn: () => base44.entities.ContentPiece.list(),
  });

  const currentPiece =
    pieces.length > 0 ? pieces[Number(sessionId) % pieces.length] : null;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Real-time subscription
  useEffect(() => {
    const unsub = base44.entities.ChatMessage.subscribe((event) => {
      if (event.data?.session_id === sessionId) {
        queryClient.invalidateQueries({ queryKey: ["messages", sessionId] });
      }
    });
    return unsub;
  }, [sessionId, queryClient]);

  const sendMessage = useMutation({
    mutationFn: async (content) => {
      await base44.entities.ChatMessage.create({
        session_id: sessionId,
        sender_email: user?.email || "anon",
        sender_name: user?.full_name || "Anonymous",
        content,
        is_ai: false,
      });

      // AI responds when room is quiet (few real participants)
      const realCount = participants.filter((p) => !p.is_ai).length;
      if (realCount < 5 && messages.length % 3 === 0) {
        const aiName = AI_NAMES[messages.length % AI_NAMES.length];
        const aiResponse = await base44.integrations.Core.InvokeLLM({
          prompt: `You are "${aiName}", a thoughtful participant in a group discussion about: "${currentPiece?.title || "an interesting topic"}". Context: ${currentPiece?.description || ""}. Someone just said: "${content}". Give a brief, engaging response (1-2 sentences max). Be natural, have your own perspective, and keep the conversation flowing. Don't be generic.`,
        });
        await base44.entities.ChatMessage.create({
          session_id: sessionId,
          sender_email: `${aiName.toLowerCase()}@ai.discussnow`,
          sender_name: `${aiName} (AI)`,
          content: aiResponse,
          is_ai: true,
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["messages", sessionId] });
    },
  });

  const handleSend = () => {
    if (!message.trim()) return;
    sendMessage.mutate(message);
    setMessage("");
  };

  return (
    <div className="h-[calc(100vh-3.5rem)] flex">
      {/* Chat area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="border-b border-border/60 px-4 py-3 flex items-center gap-3 bg-card/50 backdrop-blur-sm">
          <Link
            to="/"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="min-w-0">
            <h2 className="font-heading font-semibold text-sm truncate">
              {currentPiece?.title || "Discussion Room"}
            </h2>
            <p className="text-xs text-muted-foreground">
              {participants.length} participant
              {participants.length !== 1 && "s"}
            </p>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
          {messages.length === 0 && (
            <div className="text-center py-20 space-y-3">
              <MessageCircle className="w-8 h-8 mx-auto text-muted-foreground/30" />
              <p className="text-muted-foreground">
                Be the first to share your thoughts.
              </p>
            </div>
          )}
          {messages.map((msg) => (
            <ChatBubble
              key={msg.id}
              message={msg}
              isOwn={msg.sender_email === user?.email}
            />
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="border-t border-border/60 p-4 bg-card/50 backdrop-blur-sm">
          <div className="flex gap-2 max-w-3xl mx-auto">
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Share your thoughts..."
              onKeyDown={(e) =>
                e.key === "Enter" && !e.shiftKey && handleSend()
              }
              className="flex-1 bg-background"
            />
            <Button
              onClick={handleSend}
              size="icon"
              disabled={!message.trim() || sendMessage.isPending}
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <div className="hidden md:block w-64 border-l border-border/60 bg-card/30">
        <ParticipantList participants={participants} />
      </div>
    </div>
  );
}