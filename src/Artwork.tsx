import { useEffect, useRef, useState } from 'react';
import { Globe2, Magnet, Video } from 'lucide-react';
import type { Kind } from './types';
export default function Artwork({ onChoose, disabled = false }: { onChoose: (kind: Kind) => void; disabled?: boolean }) {
  const stage = useRef<HTMLButtonElement>(null);
  const bounds = useRef<DOMRect | null>(null);
  const frame = useRef(0);
  const [reduced, setReduced] = useState(false);
  const rotation = useRef(0);
  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const change = () => { setReduced(media.matches); if (media.matches) { stage.current?.style.setProperty('--tilt-x', '0deg'); stage.current?.style.setProperty('--tilt-y', '0deg'); } };
    change(); media.addEventListener('change', change);
    return () => { media.removeEventListener('change', change); cancelAnimationFrame(frame.current); };
  }, []);
  function rotate(amount: number) {
    if (reduced) return;
    rotation.current = Math.max(-16, Math.min(16, rotation.current + amount));
    stage.current?.style.setProperty('--tilt-y', `${rotation.current}deg`);
    stage.current?.style.setProperty('--tilt-x', '-3deg');
  }
  return <div className="artwork" aria-label="Interactive download artwork">
    <button type="button" ref={stage} className="artwork-stage" aria-label="Rotate download sculpture" aria-describedby="artwork-hint" disabled={reduced}
      onPointerEnter={() => { bounds.current = stage.current?.getBoundingClientRect() || null; }}
      onPointerMove={e => {
        if (reduced || e.pointerType !== 'mouse' || !bounds.current) return;
        const x = (e.clientX - bounds.current.left) / bounds.current.width - .5;
        const y = (e.clientY - bounds.current.top) / bounds.current.height - .5;
        cancelAnimationFrame(frame.current);
        frame.current = requestAnimationFrame(() => { stage.current?.style.setProperty('--tilt-x', `${-y * 10}deg`); stage.current?.style.setProperty('--tilt-y', `${x * 16}deg`); });
      }}
      onPointerLeave={() => { cancelAnimationFrame(frame.current); stage.current?.style.setProperty('--tilt-x', '0deg'); stage.current?.style.setProperty('--tilt-y', '0deg'); rotation.current = 0; }}
      onClick={() => rotate(rotation.current >= 12 ? -24 : 8)}
      onKeyDown={e => { if (['ArrowLeft', 'ArrowRight'].includes(e.key)) { e.preventDefault(); rotate(e.key === 'ArrowLeft' ? -8 : 8); } }}>
      <img src="/assets/fetch-sculpture.webp" width="900" height="900" alt="Brushed silver download arrow above a tray, surrounded by file, video, and torrent tiles" fetchPriority="high"/>
    </button>
    <div className="artwork-sources" aria-label="Quick source options">
      <button aria-label="New web download" disabled={disabled} onClick={() => onChoose('web')}><Globe2 size={14} aria-hidden="true"/>Files</button>
      <button aria-label="New YouTube download" disabled={disabled} onClick={() => onChoose('youtube')}><Video size={14} aria-hidden="true"/>Video</button>
      <button aria-label="New torrent download" disabled={disabled} onClick={() => onChoose('torrent')}><Magnet size={14} aria-hidden="true"/>Torrents</button>
    </div>
    <span id="artwork-hint" className="sr-only">Move your pointer, press left or right, or activate to rotate. Motion is disabled when reduced motion is enabled.</span>
  </div>;
}
