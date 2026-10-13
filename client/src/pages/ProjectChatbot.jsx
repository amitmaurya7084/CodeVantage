import { useRef, useEffect, useState } from "react";
import "./ProjectChatbot.css";

const API_BASE = import.meta.env.VITE_API_URL || "";



/* ---------- tiny inline icons (no external icon package needed) ---------- */
function Icon({ children, size = 20, className = "" }) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}
const IUser = (p) => (
  <Icon {...p}>
    <circle cx="12" cy="8" r="4" />
    <path d="M4 21v-1a6 6 0 0 1 6-6h4a6 6 0 0 1 6 6v1" />
  </Icon>
);
const IFile = (p) => (
  <Icon {...p}>
    <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
    <path d="M14 3v5h5M9 13h6M9 17h6" />
  </Icon>
);
const IAward = (p) => (
  <Icon {...p}>
    <circle cx="12" cy="9" r="6" />
    <path d="m8.5 14-1.5 8 5-3 5 3-1.5-8" />
  </Icon>
);
const IList = (p) => (
  <Icon {...p}>
    <path d="m3 6 1.5 1.5L7 5M3 13l1.5 1.5L7 12M10 6h11M10 13h11M10 20h11" />
  </Icon>
);
const ICard = (p) => (
  <Icon {...p}>
    <rect x="2" y="5" width="20" height="14" rx="2" />
    <path d="M2 10h20M6 15h4" />
  </Icon>
);
const IHelp = (p) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="10" />
    <path d="M9.1 9a3 3 0 0 1 5.8 1c0 2-3 2.5-3 4M12 17.5h.01" />
  </Icon>
);
const IChevron = (p) => (
  <Icon {...p}>
    <path d="m9 6 6 6-6 6" />
  </Icon>
);
const IBot = (p) => (
  <Icon {...p}>
    <rect x="4" y="8" width="16" height="12" rx="3" />
    <path d="M12 8V4M9 14v1M15 14v1M2 13v3M22 13v3" />
  </Icon>
);
const ISend = (p) => (
  <Icon {...p}>
    <path d="M21.5 2.5 10.5 13.5M21.5 2.5 15 21.5l-4.5-8-8-4.5z" />
  </Icon>
);
const IClip = (p) => (
  <Icon {...p}>
    <path d="m21 11-8.6 8.6a5.5 5.5 0 0 1-7.8-7.8l8.6-8.6a3.7 3.7 0 0 1 5.2 5.2l-8.6 8.6a1.8 1.8 0 0 1-2.6-2.6l7.9-7.9" />
  </Icon>
);
const IBulb = (p) => (
  <Icon {...p}>
    <path d="M9 18h6M10 22h4M12 2a7 7 0 0 0-4 12.7c.6.5 1 1.3 1 2.3h6c0-1 .4-1.8 1-2.3A7 7 0 0 0 12 2z" />
  </Icon>
);
const IChat = (p) => (
  <Icon {...p}>
    <path d="M21 12a8 8 0 0 1-11.7 7L3 21l2-5.5A8 8 0 1 1 21 12z" />
  </Icon>
);
const IMin = (p) => (
  <Icon {...p}>
    <path d="M5 12h14" />
  </Icon>
);
const IMax = (p) => (
  <Icon {...p}>
    <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
  </Icon>
);
const IShrink = (p) => (
  <Icon {...p}>
    <path d="M4 14h6v6M20 10h-6V4M14 10l7-7M3 21l7-7" />
  </Icon>
);
const IClose = (p) => (
  <Icon {...p}>
    <path d="M18 6 6 18M6 6l12 12" />
  </Icon>
);

function LogoMark({ size = 30 }) {
  return (
    <svg viewBox="0 0 32 32" width={size} height={size} aria-hidden="true">
      <path d="M16 2 30 16 16 30 2 16Z" fill="#2563EB" />
      <path d="M16 9 23 16 16 23 9 16Z" fill="#fff" />
    </svg>
  );
}

// Display-only quick-help cards (clicking one sends its title through the same chat API call).
const QUICK_HELP = [
  { title: "Registration Help", sub: "Create your account", icon: IUser, tone: "blue" },
  { title: "Program Details", sub: "Explore internships", icon: IFile, tone: "red" },
  { title: "Certificates", sub: "Eligibility & download", icon: IAward, tone: "green" },
  { title: "Submission Help", sub: "How to submit projects", icon: IList, tone: "purple" },
  { title: "Payment Support", sub: "Fees & transactions", icon: ICard, tone: "orange" },
  { title: "Other Questions", sub: "Get instant help", icon: IHelp, tone: "blue" },
];

function BotAvatar() {
  return (
    <span className="cv-avatar">
      <IBot size={24} />
    </span>
  );
}

