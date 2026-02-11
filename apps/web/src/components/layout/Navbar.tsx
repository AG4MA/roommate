'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Menu, X, Home, User, LogIn, CalendarCheck, UserCircle } from 'lucide-react';

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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
            <Link href="/come-funziona" className="text-gray-600 hover:text-primary-600 transition-colors">
              Come funziona
            </Link>
          </div>

          {/* User Links */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/prenotazioni"
              className="flex items-center gap-2 text-gray-600 hover:text-primary-600 transition-colors"
            >
              <CalendarCheck className="w-5 h-5" />
              Prenotazioni
            </Link>
            <Link
              href="/profilo/inquilino"
              className="flex items-center gap-2 text-gray-600 hover:text-primary-600 transition-colors"
            >
              <UserCircle className="w-5 h-5" />
              Profilo
            </Link>
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
              <Link
                href="/come-funziona"
                className="text-gray-600 hover:text-primary-600 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Come funziona
              </Link>
              <Link
                href="/prenotazioni"
                className="text-gray-600 hover:text-primary-600 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Prenotazioni
              </Link>
              <Link
                href="/profilo/inquilino"
                className="text-gray-600 hover:text-primary-600 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Profilo inquilino
              </Link>
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
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
