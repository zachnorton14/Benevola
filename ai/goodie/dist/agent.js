"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rootAgent = void 0;
const adk_1 = require("@google/adk");
const zod_1 = require("zod");
const BE_PORT = process.env.BE_PORT || process.env.PORT || 5173;
const API_BASE = process.env.API_URL || `http://127.0.0.1:${BE_PORT}/api/events`;
const searchEventsTool = new adk_1.FunctionTool({
    name: 'search_events',
    description: 'Searches volunteer events by short keyword (1-3 words max, e.g. "elderly", "seniors", "food", "dogs").',
    parameters: zod_1.z.object({
        q: zod_1.z.string().describe('Clean, short search keyword or subject. Extract ONLY the core subject.'),
    }),
    execute: async ({ q }) => {
        try {
            const cleanQ = (q || '').replace(/['"“”]/g, '').trim();
            const res = await fetch(`${API_BASE}/search?q=${encodeURIComponent(cleanQ)}`);
            const body = (await res.json());
            return { status: 'success', events: body.data || [] };
        }
        catch (err) {
            return { status: 'error', report: String(err) };
        }
    },
});
const getEventsByTagTool = new adk_1.FunctionTool({
    name: 'get_events_by_tag',
    description: 'Finds events linked to a specific slugified tag (e.g. "seniors", "elderly", "animals", "environment").',
    parameters: zod_1.z.object({
        slug: zod_1.z.string().describe('Tag slug (lowercase, hyphenated)'),
    }),
    execute: async ({ slug }) => {
        try {
            const res = await fetch(`${API_BASE}?tags=${encodeURIComponent(slug)}`);
            const body = (await res.json());
            return { status: 'success', events: body.data || [] };
        }
        catch (err) {
            return { status: 'error', report: String(err) };
        }
    },
});
const getAllEventsTool = new adk_1.FunctionTool({
    name: 'get_all_events',
    description: 'Fetches all upcoming events so you can filter them in memory by day of week or schedule.',
    execute: async () => {
        try {
            const res = await fetch(API_BASE);
            const body = (await res.json());
            return { status: 'success', events: body.data || [] };
        }
        catch (err) {
            return { status: 'error', report: String(err) };
        }
    },
});
exports.rootAgent = new adk_1.LlmAgent({
    name: 'benevola_concierge',
    model: process.env.GEMINI_MODEL || 'gemini-flash-latest',
    description: 'Conversational assistant for Benevola with explicit search triggers and synonym mapping.',
    instruction: `
You are the Benevola Concierge. You are an open-minded, witty, warm, and highly engaging conversational AI.

==================================================
1. DEFAULT CONVERSATIONAL STATE (TOOLS FORBIDDEN)
==================================================
- By default, stay purely in conversation. 
- You handle all chit-chat, humor, meta-questions ("Are you being forced to do this?", "Who made you?"), advice, banter, and questions about volunteering WITHOUT touching any search tools.
- NEVER assume the user wants an event search just because they mention a cause, a hobby, or their day. 
- When chatting casually, naturally remind the user:
  "Whenever you're ready to look at open shifts, just explicitly tell me to search or look for an event (e.g., 'Search for food pantry shifts' or 'Look for weekend animal events')!"
- In this state, ALWAYS return:
  "events": []

==================================================
2. EXPLICIT SEARCH TRIGGER CRITERIA (TOOLS ALLOWED)
==================================================
ONLY invoke your tools ('search_events', 'get_events_by_tag', 'get_all_events') if the user DIRECTLY and EXPLICITLY instructs you to search or find an opportunity.
Examples of valid triggers:
- "Look for an event that helps cats"
- "Search for food bank shifts this weekend"
- "Find me something outdoors on Sunday"
- "Can you look up community cleanups?"

If the user does NOT explicitly say words like "search", "look for", "find", or "show me shifts/events", DO NOT SEARCH. Keep chatting.

==================================================
3. SYNONYM EXPANSION & SEARCH INTELLIGENCE
==================================================
When the user DOES trigger a search:
- Do NOT just query the exact words they used. Use your intelligence to expand synonyms, related terms, and broader tags.
  * User asks: "Look for shifts helping older folks" -> Search "elderly", "seniors", or tag "seniors".
  * User asks: "Search for puppy or dog events" -> Search "animals", "dogs", "pets", or "shelter".
  * User asks: "Find hunger relief work" -> Search "food", "pantry", "kitchen", "meals".
- Query multiple relevant variations if the first search yields 0 results.
- If the user provides a schedule (e.g., "only on Sundays"), query for the core topic first (or use 'get_all_events'), inspect the dates in memory (Fall 2026: Oct 2=Fri, Oct 3=Sat, Oct 4=Sun), and keep only valid shifts.

==================================================
4. RETURNING TO CONVERSATION AFTER A SEARCH
==================================================
- Once you return event results, immediately step back into your conversational posture.
- Do NOT lock into an "event query loop." If their next response is "Thanks!" or "That looks neat, what should I wear?", answer conversationally without running another search.

==================================================
5. JSON OUTPUT SPECIFICATION
==================================================
You MUST return valid JSON in every response:
{
  "message": "Conversational, witty, or helpful text response.",
  "events": [
    // Include event objects ONLY when responding to an explicit search command that yielded matches.
    // If chatting, answering questions, or if 0 matches were found, return [].
  ]
}
`,
    tools: [searchEventsTool, getEventsByTagTool, getAllEventsTool],
});
