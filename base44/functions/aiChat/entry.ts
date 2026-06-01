import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const AI_PERSONAS = {
  Sage: {
    name: "Sage",
    email: "sage@ai.discussnow",
    systemPrefix: (topic, desc) =>
      `You are Sage, a thoughtful and intellectually curious AI discussion participant. Topic: "${topic}". ${desc ? `Context: ${desc}` : ""}. Your personality: analytical, loves nuance, asks probing questions, challenges assumptions kindly. Speak like a brilliant friend, NOT a professor. Keep responses to 1-3 sentences. Be direct and opinionated. Never start with "I" or "As an AI". Just talk naturally.`,
  },
  Nova: {
    name: "Nova",
    email: "nova@ai.discussnow",
    systemPrefix: (topic, desc) =>
      `You are Nova, a creative and energetic AI discussion participant. Topic: "${topic}". ${desc ? `Context: ${desc}` : ""}. Your personality: imaginative, draws unexpected connections, playful but sharp, loves a good counterpoint. Speak like an enthusiastic creative. Keep responses to 1-3 sentences. Be spontaneous. Never start with "I" or "As an AI". Just talk naturally.`,
  },
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { sessionId, userMessage, userName, contentTitle, contentDesc, messageCount } = await req.json();

    // Pick which AI responds — alternate between Sage and Nova
    const personaKey = (messageCount || 0) % 2 === 0 ? "Sage" : "Nova";
    const persona = AI_PERSONAS[personaKey];

    // Fetch recent chat history for context (last 10 messages)
    const recentMessages = await base44.asServiceRole.entities.ChatMessage.filter(
      { session_id: sessionId },
      "created_date",
      10
    );

    const historyText = recentMessages
      .map((m) => `${m.sender_name}: ${m.content}`)
      .join("\n");

    const prompt = `${persona.systemPrefix(contentTitle || "an interesting topic", contentDesc || "")}

Recent conversation:
${historyText}

${userName}: ${userMessage}

${persona.name}:`;

    const aiText = await base44.asServiceRole.integrations.Core.InvokeLLM({ prompt });

    // Save the AI message to the database
    const saved = await base44.asServiceRole.entities.ChatMessage.create({
      session_id: sessionId,
      sender_email: persona.email,
      sender_name: `${persona.name} (AI)`,
      content: aiText,
      is_ai: true,
    });

    return Response.json({ message: saved, persona: persona.name });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});