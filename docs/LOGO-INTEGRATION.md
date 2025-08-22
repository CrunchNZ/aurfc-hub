# 🎨 AURFC Logo Integration

## Overview
The AURFC Hub now features a custom logo based on the traditional shield design with kiwi birds and academic elements. The logo has been integrated throughout the application for a consistent brand experience.

## 🖼️ Logo Assets Created

### 1. **SVG Logo Files**
- `public/images/aurfc-logo.svg` - Full logo (200x240)
- `public/images/favicon.svg` - Simplified favicon (32x32)

### 2. **React Component**
- `src/components/Logo.jsx` - Reusable logo component with multiple variants

### 3. **Logo Variants**
- **`full`** - Logo + text (default)
- **`icon`** - Just the shield logo
- **`text`** - Just the text
- **`simple`** - Minimal AURFC text

## 🔧 Usage Examples

### Basic Usage
```jsx
import Logo from './components/Logo';

// Full logo with text
<Logo variant="full" />

// Just the icon
<Logo variant="icon" size="lg" />

// Simple text
<Logo variant="simple" />
```

### Size Options
```jsx
<Logo size="xs" />    // 24x24px
<Logo size="sm" />    // 32x32px
<Logo size="md" />    // 48x48px
<Logo size="lg" />    // 64x64px
<Logo size="xl" />    // 80x80px
<Logo size="2xl" />   // 96x96px
```

## 📍 Integration Points

### 1. **Navigation Header**
- Replaced rugby ball emoji with custom logo
- Used `variant="icon"` for compact display

### 2. **Login/SignUp Pages**
- Replaced rugby ball emoji with custom logo
- Used `variant="icon"` with `size="lg"`

### 3. **Favicon**
- Updated HTML to use custom SVG favicon
- Added proper meta tags and theme colors

### 4. **PWA Manifest**
- Updated to include logo assets
- Added proper icon definitions

## 🚀 Using Your Actual Logo

### Option 1: Replace SVG Files
1. Replace `public/images/aurfc-logo.svg` with your actual logo
2. Ensure it maintains the same viewBox (200x240)
3. Rebuild and deploy

### Option 2: Upload to Firebase Storage
1. Place your logo file in an `assets/` folder
2. Run the upload script:
   ```bash
   node scripts/upload-logo.js
   ```
3. Update the Logo component to use the Firebase URL

### Option 3: Update Logo Component
1. Modify the SVG paths in `Logo.jsx`
2. Adjust colors, shapes, and text as needed
3. Rebuild and deploy

## 🎨 Logo Design Elements

The current logo includes:
- **Shield Background** - Traditional rugby club aesthetic
- **AURFC Text** - Bold serif font in primary blue
- **Kiwi Birds** - Three stylized kiwi silhouettes
- **Landscape Line** - Wavy line representing New Zealand
- **Academic Elements** - Stars and open book for university connection
- **Color Scheme** - Primary blue (#003366) with white panels

## 🔄 Updating Colors

To change logo colors, update the CSS variables in your theme:
```css
:root {
  --color-primary: #003366;        /* Main blue */
  --color-primary-light: #004080;  /* Gradient blue */
  --color-accent-gold: #FFD700;   /* Accent gold */
}
```

## 📱 Responsive Behavior

- **Mobile**: Logo scales down appropriately
- **Tablet**: Logo maintains proportions
- **Desktop**: Logo displays at full size
- **PWA**: Logo works in app mode

## 🚨 Troubleshooting

### Logo Not Displaying
1. Check browser console for errors
2. Verify SVG file paths
3. Ensure Logo component is imported correctly

### Size Issues
1. Check size prop values
2. Verify CSS classes are applied
3. Test with different viewport sizes

### Performance Issues
1. SVG files are lightweight and optimized
2. Consider using PNG for very complex logos
3. Monitor bundle size impact

## 🔮 Future Enhancements

- [ ] Add logo animation effects
- [ ] Create logo variants for different contexts
- [ ] Add logo color themes
- [ ] Implement logo loading states
- [ ] Add logo accessibility features

## 📞 Support

For logo-related issues or customization requests, refer to:
- Logo component code: `src/components/Logo.jsx`
- SVG assets: `public/images/`
- Upload script: `scripts/upload-logo.js`
- This documentation: `docs/LOGO-INTEGRATION.md`
