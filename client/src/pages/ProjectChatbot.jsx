import { useRef, useEffect, useState } from "react";

const API_BASE = (import.meta.env.VITE_API_URL || "/api").replace(/\/+$/, "");

// Render's free plan puts idle servers to sleep; the first request can be slow.
const REQUEST_TIMEOUT_MS = 60000;
// How many previous messages are sent along so follow-up questions make sense.
const HISTORY_LIMIT = 8;

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

// Full class names are written out (not built dynamically) so Tailwind can detect them.
const TONES = {
  blue: "bg-blue-50 text-blue-600",
  red: "bg-red-50 text-red-500",
  green: "bg-emerald-50 text-emerald-500",
  purple: "bg-purple-50 text-purple-600",
  orange: "bg-orange-50 text-orange-500",
};

// Quick-help cards. `title` is shown to the user; `question` is the full,
// specific question actually sent to the chatbot.
const QUICK_HELP = [
  {
    title: "Registration Help",
    sub: "Create your account",
    icon: IUser,
    tone: "blue",
    question: "How do I register and create an account on CodeVantage?",
  },
  {
    title: "Program Details",
    sub: "Explore internships",
    icon: IFile,
    tone: "red",
    question: "What internship programs does CodeVantage offer and how do they work?",
  },
  {
    title: "Certificates",
    sub: "Eligibility & download",
    icon: IAward,
    tone: "green",
    question: "How do I become eligible for a certificate, and how do I download it?",
  },
  {
    title: "Submission Help",
    sub: "How to submit projects",
    icon: IList,
    tone: "purple",
    question: "How do I submit my project tasks for review, and what happens after I submit?",
  },
  {
    title: "Payment Support",
    sub: "Fees & transactions",
    icon: ICard,
    tone: "orange",
    question: "How does the certificate fee payment work, and how is it verified?",
  },
  {
    title: "Other Questions",
    sub: "Get instant help",
    icon: IHelp,
    tone: "blue",
    question: "What kinds of questions can you help me with about CodeVantage?",
  },
];

