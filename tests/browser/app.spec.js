import { test, expect } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import { createFixture } from '../fixture.js';
let fixture;
async function api(request, url, body, method = 'POST') { const { key } = await (await request.get('/api/state')).json(); const result = await request.fetch(url, { method, headers: { 'X-Fetch-Key': key }, data: body }); expect(result.ok()).toBeTruthy(); return result; }
async function clean(request) { const { jobs } = await (await request.get('/api/state')).json(); for (const job of jobs) { if (!['completed', 'canceled'].includes(job.status)) await api(request, `/api/downloads/${job.id}/cancel`, {}); await api(request, `/api/downloads/${job.id}/remove`, {}); } }
test.beforeAll(async () => { fixture = await createFixture({ length: 8 * 1024 * 1024, delay: 35 }); });
test.afterAll(async () => { await fixture.close(); });
test.beforeEach(async ({ page, request }) => { await clean(request); await api(request, '/api/settings', { connections: 8, maxActive: 3, speedLimit: 0 }, 'PUT'); await page.goto('/'); await expect(page.getByRole('button', { name: 'New download' })).toBeEnabled(); });
test.afterEach(async ({ request }) => { await clean(request); });

test('Dashboard loads without browser errors; dialogs trap focus and close with Escape', async ({ page }) => {
  const errors = []; page.on('pageerror', e => errors.push(e.message));
  await expect(page.getByRole('heading', { name: 'Your next download starts here' })).toBeVisible();
  await page.getByRole('button', { name: 'New download' }).click(); await expect(page.getByRole('dialog')).toBeVisible();
  await page.getByRole('button', { name: 'Start download' }).focus(); await page.keyboard.press('Tab'); await expect(page.getByRole('button', { name: 'Close dialog' })).toBeFocused();
  await page.keyboard.press('Escape'); await expect(page.getByRole('dialog')).toHaveCount(0); await expect(page.getByRole('button', { name: 'New download' })).toBeFocused(); expect(errors).toEqual([]);
});
test('Quick paste downloads a file and browser save preserves exact bytes', async ({ page }) => {
  await page.getByLabel('Paste download link').fill(`${fixture.base}/file.bin`); await page.getByRole('button', { name: 'Add to queue' }).click();
  const row = page.locator('.download-row'); await expect(row).toHaveCount(1); await expect(row.locator('.status-label')).toHaveText('Completed', { timeout: 20000 });
  const downloadPromise = page.waitForEvent('download'); await row.getByRole('link', { name: /Save fixture/ }).click(); const download = await downloadPromise; expect(await download.failure()).toBeNull(); expect(await readFile(await download.path())).toEqual(fixture.data);
  await row.getByRole('button', { name: 'fixture.bin', exact: true }).click(); await expect(page.getByRole('dialog')).toBeVisible(); await expect(page.getByText('Verified pieces', { exact: true })).toBeVisible(); await expect(page.getByRole('link', { name: 'fixture.bin', exact: true })).toBeVisible();
});
test('Queue, pause, resume, cancel, retry, and remove work through UI', async ({ page, request }) => {
  await api(request, '/api/settings', { connections: 1, maxActive: 1, speedLimit: 0 }, 'PUT');
  await page.getByLabel('Paste download link').fill(`${fixture.base}/file.bin`); await page.getByRole('button', { name: 'Add to queue' }).click();
  const firstState = await (await request.get('/api/state')).json(); const first = firstState.jobs[0].id;
  await page.getByLabel('Paste download link').fill(`${fixture.base}/file.bin`); await page.getByRole('button', { name: 'Add to queue' }).click();
  await expect(page.locator('.download-row .status-label').filter({ hasText: 'Queued' })).toHaveCount(1);
  const rows = page.locator('.download-row'); await rows.nth(1).getByRole('button', { name: /^Pause/ }).click(); await expect(rows.nth(1).locator('.status-label')).toHaveText('Paused');
  await rows.nth(1).getByRole('button', { name: /^Resume/ }).click(); await expect(rows.nth(1).locator('.status-label')).toHaveText('Queued');
  await rows.nth(1).getByRole('button', { name: /^Cancel/ }).click(); await expect(rows.nth(1).locator('.status-label')).toHaveText('Canceled');
  await rows.nth(1).getByRole('button', { name: /^Retry/ }).click(); await expect(rows.nth(1).locator('.status-label')).toHaveText('Queued');
  await rows.nth(1).getByRole('button', { name: /^Cancel/ }).click(); await rows.nth(1).getByRole('button', { name: /^Remove/ }).click(); await expect(rows).toHaveCount(1);
  const state = await (await request.get('/api/state')).json(); expect(state.jobs.some(j => j.id === first)).toBeFalsy();
});
test('Invalid links and server failures show useful errors', async ({ page }) => {
  await page.getByLabel('Paste download link').fill('not-a-link'); await page.getByRole('button', { name: 'Add to queue' }).click(); await expect(page.getByRole('alert')).toContainText('valid URL'); await expect(page.locator('.download-row')).toHaveCount(0);
  await page.getByLabel('Paste download link').fill(`${fixture.base}/missing`); await page.getByRole('button', { name: 'Add to queue' }).click(); const row = page.locator('.download-row'); await expect(row.locator('.status-label')).toHaveText('Failed'); await expect(row.getByRole('button', { name: /^Retry/ })).toBeVisible();
  await row.getByRole('button', { name: 'missing', exact: true }).click(); await expect(page.getByRole('dialog').getByRole('alert')).toContainText('Resource not found');
});
test('YouTube dialog enforces YouTube host and offers real quality options', async ({ page }) => {
  await page.getByRole('button', { name: 'YouTube videos', exact: true }).click(); await page.getByRole('button', { name: 'New download' }).click();
  await expect(page.getByLabel('Resolution', { exact: true })).toBeVisible(); await page.getByLabel('Resolution', { exact: true }).selectOption('2160'); await page.getByLabel('Format', { exact: true }).selectOption('webm'); await page.getByRole('button', { name: 'Audio only', exact: true }).click(); await expect(page.getByLabel('Resolution', { exact: true })).toBeDisabled(); await page.getByLabel('Format', { exact: true }).selectOption('flac'); await page.getByLabel('YouTube video URL').fill('https://example.com/video'); await page.getByRole('button', { name: 'Start download' }).click(); await expect(page.getByRole('dialog').getByRole('alert')).toContainText('YouTube video URL');
});
test('Torrent file upload completes through real peer transfer', async ({ page }) => {
  await page.getByRole('button', { name: 'Torrents', exact: true }).click(); await page.getByRole('button', { name: 'New download' }).click();
  await page.getByLabel('Upload torrent file').setInputFiles({ name: 'fixture.torrent', mimeType: 'application/x-bittorrent', buffer: Buffer.from(fixture.torrent, 'base64') }); await expect(page.getByText('fixture.torrent', { exact: true })).toBeVisible(); await page.getByRole('button', { name: 'Start download' }).click();
  await expect(page.locator('.download-row .status-label')).toHaveText('Completed', { timeout: 20000 }); expect(fixture.stats.peerBytes).toBeGreaterThan(0);
});
test('Magnet auto-detection resolves metadata and completes in UI', async ({ page }) => {
  await page.getByLabel('Paste download link').fill(fixture.magnet); await page.getByRole('button', { name: 'Add to queue' }).click();
  await expect(page.locator('.download-row .status-label')).toHaveText('Completed', { timeout: 20000 }); await expect(page.locator('.download-meta')).toContainText('Torrent');
});
test('Search, source navigation, filters, sorting, and history removal stay consistent', async ({ page, request }) => {
  await api(request, '/api/downloads', { type: 'web', source: `${fixture.base}/tiny` }); await api(request, '/api/downloads', { type: 'web', source: `${fixture.base}/missing` });
  await expect(page.locator('.download-row')).toHaveCount(2); await expect(page.locator('.download-row .status-label').filter({ hasText: 'Completed' })).toHaveCount(1);
  await page.getByLabel('Search downloads').fill('missing'); await expect(page.locator('.download-row')).toHaveCount(1); await page.getByLabel('Search downloads').fill('');
  await page.getByLabel('Sort downloads').selectOption('name'); await expect(page.locator('.download-name').first()).toHaveText('fixture.bin');
  await page.getByRole('group', { name: 'Filter downloads' }).getByRole('button', { name: 'Failed' }).click(); await expect(page.locator('.download-row')).toHaveCount(1);
  await page.getByRole('button', { name: 'Completed', exact: true }).first().click(); await expect(page.locator('.download-row')).toHaveCount(1); await expect(page.locator('.download-row .status-label')).toHaveText('Completed');
  await page.locator('.download-row').getByRole('button', { name: /^Remove/ }).click(); await expect(page.locator('.download-row')).toHaveCount(0);
});
test('Settings persist after reload; mobile view has named controls and no horizontal overflow', async ({ page }) => {
  await page.getByRole('button', { name: 'Settings', exact: true }).click(); await page.getByLabel('Connections per file').fill('12'); await page.getByLabel('Simultaneous downloads').selectOption('2'); await page.getByLabel('Web & torrent speed limit').fill('256'); await page.getByRole('button', { name: 'Save settings' }).click(); await page.reload(); await page.getByRole('button', { name: 'Settings', exact: true }).click(); await expect(page.getByLabel('Connections per file')).toHaveValue('12'); await expect(page.getByLabel('Simultaneous downloads')).toHaveValue('2'); await page.keyboard.press('Escape');
  for (const width of [390, 768, 1440]) { await page.setViewportSize({ width, height: 900 }); expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBeTruthy(); await expect(page.getByRole('button', { name: 'Torrents', exact: true })).toBeVisible(); }
  await page.setViewportSize({ width: 390, height: 844 }); await page.getByRole('button', { name: 'New download' }).click(); await expect(page.getByRole('dialog')).toBeVisible(); expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBeTruthy();
});