export default function ProjectChatbot() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text: "I'm CodeVantage Assistant. I can help you with registration, program details, internship process, certificates, or any other questions.",
      greeting: true,
    },
    {
      role: "assistant",
      text: "How can I help you today?\nFeel free to ask anything! 😊",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  // Display-only widget state
  const [open, setOpen] = useState(true);
  const [minimized, setMinimized] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const bottomRef = useRef(null);

  const hasUserMessage = messages.some((m) => m.role === "user");

  useEffect(() => {
    // Welcome view stays at top; scroll only once the conversation starts.
    if (hasUserMessage || loading) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [messages, loading, open, minimized, hasUserMessage]);

  async function sendQuestion(question) {
    if (!question || loading) return;

    setMessages((current) => [...current, { role: "user", text: question }]);
    setInput("");
    setError("");
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE}/api/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: question }),
      });

      const responseText = await response.text();
      let data = {};

      if (responseText.trim()) {
        try {
          data = JSON.parse(responseText);
        } catch {
          throw new Error(
            `Server returned invalid JSON (HTTP ${response.status}). Check the backend terminal.`
          );
        }
      }

      if (!response.ok) {
        throw new Error(data.error || data.message || `Chat request failed (HTTP ${response.status}).`);
      }

      if (!data.reply) {
        throw new Error("The server returned no chatbot reply.");
      }

      setMessages((current) => [...current, { role: "assistant", text: data.reply }]);
    } catch (err) {
      setError(err.message || "Could not connect to the chatbot.");
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(event) {
    event.preventDefault();
    sendQuestion(input.trim());
  }

  function renderMessage(message, index) {
    const isUser = message.role === "user";
    return (
      <div key={`${index}-${message.role}`}>
        <div className={`cv-row ${isUser ? "cv-row-user" : ""}`}>
          {!isUser && <BotAvatar />}
          <div className={`cv-bubble ${isUser ? "cv-bubble-user" : "cv-bubble-bot"}`}>
            {message.greeting && (
              <p className="cv-hi">
                Hi! <span aria-hidden="true">👋</span>
              </p>
            )}
            {message.text}
          </div>
        </div>
        {!isUser && index < 2 && <p className="cv-time">Just now</p>}
      </div>
    );
  }

  return (
    <div className={`cv-root ${expanded ? "cv-expanded" : ""}`}>
      {open && (
        <section className="cv-panel" aria-label="Project AI chatbot">
          <header className="cv-header">
            <span className="cv-logo">
              <LogoMark />
            </span>
            <div className="cv-head-text">
              <h2>CodeVantage Assistant</h2>
              <p>
                <span className="cv-online" /> Online
              </p>
            </div>
            <button
              type="button"
              className="cv-hbtn"
              onClick={() => setMinimized((v) => !v)}
              aria-label={minimized ? "Expand chat" : "Minimize chat"}
            >
              <IMin />
            </button>
            <button
              type="button"
              className="cv-hbtn cv-hide-sm"
              onClick={() => setExpanded((v) => !v)}
              aria-label={expanded ? "Shrink chat" : "Enlarge chat"}
            >
              {expanded ? <IShrink /> : <IMax />}
            </button>
            <button type="button" className="cv-hbtn" onClick={() => setOpen(false)} aria-label="Close chat">
              <IClose />
            </button>
          </header>

          {!minimized && (
            <>
              <div className="cv-messages" aria-live="polite">
                {messages.slice(0, 1).map((m, i) => renderMessage(m, i))}

                {!hasUserMessage && (
                  <div>
                    <p className="cv-qh-title">Quick Help</p>
                    <p className="cv-qh-sub">Choose a topic or type your question below.</p>
                    <div className="cv-grid">
                      {QUICK_HELP.map(({ title, sub, icon: Ico, tone }) => (
                        <button
                          key={title}
                          type="button"
                          className="cv-card"
                          disabled={loading}
                          onClick={() => sendQuestion(title)}
                        >
                          <span className={`cv-card-icon cv-tone-${tone}`}>
                            <Ico size={18} />
                          </span>
                          <span className="cv-card-text">
                            <span className="cv-card-title">{title}</span>
                            <span className="cv-card-sub">{sub}</span>
                          </span>
                          <IChevron size={14} className="cv-card-chev" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {messages.slice(1).map((m, i) => renderMessage(m, i + 1))}

                {loading && (
                  <div className="cv-row">
                    <BotAvatar />
                    <div className="cv-bubble cv-bubble-bot cv-muted">Thinking…</div>
                  </div>
                )}
                <div ref={bottomRef} />
              </div>

              {error && (
                <p className="cv-error" role="alert">
                  {error}
                </p>
              )}

              <form className="cv-form" onSubmit={handleSubmit}>
                <div className="cv-input-wrap">
                  <IClip size={20} className="cv-clip" />
                  <input
                    className="cv-input"
                    value={input}
                    onChange={(event) => setInput(event.target.value)}
                    placeholder="Type your message..."
                    aria-label="Ask a question"
                    maxLength={1000}
                    disabled={loading}
                  />
                  <button className="cv-send" type="submit" disabled={loading || !input.trim()} aria-label="Send">
                    <ISend size={20} />
                  </button>
                </div>
                <p className="cv-tip">
                  <IBulb size={15} />
                  Tip: You can ask about registration, programs, certificates, or any support.
                </p>
              </form>
            </>
          )}
        </section>
      )}

      <div className="cv-launch-row">
        <span className="cv-pill">
          <strong>Need Help?</strong>
          <small>Chat with us</small>
          <svg className="cv-arrow" viewBox="0 0 48 16" fill="none" aria-hidden="true">
            <path
              d="M2 4 C14 16 30 16 44 6 M38 4 L45 5.5 L41 11"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
        <button
          type="button"
          className="cv-launch"
          onClick={() => {
            setOpen((v) => !v);
            setMinimized(false);
          }}
          aria-label={open ? "Close chat" : "Open chat"}
        >
          <IChat size={28} />
          <span className="cv-launch-dot" />
        </button>
      </div>
    </div>
  );
}
