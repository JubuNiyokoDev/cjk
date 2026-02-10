'use client';

import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { motion, AnimatePresence } from 'framer-motion';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [showPopover, setShowPopover] = useState(true);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Bonjour! Je suis l\'assistant virtuel du CJK. Comment puis-je vous aider?',
      sender: 'bot',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const sessionKey = useRef(`session_${Date.now()}`);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

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
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/chatbot/chat/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: input,
          session_key: sessionKey.current,
        }),
      });

      const data = await response.json();

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: data.response || 'Désolé, je n\'ai pas pu traiter votre demande.',
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

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

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
                  {messages[0].text}
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
                  <p className="text-blue-100 text-xs">En ligne</p>
                </div>
              </div>
              <Button
                onClick={() => setIsOpen(false)}
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/20"
              >
                <X className="h-5 w-5" />
              </Button>
            </motion.div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4" ref={scrollRef}>
              <div className="space-y-4">
                {messages.map((message, index) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'
                      }`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-2 ${message.sender === 'user'
                          ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                          : 'bg-gray-100 text-gray-800'
                        }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{message.text}</p>
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

            {/* Input */}
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
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
