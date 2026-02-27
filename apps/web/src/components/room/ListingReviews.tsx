'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { Star, Flag, Eye, EyeOff, ThumbsUp, AlertTriangle, MessageSquare, ChevronDown, ChevronUp } from 'lucide-react';

interface ReviewData {
  id: string;
  rating: number;
  comment: string | null;
  flagged: boolean;
  createdAt: string;
  author: {
    id: string;
    name: string;
    avatar: string | null;
    verified: boolean;
  };
}

interface ReviewsData {
  items: ReviewData[];
  total: number;
  page: number;
  totalPages: number;
  avgRating: number | null;
  reviewCount: number;
  distribution: Record<number, number>;
}

// Star rating display component
function StarRating({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'md' | 'lg' }) {
  const sizes = { sm: 'w-4 h-4', md: 'w-5 h-5', lg: 'w-6 h-6' };
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`${sizes[size]} ${
            i <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
          }`}
        />
      ))}
    </div>
  );
}

// Star rating input component
function StarRatingInput({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <button
          key={i}
          type="button"
          onClick={() => onChange(i)}
          onMouseEnter={() => setHover(i)}
          onMouseLeave={() => setHover(0)}
          className="focus:outline-none"
        >
          <Star
            className={`w-8 h-8 transition-colors ${
              i <= (hover || value) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
            }`}
          />
        </button>
      ))}
    </div>
  );
}

