# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

A person managing downloads on their own computer. The current owner wants clear controls and explanations that are easy to scan.

## Product Purpose

Fetch brings direct HTTP/HTTPS file downloads, YouTube video/audio downloads, and BitTorrent transfers into one local workspace. Success means receiving correct files and being able to control, find, and resume the downloads.

## Operating Context

Existing React/TypeScript/Vite interface with an Express server. aria2 handles files and torrents; yt-dlp and FFmpeg handle YouTube media. The app runs on the user's computer at localhost. The private GitHub repository stores source code, not an online download service.

## Capabilities and Constraints

Web transfers support 1–16 parallel connections where byte ranges are available. Queue concurrency, pause/resume, cancellation/retry, history, search, filters, details, and file saving must remain functional. Torrent uploads, magnet links, and torrent URLs remain supported. Speed gains depend on the remote source and connection. User requested independent YouTube resolution and output format controls. No accounts, remote hosting, invented transfer data, or permanent disk deletion are part of this redesign.

## Brand Commitments

Name: Fetch. The user explicitly requests an Apple website feel, smooth interaction motion, new icon/favicon/artwork, and dark mode by default. Use Apple as a craft reference, not its logo or an affiliation claim. Support link label is exactly “Feed my Baby”; its user-confirmed destination is https://www.paypal.com/paypalme/ruffytrinidad.

## Evidence on Hand

Existing working implementation, screenshots in artifacts/, 15 backend and 9 browser tests, and recorded live YouTube/MP3 verification. No customer testimonials, benchmark speed claims, or sample downloads should be invented.

## Product Principles

- Put adding and controlling downloads before decoration.
- Show actual progress and recoverable errors.
- Preserve local storage and existing transfer controls.
- Make motion optional and keyboard interaction complete.
