'use client';

import { useEffect, useRef, useState } from 'react';

export function CollectionDescription({ text }: { text: string }) {
  const [expanded, setExpanded] = useState(false);
  const [canExpand, setCanExpand] = useState(false);
  const textRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const checkOverflow = () => {
      const node = textRef.current;
      if (!node) return;
      setCanExpand(node.scrollHeight > node.clientHeight + 1);
    };

    const frame = window.requestAnimationFrame(checkOverflow);
    window.addEventListener('resize', checkOverflow);

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener('resize', checkOverflow);
    };
  }, [text]);

  return (
    <div className="mt-2">
      <p ref={textRef} className={`text-sm leading-6 text-muted ${expanded ? '' : 'line-clamp-2 sm:line-clamp-none'}`}>
        {text}
      </p>
      {!expanded && canExpand && (
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