test('Dark theme defaults correctly, light choice persists, and PayPal links use the confirmed destination', async ({ page }) => {
  await expect(page.locator('html')).toHaveAttribute('data-theme','dark');
  for (const link of await page.getByRole('link', {name:'Feed my Baby'}).all()) { await expect(link).toHaveAttribute('href','https://www.paypal.com/paypalme/ruffytrinidad'); await expect(link).toHaveAttribute('rel','noopener noreferrer'); }
  await page.getByRole('button',{name:'Switch to light mode'}).click(); await expect(page.locator('html')).toHaveAttribute('data-theme','light'); await page.reload(); await expect(page.locator('html')).toHaveAttribute('data-theme','light'); await page.getByRole('button',{name:'Switch to dark mode'}).click();
});
test('Quick YouTube paste opens options and submits independent resolution/format choices', async ({ page }) => {
  let payload;
  await page.route('**/api/downloads', route => { payload=route.request().postDataJSON(); return route.fulfill({status:201,contentType:'application/json',body:JSON.stringify({id:'form-payload-test'})}); });
  await page.getByLabel('Paste download link').fill('https://youtu.be/YE7VzlLtp-4'); await page.getByRole('button',{name:'Add to queue'}).click();
  await expect(page.getByRole('dialog')).toBeVisible(); await expect(page.getByLabel('YouTube video URL')).toHaveValue('https://youtu.be/YE7VzlLtp-4');
  await page.getByLabel('Resolution',{exact:true}).selectOption('1440'); await page.getByLabel('Format',{exact:true}).selectOption('mkv'); await page.getByRole('button',{name:'Start download'}).click(); await expect(page.getByRole('dialog')).toHaveCount(0);
  expect(payload).toMatchObject({type:'youtube',mode:'video',resolution:'1440',format:'mkv'});
});
test('Artwork is keyboard interactive and respects reduced motion', async ({ page }) => {
  const artwork=page.getByRole('button',{name:'Rotate download sculpture'});
  await artwork.focus(); await page.keyboard.press('ArrowRight'); await expect(artwork).toHaveAttribute('style', /--tilt-y: 8deg/);
  await page.emulateMedia({reducedMotion:'reduce'}); await expect(artwork).toBeDisabled();
  expect(await page.locator('.artwork-stage img').evaluate(el=>getComputedStyle(el).transform)).toBe('none');
  await page.getByRole('button',{name:'New download'}).click(); expect(await page.getByRole('dialog').evaluate(el=>getComputedStyle(el).animationName)).toBe('none');
});
