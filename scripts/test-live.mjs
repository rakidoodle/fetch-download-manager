import { DownloadManager } from '../server/manager.js';
import { mkdtemp, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import assert from 'node:assert/strict';

const dir = await mkdtemp(path.join(os.tmpdir(), 'fetch-live-'));
const manager = await new DownloadManager({ dataDir: path.join(dir, 'state'), downloadDir: path.join(dir, 'files'), pollMs: 100 }).init();
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
async function until(predicate, timeout = 180000) { const end = Date.now() + timeout; while (Date.now() < end) { if (predicate()) return; await sleep(100); } throw new Error('Live test timed out.'); }
async function waitComplete(job) { await until(() => ['completed', 'error'].includes(job.status)); assert.equal(job.status, 'completed', job.error); return JSON.parse(spawnSync('ffprobe', ['-v', 'quiet', '-show_streams', '-of', 'json', job.files[0].path], { encoding: 'utf8' }).stdout); }
try {
  const source = 'https://www.youtube.com/watch?v=YE7VzlLtp-4';
  const video = await manager.run(() => manager.add({ type: 'youtube', source, quality: '720' }));
  await until(() => video.completed > 0 || video.status === 'error'); assert.notEqual(video.status, 'error', video.error);
  if (video.status === 'downloading') {
    await manager.run(() => manager.action(video.id, 'pause')); const completed = video.completed; await sleep(600); assert.equal(video.status, 'paused'); assert.equal(video.speed, 0); assert.equal(video.completed, completed);
    await manager.run(() => manager.action(video.id, 'resume')); console.log('PASS: live YouTube pause/resume');
  }
  const media = await waitComplete(video);
  assert.ok(media.streams.some(s => s.codec_type === 'video' && s.height <= 720)); assert.ok(media.streams.some(s => s.codec_type === 'audio'));
  console.log(`PASS: live YouTube 720p video + audio (${video.total} bytes)`);
  const audio = await manager.run(() => manager.add({ type: 'youtube', source, quality: 'audio' })); const audioMedia = await waitComplete(audio);
  assert.ok(audioMedia.streams.some(s => s.codec_name === 'mp3')); assert.ok(!audioMedia.streams.some(s => s.codec_type === 'video'));
  console.log(`PASS: live YouTube MP3 conversion (${audio.total} bytes)`);
} finally { await manager.close(); await rm(dir, { recursive: true, force: true }); }
