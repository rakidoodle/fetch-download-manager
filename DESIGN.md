---
name: "Fetch"
description: "A precise local workspace for files, videos, and torrents."
colors:
  ground: "#101113"
  surface: "#1c1d21"
  surface-raised: "#25262b"
  surface-inset: "#151619"
  text: "#f5f5f7"
  secondary: "#acadb5"
  muted: "#a0a1aa"
  rule: "#34353c"
  rule-soft: "#2b2c32"
  action: "#80b9ff"
  action-ink: "#101e30"
  success: "#83d6b0"
  success-surface: "#203c30"
  warning: "#ebcb91"
  warning-surface: "#423725"
  danger: "#ffa69d"
  danger-surface: "#462b2c"
  video: "#f0b6c9"
  video-surface: "#3c2b33"
  torrent: "#c0b7f5"
  torrent-surface: "#332f46"
  brand-ink: "#18191c"
  scrim: "rgba(0, 0, 0, .64)"
  light-ground: "#f6f6f8"
  light-surface: "#ffffff"
  light-surface-raised: "#ededf1"
  light-surface-inset: "#f1f1f4"
  light-text: "#1d1d21"
  light-secondary: "#595964"
  light-muted: "#656571"
  light-rule: "#c5c5cf"
  light-rule-soft: "#ddddE3"
  light-action: "#185caf"
  light-action-ink: "#ffffff"
  light-success: "#28664e"
  light-success-surface: "#e6f2ec"
  light-warning: "#795921"
  light-warning-surface: "#f3ead9"
  light-danger: "#a2342d"
  light-danger-surface: "#f8e9e8"
  light-video: "#974761"
  light-video-surface: "#f7e9ee"
  light-torrent: "#66539e"
  light-torrent-surface: "#eeebf6"
  light-brand-ink: "#ffffff"
  light-scrim: "rgba(22, 24, 29, .42)"
typography:
  display:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', sans-serif"
    fontSize: "52px"
    fontWeight: 650
    lineHeight: 1.08
    letterSpacing: "-.035em"
  headline:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', sans-serif"
    fontSize: "22px"
    fontWeight: 550
    letterSpacing: "-.025em"
  title:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', sans-serif"
    fontSize: "16px"
    fontWeight: 550
    letterSpacing: "-.02em"
  body:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', sans-serif"
    fontSize: "13px"
    fontWeight: 500
  metadata:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', sans-serif"
    fontSize: "11px"
    fontWeight: 400
rounded:
  badge: "5px"
  small: "8px"
  field: "9px"
  control: "10px"
  notice: "12px"
  entry: "14px"
  panel: "16px"
  mobile-sheet: "18px"
  sheet: "20px"
spacing:
  "4": "4px"
  "8": "8px"
  "10": "10px"
  "12": "12px"
  "16": "16px"
  "20": "20px"
  "24": "24px"
  "28": "28px"
  "32": "32px"
components:
  button-primary:
    backgroundColor: "{colors.action}"
    textColor: "{colors.action-ink}"
    rounded: "{rounded.control}"
    padding: "11px 20px"
    height: "44px"
  button-secondary:
    textColor: "{colors.text}"
    rounded: "{rounded.small}"
    padding: "10px 15px"
    height: "40px"
  button-icon:
    textColor: "{colors.secondary}"
    rounded: "{rounded.control}"
    height: "44px"
    width: "44px"
  input:
    backgroundColor: "{colors.surface-inset}"
    textColor: "{colors.text}"
    rounded: "{rounded.field}"
    padding: "12px"
    height: "46px"
  navigation-item:
    textColor: "{colors.secondary}"
    rounded: "{rounded.field}"
    padding: "10px 12px"
    height: "42px"
  navigation-item-active:
    backgroundColor: "{colors.surface-raised}"
    textColor: "{colors.text}"
    rounded: "{rounded.field}"
    padding: "10px 12px"
    height: "42px"
  status-completed:
    backgroundColor: "{colors.success-surface}"
    textColor: "{colors.success}"
    rounded: "{rounded.badge}"
    padding: "3px 6px"
  download-panel:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.panel}"
  segmented-control:
    backgroundColor: "{colors.surface-inset}"
    rounded: "{rounded.control}"
    padding: "4px"
  brand-mark:
    textColor: "{colors.text}"
    size: "34px"
  modal:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.sheet}"
    width: "540px"
---

# Design System: Fetch

## Overview

**Creative North Star: "The Precise Local Workspace"**

Fetch uses the user's chosen Apple website craft: graphite surfaces, silver type, a native sans, generous separation between tasks, and softly rounded controls. Dark mode is the default; the light theme preserves the same hierarchy through a complete paired palette. Apple is a craft reference, with Fetch's own identity and no affiliation claim.

