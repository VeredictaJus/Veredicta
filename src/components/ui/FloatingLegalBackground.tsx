import { useEffect, useRef } from 'react';

const legalTerms = [
  'lex', 'jus', 'habeas corpus', 'in dubio pro reo', 'pacta sunt servanda',
  'de facto', 'ad hoc', 'erga omnes', 'ex officio', 'prima facie',
  'res judicata', 'stare decisis', 'bona fide', 'corpus juris', 'dura lex sed lex',
  'nemo tenetur', 'nullum crimen', 'onus probandi', 'per se', 'ultra vires',
  'ab initio', 'actus reus', 'amicus curiae', 'animus domini', 'caveat emptor',
];

interface FloatingTerm {
  text: string;
  x: number;
  y: number;
  speedX: number;
  speedY: number;
  fontSize: number;
  opacity: number;
}

export default function FloatingLegalBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const termsRef = useRef<FloatingTerm[]>([]);
  const animRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    termsRef.current = Array.from({ length: 35 }, () => ({
      text: legalTerms[Math.floor(Math.random() * legalTerms.length)],
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      speedX: (Math.random() - 0.5) * 0.4,
      speedY: (Math.random() - 0.5) * 0.3,
      fontSize: 14 + Math.random() * 32,
      opacity: 0.04 + Math.random() * 0.12,
    }));

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (const term of termsRef.current) {
        term.x += term.speedX;
        term.y += term.speedY;

        if (term.x > canvas.width + 200) term.x = -200;
        if (term.x < -200) term.x = canvas.width + 200;
        if (term.y > canvas.height + 50) term.y = -50;
        if (term.y < -50) term.y = canvas.height + 50;

        ctx.font = `${term.fontSize}px 'Georgia', serif`;
        ctx.fillStyle = `hsla(210, 50%, 55%, ${term.opacity})`;
        ctx.fillText(term.text, term.x, term.y);
      }

      animRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animRef.current);
    };
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 h-full w-full z-0" />;
}
