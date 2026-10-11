import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Btn, Chip, DateBlock, Input, Mark, Panel, Skeleton, State, Meter } from '../parts';
import { sendChatMessage } from '../../../data/api';
import { formatDuration, shortAddress } from '../../../data/format';

const SUGGESTIONS = [
  { label: 'Work with animals 🐶', prompt: 'I want to work with animals or dogs.' },
  { label: 'Food bank shifts 🍲', prompt: 'Show me food kitchen or food bank volunteer shifts.' },
  { label: 'Environmental cleanups 🌿', prompt: 'I am looking for environmental cleanups or outdoors.' },
  { label: 'Free weekends 📅', prompt: 'What volunteer opportunities are available on weekends?' },
];

function EventCard({ event, index = 0, onClick }) {
  const full = event.spotsLeft === 0;

  return (
    <div
      className="def-item def-chat-card"
      onClick={() => onClick(event)}
      style={{ '--i': index, cursor: 'pointer' }}
      role="button"
      tabIndex={0}
    >
      <span className="def-lead">
        <DateBlock iso={event.date} />
        {event.heroImage && (
          <img className="def-thumb" src={event.heroImage} alt="" loading="lazy" />
        )}
      </span>
      <span className="def-item-body">
        <span className="def-item-title">{event.title}</span>
        <span className="def-item-meta">
          {event.address && <span>{shortAddress(event.address)}</span>}
          {event.duration > 0 && <span>{formatDuration(event.duration)}</span>}
        </span>
      </span>
      <span className="def-chiprow">
        {full ? (
          <Chip tone="accent">Full</Chip>
        ) : (
          (event.tags || []).slice(0, 2).map((t) => (
            <Chip key={t}>{t.replace(/-/g, ' ')}</Chip>
          ))
        )}
      </span>
    </div>
  );
}

