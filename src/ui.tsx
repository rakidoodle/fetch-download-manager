import { Download, FileArchive, Globe2, Magnet, Pause, Play, Trash2, Video, X } from 'lucide-react';
import { age, bytes, eta, mediaLabel, statusName } from './lib';
import { kindNames, live, type Job } from './types';
export const kindIcons = { web: Globe2, youtube: Video, torrent: Magnet };
export function BrandMark({ size = 32 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 40 40" fill="none" aria-hidden="true"><rect x="1" y="1" width="38" height="38" rx="12" fill="currentColor"/><path d="M20 9v16m-7-7 7 7 7-7M12 30h16" stroke="var(--brand-ink)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>;
}
export function Progress({ job }: { job: Job }) {
  const percent = job.status === 'completed' ? 100 : job.total ? Math.min(100, job.completed / job.total * 100) : 0;
  return <div className={`progress-track ${job.status}`} role="progressbar" aria-label={`${job.name} progress`} aria-valuenow={Math.round(percent)} aria-valuemin={0} aria-valuemax={100}><span style={{ transform: `scaleX(${percent / 100})` }}/></div>;
}
export function JobControls({ job, pending, onAction }: { job: Job; pending: boolean; onAction: (verb: string) => void }) {
  const pausable = live(job) || job.status === 'queued';
  const resumable = ['paused', 'error', 'canceled'].includes(job.status);
  return <div className="job-controls">
    {pausable && <button aria-label={`Pause ${job.name}`} title="Pause download" disabled={pending} onClick={() => onAction('pause')}><Pause size={17} aria-hidden="true"/></button>}
    {resumable && <button aria-label={`${job.status === 'paused' ? 'Resume' : 'Retry'} ${job.name}`} title={job.status === 'paused' ? 'Resume download' : 'Retry download'} disabled={pending} onClick={() => onAction('resume')}><Play size={17} aria-hidden="true"/></button>}
    {job.status === 'completed' && job.files.length === 1 && <a href={`/api/downloads/${job.id}/files/0`} download aria-label={`Save ${job.name}`} title="Save file"><Download size={17} aria-hidden="true"/></a>}
    {!['completed', 'canceled'].includes(job.status) && <button aria-label={`Cancel ${job.name}`} title="Cancel download" disabled={pending} onClick={() => onAction('cancel')}><X size={17} aria-hidden="true"/></button>}
    {!pausable && <button aria-label={`Remove ${job.name} from history`} title="Remove history; keep files" disabled={pending} onClick={() => onAction('remove')}><Trash2 size={17} aria-hidden="true"/></button>}
  </div>;
}
export function DownloadRow({ job, pending, onAction, onSelect }: { job: Job; pending: boolean; onAction: (verb: string) => void; onSelect: () => void }) {
  const Icon = job.type === 'web' && /\.(zip|gz|rar|7z|iso)$/i.test(job.name) ? FileArchive : kindIcons[job.type];
  const progress = job.total ? Math.min(100, job.completed / job.total * 100) : 0;
  const caption = job.error || (job.status === 'completed' ? `Saved locally · ${age(job.finished || job.created)}` : job.status === 'paused' ? 'Ready to resume' : job.status === 'queued' ? 'Waiting for a download slot' : job.status === 'canceled' ? 'Canceled · partial files kept' : job.status === 'processing' ? 'Merging or converting media…' : job.type === 'torrent' && !job.total ? 'Finding peers and torrent metadata…' : eta(job.eta));
  return <article className="download-row">
    <div className={`file-icon ${job.type}`}><Icon size={22} aria-hidden="true"/></div>
    <div className="download-info">
      <div className="download-name-line"><button className="download-name" onClick={onSelect} title={job.name}>{job.name}</button><span className={`status-label ${job.status}`}>{live(job) && <span className="status-dot"/>}{statusName(job.status)}</span></div>
      <div className="download-meta"><span>{kindNames[job.type]}</span>{job.type === 'youtube' && <span>{mediaLabel(job)}</span>}<span>{job.total ? `${bytes(job.completed)} / ${bytes(job.total)}` : 'Resolving size…'}</span>{live(job) && <span className="live-speed">{bytes(job.speed)}/s</span>}</div>
      <Progress job={job}/><div className="download-bottom"><span>{caption}</span><span>{job.status === 'completed' ? '100%' : job.total ? `${Math.round(progress)}%` : '—'}</span></div>
    </div>
    <JobControls job={job} pending={pending} onAction={onAction}/>
  </article>;
}
