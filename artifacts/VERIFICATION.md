# Fetch verification — 14 October 2026

This report records local testing of the dark interface redesign and expanded YouTube controls. The app runs at http://localhost:4317. The private GitHub repository stores its source; no public web download service is deployed.

- TypeScript check and production build: passed.
- Backend/adapter tests: 25 passed, including 9 real yt-dlp/FFmpeg media-format checks.
- Production browser tests: 12 checks cover download flows, theme persistence, the PayPal destination, YouTube options, and interactive/reduced-motion artwork.
- Live YouTube checks: 720p video with audio, pause/resume, and MP3 output passed; ffprobe inspected the streams.
- Range and torrent transfers compare complete bytes with the source; torrent and magnet tests use a real local TCP peer/tracker and metadata exchange.

MP4, WebM, and MKV video plus MP3, M4A, FLAC, WAV, and Opus audio were verified using real engines and local synthetic clips. YouTube's own availability and restrictions still determine what can be retrieved remotely.

The visual review covers dark desktop, 375px mobile, the 718px review viewport, landscape, light mode, and the YouTube sheet. The independent finish reviewer scored the listed visual fixes and the final mobile overlap as resolved, with disposition ship at that scope. Built design tokens and motion decisions are recorded in DESIGN.md.

Past fixes retained: aria2 startup port validation, releasing completed torrent registrations, serving owned files from hidden test folders, rapid-paste submission handling, and group signaling for media subprocesses. Redesign fixes include unambiguous quick-start labels, unavailable-state consistency, mobile headline/copy spacing, and larger transfer action targets.

Run npm run check for local tests; npm run test:live for separate network-dependent YouTube checks. No claim of zero bugs across all sources or future engine updates is made.
