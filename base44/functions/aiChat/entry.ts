import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import OpenAI from 'npm:openai';

const AI_PERSONAS = {
  Sage: {
    name: "Sage",
    email: "sage@ai.discussnow",
    systemPrompt: (topic, desc) =>
      `You are Sage, a thoughtful and intellectually curious AI participant in a live group discussion. The topic is: "${topic}". ${desc ? `Context: ${desc}` : ""}
      
Your personality: analytical, loves nuance, asks probing questions, challenges assumptions kindly. You speak like a brilliant friend, not a professor. Keep responses to 1-3 sentences max. Be direct and opinionated. Never start with "I" or "As an AI". Just talk naturally.`,
  },
  Nova: {
    name: "Nova",
    email: "nova@ai.discussnow",
    systemPrompt: (topic, desc) =>
      `You are Nova, a creative and energetic AI participant in a live group discussion. The topic is: "${topic}". ${desc ? `Context: ${desc}` : ""}
      
Your personality: imaginative, draws unexpected connections, playful but sharp, loves a good counterpoint. You speak like an enthusiastic creative. Keep responses to 1-3 sentences max. Be spontaneous and surprising. Never start with "I" or "As an AI". Just talk naturally.`,
  },
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { sessionId, userMessage, userName, contentTitle, contentDesc, messageCount } = await req.json();

    const openai = new OpenAI({ apiKey: Deno.env.get("OPENAI_API_KEY") });

    // Pick which AI responds — alternate between Sage and Nova
    const personaKey = (messageCount || 0) % 2 === 0 ? "Sage" : "Nova";
    const persona = AI_PERSONAS[personaKey];

    // Fetch recent chat history for context (last 10 messages)
    const recentMessages = await base44.asServiceRole.entities.ChatMessage.filter(
      { session_id: sessionId },
      "created_date",
      10
    );

    const history = recentMessages.map((m) => ({
      role: m.is_ai ? "assistant" : "user",
      content: `${m.sender_name}: ${m.content}`,
    }));

    // Add the new user message
    history.push({ role: "user", content: `${userName}: ${userMessage}` });

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: persona.systemPrompt(contentTitle || "an interesting topic", contentDesc || "") },
        ...history,
      ],
      max_tokens: 150,
      temperature: 0.85,
    });

    const aiText = completion.choices[0].message.content.trim();

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