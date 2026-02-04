import React, { useState } from 'react';
import { Monitor, X } from 'lucide-react';

interface DesktopRecommendedBannerProps {
  /** Storage key for remembering dismissal. Defaults to 'desktop-banner-dismissed' */
  storageKey?: string;
}

/**
 * A dismissible banner shown only on mobile screens (< md breakpoint)
 * recommending users try the experience on desktop.
 */
const DesktopRecommendedBanner: React.FC<DesktopRecommendedBannerProps> = ({
  storageKey = 'desktop-banner-dismissed'
}) => {
  const [dismissed, setDismissed] = useState(() => {
    try {
      return sessionStorage.getItem(storageKey) === 'true';
    } catch {
      return false;
    }
  });

  const handleDismiss = () => {
    setDismissed(true);
    try {
      sessionStorage.setItem(storageKey, 'true');
    } catch {
      // Storage unavailable, that's fine
    }
  };

  if (dismissed) return null;

  return (
    <div className="md:hidden bg-amber-900/30 border-b border-amber-800/50 px-4 py-3">
      <div className="flex items-start gap-3">
        <Monitor size={18} className="text-amber-400 flex-shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <p className="text-sm text-amber-200 font-medium">
            Best on Desktop
          </p>
          <p className="text-xs text-amber-200/70 mt-0.5">
            This interactive simulator shines on larger screens where you can see all the columns at once.
          </p>
        </div>
        <button
          onClick={handleDismiss}
          className="text-amber-400/60 hover:text-amber-300 transition-colors flex-shrink-0 p-1 -mr-1"
          aria-label="Dismiss"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
};

export default DesktopRecommendedBanner;
