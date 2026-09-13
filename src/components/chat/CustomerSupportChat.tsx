import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  MessageSquare, 
  Send, 
  Globe, 
  Bot, 
  User as UserIcon, 
  Sparkles, 
  HelpCircle,
  Clock,
  ShieldCheck
} from 'lucide-react';
import { formatDateTime } from '../../utils/format';

export const CustomerSupportChat: React.FC = () => {
  const { 
    chatMessages, 
    sendChatMessage, 
    currentUser, 
    chatLanguage, 
    setChatLanguage 
  } = useApp();

  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;
    sendChatMessage(inputMessage.trim(), chatLanguage);
    setInputMessage('');
  };

  // Quick FAQ question prompts depending on chosen language
  const faqPresets = {
    id: [
      'Apakah beras Pandan Wangi 5kg masih ada stok?',
      'Apakah pengantaran ke RT 04 gratis ongkir?',
      'Bisa bayar COD saat sembako tiba di rumah?',
      'Warung buka sampai jam berapa malam ini?',
    ],
    en: [
      'Is 5kg Pandan Wangi rice in stock?',
      'Is home delivery free for neighborhood residents?',
      'Can I pay via Cash on Delivery (COD)?',
      'What are your store operating hours today?',
    ],
    jw: [
      'Beras Pandan Wangi tasih wonten stok mboten pak?',
      'Dugi griya RT 04 gratis ongkir nggih?',
      'Saged bayar COD pas sembako dugi?',
      'Warunge buka ngantos tabuh pinten nggih?',
    ],
  };

  const handleQuickQuestion = (question: string) => {
    sendChatMessage(question, chatLanguage);
  };

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-6 py-4 space-y-4">
      {/* Header with Language Selector */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white flex items-center gap-1.5">
              <span>Bantuan Pelanggan Warga (Live Chat)</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </h2>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Admin warung aktif melayani pertanyaan seputar sembako, stok, & pengantaran
            </p>
          </div>
        </div>

        {/* Multilingual Selector */}
        <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl">
          <Globe className="w-3.5 h-3.5 text-slate-400 ml-1.5" />
          {[
            { id: 'id' as const, label: '🇮🇩 Indonesia' },
            { id: 'en' as const, label: '🇬🇧 English' },
            { id: 'jw' as const, label: '🌾 Basa Jawa' },
          ].map(lang => (
            <button
              key={lang.id}
              onClick={() => setChatLanguage(lang.id)}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
                chatLanguage === lang.id
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-bold'
                  : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              {lang.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Chat Box */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col h-[480px]">
        {/* Messages List */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/50 dark:bg-slate-950/20">
          {chatMessages.map(msg => {
            const isMe = (currentUser.role === 'customer' && msg.sender === 'customer') ||
                         (currentUser.role !== 'customer' && msg.sender === 'admin');
            const isBot = msg.sender === 'bot';

            return (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${isMe ? 'justify-end' : 'justify-start'}`}
              >
                {!isMe && (
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-white text-xs font-bold ${
                    isBot ? 'bg-indigo-600' : 'bg-emerald-600'
                  }`}>
                    {isBot ? <Bot className="w-4 h-4" /> : <UserIcon className="w-4 h-4" />}
                  </div>
                )}

                <div className={`max-w-[80%] rounded-2xl p-3 shadow-xs space-y-1 ${
                  isMe
                    ? 'bg-emerald-600 text-white rounded-br-xs'
                    : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700/80 rounded-bl-xs'
                }`}>
                  <div className="flex items-center justify-between gap-3 text-[10px] opacity-80">
                    <span className="font-semibold">{msg.senderName}</span>
                    <span>{formatDateTime(msg.timestamp)}</span>
                  </div>
                  <p className="text-xs leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick FAQ Suggestion Chips */}
        <div className="p-2 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex space-x-1.5 overflow-x-auto no-scrollbar text-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider py-1 shrink-0 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-500" /> Tanya Cepat:
          </span>
          {faqPresets[chatLanguage].map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleQuickQuestion(q)}
              className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-[11px] whitespace-nowrap transition-colors"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Chat Input Bar */}
        <form onSubmit={handleSend} className="p-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 flex items-center gap-2">
          <input
            type="text"
            value={inputMessage}
            onChange={e => setInputMessage(e.target.value)}
            placeholder={
              chatLanguage === 'en'
                ? 'Type your message or inquiry about groceries...'
                : chatLanguage === 'jw'
                ? 'Serat pitakenan sembako wonten mriki...'
                : 'Ketik pesan atau pertanyaan seputar sembako & pesanan...'
            }
            className="flex-1 px-3.5 py-2.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />

          <button
            type="submit"
            disabled={!inputMessage.trim()}
            className="p-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white shadow-md shadow-emerald-600/20 transition-all"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
