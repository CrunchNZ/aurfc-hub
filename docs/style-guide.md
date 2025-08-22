# AURFC Hub Style Guide & Design System

## Overview
This style guide implements a modern, rugby-themed design system for AURFC Hub, drawing from the official Auckland University Rugby Football Club heritage colors established in 1906. The design emphasizes accessibility, responsiveness, and modern 2025 UI/UX trends while maintaining the club's traditional identity.

## 🎨 Color Palette

### Primary Colors (Heraldic Blue)
- **--primary**: #003366 (Heraldic Blue) - Main brand color for headers, navigation, buttons
  - RGB: 0, 51, 102
  - HSL: 210°, 100%, 20%
- **--primary-light**: #007FFF (Azure Bright) - Lighter variant for hovers and accents
  - RGB: 0, 127, 255
  - HSL: 210°, 100%, 50%
- **--primary-dark**: #001F3F (Deep Blue) - Darker for shadows and backgrounds
  - RGB: 0, 31, 63
  - HSL: 210°, 100%, 12%

### Secondary Colors (Silver)
- **--secondary**: #C0C0C0 (Silver) - For borders, icons, secondary text
  - RGB: 192, 192, 192
  - HSL: 0°, 0%, 75%
- **--secondary-light**: #E5E5E5 (Light Gray) - For backgrounds and subtle elements
  - RGB: 229, 229, 229
  - HSL: 0°, 0%, 90%
- **--secondary-dark**: #A9A9A9 (Dark Gray) - For emphasis and contrast
  - RGB: 169, 169, 169
  - HSL: 0°, 0%, 66%

### Neutral Colors
- **--background**: #FFFFFF (White) - Main content area backgrounds
  - RGB: 255, 255, 255
- **--text-primary**: #000000 (Black) - Primary body text
  - RGB: 0, 0, 0
- **--text-secondary**: #333333 (Dark Gray) - Subtitles and secondary text
  - RGB: 51, 51, 51

### Accent Colors (Rugby-Specific)
- **--accent-green**: #228B22 (Forest Green) - Success messages, attendance checks
  - RGB: 34, 139, 34
  - HSL: 120°, 61%, 34%
- **--accent-red**: #DC143C (Crimson) - Warnings, errors, injury alerts
  - RGB: 220, 20, 60
  - HSL: 348°, 83%, 47%
- **--accent-gold**: #FFD700 (Gold) - Highlights, badges, hall of fame
  - RGB: 255, 215, 0
  - HSL: 51°, 100%, 50%

### Dark Mode Variants
- **--background-dark**: #121212 (Dark Background)
- **--text-primary-dark**: #FFFFFF (White Text)
- **--primary-dark-mode**: #66A3FF (Lightened Blue)

## 🎯 Design Principles

### 1. Minimalism with Immersion
- Clean, whitespace-heavy layouts with subtle rugby-themed elements
- Use cards for features like rosters, events, and store items
- Avoid clutter while maintaining visual interest

### 2. AI-Driven Personalization
- Dashboards adapt to user roles (juniors see gamified views, coaches get analytics)
- Use Firebase ML for suggestions and recommendations
- Personalized content based on user behavior and preferences

### 3. Micro-Interactions and Animations
- Subtle button hovers with scale effects
- Scroll-triggered reveals for news feeds
- Cursor animations (rugby ball icon on hover)
- Smooth transitions between states

### 4. Dark Mode and Adaptive Themes
- Auto-detect user preference (`prefers-color-scheme`)
- Manual toggle for user control
- Inverted colors for low-light environments

### 5. Accessibility and Usability
- High contrast ratios (WCAG 2.2 AA compliance)
- Screen reader support with ARIA labels
- Keyboard navigation support
- Multilingual support for Auckland diversity

## 🏗️ Layout and Structure

### Global Layout
- **Sidebar Navigation**: Collapsible on mobile, with rugby-themed icons
- **Top Bar**: Notifications, search, and user profile
- **Footer**: Club logo, links, and social media
- **Main Content**: Role-based dashboards with grid layouts

### Role-Based Dashboards
- **Admin**: Grid of action cards with neumorphic shadows
- **Coach**: Tabbed views (Rosters, Performance, Drills) with charts
- **Player/Parent**: Personalized feed with AI-sorted content
- **Junior Portal**: Colorful, immersive layout with AR-enabled elements

### Responsive Design
- **Mobile**: Bottom navigation bar, single-column layouts
- **Tablet**: Two-column grids, expanded navigation
- **Desktop**: Multi-column grids, full sidebar navigation

## 🎨 Component Design Guidelines

### Buttons and Forms
- **Primary Buttons**: Heraldic Blue background with white text
- **Secondary Buttons**: Silver borders with primary text
- **Hover States**: Light blue background with subtle animations
- **Form Validation**: Red accents for errors, green for success

### Cards and Lists
- **Rounded Corners**: 8px border radius for modern feel
- **Subtle Gradients**: Blue to dark blue for depth
- **Hover Effects**: Lift with shadow and scale
- **Shadows**: Soft, neumorphic-style shadows

