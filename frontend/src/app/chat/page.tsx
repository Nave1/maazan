"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

const API = "http://localhost:8000/api/v1";

interface Message {
  id?: string;
  role: "user" | "assistant";
  content: string;
  created_at?: string;
}

interface Conversation {
  id: string;
  title: string | null;
  last_message_at: string | null;
}

export default function ChatPage() {
  const router = useRouter();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const [messages, setMessages] = useState<Message[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversation, setCurrentConversation] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([
    "מה המצב הפיננסי שלי?",
    "כמה הוצאתי החודש?",
    "איך אני יכול לחסוך?",
  ]);

  const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;

  useEffect(() => {
    if (!token) { router.push("/login"); return; }
    loadConversations();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function loadConversations() {
    try {
      const res = await fetch(`${API}/ai/conversations`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) setConversations(await res.json());
    } catch (err) { console.error(err); }
  }

  async function loadConversation(id: string) {
    try {
      const res = await fetch(`${API}/ai/conversations/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) { const data = await res.json(); setMessages(data.messages); setCurrentConversation(id); }
    } catch (err) { console.error(err); }
  }

  function startNewConversation() {
    setMessages([]);
    setCurrentConversation(null);
    setSuggestions(["מה המצב הפיננסי שלי?", "כמה הוצאתי החודש?", "איך אני יכול לחסוך?"]);
    inputRef.current?.focus();
  }

  async function sendMessage(text?: string) {
    const msg = text || input.trim();
    if (!msg || loading) return;

    setMessages((prev) => [...prev, { role: "user", content: msg }]);
    setInput("");
    setLoading(true);
    setSuggestions([]);

    try {
      const res = await fetch(`${API}/ai/chat`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ message: msg, conversation_id: currentConversation }),
      });
      if (res.ok) {
        const data = await res.json();
        setMessages((prev) => [...prev, { role: "assistant", content: data.response }]);
        setCurrentConversation(data.conversation_id);
        setSuggestions(data.suggestions || []);
        loadConversations();
      } else {
        const err = await res.json();
        setMessages((prev) => [...prev, { role: "assistant", content: `שגיאה: ${err.detail || "משהו השתבש"}` }]);
      }
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: "שגיאה בתקשורת עם השרת. נסה שוב." }]);
    } finally { setLoading(false); }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  }

  function formatMessage(content: string): React.ReactNode[] {
    return content.split("\n").map((line, i) => {
      // Bold text — split by ** markers and render safely
      const parts = line.split(/\*\*(.*?)\*\*/g);
      const rendered = parts.map((part, j) =>
        j % 2 === 1 ? <strong key={j}>{part}</strong> : part
      );

      if (/^\d+\.\s/.test(line))
        return <div key={i} className="mr-4 mb-1">{rendered}</div>;
      if (line.startsWith("- "))
        return <div key={i} className="mr-4 mb-1">• {parts.length > 1 ? rendered.slice(1) : line.slice(2)}</div>;
      if (!line)
        return <div key={i} className="h-2" />;
      return <div key={i} className="mb-1">{rendered}</div>;
    });
  }

  return (
    <div dir="rtl" className="flex h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className="glass-sidebar w-72 flex flex-col fixed inset-y-0 right-0 z-40">
        {/* Logo */}
        <div className="px-6 py-6 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{background: 'linear-gradient(135deg, #d4a853 0%, #c49b48 100%)'}}>
              <span className="text-lg font-bold text-slate-900">מ</span>
            </div>
            <div>
              <div className="font-bold text-white text-lg">יועץ AI</div>
              <div className="text-[11px] text-slate-500">מאזן</div>
            </div>
          </div>
        </div>

        {/* New chat button */}
        <div className="px-4 py-4">
          <button
            onClick={startNewConversation}
            className="w-full px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2"
            style={{background: 'linear-gradient(135deg, #d4a853 0%, #c49b48 100%)', color: '#0f172a'}}
          >
            <span>+</span> שיחה חדשה
          </button>
        </div>

        {/* Conversations list */}
        <div className="flex-1 overflow-y-auto px-3">
          {conversations.map((conv) => (
            <button
              key={conv.id}
              onClick={() => loadConversation(conv.id)}
              className={`w-full text-right px-4 py-3 rounded-xl mb-1 transition-all duration-200 ${
                currentConversation === conv.id
                  ? "bg-white/10 text-white"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <div className="text-sm font-medium truncate">{conv.title || "שיחה חדשה"}</div>
              {conv.last_message_at && (
                <div className="text-xs text-slate-600 mt-1">
                  {new Date(conv.last_message_at).toLocaleDateString("he-IL")}
                </div>
              )}
            </button>
          ))}
        </div>

        {/* Nav links */}
        <div className="px-3 py-4 border-t border-white/5 space-y-1">
          <a href="/dashboard" className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-all">
            <span>📊</span> דשבורד
          </a>
          <a href="/bank" className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-all">
            <span>🏦</span> בנקים
          </a>
        </div>
      </aside>

      {/* Chat area */}
      <div className="flex-1 flex flex-col mr-72">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-8">
          {messages.length === 0 && (
            <div className="max-w-2xl mx-auto text-center py-20 page-enter">
              <div className="w-20 h-20 rounded-2xl mx-auto mb-6 flex items-center justify-center" style={{background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)'}}>
                <span className="text-3xl">✨</span>
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">שלום, אני מאזן</h2>
              <p className="text-slate-500 mb-10 max-w-md mx-auto">
                היועץ הפיננסי האישי שלך. שאל אותי כל שאלה על הכספים שלך ואעזור לך לקבל החלטות חכמות.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 max-w-xl mx-auto">
                {suggestions.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => sendMessage(s)}
                    className="card-subtle p-4 hover:shadow-md transition-all duration-200 text-sm text-right text-slate-700"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="max-w-3xl mx-auto space-y-5">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === "user" ? "justify-start" : "justify-end"} page-enter`}>
                <div className="flex items-start gap-3 max-w-[80%]">
                  {msg.role === "user" && (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex-shrink-0 flex items-center justify-center text-xs font-bold text-slate-900 mt-1">
                      א
                    </div>
                  )}
                  <div
                    className={`rounded-2xl px-5 py-3.5 ${
                      msg.role === "user"
                        ? "bg-slate-900 text-white rounded-br-lg"
                        : "card-subtle border border-slate-100 rounded-bl-lg"
                    }`}
                  >
                    {msg.role === "assistant" ? (
                      <div className="text-slate-700 text-sm leading-relaxed">{formatMessage(msg.content)}</div>
                    ) : (
                      <p className="text-sm leading-relaxed">{msg.content}</p>
                    )}
                  </div>
                  {msg.role === "assistant" && (
                    <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center mt-1" style={{background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)'}}>
                      <span className="text-sm">✨</span>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-end page-enter">
                <div className="flex items-start gap-3">
                  <div className="card-subtle border border-slate-100 rounded-2xl rounded-bl-lg px-5 py-4">
                    <div className="flex gap-1.5">
                      <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce [animation-delay:0.15s]" />
                      <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce [animation-delay:0.3s]" />
                    </div>
                  </div>
                  <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center mt-1" style={{background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)'}}>
                    <span className="text-sm">✨</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Suggestions bar */}
        {suggestions.length > 0 && messages.length > 0 && (
          <div className="px-6 pb-2 flex gap-2 overflow-x-auto max-w-3xl mx-auto w-full">
            {suggestions.map((s, i) => (
              <button key={i} onClick={() => sendMessage(s)}
                className="whitespace-nowrap px-4 py-2 text-sm border border-slate-200 text-slate-600 rounded-full hover:bg-white hover:shadow-sm transition-all duration-200">
                {s}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <div className="px-6 py-4 border-t border-slate-200 bg-white">
          <div className="max-w-3xl mx-auto flex gap-3 items-end">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="שאל את מאזן..."
              rows={1}
              className="flex-1 resize-none rounded-xl border border-slate-200 bg-slate-50 px-5 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400 focus:bg-white transition-all duration-200 placeholder:text-slate-400"
              style={{ minHeight: "48px", maxHeight: "120px" }}
            />
            <button
              onClick={() => sendMessage()}
              disabled={!input.trim() || loading}
              className="btn-primary px-5 py-3 disabled:opacity-40"
            >
              שלח
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
