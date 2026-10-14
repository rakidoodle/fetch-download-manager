import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { mkdtemp, mkdir, readFile, rm } from 'node:fs/promises';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';
import { DownloadManager, youtubeOptions } from '../server/manager.js';

// These adapter tests use real yt-dlp and FFmpeg with locally generated media.
// Public API validation still accepts only YouTube hosts; it is tested separately.
let manager, server, directory, base;
function command(binary, args) {
  const result = spawnSync(binary, args, { encoding: 'utf8', timeout: 30000 });
  assert.equal(result.status, 0, `${binary}: ${result.stderr || result.error?.message}`);
  return result.stdout;
}
async function finished(job) {
  const end = Date.now() + 20000;
  while (Date.now() < end && !['completed', 'error'].includes(job.status)) await new Promise(r => setTimeout(r, 50));
  assert.ok(['completed', 'error'].includes(job.status), 'Media adapter timed out.');
}
async function download(options, source = 'video.mp4') {
  const job = { id: randomUUID(), type: 'youtube', source: `${base}/${source}`, ...youtubeOptions(options), name: 'Local synthetic media', status: 'queued', created: Date.now(), total: 0, completed: 0, speed: 0, files: [], segments: [], connections: 0, error: null };
  await mkdir(path.join(manager.downloadDir, job.id), { recursive: true });
  manager.jobs.unshift(job); await manager.run(() => manager.start(job)); await finished(job); return job;
}
before(async () => {
  directory = await mkdtemp(path.join(os.tmpdir(), 'fetch-media-test-'));
  const mp4 = path.join(directory, 'video.mp4'); const webm = path.join(directory, 'video.webm');
  command('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-f', 'lavfi', '-i', 'testsrc2=size=320x180:rate=12', '-f', 'lavfi', '-i', 'sine=frequency=440:sample_rate=44100', '-t', '1.5', '-c:v', 'libx264', '-preset', 'ultrafast', '-c:a', 'aac', '-shortest', mp4]);
  command('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-i', mp4, '-c:v', 'libvpx-vp9', '-c:a', 'libopus', webm]);
  const media = new Map([['/video.mp4', await readFile(mp4)], ['/video.webm', await readFile(webm)]]);
  server = http.createServer((req, res) => {
    const file = media.get(req.url); if (!file) { res.writeHead(404); res.end(); return; }
    res.writeHead(200, { 'Content-Type': req.url.endsWith('.mp4') ? 'video/mp4' : 'video/webm', 'Content-Length': file.length });
    res.end(req.method === 'HEAD' ? undefined : file);
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve)); base = `http://127.0.0.1:${server.address().port}`;
  manager = await new DownloadManager({ dataDir: path.join(directory, 'state'), downloadDir: path.join(directory, 'downloads'), pollMs: 100 }).init();
});
after(async () => { await manager?.close(); if (server) await new Promise(r => { server.closeAllConnections(); server.close(r); }); if (directory) await rm(directory, { recursive: true, force: true }); });

for (const format of ['mp4', 'webm', 'mkv']) test(`Real media engine produces ${format.toUpperCase()} video with audio`, async () => {
  const job = await download({ mode: 'video', resolution: 'best', format }, format === 'webm' ? 'video.webm' : 'video.mp4');
  assert.equal(job.status, 'completed', job.error); assert.equal(path.extname(job.files[0].path), `.${format}`);
  const output = JSON.parse(command('ffprobe', ['-v', 'quiet', '-show_streams', '-of', 'json', job.files[0].path]));
  assert.ok(output.streams.some(s => s.codec_type === 'video')); assert.ok(output.streams.some(s => s.codec_type === 'audio'));
});
for (const [format, codec] of [['mp3', 'mp3'], ['m4a', 'aac'], ['flac', 'flac'], ['wav', 'pcm_s16le'], ['opus', 'opus']]) test(`Real media engine produces ${format.toUpperCase()} audio without video`, async () => {
  const job = await download({ mode: 'audio', format });
  assert.equal(job.status, 'completed', job.error); assert.equal(path.extname(job.files[0].path), `.${format}`);
  const output = JSON.parse(command('ffprobe', ['-v', 'quiet', '-show_streams', '-of', 'json', job.files[0].path]));
  assert.ok(output.streams.some(s => s.codec_name === codec)); assert.ok(!output.streams.some(s => s.codec_type === 'video'));
});
test('Media engine reports a missing source as a failure rather than a completed file', async () => {
  const job = await download({ mode: 'video' }, 'missing.mp4'); assert.equal(job.status, 'error'); assert.match(job.error, /404|Not Found/); assert.equal(job.files.length, 0);
});
