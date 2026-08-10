---
version: alpha-v2
name: Wheat & Honey Premium Design System
description: An updated, premium, warm, and responsive design system for Keithston Coffee Shop.
colors:
  primary: "#5C3A21"
  primary-light: "#7B5034"
  primary-dark: "#3B2414"
  secondary: "#D4A373"
  secondary-light: "#E9D8A6"
  secondary-dark: "#7A4F2D"
  tertiary: "#C5929D"
  neutral-bg: "#FEFCEB"
  neutral-surface: "#FFFFFF"
  neutral-text: "#2C221E"
  neutral-text-muted: "#8C7A73"
  neutral-text-dark: "#111111"
  neutral-text-muted-gray: "#5D5D5D"
  accent: "#D98A3F"
  accent-terracotta: "#8E3D24"
  border: "#EADDC9"
typography:
  h1:
    fontFamily: Sansita Swashed
    fontSize: 48px
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: -0.01em
  h2:
    fontFamily: Sansita Swashed
    fontSize: 36px
    fontWeight: 600
    lineHeight: 1.25
    letterSpacing: 0em
  h3:
    fontFamily: Sansita Swashed
    fontSize: 28px
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: 0.01em
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: 0em
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: 0em
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.4
    letterSpacing: 0.01em
  label-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: 0.02em
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: 0.03em
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: 0.05em
  navigation-links:
    fontFamily: Poppins
    fontSize: 15px
    fontWeight: 500
    letterSpacing: 0.02em
rounded:
  xs: 4px
  sm: 8px
  md: 12px
  lg: 24px
  full: 9999px
spacing:
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  xxl: 48px
  xxxl: 64px
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.neutral-bg}"
    rounded: "{rounded.sm}"
    padding: "12px 24px"
  button-terracotta:
    backgroundColor: "{colors.accent-terracotta}"
    textColor: "{colors.neutral-surface}"
    rounded: "{rounded.sm}"
    padding: "14px 36px"
  button-secondary:
    backgroundColor: "{colors.secondary}"
    textColor: "{colors.primary-dark}"
    rounded: "{rounded.sm}"
    padding: "12px 24px"
  button-accent:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.primary-dark}"
    rounded: "{rounded.sm}"
    padding: "12px 24px"
  card:
    backgroundColor: "{colors.neutral-surface}"
    rounded: "{rounded.md}"
    padding: "24px"
  product-card:
    backgroundImage: "url('images/product-bg.png')"
    rounded: "{rounded.md}"
    padding: "24px"
    detailsPadding: "28px"
  hero-banner:
    backgroundColor: "{colors.primary-dark}"
    textColor: "{colors.neutral-bg}"
    rounded: "{rounded.lg}"
    padding: "64px 32px"
  navigation-link:
    textColor: "{colors.primary-light}"
    padding: "8px 16px"
  announcement-bar:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.neutral-bg}"
    padding: "8px"
  badge-new:
    backgroundColor: "{colors.tertiary}"
    textColor: "{colors.primary-dark}"
    rounded: "{rounded.xs}"
    padding: "4px 8px"
  tag-category:
    backgroundColor: "{colors.secondary-light}"
    textColor: "{colors.secondary-dark}"
    rounded: "{rounded.full}"
    padding: "6px 12px"
  body-copy:
    textColor: "{colors.neutral-text}"
  caption:
    textColor: "{colors.neutral-text-muted}"
  divider:
    backgroundColor: "{colors.border}"
    height: "1px"
  mobile-menu-drawer:
    backgroundColor: "#161616"
    width: "290px"
    fontFamily: "{typography.navigation-links.fontFamily}"
  scrollable-tabs:
    activeColor: "{colors.primary}"
    activeUnderline: "{colors.accent-terracotta}"
    inactiveColor: "{colors.neutral-text-muted-gray}"
    fontFamily: "{typography.navigation-links.fontFamily}"
---

# Keithston Coffee Shop Premium Design System

Welcome to the **Keithston Coffee Shop** Design System (formerly Wheat & Honey). This document serves as the single source of truth for the visual identity, token configurations, and interactive component rules of our premium, community-driven bakery and café website.

---

## Overview

### Brand Identity & Design Philosophy
**Keithston Coffee Shop** bridges the gap between classic artisanal baking, modern community connection, and premium café culture. The design is inspired by the sensory experience of a warm bakery-café: the dust of flour in the air, the dark grains of coffee beans, the roasted amber glow of honey, and the earthy richness of raw sourdough.

The UI evokes:
*   **Warmth & Hospitality:** Deep, appetizing colors, dark textured slates, and cozy wood surfaces that make users feel welcome.
*   **Artisanal Craftsmanship:** Elegant typography (cursive swashed serif headings) paired with clean geometric labels (sans-serif body) that conveys premium quality and careful preparation.
*   **Active Community:** Modern, tactile elements with smooth, engaging hover effects that invite users to explore menus, join workshops, and share stories.
*   **Responsive Excellence:** A seamless mobile layout with dedicated swipe-able category streams and slide-in drawer menus.

---

