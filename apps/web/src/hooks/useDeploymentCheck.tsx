'use client';

import { useEffect, useRef } from 'react';
import toast from 'react-hot-toast';

const POLL_MS = 5 * 60 * 1000; // check every 5 minutes

export function useDeploymentCheck() {
  const notified = useRef(false);

  useEffect(() => {
    const clientBuildId = (window as Record<string, any>).__NEXT_DATA__?.buildId as string | undefined;
    if (!clientBuildId) return;

    const check = async () => {
      if (notified.current) return;
      try {
        const res = await fetch('/api/version', { cache: 'no-store' });
        if (!res.ok) return;
        const { buildId } = (await res.json()) as { buildId: string };
        if (buildId && buildId !== 'unknown' && buildId !== clientBuildId) {
          notified.current = true;
          toast.custom(
            () => (
              <button
                onClick={() => window.location.reload()}
                className="flex items-center gap-2 rounded-xl bg-ink px-4 py-3 text-sm font-semibold text-white shadow-pop"
              >
                🔄 Site updated — tap to refresh
              </button>
            ),
            { id: 'deploy-update', duration: Infinity },
          );
        }
      } catch {
        // network error — ignore silently
      }
    };

    const timer = setInterval(check, POLL_MS);
    return () => clearInterval(timer);
  }, []);
}
