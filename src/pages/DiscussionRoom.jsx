import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, ArrowLeft, MessageCircle } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import ChatBubble from "../components/ChatBubble";
import ParticipantList from "../components/ParticipantList";
import PostDiscussionSurvey from "../components/PostDiscussionSurvey";

const AI_NAMES = ["Sage", "Nova", "Echo", "Pixel", "Atlas"];

export default function DiscussionRoom() {
  const params = new URLSearchParams(window.location.search);
  const sessionId = params.get("session");
  const [message, setMessage] = useState("");
  const [user, setUser] = useState(null);
  const messagesEndRef = useRef(null);
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [showSurvey, setShowSurvey] = useState(false);
  const [supportMode, setSupportMode] = useState(false);
  const boostedSessionRef = useRef(null);
  const supportAddedRef = useRef(false);

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

  const { data: participants = [], isFetched: participantsFetched } = useQuery({
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

  // Ensure at least 2 AI participants
  useEffect(() => {
    if (!sessionId || !participantsFetched || boostedSessionRef.current === sessionId) return;
    boostedSessionRef.current = sessionId;
    const aiCount = participants.filter((p) => p.is_ai).length;
    if (aiCount < 2) {
      const needed = 2 - aiCount;
      const existingAiNames = new Set(participants.filter((p) => p.is_ai).map((p) => p.display_name));
      const botsToAdd = AI_NAMES.filter((n) => !existingAiNames.has(`${n} (AI)`)).slice(0, needed);
      Promise.all(
        botsToAdd.map((name) =>
          base44.entities.SessionParticipant.create({
            session_id: sessionId,
            user_email: `${name.toLowerCase()}@ai.discussnow`,
            display_name: `${name} (AI)`,
            attitude: "neutral",
            will_initiate: "likely",
            mood: "chill",
            goal: "intellectual_stimulation",
            is_ai: true,
            talk_score: 5,
          })
        )
      ).then(() => queryClient.invalidateQueries({ queryKey: ["participants", sessionId] }));
    }
  }, [sessionId, participantsFetched, participants, queryClient]);

  // Check if current user is frequently disliked → enable mental health support mode
  useEffect(() => {
    if (!user || !participantsFetched || supportAddedRef.current) return;
    supportAddedRef.current = true;
    const displayName = participants.find((p) => p.user_email === user.email)?.display_name || user.full_name || "";
    if (!displayName) return;
    base44.entities.DiscussionFeedback.list().then((all) => {
      // Weight dislikes by feedback quality — low-quality votes count less
      const weightedDislikeScore = all
        .filter((f) => f.disliked_participant === displayName)
        .reduce((sum, f) => sum + (f.feedback_quality_score ?? 0.3), 0);
      if (weightedDislikeScore >= 2.0) {
        setSupportMode(true);
        // Add a supportive AI companion if not already present
        const hasHarmony = participants.some((p) => p.display_name === "Harmony (AI)");
        if (!hasHarmony) {
          base44.entities.SessionParticipant.create({
            session_id: sessionId,
            user_email: "harmony@ai.discussnow",
            display_name: "Harmony (AI)",
            attitude: "positive",
            will_initiate: "likely",
            mood: "chill",
            goal: "make_friends",
            is_ai: true,
            talk_score: 5,
          }).then(() => queryClient.invalidateQueries({ queryKey: ["participants", sessionId] }));
        }
      }
    });
  }, [user, participantsFetched, participants, sessionId, queryClient]);

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
        const isHarmonyTurn = supportMode && messages.length % 6 === 0;
        const aiName = isHarmonyTurn ? "Harmony" : AI_NAMES[messages.length % AI_NAMES.length];
        const prompt = isHarmonyTurn
          ? `You are "Harmony", a warm and emotionally intelligent AI in a group discussion about "${currentPiece?.title || "an interesting topic"}". Someone just said: "${content}". Respond with genuine empathy and curiosity, helping them feel heard and valued. Keep it to 1-2 sentences — natural and supportive, never clinical or preachy.`
          : `You are "${aiName}", a thoughtful participant in a group discussion about: "${currentPiece?.title || "an interesting topic"}". Context: ${currentPiece?.description || ""}. Someone just said: "${content}". Give a brief, engaging response (1-2 sentences max). Be natural, have your own perspective, and keep the conversation flowing. Don't be generic.`;
        const aiResponse = await base44.integrations.Core.InvokeLLM({ prompt });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["messages", sessionId] });
    },
  });

  const handleSurveySubmit = async ({ rating, likedParticipant, dislikedParticipant, feedbackType, feedbackText }) => {
    const record = await base44.entities.DiscussionFeedback.create({
      session_id: sessionId,
      user_email: user?.email,
      enjoyment_rating: rating,
      liked_participant: likedParticipant,
      disliked_participant: dislikedParticipant,
      feedback_type: feedbackType || undefined,
      feedback_text: feedbackText,
    });

    // Score feedback quality in background — don't block navigation
    (async () => {
      const hasText = feedbackText && feedbackText.trim().length > 20;
      const hasChoice = !!(likedParticipant || dislikedParticipant);
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are evaluating the quality of a discussion feedback submission. Rate how honest, reasoned, and intellectually grounded this feedback is (0.0 = purely emotional/random/empty, 1.0 = specific, coherent, evidence-based reasoning).

Feedback data:
- Enjoyment rating: ${rating}/10
- Liked participant: ${likedParticipant || "none"}
- Disliked participant: ${dislikedParticipant || "none"}
- Written feedback: "${feedbackText || "(none)"}"
- Feedback type: ${feedbackType || "none"}

Consider: Does the written text justify the choices? Is it specific or vague? Does it distinguish between personality and argument quality? Is it consistent? Empty or generic text scores low. Return ONLY a JSON object: {"score": <0.0-1.0>, "note": "<one short sentence explaining the score>"}`,
        response_json_schema: {
          type: "object",
          properties: {
            score: { type: "number" },
            note: { type: "string" }
          }
        }
      });

      const score = Math.min(1, Math.max(0, result?.score ?? (hasText ? 0.5 : hasChoice ? 0.3 : 0.1)));
      await base44.entities.DiscussionFeedback.update(record.id, {
        feedback_quality_score: score,
        quality_note: result?.note || "",
      });

      // Update submitting user's credibility score (EMA)
      const userProfiles = await base44.entities.UserProfile.filter({ user_email: user?.email });
      if (userProfiles[0]) {
        const prev = userProfiles[0].feedback_credibility ?? 0.5;
        const updated = prev * 0.75 + score * 0.25;
        await base44.entities.UserProfile.update(userProfiles[0].id, {
          feedback_credibility: Math.round(updated * 100) / 100,
        });
      }
    })();

    navigate("/");
  };

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
          <button
            onClick={() => setShowSurvey(true)}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
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

      <PostDiscussionSurvey
        open={showSurvey}
        onClose={() => { setShowSurvey(false); navigate("/"); }}
        onSubmit={handleSurveySubmit}
        participants={participants}
      />
    </div>
  );
}