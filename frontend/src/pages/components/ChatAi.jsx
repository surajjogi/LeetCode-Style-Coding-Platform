import React, { useState } from 'react';
import axiosClient from "../../utils/axiosClient";
import { Send, Bot, User, Loader2 } from 'lucide-react';

const ChatAi = ({ problem, userCode }) => {
  const [messages, setMessages] = useState([
    { role: 'ai', content: `Hi! I'm your AI assistant. How can I help you with "${problem?.title}"?` }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await axiosClient.post('/ai/chat-support', {
        problemTitle: problem?.title,
        problemDescription: problem?.description,
        userCode: userCode,
        question: input
      });

      setMessages((prev) => [...prev, { role: 'ai', content: response.data.reply }]);
    } catch (error) {
      console.error("AI Chat Error:", error);
      setMessages((prev) => [...prev, { role: 'ai', content: "Sorry, I encountered an error. Please try again later." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[500px] bg-[#1a1a1a] rounded-lg border border-gray-800 overflow-hidden">
      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
            <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${msg.role === 'user' ? 'bg-blue-600' : 'bg-purple-600'}`}>
              {msg.role === 'user' ? <User size={16} className="text-white" /> : <Bot size={16} className="text-white" />}
            </div>
            <div className={`px-4 py-2 rounded-xl max-w-[80%] text-sm whitespace-pre-wrap ${msg.role === 'user' ? 'bg-blue-600/20 text-blue-100 rounded-tr-sm' : 'bg-[#262626] text-gray-200 border border-gray-700 rounded-tl-sm'}`}>
              {msg.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex gap-3 flex-row">
            <div className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-purple-600">
              <Bot size={16} className="text-white" />
            </div>
            <div className="px-4 py-3 rounded-xl bg-[#262626] border border-gray-700 rounded-tl-sm flex items-center gap-2 text-gray-400 text-sm">
               <Loader2 size={14} className="animate-spin" /> Thinking...
            </div>
          </div>
        )}
      </div>

      {/* Chat Input */}
      <div className="p-3 bg-[#262626] border-t border-gray-800">
        <div className="relative flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask for a hint or explain an error..."
            className="w-full bg-[#1a1a1a] text-gray-200 text-sm rounded-lg pl-4 pr-10 py-2.5 border border-gray-700 focus:outline-none focus:border-purple-500 transition-colors"
            disabled={loading}
          />
          <button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="absolute right-2 p-1.5 rounded-md text-gray-400 hover:text-white hover:bg-[#333] transition-colors disabled:opacity-50"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatAi;
