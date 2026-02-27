'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  MessageCircle,
  Send,
  ArrowLeft,
  Loader2,
  Check,
  CheckCheck,
  User,
} from 'lucide-react';
import type { ApiResponse } from '@roommate/shared';

// ─── Types ───────────────────────────────────────────────────

interface ConversationSummary {
  id: string;
  listingId: string | null;
  listingTitle: string | null;
  otherUser: {
    id: string;
    name: string;
    avatar: string | null;
  };
  lastMessage: {
    content: string;
    createdAt: string;
    isOwn: boolean;
  } | null;
  unreadCount: number;
  updatedAt: string;
}

interface MessageData {
  id: string;
  content: string;
  senderId: string;
  senderName: string;
  senderAvatar: string | null;
  isOwn: boolean;
  createdAt: string;
  readAt: string | null;
}

interface ConversationDetail {
  id: string;
  listingId: string | null;
  listingTitle: string | null;
  otherUser: {
    id: string;
    name: string;
    avatar: string | null;
  };
  messages: MessageData[];
}

// ─── Main Page ───────────────────────────────────────────────

export default function MessaggiPage() {
  const { data: session, status: authStatus } = useSession();
  const router = useRouter();
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [selected, setSelected] = useState<ConversationDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingChat, setLoadingChat] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [typingUser, setTypingUser] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

  // Auth redirect
  useEffect(() => {
    if (authStatus === 'unauthenticated') {
      router.push('/login');
    }
  }, [authStatus, router]);

  // Load conversations
  const fetchConversations = useCallback(async () => {
    try {
      const res = await fetch('/api/conversations');
      const json: ApiResponse<ConversationSummary[]> = await res.json();
      if (json.success && json.data) {
        setConversations(json.data);
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authStatus === 'authenticated') {
      fetchConversations();
    }
  }, [authStatus, fetchConversations]);

  // Poll conversations every 30s for unread counts
  useEffect(() => {
    if (authStatus !== 'authenticated') return;
    const interval = setInterval(fetchConversations, 30000);
    return () => clearInterval(interval);
  }, [authStatus, fetchConversations]);

  // Load conversation detail
  const openConversation = async (convId: string) => {
    setLoadingChat(true);
    setTypingUser(null);
    try {
      const res = await fetch(`/api/conversations/${convId}`);
      const json: ApiResponse<ConversationDetail> = await res.json();
      if (json.success && json.data) {
        setSelected(json.data);
        // Update unread count in list
        setConversations((prev) =>
          prev.map((c) => (c.id === convId ? { ...c, unreadCount: 0 } : c))
        );
      }
    } catch {
      // silent
    } finally {
      setLoadingChat(false);
    }
  };

  // SSE connection for active conversation
  useEffect(() => {
    if (!selected) return;

    // Close previous
    eventSourceRef.current?.close();

    const es = new EventSource(`/api/conversations/${selected.id}/stream`);
    eventSourceRef.current = es;

    es.addEventListener('new-message', (e) => {
      const msg = JSON.parse(e.data);
      // Don't add own messages (they're added immediately on send)
      if (msg.senderId !== session?.user?.id) {
        setSelected((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            messages: [
              ...prev.messages,
              {
                ...msg,
                isOwn: false,
                readAt: null,
              },
            ],
          };
        });
        // Mark as read immediately since we're viewing
        fetch(`/api/conversations/${selected.id}`, { method: 'GET' }).catch(() => {});
      }
    });

    es.addEventListener('typing-start', (e) => {
      const data = JSON.parse(e.data);
      if (data.userId !== session?.user?.id) {
        setTypingUser(data.userName);
      }
    });

    es.addEventListener('typing-stop', (e) => {
      const data = JSON.parse(e.data);
      if (data.userId !== session?.user?.id) {
        setTypingUser(null);
      }
    });

    es.addEventListener('message-read', (e) => {
      const data = JSON.parse(e.data);
      if (data.readBy !== session?.user?.id) {
        // Mark all own messages as read
        setSelected((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            messages: prev.messages.map((m) =>
              m.isOwn && !m.readAt
                ? { ...m, readAt: data.readAt }
                : m
            ),
          };
        });
      }
    });

    es.onerror = () => {
      // Reconnection is automatic with EventSource
    };

    return () => {
      es.close();
      eventSourceRef.current = null;
    };
  }, [selected?.id, session?.user?.id]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selected?.messages?.length]);

  // Send message
  const handleSend = async () => {
    if (!newMessage.trim() || !selected || sending) return;

    const content = newMessage.trim();
    setNewMessage('');
    setSending(true);

    // Optimistic add
    const tempId = `temp-${Date.now()}`;
    setSelected((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        messages: [
          ...prev.messages,
          {
            id: tempId,
            content,
            senderId: session!.user.id,
            senderName: session!.user.name,
            senderAvatar: null,
            isOwn: true,
            createdAt: new Date().toISOString(),
            readAt: null,
          },
        ],
      };
    });

    try {
      const res = await fetch(`/api/conversations/${selected.id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });
      const json: ApiResponse<MessageData> = await res.json();

      if (json.success && json.data) {
        // Replace temp message with real one
        setSelected((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            messages: prev.messages.map((m) =>
              m.id === tempId ? { ...json.data!, isOwn: true } : m
            ),
          };
        });
        // Update conversation list
        setConversations((prev) =>
          prev.map((c) =>
            c.id === selected.id
              ? {
                  ...c,
                  lastMessage: {
                    content,
                    createdAt: json.data!.createdAt,
                    isOwn: true,
                  },
                  updatedAt: json.data!.createdAt,
                }
              : c
          )
        );
      }
    } catch {
      // Remove optimistic message on error
      setSelected((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          messages: prev.messages.filter((m) => m.id !== tempId),
        };
      });
    }

    setSending(false);

    // Stop typing
    if (selected) {
      fetch(`/api/conversations/${selected.id}/typing`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ typing: false }),
      }).catch(() => {});
    }
  };

  // Typing indicator
  const handleInputChange = (value: string) => {
    setNewMessage(value);

    if (!selected) return;

    // Debounced typing indicator
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    if (value.trim()) {
      fetch(`/api/conversations/${selected.id}/typing`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ typing: true }),
      }).catch(() => {});

      typingTimeoutRef.current = setTimeout(() => {
        fetch(`/api/conversations/${selected.id}/typing`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ typing: false }),
        }).catch(() => {});
      }, 3000);
    }
  };

  // Key handler for send
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden" style={{ height: 'calc(100vh - 120px)' }}>
        <div className="flex h-full">
          {/* Conversations List */}
          <div className={`w-full md:w-80 lg:w-96 border-r border-gray-100 flex flex-col ${selected ? 'hidden md:flex' : 'flex'}`}>
            <div className="p-4 border-b border-gray-100">
              <h1 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-primary-600" />
                Messaggi
              </h1>
            </div>

            {conversations.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                <MessageCircle className="w-12 h-12 text-gray-300 mb-4" />
                <p className="text-gray-500">Nessuna conversazione</p>
                <p className="text-gray-400 text-sm mt-1">
                  Inizia a contattare i proprietari dalle pagine degli annunci
                </p>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto">
                {conversations.map((conv) => (
                  <button
                    key={conv.id}
                    onClick={() => openConversation(conv.id)}
                    className={`w-full p-4 flex items-start gap-3 hover:bg-gray-50 transition-colors border-b border-gray-50 text-left ${
                      selected?.id === conv.id ? 'bg-primary-50' : ''
                    }`}
                  >
                    {/* Avatar */}
                    <div className="w-10 h-10 rounded-full bg-primary-100 shrink-0 flex items-center justify-center overflow-hidden">
                      {conv.otherUser.avatar ? (
                        <img
                          src={conv.otherUser.avatar}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-sm font-bold text-primary-600">
                          {conv.otherUser.name.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-gray-800 text-sm truncate">
                          {conv.otherUser.name}
                        </span>
                        {conv.lastMessage && (
                          <span className="text-xs text-gray-400 shrink-0 ml-2">
                            {formatTime(conv.lastMessage.createdAt)}
                          </span>
                        )}
                      </div>
                      {conv.listingTitle && (
                        <p className="text-xs text-primary-600 truncate">{conv.listingTitle}</p>
                      )}
                      {conv.lastMessage && (
                        <p className="text-xs text-gray-500 truncate mt-0.5">
                          {conv.lastMessage.isOwn ? 'Tu: ' : ''}
                          {conv.lastMessage.content}
                        </p>
                      )}
                    </div>

                    {/* Unread badge */}
                    {conv.unreadCount > 0 && (
                      <span className="bg-primary-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center shrink-0">
                        {conv.unreadCount}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Chat Area */}
          <div className={`flex-1 flex flex-col ${!selected ? 'hidden md:flex' : 'flex'}`}>
            {!selected ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                <MessageCircle className="w-16 h-16 text-gray-200 mb-4" />
                <p className="text-gray-400 text-lg">Seleziona una conversazione</p>
                <p className="text-gray-300 text-sm mt-1">
                  Scegli una conversazione dalla lista per iniziare
                </p>
              </div>
            ) : loadingChat ? (
              <div className="flex-1 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
              </div>
            ) : (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b border-gray-100 flex items-center gap-3">
                  <button
                    onClick={() => setSelected(null)}
                    className="md:hidden p-1 text-gray-500 hover:text-gray-700"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <div className="w-8 h-8 rounded-full bg-primary-100 shrink-0 flex items-center justify-center overflow-hidden">
                    {selected.otherUser.avatar ? (
                      <img
                        src={selected.otherUser.avatar}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-sm font-bold text-primary-600">
                        {selected.otherUser.name.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-800 text-sm">{selected.otherUser.name}</p>
                    {selected.listingTitle && (
                      <Link
                        href={`/stanza/${selected.listingId}`}
                        className="text-xs text-primary-600 hover:underline truncate block"
                      >
                        {selected.listingTitle}
                      </Link>
                    )}
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {selected.messages.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-gray-400 text-sm">Nessun messaggio ancora</p>
                      <p className="text-gray-300 text-xs mt-1">Inizia la conversazione!</p>
                    </div>
                  ) : (
                    selected.messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex ${msg.isOwn ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
                            msg.isOwn
                              ? 'bg-primary-600 text-white rounded-br-md'
                              : 'bg-gray-100 text-gray-800 rounded-bl-md'
                          }`}
                        >
                          <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
                          <div className={`flex items-center gap-1 mt-1 ${msg.isOwn ? 'justify-end' : ''}`}>
                            <span className={`text-[10px] ${msg.isOwn ? 'text-primary-200' : 'text-gray-400'}`}>
                              {formatTime(msg.createdAt)}
                            </span>
                            {msg.isOwn && (
                              msg.readAt ? (
                                <CheckCheck className={`w-3.5 h-3.5 text-blue-300`} />
                              ) : (
                                <Check className={`w-3.5 h-3.5 text-primary-300`} />
                              )
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}

                  {/* Typing indicator */}
                  {typingUser && (
                    <div className="flex justify-start">
                      <div className="bg-gray-100 rounded-2xl rounded-bl-md px-4 py-2.5">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs text-gray-500">{typingUser} sta scrivendo</span>
                          <span className="flex gap-0.5">
                            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <div className="p-4 border-t border-gray-100">
                  <div className="flex items-end gap-2">
                    <textarea
                      value={newMessage}
                      onChange={(e) => handleInputChange(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Scrivi un messaggio..."
                      rows={1}
                      className="flex-1 resize-none rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent max-h-32"
                      style={{ minHeight: '42px' }}
                    />
                    <button
                      onClick={handleSend}
                      disabled={!newMessage.trim() || sending}
                      className="p-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                    >
                      {sending ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <Send className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Helpers ─────────────────────────────────────────────────

function formatTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) {
    return date.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
  }
  if (days === 1) return 'Ieri';
  if (days < 7) {
    return date.toLocaleDateString('it-IT', { weekday: 'short' });
  }
  return date.toLocaleDateString('it-IT', { day: 'numeric', month: 'short' });
}
