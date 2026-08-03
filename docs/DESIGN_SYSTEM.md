# Malume Photography - Design System

## Philosophy

The photography is the hero. The interface is the frame.

The product should create structure, confidence, and rhythm without competing with the work. Warmth comes from the photographs, the paper palette, and the ink palette. Color is reserved for meaning.

## Color System

Primary accent: `#0077B5` (Classic LinkedIn Blue) - interactive elements only.

WhatsApp: `#25D366` - WhatsApp CTA only, kept because it is a universally understood service convention.

Paper surfaces: `#FAF8F5` default, `#F4F0EA` warm, `#E7E0D7` deep/borders.

Ink surfaces: `#171514` rich, `#24201E` studio, `#3A3430` warm.

Text hierarchy: `#1A1A1A` primary, `#4D4742` secondary, `#7A716A` muted, `#FAF8F5` inverse.

## What Is Not In The Color System

No brass. No gold. No warm amber. No additional accent colors.

Brass was removed because it was solving a warmth problem that the photography and paper palette already solve. Having three accent colors created ambiguity. Users could not interpret what gold meant.

The two-color interaction system is now unambiguous: blue means interactive, green means WhatsApp.

## Typography

Display: Cormorant Garamond - headings, section titles, portfolio titles, and editorial moments.

Body/UI: Inter - body copy, buttons, labels, inputs, navigation, and admin UI.

Small section labels should stay restrained: `text-xs` or `text-[0.75rem]`, uppercase, `tracking-widest`, and neutral text color. The hierarchy comes from spacing, case, and rhythm rather than decorative color.

## Interaction Principles

Every interactive element should have:

- Default state
- Hover state through color, underline, surface, or subtle transform
- Focus-visible state using `ring-2 ring-accent ring-offset-2`
- Active state using `scale-[0.97]`, slight translation, or brightness reduction
- Disabled state using `opacity-50` and `cursor-not-allowed`

Hover transitions should stay between 150ms and 300ms with an ease-out feel.

Danger actions use red focus rings, not accent rings.

## Motion Principles

Motion is earned, not decorative.

All animations respect `prefers-reduced-motion`.

Entrance animations stay under 700ms. Hover transitions stay between 150ms and 300ms. Page transitions are intentionally quiet at roughly 200ms.

The homepage marquee is intentionally slower and cinematic because it is content motion, not UI feedback.

## What Changed And Why

Brass accent was removed from Tailwind tokens, CSS variables, site config, and component usage.

Editorial labels, captions, stat descriptors, admin labels, and form labels now use semantic neutral text tiers. Interactive states continue to use blue.

The result is a clearer design system where the photography carries warmth and the interface signals only structure or interactivity.
