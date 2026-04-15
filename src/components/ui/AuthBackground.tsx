import { useState } from 'react';

export default function AuthBackground() {
  const candidates = [
    new URL('../../assets/hero-bg-dark.png', import.meta.url).href,
    '/assets/hero-bg-dark.png',
    '/assets/hero-bg-dark.jpg',
  ];
  const [index, setIndex] = useState(0);
  const [failed, setFailed] = useState(false);

  return (
    <>
      <img
        src={candidates[index]}
        alt=""
        aria-hidden
        loading="eager"
        onError={() => {
          const next = index + 1;
          if (next < candidates.length) {
            setIndex(next);
            return;
          }
          setFailed(true);
        }}
        style={{ display: failed ? 'none' : undefined }}
        className="pointer-events-none fixed inset-0 z-0 h-full w-full object-cover"
      />
      <div aria-hidden className="pointer-events-none fixed inset-0 z-[1] bg-slate-950/70" />
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-[2] bg-[radial-gradient(circle_at_top,rgba(249,115,22,0.32),transparent_55%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-[3] bg-[radial-gradient(circle_at_bottom,rgba(255,255,255,0.08),transparent_55%)]"
      />
    </>
  );
}

