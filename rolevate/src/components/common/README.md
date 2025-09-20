# Button Component

A comprehensive, reusable Button component with multiple variants, sizes, and features.

## Features

- 🎨 Multiple variants (default, destructive, outline, secondary, ghost, link, gradient, success, warning, icon variants)
- 📏 Multiple sizes (sm, default, lg, xl, icon sizes)
- 🎯 Loading states with spinner
- 🎪 Left and right icons support
- ♿ Full accessibility support
- 🌙 Dark mode compatible
- 🎭 Consistent styling across the app

## Basic Usage

```tsx
import { Button } from '@/components/common';

// Default button
<Button>Click me</Button>

// With variant and size
<Button variant="outline" size="lg">Outline Button</Button>

// With icons
<Button leftIcon={<Search />} rightIcon={<ArrowRight />}>
  Search
</Button>

// Loading state
<Button loading>Loading...</Button>

// Disabled state
<Button disabled>Disabled</Button>
```

## Variants

| Variant | Description | Use Case |
|---------|-------------|----------|
| `default` | Primary button with solid background | Main actions, CTAs |
| `destructive` | Red button for dangerous actions | Delete, cancel, destructive actions |
| `outline` | Bordered button with transparent background | Secondary actions |
| `secondary` | Muted button for less important actions | Alternative actions |
| `ghost` | Minimal button with hover effects | Subtle actions, navigation |
| `link` | Text-only button that looks like a link | Inline actions, navigation |
| `gradient` | Gradient button with enhanced styling | Special/featured actions |
| `success` | Green button for positive actions | Confirm, save, success states |
| `warning` | Yellow/amber button for caution | Warning actions |
| `icon` | Circular icon button | Icon-only actions |
| `icon-secondary` | Secondary styled icon button | Alternative icon actions |

## Sizes

| Size | Height | Padding | Use Case |
|------|--------|---------|----------|
| `sm` | 36px (h-9) | Small padding | Compact spaces |
| `default` | 40px (h-10) | Standard padding | Most buttons |
| `lg` | 44px (h-11) | Large padding | Important actions |
| `xl` | 48px (h-12) | Extra large padding | Hero sections, CTAs |
| `icon` | 40px (w-10 h-10) | Icon-sized | Icon buttons |
| `icon-sm` | 32px (w-8 h-8) | Small icons | Compact icon buttons |
| `icon-lg` | 48px (w-12 h-12) | Large icons | Prominent icon buttons |

## Props

```tsx
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link' | 'gradient' | 'success' | 'warning' | 'icon' | 'icon-secondary';
  size?: 'default' | 'sm' | 'lg' | 'xl' | 'icon' | 'icon-sm' | 'icon-lg';
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  asChild?: boolean;
}
```

## Examples

### Primary Actions
```tsx
<Button variant="default" size="lg">
  Get Started
</Button>

<Button variant="gradient" size="lg" rightIcon={<ArrowRight />}>
  Apply Now
</Button>
```

### Secondary Actions
```tsx
<Button variant="outline">
  Learn More
</Button>

<Button variant="ghost">
  Cancel
</Button>
```

### Icon Buttons
```tsx
<Button variant="icon" size="icon" aria-label="Save">
  <Heart />
</Button>

<Button variant="icon-secondary" size="icon" aria-label="Delete">
  <Trash />
</Button>
```

### Form Buttons
```tsx
<Button type="submit" loading={isSubmitting}>
  {isSubmitting ? 'Creating...' : 'Create Account'}
</Button>

<Button variant="outline" onClick={onCancel}>
  Cancel
</Button>
```

### With Icons
```tsx
<Button leftIcon={<Search />}>
  Search Jobs
</Button>

<Button rightIcon={<ExternalLink />}>
  View Details
</Button>
```

## Accessibility

- All buttons include proper focus states
- Loading buttons are automatically disabled
- Icon buttons require `aria-label` for screen readers
- Keyboard navigation support
- High contrast ratios for visibility

## Styling

The button uses CSS custom properties for theming:
- `--primary`, `--primary-foreground`
- `--secondary`, `--secondary-foreground`
- `--muted`, `--muted-foreground`
- `--destructive`, `--destructive-foreground`
- `--background`, `--foreground`
- `--border`, `--ring`

This ensures consistent theming across light and dark modes.