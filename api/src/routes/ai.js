const express = require('express');
const router = express.Router();
const path = require('path');
const { getEvents } = require('../services/buildEventQuery');
const Event = require('../models/Event');
const Tag = require('../models/Tag');
const { Op } = require('sequelize');

let InMemoryRunner = null;
let rootAgent = null;

try {
    const adkPath = path.resolve(__dirname, '../../../ai/goodie/node_modules/@google/adk');
    const agentPath = path.resolve(__dirname, '../../../ai/goodie/dist/agent.js');
    
    InMemoryRunner = require(adkPath).InMemoryRunner;
    rootAgent = require(agentPath).rootAgent;
} catch (err) {
    console.warn('Could not load ADK rootAgent from ai/goodie:', err.message);
}

// Dev fallback when GEMINI_API_KEY is not set
async function smartFallbackSearch(prompt) {
    const cleanPrompt = (prompt || '').replace(/['"“”]/g, '').trim();
    const lower = cleanPrompt.toLowerCase();

    // 1. Check for negative intent or rejection ("don't want", "dont want", "no thanks", "not interested", "stop")
    if (/\b(don't|dont|do not|no|not interested|stop|cancel|nevermind|bye)\b/.test(lower) && /\b(want|volunteer|interest|help|work|shifts)\b/.test(lower)) {
        return {
            message: "No problem! Whenever you're ready to explore volunteer opportunities, just let me know.",
            events: []
        };
    }

    // 2. Check for greetings or generic pleasantries ("hi", "hello", "hey", "who are you", "help")
    if (/^(hi|hello|hey|greetings|help|howdy|what's up)\b/.test(lower) && lower.split(' ').length <= 4) {
        return {
            message: "Hello! I'm here to help you find volunteer opportunities matching your schedule or interests. You can ask for things like 'working with dogs', 'food bank shifts', or 'outdoor cleanups'.",
            events: []
        };
    }

    // Check if prompt is asking for details on a specific item ("tell me more about ...", "details on ...")
    const isFollowupDetail = /\b(tell|more|details|about|explain|what is)\b/.test(lower);

    // 3. Search tags
    const tags = await Tag.findAll();
    const synonymTagMap = {
        'dog': 'animal-welfare',
        'dogs': 'animal-welfare',
        'puppy': 'animal-welfare',
        'puppies': 'animal-welfare',
        'cat': 'animal-welfare',
        'cats': 'animal-welfare',
        'kitten': 'animal-welfare',
        'kittens': 'animal-welfare',
        'pet': 'animal-welfare',
        'pets': 'animal-welfare',
        'animal': 'animal-welfare',
        'animals': 'animal-welfare',
        'food': 'food-security',
        'hunger': 'food-security',
        'meal': 'food-security',
        'meals': 'food-security',
        'pantry': 'food-security',
        'kitchen': 'food-security',
        'elderly': 'seniors',
        'senior': 'seniors',
        'seniors': 'seniors',
        'tree': 'environment',
        'trees': 'environment',
        'nature': 'environment',
        'cleanup': 'environment',
        'clean up': 'environment',
        'kid': 'children',
        'kids': 'children',
        'child': 'children',
        'children': 'children',
        'teen': 'youth',
        'teens': 'youth',
        'youth': 'youth',
    };

    const matchedTagSlugs = tags
        .filter(t => lower.includes(t.name.toLowerCase()) || lower.includes(t.slug.toLowerCase()))
        .map(t => t.slug);

    for (const [word, slug] of Object.entries(synonymTagMap)) {
        if (new RegExp(`\\b${word}\\b`, 'i').test(lower) && !matchedTagSlugs.includes(slug)) {
            matchedTagSlugs.push(slug);
        }
    }

    let queryParams = {
        limit: 10,
        offset: 0,
        sort: 'date',
        order: 'ASC',
    };

    let originalSearchQuery = '';

    if (matchedTagSlugs.length > 0) {
        queryParams.tags = matchedTagSlugs;
    } else {
        const cleanQuery = lower
            .replace(/^(tell me more about|tell me about|details on|can you tell me about|what is|tell me|search for|look for|find me|look up|search|find)\s*/g, '')
            .replace(/\b(i|want|to|work|with|looking|for|shifts|volunteering|events|any|help|can|the|a|an|in|on|at|show|me|find|only|but|and|or|search|look|lookup|up|give)\b/g, '')
            .replace(/\b(sundays|saturday|monday|tuesday|wednesday|thursday|friday|weekend|weekends)\b/g, '')
            .trim();
        if (cleanQuery.length > 1) {
            queryParams.q = cleanQuery;
            originalSearchQuery = cleanQuery;
        }
    }

    let { rows } = await getEvents(queryParams);
    let matched = true;

    if (rows.length === 0) {
        matched = false;
    }

    let replyMessage = "";
    if (matched) {
        if (isFollowupDetail && rows.length > 0) {
            const event = rows[0];
            replyMessage = `Here are details for **${event.title}**:\n\n${event.description || 'No description provided.'}\n\n**Location:** ${event.address || 'TBD'}\n**Duration:** ${event.duration ? event.duration + ' mins' : 'N/A'}`;
            return {
                message: replyMessage,
                events: []
            };
        } else if (matchedTagSlugs.length > 0) {
            replyMessage = `Here are volunteer opportunities matching your interest in ${matchedTagSlugs.join(', ')}:`;
        } else if (originalSearchQuery) {
            replyMessage = `Here are volunteer events matching "${originalSearchQuery}":`;
        } else {
            replyMessage = "Here are upcoming volunteer opportunities available on Benevola:";
        }
    } else {
        replyMessage = `I couldn't find any volunteer shifts specifically matching your request right now. Would you like to check shifts on another day or category?`;
        rows = [];
    }

    return {
        message: replyMessage,
        events: rows
    };
}

router.get('/status', (req, res) => {
    const hasApiKey = Boolean(process.env.GEMINI_API_KEY);
    res.json({
        status: 'ok',
        aiEnabled: Boolean(rootAgent),
        hasApiKey
    });
});

router.post('/chat', async (req, res, next) => {
    try {
        const { prompt, history = [] } = req.body;
        if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
            return res.status(400).json({ error: 'Prompt is required' });
        }

        const apiKey = process.env.GEMINI_API_KEY;

        if (apiKey && InMemoryRunner && rootAgent) {
            try {
                process.env.GOOGLE_GENAI_API_KEY = apiKey;
                process.env.GOOGLE_API_KEY = apiKey;
                if (process.env.GEMINI_MODEL && rootAgent.model !== process.env.GEMINI_MODEL) {
                    rootAgent.model = process.env.GEMINI_MODEL;
                }
                const runner = new InMemoryRunner({ agent: rootAgent });
                const eventsStream = runner.runEphemeral({
                    userId: 'web-user',
                    newMessage: {
                        parts: [{ text: prompt }]
                    }
                });

                let lastText = '';
                for await (const event of eventsStream) {
                    if (event.errorMessage) {
                        console.warn('ADK Agent Error:', event.errorMessage);
                    }
                    if (event.content && event.content.parts) {
                        for (const part of event.content.parts) {
                            if (part.text) lastText = part.text;
                        }
                    }
                }

                if (lastText) {
                    const cleanJson = lastText.replace(/```json/g, '').replace(/```/g, '').trim();
                    let parsed;
                    try {
                        parsed = JSON.parse(cleanJson);
                    } catch (e) {
                        parsed = null;
                    }

                    if (parsed && typeof parsed.message === 'string') {
                        let fullEvents = [];
                        if (Array.isArray(parsed.events) && parsed.events.length > 0) {
                            const ids = parsed.events.map(e => e.id).filter(Boolean);
                            if (ids.length > 0) {
                                const found = await Event.findAll({
                                    where: { id: { [Op.in]: ids } },
                                    include: [{ model: Tag, as: 'Tags', through: { attributes: [] } }]
                                });
                                const map = new Map(found.map(e => [e.id, e]));
                                fullEvents = ids.map(id => map.get(id)).filter(Boolean);
                            } else {
                                fullEvents = parsed.events;
                            }
                        }

                        return res.status(200).json({
                            message: parsed.message,
                            events: fullEvents
                        });
                    }
                }
            } catch (llmErr) {
                console.error('ADK agent runner error, fallback to search:', llmErr.message);
            }
        }

        // Fallback search when API key is missing or agent call fails
        const fallbackResult = await smartFallbackSearch(prompt);
        return res.status(200).json(fallbackResult);
    } catch (err) {
        next(err);
    }
});

module.exports = router;
