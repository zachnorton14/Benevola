import { FunctionTool, LlmAgent } from '@google/adk';
import { z } from 'zod';

// Define the input schema so the LLM can extract parameters from user chat & schedules
const EventSearchParameters = z.object({
  query: z.string().optional().describe('Keyword or search phrase (e.g., "dogs", "food bank", "cleanup")'),
  causes: z.array(z.string()).optional().describe('Specific cause categories (e.g., ["Animals", "Environment", "Hunger"])'),
  startDate: z.string().optional().describe('ISO-8601 start timestamp for availability (e.g., "2026-10-03T09:00:00Z")'),
  endDate: z.string().optional().describe('ISO-8601 end timestamp for availability (e.g., "2026-10-03T15:00:00Z")'),
  maxDistanceMiles: z.number().optional().describe('Radius in miles around user location if provided'),
  latitude: z.number().optional().describe('User latitude'),
  longitude: z.number().optional().describe('User longitude')
});

/**
 * Filtered search tool that calls your backend API
 */
const searchEvents = new FunctionTool({
  name: 'search_events',
  description: 'Searches and filters volunteer events by cause, date/time schedule window, keywords, or location.',
  parameters: EventSearchParameters,
  execute: async (params) => {
    try {
      // Build query string from parameters
      const searchParams = new URLSearchParams();
      if (params.query) searchParams.append('q', params.query);
      if (params.causes && params.causes.length > 0) searchParams.append('causes', params.causes.join(','));
      if (params.startDate) searchParams.append('startDate', params.startDate);
      if (params.endDate) searchParams.append('endDate', params.endDate);
      if (params.maxDistanceMiles) searchParams.append('radius', params.maxDistanceMiles.toString());
      if (params.latitude && params.longitude) {
        searchParams.append('lat', params.latitude.toString());
        searchParams.append('lng', params.longitude.toString());
      }

      const response = await fetch(`http://localhost:4000/api/events/search?${searchParams.toString()}`);
      
      if (!response.ok) {
        return { status: 'error', report: `Backend returned ${response.status}: ${response.statusText}` };
      }

      const events = (await response.json()) as any[];      return { 
        status: 'success', 
        count: events.length,
        events: events 
      };
    } catch (error) {
      return { 
        status: 'error', 
        report: `Error searching events: ${error instanceof Error ? error.message : String(error)}` 
      };
    }
  },
});

/**
 * Tool for detailed inspection when a user asks follow-up questions about a specific card
 */
const getEventDetails = new FunctionTool({
  name: 'get_event_details',
  description: 'Retrieves full details, shift rules, and organization info for a specific event by ID.',
  parameters: z.object({
    eventId: z.string().describe('The unique ID of the event')
  }),
  execute: async ({ eventId }) => {
    try {
      const response = await fetch(`http://localhost:4000/api/events/${eventId}`);
      if (!response.ok) return { status: 'error', report: `Event ${eventId} not found.` };
      const eventData = await response.json();
      return { status: 'success', event: eventData };
    } catch (error) {
      return { status: 'error', report: `Failed to fetch event details: ${error instanceof Error ? error.message : String(error)}` };
    }
  }
});

export const rootAgent = new LlmAgent({
  name: 'benevola_concierge',
  model: 'gemini-3-flash-preview',
  description: 'AI concierge for Benevola matching volunteers with events based on schedule and interests.',
  instruction: `
You are Benevola's Volunteer Matchmaker. Your job is to help volunteers find the best events matching their schedule, passions, and location.

CORE BEHAVIORS:
1. Schedule Parsing:
   - When the user states their availability (e.g., "I'm free Saturday morning" or shares a schedule/calendar text), convert it into ISO timestamps (startDate / endDate) and query 'search_events'.
   - The current year is 2026. Calculate relative days (this weekend, tomorrow, next week) based on the current date context.

2. Cause & Interest Matching:
   - Map colloquial expressions to common volunteer causes (e.g., "dogs", "cats", "pets" -> "Animals"; "trees", "park" -> "Environment").

3. Structured UI Response Format:
   - ALWAYS format your final response to the user as valid JSON adhering to this schema:
   {
     "message": "Conversational reply summarizing what you found and any follow-up guidance.",
     "events": [
       {
         "id": "event_id",
         "title": "Event Title",
         "organization": "Org Name",
         "startTime": "ISO timestamp",
         "endTime": "ISO timestamp",
         "location": "Address or City, State",
         "availableSpots": 5
       }
     ]
   }
   - When events match, include their brief summaries in the "events" array so the frontend can render interactive cards.
   - If no events match, explain why in "message" and return "events": [].
   - If the user asks a clarifying question about an already visible card (e.g., "What should I wear for the dog walk?"), use 'get_event_details' and reply conversationally with "events": [].
`,
  tools: [searchEvents, getEventDetails],
});