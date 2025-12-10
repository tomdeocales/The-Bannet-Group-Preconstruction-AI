# Design System Style Guide

A reusable design system based on modern minimalism, warm aesthetics, and accessibility-first principles.

---

## Design Philosophy

**Modern Minimalism:** Clean, content-focused interfaces where every element serves a purpose.

**Warm & Approachable:** Slightly off-white and off-black tones reduce eye strain and create a comfortable reading experience.

**Accessible by Default:** WCAG AA compliant colors, clear focus states, and semantic HTML throughout.

**Key Characteristics:**
- Warm grays using OKLCH color space
- Sophisticated dark mode (never pure black)
- Base border radius: `0.625rem` (10px)
- Subtle shadows for elevation
- Responsive and mobile-first

---

## Typography

### Font Stack

**Primary (Sans-Serif):** General Sans (Variable)
- Usage: UI elements, headings, body text
- Weights: 200-700
- Fallback: `-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`

**Secondary (Serif):** Libre Baskerville
- Usage: Accents, formal content, special emphasis
- Weights: 400, 700

### Type Scale

| Element | Class | Size | Weight |
|---------|-------|------|--------|
| Display | `text-5xl` | 48px | 700 |
| H1 | `text-4xl` | 36px | 700 |
| H2 | `text-3xl` | 30px | 600 |
| H3 | `text-2xl` | 24px | 600 |
| Body | `text-sm` | 14px | 400 |
| Caption | `text-xs` | 12px | 400 |

---

## Color System

### OKLCH Color Space

Perceptually uniform colors ensuring consistent brightness across hues and better dark mode transformations.

### Theme Values

**Light Mode:**
- Background: `oklch(0.985 0.002 90)` - Warm off-white #FAFAF9
- Foreground: `oklch(0.23 0 0)` - Deep charcoal #1C1C1C

**Dark Mode:**
- Background: `oklch(0.205 0 0)` - Dark charcoal #212121
- Foreground: `oklch(0.93 0 0)` - Soft white #ECECEC

### Semantic Tokens

Always use semantic tokens instead of hard-coded colors:

| Token | Usage |
|-------|-------|
| `background` | Main page background |
| `foreground` | Primary text |
| `card` | Elevated surfaces |
| `primary` | CTAs, main actions |
| `secondary` | Secondary actions |
| `muted` | Backgrounds, disabled states |
| `muted-foreground` | Secondary text |
| `border` | Borders and dividers |
| `destructive` | Errors, delete actions |

**Brand Color:** `#5C6CFF` - Use sparingly for logo and special highlights.

---

## Spacing & Layout

### Border Radius

```css
--radius: 0.625rem; /* Base: 10px */
```

**Usage:**
- Buttons, inputs, badges: `rounded-md` (8px)
- Cards, dialogs: `rounded-xl` (14px)
- Avatars, icon buttons: `rounded-full`

### Shadows

Use sparingly for elevation:
- `shadow-sm` - Buttons, inputs
- `shadow` - Cards
- `shadow-lg` - Dialogs, popovers

### Padding Scale

Follow 4px increments:
- Tight: `p-2` (8px)
- Standard: `p-4` (16px)
- Card content: `p-6` (24px)
- Section: `p-8` (32px)

---

## Component Patterns

### Buttons

**Base classes:**
```tsx
"inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium transition-colors focus-visible:ring-1"
```

**Variants:**
- **Default:** `bg-primary text-primary-foreground shadow hover:bg-primary/90`
- **Secondary:** `bg-secondary hover:bg-secondary/80`
- **Ghost:** `hover:bg-accent hover:text-accent-foreground`
- **Outline:** `border bg-background hover:bg-accent`
- **Destructive:** `bg-destructive text-destructive-foreground`

**Sizes:**
- Small: `h-8 px-3 text-xs`
- Default: `h-9 px-4 py-2`
- Large: `h-10 px-8`
- Icon: `h-9 w-9` (square)

### Cards

```tsx
<div className="rounded-xl border bg-card shadow p-6">
  <h3 className="text-2xl font-semibold mb-2">Title</h3>
  <p className="text-sm text-muted-foreground">Content</p>
</div>
```

Use `rounded-xl` for friendlier feel, consistent `p-6` padding.

### Inputs

```tsx
<input className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:ring-1" />
```

- Height: `h-9` (36px)
- Placeholder: `text-muted-foreground`
- Always pair with `<label>` for accessibility

### Dialogs

- Overlay: `bg-black/80` (high contrast)
- Content: `rounded-lg shadow-lg p-6`
- Max width: `max-w-lg` or smaller

---

## Icons & Animations

### Icons

**Library:** Lucide React

**Sizing:**
- Small (buttons): `h-4 w-4` (16px)
- Default: `h-5 w-5` (20px)
- Large: `h-6 w-6` (24px)

### Transitions

```tsx
// Standard transition
className="transition-colors duration-200"

// Hover effects
className="hover:bg-primary/90"
className="hover:scale-105"

// Focus states (always include)
className="focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
```

---

## Responsive Design

### Breakpoints

| Size | Min Width | Usage |
|------|-----------|-------|
| `sm` | 640px | Small tablets |
| `md` | 768px | Tablets |
| `lg` | 1024px | Laptops |
| `xl` | 1280px | Desktops |

### Mobile-First

```tsx
<div className="text-sm md:text-base lg:text-lg">
  Responsive text
</div>

<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  Responsive grid
</div>
```

---

## Accessibility Rules

✅ **DO:**
- Use semantic color tokens
- Include focus states on all interactive elements
- Provide labels for all form inputs
- Use semantic HTML (`<button>`, `<nav>`, `<main>`)
- Test in both light and dark mode
- Ensure 4.5:1 contrast ratio for text

❌ **DON'T:**
- Hard-code hex colors
- Use pure black (#000) or pure white (#fff)
- Create icon buttons without `aria-label`
- Use `<div>` for clickable elements

---

## Quick Reference

```tsx
// Page Layout
<main className="container mx-auto max-w-7xl px-4">
  <div className="space-y-6">
    {/* Content */}
  </div>
</main>

// Card Grid
<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
  <div className="rounded-xl border bg-card p-6">Card</div>
</div>

// Form Field
<div className="space-y-2">
  <label htmlFor="email" className="text-sm font-medium">Email</label>
  <input id="email" type="email" className="h-9 w-full rounded-md border px-3" />
</div>

// Button with Icon
<button className="inline-flex items-center gap-2 h-9 px-4 rounded-md bg-primary text-primary-foreground">
  <Icon className="h-4 w-4" />
  <span>Button</span>
</button>
```

---

## Implementation

### Tailwind Config

```typescript
export default {
  darkMode: 'selector',
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        serif: ['var(--font-serif)', 'Georgia', 'serif'],
      },
      colors: {
        brand: '#5C6CFF',
        // Map CSS variables for semantic tokens
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
    },
  },
}
```

### CSS Variables

```css
:root {
  --radius: 0.625rem;
  --background: oklch(0.985 0.002 90);
  --foreground: oklch(0.23 0 0);
  --primary: oklch(0.25 0 0);
  --border: oklch(0.91 0.002 90);
  /* ... other tokens */
}

.dark {
  --background: oklch(0.205 0 0);
  --foreground: oklch(0.93 0 0);
  --primary: oklch(0.93 0 0);
  /* ... other tokens */
}
```

---

**Keep this guide updated as your design system evolves.**
