# Design System Documentation

## Overview

This document outlines the design system implemented for the Digital Trust Marketplace frontend. The system follows industry-standard principles for consistency, scalability, and maintainability.

## Design Principles

1. **Consistency**: Reusable components and patterns
2. **Clarity**: Clear visual hierarchy and information architecture
3. **Accessibility**: WCAG 2.1 AA compliant
4. **Scalability**: Easy to extend and maintain
5. **Performance**: Optimized for fast rendering

## Color System

### Primary Colors
- **Primary 600**: Main brand color (`#2563eb`)
- **Primary 50-950**: Full scale for various use cases

### Semantic Colors
- **Success**: Green scale for positive actions/status
- **Warning**: Yellow/Orange scale for cautions
- **Error**: Red scale for errors/destructive actions

### Neutral Grays
- **Gray 50-950**: Complete gray scale for text, backgrounds, borders

### Usage Guidelines
- Use primary colors for CTAs and brand elements
- Use semantic colors consistently (success = good, error = bad)
- Maintain sufficient contrast ratios (4.5:1 for text)

## Typography

### Font Family
- **Primary**: Inter (Google Fonts)
- **Fallback**: System UI stack

### Type Scale
- **H1**: 3rem (48px) - Page titles
- **H2**: 2.25rem (36px) - Section headers
- **H3**: 1.875rem (30px) - Subsection headers
- **H4**: 1.5rem (24px) - Card titles
- **Body**: 1rem (16px) - Default text
- **Small**: 0.875rem (14px) - Secondary text

### Font Weights
- **Bold (700)**: Headings
- **Semibold (600)**: Subheadings
- **Medium (500)**: Labels, buttons
- **Regular (400)**: Body text

## Spacing System

Based on 8px grid system:
- **xs**: 4px (0.25rem)
- **sm**: 8px (0.5rem)
- **md**: 16px (1rem)
- **lg**: 24px (1.5rem)
- **xl**: 32px (2rem)
- **2xl**: 48px (3rem)
- **3xl**: 64px (4rem)

## Components

### Button
- **Variants**: primary, secondary, outline, ghost, danger
- **Sizes**: sm, md, lg
- **States**: default, hover, active, disabled, loading

### Card
- **Variants**: default, elevated, outlined
- **Padding**: none, sm, md, lg
- **Sub-components**: CardHeader, CardTitle, CardDescription, CardContent, CardFooter

### Badge
- **Variants**: default, primary, success, warning, error, outline
- **Sizes**: sm, md

### Input
- **States**: default, focus, error, disabled
- **Features**: label, helper text, error message, icons

### Alert
- **Variants**: info, success, warning, error
- **Features**: title, icon, message

### LoadingSpinner
- **Sizes**: sm, md, lg
- **Features**: optional text

## Layout Patterns

### Container
- Max width: 1280px
- Responsive padding: 16px (mobile) → 24px (tablet) → 32px (desktop)

### Page Container
- Standard page wrapper with consistent padding
- `.page-container` utility class

### Grid System
- Responsive grid utilities
- Auto-fit/auto-fill patterns for dynamic layouts

## Utilities

### Utility Classes
- `.text-muted`: Secondary text color
- `.text-subtle`: Tertiary text color
- `.space-section`: Consistent section spacing
- `.content-max-width`: Constrained content width
- `.content-wide`: Full-width content container

## Responsive Design

### Breakpoints
- **sm**: 640px (mobile)
- **md**: 768px (tablet)
- **lg**: 1024px (desktop)
- **xl**: 1280px (large desktop)

### Mobile-First Approach
- Base styles for mobile
- Progressive enhancement for larger screens

## Accessibility

### Focus States
- Visible focus rings on all interactive elements
- 2px ring with offset for visibility

### ARIA Labels
- Proper labeling for screen readers
- Semantic HTML structure

### Color Contrast
- Minimum 4.5:1 for text
- 3:1 for UI components

## Animation

### Transitions
- **Fast**: 150ms (micro-interactions)
- **Base**: 200ms (standard)
- **Slow**: 300ms (complex animations)

### Keyframe Animations
- `fadeIn`: Fade in effect
- `slideUp`: Slide up from bottom
- `slideDown`: Slide down from top

## Best Practices

1. **Use Design Tokens**: Always use design system values, not arbitrary values
2. **Component Composition**: Build complex UIs from simple components
3. **Consistent Spacing**: Use spacing scale consistently
4. **Semantic HTML**: Use proper HTML elements
5. **Progressive Enhancement**: Ensure core functionality works without JS

## File Structure

```
frontend/
├── components/
│   ├── ui/              # Reusable UI components
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Badge.tsx
│   │   ├── Input.tsx
│   │   ├── Alert.tsx
│   │   └── LoadingSpinner.tsx
│   └── Layout.tsx        # Main layout component
├── app/
│   ├── globals.css      # Global styles and design tokens
│   └── ...
├── lib/
│   └── utils.ts         # Utility functions (cn, formatters)
└── tailwind.config.js   # Tailwind configuration
```

## Usage Examples

### Button
```tsx
<Button variant="primary" size="lg" isLoading={loading}>
  Submit
</Button>
```

### Card
```tsx
<Card variant="elevated">
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Description</CardDescription>
  </CardHeader>
  <CardContent>
    Content here
  </CardContent>
</Card>
```

### Input
```tsx
<Input
  label="Email"
  type="email"
  error={errors.email}
  helperText="Enter your email address"
/>
```

## Future Enhancements

- [ ] Dark mode support
- [ ] More component variants
- [ ] Animation library integration
- [ ] Storybook documentation
- [ ] Design tokens export





