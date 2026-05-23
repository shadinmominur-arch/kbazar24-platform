'use client';

import { useState } from 'react';

export function CollectionDescription({ text }: { text: string }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="mt-2">
      <p className={`text-sm leading-6 text-muted ${expanded ? '' : 'line-clamp-2 sm:line-clamp-none'}`}>
        {text}
      </p>
      {!expanded && (
        <button
          onClick={() => setExpanded(true)}
          className="mt-0.5 text-xs font-semibold text-accent sm:hidden"
        >
          See more…
        </button>
      )}
    </div>
  );
}
