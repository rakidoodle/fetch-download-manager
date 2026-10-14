import { useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { ArrowDownToLine, Check, File, FolderDown, Globe2, HardDrive, Info, LoaderCircle, Magnet, Music2, Upload, Video, X, Zap } from 'lucide-react';
import { bytes, mediaLabel, statusName } from './lib';
import { kindIcons, JobControls, Progress } from './ui';
import { kindNames, type Kind, type Job, type Prefs, type State } from './types';

export function Modal({ title, subtitle, children, onClose }: { title: string; subtitle: string; children: ReactNode; onClose: () => void }) {
  const dialog = useRef<HTMLDivElement>(null); const onCloseRef = useRef(onClose); onCloseRef.current = onClose;
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const old = document.body.style.overflow; document.body.style.overflow = 'hidden';
    const app = document.getElementById('workspace'); app?.setAttribute('inert', '');
    dialog.current?.querySelector<HTMLElement>('input, button, select, textarea, a')?.focus();
    const listener = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCloseRef.current();
      if (e.key === 'Tab') {
        const elements = Array.from(dialog.current?.querySelectorAll<HTMLElement>('button:not(:disabled), input:not(:disabled), textarea:not(:disabled), select:not(:disabled), a[href]') || []);
        const first = elements[0]; const last = elements.at(-1);
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last?.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first?.focus(); }
      }
    };
    window.addEventListener('keydown', listener);
    return () => { document.body.style.overflow = old; app?.removeAttribute('inert'); window.removeEventListener('keydown', listener); previous?.focus(); };
  }, []);
  return <div className="modal-backdrop" onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }}>
    <div className="modal" role="dialog" aria-modal="true" aria-labelledby="dialog-title" aria-describedby="dialog-subtitle" ref={dialog}>
      <div className="modal-heading"><div><h2 id="dialog-title">{title}</h2><p id="dialog-subtitle">{subtitle}</p></div><button className="icon-button" aria-label="Close dialog" onClick={onClose}><X size={20} aria-hidden="true"/></button></div>
      {children}
    </div>
  </div>;
}
export function AddModal({ kind, setKind, prefs, initialSource = '', onClose, onAdd }: { kind: Kind; setKind: (k: Kind) => void; prefs?: Prefs; initialSource?: string; onClose: () => void; onAdd: (data: unknown) => Promise<void> }) {
  const [source, setSource] = useState(initialSource);
  const [mode, setMode] = useState<'video' | 'audio'>('video');
  const [resolution, setResolution] = useState('best');
  const [videoFormat, setVideoFormat] = useState('mp4');
  const [audioFormat, setAudioFormat] = useState('mp3');
  const [file, setFile] = useState<{ name: string; torrent: string } | null>(null);
  const [error, setError] = useState(''); const [busy, setBusy] = useState(false); const [reading, setReading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => { if (error && !busy) inputRef.current?.focus(); }, [error, busy]);
  async function upload(input?: globalThis.File) {
    if (!input) return; setReading(true); setError(''); setFile(null);
    try {
      if (!input.name.toLowerCase().endsWith('.torrent') || input.size > 5_000_000) throw new Error('Choose a .torrent file smaller than 5 MB.');
      const data = new Uint8Array(await input.arrayBuffer()); let binary = '';
      for (const byte of data) binary += String.fromCharCode(byte);
      setFile({ name: input.name, torrent: btoa(binary) }); setSource('');
    } catch (e) { setError((e as Error).message); }
    finally { setReading(false); }
  }
  async function submit(e: FormEvent) {
    e.preventDefault(); setBusy(true); setError('');
    try {
      await onAdd({ type: kind, source: source.trim(), ...(kind === 'youtube' ? { mode, resolution: mode === 'audio' ? 'best' : resolution, format: mode === 'audio' ? audioFormat : videoFormat } : {}), ...(kind === 'torrent' && file ? file : {}) });
    } catch (e) { setError((e as Error).message); setBusy(false); inputRef.current?.focus(); }
  }
  const formatNotes: Record<string, string> = { mp4: 'A familiar video format for most devices.', webm: 'An efficient web format. Requires an available WebM stream.', mkv: 'A flexible container that keeps the selected source codecs.', mp3: 'Compact audio for almost any music player.', m4a: 'AAC audio in a compact, widely supported container.', flac: 'Lossless storage. It cannot restore detail missing from the source.', wav: 'Uncompressed audio. Expect a larger file.', opus: 'Efficient audio for modern players.' };
  return <Modal title="New download" subtitle="Choose a source. Make it yours." onClose={onClose}>
    <form onSubmit={submit}>
      <div className="source-tabs" aria-label="Download source">{(['web', 'youtube', 'torrent'] as Kind[]).map(type => { const Icon = kindIcons[type]; return <button type="button" key={type} aria-pressed={kind === type} disabled={busy || reading} className={kind === type ? 'selected' : ''} onClick={() => { setKind(type); setError(''); }}><Icon size={18} aria-hidden="true"/>{kindNames[type]}</button>; })}</div>
      <div className="modal-form">
        <label className="field-label" htmlFor="download-url">{kind === 'torrent' ? 'Magnet link or .torrent URL' : kind === 'youtube' ? 'YouTube video URL' : 'Direct file URL'}</label>
        <input ref={inputRef} id="download-url" type="text" inputMode="url" autoComplete="off" placeholder={kind === 'torrent' ? 'magnet:?xt=urn:btih:…' : kind === 'youtube' ? 'https://www.youtube.com/watch?v=…' : 'https://example.com/file.zip'} value={source} onChange={e => { setSource(e.target.value); setFile(null); }} disabled={busy || reading} required={!file || kind !== 'torrent'} aria-invalid={Boolean(error)} aria-describedby={error ? 'download-error' : 'url-hint'}/>
        <p className="field-hint" id="url-hint">{kind === 'youtube' ? 'One video at a time. Playlists and sign-in are not supported.' : kind === 'torrent' ? 'Paste a magnet link or upload a torrent file below.' : 'Use the file link, rather than a page containing a download button.'}</p>
        {kind === 'torrent' && <><div className="or-divider"><span>or choose a torrent file</span></div><label className={`torrent-upload ${busy || reading ? 'disabled' : ''}`}><Upload size={22} aria-hidden="true"/><span>{reading ? 'Reading torrent…' : file ? file.name : 'Choose a .torrent file'}</span><small>Up to 5 MB</small><input aria-label="Upload torrent file" type="file" accept=".torrent" disabled={busy || reading} onChange={e => void upload(e.target.files?.[0])}/></label></>}
        {kind === 'youtube' && <div className="youtube-options">
          <fieldset className="media-mode"><legend>Download as</legend><div className="segmented-control"><button type="button" aria-pressed={mode === 'video'} className={mode === 'video' ? 'selected' : ''} disabled={busy} onClick={() => setMode('video')}><Video size={16} aria-hidden="true"/>Video</button><button type="button" aria-pressed={mode === 'audio'} className={mode === 'audio' ? 'selected' : ''} disabled={busy} onClick={() => setMode('audio')}><Music2 size={16} aria-hidden="true"/>Audio only</button></div></fieldset>
          <div className="option-grid">
            <div><label className="field-label" htmlFor="resolution">Resolution</label><select id="resolution" value={resolution} disabled={busy || mode === 'audio'} onChange={e => setResolution(e.target.value)} aria-describedby="resolution-hint"><option value="best">Best available</option><option value="2160">Up to 4K · 2160p</option><option value="1440">Up to QHD · 1440p</option><option value="1080">Up to Full HD · 1080p</option><option value="720">Up to HD · 720p</option><option value="480">Up to 480p</option><option value="360">Up to 360p</option><option value="240">Up to 240p</option><option value="144">Up to 144p</option></select></div>
            <div><label className="field-label" htmlFor="output-format">Format</label><select id="output-format" value={mode === 'video' ? videoFormat : audioFormat} onChange={e => mode === 'video' ? setVideoFormat(e.target.value) : setAudioFormat(e.target.value)} disabled={busy} aria-describedby="format-hint">{(mode === 'video' ? ['mp4', 'webm', 'mkv'] : ['mp3', 'm4a', 'flac', 'wav', 'opus']).map(format => <option key={format} value={format}>{format.toUpperCase()}</option>)}</select></div>
          </div>
          <p className="field-hint" id="resolution-hint">{mode === 'audio' ? 'Audio uses the best available source. Resolution does not apply.' : 'This sets the maximum resolution. Actual quality depends on the video.'}</p>
          <div className="output-preview"><span className="output-symbol">{mode === 'video' ? <Video size={22} aria-hidden="true"/> : <Music2 size={22} aria-hidden="true"/>}</span><div><strong>{mode === 'video' ? `${resolution === 'best' ? 'Best available' : `Up to ${resolution}p`} video` : 'Audio only'}<span>{(mode === 'video' ? videoFormat : audioFormat).toUpperCase()}</span></strong><p id="format-hint">{formatNotes[mode === 'video' ? videoFormat : audioFormat]}</p></div></div>
        </div>}
        {kind === 'web' && <div className="form-note"><Zap size={19} aria-hidden="true"/><div><strong>{prefs?.connections || 8} parallel connections</strong><p>Downloads sections together when supported. Falls back automatically when needed.</p></div></div>}
        {kind === 'torrent' && <div className="form-note"><Magnet size={19} aria-hidden="true"/><div><strong>All torrent files included</strong><p>Available peers or web seeds are required. Seeding stops after completion.</p></div></div>}
        {error && <div id="download-error" className="alert" role="alert">{error}</div>}
      </div>
      <div className="modal-footer"><button type="button" className="secondary-button" onClick={onClose}>Cancel</button><button type="submit" className="primary-button" disabled={busy || reading}>{busy ? <LoaderCircle size={17} className="spin" aria-hidden="true"/> : <ArrowDownToLine size={17} aria-hidden="true"/>}{busy ? 'Adding download…' : 'Start download'}</button></div>
    </form>
  </Modal>;
}
export function SettingsModal({ state, onClose, onSave }: { state: State; onClose: () => void; onSave: (settings: Prefs) => Promise<void> }) {
  const [prefs, setPrefs] = useState(state.settings); const [error, setError] = useState(''); const [busy, setBusy] = useState(false);
  async function submit(e: FormEvent) { e.preventDefault(); setBusy(true); try { await onSave(prefs); } catch (e) { setError((e as Error).message); setBusy(false); } }
  return <Modal title="Download settings" subtitle="Find the right pace for your connection." onClose={onClose}><form onSubmit={submit}>
    <div className="modal-form settings-form"><div className="setting-heading"><Zap size={20} aria-hidden="true"/><div><h3>Parallel downloads</h3><p>More connections can help when the server supports them.</p></div></div>
      <label className="field-label" htmlFor="connections">Connections per file <strong>{prefs.connections}</strong></label><input id="connections" type="range" min="1" max="16" value={prefs.connections} disabled={busy} onChange={e => setPrefs({ ...prefs, connections: Number(e.target.value) })}/><div className="range-labels"><span>1 connection</span><span>16 connections</span></div>
      <label className="field-label" htmlFor="max-active">Simultaneous downloads</label><select id="max-active" value={prefs.maxActive} disabled={busy} onChange={e => setPrefs({ ...prefs, maxActive: Number(e.target.value) })}>{Array.from({ length: 8 }, (_, i) => <option value={i + 1} key={i}>{i + 1} download{i ? 's' : ''}</option>)}</select><p className="field-hint">Extra downloads wait. Lowering this value lets current downloads finish.</p>
      <label className="field-label" htmlFor="speed-limit">Web & torrent speed limit · KiB/s</label><input id="speed-limit" type="number" min="0" max="1000000" step="1" value={prefs.speedLimit} disabled={busy} onChange={e => setPrefs({ ...prefs, speedLimit: Number(e.target.value) })} required/><p className="field-hint">0 means unlimited. Applies immediately to web/torrents and individually to new YouTube jobs.</p>
      <div className="folder-setting"><FolderDown size={20} aria-hidden="true"/><div><strong>Download folder</strong><code>{state.downloadDir}</code><p>Each download gets its own folder.</p></div></div>
      <div className="engine-status">{[['aria2', 'Web & torrents'], ['youtube', 'YouTube'], ['ffmpeg', 'Media processing']].map(([engine, label]) => <span key={engine}><span className={`status-dot ${!state.engines[engine as keyof State['engines']] ? 'offline' : ''}`}/>{label}{!state.engines[engine as keyof State['engines']] && ' · missing'}</span>)}</div>
      {error && <div className="alert" role="alert">{error}</div>}
    </div><div className="modal-footer"><button type="button" className="secondary-button" onClick={onClose}>Cancel</button><button className="primary-button" type="submit" disabled={busy}>{busy ? <LoaderCircle className="spin" size={17} aria-hidden="true"/> : <Check size={17} aria-hidden="true"/>}Save settings</button></div>
  </form></Modal>;
}
export function HelpModal({ onClose }: { onClose: () => void }) {
  return <Modal title="Make yourself at home" subtitle="A quick guide to Fetch." onClose={onClose}><div className="help-content">
    <h3><Globe2 size={18} aria-hidden="true"/>Web files</h3><p>Paste a direct HTTP or HTTPS file link. Larger files use parallel byte ranges when supported. Small files and servers without ranges use a suitable single transfer. Server and connection limits still apply.</p>
    <h3><Video size={18} aria-hidden="true"/>YouTube</h3><p>Choose video or audio, a maximum resolution, and an output format. yt-dlp retrieves the source; FFmpeg merges or converts it. Resolution depends on availability. WebM needs matching streams. Private, restricted, unavailable, and login-required videos can fail.</p>
    <h3><Magnet size={18} aria-hidden="true"/>Torrents</h3><p>Use a magnet link, a .torrent URL, or a torrent upload. Files need available peers or web seeds. All included files are downloaded. Seeding stops when the job completes.</p>
    <h3><HardDrive size={18} aria-hidden="true"/>Your device</h3><p>Files live in separate download folders. Closing this tab keeps downloads running while the server is on. A normal server shutdown pauses unfinished work. Resume after restarting. Removing history keeps files on disk.</p>
    <div className="help-setup"><strong>Install the download engines</strong><code>brew install aria2 yt-dlp ffmpeg</code><p>Use content you have permission to access. Press Escape to close a dialog. Arrow keys rotate the silver artwork. Reduced motion turns decorative movement off.</p></div>
  </div></Modal>;
}
export function DetailModal({ job, pending, onClose, onAction }: { job: Job; pending: boolean; onClose: () => void; onAction: (verb: string) => void }) {
  return <Modal title="Download details" subtitle={kindNames[job.type]} onClose={onClose}><div className="detail-content">
    <h3>{job.name}</h3><div className="detail-badges"><span className={`status-label ${job.status}`}>{statusName(job.status)}</span>{job.type === 'youtube' && <span className="media-badge">{mediaLabel(job)}</span>}</div>
    <div className="detail-progress"><Progress job={job}/></div><dl className="detail-grid"><div><dt>Downloaded</dt><dd>{bytes(job.completed)} / {job.total ? bytes(job.total) : 'Unknown size'}</dd></div><div><dt>Speed</dt><dd>{bytes(job.speed)}/s</dd></div><div><dt>{job.type === 'torrent' ? 'Connected peers' : 'Connections'}</dt><dd>{job.connections || (job.type === 'youtube' ? 'Managed by yt-dlp' : 0)}</dd></div><div><dt>Added</dt><dd>{new Date(job.created).toLocaleString()}</dd></div></dl>
    {job.type !== 'youtube' && job.segments.length > 0 && <div className="pieces"><h4>Verified pieces</h4><div className="piece-map">{job.segments.map((p, i) => <span key={i} style={{ '--piece-progress': `${p * 100}%` } as React.CSSProperties} title={`Piece group ${i + 1}: ${Math.round(p * 100)}% complete`}/>)}</div><p>Blocks show actual completed piece groups reported by aria2.</p></div>}
    <h4 className="field-label">Source</h4><div className="source-link">{job.source}</div>{job.error && <div className="alert" role="alert"><Info size={17} aria-hidden="true"/><span>{job.error}</span></div>}
    {job.status === 'completed' && <div className="file-links"><h4>Files</h4>{job.files.map((file, index) => <a key={file.path} href={`/api/downloads/${job.id}/files/${index}`} download><File size={17} aria-hidden="true"/><span>{file.name}</span><ArrowDownToLine size={17} aria-hidden="true"/></a>)}</div>}
    <div className="detail-controls"><JobControls job={job} pending={pending} onAction={onAction}/></div>
  </div></Modal>;
}
