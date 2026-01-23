# Project: Website & App Features Checklist

## Overview
An interactive single-page web application for tracking and managing website/app features across 9 categories with 170 subcategories. Built for the net1io.com development team as a project planning tool.

## Architecture
- **Single-page app** with JavaScript-based page navigation (10 pages: 9 categories + 1 summary)
- Root files (`index.html`, `styles.css`, `app.js`) are the primary source
- `frontend/` folder is a branded deployment copy with minor differences (logo in nav)
- `reference/` folder contains documentation

## Key Files
- `index.html` - Main HTML with all 170 feature cards across 9 category pages + summary page
- `styles.css` - All styling including feature sample visualizations
- `app.js` - FeatureChecklistApp class handling state, navigation, persistence, and export
- `styles.scss` / `app.ts` - Source files (SCSS and TypeScript)

## Feature Card Structure
Each checklist item follows this pattern:
```html
<div class="feature-card">
    <label class="checklist-item">
        <input type="checkbox" data-category="Category Name" data-feature="Feature Name">
        <span class="checkbox-custom"></span>
        <span class="feature-name">Feature Name</span>
    </label>
    <div class="feature-sample">
        <!-- Visual sample mockup -->
    </div>
</div>
```

## Categories (9 pages)
1. **User Experience** (26 features) - UX patterns, accessibility, scroll behaviors
2. **UI Components** (29 features) - Visual/interactive elements, layout patterns
3. **Content & Media** (28 features) - Content types, media, typography elements
4. **Functional Features** (27 features) - Backend-connected features, data visualization
5. **Performance & Technical** (19 features) - Optimization, developer tools
6. **Security Features** (8 features) - Auth, encryption, protection
7. **Admin/CMS Features** (8 features) - Content management, workflows
8. **E-commerce Specific** (14 features) - Shopping, conversion elements
9. **Communication** (11 features) - Social, messaging, community

## State Management
- `sessionStorage` for selected features and project notes
- `localStorage` for persistent visitor count
- IP geolocation via ipapi.co API

## Build Tools
- Vite 5.0.0 for dev server and bundling
- Sass for SCSS compilation
- TypeScript for type-safe source

## Conventions
- Feature samples use CSS-only visualizations (no external images)
- CSS class naming: `sample-{feature-name}` for sample containers
- Data attributes: `data-category` and `data-feature` on checkboxes
- Keep feature cards alphabetically ordered within each page
- All new features need both HTML (feature card) and CSS (sample styling)
