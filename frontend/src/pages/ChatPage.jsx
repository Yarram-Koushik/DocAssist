import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { 
  Send, 
  Trash2, 
  Plus, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  AlertTriangle, 
  FileText, 
  PhoneCall, 
  Copy, 
  Check, 
  ShieldCheck, 
  ChevronRight,
  Stethoscope,
  Info,
  HelpCircle
} from 'lucide-react';
import { useChat } from '../hooks/useChat';
import { cn } from '../lib/utils';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { DoctorSummaryModal } from '../components/summary/DoctorSummaryModal';
import { get } from '../lib/api';
import { toast } from 'react-hot-toast';

export const ChatPage = () => {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const { 
    conversations, 
    messages, 
    loading, 
    loadConversations, 
    createConversation, 
    loadMessages, 
    sendMessage, 
    deleteConversation, 
    clearMessages 
  } = useChat();

  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [speakingMessageId, setSpeakingMessageId] = useState(null);
  const [summaryModalOpen, setSummaryModalOpen] = useState(false);
  const [userReports, setUserReports] = useState([]);
  const [copiedId, setCopiedId] = useState(null);
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    loadConversations();
    get('/reports/').then(res => setUserReports(res.data.data.items || res.data.data || [])).catch(() => {});
  }, []);

  useEffect(() => {
    if (conversationId) {
      loadMessages(conversationId);
    } else {
      clearMessages();
    }
  }, [conversationId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Setup Web Speech API for voice dictation
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map(result => result[0].transcript)
          .join('');
        setInput(transcript);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.onerror = (e) => {
        console.error("Speech recognition error:", e);
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const toggleVoiceInput = () => {
    if (!recognitionRef.current) {
      toast.error('Voice dictation is not supported in this browser.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
        toast('Listening to your symptoms...', { icon: '🎙️' });
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleTextToSpeech = (msgId, text) => {
    if (!('speechSynthesis' in window)) {
      toast.error('Audio playback is not supported in your browser.');
      return;
    }

    if (speakingMessageId === msgId) {
      window.speechSynthesis.cancel();
      setSpeakingMessageId(null);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.onend = () => setSpeakingMessageId(null);
    utterance.onerror = () => setSpeakingMessageId(null);

    setSpeakingMessageId(msgId);
    window.speechSynthesis.speak(utterance);
  };

  const handleSend = async (e, customText) => {
    if (e) e.preventDefault();
    const messageToSend = customText || input;
    if (!messageToSend.trim()) return;

    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }

    let currentId = conversationId;
    if (!currentId) {
      const newConv = await createConversation();
      currentId = newConv.id;
      navigate(`/chat/${currentId}`, { replace: true });
    }

    setInput('');
    await sendMessage(currentId, messageToSend);
  };

  const copyMessage = (id, text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success('Copied to clipboard');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const starterQuestions = [
    { title: 'Evaluate Common Cold & Fever', desc: 'Symptoms timeline, fever thresholds, and self-care tips' },
    { title: 'Explain Lab Test Results', desc: 'Understand CBC, Lipid, or Liver function values' },
    { title: 'Check Medication Side Effects', desc: 'Ask about uses, interactions, and precautions' },
    { title: 'Heartburn vs Chest Pain Warning', desc: 'Differentiate routine reflux from cardiac red flags' }
  ];

  const hasEmergency = messages.some(m => m.emergency_flag === true);

  return (
    <div className="flex h-[calc(100vh-7.5rem)] bg-white dark:bg-card-dark rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
      
      {/* Sidebar - Conversation History */}
      <div className="w-72 border-r border-gray-200 dark:border-gray-800 flex flex-col bg-gray-50/50 dark:bg-card-dark/60">
        <div className="p-3.5 border-b border-gray-200 dark:border-gray-800">
          <Button 
            className="w-full gap-2 font-semibold shadow-xs" 
            onClick={() => navigate('/chat')}
          >
            <Plus className="h-4 w-4" /> New Consultation
          </Button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {conversations.length === 0 ? (
            <div className="p-4 text-center text-xs text-gray-400">
              No conversations yet.
            </div>
          ) : (
            conversations.map(c => (
              <div 
                key={c.id} 
                onClick={() => navigate(`/chat/${c.id}`)}
                className={cn(
                  "group px-3 py-2.5 rounded-xl cursor-pointer text-xs font-medium flex items-center justify-between transition-all",
                  conversationId === String(c.id) 
                    ? "bg-primary/10 text-primary font-semibold shadow-xs" 
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/80"
                )}
              >
                <div className="truncate flex-1 pr-2">
                  <p className="truncate">{c.title || 'New Conversation'}</p>
                </div>
                <button 
                  onClick={(e) => { 
                    e.stopPropagation(); 
                    deleteConversation(c.id); 
                    if (conversationId === String(c.id)) navigate('/chat'); 
                  }}
                  className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 p-1 rounded transition-opacity"
                  title="Delete chat"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Sidebar Footer info */}
        <div className="p-3 border-t border-gray-200 dark:border-gray-800 bg-white/50 dark:bg-card-dark/80 text-[11px] text-gray-500 flex items-center gap-1.5">
          <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0" />
          <span>Encrypted Medical Assistant Session</span>
        </div>
      </div>

      {/* Main Chat Workspace */}
      <div className="flex-1 flex flex-col bg-white dark:bg-card-dark relative">
        
        {/* Chat Top Header */}
        <div className="px-6 py-3 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between bg-white dark:bg-card-dark">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <Stethoscope className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-bold text-gray-900 dark:text-gray-100 text-sm flex items-center gap-2">
                DocAssist Medical AI
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300">
                  Online
                </span>
              </h2>
              <p className="text-[11px] text-gray-500">
                RAG-powered clinical knowledge • Always consult a physician for treatment
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSummaryModalOpen(true)}
              disabled={messages.length === 0}
              className="gap-1.5 text-xs font-semibold"
            >
              <FileText className="h-3.5 w-3.5 text-primary" />
              Generate Doctor Note
            </Button>
          </div>
        </div>

        {/* Emergency Alert Banner */}
        {hasEmergency && (
          <div className="bg-red-500 text-white px-6 py-3 flex items-center justify-between gap-4 shadow-md animate-pulse">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-6 w-6 shrink-0" />
              <div className="text-xs">
                <p className="font-bold uppercase tracking-wider">Critical / Urgent Symptoms Flagged</p>
                <p className="opacity-90">If you are experiencing severe difficulty breathing, sudden chest tightness, or stroke signs, seek immediate care.</p>
              </div>
            </div>
            <a 
              href="tel:911"
              className="px-3.5 py-1.5 bg-white text-red-600 rounded-lg text-xs font-bold flex items-center gap-1.5 hover:bg-gray-100 transition-colors shrink-0"
            >
              <PhoneCall className="h-3.5 w-3.5" /> Call 911 / 112
            </a>
          </div>
        )}

        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {loading && messages.length === 0 ? (
            <div className="h-full flex items-center justify-center">
              <LoadingSpinner />
            </div>
          ) : messages.length === 0 ? (
            <div className="h-full max-w-xl mx-auto flex flex-col items-center justify-center text-center space-y-6">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shadow-sm">
                <Sparkles className="h-8 w-8" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                  How can DocAssist support your health today?
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 max-w-md">
                  Describe symptoms, upload lab results, or inquire about medications. DocAssist provides verified medical education and references.
                </p>
              </div>

              {/* Starter Question Cards */}
              <div className="grid sm:grid-cols-2 gap-3 w-full text-left">
                {starterQuestions.map((sq, i) => (
                  <button
                    key={i}
                    onClick={() => handleSend(null, sq.title)}
                    className="p-3.5 rounded-xl border border-gray-200 dark:border-gray-800 hover:border-primary/50 hover:bg-primary/5 dark:hover:bg-gray-800/80 transition-all text-left group space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-gray-800 dark:text-gray-200 group-hover:text-primary transition-colors">
                        {sq.title}
                      </span>
                      <ChevronRight className="h-3.5 w-3.5 text-gray-400 group-hover:text-primary transition-colors" />
                    </div>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 line-clamp-2">
                      {sq.desc}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-6 max-w-3xl mx-auto">
              {messages.map((m, i) => {
                const isUser = m.role === 'user';
                const isEmergency = m.emergency_flag;
                const metadata = typeof m.metadata_info === 'string' 
                  ? JSON.parse(m.metadata_info || '{}') 
                  : (m.metadata_info || {});
                const followUps = metadata.follow_up_questions || [];
                const topics = metadata.related_topics || [];
                const sources = typeof m.sources === 'string' ? JSON.parse(m.sources || '[]') : (m.sources || []);

                return (
                  <div key={m.id || i} className={cn("flex flex-col space-y-2", isUser ? "items-end" : "items-start")}>
                    <div className={cn(
                      "flex gap-3 max-w-[85%] rounded-2xl p-4 transition-all",
                      isUser 
                        ? "bg-primary text-white rounded-br-xs shadow-xs" 
                        : isEmergency 
                          ? "bg-rose-50 dark:bg-rose-950/30 border border-rose-300 dark:border-rose-800 text-gray-900 dark:text-gray-100 rounded-bl-xs shadow-xs" 
                          : "bg-gray-100 dark:bg-gray-800/80 text-gray-900 dark:text-gray-100 rounded-bl-xs shadow-xs"
                    )}>
                      {!isUser && (
                        <div className="w-7 h-7 rounded-lg bg-primary/20 text-primary flex items-center justify-center shrink-0 mt-0.5">
                          <Stethoscope className="h-4 w-4" />
                        </div>
                      )}

                      <div className="flex-1 space-y-2">
                        <div className="text-sm leading-relaxed whitespace-pre-wrap">
                          {m.content || m.message}
                        </div>

                        {/* Assistant message footer: Audio & Copy & Confidence */}
                        {!isUser && (
                          <div className="flex flex-wrap items-center justify-between pt-2 border-t border-gray-200/60 dark:border-gray-700/60 text-[11px] text-gray-500 gap-2">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleTextToSpeech(m.id || i, m.content || m.message)}
                                className="flex items-center gap-1 hover:text-primary transition-colors font-medium"
                                title="Listen to answer"
                              >
                                {speakingMessageId === (m.id || i) ? (
                                  <>
                                    <VolumeX className="h-3.5 w-3.5 text-primary animate-pulse" />
                                    <span>Stop</span>
                                  </>
                                ) : (
                                  <>
                                    <Volume2 className="h-3.5 w-3.5" />
                                    <span>Listen</span>
                                  </>
                                )}
                              </button>

                              <button
                                onClick={() => copyMessage(m.id || i, m.content || m.message)}
                                className="flex items-center gap-1 hover:text-primary transition-colors ml-2"
                                title="Copy message"
                              >
                                {copiedId === (m.id || i) ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
                                <span>Copy</span>
                              </button>
                            </div>

                            {m.confidence_score && (
                              <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-gray-200 dark:bg-gray-700">
                                Confidence: {typeof m.confidence_score === 'number' ? `${Math.round(m.confidence_score * 100)}%` : m.confidence_score}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Sources citations if available */}
                    {!isUser && sources && sources.length > 0 && (
                      <div className="text-[11px] text-gray-500 pl-2 space-y-1">
                        <span className="font-semibold text-gray-600 dark:text-gray-400">Sources Cited:</span>
                        <div className="flex flex-wrap gap-1.5">
                          {sources.map((src, sIdx) => (
                            <span key={sIdx} className="px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                              {src.title || src.name || 'Medical Source'}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}

              {loading && (
                <div className="flex items-center gap-2 text-xs text-gray-500 italic p-3 bg-gray-50 dark:bg-gray-800/40 rounded-xl max-w-xs animate-pulse">
                  <span className="h-2 w-2 rounded-full bg-primary animate-ping" />
                  DocAssist is analyzing medical knowledge base...
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Form Bar */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-card-dark">
          <form onSubmit={handleSend} className="flex items-center gap-2 max-w-3xl mx-auto">
            <button
              type="button"
              onClick={toggleVoiceInput}
              className={cn(
                "p-2.5 rounded-xl border transition-all",
                isListening 
                  ? "border-red-500 bg-red-50 text-red-500 dark:bg-red-950/30 animate-pulse" 
                  : "border-gray-300 dark:border-gray-700 text-gray-500 hover:text-primary hover:border-primary"
              )}
              title={isListening ? "Stop listening" : "Voice dictation"}
            >
              {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            </button>

            <Input 
              value={input} 
              onChange={e => setInput(e.target.value)} 
              placeholder={isListening ? "Listening... speak clearly" : "Type medical questions, symptoms, or medications..."} 
              className="flex-1 rounded-xl h-11"
              disabled={loading}
            />

            <Button 
              type="submit" 
              disabled={loading || !input.trim()}
              className="rounded-xl h-11 px-4 gap-1.5 font-semibold"
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </div>

      {/* Doctor Summary Modal */}
      <DoctorSummaryModal
        isOpen={summaryModalOpen}
        onClose={() => setSummaryModalOpen(false)}
        conversationId={conversationId}
        reports={userReports}
      />
    </div>
  );
};

