import Link from 'next/link';
import { Search, MapPin, Calendar, Shield } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-600 to-primary-800 text-white py-20 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-5xl font-bold mb-6">
            Trova la tua stanza ideale
          </h1>
          <p className="text-xl mb-8 text-primary-100 max-w-2xl mx-auto">
            Basta confusione tra Facebook, Subito e Idealista. 
            Un solo portale per cercare, visitare e affittare la tua prossima stanza.
          </p>
          
          {/* Search Bar */}
          <div className="bg-white rounded-2xl p-4 shadow-2xl max-w-4xl mx-auto">
            <form className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Dove vuoi cercare?"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-800"
                />
              </div>
              <div className="flex gap-4">
                <select className="px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-800">
                  <option>Budget max</option>
                  <option>€300</option>
                  <option>€400</option>
                  <option>€500</option>
                  <option>€600</option>
                  <option>€700+</option>
                </select>
                <button
                  type="submit"
                  className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-3 rounded-xl font-semibold flex items-center gap-2 transition-colors"
                >
                  <Search className="w-5 h-5" />
                  Cerca
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">
            Perché scegliere rooMate?
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="bg-primary-100 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-800">Un Solo Portale</h3>
              <p className="text-gray-600">
                Tutte le stanze in un unico posto. Niente più ricerche su mille piattaforme diverse.
              </p>
            </div>
            
            <div className="text-center p-6">
              <div className="bg-primary-100 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-800">Gestione Appuntamenti</h3>
              <p className="text-gray-600">
                Organizza visite e open day direttamente dalla piattaforma. Zero telefonate, zero stress.
              </p>
            </div>
            
            <div className="text-center p-6">
              <div className="bg-primary-100 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-800">Profili Verificati</h3>
              <p className="text-gray-600">
                Affittuari e proprietari verificati. Filtri avanzati per trovare il match perfetto.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">
            Come Funziona
          </h2>
          
          <div className="grid md:grid-cols-2 gap-12">
            {/* Per chi cerca */}
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <h3 className="text-2xl font-bold mb-6 text-primary-600">Cerchi una stanza?</h3>
              <ol className="space-y-4">
                <li className="flex gap-4">
                  <span className="bg-primary-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold shrink-0">1</span>
                  <div>
                    <h4 className="font-semibold text-gray-800">Cerca con filtri e mappa</h4>
                    <p className="text-gray-600">Esplora le stanze disponibili nella tua zona ideale</p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <span className="bg-primary-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold shrink-0">2</span>
                  <div>
                    <h4 className="font-semibold text-gray-800">Prenota una visita</h4>
                    <p className="text-gray-600">Scegli uno slot disponibile o partecipa ad un open day</p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <span className="bg-primary-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold shrink-0">3</span>
                  <div>
                    <h4 className="font-semibold text-gray-800">Visita e conferma</h4>
                    <p className="text-gray-600">Visita la stanza (anche virtualmente) e conferma l'affitto</p>
                  </div>
                </li>
              </ol>
              <Link
                href="/cerca"
                className="mt-6 inline-block bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors"
              >
                Inizia a cercare
              </Link>
            </div>
            
            {/* Per chi affitta */}
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <h3 className="text-2xl font-bold mb-6 text-accent-600">Hai una stanza da affittare?</h3>
              <ol className="space-y-4">
                <li className="flex gap-4">
                  <span className="bg-accent-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold shrink-0">1</span>
                  <div>
                    <h4 className="font-semibold text-gray-800">Pubblica il tuo annuncio</h4>
                    <p className="text-gray-600">Aggiungi foto, descrizione e imposta i tuoi filtri</p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <span className="bg-accent-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold shrink-0">2</span>
                  <div>
                    <h4 className="font-semibold text-gray-800">Organizza le visite</h4>
                    <p className="text-gray-600">Crea open day o gestisci appuntamenti singoli</p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <span className="bg-accent-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold shrink-0">3</span>
                  <div>
                    <h4 className="font-semibold text-gray-800">Scegli l'inquilino perfetto</h4>
                    <p className="text-gray-600">Usa i filtri per trovare chi corrisponde ai tuoi criteri</p>
                  </div>
                </li>
              </ol>
              <Link
                href="/pubblica"
                className="mt-6 inline-block bg-accent-600 hover:bg-accent-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors"
              >
                Pubblica annuncio
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-primary-600 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">
            Pronto a trovare la tua stanza?
          </h2>
          <p className="text-xl mb-8 text-primary-100">
            Unisciti a migliaia di persone che hanno già trovato casa con rooMate
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/registrati"
              className="bg-white text-primary-600 hover:bg-primary-50 px-8 py-4 rounded-xl font-semibold transition-colors"
            >
              Registrati Gratis
            </Link>
            <Link
              href="/cerca"
              className="border-2 border-white text-white hover:bg-white hover:text-primary-600 px-8 py-4 rounded-xl font-semibold transition-colors"
            >
              Esplora Annunci
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
