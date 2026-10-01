"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rootAgent = void 0;
const adk_1 = require("@google/adk");
const zod_1 = require("zod");
const BE_PORT = process.env.BE_PORT || process.env.PORT || 5173;
const API_BASE = process.env.API_URL || `http://localhost:${BE_PORT}/api/events`;
/**
 * 1. Calls GET /api/events/search?q=...
 */
const searchEventsTool = new adk_1.FunctionTool({
    name: 'search_events',
    description: 'Searches volunteer events using your query keyword (e.g. "dogs", "food bank", "cleanup").',
    parameters: zod_1.z.object({
        q: zod_1.z.string().min(1).describe('The search keyword or term to look up'),
    }),
    execute: async ({ q }) => {
        try {
            const res = await fetch(`${API_BASE}/search?q=${encodeURIComponent(q)}`);
            if (!res.ok)
                return { status: 'error', message: `Search failed: ${res.statusText}` };
            const body = (await res.json());
            return { status: 'success', data: body.data };
        }
        catch (err) {
            return { status: 'error', message: String(err) };
        }
    },
});
/**
 * 2. Calls GET /api/events?tags=:slug
 */
const getEventsByTagTool = new adk_1.FunctionTool({
    name: 'get_events_by_tag',
    description: 'Fetches all events associated with a specific tag slug (e.g. "animals", "environment", "education").',
    parameters: zod_1.z.object({
        slug: zod_1.z.string().regex(/^[a-z0-9-]+$/).describe('The slugified tag name (lowercase, hyphens only)'),
    }),
    execute: async ({ slug }) => {
        try {
            const res = await fetch(`${API_BASE}?tags=${encodeURIComponent(slug)}`);
            if (!res.ok)
                return { status: 'error', message: `Tag fetch failed: ${res.statusText}` };
            const body = (await res.json());
            return { status: 'success', data: body.data };
        }
        catch (err) {
            return { status: 'error', message: String(err) };
        }
    },
});
/**
 * 3. Calls GET /api/events/tags
 */
const getAllTagsTool = new adk_1.FunctionTool({
    name: 'get_all_tags',
    description: 'Fetches the list of all available event category tags.',
    execute: async () => {
        try {
            const res = await fetch(`${API_BASE}/tags`);
            if (!res.ok)
                return { status: 'error', message: `Failed to fetch tags: ${res.statusText}` };
            const body = (await res.json());
            return { status: 'success', tags: body.tags };
        }
        catch (err) {
            return { status: 'error', message: String(err) };
        }
    },
});
/**
 * 4. Calls GET /api/events/:eid
 */
const getEventByIdTool = new adk_1.FunctionTool({
    name: 'get_event_by_id',
    description: 'Retrieves complete details for a specific event by its numeric eid.',
    parameters: zod_1.z.object({
        eid: zod_1.z.number().int().positive().describe('The numeric ID of the event'),
    }),
    execute: async ({ eid }) => {
        try {
            const res = await fetch(`${API_BASE}/${eid}`);
            if (!res.ok)
                return { status: 'error', message: `Failed to get event ${eid}: ${res.statusText}` };
            const body = (await res.json());
            return { status: 'success', data: body.data };
        }
        catch (err) {
            return { status: 'error', message: String(err) };
        }
    },
});
/**
 * 5. Calls GET /api/events (Fallback)
 */
const getAllEventsTool = new adk_1.FunctionTool({
    name: 'get_all_events',
    description: 'Fetches all volunteer events in the system when no specific query or tag applies.',
    execute: async () => {
        try {
            const res = await fetch(API_BASE);
            if (!res.ok)
                return { status: 'error', message: `Failed to fetch all events: ${res.statusText}` };
            const body = (await res.json());
            return { status: 'success', data: body.data };
        }
        catch (err) {
            return { status: 'error', message: String(err) };
        }
    },
});
exports.rootAgent = new adk_1.LlmAgent({
    name: 'benevola_concierge',
    model: 'gemini-2.5-flash',
    description: 'AI assistant for Benevola matching volunteers with events using backend routes.',
    instruction: `
You are the AI Concierge for Benevola. You help users discover volunteer opportunities matching their schedule, interests, and preferences by calling the backend API tools.

API ROUTING RULES:
- Use 'search_events' when the user provides keywords or freeform descriptions (e.g. "dogs", "food kitchen", "beach clean").
- Use 'get_events_by_tag' when the user asks for a category/tag. If unsure of valid tags, call 'get_all_tags'.
- Use 'get_event_by_id' when the user asks questions about a specific event whose eid is known.
- Use 'get_all_events' only if the user explicitly asks to see everything or has broad schedule availability across all types.

SCHEDULE FILTERING:
- Note: Your backend search and tag routes return event objects that have a 'date' (ISO timestamp) and 'duration' (minutes).
- When the user provides a schedule (e.g. "free Saturday morning"), call the relevant search/tag tool first, then filter the returned events in your memory to keep only those that fit within the user's availability window.

OUTPUT FORMAT CONTRACT:
ALWAYS respond in valid JSON with this structure so the frontend can display cards:
{
  "message": "Your conversational response explaining the recommendations or answering their questions.",
  "events": [
    {
      "id": 1,
      "title": "Dog Walking",
      "description": "...",
      "date": "2026-10-03T10:00:00.000Z",
      "duration": 60,
      "address": "123 Main St",
      "coverPhoto": "https://..."
    }
  ]
}
- Populate "events" with the event objects matching their request so the client can render event cards.
- If you are answering a specific question about an already-selected event, or if no events match, return an empty array: "events": [].
`,
    tools: [
        searchEventsTool,
        getEventsByTagTool,
        getAllTagsTool,
        getEventByIdTool,
        getAllEventsTool,
    ],
});