## Colors

Our color palette is deeply rooted in natural, bakery-inspired elements, designed to be both visually rich and highly accessible.

### Core Palette
*   **Primary (`#5C3A21`):** *Cacao / Dark Chocolate* – Used for primary branding elements, prominent highlights, and active tab states. Represents quality and deep, rich flavor.
*   **Secondary (`#D4A373`):** *Golden Crust* – A warm, roasted honey tone used for highlight components, active navbar states, and callout headings.
*   **Tertiary (`#C5929D`):** *Berry Plum* – Inspired by sweet fruit fillings and berry glazes, utilized for delicate accents and micro-details.
*   **Neutral Background (`#FEFCEB`):** *Flour Dust / Cream White* – A soft, warm off-white that acts as the main canvas of the website, reducing eye strain and evoking a cozy café table.
*   **Neutral Text (`#2C221E`):** *Dark Rye* – A rich dark brown used for primary body copy instead of pure black, maintaining a warm and soft contrast.
*   **Neutral Text Dark (`#111111`):** *Charcoal Black* – A deep charcoal black used strictly for major section headings on light backgrounds to ensure crisp readability.
*   **Neutral Text Muted Gray (`#5D5D5D`):** *Cool Gray* – A clean medium-dark gray used for inactive navigation items to maintain an editorial visual hierarchy.
*   **Accent (`#D98A3F`):** *Toasted Honey* – A high-contrast, caramelized golden orange used for secondary accents.
*   **Accent Terracotta (`#8E3D24`):** *Toasted Terracotta / Rust Brown* – A rich warm terracotta used for primary Call-to-Actions (CTAs), solid buttons, and active interactive borders.

---

## Typography

Typography at Keithston Coffee Shop is a harmonious dialogue between the heritage of swashed script serif and the crispness of geometric sans-serif.

### Typefaces
*   **Sansita Swashed (Cursive Serif):** Applied to major headings (`h1`, `h2`, `h3`). Its gorgeous, contrasting swashed strokes evoke high-end craftsmanship, literary grace, and artisanal charm.
*   **Poppins (Sans-Serif):** Applied to top navigation links, category selectors, and footer texts. A clean, geometric sans-serif that ensures absolute readability.
*   **Inter (Sans-Serif):** Applied to standard body copy (`body-*`), card labels, and product titles. A highly legible, structured typeface built for editorial details.

### Usage Hierarchy
1.  **H1 (Sansita Swashed, 48px-72px, Bold):** Reserved for hero titles and major section introductions.
2.  **H2 (Sansita Swashed, 36px-48px, Bold):** Used for standard page section headings (colored `#111111` on light backgrounds).
3.  **H3 (Sansita Swashed, 28px, Semi-Bold):** Used for cards and secondary content headings.
4.  **Body Large / Description (Inter, 17px-18px):** For lead-in paragraphs, discount highlights, and editorial copy.
5.  **Body Medium / Product Labels (Inter, 15px-16px):** The standard body text for menu descriptions and product titles.
6.  **Navigation Links (Poppins, 15px, Medium):** Used for buttons, menu tabs, and system links.

---

## Layout & Spacing

Our layout system focuses on breathing room, allowing food photography and text descriptions to stand out without competing for attention.

### Spacing Scale
We utilize an 8pt grid system to ensure mathematical consistency across padding, margins, and component alignments:
*   **`xs` (4px):** Micro-spacers (labels to icons).
*   **`sm` (8px):** Small gaps (inputs to labels, tag gaps).
*   **`md` (16px):** Standard spacing (grid gaps, button internal padding, list item gaps).
*   **`lg` (24px):** Large padding (card interior padding, content section gaps).
*   **`xl` (32px):** Sub-section spacing (hero text to button).
*   **`xxl` (48px):** Section padding (top/bottom spacing for page sections).
*   **`xxxl` (64px):** Hero section spacing and massive layouts.

---

## Elevation & Depth

To maintain a soft, tactile, and paper-like quality, we avoid harsh, high-contrast drop shadows. Elevation is expressed through warm, diffused ambient shadows and thin borders.

*   **Flat / Floor:** Default page state. Uses no shadow. Border: `1px solid {colors.border}`.
*   **Elevation Low (`shadow-sm`):** Used for secondary cards and hover states of interactive items.
    *   *Value:* `0 2px 8px rgba(92, 58, 33, 0.04)`
*   **Elevation Medium (`shadow-md`):** The standard card elevation, lifting menus and workshops off the background.
    *   *Value:* `0 8px 24px rgba(92, 58, 33, 0.07)`
*   **Elevation High (`shadow-lg`):** Reserved for active popovers, dropdown navigation, and modal dialogues.
    *   *Value:* `0 16px 40px rgba(92, 58, 33, 0.12)`

---

## Shapes

Shapes in Keithston Coffee Shop are soft and approachable. Organic rounded corners mimic the smooth, hand-formed nature of dough, pastries, and baking pans.

