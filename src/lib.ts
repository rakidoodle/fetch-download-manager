import type { Kind } from './types';
export function bytes(n: number, decimals = 1) {
  if (!n || n < 0) return '0 B';
  const i = Math.min(4, Math.floor(Math.log(n) / Math.log(1024)));
  return `${(n / 1024 ** i).toFixed(i ? decimals : 0)} ${['B', 'KB', 'MB', 'GB', 'TB'][i]}`;
}
export function eta(n = 0) {
  if (!n) return 'Estimating time…';
  if (n < 60) return `${Math.ceil(n)}s left`;
  if (n < 3600) return `${Math.ceil(n / 60)}m left`;
  return `${Math.floor(n / 3600)}h ${Math.ceil(n % 3600 / 60)}m left`;
}
export function age(time: number) {
  const sec = Math.max(0, (Date.now() - time) / 1000);
  return sec < 60 ? 'Just now' : sec < 3600 ? `${Math.floor(sec / 60)}m ago` : sec < 86400 ? `${Math.floor(sec / 3600)}h ago` : new Date(time).toLocaleDateString();
}
export function detect(source: string): Kind {
  if (/^magnet:|\.torrent(?:\?|$)/i.test(source)) return 'torrent';
  try { if (['youtube.com', 'www.youtube.com', 'm.youtube.com', 'music.youtube.com', 'youtu.be'].includes(new URL(source).hostname)) return 'youtube'; }
  catch { /* The server validates malformed input. */ }
  return 'web';
}
export function statusName(s: string) {
  return ({ downloading: 'Downloading', processing: 'Processing', queued: 'Queued', paused: 'Paused', completed: 'Completed', error: 'Failed', canceled: 'Canceled' } as Record<string, string>)[s] || s;
}
export function mediaLabel(job: { type: Kind; mode?: string; quality?: string; resolution?: string; format?: string }) {
  if (job.type !== 'youtube') return '';
  const audio = job.mode === 'audio' || job.quality === 'audio';
  const format = job.format || (audio ? 'mp3' : 'mp4');
  const resolution = job.resolution || job.quality || 'best';
  return audio ? `Audio · ${format.toUpperCase()}` : `${resolution === 'best' ? 'Best available' : `Up to ${resolution}p`} · ${format.toUpperCase()}`;
}
