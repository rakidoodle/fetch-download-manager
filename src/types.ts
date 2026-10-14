export type Kind = 'web' | 'youtube' | 'torrent';
export type View = 'all' | Kind | 'completed' | 'paused';
export type Job = {
  id: string; type: Kind; source: string; quality: string; mode?: 'video' | 'audio'; resolution?: string; format?: string;
  name: string; status: string; created: number; finished?: number; total: number; completed: number; speed: number;
  connections: number; seeders?: number; eta?: number; segments: number[];
  files: { name: string; path: string; size?: number }[]; error: string | null;
};
export type Prefs = { connections: number; maxActive: number; speedLimit: number };
export type State = {
  jobs: Job[]; settings: Prefs; engines: { aria2: boolean; youtube: boolean; ffmpeg: boolean };
  events: { id: string; name: string; verb: string; time: number; type: Kind }[];
  downloadDir: string; key: string; error: string | null;
};
export const kindNames = { web: 'Web file', youtube: 'YouTube', torrent: 'Torrent' };
export const live = (j: Job) => ['downloading', 'processing'].includes(j.status);
export const supportUrl = 'https://www.paypal.com/paypalme/ruffytrinidad';
