import Link from 'next/link';
import { Home, Instagram, Facebook, Twitter, Mail } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <Link href="/" className="flex items-center gap-2 mb-4">
              <Home className="w-8 h-8 text-primary-400" />
              <span className="text-2xl font-bold text-white">
                roo<span className="text-primary-400">Mate</span>
              </span>
            </Link>
            <p className="text-sm text-gray-400">
              La piattaforma unica per trovare e affittare stanze in Italia.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold text-white mb-4">Esplora</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/cerca" className="hover:text-primary-400 transition-colors">
                  Cerca stanze
                </Link>
              </li>
              <li>
                <Link href="/pubblica" className="hover:text-primary-400 transition-colors">
                  Pubblica annuncio
                </Link>
              </li>
              <li>
                <Link href="/citta" className="hover:text-primary-400 transition-colors">
                  Stanze per città
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-semibold text-white mb-4">Supporto</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/come-funziona" className="hover:text-primary-400 transition-colors">
                  Come funziona
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-primary-400 transition-colors">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/contatti" className="hover:text-primary-400 transition-colors">
                  Contattaci
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold text-white mb-4">Legale</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/privacy" className="hover:text-primary-400 transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/termini" className="hover:text-primary-400 transition-colors">
                  Termini di Servizio
                </Link>
              </li>
              <li>
                <Link href="/cookie" className="hover:text-primary-400 transition-colors">
                  Cookie Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-500">
            © 2024 rooMate. Tutti i diritti riservati.
          </p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-primary-400 transition-colors">
              <Instagram className="w-5 h-5" />
            </a>
            <a href="#" className="hover:text-primary-400 transition-colors">
              <Facebook className="w-5 h-5" />
            </a>
            <a href="#" className="hover:text-primary-400 transition-colors">
              <Twitter className="w-5 h-5" />
            </a>
            <a href="#" className="hover:text-primary-400 transition-colors">
              <Mail className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
