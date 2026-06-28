import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, ArrowLeft, ArrowRight, Eye, Sparkles } from 'lucide-react';

interface PhotoLightboxProps {
  isOpen: boolean;
  onClose: () => void;
  beforePhoto: string | null;
  afterPhoto: string | null;
  ticketId: string | null;
  citizenName: string | null;
  contractorName: string | null;
  onApprove?: () => void;
  onReject?: () => void;
  showActions?: boolean;
}

export const PhotoLightbox: React.FC<PhotoLightboxProps> = ({
  isOpen,
  onClose,
  beforePhoto,
  afterPhoto,
  ticketId,
  citizenName,
  contractorName,
  onApprove,
  onReject,
  showActions = true,
}) => {
  const [sliderVal, setSliderVal] = useState<number>(50);

  // Sync scroll lock
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Escape key and arrow keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft') {
        setSliderVal((prev) => Math.max(0, prev - 5));
      } else if (e.key === 'ArrowRight') {
        setSliderVal((prev) => Math.min(100, prev + 5));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const hasBothPhotos = !!(beforePhoto && afterPhoto);

  const renderContent = () => {
    return (
      <div 
        className="fixed inset-0 bg-black/95 z-[9999] flex flex-col select-none overflow-y-auto"
        id="photo-lightbox-overlay"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        {/* Header bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-sm text-indigo-400 tracking-wider">
                {ticketId || 'CIVIC-REPORT'}
              </span>
              <span className="text-white/40">·</span>
              <span className="text-xs text-white/70 font-semibold uppercase">
                Visual Inspection Mode
              </span>
            </div>
            <p className="text-[11px] text-white/50 mt-0.5">
              Press <kbd className="bg-white/10 px-1 py-0.5 rounded text-white/90">ESC</kbd> to close · Use <kbd className="bg-white/10 px-1 py-0.5 rounded text-white/90">←</kbd> <kbd className="bg-white/10 px-1 py-0.5 rounded text-white/90">→</kbd> to control slider
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-10 h-10 bg-white/5 hover:bg-white/10 active:scale-95 transition-all text-white rounded-full flex items-center justify-center border border-white/10 cursor-pointer"
            id="btn-close-lightbox"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Main Lightbox Canvas Area */}
        <div className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 md:p-8 flex flex-col justify-center gap-6">
          
          {hasBothPhotos ? (
            <div className="space-y-8">
              {/* Static Side-by-Side Panels */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left: BEFORE */}
                <div className="flex flex-col gap-2">
                  <span className="text-[11px] font-bold text-rose-500 uppercase tracking-widest text-center md:text-left">
                    ● BEFORE
                  </span>
                  <div className="relative aspect-video rounded-xl overflow-hidden border border-white/10 bg-black/50">
                    <img
                      src={beforePhoto || ''}
                      alt="Before ticket work"
                      className="w-full h-full object-contain"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <p className="text-[11px] text-white/60 text-center md:text-left mt-1">
                    Submitted by citizen <strong className="text-white/80">{citizenName || 'Anonymous'}</strong>
                  </p>
                </div>

                {/* Right: AFTER */}
                <div className="flex flex-col gap-2">
                  <span className="text-[11px] font-bold text-emerald-500 uppercase tracking-widest text-center md:text-left flex items-center justify-center md:justify-start gap-1">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                    ● AFTER RESOLUTION
                  </span>
                  <div className="relative aspect-video rounded-xl overflow-hidden border border-white/10 bg-black/50">
                    <img
                      src={afterPhoto || ''}
                      alt="After ticket work"
                      className="w-full h-full object-contain"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <p className="text-[11px] text-white/60 text-center md:text-left mt-1">
                    Uploaded by contractor <strong className="text-white/80">{contractorName || 'Assigned Contractor'}</strong>
                  </p>
                </div>
              </div>

              {/* Interactive Comparison Slider - Hidden on Mobile */}
              <div className="hidden sm:block space-y-3">
                <div className="text-center">
                  <span className="inline-flex items-center gap-1.5 text-xs text-indigo-300 font-semibold bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                    Interactive Swipe Comparison
                  </span>
                </div>

                <div 
                  className="relative w-full max-w-2xl h-[360px] mx-auto overflow-hidden rounded-xl border border-white/20 shadow-2xl select-none"
                  id="lightbox-comparison-slider-container"
                >
                  {/* Underneath: Before Image */}
                  <img
                    src={beforePhoto || ''}
                    alt="Before visual"
                    className="absolute inset-0 w-full h-full object-cover will-change-transform"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-3 left-3 bg-rose-950/80 backdrop-blur-xs text-rose-200 border border-rose-500/30 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md z-10">
                    Before
                  </div>

                  {/* Overlaid / Clipped: After Image */}
                  <img
                    src={afterPhoto || ''}
                    alt="After visual"
                    className="absolute inset-0 w-full h-full object-cover will-change-transform"
                    style={{
                      clipPath: `inset(0 0 0 ${sliderVal}%)`
                    }}
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-3 right-3 bg-emerald-950/80 backdrop-blur-xs text-emerald-200 border border-emerald-500/30 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md z-10">
                    After
                  </div>

                  {/* Vertical Divider line */}
                  <div 
                    className="absolute top-0 bottom-0 w-0.5 bg-white z-20 pointer-events-none"
                    style={{ left: `${sliderVal}%` }}
                  >
                    {/* Circle handle */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white text-slate-800 rounded-full flex items-center justify-center shadow-[0_2px_8px_rgba(0,0,0,0.5)] z-30 font-bold border border-slate-200 text-xs">
                      ↔
                    </div>
                  </div>

                  {/* Range slider input overlaid */}
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={sliderVal}
                    onChange={(e) => setSliderVal(Number(e.target.value))}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-40"
                    id="slider-range-control"
                  />
                </div>
              </div>
            </div>
          ) : (
            /* Single Image Mode */
            <div className="flex flex-col items-center justify-center gap-4">
              <div className="relative max-w-3xl w-full aspect-video md:aspect-[4/3] rounded-xl overflow-hidden border border-white/10 bg-black/50">
                <img
                  src={beforePhoto || ''}
                  alt="Citizen report proof"
                  className="w-full h-full object-contain"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="text-center max-w-md">
                <p className="text-xs text-white/50 uppercase tracking-widest font-mono font-bold">
                  Submitted Proof
                </p>
                <p className="text-sm text-white/90 mt-1 font-medium">
                  Reported by citizen <span className="text-indigo-400 font-semibold">{citizenName || 'Anonymous'}</span>
                </p>
              </div>
            </div>
          )}

        </div>

        {/* Action Panel Footer */}
        {showActions && hasBothPhotos && (onApprove || onReject) && (
          <div className="bg-black/80 border-t border-white/10 px-6 py-5 shrink-0 flex flex-col sm:flex-row items-center justify-center gap-3.5">
            {onReject && (
              <button
                onClick={() => {
                  onReject();
                  onClose();
                }}
                className="w-full sm:w-auto min-w-[160px] inline-flex items-center justify-center px-5 py-2.5 rounded-lg border-2 border-rose-500 hover:bg-rose-500/10 active:scale-[0.98] transition-all text-rose-400 font-bold text-xs uppercase tracking-wider cursor-pointer"
                id="btn-lightbox-reject"
              >
                Reject — Request re-do
              </button>
            )}
            {onApprove && (
              <button
                onClick={() => {
                  onApprove();
                  onClose();
                }}
                className="w-full sm:w-auto min-w-[160px] inline-flex items-center justify-center px-5 py-2.5 rounded-lg bg-[#16A34A] hover:bg-[#15803d] active:scale-[0.98] transition-all text-white font-bold text-xs uppercase tracking-wider cursor-pointer shadow-[0_4px_12px_rgba(22,163,74,0.3)]"
                id="btn-lightbox-approve"
              >
                Approve & Close Issue
              </button>
            )}
          </div>
        )}
      </div>
    );
  };

  return createPortal(renderContent(), document.body);
};
