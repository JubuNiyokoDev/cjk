'use client';

import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Loader2, History, SquarePen, ArrowLeft, MessagesSquare } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { motion, AnimatePresence } from 'framer-motion';
import { API_BASE_URL } from '@/lib/api';
import { ensureValidAccessToken } from '@/lib/auth';
import { useAuthSession } from '@/hooks/use-auth-session';
import type { ChatbotConversation, ChatbotHistoryMessage } from '@/lib/types';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

const SESSION_STORAGE_KEY = 'cjk_chat_session';
const GREETING: Message = {
  id: 'greeting',
  text: "Bonjour ! Je suis l'assistant virtuel du CJK. Comment puis-je vous aider ?",
  sender: 'bot',
  timestamp: new Date(0),
};

function newSessionKey(): string {
  return `session_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

/** N'autorise que les liens http/https dans les réponses du bot. */
function safeHref(href: string | undefined): string | undefined {
  if (!href) return undefined;
  try {
    const parsed = new URL(href, API_BASE_URL);
    if (parsed.protocol === 'http:' || parsed.protocol === 'https:') return parsed.href;
  } catch {
    return undefined;
  }
  return undefined;
}

/** Rendu markdown "style ChatGPT" pour les réponses du bot. */
function BotMarkdown({ text }: { text: string }) {
  return (
    <div className="text-sm leading-relaxed [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          a: ({ href, children }) => {
            const url = safeHref(href);
            if (!url) return <span>{children}</span>;
            return (
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-orange-600 font-medium underline underline-offset-2 hover:text-orange-700"
              >
                {children}
              </a>
            );
          },
          p: ({ children }) => <p className="my-1.5">{children}</p>,
          ul: ({ children }) => <ul className="list-disc pl-4 my-1.5 space-y-1">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal pl-4 my-1.5 space-y-1">{children}</ol>,
          li: ({ children }) => <li className="marker:text-orange-500">{children}</li>,
          h1: ({ children }) => <h3 className="font-bold text-sm mt-2 mb-1">{children}</h3>,
          h2: ({ children }) => <h3 className="font-bold text-sm mt-2 mb-1">{children}</h3>,
          h3: ({ children }) => <h4 className="font-semibold text-sm mt-2 mb-1">{children}</h4>,
          strong: ({ children }) => <strong className="font-semibold text-gray-900">{children}</strong>,
          code: ({ children }) => (
            <code className="bg-gray-200/80 rounded px-1 py-0.5 text-xs font-mono">{children}</code>
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-l-2 border-orange-400 pl-3 my-1.5 text-gray-600 italic">
              {children}
            </blockquote>
          ),
          hr: () => <hr className="my-2 border-gray-200" />,
          table: ({ children }) => (
            <div className="overflow-x-auto my-1.5">
              <table className="text-xs border-collapse">{children}</table>
            </div>
          ),
          th: ({ children }) => <th className="border border-gray-300 px-2 py-1 bg-gray-200/60 text-left">{children}</th>,
          td: ({ children }) => <td className="border border-gray-300 px-2 py-1">{children}</td>,
        }}
      >
        {text}
      </ReactMarkdown>
    </div>
  );
}

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [showPopover, setShowPopover] = useState(true);
  const [view, setView] = useState<'chat' | 'history'>('chat');
  const [messages, setMessages] = useState<Message[]>([GREETING]);
  const [conversations, setConversations] = useState<ChatbotConversation[]>([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const sessionKey = useRef<string>('');
  const { isAuthenticated } = useAuthSession();

  // Session persistée pour retrouver la conversation après un rechargement.
  useEffect(() => {
    const stored = sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (stored) {
      sessionKey.current = stored;
      return;
    }
    const fresh = newSessionKey();
    sessionStorage.setItem(SESSION_STORAGE_KEY, fresh);
    sessionKey.current = fresh;
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, view]);

  useEffect(() => {
    if (showPopover) {
      const audio = new Audio('/notification.mp3');
      audio.play().catch(() => { });
    }
  }, [showPopover]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: input,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (isAuthenticated) {
        // Lie la conversation au compte pour l'historique.
        const access = await ensureValidAccessToken();
        if (access) headers.Authorization = `Bearer ${access}`;
      }

      const response = await fetch(`${API_BASE_URL}/api/chatbot/chat/`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          message: userMessage.text,
          session_key: sessionKey.current,
        }),
      });

      const data = await response.json();

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: data.response || "Désolé, je n'ai pas pu traiter votre demande.",
        sender: 'bot',
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Erreur de connexion. Veuillez réessayer.',
        sender: 'bot',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const openHistory = async () => {
    setView('history');
    setIsHistoryLoading(true);
    try {
      const access = await ensureValidAccessToken();
      if (!access) return;
      const response = await fetch(`${API_BASE_URL}/api/chatbot/history/`, {
        headers: { Authorization: `Bearer ${access}` },
        cache: 'no-store',
      });
      if (!response.ok) return;
      const data = (await response.json()) as ChatbotConversation[];
      setConversations(Array.isArray(data) ? data : []);
    } catch {
      // silencieux : le panneau affichera l'état vide
    } finally {
      setIsHistoryLoading(false);
    }
  };

  const loadConversation = async (conversation: ChatbotConversation) => {
    setIsHistoryLoading(true);
    try {
      const access = await ensureValidAccessToken();
      if (!access) return;
      const response = await fetch(`${API_BASE_URL}/api/chatbot/history/${conversation.id}/`, {
        headers: { Authorization: `Bearer ${access}` },
        cache: 'no-store',
      });
      if (!response.ok) return;
      const data = (await response.json()) as { session_key: string; messages: ChatbotHistoryMessage[] };

      // On reprend la même session pour continuer la conversation.
      sessionKey.current = data.session_key;
      sessionStorage.setItem(SESSION_STORAGE_KEY, data.session_key);

      const restored: Message[] = data.messages.map((msg) => ({
        id: String(msg.id),
        text: msg.content,
        sender: msg.role === 'user' ? 'user' : 'bot',
        timestamp: new Date(msg.created_at),
      }));
      setMessages(restored.length > 0 ? restored : [GREETING]);
      setView('chat');
    } catch {
      // silencieux : on reste sur le panneau historique
    } finally {
      setIsHistoryLoading(false);
    }
  };

  const startNewConversation = () => {
    const fresh = newSessionKey();
    sessionKey.current = fresh;
    sessionStorage.setItem(SESSION_STORAGE_KEY, fresh);
    setMessages([GREETING]);
    setView('chat');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatConversationDate = (value: string) =>
    new Date(value).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <>
      {/* Popover Notification */}
      <AnimatePresence>
        {showPopover && !isOpen && (
          <motion.div
            initial={{ opacity: 0, x: 20, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 20, scale: 0.8 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="fixed bottom-24 right-6 z-50 bg-white rounded-xl shadow-2xl border border-gray-200 p-4 max-w-xs"
          >
            <button
              onClick={() => setShowPopover(false)}
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
            <div className="flex items-start gap-3">

              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-900">Assistant CJK</p>
                <p className="text-xs text-gray-600 mt-1">
                  {GREETING.text}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
          >
            <Button
              onClick={() => setIsOpen(true)}
              className="fixed bottom-6 right-6 h-14 w-14 rounded-md shadow-2xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 z-50 transition-all duration-300 hover:scale-110"
              size="icon"
            >
              <MessageCircle className="h-6 w-6 text-white" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed w-full sm:w-96 h-[100vh] sm:h-[600px] top-0 left-0 sm:top-auto sm:left-auto sm:bottom-6 sm:right-6 bg-white sm:rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden border-0 sm:border border-gray-200"
          >
            {/* Header */}
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10 border-2 border-white">
                  <AvatarFallback className="bg-white text-blue-600 font-bold">
                    CJK
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-white font-semibold">Assistant CJK</h3>
                  <p className="text-blue-100 text-xs">{view === 'history' ? 'Historique' : 'En ligne'}</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {isAuthenticated && view === 'chat' && (
                  <>
                    <Button
                      onClick={startNewConversation}
                      variant="ghost"
                      size="icon"
                      title="Nouvelle conversation"
                      className="text-white hover:bg-white/20"
                    >
                      <SquarePen className="h-4 w-4" />
                    </Button>
                    <Button
                      onClick={openHistory}
                      variant="ghost"
                      size="icon"
                      title="Mes conversations passées"
                      className="text-white hover:bg-white/20"
                    >
                      <History className="h-5 w-5" />
                    </Button>
                  </>
                )}
                {view === 'history' && (
                  <Button
                    onClick={() => setView('chat')}
                    variant="ghost"
                    size="icon"
                    title="Retour à la discussion"
                    className="text-white hover:bg-white/20"
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </Button>
                )}
                <Button
                  onClick={() => setIsOpen(false)}
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/20"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </motion.div>

            {view === 'history' ? (
              /* Panneau historique des conversations */
              <ScrollArea className="flex-1 p-4" ref={scrollRef}>
                {isHistoryLoading ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                  </div>
                ) : conversations.length === 0 ? (
                  <div className="text-center py-12 px-4">
                    <MessagesSquare className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                    <p className="text-sm font-medium text-gray-600">Aucune conversation passée</p>
                    <p className="text-xs text-gray-400 mt-1">
                      Vos prochaines discussions apparaîtront ici.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {conversations.map((conversation) => (
                      <button
                        key={conversation.id}
                        onClick={() => loadConversation(conversation)}
                        className="w-full text-left p-3 rounded-xl border border-gray-200 hover:border-blue-300 hover:bg-blue-50/60 transition-colors group"
                      >
                        <p className="text-sm font-semibold text-gray-800 truncate group-hover:text-blue-700">
                          {conversation.title || `Conversation ${conversation.id}`}
                        </p>
                        <div className="flex items-center justify-between mt-1">
                          <p className="text-xs text-gray-400">
                            {formatConversationDate(conversation.updated_at)}
                          </p>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 font-medium">
                            {conversation.messages_count} messages
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </ScrollArea>
            ) : (
              /* Messages */
              <ScrollArea className="flex-1 p-4" ref={scrollRef}>
                <div className="space-y-4">
                  {messages.map((message, index) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: Math.min(index * 0.05, 0.4) }}
                      className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'
                        }`}
                    >
                      <div
                        className={`max-w-[85%] rounded-2xl px-4 py-2 ${message.sender === 'user'
                          ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                          : 'bg-gray-100 text-gray-800'
                          }`}
                      >
                        {message.sender === 'bot' ? (
                          <BotMarkdown text={message.text} />
                        ) : (
                          <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                        )}
                        {message.timestamp.getTime() > 0 && (
                          <p
                            className={`text-xs mt-1 ${message.sender === 'user'
                              ? 'text-blue-100'
                              : 'text-gray-500'
                              }`}
                          >
                            {message.timestamp.toLocaleTimeString('fr-FR', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                        )}
                      </div>
                    </motion.div>
                  ))}
                  {isLoading && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex justify-start"
                    >
                      <div className="bg-gray-100 rounded-2xl px-4 py-3">
                        <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                      </div>
                    </motion.div>
                  )}
                </div>
              </ScrollArea>
            )}

            {/* Input */}
            {view === 'chat' && (
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="p-4 border-t border-gray-200 bg-gray-50"
              >
                <div className="flex gap-2">
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Écrivez votre message..."
                    className="flex-1 rounded-md border-gray-300 focus:border-blue-500"
                    disabled={isLoading}
                  />
                  <Button
                    onClick={sendMessage}
                    disabled={!input.trim() || isLoading}
                    className="rounded-md bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    size="icon"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