function EventDetailModal({ event, onClose, onAskAI }) {
  if (!event) return null;

  const full = event.spotsLeft === 0;

  return (
    <div className="def-modal-backdrop" onClick={onClose}>
      <div className="def-modal-card" onClick={(e) => e.stopPropagation()}>
        {event.heroImage && (
          <img className="def-modal-hero" src={event.heroImage} alt={event.title} />
        )}
        
        <div className="def-modal-body">
          <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start', marginBottom: 14 }}>
            <DateBlock iso={event.date} />
            <div>
              <h2 className="def-h2" style={{ margin: '0 0 4px' }}>{event.title}</h2>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', fontSize: '0.85rem', color: 'var(--def-ink-2)' }}>
                {event.address && <span>📍 {event.address}</span>}
                {event.duration > 0 && <span>⏱️ {formatDuration(event.duration)}</span>}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
            {(event.tags || []).map((t) => (
              <Chip key={t}>{t.replace(/-/g, ' ')}</Chip>
            ))}
            {full && <Chip tone="accent">Full</Chip>}
          </div>

          {event.description && (
            <div style={{ marginBottom: 18 }}>
              <h4 style={{ margin: '0 0 6px', fontSize: '0.9rem', color: 'var(--def-ink-3)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                About this opportunity
              </h4>
              <p style={{ margin: 0, fontSize: '0.95rem', lineHeight: 1.55, color: 'var(--def-ink-2)', whiteSpace: 'pre-line' }}>
                {event.description}
              </p>
            </div>
          )}

          {event.capacity != null && (
            <div style={{ marginBottom: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.83rem', color: 'var(--def-ink-2)', marginBottom: 4 }}>
                <span>Capacity</span>
                <span>{event.spotsLeft != null ? `${event.spotsLeft} spots left` : `${event.capacity} spots`}</span>
              </div>
              <Meter value={event.spotsLeft ?? event.capacity} max={event.capacity} />
            </div>
          )}
        </div>

        <div className="def-modal-foot">
          <div style={{ display: 'flex', gap: 8 }}>
            <Btn sm onClick={() => onAskAI(`Tell me more about "${event.title}"`)}>
              ✨ Ask AI About Shift
            </Btn>
            <Btn as={Link} sm variant="ghost" to={`/events/${event.id}`} target="_blank">
              Open Full Page ↗
            </Btn>
          </div>
          <Btn sm variant="quiet" onClick={onClose}>
            Close
          </Btn>
        </div>
      </div>
    </div>
  );
}

export default function EventsChatbot() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      text: "Hello! I'm your Benevola AI Assistant. Tell me what kind of volunteer work you're interested in, or what your schedule looks like, and I'll match you with the best open shifts!",
      events: [],
    },
  ]);
  const [inputPrompt, setInputPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const chatEndRef = useRef(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (textToSend) => {
    const query = (textToSend || inputPrompt).trim();
    if (!query || loading) return;

    setError(null);
    setInputPrompt('');

    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: query,
    };

    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const historyPayload = messages
        .filter((m) => m.id !== 1)
        .map((m) => ({ sender: m.sender, text: m.text }));

      const res = await sendChatMessage({
        prompt: query,
        history: historyPayload,
      });

      const botMsg = {
        id: Date.now() + 1,
        sender: 'bot',
        text: res.message,
        events: res.events || [],
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      console.error('Chat error:', err);
      setError(err.message || 'Failed to communicate with AI Assistant.');
      const errorMsg = {
        id: Date.now() + 1,
        sender: 'bot',
        text: "I couldn't complete that search right now. Please check your connection or try again in a moment.",
        events: [],
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleAskAIFromModal = (promptText) => {
    setSelectedEvent(null);
    handleSend(promptText);
  };

  return (
    <div className="def-chatbot-wrap">
      <Panel pad className="def-chatbot-panel">
        <div className="def-chatbot-head">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Mark size={24} />
            <div>
              <h3 className="def-h3" style={{ margin: 0 }}>Benevola AI Assistant</h3>
              <span className="def-muted" style={{ fontSize: '0.8rem' }}>
                Ask questions or describe your ideal shift
              </span>
            </div>
          </div>
          {messages.length > 1 && (
            <Btn
              sm
              variant="quiet"
              onClick={() =>
                setMessages([
                  {
                    id: Date.now(),
                    sender: 'bot',
                    text: "Conversation cleared! What kind of volunteer work would you like to explore?",
                    events: [],
                  },
                ])
              }
            >
              Reset Chat
            </Btn>
          )}
        </div>

        {/* Quick Suggestion Chips */}
        <div className="def-chatbot-suggestions">
          <span className="def-muted" style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Quick Prompts:
          </span>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 6 }}>
            {SUGGESTIONS.map((s) => (
              <button
                key={s.label}
                type="button"
                className="def-chip def-chip-interactive"
                onClick={() => handleSend(s.prompt)}
                disabled={loading}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Chat Thread */}
        <div className="def-chat-thread">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`def-chat-msg def-chat-msg--${msg.sender}`}
            >
              <div className="def-chat-bubble">
                {msg.sender === 'bot' && (
                  <div className="def-chat-bot-icon" aria-hidden="true">
                    <Mark size={14} />
                  </div>
                )}
                <div className="def-chat-content">
                  <p className="def-chat-text">{msg.text}</p>
                  
                  {/* Event Cards inside AI response */}
                  {msg.events && msg.events.length > 0 && (
                    <div className="def-chat-events">
                      <div className="def-chat-events-header">
                        <span>Matched Volunteer Shifts ({msg.events.length}) — Click for details</span>
                      </div>
                      <div className="def-list">
                        {msg.events.map((ev, i) => (
                          <EventCard
                            key={ev.id || i}
                            event={ev}
                            index={i}
                            onClick={(selected) => setSelectedEvent(selected)}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          {loading && (
            <div className="def-chat-msg def-chat-msg--bot">
              <div className="def-chat-bubble">
                <div className="def-chat-bot-icon" aria-hidden="true">
                  <Mark size={14} />
                </div>
                <div className="def-chat-content" style={{ width: '100%' }}>
                  <p className="def-chat-text" style={{ fontStyle: 'italic', opacity: 0.8 }}>
                    Searching available volunteer shifts...
                  </p>
                  <Skeleton rows={2} />
                </div>
              </div>
            </div>
          )}

          {error && (
            <div style={{ marginTop: 8 }}>
              <State error title="Notice">{error}</State>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Input Bar */}
        <div className="def-chat-input-bar">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            style={{ display: 'flex', gap: 10, width: '100%' }}
          >
            <Input
              type="text"
              placeholder="Type your message (e.g. 'I want to work with dogs this Saturday')..."
              value={inputPrompt}
              onChange={(e) => setInputPrompt(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={loading}
              style={{ flex: 1 }}
            />
            <Btn type="submit" disabled={loading || !inputPrompt.trim()}>
              {loading ? 'Thinking...' : 'Send'}
            </Btn>
          </form>
        </div>
      </Panel>

      {/* Inline Detail Modal */}
      <EventDetailModal
        event={selectedEvent}
        onClose={() => setSelectedEvent(null)}
        onAskAI={handleAskAIFromModal}
      />
    </div>
  );
}