### Icons and Visuals
- **Custom SVG Icons**: Rugby boot for attendance, ball for navigation
- **Accent Colors**: Green for success, red for alerts, gold for highlights
- **Icon Sizes**: Consistent sizing (16px, 24px, 32px)

### Modals and Popups
- **Centered Positioning**: Always center on screen
- **Blurred Backgrounds**: Subtle backdrop blur effect
- **Close Gestures**: Swipe down on mobile, click outside on desktop
- **Smooth Animations**: Fade in/out with scale effects

## 📱 Typography and Spacing

### Font Hierarchy
- **H1**: 32px, bold, primary color
- **H2**: 24px, bold, primary color
- **H3**: 20px, semi-bold, text-primary
- **Body**: 16px, regular, text-primary
- **Caption**: 14px, regular, text-secondary

### Spacing System
- **Base Unit**: 4px
- **Small**: 8px (m-2, p-2)
- **Medium**: 16px (m-4, p-4)
- **Large**: 24px (m-6, p-6)
- **Extra Large**: 32px (m-8, p-8)

### Line Heights
- **Headers**: 1.2 for tight, professional look
- **Body Text**: 1.5 for readability
- **Lists**: 1.6 for easy scanning

## 🚀 Implementation Guidelines

### CSS Variables Setup
```css
:root {
  /* Primary Colors */
  --primary: #003366;
  --primary-light: #007FFF;
  --primary-dark: #001F3F;
  
  /* Secondary Colors */
  --secondary: #C0C0C0;
  --secondary-light: #E5E5E5;
  --secondary-dark: #A9A9A9;
  
  /* Neutral Colors */
  --background: #FFFFFF;
  --text-primary: #000000;
  --text-secondary: #333333;
  
  /* Accent Colors */
  --accent-green: #228B22;
  --accent-red: #DC143C;
  --accent-gold: #FFD700;
}

/* Dark Mode */
@media (prefers-color-scheme: dark) {
  :root {
    --background: #121212;
    --text-primary: #FFFFFF;
    --primary: #66A3FF;
    --secondary: #404040;
  }
}
```

### Tailwind CSS Integration
```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#003366',
          light: '#007FFF',
          dark: '#001F3F',
        },
        secondary: {
          DEFAULT: '#C0C0C0',
          light: '#E5E5E5',
          dark: '#A9A9A9',
        },
        accent: {
          green: '#228B22',
          red: '#DC143C',
          gold: '#FFD700',
        },
      },
      fontFamily: {
        sans: ['Inter', 'Roboto', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
      },
    },
  },
  plugins: [],
}
```

### Usage Examples
```jsx
// Primary button with hover effects
<button className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary-light transition-colors duration-200 shadow-lg hover:shadow-xl transform hover:scale-105">
  Join Team
</button>

// Card component with subtle styling
<div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 p-6 border border-secondary-light">
  <h3 className="text-xl font-semibold text-primary mb-4">Team Roster</h3>
  <p className="text-text-secondary">Manage your team members and positions</p>
</div>

// Success message with accent color
<div className="bg-accent-green text-white px-4 py-2 rounded-md">
  Attendance recorded successfully!
</div>
```

## 🧪 Testing and Quality Assurance

### Color Contrast Testing
- **Primary Text**: White on blue (8.6:1 ratio) - Excellent
- **Secondary Text**: Black on white (21:1 ratio) - Excellent
- **Accent Colors**: Ensure minimum 4.5:1 ratio for accessibility

### Responsive Testing
- **Mobile**: 320px - 768px
- **Tablet**: 768px - 1024px
- **Desktop**: 1024px+

### Performance Testing
- **Lighthouse Score**: Target 90+ for all categories
- **Animation Performance**: 60fps for smooth interactions
- **Load Time**: Under 3 seconds on 3G connection

## 📋 Implementation Checklist

### Phase 1: Foundation
- [ ] Set up CSS variables in global CSS
- [ ] Configure Tailwind CSS with custom theme
- [ ] Install Framer Motion for animations
- [ ] Create base component styles

### Phase 2: Core Components
- [ ] Update navigation and layout components
- [ ] Style all form elements and buttons
- [ ] Implement card and list components
- [ ] Add modal and popup styling

### Phase 3: Advanced Features
- [ ] Implement dark mode toggle
- [ ] Add micro-interactions and animations
- [ ] Create AR/VR placeholder elements
- [ ] Add gesture navigation support

### Phase 4: Testing and Optimization
- [ ] Test color contrast ratios
- [ ] Verify responsive design
- [ ] Performance testing with Lighthouse
- [ ] Cross-browser compatibility testing

## 🎯 Next Steps
1. **Install Dependencies**: Tailwind CSS, Framer Motion
2. **Set Up Configuration**: CSS variables, Tailwind config
3. **Begin Implementation**: Start with global styles and navigation
4. **Iterate and Test**: Continuous testing and refinement

This style guide provides a comprehensive foundation for building a modern, accessible, and visually appealing AURFC Hub application that honors the club's heritage while embracing contemporary design trends.
