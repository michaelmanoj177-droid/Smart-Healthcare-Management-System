import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, Trash2, AlertTriangle, ShieldCheck, Sparkles, User, RefreshCw } from 'lucide-react';
import { aiAPI } from '../../api/ai';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Alert from '../../components/common/Alert';

const AIHealthAssistant = () => {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content:
        '👋 **Hello! I am your Smart Healthcare Assistant.**\n\nI can help you understand medical departments, prepare questions for your doctor, and explore general wellness and preventive care habits.\n\n*What health question or topic would you like to explore today?*',
      provider: 'rule_based_fallback',
      is_fallback: true,
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (messageToSend) => {
    const text = (messageToSend || input).trim();
    if (!text || loading) return;

    setInput('');
    setError('');

    const newMessages = [...messages, { role: 'user', content: text }];
    setMessages(newMessages);
    setLoading(true);

    try {
      const res = await aiAPI.chat(text);
      setMessages([
        ...newMessages,
        {
          role: 'assistant',
          content: res.data.reply,
          provider: res.data.provider,
          is_fallback: res.data.is_fallback,
        },
      ]);
    } catch (err) {
      setError(
        err.response?.data?.message || 'The AI assistant is temporarily unavailable. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setMessages([
      {
        role: 'assistant',
        content:
          'Conversation cleared. How can I assist your health and wellness learning today?',
        is_fallback: true,
      },
    ]);
    setError('');
  };

  const samplePrompts = [
    'What should I ask my cardiologist?',
    'Tips for preventing lower back strain',
    'When should a child with fever see a doctor?',
    'Emergency test: chest pain',
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Title & Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">AI Health Assistant</h1>
            <span className="px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 text-[10px] font-bold border border-purple-200">
              Clinical Education
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            24/7 general health education, specialist department guidance, and consultation preparation.
          </p>
        </div>

        <Button variant="outline" size="sm" onClick={handleClear}>
          <Trash2 className="w-3.5 h-3.5 mr-1 text-gray-400" /> Clear Chat
        </Button>
      </div>

      {/* Mandatory Safety Notice Banner (Section 15) */}
      <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-3 text-amber-900 text-xs">
        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <span className="font-bold">Medical Disclaimer: </span>
          This assistant provides general health education and does not replace professional medical advice, clinical diagnosis, or prescriptions. For severe or life-threatening symptoms, immediately dial emergency services (911 / 112).
        </p>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError('')} />}

      {/* Main Chat Container */}
      <Card className="flex flex-col h-[560px] p-0 overflow-hidden shadow-md">
        {/* Messages Stream */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-surface/50">
          {messages.map((msg, index) => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={index}
                className={`flex gap-3 max-w-[85%] ${
                  isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'
                }`}
              >
                {/* Avatar */}
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-white font-bold text-xs ${
                    isUser
                      ? 'bg-primary'
                      : 'bg-gradient-to-tr from-purple-600 to-indigo-600 shadow-xs'
                  }`}
                >
                  {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>

                {/* Message Bubble */}
                <div
                  className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed whitespace-pre-wrap shadow-xs ${
                    isUser
                      ? 'bg-primary text-white rounded-tr-none'
                      : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            );
          })}

          {loading && (
            <div className="flex gap-3 max-w-[80%] mr-auto items-center">
              <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4 animate-spin" />
              </div>
              <div className="p-4 rounded-2xl bg-white border border-gray-100 text-xs text-gray-400 flex items-center gap-2">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-purple-600" />
                Analyzing clinical guidance...
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Chips */}
        <div className="px-4 py-2 border-t border-gray-100 bg-white flex items-center gap-2 overflow-x-auto">
          <span className="text-[10px] text-gray-400 font-bold uppercase shrink-0">Try asking:</span>
          {samplePrompts.map((prompt, i) => (
            <button
              key={i}
              type="button"
              onClick={() => handleSend(prompt)}
              className="px-2.5 py-1 rounded-full bg-blue-50 text-primary text-[11px] font-medium border border-blue-100 hover:bg-blue-100 shrink-0 transition-colors"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="p-3 border-t border-gray-100 bg-white flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your health inquiry or symptoms..."
            disabled={loading}
            className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
          <Button
            type="submit"
            variant="primary"
            size="md"
            disabled={!input.trim() || loading}
            isLoading={loading}
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </Card>
    </div>
  );
};

export default AIHealthAssistant;
