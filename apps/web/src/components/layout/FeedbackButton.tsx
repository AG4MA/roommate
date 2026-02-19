'use client';

import { useState, useRef, useEffect } from 'react';
import { MessageSquarePlus, Star, Send, X, Loader2, CheckCircle } from 'lucide-react';
import { usePathname } from 'next/navigation';

export function FeedbackButton() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [rating, setRating] = useState<number | null>(null);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  // Close on escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    if (open) document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open]);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) setOpen(false);
    };
    if (open) setTimeout(() => document.addEventListener('mousedown', handler), 0);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const handleSubmit = async () => {
    if (!message.trim()) return;
    setSubmitting(true);
    try {
      await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, rating, page: pathname }),
      });
      setDone(true);
      setTimeout(() => { setOpen(false); setDone(false); setMessage(''); setRating(null); }, 2000);
    } catch {
      // silent fail
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {/* Floating trigger */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-5 right-5 z-50 w-12 h-12 rounded-full bg-primary-600 text-white shadow-lg hover:bg-primary-700 hover:shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center"
        aria-label="Invia feedback"
      >
        {open ? <X className="w-5 h-5" /> : <MessageSquarePlus className="w-5 h-5" />}
      </button>

      {/* Panel */}
      {open && (
        <div
          ref={panelRef}
          className="fixed bottom-20 right-5 z-50 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200"
        >
          {done ? (
            <div className="p-8 flex flex-col items-center gap-3 text-center">
              <CheckCircle className="w-10 h-10 text-emerald-500" />
              <p className="text-sm font-semibold text-gray-800">Grazie per il tuo feedback!</p>
            </div>
          ) : (
            <>
              <div className="px-5 pt-5 pb-3">
                <h3 className="text-sm font-bold text-gray-800 mb-0.5">Dicci cosa ne pensi</h3>
                <p className="text-xs text-gray-400">Bug, suggerimenti, qualsiasi cosa</p>
              </div>
              <div className="px-5 pb-4 space-y-3">
                {/* Star rating */}
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      key={s}
                      onMouseEnter={() => setHoverRating(s)}
                      onMouseLeave={() => setHoverRating(null)}
                      onClick={() => setRating(rating === s ? null : s)}
                      className="p-0.5 transition-transform hover:scale-110"
                    >
                      <Star
                        className={`w-6 h-6 transition-colors ${
                          (hoverRating ?? rating ?? 0) >= s
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-gray-300'
                        }`}
                      />
                    </button>
                  ))}
                  {rating && <span className="text-xs text-gray-400 ml-1">{rating}/5</span>}
                </div>

                {/* Message */}
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Scrivi qui il tuo feedback..."
                  rows={3}
                  maxLength={2000}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm resize-none focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none placeholder:text-gray-300"
                />

                {/* Submit */}
                <button
                  onClick={handleSubmit}
                  disabled={!message.trim() || submitting}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  Invia feedback
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}
