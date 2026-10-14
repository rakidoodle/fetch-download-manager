import { useEffect, useRef, useState, type FormEvent } from 'react';
import { createRoot } from 'react-dom/client';
import { ArrowDown, ArrowDownToLine, ArrowUpRight, Check, CheckCheck, ChevronDown, CircleHelp, Clock3, FolderDown, Heart, Info, LayoutGrid, Link2, LoaderCircle, Moon, Pause, Plus, Search, Settings2, ShieldCheck, Sun, X, Zap } from 'lucide-react';
import Artwork from './Artwork';
import { AddModal, DetailModal, HelpModal, SettingsModal } from './dialogs';
import { age, bytes, detect } from './lib';
import { BrandMark, DownloadRow, kindIcons } from './ui';
import { live, supportUrl, type Job, type Kind, type State, type View } from './types';
import './styles.css';

type Theme = 'dark' | 'light';
function getTheme(): Theme { try { return localStorage.getItem('fetch-theme') === 'light' ? 'light' : 'dark'; } catch { return 'dark'; } }

function App() {
  const [state, setState] = useState<State | null>(null); const [offline, setOffline] = useState(false);
  const [theme, setTheme] = useState<Theme>(getTheme);
  const [view, setView] = useState<View>('all'); const [filter, setFilter] = useState('all'); const [search, setSearch] = useState(''); const [sort, setSort] = useState('newest');
  const [modal, setModal] = useState<'add' | 'settings' | 'help' | null>(null); const [addKind, setAddKind] = useState<Kind>('web'); const [initialSource, setInitialSource] = useState('');
  const [quick, setQuick] = useState(''); const [quickError, setQuickError] = useState(''); const [detail, setDetail] = useState<string | null>(null);
  const [notice, setNotice] = useState<{ text: string; error?: boolean } | null>(null); const [pending, setPending] = useState<string[]>([]);
  const key = useRef(''); const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => { document.documentElement.dataset.theme = theme; document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#101113' : '#f6f6f8'); try { localStorage.setItem('fetch-theme', theme); } catch { /* Theme still applies when browser storage is unavailable. */ } }, [theme]);
  const refresh = async (signal?: AbortSignal) => {
    const response = await fetch('/api/state', { signal: signal ? AbortSignal.any([signal, AbortSignal.timeout(10000)]) : AbortSignal.timeout(10000) });
    if (!response.ok) throw new Error('Cannot reach the download service.');
    const data: State = await response.json(); key.current = data.key; setState(data); setOffline(false); return data;
  };
  useEffect(() => {
    const controller = new AbortController(); let running = false;
    const poll = async () => { if (running) return; running = true; try { await refresh(controller.signal); } catch { if (!controller.signal.aborted) setOffline(true); } finally { running = false; } };
    void poll(); const timer = setInterval(poll, 1000);
    return () => { controller.abort(); clearInterval(timer); };
  }, []);
  useEffect(() => () => { if (toastTimer.current) clearTimeout(toastTimer.current); }, []);
  function notify(text: string, error = false) { setNotice({ text, error }); if (toastTimer.current) clearTimeout(toastTimer.current); toastTimer.current = setTimeout(() => setNotice(null), 5000); }
  async function api(url: string, body: unknown, method = 'POST') {
    const response = await fetch(url, { method, headers: { 'Content-Type': 'application/json', 'X-Fetch-Key': key.current }, body: JSON.stringify(body), signal: AbortSignal.timeout(15000) });
    const result = await response.json(); if (!response.ok) throw new Error(result.error || 'Request failed.'); await refresh(); return result;
  }
  async function action(job: Job, verb: string) {
    setPending(p => [...p, job.id]);
    try { await api(`/api/downloads/${job.id}/${verb}`, {}); if (verb === 'remove') { if (detail === job.id) setDetail(null); notify('Removed from history. Files remain on disk.'); } }
    catch (e) { notify((e as Error).message, true); }
    finally { setPending(p => p.filter(id => id !== job.id)); }
  }
  function openAdd(kind: Kind = 'web', source = '') { setAddKind(kind); setInitialSource(source); setModal('add'); }
  async function quickAdd(event: FormEvent) {
    event.preventDefault(); if (!quick.trim()) return;
    const source = quick.trim(); const type = detect(source); setQuickError('');
    if (type === 'youtube') { openAdd(type, source); return; }
    setPending(p => [...p, 'quick']);
    try { await api('/api/downloads', { source, type }); setQuick(''); notify('Download added to your queue.'); }
    catch (e) { setQuickError((e as Error).message); }
    finally { setPending(p => p.filter(id => id !== 'quick')); }
  }
  function chooseView(next: View) { setView(next); setFilter('all'); setSearch(''); }
  const jobs = state?.jobs || []; const active = jobs.filter(live); const completed = jobs.filter(j => j.status === 'completed');
  const speed = active.reduce((sum, j) => sum + j.speed, 0); const waiting = jobs.filter(j => j.status === 'queued').length;
  const shown = jobs.filter(j => (view === 'all' || j.type === view || view === 'completed' && j.status === 'completed' || view === 'paused' && j.status === 'paused') && (filter === 'all' || filter === 'active' && live(j) || filter === j.status) && `${j.name} ${j.source}`.toLowerCase().includes(search.toLowerCase())).sort((a, b) => sort === 'name' ? a.name.localeCompare(b.name) : sort === 'oldest' ? a.created - b.created : b.created - a.created);
  const selected = jobs.find(j => j.id === detail);
  const headings: Record<View, [string, string]> = { all: ['Every download.', 'One destination.'], web: ['The files you need.', 'Within reach.'], youtube: ['Your videos.', 'Your format.'], torrent: ['Shared files.', 'Your collection.'], completed: ['Downloaded.', 'Ready for you.'], paused: ['Take a pause.', 'Pick up here.'] };
  const enginesReady = state && Object.values(state.engines).every(Boolean);
  const health = offline ? 'Service disconnected' : !state ? 'Connecting to your device…' : !enginesReady ? 'Download engines need setup' : 'Ready on your device';

  return <>
    <div className="app-shell" id="workspace">
      <a className="skip-link" href="#main-content">Skip to downloads</a>
      <header className="global-header"><div className="header-inner">
        <a className="brand" href="/" aria-label="Fetch home"><BrandMark size={34}/><span>Fetch</span><span className="brand-description">Download manager</span></a>
        <div className="header-actions"><a className="support-link" href={supportUrl} target="_blank" rel="noopener noreferrer"><Heart size={16} aria-hidden="true"/><span>Feed my Baby</span><ArrowUpRight size={13} aria-hidden="true"/></a><div className="header-divider"/>
          <button className="icon-button" aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'} title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'} onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}>{theme === 'dark' ? <Sun size={18} aria-hidden="true"/> : <Moon size={18} aria-hidden="true"/>}</button>
          <button className="icon-button" aria-label="Settings" title="Settings" disabled={!state || offline} onClick={() => setModal('settings')}><Settings2 size={18} aria-hidden="true"/></button>
        </div>
      </div></header>
      <main className="main-content" id="main-content" tabIndex={-1}>
        <section className="hero" aria-label="Download workspace">
          <div className="hero-copy"><h1><span>{headings[view][0]}</span><span>{headings[view][1]}</span></h1><p>Files, videos, and torrents.<br/>{' '}A single workspace. Right on your device.</p><div className="hero-actions"><button className="primary-button" onClick={() => openAdd(view === 'web' || view === 'youtube' || view === 'torrent' ? view : 'web')} disabled={!state || offline}><Plus size={18} aria-hidden="true"/>New download</button><span className={`device-status ${offline || state && !enginesReady ? 'degraded' : ''}`} role="status"><span className="status-dot"/>{health}</span></div></div>
          <Artwork disabled={!state || offline} onChoose={kind => { if (state && !offline) openAdd(kind); }}/>
        </section>
        {offline && <div className="alert" role="alert"><Info size={18} aria-hidden="true"/><span>Download service disconnected. Start <code>npm run dev</code>. Reconnecting automatically.</span></div>}
        {state && !enginesReady && <div className="alert" role="alert"><Info size={18} aria-hidden="true"/><span>Missing engine: {Object.entries(state.engines).filter(([, ready]) => !ready).map(([name]) => name).join(', ')}. Open Help for setup.</span></div>}
        {state?.error && <div className="alert" role="alert">{state.error}</div>}
        <section className="link-section" aria-label="Add a download link"><form onSubmit={quickAdd}>
          <label className="quick-label" htmlFor="quick-link">Start with a link</label>
          <div className={`quick-add ${quickError ? 'invalid' : ''}`}><Link2 size={20} aria-hidden="true"/><input id="quick-link" aria-label="Paste download link" aria-invalid={Boolean(quickError)} aria-describedby={quickError ? 'quick-error' : 'quick-hint'} inputMode="url" placeholder="Paste a file URL, YouTube link, or magnet link" value={quick} onChange={e => { setQuick(e.target.value); if (quickError) setQuickError(''); }} disabled={!state || offline || pending.includes('quick')}/><button type="submit" aria-label="Add to queue" className="quick-button" disabled={!quick.trim() || pending.includes('quick') || offline}>{pending.includes('quick') ? <LoaderCircle size={18} className="spin" aria-hidden="true"/> : <ArrowDownToLine size={18} aria-hidden="true"/>}<span>Add to queue</span></button></div>
          {quickError ? <p className="inline-error" id="quick-error" role="alert">{quickError}</p> : <div className="quick-hint" id="quick-hint"><span>Source detected automatically. YouTube opens resolution and format options.</span><span><ShieldCheck size={13} aria-hidden="true"/>Saved locally</span></div>}
        </form></section>
        <section className="overview" aria-label="Download overview"><div className="overview-stat"><ArrowDown size={18} aria-hidden="true"/><div><strong aria-live="polite" aria-atomic="true">{active.length} downloading</strong><span>{waiting} waiting in queue</span></div></div><div className="overview-stat"><Zap size={18} aria-hidden="true"/><div><strong>{bytes(speed)}/s</strong><span>Total download speed</span></div></div><div className="overview-stat"><CheckCheck size={18} aria-hidden="true"/><div><strong>{completed.length} completed</strong><span>{bytes(completed.reduce((n, j) => n + j.total, 0))} saved</span></div></div><button className="connection-setting" onClick={() => setModal('settings')} disabled={!state || offline}><span><strong>{state?.settings.connections || 8}</strong> parallel connections</span><span>Make it your pace <ArrowUpRight size={13} aria-hidden="true"/></span></button></section>
        <nav className="source-navigation" aria-label="Download navigation">
          <Nav icon={LayoutGrid} name="All downloads" active={view === 'all'} count={jobs.length} onClick={() => chooseView('all')}/>
          <Nav icon={kindIcons.web} name="Web files" active={view === 'web'} count={jobs.filter(j => j.type === 'web').length} onClick={() => chooseView('web')}/>
          <Nav icon={kindIcons.youtube} name="YouTube videos" active={view === 'youtube'} count={jobs.filter(j => j.type === 'youtube').length} onClick={() => chooseView('youtube')}/>
          <Nav icon={kindIcons.torrent} name="Torrents" active={view === 'torrent'} count={jobs.filter(j => j.type === 'torrent').length} onClick={() => chooseView('torrent')}/>
          <div className="nav-spacer"/><Nav icon={CheckCheck} name="Completed" active={view === 'completed'} count={completed.length} onClick={() => chooseView('completed')}/>
          <Nav icon={Pause} name="Paused" active={view === 'paused'} count={jobs.filter(j => j.status === 'paused').length} onClick={() => chooseView('paused')}/>
        </nav>
        <div className="content-columns"><section className="downloads-panel" aria-label="Downloads">
          <div className="panel-heading"><h2>Your downloads <span>{shown.length}</span></h2><div className="list-tools"><label className="search-field"><Search size={16} aria-hidden="true"/><span className="sr-only">Search downloads</span><input aria-label="Search downloads" placeholder="Search files" value={search} onChange={e => setSearch(e.target.value)}/></label><label className="sort-field"><span className="sr-only">Sort downloads</span><select value={sort} onChange={e => setSort(e.target.value)}><option value="newest">Newest first</option><option value="oldest">Oldest first</option><option value="name">Name A–Z</option></select><ChevronDown size={14} aria-hidden="true"/></label></div></div>
          <div className="filter-tabs" role="group" aria-label="Filter downloads">{[['all', 'All files'], ['active', 'Downloading'], ['queued', 'Queued'], ['completed', 'Completed'], ['error', 'Failed']].map(([id, label]) => <button key={id} onClick={() => setFilter(id)} aria-pressed={filter === id} className={filter === id ? 'selected' : ''}>{label}{id === 'active' && active.length > 0 && <span className="tab-dot"/>}</button>)}</div>
          {!state && !offline ? <div className="skeleton-list" aria-label="Loading download workspace"><div/><div/><div/></div> : shown.length === 0 ? <div className="empty-state"><span className="empty-symbol"><FolderDown size={34} strokeWidth={1.35} aria-hidden="true"/></span><h3>{jobs.length === 0 ? 'Your next download starts here' : 'No downloads in this view'}</h3><p>{jobs.length === 0 ? 'Paste a link above, or choose a source to get started.' : 'Try another filter or search term.'}</p>{jobs.length === 0 ? <button className="secondary-button" onClick={() => openAdd(view === 'web' || view === 'youtube' || view === 'torrent' ? view : 'web')} disabled={!state || offline}><Plus size={16} aria-hidden="true"/>Add your first download</button> : <button className="text-button" onClick={() => chooseView('all')}>Show all downloads</button>}</div> : <div className="download-list">{shown.map(job => <DownloadRow key={job.id} job={job} pending={pending.includes(job.id) || offline} onAction={verb => void action(job, verb)} onSelect={() => setDetail(job.id)}/>)}</div>}
          <div className="panel-footer"><FolderDown size={14} aria-hidden="true"/><span>Saved in <button className="inline-link" title={state?.downloadDir} onClick={() => setModal('settings')} disabled={!state || offline}>downloads</button></span><span>Files stay on your device.</span></div>
        </section>
        <aside className="right-column"><section className="activity-panel"><div className="activity-heading"><h2>Recent activity</h2><Clock3 size={17} aria-hidden="true"/></div>
          {state?.events.length ? <div className="activity-list">{state.events.slice(0, 4).map(event => { const Icon = kindIcons[event.type]; return <div className="activity-item" key={event.id}><span className={`activity-icon ${event.type}`}><Icon size={16} aria-hidden="true"/></span><div><strong>{event.verb === 'added' ? 'Added to queue' : event.verb.charAt(0).toUpperCase() + event.verb.slice(1)}</strong><p title={event.name}>{event.name}</p><time>{age(event.time)}</time></div></div>; })}</div> : <div className="activity-empty"><Clock3 size={27} strokeWidth={1.35} aria-hidden="true"/><p>A clean slate.</p><span>Activity appears when you<br/>add your first download.</span></div>}
        </section><section className="support-panel"><Heart size={23} strokeWidth={1.4} aria-hidden="true"/><h2>A little support.<br/>{' '}A lot of love.</h2><p>Enjoying Fetch? You can support its creator through PayPal.</p><a href={supportUrl} target="_blank" rel="noopener noreferrer">Feed my Baby <ArrowUpRight size={15} aria-hidden="true"/></a></section></aside></div>
        <footer className="page-footer"><span><BrandMark size={18}/>Fetch <span className="footer-version">v1.0</span></span><p>Close this tab. Downloads continue while the local app runs.</p><button onClick={() => setModal('help')}><CircleHelp size={16} aria-hidden="true"/>Help & shortcuts</button></footer>
      </main>
    </div>
    {notice && <div className={`toast ${notice.error ? 'error' : ''}`} role={notice.error ? 'alert' : 'status'}>{notice.error ? <Info size={18} aria-hidden="true"/> : <Check size={18} aria-hidden="true"/>}<span>{notice.text}</span><button aria-label="Dismiss notification" onClick={() => setNotice(null)}><X size={17} aria-hidden="true"/></button></div>}
    {modal === 'add' && <AddModal kind={addKind} setKind={setAddKind} prefs={state?.settings} initialSource={initialSource} onClose={() => setModal(null)} onAdd={async data => { await api('/api/downloads', data); setModal(null); setQuick(''); notify('Download added to your queue.'); }}/ >}
    {modal === 'settings' && state && <SettingsModal state={state} onClose={() => setModal(null)} onSave={async settings => { await api('/api/settings', settings, 'PUT'); setModal(null); notify('Download settings saved.'); }}/ >}
    {modal === 'help' && <HelpModal onClose={() => setModal(null)}/ >}
    {selected && <DetailModal job={selected} pending={pending.includes(selected.id) || offline} onClose={() => setDetail(null)} onAction={verb => void action(selected, verb)}/ >}
  </>;
}
function Nav({ icon: Icon, name, active, count, onClick }: { icon: typeof ArrowDown; name: string; active: boolean; count: number; onClick: () => void }) {
  return <button className={`nav-item ${active ? 'active' : ''}`} onClick={onClick} aria-label={name} aria-current={active ? 'page' : undefined}><Icon size={17} aria-hidden="true"/><span>{name}</span>{count > 0 && <span className="nav-count" aria-hidden="true">{count}</span>}</button>;
}
createRoot(document.getElementById('root')!).render(<App/>);
