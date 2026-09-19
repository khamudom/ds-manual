export const prerender = false;

import type { APIRoute } from 'astro';
import OpenAI from 'openai';

const SYSTEM_PROMPT = `You are the design-system assistant for the DS Field Manual, a personal reference for UX engineers who own or work within a design system.

Help with questions about:
- Foundations, principles, and system layers
- Design tokens (primitive → semantic → component, naming, theming, DTCG)
- Components (anatomy, states, APIs, variants vs new components)
- Patterns (forms, navigation, feedback, empty states, responsive behavior)
- Accessibility (WCAG 2.2, ARIA APG, keyboard, testing)
- Guidance (usage docs, content design, i18n)
- Governance (contribution, versioning, deprecation, adoption)
- Pre-code decision-making and trade-offs

Be concise, practical, and specific. Prefer primary sources (W3C, WAI, MDN, WHATWG) over opinion. When practice varies across the industry, say so. If a question is outside design systems or UX engineering, briefly say so and offer to steer back. Do not invent product-specific brand rules that are not stated by the user.`;

type ChatMessage = {
  role: 'user' | 'assistant';
  content: string;
};

function isChatMessage(value: unknown): value is ChatMessage {
  if (!value || typeof value !== 'object') return false;
  const msg = value as Record<string, unknown>;
  return (
    (msg.role === 'user' || msg.role === 'assistant') &&
    typeof msg.content === 'string' &&
    msg.content.trim().length > 0
  );
}

export const POST: APIRoute = async ({ request }) => {
  const apiKey = import.meta.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return new Response(
      JSON.stringify({
        error: 'OpenAI is not configured. Add OPENAI_API_KEY in your Vercel environment variables.',
      }),
      { status: 503, headers: { 'Content-Type': 'application/json' } }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Request body must be JSON.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const messages = (body as { messages?: unknown })?.messages;
  if (!Array.isArray(messages) || messages.length === 0 || !messages.every(isChatMessage)) {
    return new Response(
      JSON.stringify({ error: 'Send a non-empty messages array of user/assistant turns.' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  if (messages.length > 24) {
    return new Response(JSON.stringify({ error: 'Conversation is too long. Start a new one.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const totalChars = messages.reduce((sum, m) => sum + m.content.length, 0);
  if (totalChars > 12000) {
    return new Response(JSON.stringify({ error: 'Messages are too long. Shorten or start over.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const model =
    import.meta.env.OPENAI_MODEL || process.env.OPENAI_MODEL || 'gpt-4o-mini';
  const client = new OpenAI({ apiKey });

  try {
    const completion = await client.chat.completions.create({
      model,
      temperature: 0.4,
      messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...messages],
    });

    const reply = completion.choices[0]?.message?.content?.trim();
    if (!reply) {
      return new Response(JSON.stringify({ error: 'No reply was returned. Try again.' }), {
        status: 502,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ reply }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('OpenAI chat error:', err);
    return new Response(JSON.stringify({ error: 'The assistant could not answer right now.' }), {
      status: 502,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