The visual hierarchy gives adding and controlling downloads priority. Tonal layers distinguish the working library, fields, and sheets; color describes actions, source families, and real transfer states. Motion responds briefly to input and is disabled under reduced motion. The user-pinned native-font choice is scoped to this Apple-inspired Operate redesign.

**Key Characteristics:**
- Graphite and silver foundations with an action-blue accent.
- One native sans family, with a large display and compact operational metadata.
- Tonal surfaces, restrained dividers, and rounded controls.
- Input-driven artwork and brief, optional motion.
- Original Fetch SVG identity and locally served generated sculpture.

## Colors

The palette pairs cool graphite or pale neutral surfaces with clear operational accents. The frontmatter records the dark palette under the source token names and the complete alternate palette under `light-` names; CSS uses the same semantic custom properties in both themes.

### Primary

- **Action blue:** primary creation controls, actionable text, selection, progress, caret, and focus. The paired action ink keeps filled controls readable.

### Secondary

- **Mint with its inset surface:** completed progress, healthy engine indicators, and successful notifications.
- **Amber with its inset surface:** downloading and processing labels.
- **Coral with its inset surface:** errors, disconnected states, and validation.

### Tertiary

- **Soft pink with its inset surface:** YouTube source icons and the support heart.
- **Lavender with its inset surface:** torrent source icons and paused transfer states.

### Neutral

- **Ground:** page background.
- **Surface:** main library, quick entry, and dialog material.
- **Raised surface:** selected navigation, small controls, and notifications.
- **Inset surface:** form fields, counts, grouped options, and file links.
- **Text / secondary / muted:** primary reading, explanations, and compact metadata respectively.
- **Rule / soft rule:** field boundaries and group separators respectively.
- **Brand ink:** contrast inside the authored mark; it changes with the theme.
- **Scrim:** modal isolation over the workspace.

**The The State Color Rule.** Use action blue for actionable controls and focus. Reserve mint, amber, coral, pink, and lavender for their observed status or source roles; preserve those roles in both themes.

## Typography

**Display Font:** native `-apple-system`, `BlinkMacSystemFont`, `SF Pro Display`, `Segoe UI`, sans-serif stack.
**Body Font:** the same stack. No downloaded font is required.

The system uses a closely tracked display with quieter, compact operational text. The CSS names SF Pro Display as a fallback; rendering depends on fonts available on the user's operating system. It does not bundle or guarantee that face.

### Hierarchy

- **Display:** workspace headline. The base role is recorded above; actual responsive sizes are 60px at ≥1500px, 45px at ≤1080px, 40px at ≤840px, 32px at ≤600px, and 28px at ≤370px. Mobile line height becomes 1.1.
- **Headline:** sheet headings; mobile size is 21px.
- **Title:** library and empty-state headings; mobile size is 15px.
- **Body:** hero explanation; responsive sizes are 14px at ≤840px and 13px at ≤600px. Dialog explanations use 13px with more open leading.
- **Label:** field names and secondary headings. Primary button text uses 14px/600; source navigation uses 12px/500 on desktop.
- **Metadata:** most auxiliary reading uses 11px, with row metadata, counters, and footer notes stepping to 10px or 9px where observed. Transfer numerals use tabular figures.

**The The Native Craft Rule.** Retain the user's chosen native sans stack for this Apple-inspired Operate system. Use size, weight, and tracking to establish hierarchy within that single family.

## Layout

The centered workspace and header share a maximum width of 1240px and 40px side padding. At ≥1500px the container expands to 1380px with 56px padding. Padding contracts to 28px at ≤1080px, 20px at ≤600px, and 16px at ≤370px.

The desktop library uses a flexible main column beside a 244px activity/support column with a 28px gap. That secondary column narrows at ≤1080px; at ≤840px the library becomes one column and activity/support move beneath it. The compact overview becomes two columns at ≤600px. Mobile source navigation uses three equal columns across two rows.

The current hero places the sculpture beside the headline on desktop. On mobile, the headline has the full width; the sculpture sits beside the subsequent explanatory copy and actions. Optional line breaks retain word spacing when hidden. This is the current surface composition, not a reusable requirement for every screen.

Use the extracted spacing steps to separate groups. Sheets have a 540px width with viewport-bounded height and scrolling; their backdrop inset contracts from 24px to 12px on mobile. File names truncate in rows, while source paths and detail values wrap when needed.

## Elevation & Depth

