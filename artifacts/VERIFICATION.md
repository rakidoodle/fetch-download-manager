# Fetch verification — 14 October 2026

This report records the local verification run before the source was uploaded to GitHub. The reviewed app used http://localhost:4317. No public web service was deployed.

- TypeScript check and production Vite build: passed.
- Backend integration tests: 15 passed, 0 failed.
- Production browser tests: 9 passed, 0 failed.
- Live YouTube tests: real 720p video with audio, pause/resume, and MP3 conversion passed. FFprobe confirmed the expected streams.
- Production dependency audit: 0 known vulnerabilities reported by npm.
- Final local production preview: HTTP 200, no browser page errors, no mobile horizontal overflow.

Verified transfer integrity using byte-for-byte comparisons. Torrent and magnet tests use actual TCP peer transfers and metadata exchange, not simulated progress.

Fixed failures discovered during testing: invalid aria2 listen port, completed torrent registration preventing repeat downloads, file serving from hidden download folders, rapid-paste submission race, and whole-process-group signaling for media subprocesses.

Review images: `fetch-desktop.png` and `fetch-mobile.png`.

No known failures remain in the tested flows. Verification does not guarantee zero bugs across all remote servers, video restrictions, torrent swarms, or future engine changes. Parallel speed improvements depend on server byte-range support, server limits, and available bandwidth.

Run `npm run check` to repeat local automated checks. Run `npm run test:live` to repeat live YouTube checks (network required).
