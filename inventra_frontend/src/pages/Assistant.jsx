import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, User, Sparkles } from 'lucide-react';
import { chatResponses } from '../data/dummy';

const suggestions = [
  'Which medicines need reordering?',
  'What medicines will expire this month?',
  'Show critical stock medicines.',
  'Predict demand for Paracetamol.',
];

function getBotReply(q) {
  const l = q.toLowerCase();
  if (l.includes('reorder') || l.includes('reorder')) return chatResponses.reorder.a;
  if (l.includes('expir')) return chatResponses.expiry.a;
  if (l.includes('critical')) return chatResponses.critical.a;
  if (l.includes('paracetamol') || l.includes('demand') || l.includes('predict')) return chatResponses.paracetamol.a;
  return `Based on current inventory data, I can help you with:\n\n• **Medicine availability** — Check current stock levels\n• **Demand forecasting** — AI predictions for next 3–6 months\n• **Expiry alerts** — Medicines expiring soon\n• **Restock recommendations** — Priority orders with quantities\n• **Analytics insights** — Sales trends and category analysis\n\nTry asking: "Which medicines need reordering?" or "What is the forecast for Cetirizine?"`;
}

export default function Assistant() {
  const [messages, setMessages] = useState([
    { id: 0, role: 'ai', text: `Hello! I'm **Inventra AI**, your intelligent pharmacy inventory assistant.\n\nI can help you with demand forecasting, stock analysis, expiry monitoring, and reorder recommendations. What would you like to know?`, time: 'Now' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  function send(text) {
    const q = text || input.trim();
    if (!q) return;
    setInput('');
    const userMsg = { id: Date.now(), role: 'user', text: q, time: 'Just now' };
    setMessages(m => [...m, userMsg]);
    setLoading(true);
    setTimeout(() => {
      setMessages(m => [...m, { id: Date.now() + 1, role: 'ai', text: getBotReply(q), time: 'Just now' }]);
      setLoading(false);
    }, 900);
  }

  function renderText(text) {
    return text.split('\n').map((line, i) => {
      const bold = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      return <p key={i} className="text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: bold || '&nbsp;' }} />;
    });
  }

  return (
    <div className="h-[calc(100vh-7rem)] flex flex-col">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
          <Sparkles size={22} className="text-blue-500" />
          AI Assistant
        </h1>
        <p className="text-sm text-gray-500 mt-0.5">Intelligent inventory analysis and recommendations</p>
      </div>

      <div className="flex-1 glass-card flex flex-col overflow-hidden">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <AnimatePresence>
            {messages.map(msg => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
              >
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${msg.role === 'ai' ? 'bg-gradient-to-br from-blue-500 to-blue-700' : 'bg-gradient-to-br from-gray-400 to-gray-600'}`}>
                  {msg.role === 'ai' ? <Bot size={15} className="text-white" /> : <User size={15} className="text-white" />}
                </div>
                <div className={`max-w-[78%] rounded-2xl px-4 py-3 ${msg.role === 'ai' ? 'bg-gray-50 dark:bg-gray-700/60 text-gray-800 dark:text-gray-100 rounded-tl-sm' : 'bg-blue-600 text-white rounded-tr-sm'}`}>
                  {msg.role === 'ai' && <p className="text-[10px] font-semibold text-blue-500 dark:text-blue-400 mb-1.5 uppercase tracking-wide">Inventra AI</p>}
                  <div className={`space-y-0.5 ${msg.role === 'user' ? 'text-white' : ''}`}>
                    {renderText(msg.text)}
                  </div>
                  <p className={`text-[10px] mt-2 ${msg.role === 'user' ? 'text-blue-200' : 'text-gray-400 dark:text-gray-500'}`}>{msg.time}</p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {loading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
                <Bot size={15} className="text-white" />
              </div>
              <div className="bg-gray-50 dark:bg-gray-700/60 rounded-2xl rounded-tl-sm px-4 py-3">
                <div className="flex gap-1 items-center h-5">
                  {[0, 1, 2].map(i => (
                    <motion.div key={i} className="w-2 h-2 bg-blue-400 rounded-full" animate={{ y: [-2, 2, -2] }} transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }} />
                  ))}
                </div>
              </div>
            </motion.div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Suggestions */}
        <div className="px-4 pb-3 flex gap-2 flex-wrap">
          {suggestions.map(s => (
            <button key={s} onClick={() => send(s)} className="text-xs px-3 py-1.5 rounded-full border border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:border-blue-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors bg-gray-50 dark:bg-gray-800/50 truncate max-w-[180px]">
              {s}
            </button>
          ))}
        </div>

        {/* Input */}
        <div className="p-4 pt-0 border-t border-gray-100 dark:border-gray-700 flex gap-3">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && send()}
            placeholder="Ask about inventory, forecasts, expiry alerts…"
            className="input-field flex-1"
          />
          <button onClick={() => send()} disabled={!input.trim() || loading} className="btn-primary px-4 disabled:opacity-40">
            <Send size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}