export function ListingReviews({ listingId, landlordId }: { listingId: string; landlordId: string }) {
  const { data: session } = useSession();
  const [reviews, setReviews] = useState<ReviewsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [canReview, setCanReview] = useState(false);
  const [completedBookings, setCompletedBookings] = useState<any[]>([]);

  // Review form state
  const [selectedBooking, setSelectedBooking] = useState('');
  const [newRating, setNewRating] = useState(0);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // Flag modal state
  const [flaggingId, setFlaggingId] = useState<string | null>(null);
  const [flagReason, setFlagReason] = useState('');

  const isLandlord = session?.user?.id === landlordId;

  const fetchReviews = useCallback(async () => {
    try {
      const res = await fetch(`/api/reviews?listingId=${listingId}`);
      const data = await res.json();
      if (data.success) {
        setReviews(data.data);
      }
    } catch (err) {
      console.error('Error fetching reviews:', err);
    } finally {
      setLoading(false);
    }
  }, [listingId]);

  const fetchCompletedBookings = useCallback(async () => {
    if (!session?.user?.id) return;
    try {
      const res = await fetch('/api/bookings?status=COMPLETED');
      const data = await res.json();
      if (data.success) {
        // Filter bookings for this listing that don't have reviews yet
        const relevant = (data.data || []).filter(
          (b: any) => b.listing?.id === listingId || b.listingId === listingId
        );
        setCompletedBookings(relevant);
        setCanReview(relevant.length > 0);
      }
    } catch { /* ignore */ }
  }, [session?.user?.id, listingId]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  useEffect(() => {
    if (session?.user?.id && !isLandlord) {
      fetchCompletedBookings();
    }
  }, [session?.user?.id, isLandlord, fetchCompletedBookings]);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newRating === 0) {
      setFormError('Seleziona un voto');
      return;
    }
    if (!selectedBooking) {
      setFormError('Seleziona la prenotazione');
      return;
    }

    setSubmitting(true);
    setFormError('');
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId: selectedBooking,
          rating: newRating,
          comment: newComment.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setShowForm(false);
        setNewRating(0);
        setNewComment('');
        setSelectedBooking('');
        fetchReviews();
        fetchCompletedBookings();
      } else {
        setFormError(data.error || 'Errore nella creazione');
      }
    } catch {
      setFormError('Errore di rete');
    } finally {
      setSubmitting(false);
    }
  };

  const handleFlag = async (reviewId: string) => {
    try {
      const res = await fetch('/api/reviews/moderate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviewId, action: 'flag', reason: flagReason }),
      });
      const data = await res.json();
      if (data.success) {
        setFlaggingId(null);
        setFlagReason('');
        fetchReviews();
      }
    } catch { /* ignore */ }
  };

  const handleHideToggle = async (reviewId: string, hide: boolean) => {
    try {
      await fetch('/api/reviews/moderate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviewId, action: hide ? 'hide' : 'unhide' }),
      });
      fetchReviews();
    } catch { /* ignore */ }
  };

  if (loading) {
    return (
      <section className="mb-8">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Recensioni</h2>
        <div className="animate-pulse space-y-4">
          <div className="h-20 bg-gray-200 rounded-lg" />
          <div className="h-20 bg-gray-200 rounded-lg" />
        </div>
      </section>
    );
  }

  if (!reviews) return null;

  const displayedReviews = showAll ? reviews.items : reviews.items.slice(0, 3);

  return (
    <section className="mb-8">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Recensioni</h2>

      {/* Summary */}
      {reviews.reviewCount > 0 ? (
        <div className="bg-gray-50 rounded-xl p-5 mb-6">
          <div className="flex items-center gap-6">
            {/* Average rating */}
            <div className="text-center">
              <p className="text-4xl font-bold text-gray-800">{reviews.avgRating}</p>
              <StarRating rating={Math.round(reviews.avgRating || 0)} size="md" />
              <p className="text-sm text-gray-500 mt-1">{reviews.reviewCount} {reviews.reviewCount === 1 ? 'recensione' : 'recensioni'}</p>
            </div>

            {/* Distribution bars */}
            <div className="flex-1 space-y-1.5">
              {[5, 4, 3, 2, 1].map((stars) => {
                const count = reviews.distribution[stars] || 0;
                const pct = reviews.reviewCount > 0 ? (count / reviews.reviewCount) * 100 : 0;
                return (
                  <div key={stars} className="flex items-center gap-2 text-sm">
                    <span className="w-3 text-gray-600">{stars}</span>
                    <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-yellow-400 rounded-full h-2 transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="w-6 text-right text-gray-500">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-gray-50 rounded-xl p-6 text-center mb-6">
          <MessageSquare className="w-10 h-10 text-gray-300 mx-auto mb-2" />
          <p className="text-gray-500">Ancora nessuna recensione</p>
          <p className="text-sm text-gray-400 mt-1">Sii il primo a lasciare una recensione dopo una visita!</p>
        </div>
      )}

      {/* Write review button */}
      {canReview && !isLandlord && session?.user?.id && (
        <div className="mb-6">
          {!showForm ? (
            <button
              onClick={() => setShowForm(true)}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2"
            >
              <Star className="w-4 h-4" />
              Scrivi una recensione
            </button>
          ) : (
            <form onSubmit={handleSubmitReview} className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
              <h3 className="font-semibold text-gray-800">La tua recensione</h3>

              {completedBookings.length > 1 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Visita</label>
                  <select
                    value={selectedBooking}
                    onChange={(e) => setSelectedBooking(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                  >
                    <option value="">Seleziona la visita...</option>
                    {completedBookings.map((b: any) => (
                      <option key={b.id} value={b.id}>
                        {new Date(b.slot?.date || b.createdAt).toLocaleDateString('it-IT')}
                        {b.slot?.startTime ? ` alle ${b.slot.startTime}` : ''}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Voto</label>
                <StarRatingInput value={newRating} onChange={setNewRating} />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Commento (opzionale)</label>
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Racconta la tua esperienza..."
                  rows={3}
                  maxLength={1000}
                  className="w-full px-3 py-2 border rounded-lg text-sm resize-none"
                />
              </div>

              {formError && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <AlertTriangle className="w-4 h-4" />
                  {formError}
                </p>
              )}

              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 text-sm"
                >
                  {submitting ? 'Invio...' : 'Pubblica recensione'}
                </button>
                <button
                  type="button"
                  onClick={() => { setShowForm(false); setFormError(''); }}
                  className="px-4 py-2 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 text-sm"
                >
                  Annulla
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* Review list */}
      {displayedReviews.length > 0 && (
        <div className="space-y-4">
          {displayedReviews.map((review) => (
            <div key={review.id} className="border border-gray-100 rounded-xl p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  {/* Avatar */}
                  <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-semibold text-sm overflow-hidden">
                    {review.author.avatar ? (
                      <img src={review.author.avatar} alt={review.author.name} className="w-full h-full object-cover" />
                    ) : (
                      review.author.name.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-800">{review.author.name}</span>
                      {review.author.verified && (
                        <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full">Verificato</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <StarRating rating={review.rating} />
                      <span className="text-xs text-gray-400">
                        {new Date(review.createdAt).toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1">
                  {review.flagged && (
                    <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      Segnalata
                    </span>
                  )}
                  {session?.user?.id && session.user.id !== review.author.id && !isLandlord && (
                    <button
                      onClick={() => setFlaggingId(review.id)}
                      className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-gray-50"
                      title="Segnala recensione"
                    >
                      <Flag className="w-4 h-4" />
                    </button>
                  )}
                  {isLandlord && (
                    <button
                      onClick={() => handleHideToggle(review.id, true)}
                      className="p-1.5 text-gray-400 hover:text-orange-500 rounded-lg hover:bg-gray-50"
                      title="Nascondi recensione"
                    >
                      <EyeOff className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {review.comment && (
                <p className="mt-3 text-gray-600 text-sm leading-relaxed">{review.comment}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Show more/less */}
      {reviews.items.length > 3 && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="mt-4 text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center gap-1"
        >
          {showAll ? (
            <>Mostra meno <ChevronUp className="w-4 h-4" /></>
          ) : (
            <>Vedi tutte le {reviews.reviewCount} recensioni <ChevronDown className="w-4 h-4" /></>
          )}
        </button>
      )}

      {/* Flag modal */}
      {flaggingId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-3">Segnala recensione</h3>
            <p className="text-sm text-gray-500 mb-4">Indica il motivo della segnalazione.</p>
            <textarea
              value={flagReason}
              onChange={(e) => setFlagReason(e.target.value)}
              placeholder="Motivo della segnalazione..."
              rows={3}
              className="w-full px-3 py-2 border rounded-lg text-sm resize-none mb-4"
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => { setFlaggingId(null); setFlagReason(''); }}
                className="px-4 py-2 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 text-sm"
              >
                Annulla
              </button>
              <button
                onClick={() => handleFlag(flaggingId)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
              >
                Segnala
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