*   **`rounded-xs` (4px):** Micro-corners for small pills, tags, and small badges.
*   **`rounded-sm` (8px):** Standard corners for input fields, primary buttons, and compact alerts.
*   **`rounded-md` (12px):** Medium corners for product cards, gallery images, and featured treats blocks.
*   **`rounded-lg` (24px):** Large corners for major page elements, newsletter subscription cards, and hero image frames.
*   **`rounded-full` (9999px):** Pill shapes for category filters, search bars, and avatar wrappers.

---

## Components

### 1. Primary CTA Button (`button-terracotta`)
The primary CTA button, designed to draw user action.
*   **Styling:**
    *   Background: `{colors.accent-terracotta}` (`#8E3D24`)
    *   Text Color: `{colors.neutral-surface}` (`#FFFFFF`)
    *   Rounded (Bo góc): `{rounded.sm}` (8px)
    *   Padding: `14px 36px`
    *   Font Family: `Poppins`
*   **Interaction State:**
    *   *Hover:* Background transitions to `#76301A` with a translation of `-2px` upwards and custom shadow elevation.
    *   *Active:* Translates back to `0px` with shadow resetting.

2. **Add Button (`button-add`)**
*   **Styling:**
    *   Background: `{colors.accent-terracotta}` (`#8E3D24`)
    *   Text Color: `{colors.neutral-surface}`
    *   Rounded: `6px`
    *   Padding: `8px 20px`
    *   Font Family: `Poppins`
*   **Interaction State:**
    *   *Hover:* Background transitions to `#76301A` with a slight upward lift.

### 3. Product Card (`product-card`)
The fundamental container to showcase pastries and breads on a premium textured dark slate.
*   **Styling:**
    *   Background Image: `url('images/product-bg.png')`
    *   Rounded (Bo góc): `{rounded-md}` (12px)
    *   Padding: `24px`
    *   Details Row Padding: `28px` (`px-7`) for an elegant inward alignment.
    *   Title Typo: `Inter` font, 15px medium, white color, line height 1.25.
    *   Price Typo: `Inter` font, 20px bold, white color.
    *   Info Icon: Placed on the right of the price, mapped to `images/info-icon.png`.
*   **Interaction State:**
    *   *Hover:* Adds `shadow-xl` transition, raising the card by `translate-y-1` and slightly scaling the product image by `scale-105`.

### 4. Responsive Mobile Drawer (`mobile-menu-drawer`)
A sleek sliding sidebar drawer providing full-screen mobile navigation.
*   **Styling:**
    *   Width: `290px`
    *   Background Color: `#161616` (Deep Charcoal Slate)
    *   Borders: Solid thin line `1px solid {colors.secondary}/10` on the right side.
    *   Navigation List: Vertical arrangement, `Poppins` font, 18px medium, text `white/90`.
    *   Z-Index: `50` with a backdrop overlay of `bg-black/60`.
*   **Interaction State:**
    *   *Animation:* Slides in smoothly from the left (`-translate-x-full` to `translate-x-0`) using CSS transforms with a 300ms cubic bezier transition. Locks body scroll when active.

### 5. Scrollable Category Navigation (`scrollable-tabs`)
A swipe-able category ribbon designed for mobile touch screens.
*   **Styling:**
    *   Layout: `flex items-center overflow-x-auto whitespace-nowrap scrollbar-none max-w-5xl mx-auto px-4 md:px-0`
    *   Active State: `border-b-[3px] border-[#8E3D24] text-[#5C3A21] font-semibold`
    *   Inactive State: `text-[#5D5D5D] hover:text-[#5C3A21] font-medium`
    *   Line Overlapping: Tabs have `-mb-[1px] relative z-10` to overlap precisely on top of the parent `border-b border-[#EADDC9]` horizontal line.
    *   Mobile Scrollbar: Fully hidden using `.scrollbar-none` CSS rules.

---

## Do's and Don'ts

### Do's
*   **DO** use soft warm backgrounds (`{colors.neutral-bg}`) for all main content sections to keep the design comfortable, cozy, and organic.
*   **DO** use deep Cacao (`{colors.primary}`) or Toasted Terracotta (`{colors.accent-terracotta}`) for focus actions and active highlights.
*   **DO** pair Sansita Swashed headings with Poppins for navigation and Inter for product/body copy to maintain a high-end, structured editorial layout.
*   **DO** implement horizontal swipe menus on mobile viewports to prevent wrapping lists and keep active lines perfectly straight.
*   **DO** use deep charcoal black (`#111111`) for major headings on light backgrounds to ensure absolute legibility.

### Don'ts
*   **DON'T** use pure black (`#000000`) for body text. Always use Dark Rye (`{colors.neutral-text}`) to prevent the layout from feeling cold or clinical.
*   **DON'T** apply sharp corners (`0px` border-radius) except in full-width browser-edge backgrounds.
*   **DON'T** mix different serif fonts in the headings. Stick strictly to Sansita Swashed.
*   **DON'T** allow category navigation tabs to wrap onto two lines on mobile. Always enable horizontal swiping.
*   **DON'T** use heavy overlay masks that wash out food photography background textures. Keep dark textures rich and colorful.
