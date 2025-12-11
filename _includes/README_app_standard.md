# Standard App Layout System

## Overview

The simplified standard layout provides a consistent, modern UI for all HydroStruct AI web applications with minimal complexity.

## Features

✅ **Consistent Navigation** - 5-tab system: Home, Guide, Data, Calculate, Results  
✅ **Responsive Design** - Mobile-friendly with hamburger menu  
✅ **Clean Aesthetics** - Professional gradient design  
✅ **Easy Integration** - Simple include + front matter  
✅ **Latest Post Footer** - Auto-displays newest blog post  
✅ **Tab Switching** - Smooth transitions between sections  
✅ **Zero Dependencies** - No WASM/License complexity  

## File Structure

```
_includes/
  └─ app_layout_standard_simple.html  # Layout template

assets/
  ├─ css/
  │   └─ app-standard.css              # Styling
  └─ js/
      └─ app_core_logic.js             # Tab logic
```

## Usage

### 1. Create Your App Page

```markdown
---
layout: none
title: "My App Title"
app_title: "Short Title"
guide_url: "/posts/my-app-guide"
app_js: "/apps/myapp/script.js"
---

{% include app_layout_standard_simple.html %}

<!-- Your app content here -->
<div class="input-form">
  <h4>Input Parameters</h4>
  <!-- Form fields -->
</div>
```

### 2. Create App JavaScript

```javascript
// Define the calculate function
window.calculateApp = function() {
  // Get inputs
  const value1 = document.getElementById('input1').value;
  
  // Perform calculations
  const result = value1 * 2;
  
  // Display results
  const html = `
    <h4>Results</h4>
    <p>Result: ${result}</p>
  `;
  window.displayResults(html);
};
```

### 3. Front Matter Options

| Field | Required | Description |
|-------|----------|-------------|
| `layout` | Yes | Set to `none` |
| `title` | Yes | Full page title |
| `app_title` | No | Short navbar title |
| `guide_url` | No | Link to guide post |
| `app_js` | No | Path to app JS file |

## API Reference

### JavaScript Functions

#### `window.calculateApp()`
**App must define this** - Called when "Tính toán" button is clicked

```javascript
window.calculateApp = function() {
  // Your calculation logic
};
```

#### `window.displayResults(html)`
Display HTML content in results section

```javascript
window.displayResults('<h4>Result</h4><p>42</p>');
```

#### `window.showResults()`
Switch to results tab

```javascript
window.showResults();
```

#### `window.clearResults()`
Clear results and show empty state

```javascript
window.clearResults();
```

## Navigation Tabs

1. **Trang chủ** - Link to homepage
2. **Hướng dẫn** - Link to guide (optional)
3. **Số liệu** - Data input section (active by default)
4. **Tính toán** - Calculate button (green)
5. **Kết quả** - Results display section

## Styling

### Color Scheme
- Primary: `#0073e6` (Blue)
- Success: `#28a745` (Green)
- Background: `#f5f7fa` (Light gray)
- Dark: `#2c3e50`

### Custom Styles
Add app-specific styles in your app directory:

```html
---
app_css: "/apps/myapp/styles.css"
---
```

## Mobile Support

- Responsive breakpoints: 768px, 1024px
- Hamburger menu on mobile
- Touch-friendly tap targets
- Optimized layouts

## Example Apps

See these apps for implementation examples:
- `/apps/hydraulicspillway/` - Complete implementation
- `/apps/shortcol2D/` - Simple calculator
- `/apps/lateralpile/` - Advanced features

## Troubleshooting

### Calculate button does nothing
- Ensure `window.calculateApp()` is defined
- Check browser console for errors

### Tabs not switching
- Verify `app_core_logic.js` is loaded
- Check for JavaScript errors

### Styles not loading
- Confirm `app-standard.css` path is correct
- Check for CSS conflicts

## Migration Guide

### Converting Existing Apps

1. **Backup** current app
2. **Change layout** to `none`
3. **Add include** `{% include app_layout_standard_simple.html %}`
4. **Wrap content** in appropriate structure
5. **Define** `window.calculateApp()`
6. **Test** all functionality

### Example Before/After

**Before:**
```html
<html>
<body>
  <div class="container">
    <h1>My App</h1>
    <form>...</form>
    <div id="results"></div>
  </div>
</body>
</html>
```

**After:**
```markdown
---
layout: none
title: "My App"
---

{% include app_layout_standard_simple.html %}

<form>...</form>

<script>
window.calculateApp = function() {
  // calculation logic
  window.displayResults(html);
};
</script>
```

## Support

For issues or questions:
- Email: ha.nguyen@hydrostructai.com
- GitHub: Create an issue

---

**Version:** 1.0  
**Last Updated:** December 2025  
**Maintained by:** HydroStruct AI Team

