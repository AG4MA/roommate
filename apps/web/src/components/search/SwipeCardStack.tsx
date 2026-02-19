'use client';

import {
  useState,
  useRef,
  useCallback,
  useEffect,
  type TouchEvent as ReactTouchEvent,
  type MouseEvent as ReactMouseEvent,
} from 'react';
import Link from 'next/link';
import {
  MapPin,
  Users,
  Wifi,
  Heart,
  X,
  Star,
  ChevronLeft,
  ChevronRight,
  BedDouble,
  Maximize,
  Calendar,
  Eye,
} from 'lucide-react';
import type { ListingCard } from '@roommate/shared';
import { getRoomTypeLabel } from '@roommate/shared';

/* ─────────────────────────────────────────────
   Props
   ───────────────────────────────────────────── */
interface Props {
  listings: ListingCard[];
  loading?: boolean;
}

/* ─────────────────────────────────────────────
   Constants
   ───────────────────────────────────────────── */
const SWIPE_THRESHOLD = 100; // px to trigger a swipe
const ROTATION_FACTOR = 0.12; // degrees per px of drag
const MAX_VISIBLE = 4; // cards visible in the stack

/* ─────────────────────────────────────────────
   Component
   ───────────────────────────────────────────── */
export function SwipeCardStack({ listings, loading }: Props) {
  const [current, setCurrent] = useState(0);
  const [dragX, setDragX] = useState(0);
  const [dragY, setDragY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [exitDir, setExitDir] = useState<'left' | 'right' | null>(null);
  const [liked, setLiked] = useState<Set<string>>(new Set());
  const [imageIdx, setImageIdx] = useState(0);

  const startX = useRef(0);
  const startY = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Reset image carousel when card changes
  useEffect(() => { setImageIdx(0); }, [current]);

  /* ── Drag handlers ── */
  const onDragStart = useCallback((clientX: number, clientY: number) => {
    startX.current = clientX;
    startY.current = clientY;
    setIsDragging(true);
    setExitDir(null);
  }, []);

  const onDragMove = useCallback((clientX: number, clientY: number) => {
    if (!isDragging) return;
    setDragX(clientX - startX.current);
    setDragY((clientY - startY.current) * 0.3); // dampen vertical
  }, [isDragging]);

  const onDragEnd = useCallback(() => {
    if (!isDragging) return;
    setIsDragging(false);

    if (Math.abs(dragX) > SWIPE_THRESHOLD) {
      const dir = dragX > 0 ? 'right' : 'left';
      setExitDir(dir);

      // If swiped right → like
      if (dir === 'right' && listings[current]) {
        setLiked((prev) => new Set(prev).add(listings[current].id));
      }

      setTimeout(() => {
        setCurrent((c) => c + 1);
        setExitDir(null);
        setDragX(0);
        setDragY(0);
      }, 350);
    } else {
      setDragX(0);
      setDragY(0);
    }
  }, [isDragging, dragX, current, listings]);

  /* ── Touch events ── */
  const handleTouchStart = (e: ReactTouchEvent) => {
    onDragStart(e.touches[0].clientX, e.touches[0].clientY);
  };
  const handleTouchMove = (e: ReactTouchEvent) => {
    onDragMove(e.touches[0].clientX, e.touches[0].clientY);
  };
  const handleTouchEnd = () => onDragEnd();

  /* ── Mouse events ── */
  const handleMouseDown = (e: ReactMouseEvent) => {
    e.preventDefault();
    onDragStart(e.clientX, e.clientY);
  };

  useEffect(() => {
    if (!isDragging) return;
    const move = (e: globalThis.MouseEvent) => onDragMove(e.clientX, e.clientY);
    const up = () => onDragEnd();
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
    return () => {
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseup', up);
    };
  }, [isDragging, onDragMove, onDragEnd]);

  /* ── Button actions ── */
  const skip = useCallback(() => {
    setExitDir('left');
    setDragX(-SWIPE_THRESHOLD * 2);
    setTimeout(() => {
      setCurrent((c) => c + 1);
      setExitDir(null);
      setDragX(0);
      setDragY(0);
    }, 350);
  }, []);

  const like = useCallback(() => {
    if (listings[current]) {
      setLiked((prev) => new Set(prev).add(listings[current].id));
    }
    setExitDir('right');
    setDragX(SWIPE_THRESHOLD * 2);
    setTimeout(() => {
      setCurrent((c) => c + 1);
      setExitDir(null);
      setDragX(0);
      setDragY(0);
    }, 350);
  }, [current, listings]);

  const goBack = useCallback(() => {
    if (current > 0) setCurrent((c) => c - 1);
  }, [current]);

  /* ── Image carousel navigation ── */
  const prevImage = useCallback((e: ReactMouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setImageIdx((i) => Math.max(0, i - 1));
  }, []);

  const nextImage = useCallback((e: ReactMouseEvent, maxIdx: number) => {
    e.stopPropagation();
    e.preventDefault();
    setImageIdx((i) => Math.min(maxIdx, i + 1));
  }, []);

  /* ── Loading skeleton ── */
  if (loading) {
    return (
      <div className="swipe-stack-wrapper">
        <div className="swipe-stack-container">
          <div className="swipe-card swipe-card--skeleton">
            <div className="swipe-card__img-skeleton" />
            <div className="swipe-card__body-skeleton">
              <div className="skeleton-line w-3/4 h-5" />
              <div className="skeleton-line w-1/2 h-4 mt-2" />
              <div className="skeleton-line w-1/3 h-6 mt-4" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ── All done ── */
  if (current >= listings.length) {
    return (
      <div className="swipe-stack-wrapper">
        <div className="swipe-stack-empty">
          <div className="swipe-stack-empty__icon">
            <Star className="w-12 h-12 text-amber-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-800 mt-4">Hai visto tutto!</h3>
          <p className="text-gray-500 mt-1 text-sm max-w-xs text-center">
            Hai sfogliato tutte le {listings.length} stanze. Prova a modificare i filtri o torna indietro.
          </p>
          {liked.size > 0 && (
            <p className="text-sm text-pink-500 mt-3 font-medium">
              <Heart className="w-4 h-4 inline mr-1" fill="currentColor" />
              {liked.size} stanz{liked.size === 1 ? 'a' : 'e'} salvat{liked.size === 1 ? 'a' : 'e'}
            </p>
          )}
          <button
            onClick={() => { setCurrent(0); setLiked(new Set()); }}
            className="mt-6 px-6 py-2.5 bg-sky-500 hover:bg-sky-600 text-white rounded-full font-semibold text-sm transition-colors"
          >
            Ricomincia
          </button>
        </div>
      </div>
    );
  }

  /* ── Compute swipe feedback color ── */
  const absX = Math.abs(dragX);
  const swipeProgress = Math.min(absX / SWIPE_THRESHOLD, 1);
  const isLikeHint = dragX > 30;
  const isSkipHint = dragX < -30;

  /* ── Render stack ── */
  const visibleCards = listings.slice(current, current + MAX_VISIBLE);

  return (
    <div className="swipe-stack-wrapper">
      {/* Counter */}
      <div className="swipe-stack-counter">
        <span className="font-bold text-sky-600">{current + 1}</span>
        <span className="text-gray-400"> / {listings.length}</span>
        {liked.size > 0 && (
          <span className="ml-3 text-pink-500 text-xs font-medium">
            <Heart className="w-3 h-3 inline mr-0.5" fill="currentColor" />
            {liked.size}
          </span>
        )}
      </div>

      {/* 3D Card Stack */}
      <div className="swipe-stack-container" ref={containerRef}>
        <div className="swipe-stack-perspective">
          {visibleCards.map((room, stackIdx) => {
            const isTop = stackIdx === 0;
            const images = room.images.filter((img) => img.url !== '/placeholder.jpg');
            const hasImages = images.length > 0;

            /* Stack transforms for background cards */
            const baseScale = 1 - stackIdx * 0.05;
            const baseY = stackIdx * -12;
            const baseZ = -stackIdx * 30;

            /* Top card drag transforms */
            let tx = 0;
            let ty = 0;
            let rot = 0;
            let opacity = 1;

            if (isTop) {
              if (exitDir) {
                tx = exitDir === 'right' ? 600 : -600;
                ty = dragY;
                rot = exitDir === 'right' ? 25 : -25;
                opacity = 0;
              } else {
                tx = dragX;
                ty = dragY;
                rot = dragX * ROTATION_FACTOR;
              }
            }

            const cardStyle: React.CSSProperties = isTop
              ? {
                  transform: `translate3d(${tx}px, ${ty}px, 0px) rotate(${rot}deg) scale(${baseScale})`,
                  zIndex: MAX_VISIBLE - stackIdx,
                  opacity,
                  transition: isDragging ? 'none' : 'all 0.35s cubic-bezier(.4,.2,.2,1)',
                  cursor: isDragging ? 'grabbing' : 'grab',
                }
              : {
                  transform: `translate3d(0px, ${baseY}px, ${baseZ}px) scale(${baseScale})`,
                  zIndex: MAX_VISIBLE - stackIdx,
                  transition: 'all 0.35s cubic-bezier(.4,.2,.2,1)',
                  pointerEvents: 'none' as const,
                };

            return (
              <div
                key={room.id}
                className={`swipe-card ${isTop ? 'swipe-card--active' : ''} ${isTop && isDragging ? 'swipe-card--dragging' : ''}`}
                style={cardStyle}
                onTouchStart={isTop ? handleTouchStart : undefined}
                onTouchMove={isTop ? handleTouchMove : undefined}
                onTouchEnd={isTop ? handleTouchEnd : undefined}
                onMouseDown={isTop ? handleMouseDown : undefined}
              >
                {/* ── Swipe feedback overlays ── */}
                {isTop && isLikeHint && (
                  <div
                    className="swipe-card__overlay swipe-card__overlay--like"
                    style={{ opacity: swipeProgress }}
                  >
                    <Heart className="w-16 h-16" />
                    <span>MI PIACE</span>
                  </div>
                )}
                {isTop && isSkipHint && (
                  <div
                    className="swipe-card__overlay swipe-card__overlay--skip"
                    style={{ opacity: swipeProgress }}
                  >
                    <X className="w-16 h-16" />
                    <span>SALTA</span>
                  </div>
                )}

                {/* ── Image area ── */}
                <div className="swipe-card__image">
                  {hasImages ? (
                    <>
                      <img
                        src={images[imageIdx % images.length]?.url}
                        alt={room.title}
                        className="swipe-card__img"
                        draggable={false}
                      />
                      {/* Image dots */}
                      {images.length > 1 && (
                        <div className="swipe-card__dots">
                          {images.map((_, di) => (
                            <span
                              key={di}
                              className={`swipe-card__dot ${di === imageIdx % images.length ? 'swipe-card__dot--active' : ''}`}
                            />
                          ))}
                        </div>
                      )}
                      {/* Image nav arrows */}
                      {images.length > 1 && isTop && (
                        <>
                          {imageIdx > 0 && (
                            <button className="swipe-card__img-nav swipe-card__img-nav--left" onClick={prevImage}>
                              <ChevronLeft className="w-5 h-5" />
                            </button>
                          )}
                          {imageIdx < images.length - 1 && (
                            <button
                              className="swipe-card__img-nav swipe-card__img-nav--right"
                              onClick={(e) => nextImage(e, images.length - 1)}
                            >
                              <ChevronRight className="w-5 h-5" />
                            </button>
                          )}
                        </>
                      )}
                    </>
                  ) : (
                    <div className="swipe-card__img-placeholder">
                      <MapPin className="w-10 h-10 text-gray-300" />
                    </div>
                  )}

                  {/* Price badge */}
                  <div className="swipe-card__price-badge">
                    €{room.price}<span>/mese</span>
                  </div>
                </div>

                {/* ── Body ── */}
                <div className="swipe-card__body">
                  <h3 className="swipe-card__title">{room.title}</h3>

                  <p className="swipe-card__location">
                    <MapPin className="w-4 h-4" />
                    {room.neighborhood || room.city}
                  </p>

                  <div className="swipe-card__tags">
                    <span className="swipe-card__tag">
                      <BedDouble className="w-3.5 h-3.5" />
                      {getRoomTypeLabel(room.roomType)}
                    </span>
                    <span className="swipe-card__tag">
                      <Maximize className="w-3.5 h-3.5" />
                      {room.roomSize}m²
                    </span>
                    {room.features.wifi && (
                      <span className="swipe-card__tag swipe-card__tag--accent">
                        <Wifi className="w-3.5 h-3.5" />
                        WiFi
                      </span>
                    )}
                    {room.features.furnished && (
                      <span className="swipe-card__tag swipe-card__tag--accent">
                        🪑 Arredato
                      </span>
                    )}
                  </div>

                  <div className="swipe-card__footer">
                    <span className="swipe-card__roommates">
                      <Users className="w-4 h-4" />
                      {room.currentRoommates}/{room.maxRoommates}
                    </span>
                    <span className="swipe-card__available">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(room.availableFrom).toLocaleDateString('it-IT', { day: 'numeric', month: 'short' })}
                    </span>
                    <Link
                      href={`/stanza/${room.id}`}
                      className="swipe-card__detail-btn"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Eye className="w-4 h-4" />
                      Dettagli
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Action buttons ── */}
      <div className="swipe-stack-actions">
        <button
          className="swipe-action-btn swipe-action-btn--back"
          onClick={goBack}
          disabled={current === 0}
          title="Torna indietro"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <button
          className="swipe-action-btn swipe-action-btn--skip"
          onClick={skip}
          title="Salta"
        >
          <X className="w-7 h-7" />
        </button>

        <button
          className="swipe-action-btn swipe-action-btn--like"
          onClick={like}
          title="Mi piace"
        >
          <Heart className="w-7 h-7" />
        </button>

        <Link
          href={listings[current] ? `/stanza/${listings[current].id}` : '#'}
          className="swipe-action-btn swipe-action-btn--detail"
          title="Vedi dettagli"
        >
          <Eye className="w-5 h-5" />
        </Link>
      </div>
    </div>
  );
}
