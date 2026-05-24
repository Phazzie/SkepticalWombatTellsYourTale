---
version: alpha
name: Skeptical Wombat Tells Your Tale
description: A luminous, voice-first design system for AI-powered memoir and storytelling
colors:
  primary: "#FFFFFF"
  secondary: "#000000"
  neon-lime: "#CCFF00"
  neon-purple: "#B020F5"
  neon-pink: "#FF0099"
  neutral-dark: "#0A0E27"
  neutral-medium: "#1A1F3A"
  neutral-light: "#E8E9F3"
  background: "#0A0E27"
typography:
  h1:
    fontFamily: system-ui, -apple-system, sans-serif
    fontSize: 52px
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: -0.02em
  h2:
    fontFamily: system-ui, -apple-system, sans-serif
    fontSize: 40px
    fontWeight: 600
    lineHeight: 1.2
  h3:
    fontFamily: system-ui, -apple-system, sans-serif
    fontSize: 28px
    fontWeight: 600
    lineHeight: 1.3
  body-lg:
    fontFamily: -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif
    fontSize: 18px
    fontWeight: 400
    lineHeight: 1.6
  body-md:
    fontFamily: -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: system-ui, -apple-system, sans-serif
    fontSize: 12px
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: 0.05em
rounded:
  sm: 4px
  md: 8px
  lg: 12px
  full: 9999px
spacing:
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  gutter: 20px
components:
  button-primary-lime:
    backgroundColor: "{colors.neon-lime}"
    textColor: "{colors.secondary}"
    rounded: "{rounded.md}"
    padding: "12px 24px"
  button-primary-purple:
    backgroundColor: "{colors.neon-purple}"
    textColor: "{colors.primary}"
    rounded: "{rounded.md}"
    padding: "12px 24px"
  button-primary-pink:
    backgroundColor: "{colors.neon-pink}"
    textColor: "{colors.secondary}"
    rounded: "{rounded.md}"
    padding: "12px 24px"
  card:
    backgroundColor: "{colors.neutral-medium}"
    rounded: "{rounded.lg}"
    padding: "20px"
    borderColor: "rgba(204, 255, 0, 0.35)"
  input:
    backgroundColor: "{colors.neutral-dark}"
    borderColor: "rgba(204, 255, 0, 0.35)"
    textColor: "{colors.primary}"
    rounded: "{rounded.md}"
    padding: "12px 16px"
---

## Overview

Skeptical Wombat Tells Your Tale is a voice-first memoir and storytelling platform that celebrates authentic human narrative. The design is contemporary, energetic, and deeply intentional. Neon accents against a dark, immersive background create an intimate, late-night writing space. The interface recedes; your voice is center stage.

The target audience is memoir writers, storytellers, and people processing their own narratives through voice and conversation. The emotional response should be: safe, seen, energized, and uncompromised.

## Colors

A striking neon-on-dark color scheme that feels contemporary, focused, and intimate.

- **Primary (#FFFFFF):** Clean white for primary text and clarity. The "paper" on which your story lives.
- **Secondary (#000000):** Pure black for supporting UI elements and negative space.
- **Neon Lime (#CCFF00):** Bright, electric acid lime. Primary accent for recordings, playback, and moments of energy. High luminosity makes it pop against dark backgrounds.
- **Neon Purple (#B020F5):** Vivid purple for secondary actions and interactive states. Creates visual rhythm and emotional warmth.
- **Neon Pink (#FF0099):** Hot pink for tertiary actions and emotional highlights. Draws the eye while maintaining sophistication.
- **Neutral Dark (#0A0E27):** Deep navy-black background that feels like a private room, not a public interface.
- **Neutral Medium (#1A1F3A):** Slightly lighter for cards and content blocks, creating depth without harshness.
- **Neutral Light (#E8E9F3):** Very light purple-tinted white for high-contrast secondary text.
- **Background (#0A0E27):** Immersive dark foundation.

## Typography

Clean, modern sans-serif throughout. Headlines are bold and substantial; body text at 16–18px ensures comfortable reading for extended sessions. The neon accents create rhythm through color, not font weight variation.

- **Headlines:** Bold, strong system font for authority and presence.
- **Body:** Medium weight system font at 16px+ for sustained reading comfort.
- **UI Labels:** Slightly condensed with light tracking, maintaining legibility on dark backgrounds.

## Layout

Single-column mobile layout; flexible grid on desktop with max-width 1200px. Asymmetrical layouts feel natural and organic—mirroring the conversational, non-linear nature of storytelling. Generous gutters (20px) and breathing room create an open, safe space.

## Elevation & Depth

Depth achieved through color transparency and layered backgrounds rather than heavy shadows. Cards sit slightly above the background with a thin neon border (lime green at 35% opacity) that echoes the voice-recording metaphor. No harsh drop-shadows; instead, the neon creates visual separation.

## Shapes

Moderate rounding (8px on cards, 12px on larger elements) feels contemporary without being over-designed. Consistent rounding across components reinforces the interconnected system.

## Components

### Buttons
- **Record Button (Primary Lime)**: Neon lime background with dark text. Used for "Record Session," "Playback." High visibility for critical voice actions.
- **Action Button (Purple)**: Neon purple background, white text. Used for "Generate," "Analyze," secondary workflows.
- **Highlight Button (Pink)**: Neon pink background, dark text. Used for "Mark Important," "Flag," emotional actions.

### Cards
- Medium-dark background (#1A1F3A), 20px padding, 8px rounded corners, thin lime border at 35% opacity.
- Used for transcript blocks, session cards, and analysis results.

### Inputs & Recording Areas
- Very dark background (#0A0E27), lime border at 35% opacity, 8px rounding, 12px 16px padding.
- White placeholder text; focus state brightens the lime border to full opacity.

### Transcript Blocks
- Nested within cards with distinct visual separation. User voice in white; AI suggestions in neon accents.

## Do's and Don'ts

- **Do** use neon accents to energize key moments—recordings, playback, emotional highlights.
- **Don't** mix neon colors on the same interactive element; let each color own its domain.
- **Do** maintain high contrast (white on dark) for readability during extended writing/listening sessions.
- **Don't** use bright colors for error states; reserve them for positive, energetic moments.
- **Do** embrace the dark background as intimate and protected, not cold.
- **Don't** add skeuomorphic or decorative elements; the neon is visual enough.
- **Do** keep borders thin and subtle; let content breathe.
- **Don't** use heavy shadows; the dark background + neon is sufficient for depth.