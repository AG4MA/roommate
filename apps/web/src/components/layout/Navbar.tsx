'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import {
  Menu, X, Home, LogIn, CalendarCheck, UserCircle,
  Building2, LogOut, ChevronDown, Users, Heart,
  MessageCircle, Bell, Shield, BadgeCheck,
} from 'lucide-react';

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const { data: session, status } = useSession();

  const isLoggedIn = status === 'authenticated' && session?.user;

  // Fetch unread count + SSE for real-time updates
  useEffect(() => {
    if (!isLoggedIn) return;

    // Initial fetch
    const fetchUnread = async () => {
      try {
        const res = await fetch('/api/conversations');
        const json = await res.json();
        if (json.success && json.data) {
          const total = json.data.reduce((sum: number, c: any) => sum + (c.unreadCount || 0), 0);
          setUnreadCount(total);
        }
      } catch { /* silent */ }
    };
    fetchUnread();

    // SSE for live updates
    let es: EventSource | null = null;
    try {
      es = new EventSource('/api/notifications/stream');
      es.addEventListener('unread-count', (e) => {
        const data = JSON.parse(e.data);
        if (typeof data.totalUnread === 'number') {
          setUnreadCount(data.totalUnread);
        }
      });
      es.onerror = () => {
        // Reconnect automatically
      };
    } catch { /* SSE not supported */ }

    // Also poll every 60s as fallback
    const interval = setInterval(fetchUnread, 60000);

    return () => {
      clearInterval(interval);
      es?.close();
    };
  }, [isLoggedIn]);

  // Update document title with unread badge
  useEffect(() => {
    const baseTitle = 'rooMate';
    document.title = unreadCount > 0 ? `(${unreadCount}) ${baseTitle}` : baseTitle;
  }, [unreadCount]);

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <Home className="w-8 h-8 text-primary-600" />
            <span className="text-2xl font-bold text-gray-800">
              roo<span className="text-primary-600">Mate</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <Link href="/cerca" className="text-gray-600 hover:text-primary-600 transition-colors">
              Cerca stanze
            </Link>
            <Link href="/pubblica" className="text-gray-600 hover:text-primary-600 transition-colors">
              Pubblica annuncio
            </Link>
            {isLoggedIn && (
              <Link href="/gruppi" className="flex items-center gap-1.5 text-gray-600 hover:text-primary-600 transition-colors">
                <Users className="w-4 h-4" />
                I miei gruppi
              </Link>
            )}
            <Link href="/come-funziona" className="text-gray-600 hover:text-primary-600 transition-colors">
              Come funziona
            </Link>
          </div>

          {/* User Links - Desktop */}
          <div className="hidden md:flex items-center gap-3">
            {isLoggedIn ? (
              <>
                <Link
                  href="/mi-interessa"
                  className="flex items-center gap-2 text-gray-600 hover:text-primary-600 transition-colors"
                  title="Mi interessa"
                >
                  <Heart className="w-5 h-5" />
                </Link>
                <Link
                  href="/messaggi"
                  className="relative flex items-center gap-2 text-gray-600 hover:text-primary-600 transition-colors"
                  title="Messaggi"
                >
                  <MessageCircle className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                </Link>
                <Link
                  href="/appuntamenti"
                  className="flex items-center gap-2 text-gray-600 hover:text-primary-600 transition-colors"
                  title="Appuntamenti"
                >
                  <CalendarCheck className="w-5 h-5" />
                </Link>
                <Link
                  href="/notifiche"
                  className="flex items-center gap-2 text-gray-600 hover:text-primary-600 transition-colors"
                  title="Notifiche"
                >
                  <Bell className="w-5 h-5" />
                </Link>

                {/* Profile Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="flex items-center gap-2 text-gray-600 hover:text-primary-600 transition-colors"
                  >
                    <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                      {session.user.avatar ? (
                        <img
                          src={session.user.avatar}
                          alt={session.user.name}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-sm font-semibold text-primary-600">
                          {session.user.name.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <span className="text-sm font-medium">{session.user.name}</span>
                    <ChevronDown className="w-4 h-4" />
                  </button>

                  {isProfileOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setIsProfileOpen(false)}
                      />
                      <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-20">
                        <div className="px-4 py-2 border-b border-gray-100">
                          <p className="text-sm font-medium text-gray-800">{session.user.name}</p>
                          <p className="text-xs text-gray-500">{session.user.email}</p>
                        </div>

                        <Link
                          href="/profilo/inquilino"
                          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          onClick={() => setIsProfileOpen(false)}
                        >
                          <UserCircle className="w-4 h-4" />
                          Il mio profilo
                        </Link>

                        <Link
                          href="/i-miei-annunci"
                          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          onClick={() => setIsProfileOpen(false)}
                        >
                          <Building2 className="w-4 h-4" />
                          I miei annunci
                        </Link>

                        <Link
                          href="/profilo/account"
                          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          onClick={() => setIsProfileOpen(false)}
                        >
                          <Shield className="w-4 h-4" />
                          Impostazioni account
                        </Link>

                        <Link
                          href="/certificazioni"
                          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          onClick={() => setIsProfileOpen(false)}
                        >
                          <BadgeCheck className="w-4 h-4" />
                          Certificazioni
                        </Link>

                        <hr className="my-1" />

                        <button
                          onClick={() => {
                            setIsProfileOpen(false);
                            signOut({ callbackUrl: '/' });
                          }}
                          className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full"
                        >
                          <LogOut className="w-4 h-4" />
                          Esci
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="flex items-center gap-2 text-gray-600 hover:text-primary-600 transition-colors"
                >
                  <LogIn className="w-5 h-5" />
                  Accedi
                </Link>
                <Link
                  href="/registrati"
                  className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  Registrati
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <X className="w-6 h-6 text-gray-600" />
            ) : (
              <Menu className="w-6 h-6 text-gray-600" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <div className="flex flex-col gap-4">
              <Link
                href="/cerca"
                className="text-gray-600 hover:text-primary-600 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Cerca stanze
              </Link>
              <Link
                href="/pubblica"
                className="text-gray-600 hover:text-primary-600 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Pubblica annuncio
              </Link>
              {isLoggedIn && (
                <Link
                  href="/gruppi"
                  className="text-gray-600 hover:text-primary-600 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  I miei gruppi
                </Link>
              )}
              <Link
                href="/come-funziona"
                className="text-gray-600 hover:text-primary-600 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Come funziona
              </Link>

              {isLoggedIn ? (
                <>
                  <hr className="my-2" />
                  <Link
                    href="/mi-interessa"
                    className="text-gray-600 hover:text-primary-600 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Mi interessa
                  </Link>
                  <Link
                    href="/messaggi"
                    className="text-gray-600 hover:text-primary-600 transition-colors flex items-center gap-2"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Messaggi
                    {unreadCount > 0 && (
                      <span className="bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 min-w-[20px] text-center">
                        {unreadCount}
                      </span>
                    )}
                  </Link>
                  <Link
                    href="/appuntamenti"
                    className="text-gray-600 hover:text-primary-600 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Appuntamenti
                  </Link>
                  <Link
                    href="/notifiche"
                    className="text-gray-600 hover:text-primary-600 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Notifiche
                  </Link>
                  <Link
                    href="/profilo/inquilino"
                    className="text-gray-600 hover:text-primary-600 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Il mio profilo
                  </Link>
                  <Link
                    href="/i-miei-annunci"
                    className="text-gray-600 hover:text-primary-600 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    I miei annunci
                  </Link>
                  <Link
                    href="/profilo/account"
                    className="text-gray-600 hover:text-primary-600 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Impostazioni account
                  </Link>
                  <Link
                    href="/certificazioni"
                    className="text-gray-600 hover:text-primary-600 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Certificazioni
                  </Link>
                  <hr className="my-2" />
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      signOut({ callbackUrl: '/' });
                    }}
                    className="text-left text-red-600 hover:text-red-700 transition-colors"
                  >
                    Esci ({session?.user?.name})
                  </button>
                </>
              ) : (
                <>
                  <hr className="my-2" />
                  <Link
                    href="/login"
                    className="text-gray-600 hover:text-primary-600 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Accedi
                  </Link>
                  <Link
                    href="/registrati"
                    className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-medium text-center transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Registrati
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