function BotAvatar() {
  return (
    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-b from-blue-100 to-blue-50 text-blue-600 shadow-inner min-[420px]:h-12 min-[420px]:w-12">
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
      intro: true,
    },
    {
      role: "assistant",
      text: "How can I help you today?\nFeel free to ask anything! 😊",
      intro: true,
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

  // Previous conversation (without the welcome messages) sent for context.
  function buildHistory() {
    return messages
      .filter((m) => !m.intro)
      .slice(-HISTORY_LIMIT)
      .map((m) => ({ role: m.role, text: m.apiText ?? m.text }));
  }

  // question: the text sent to the chatbot.
  // label:    optional text shown in the user's bubble (quick-help title).
  // restoreInput: put the text back in the input box if the request fails.
  async function sendQuestion(question, { label, restoreInput = false } = {}) {
    if (!question || loading) return;

    const history = buildHistory();
    const userMessage = { role: "user", text: label ?? question, apiText: question };

    setMessages((current) => [...current, userMessage]);
    setInput("");
    setError("");
    setLoading(true);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
      const response = await fetch(`${API_BASE}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: question, history }),
        signal: controller.signal,
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
      // Take the failed message back out and give the user their text again,
      // so they can simply press send once more.
      setMessages((current) => current.filter((m) => m !== userMessage));
      if (restoreInput) setInput(question);

      if (err.name === "AbortError") {
        setError("The server is taking too long to respond. It may be waking up, so please try again in a moment.");
      } else {
        setError(err.message || "Could not connect to the chatbot.");
      }
    } finally {
      clearTimeout(timeoutId);
      setLoading(false);
    }
  }

  function handleSubmit(event) {
    event.preventDefault();
    sendQuestion(input.trim(), { restoreInput: true });
  }

  function renderMessage(message, index) {
    const isUser = message.role === "user";
    return (
      <div key={`${index}-${message.role}`}>
        <div className={`flex items-start gap-3 ${isUser ? "justify-end" : "justify-start"}`}>
          {!isUser && <BotAvatar />}
          <div
            className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-left text-[13px] leading-relaxed [overflow-wrap:anywhere] min-[420px]:text-sm ${
              isUser
                ? "rounded-br-md bg-blue-600 text-white"
                : "rounded-tl-md bg-blue-50/75 text-[#0b1b4b]/90"
            }`}
          >
            {message.greeting && (
              <p className="mb-0.5 text-lg font-bold text-[#0b1b4b]">
                Hi! <span aria-hidden="true">👋</span>
              </p>
            )}
            {message.text}
          </div>
        </div>
        {!isUser && index < 2 && (
          <p className="ml-[52px] mt-1 text-xs text-slate-500 min-[420px]:ml-[60px]">Just now</p>
        )}
      </div>
    );
  }

  const panelHeight = minimized
    ? "h-auto"
    : expanded
    ? "h-[min(720px,calc(100dvh_-_6rem))] min-h-[360px]"
    : "h-[min(520px,calc(100dvh_-_8rem))] min-h-[360px]";

  return (
    <div
      className={`relative z-[1] mx-auto flex w-full flex-col items-stretch gap-3 font-sans text-[#0b1b4b] ${
        expanded ? "max-w-[860px]" : "max-w-[640px]"
      }`}
    >
      {open && (
        <section
          className={`flex w-full flex-col overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-[0_20px_60px_rgba(37,99,235,0.22)] ${panelHeight}`}
          aria-label="Project AI chatbot"
        >
          {/* header */}
          <header className="flex shrink-0 items-center gap-3 bg-gradient-to-r from-blue-700 via-blue-600 to-[#1e60f0] px-4 py-3.5 min-[420px]:px-5">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white">
              <LogoMark />
            </span>
            <div className="min-w-0 flex-1 text-left">
              <h2 className="m-0 truncate text-[17px] font-semibold text-white min-[420px]:text-lg">
                CodeVantage Assistant
              </h2>
              <p className="m-0 flex items-center gap-2 text-sm text-white/90">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 ring-2 ring-white/60" /> Online
              </p>
            </div>
            <button
              type="button"
              className="flex cursor-pointer rounded-lg p-1.5 text-white/90 transition-colors hover:bg-white/15 hover:text-white"
              onClick={() => setMinimized((v) => !v)}
              aria-label={minimized ? "Expand chat" : "Minimize chat"}
            >
              <IMin />
            </button>
            <button
              type="button"
              className="hidden cursor-pointer rounded-lg p-1.5 text-white/90 transition-colors hover:bg-white/15 hover:text-white min-[420px]:flex"
              onClick={() => setExpanded((v) => !v)}
              aria-label={expanded ? "Shrink chat" : "Enlarge chat"}
            >
              {expanded ? <IShrink /> : <IMax />}
            </button>
            <button
              type="button"
              className="flex cursor-pointer rounded-lg p-1.5 text-white/90 transition-colors hover:bg-white/15 hover:text-white"
              onClick={() => setOpen(false)}
              aria-label="Close chat"
            >
              <IClose />
            </button>
          </header>

          {!minimized && (
            <>
              {/* messages */}
              <div
                className="flex min-h-0 flex-1 flex-col gap-3.5 overflow-y-auto px-4 pb-2 pt-4 min-[420px]:gap-4 min-[420px]:px-5"
                aria-live="polite"
              >
                {messages.slice(0, 1).map((m, i) => renderMessage(m, i))}

                {!hasUserMessage && (
                  <div className="text-left">
                    <p className="m-0 text-lg font-bold">Quick Help</p>
                    <p className="m-0 mb-3 text-[13px] text-slate-500">
                      Choose a topic or type your question below.
                    </p>
                    <div className="grid grid-cols-1 gap-2.5 min-[420px]:grid-cols-2">
                      {QUICK_HELP.map(({ title, sub, icon: Ico, tone, question }) => (
                        <button
                          key={title}
                          type="button"
                          className="flex w-full cursor-pointer items-center gap-2 rounded-2xl border border-slate-200 bg-white p-2 text-left shadow-sm transition hover:border-blue-600/40 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
                          disabled={loading}
                          onClick={() => sendQuestion(question, { label: title })}
                        >
                          <span
                            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] ${TONES[tone]}`}
                          >
                            <Ico size={18} />
                          </span>
                          <span className="block min-w-0 flex-1">
                            <span className="block truncate text-[13px] font-semibold leading-tight text-[#0b1b4b]">
                              {title}
                            </span>
                            <span className="block truncate text-[11px] leading-tight text-slate-500">
                              {sub}
                            </span>
                          </span>
                          <IChevron size={14} className="shrink-0 text-blue-600" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {messages.slice(1).map((m, i) => renderMessage(m, i + 1))}

                {loading && (
                  <div className="flex items-start gap-3">
                    <BotAvatar />
                    <div className="max-w-[85%] rounded-2xl rounded-tl-md bg-blue-50/75 px-4 py-2.5 text-left text-[13px] leading-relaxed text-slate-500 min-[420px]:text-sm">
                      Thinking…
                    </div>
                  </div>
                )}
                <div ref={bottomRef} />
              </div>

              {error && (
                <p className="m-0 shrink-0 px-4 pb-2 text-left text-xs text-red-600 min-[420px]:px-5" role="alert">
                  {error}
                </p>
              )}

              {/* input */}
              <form className="shrink-0 px-4 pb-4 pt-2 min-[420px]:px-5" onSubmit={handleSubmit}>
                <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white py-1.5 pl-4 pr-1.5 focus-within:ring-2 focus-within:ring-blue-600/30">
                  <IClip size={20} className="shrink-0 text-slate-500" />
                  <input
                    className="min-w-0 flex-1 bg-transparent text-base text-[#0b1b4b] outline-none placeholder:text-slate-500"
                    value={input}
                    onChange={(event) => setInput(event.target.value)}
                    placeholder="Type your message..."
                    aria-label="Ask a question"
                    maxLength={1000}
                    disabled={loading}
                  />
                  <button
                    className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full bg-blue-600 text-white shadow-[0_4px_10px_rgba(37,99,235,0.35)] transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60 min-[420px]:h-11 min-[420px]:w-11"
                    type="submit"
                    disabled={loading || !input.trim()}
                    aria-label="Send"
                  >
                    <ISend size={20} />
                  </button>
                </div>
                <p className="m-0 mt-2.5 flex items-start justify-center gap-2 text-center text-[11px] leading-snug text-slate-500 min-[420px]:items-center min-[420px]:text-xs">
                  <IBulb size={15} className="shrink-0" />
                  <span>Tip: You can ask about registration, programs, certificates, or any support.</span>
                </p>
              </form>
            </>
          )}
        </section>
      )}

      {/* launcher */}
      <div className="flex items-center gap-3">
        <span className="relative hidden rounded-full bg-white px-5 py-2 text-left leading-tight shadow-[0_8px_24px_rgba(15,23,42,0.14)] min-[420px]:inline-block">
          <strong className="block text-sm font-bold text-[#0b1b4b]">Need Help?</strong>
          <small className="block text-xs text-slate-500">Chat with us</small>
          <svg
            className="absolute -bottom-3 right-0 w-12 text-blue-600"
            viewBox="0 0 48 16"
            fill="none"
            aria-hidden="true"
          >
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
          className="relative flex h-14 w-14 cursor-pointer items-center justify-center rounded-full bg-blue-600 text-white shadow-[0_10px_30px_rgba(37,99,235,0.45)] transition-transform hover:scale-105 sm:h-16 sm:w-16"
          onClick={() => {
            setOpen((v) => !v);
            setMinimized(false);
          }}
          aria-label={open ? "Close chat" : "Open chat"}
        >
          <IChat size={28} />
          <span className="absolute bottom-1 right-1 h-3.5 w-3.5 rounded-full border-2 border-white bg-emerald-500" />
        </button>
      </div>
    </div>
  );
}