The working page relies on tonal layering and light separators. Sheets and toasts share one diffuse shadow, with a lighter alternate shadow for light mode. The modal scrim adds an 8px backdrop blur. The generated silver sculpture provides the visible object depth; its tilt is user-driven.

### Shadow Vocabulary

- **Floating surface:** `0 24px 80px rgba(0, 0, 0, .34)` in dark mode; `0 24px 80px rgba(26, 27, 36, .18)` in light mode. Applied to dialogs and toasts.

**The The Tonal Depth Rule.** Keep working surfaces free of decorative elevation. Apply the shared diffuse shadow to floating sheets and notifications.

## Shapes

Small badges use tighter corners; ordinary controls are softly rounded; library panels and sheets have larger radii. The frontmatter records the reused corner vocabulary. Mobile library and sheet corners contract to the observed entry and mobile-sheet values. Fields and supporting groups use thin boundaries where needed; the main library uses its material rather than an enclosing outline.

The authored Fetch SVG mark is a rounded-square tile with a download arrow and tray. Interface icons are Lucide SVGs, usually with a 1.7 stroke width, rather than text glyphs. Status dots and the narrow progress track remain compact functional indicators.

## Components

### Buttons

Filled action-blue primary controls use contrasting action ink; outlined secondary controls keep the current text color; icon controls use secondary text and a raised hover material. Primary hover applies brightness(1.08). Buttons and links press to scale(.98), with disabled opacity(.5). The shared visible focus is a 2px action outline with 4px offset. Mobile hero actions stack vertically and align to the left. Mobile secondary, navigation, source, segmented, and job controls provide the observed 44px minimum heights; mobile job controls and detail actions are 44px square.

### Inputs / Fields

The quick entry combines a source icon, transparent input, and inset submit control inside a bordered surface. Focus changes its boundary to action blue; validation uses coral. Dialog inputs and selects use inset material, the field radius, and a 46px minimum height. Their focus outline has 2px offset. Mobile text-entry and general select text rises to 16px; the paired YouTube option selects remain 14px.

### Navigation

Source navigation uses rounded text-and-icon controls with an inset count badge. Raised material and primary text identify the active source. File-status filters use text tabs with an action-colored selected underline. The mobile source grid hides decorative source icons while preserving labels and counts.

### Chips

Transfer labels pair a semantic foreground and tonal background with status text. Downloading/processing can include a dot. Color supplements the label; it does not replace it.

### Cards / Containers

The file library is one rounded surface containing its heading, tools, filter strip, rows, and footer. Rows use separators rather than independent floating cards. The activity and support areas remain quieter. Sheets use a larger rounded surface over a blurred scrim, with structured headings, forms, and footers.

### Output controls

YouTube video/audio choice uses an inset segmented control with a raised selected option. Resolution and format are independent, side-by-side fields. Audio keeps resolution visibly disabled. A subdued output preview combines source icon, output description, and format badge.

### Motion and interaction

Press motion lasts 120ms, color/background/opacity state changes 180ms, and sheet entry 280ms. Spatial transitions use `cubic-bezier(.16, 1, .3, 1)`. Sheets enter from translateY(14px) scale(.975); toasts enter over 240ms from a 12px vertical offset. Progress updates interpolate for 350ms; sculpture rotation interpolates for 450ms. The artwork supports pointer movement, click, and left/right keys, with no idle animation. Reduced motion removes transitions, animations, press transforms, and artwork tilt; the rotation button is disabled.

### Identity and image material

Keep the authored mark in `src/ui.tsx` and the SVG favicon referenced by `index.html`. The sculpture is a generated, locally served 900×900 WebP (`public/assets/fetch-sculpture.webp`, 88,554 bytes, approximately 86 KiB). It is an illustrative identity object, not transfer evidence. Desktop source shortcuts beneath it are explicitly labeled and disabled when creation is unavailable; mobile hides those shortcuts.

## Do's and Don'ts

### Do:
- Do use the paired dark and light semantic colors rather than applying dark literals to themeable controls.
- Do keep keyboard focus visible and present a text label with status colors.
- Do give mobile job actions and detail actions the observed 44px targets.
- Do use the authored Fetch mark and locally served sculpture, preserving their existing identity and provenance.
- Do preserve independent YouTube resolution and format controls and the disabled resolution state for audio.
- Do keep motion responsive to input and honor reduced motion.

### Don't:
- Don't substitute Apple's logo or imply an Apple affiliation.
- Don't invent download activity, transfer totals, or speed claims to fill empty space.
- Don't add continuous decorative animation to the sculpture.
- Don't replace labeled controls with glyph characters or icon-font substitutes.
- Don't promote a page-specific hero composition into a rule for every future screen.
