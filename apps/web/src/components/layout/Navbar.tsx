'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import {
  Menu, X, Home, LogIn, CalendarCheck, UserCircle,
  Building2, LogOut, ChevronDown,
} from 'lucide-react';

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { data: session, status } = useSession();

  const isLoggedIn = status === 'authenticated' && session?.user;
  const isLandlord = session?.user?.role === 'landlord';

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
            {isLandlord && (
              <Link href="/pubblica" className="text-gray-600 hover:text-primary-600 transition-colors">
                Pubblica annuncio
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
                  href="/prenotazioni"
                  className="flex items-center gap-2 text-gray-600 hover:text-primary-600 transition-colors"
                >
                  <CalendarCheck className="w-5 h-5" />
                  Prenotazioni
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
                          <span className="inline-block mt-1 px-2 py-0.5 bg-primary-50 text-primary-700 text-xs rounded-full font-medium">
                            {isLandlord ? 'Proprietario' : 'Inquilino'}
                          </span>
                        </div>

                        <Link
                          href={isLandlord ? '/profilo/proprietario' : '/profilo/inquilino'}
                          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          onClick={() => setIsProfileOpen(false)}
                        >
                          <UserCircle className="w-4 h-4" />
                          Il mio profilo
                        </Link>

                        {isLandlord && (
                          <Link
                            href="/i-miei-annunci"
                            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                            onClick={() => setIsProfileOpen(false)}
                          >
                            <Building2 className="w-4 h-4" />
                            I miei annunci
                          </Link>
                        )}

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
              {isLandlord && (
                <Link
                  href="/pubblica"
                  className="text-gray-600 hover:text-primary-600 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Pubblica annuncio
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
                    href="/prenotazioni"
                    className="text-gray-600 hover:text-primary-600 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Prenotazioni
                  </Link>
                  <Link
                    href={isLandlord ? '/profilo/proprietario' : '/profilo/inquilino'}
                    className="text-gray-600 hover:text-primary-600 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Il mio profilo
                  </Link>
                  {isLandlord && (
                    <Link
                      href="/i-miei-annunci"
                      className="text-gray-600 hover:text-primary-600 transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      I miei annunci
                    </Link>
                  )}
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
